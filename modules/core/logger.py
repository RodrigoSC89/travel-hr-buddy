"""
logger.py - Centralized Logging Module

Sistema de logging centralizado para os módulos Nautilus.
"""

import logging
from datetime import datetime
from typing import Optional

# Configuração do logger global
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('nautilus.log', encoding='utf-8')
    ]
)

logger = logging.getLogger('nautilus')


def log_event(message: str, level: str = 'info') -> None:
    """
    Registra um evento no log do sistema.

    Args:
        message: Mensagem a ser registrada
        level: Nível do log (info, warning, error, critical)
    """
    timestamp = datetime.now().isoformat()
    formatted_message = f"[{timestamp}] {message}"

    if level.lower() == 'info':
        logger.info(formatted_message)
    elif level.lower() == 'warning':
        logger.warning(formatted_message)
    elif level.lower() == 'error':
        logger.error(formatted_message)
    elif level.lower() == 'critical':
        logger.critical(formatted_message)
    else:
        logger.info(formatted_message)


def log_gi_event(module: str, action: str, details: Optional[str] = None) -> None:
    """
    Registra evento específico do Global Intelligence.

    Args:
        module: Nome do módulo (gi_core, gi_sync, gi_trainer, etc.)
        action: Ação realizada
        details: Detalhes adicionais opcionais
    """
    message = f"[Global Intelligence] [{module}] {action}"
    if details:
        message += f" - {details}"
    log_event(message, 'info')
