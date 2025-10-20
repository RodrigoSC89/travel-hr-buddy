"""
Módulo de Logging - Sistema Nautilus One
Registra eventos do sistema com timestamps
"""
from datetime import datetime


def log_event(message):
    """
    Registra um evento no console com timestamp
    
    Args:
        message (str): Mensagem a ser registrada
    """
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    print(f"{timestamp} {message}")
