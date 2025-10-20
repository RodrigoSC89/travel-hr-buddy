"""
BridgeLink Module - Secure Ship-to-Shore Communication Bridge

This module provides secure communication between vessels and shore operations,
connecting to SGSO Petrobras systems.

Main Components:
- BridgeCore: HTTP communication layer with authentication
- BridgeAPI: Flask REST API with JWT authentication
- BridgeSync: Offline/online synchronization with persistent queue

Usage:
    from bridge_link import BridgeCore, BridgeSync, MessageType, MessagePriority
    
    # Initialize communication
    bridge = BridgeCore(endpoint=SGSO_ENDPOINT, token=AUTH_TOKEN)
    sync = BridgeSync(bridge_core=bridge)
    sync.start()  # Auto-sync in background
    
    # Send report
    bridge.enviar_relatorio("audit_report.pdf", metadata={...})
    
    # Send critical event
    bridge.enviar_evento({
        "tipo": "loss_dp",
        "descricao": "Event description",
        "severidade": "CRITICAL"
    })
"""

from .bridge_core import BridgeCore
from .bridge_sync import BridgeSync, MessageType, MessagePriority

__version__ = "1.0.0"
__all__ = ["BridgeCore", "BridgeSync", "MessageType", "MessagePriority"]
