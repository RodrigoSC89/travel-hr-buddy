"""
BridgeLink - Synchronization Module
Offline/online synchronization system with persistent message queue

Features:
- Persistent message queue using SQLite
- 4-level message prioritization (LOW, MEDIUM, HIGH, CRITICAL)
- Automatic retry with exponential backoff (max 5 attempts)
- Background sync thread for automatic transmission
- Statistics and cleanup utilities
"""

import json
import sqlite3
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MessagePriority(Enum):
    """Message priority levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class MessageType(Enum):
    """Message types."""
    REPORT = "report"
    EVENT = "event"
    METRIC = "metric"
    OTHER = "other"


class BridgeSync:
    """
    Synchronization manager for offline/online operations.
    
    Manages a persistent queue of messages that need to be transmitted
    to shore. Automatically retries failed transmissions with exponential
    backoff.
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
        self.sync_thread: Optional[threading.Thread] = None
        self.sync_interval = 60  # seconds
        self.max_retries = 5
        
        # Initialize database
        self._init_database()
        
        logger.info(f"BridgeSync initialized with database: {db_path}")
    
    def _init_database(self):
        """Initialize SQLite database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS message_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_type TEXT NOT NULL,
                priority INTEGER NOT NULL,
                payload TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                retry_count INTEGER DEFAULT 0,
                last_retry TIMESTAMP,
                next_retry TIMESTAMP,
                status TEXT DEFAULT 'pending',
                error_message TEXT
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_status_priority 
            ON message_queue(status, priority DESC, created_at)
        """)
        
        conn.commit()
        conn.close()
        
        logger.info("Database schema initialized")
    
    def add_message(
        self,
        message_type: MessageType,
        payload: Dict[str, Any],
        priority: MessagePriority = MessagePriority.MEDIUM
    ) -> int:
        """
        Add message to sync queue.
        
        Args:
            message_type: Type of message
            payload: Message payload as dictionary
            priority: Message priority level
            
        Returns:
            Message ID
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO message_queue (message_type, priority, payload, next_retry)
            VALUES (?, ?, ?, datetime('now'))
        """, (
            message_type.value,
            priority.value,
            json.dumps(payload)
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Message added to queue: ID={message_id}, Type={message_type.value}, Priority={priority.name}")
        
        return message_id
    
    def get_pending_messages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending messages ready for transmission.
        
        Args:
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM message_queue
            WHERE status = 'pending'
              AND next_retry <= datetime('now')
              AND retry_count < ?
            ORDER BY priority DESC, created_at ASC
            LIMIT ?
        """, (self.max_retries, limit))
        
        messages = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return messages
    
    def _calculate_backoff(self, retry_count: int) -> int:
        """
        Calculate exponential backoff delay in seconds.
        
        Args:
            retry_count: Current retry attempt number
            
        Returns:
            Delay in seconds
        """
        # Exponential backoff: 2^retry_count minutes
        delay_minutes = 2 ** retry_count
        return delay_minutes * 60
    
    def process_message(self, message: Dict[str, Any]) -> bool:
        """
        Process a single message transmission.
        
        Args:
            message: Message dictionary from queue
            
        Returns:
            True if successful, False otherwise
        """
        message_id = message['id']
        message_type = message['message_type']
        payload = json.loads(message['payload'])
        
        try:
            # Transmit based on message type
            if message_type == MessageType.REPORT.value:
                # For reports, payload should contain file path and metadata
                result = self.bridge_core.enviar_relatorio(
                    payload.get('file_path'),
                    payload.get('metadata')
                )
            elif message_type == MessageType.EVENT.value:
                # For events, payload is the event data
                result = self.bridge_core.enviar_evento(payload)
            else:
                # For other types, try as generic event
                result = self.bridge_core.enviar_evento(payload)
            
            if result.get('success'):
                # Mark as sent
                self._update_message_status(message_id, 'sent', None)
                logger.info(f"✅ Message {message_id} transmitted successfully")
                return True
            else:
                # Update retry information
                error_msg = result.get('error', 'Unknown error')
                self._update_retry(message_id, error_msg)
                logger.warning(f"⚠️ Message {message_id} transmission failed: {error_msg}")
                return False
                
        except Exception as e:
            error_msg = str(e)
            self._update_retry(message_id, error_msg)
            logger.error(f"❌ Error processing message {message_id}: {error_msg}")
            return False
    
    def _update_message_status(self, message_id: int, status: str, error_message: Optional[str]):
        """Update message status in database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE message_queue
            SET status = ?, error_message = ?
            WHERE id = ?
        """, (status, error_message, message_id))
        
        conn.commit()
        conn.close()
    
    def _update_retry(self, message_id: int, error_message: str):
        """Update retry count and schedule next retry."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get current retry count
        cursor.execute("SELECT retry_count FROM message_queue WHERE id = ?", (message_id,))
        row = cursor.fetchone()
        retry_count = row[0] if row else 0
        
        new_retry_count = retry_count + 1
        
        if new_retry_count >= self.max_retries:
            # Max retries reached, mark as failed
            status = 'failed'
            next_retry = None
        else:
            # Schedule next retry with exponential backoff
            status = 'pending'
            backoff_seconds = self._calculate_backoff(new_retry_count)
            next_retry = datetime.now() + timedelta(seconds=backoff_seconds)
        
        cursor.execute("""
            UPDATE message_queue
            SET retry_count = ?,
                last_retry = datetime('now'),
                next_retry = ?,
                status = ?,
                error_message = ?
            WHERE id = ?
        """, (new_retry_count, next_retry, status, error_message, message_id))
        
        conn.commit()
        conn.close()
        
        if status == 'failed':
            logger.error(f"❌ Message {message_id} exceeded max retries and marked as failed")
        else:
            logger.info(f"⏱️ Message {message_id} scheduled for retry {new_retry_count} at {next_retry}")
    
    def sync_pending(self) -> Dict[str, int]:
        """
        Synchronize all pending messages.
        
        Returns:
            Statistics dictionary with counts
        """
        messages = self.get_pending_messages(limit=100)
        
        stats = {
            'processed': 0,
            'successful': 0,
            'failed': 0
        }
        
        for message in messages:
            stats['processed'] += 1
            if self.process_message(message):
                stats['successful'] += 1
            else:
                stats['failed'] += 1
        
        if stats['processed'] > 0:
            logger.info(f"Sync complete: {stats['successful']} succeeded, {stats['failed']} failed")
        
        return stats
    
    def _sync_loop(self):
        """Background sync loop."""
        logger.info(f"Sync thread started (interval: {self.sync_interval}s)")
        
        while self.running:
            try:
                stats = self.sync_pending()
                
                # Sleep until next sync
                time.sleep(self.sync_interval)
                
            except Exception as e:
                logger.error(f"Error in sync loop: {e}")
                time.sleep(self.sync_interval)
        
        logger.info("Sync thread stopped")
    
    def start(self):
        """Start background synchronization thread."""
        if self.running:
            logger.warning("Sync thread already running")
            return
        
        self.running = True
        self.sync_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.sync_thread.start()
        
        logger.info("✅ Background sync started")
    
    def stop(self):
        """Stop background synchronization thread."""
        if not self.running:
            logger.warning("Sync thread not running")
            return
        
        self.running = False
        
        if self.sync_thread:
            self.sync_thread.join(timeout=5)
        
        logger.info("✅ Background sync stopped")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get queue statistics.
        
        Returns:
            Dictionary with queue statistics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get counts by status
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM message_queue
            GROUP BY status
        """)
        
        status_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get counts by priority
        cursor.execute("""
            SELECT priority, COUNT(*) as count
            FROM message_queue
            WHERE status = 'pending'
            GROUP BY priority
        """)
        
        priority_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            'status': status_counts,
            'pending_by_priority': priority_counts,
            'timestamp': datetime.now().isoformat()
        }
    
    def cleanup_old_messages(self, days: int = 30):
        """
        Clean up old sent/failed messages.
        
        Args:
            days: Delete messages older than this many days
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM message_queue
            WHERE status IN ('sent', 'failed')
              AND created_at < datetime('now', '-' || ? || ' days')
        """, (days,))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        logger.info(f"Cleaned up {deleted} old messages")
        
        return deleted


# Example usage
if __name__ == "__main__":
    from bridge_core import BridgeCore
    
    # Initialize components
    bridge = BridgeCore(
        endpoint="https://sgso.petrobras.com.br/api",
        token="your-token-here"
    )
    
    sync = BridgeSync(bridge_core=bridge)
    
    # Add a test message
    sync.add_message(
        message_type=MessageType.EVENT,
        payload={
            "tipo": "test_event",
            "descricao": "Test event from sync queue",
            "severidade": "LOW"
        },
        priority=MessagePriority.MEDIUM
    )
    
    # Start background sync
    sync.start()
    
    # Get statistics
    stats = sync.get_statistics()
    print(f"Queue statistics: {stats}")
    
    # Keep running for a while
    try:
        time.sleep(120)
    except KeyboardInterrupt:
        pass
    
    # Stop sync
    sync.stop()
