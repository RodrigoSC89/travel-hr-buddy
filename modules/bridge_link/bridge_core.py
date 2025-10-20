"""
BridgeLink Core - Secure HTTP Communication Layer
=================================================

Provides secure communication bridge between vessels and shore operations,
connecting to SGSO Petrobras for automatic report transmission and critical events.

Features:
- Bearer token authentication
- Automatic PDF report transmission
- Critical event transmission (loss DP, failures, ASOG alerts)
- Connection verification and health checks
- Comprehensive error handling and logging

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

import requests
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum


class MessageType(Enum):
    """Message type classification"""
    REPORT = "report"
    EVENT = "event"
    ALERT = "alert"
    STATUS = "status"


class BridgeCore:
    """
    Secure HTTP communication layer for ship-to-shore communication.
    
    This class handles all HTTP communication with the SGSO Petrobras system,
    including authentication, report transmission, and event notification.
    """
    
    def __init__(self, endpoint: str, token: str, timeout: int = 30):
        """
        Initialize BridgeCore communication layer.
        
        Args:
            endpoint: SGSO Petrobras API endpoint URL
            token: Bearer authentication token
            timeout: Request timeout in seconds (default: 30)
        """
        self.endpoint = endpoint.rstrip('/')
        self.token = token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'User-Agent': 'BridgeLink/1.0.0'
        })
        
        # Configure logging
        self.logger = logging.getLogger('BridgeCore')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def verificar_conexao(self) -> Dict[str, Any]:
        """
        Verify connection to SGSO endpoint.
        
        Returns:
            Dict with connection status:
            {
                'connected': bool,
                'latency_ms': float,
                'timestamp': str,
                'error': str (if failed)
            }
        """
        start_time = datetime.now()
        
        try:
            response = self.session.get(
                f"{self.endpoint}/health",
                timeout=self.timeout
            )
            
            latency = (datetime.now() - start_time).total_seconds() * 1000
            
            if response.status_code == 200:
                self.logger.info(f"Connection verified - Latency: {latency:.2f}ms")
                return {
                    'connected': True,
                    'latency_ms': round(latency, 2),
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code
                }
            else:
                self.logger.warning(f"Connection check returned status {response.status_code}")
                return {
                    'connected': False,
                    'latency_ms': round(latency, 2),
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code,
                    'error': f"HTTP {response.status_code}"
                }
                
        except requests.exceptions.RequestException as e:
            latency = (datetime.now() - start_time).total_seconds() * 1000
            self.logger.error(f"Connection verification failed: {e}")
            return {
                'connected': False,
                'latency_ms': round(latency, 2),
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def enviar_relatorio(self, pdf_path: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send PDF report to SGSO Petrobras.
        
        Args:
            pdf_path: Path to PDF report file
            metadata: Report metadata (vessel, date, audit_type, etc.)
            
        Returns:
            Dict with transmission result:
            {
                'success': bool,
                'message_id': str,
                'timestamp': str,
                'error': str (if failed)
            }
        """
        try:
            # Read PDF file
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()
            
            # Prepare multipart form data
            files = {
                'report': ('report.pdf', pdf_content, 'application/pdf')
            }
            
            data = {
                'metadata': json.dumps(metadata),
                'type': MessageType.REPORT.value
            }
            
            # Send request
            response = self.session.post(
                f"{self.endpoint}/reports",
                files=files,
                data=data,
                timeout=self.timeout
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                self.logger.info(f"Report sent successfully - ID: {result.get('message_id')}")
                return {
                    'success': True,
                    'message_id': result.get('message_id'),
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code
                }
            else:
                self.logger.error(f"Report transmission failed: HTTP {response.status_code}")
                return {
                    'success': False,
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
                
        except FileNotFoundError:
            self.logger.error(f"PDF file not found: {pdf_path}")
            return {
                'success': False,
                'timestamp': datetime.now().isoformat(),
                'error': f"File not found: {pdf_path}"
            }
        except Exception as e:
            self.logger.error(f"Report transmission failed: {e}")
            return {
                'success': False,
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def enviar_evento(self, event_type: str, event_data: Dict[str, Any], 
                      priority: str = "MEDIUM") -> Dict[str, Any]:
        """
        Send critical event to SGSO Petrobras.
        
        Args:
            event_type: Event type (loss_dp, failure, asog_alert, etc.)
            event_data: Event details
            priority: Priority level (LOW, MEDIUM, HIGH, CRITICAL)
            
        Returns:
            Dict with transmission result
        """
        try:
            payload = {
                'type': MessageType.EVENT.value,
                'event_type': event_type,
                'data': event_data,
                'priority': priority,
                'timestamp': datetime.now().isoformat()
            }
            
            response = self.session.post(
                f"{self.endpoint}/events",
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                self.logger.info(f"Event sent successfully - Type: {event_type}, Priority: {priority}")
                return {
                    'success': True,
                    'message_id': result.get('message_id'),
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code
                }
            else:
                self.logger.error(f"Event transmission failed: HTTP {response.status_code}")
                return {
                    'success': False,
                    'timestamp': datetime.now().isoformat(),
                    'status_code': response.status_code,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            self.logger.error(f"Event transmission failed: {e}")
            return {
                'success': False,
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def obter_status(self) -> Dict[str, Any]:
        """
        Get current system status from SGSO.
        
        Returns:
            Dict with system status information
        """
        try:
            response = self.session.get(
                f"{self.endpoint}/status",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                status = response.json()
                self.logger.info("Status retrieved successfully")
                return {
                    'success': True,
                    'status': status,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'status_code': response.status_code,
                    'error': f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            self.logger.error(f"Status retrieval failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def close(self):
        """Close the HTTP session."""
        if self.session:
            self.session.close()
            self.logger.info("Session closed")


# Example usage
if __name__ == "__main__":
    # Demo configuration
    SGSO_ENDPOINT = "https://sgso.petrobras.com.br/api/v1"
    AUTH_TOKEN = "your_bearer_token_here"
    
    # Initialize bridge
    bridge = BridgeCore(endpoint=SGSO_ENDPOINT, token=AUTH_TOKEN)
    
    # Test connection
    print("Testing connection...")
    conn_status = bridge.verificar_conexao()
    print(json.dumps(conn_status, indent=2))
    
    # Send event
    print("\nSending test event...")
    event_result = bridge.enviar_evento(
        event_type="system_test",
        event_data={
            "vessel": "FPSO-123",
            "message": "System test event"
        },
        priority="LOW"
    )
    print(json.dumps(event_result, indent=2))
    
    # Close session
    bridge.close()
