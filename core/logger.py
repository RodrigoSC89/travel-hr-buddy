"""
Sistema de logging com timestamps para rastreabilidade de operações
"""

from datetime import datetime


def log(mensagem):
    """
    Registra uma mensagem com timestamp no formato [YYYY-MM-DD HH:MM:SS]
    
    Args:
        mensagem (str): Mensagem a ser registrada
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {mensagem}")
