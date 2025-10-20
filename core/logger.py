"""
Módulo de logging para o Nautilus One Decision Core.
Responsável por registrar eventos e operações do sistema.
"""
from datetime import datetime


def log_event(msg: str) -> None:
    """
    Registra um evento no arquivo de log do sistema.
    
    Args:
        msg: Mensagem a ser registrada no log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("nautilus_logs.txt", "a", encoding="utf-8") as log:
        log.write(f"[{timestamp}] {msg}\n")
