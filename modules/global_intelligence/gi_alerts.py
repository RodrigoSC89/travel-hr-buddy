"""
gi_alerts.py - Global Alert System

Detecção automática de padrões críticos e disparo de alertas corporativos.
"""

from typing import List, Dict, Any
import logging

# Configuração básica de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def log_event(message: str) -> None:
    """
    Registra evento no log do sistema.

    Args:
        message: Mensagem a ser registrada
    """
    logger.warning(message)


class GlobalAlerts:
    """
    Sistema de alertas globais.
    Detecta padrões críticos e dispara notificações.
    """

    def __init__(self):
        self.threshold_critico = 80
        self.threshold_alto = 70
        self.threshold_moderado = 40

    def analisar_padroes(self, previsoes: List[Dict[str, Any]]) -> None:
        """
        Analisa padrões de risco e dispara alertas quando necessário.

        Args:
            previsoes: Lista de previsões com embarcação e risco
        """
        if not previsoes:
            return

        alertas_criticos = []
        alertas_altos = []

        for navio in previsoes:
            risco = navio.get("risco", 0)
            embarcacao = navio.get("embarcacao", "N/A")

            if risco > self.threshold_critico:
                mensagem = f"🚨 ALERTA CRÍTICO: {embarcacao} com risco crítico global ({risco}%)."
                log_event(mensagem)
                alertas_criticos.append(embarcacao)
            elif risco > self.threshold_alto:
                mensagem = f"⚠️ ALERTA ALTO: {embarcacao} com risco alto ({risco}%)."
                log_event(mensagem)
                alertas_altos.append(embarcacao)

        # Resumo de alertas
        if alertas_criticos or alertas_altos:
            print("\n🚨 Resumo de Alertas:")
            if alertas_criticos:
                print(f"   Críticos: {len(alertas_criticos)} embarcações")
            if alertas_altos:
                print(f"   Altos: {len(alertas_altos)} embarcações")
