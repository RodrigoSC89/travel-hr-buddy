"""
Global Alerts Module

Analyzes fleet-wide patterns and triggers automated alerts.
Integrates with SGSO and BI Petrobras for critical notifications.
"""

from core.logger import logger


class GlobalAlerts:
    """Automated alert system for critical fleet-wide patterns"""

    def __init__(self):
        """Initialize alert thresholds"""
        self.critical_threshold = 80
        self.high_threshold = 70
        self.moderate_threshold = 40

    def analisar_padroes(self, previsoes):
        """
        Analyze fleet patterns and trigger alerts for critical situations.

        Args:
            previsoes (list): Risk predictions for all vessels
        """
        if not previsoes:
            print("⚠️ Nenhuma previsão para analisar.")
            return

        print("\n🚨 Analisando padrões...")

        # Count vessels by risk level
        criticos = 0
        altos = 0
        moderados = 0

        for navio in previsoes:
            risco = navio.get("risco", 0)
            embarcacao = navio.get("embarcacao", "Desconhecida")

            if risco >= self.critical_threshold:
                criticos += 1
                self._enviar_alerta_critico(embarcacao, risco)
            elif risco >= self.high_threshold:
                altos += 1
                self._enviar_alerta_alto(embarcacao, risco)
            elif risco >= self.moderate_threshold:
                moderados += 1

        # Fleet-wide pattern alerts
        if criticos > 0:
            print(f"🚨 ALERTA CRÍTICO: {criticos} embarcações com risco crítico global")
            logger.warning(f"FLEET ALERT: {criticos} vessels with critical risk")

        if altos > 2:
            print(f"⚠️ ATENÇÃO: {altos} embarcações com risco alto")
            logger.warning(f"FLEET ALERT: {altos} vessels with high risk")

        if criticos == 0 and altos == 0:
            print("✅ Frota operando dentro dos parâmetros normais")
            logger.info("Fleet status: Normal operation")

    def _enviar_alerta_critico(self, embarcacao, risco):
        """
        Send critical alert for vessel with very high risk.

        Args:
            embarcacao (str): Vessel name
            risco (float): Risk percentage
        """
        mensagem = f"🚨 ALERTA CRÍTICO: {embarcacao} com risco {risco}%"
        logger.error(mensagem)
        # Integration point for SGSO and BI Petrobras
        # TODO: Implement actual notification system

    def _enviar_alerta_alto(self, embarcacao, risco):
        """
        Send high-priority alert for vessel with elevated risk.

        Args:
            embarcacao (str): Vessel name
            risco (float): Risk percentage
        """
        mensagem = f"⚠️ ALERTA ALTO: {embarcacao} com risco {risco}%"
        logger.warning(mensagem)
        # Integration point for fleet monitoring systems
        # TODO: Implement actual notification system
