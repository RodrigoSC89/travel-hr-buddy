"""
Sistema de logging com timestamps para rastreabilidade de operações.
Fornece funções simples para registrar eventos durante análises de risco.
"""

from datetime import datetime


def log_event(message: str) -> None:
    """
    Registra um evento com timestamp no formato [YYYY-MM-DD HH:MM:SS].
    
    Args:
        message: Mensagem a ser registrada
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")


def log_info(message: str) -> None:
    """
    Registra uma mensagem informativa.
    
    Args:
        message: Mensagem informativa
    """
    log_event(message)


def log_error(message: str) -> None:
    """
    Registra uma mensagem de erro.
    
    Args:
        message: Mensagem de erro
    """
    log_event(f"ERRO: {message}")


def log_warning(message: str) -> None:
    """
    Registra uma mensagem de aviso.
    
    Args:
        message: Mensagem de aviso
    """
    log_event(f"AVISO: {message}")
