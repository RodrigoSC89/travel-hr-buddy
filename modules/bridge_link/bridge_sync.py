"""
BridgeLink Sync - Offline/Online Synchronization System
========================================================

Provides persistent message queue with automatic retry and background synchronization
for handling offline/online transitions.

Features:
- Persistent message queue using SQLite
- 4-level message prioritization (LOW, MEDIUM, HIGH, CRITICAL)
- Automatic retry with exponential backoff (max 5 attempts)
- Background sync thread for automatic transmission
- Statistics and cleanup utilities

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

import sqlite3
import json
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum


class MessagePriority(Enum):
    """Message priority levels"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class MessageStatus(Enum):
    """Message processing status"""
    PENDING = "pending"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"


class BridgeSync:
    """
    Offline/online synchronization system with persistent queue.
    
    Manages a SQLite-backed message queue that persists messages during
    offline periods and automatically synchronizes when connection is restored.
    """
    
    def __init__(self, bridge_core, db_path: str = "bridge_sync.db"):
        """
        Initialize BridgeSync.
        
        Args:
            bridge_core: BridgeCore instance for transmission
            db_path: Path to SQLite database file
        """
        self.bridge_core = bridge_core
        self.db_path = db_path
        self.running = False
        self.sync_thread = None
        
        # Configure logging
        self.logger = logging.getLogger('BridgeSync')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        # Initialize database
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_type TEXT NOT NULL,
                priority INTEGER NOT NULL,
                payload TEXT NOT NULL,
                status TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                sent_at TEXT,
                error TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_status_priority 
            ON messages(status, priority DESC, created_at)
        ''')
        
        conn.commit()
        conn.close()
        
        self.logger.info("Database initialized")
    
    def enqueue_message(self, message_type: str, payload: Dict[str, Any], 
                       priority: MessagePriority = MessagePriority.MEDIUM) -> int:
        """
        Add message to queue.
        
        Args:
            message_type: Type of message (report, event, alert)
            payload: Message payload
            priority: Message priority level
            
        Returns:
            Message ID
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO messages (message_type, priority, payload, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            message_type,
            priority.value,
            json.dumps(payload),
            MessageStatus.PENDING.value,
            now,
            now
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        self.logger.info(f"Message enqueued: ID={message_id}, Type={message_type}, Priority={priority.name}")
        
        return message_id
    
    def _get_next_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get next messages to send (ordered by priority and creation time).
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, message_type, priority, payload, attempts, created_at
            FROM messages
            WHERE status = ?
            ORDER BY priority DESC, created_at ASC
            LIMIT ?
        ''', (MessageStatus.PENDING.value, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        messages = []
        for row in rows:
            messages.append({
                'id': row[0],
                'message_type': row[1],
                'priority': row[2],
                'payload': json.loads(row[3]),
                'attempts': row[4],
                'created_at': row[5]
            })
        
        return messages
    
    def _update_message_status(self, message_id: int, status: MessageStatus, 
                              error: Optional[str] = None):
        """Update message status in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        if status == MessageStatus.SENT:
            cursor.execute('''
                UPDATE messages
                SET status = ?, updated_at = ?, sent_at = ?, error = NULL
                WHERE id = ?
            ''', (status.value, now, now, message_id))
        else:
            cursor.execute('''
                UPDATE messages
                SET status = ?, updated_at = ?, attempts = attempts + 1, error = ?
                WHERE id = ?
            ''', (status.value, now, error, message_id))
        
        conn.commit()
        conn.close()
    
    def _send_message(self, message: Dict[str, Any]) -> bool:
        """
        Attempt to send a single message.
        
        Returns:
            True if successful, False otherwise
        """
        message_id = message['id']
        message_type = message['message_type']
        payload = message['payload']
        attempts = message['attempts']
        
        # Check if max attempts reached
        if attempts >= 5:
            self.logger.warning(f"Message {message_id} exceeded max attempts (5)")
            self._update_message_status(message_id, MessageStatus.FAILED, "Max attempts exceeded")
            return False
        
        try:
            # Update status to sending
            self._update_message_status(message_id, MessageStatus.SENDING)
            
            # Send based on message type
            if message_type == "event":
                result = self.bridge_core.enviar_evento(
                    event_type=payload.get('event_type'),
                    event_data=payload.get('data', {}),
                    priority=payload.get('priority', 'MEDIUM')
                )
            elif message_type == "report":
                result = self.bridge_core.enviar_relatorio(
                    pdf_path=payload.get('pdf_path'),
                    metadata=payload.get('metadata', {})
                )
            else:
                self.logger.error(f"Unknown message type: {message_type}")
                self._update_message_status(message_id, MessageStatus.FAILED, "Unknown message type")
                return False
            
            # Check result
            if result.get('success'):
                self._update_message_status(message_id, MessageStatus.SENT)
                self.logger.info(f"Message {message_id} sent successfully")
                return True
            else:
                error = result.get('error', 'Unknown error')
                self._update_message_status(message_id, MessageStatus.PENDING, error)
                self.logger.warning(f"Message {message_id} failed: {error}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error sending message {message_id}: {e}")
            self._update_message_status(message_id, MessageStatus.PENDING, str(e))
            return False
    
    def _sync_loop(self):
        """Background sync loop"""
        self.logger.info("Sync thread started")
        
        while self.running:
            try:
                # Check connection
                conn_status = self.bridge_core.verificar_conexao()
                
                if conn_status.get('connected'):
                    # Get pending messages
                    messages = self._get_next_messages(limit=10)
                    
                    if messages:
                        self.logger.info(f"Processing {len(messages)} pending messages")
                        
                        for message in messages:
                            if not self.running:
                                break
                            
                            # Send message
                            self._send_message(message)
                            
                            # Small delay between messages
                            time.sleep(0.1)
                    
                    # Wait before next check (30 seconds if no messages, 5 if messages sent)
                    wait_time = 5 if messages else 30
                else:
                    self.logger.debug("No connection - waiting to retry")
                    wait_time = 60  # Wait longer if offline
                
                # Sleep in small increments to allow quick shutdown
                for _ in range(wait_time * 10):
                    if not self.running:
                        break
                    time.sleep(0.1)
                    
            except Exception as e:
                self.logger.error(f"Error in sync loop: {e}")
                time.sleep(10)
        
        self.logger.info("Sync thread stopped")
    
    def start(self):
        """Start background sync thread"""
        if self.running:
            self.logger.warning("Sync already running")
            return
        
        self.running = True
        self.sync_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.sync_thread.start()
        
        self.logger.info("Background sync started")
    
    def stop(self):
        """Stop background sync thread"""
        if not self.running:
            return
        
        self.logger.info("Stopping background sync...")
        self.running = False
        
        if self.sync_thread:
            self.sync_thread.join(timeout=5)
        
        self.logger.info("Background sync stopped")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get queue statistics.
        
        Returns:
            Dict with queue statistics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Count by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM messages
            GROUP BY status
        ''')
        
        status_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Count by priority
        cursor.execute('''
            SELECT priority, COUNT(*) as count
            FROM messages
            WHERE status = ?
            GROUP BY priority
        ''', (MessageStatus.PENDING.value,))
        
        priority_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get oldest pending message
        cursor.execute('''
            SELECT created_at
            FROM messages
            WHERE status = ?
            ORDER BY created_at ASC
            LIMIT 1
        ''', (MessageStatus.PENDING.value,))
        
        oldest_pending = cursor.fetchone()
        oldest_pending_age = None
        
        if oldest_pending:
            created = datetime.fromisoformat(oldest_pending[0])
            oldest_pending_age = (datetime.now() - created).total_seconds()
        
        conn.close()
        
        return {
            'status_counts': status_counts,
            'priority_counts': priority_counts,
            'oldest_pending_age_seconds': oldest_pending_age,
            'timestamp': datetime.now().isoformat()
        }
    
    def cleanup_old_messages(self, days: int = 30):
        """
        Clean up successfully sent messages older than specified days.
        
        Args:
            days: Age threshold in days
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        threshold = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            DELETE FROM messages
            WHERE status = ? AND sent_at < ?
        ''', (MessageStatus.SENT.value, threshold))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        self.logger.info(f"Cleaned up {deleted} old messages")
        
        return deleted


# Example usage
if __name__ == "__main__":
    from bridge_core import BridgeCore
    
    # Initialize components
    bridge = BridgeCore(
        endpoint="https://sgso.petrobras.com.br/api/v1",
        token="your_token_here"
    )
    
    sync = BridgeSync(bridge_core=bridge)
    
    # Add test messages
    sync.enqueue_message(
        message_type="event",
        payload={
            'event_type': 'system_test',
            'data': {'vessel': 'FPSO-123', 'message': 'Test event'},
            'priority': 'LOW'
        },
        priority=MessagePriority.LOW
    )
    
    # Start background sync
    sync.start()
    
    # Get statistics
    print("\nQueue Statistics:")
    stats = sync.get_statistics()
    print(json.dumps(stats, indent=2))
    
    # Keep running for a while
    try:
        time.sleep(60)
    except KeyboardInterrupt:
        pass
    
    # Stop sync
    sync.stop()
