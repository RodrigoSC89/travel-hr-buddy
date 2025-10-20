"""
BridgeLink Module
=================
Sistema de comunicação segura entre bordo e costa para o PEO-DP Inteligente.

Componentes:
- BridgeCore: Comunicação segura com SGSO Petrobras
- BridgeAPI: Endpoints REST locais
- BridgeSync: Sincronização offline/online

Exemplo de uso:
    from bridge_link import BridgeCore, BridgeSync
    
    bridge = BridgeCore(
        endpoint="https://sgso.petrobras.com.br/api",
        token="seu_token_aqui"
    )
    
    # Enviar relatório
    bridge.enviar_relatorio("relatorio.pdf")
    
    # Enviar evento crítico
    bridge.enviar_evento({
        "tipo": "loss_dp",
        "embarcacao": "FPSO-123",
        "severidade": "critica"
    })
"""

from .bridge_core import BridgeCore
from .bridge_sync import BridgeSync, MessageType, MessagePriority

__version__ = "1.0.0"
__all__ = ['BridgeCore', 'BridgeSync', 'MessageType', 'MessagePriority']
