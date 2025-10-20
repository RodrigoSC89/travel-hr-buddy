"""
BridgeLink Module - Secure Ship-to-Shore Communication
=======================================================

BridgeLink provides a secure communication bridge between vessels and shore
operations, connecting to SGSO Petrobras for automatic report transmission
and critical event notification.

Components:
- bridge_core: Secure HTTP communication layer
- bridge_api: Flask-based REST API with JWT authentication
- bridge_sync: Offline/online synchronization system

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

from .bridge_core import BridgeCore, MessageType
from .bridge_sync import BridgeSync, MessagePriority, MessageStatus

# Optional import for bridge_api (requires Flask)
try:
    from .bridge_api import BridgeAPI
    __all__ = [
        'BridgeCore',
        'MessageType',
        'BridgeAPI',
        'BridgeSync',
        'MessagePriority',
        'MessageStatus'
    ]
except ImportError:
    __all__ = [
        'BridgeCore',
        'MessageType',
        'BridgeSync',
        'MessagePriority',
        'MessageStatus'
    ]

__version__ = "1.0.0"
