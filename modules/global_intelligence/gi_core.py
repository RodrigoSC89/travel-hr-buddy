"""
gi_core.py - Global Intelligence Core

Núcleo da IA Global — coleta, treina e prevê.
Consolida dados de toda a frota e realiza aprendizado contínuo.
"""

import json
from modules.global_intelligence.gi_sync import FleetCollector
from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_forecast import GlobalForecaster
from modules.global_intelligence.gi_dashboard import GlobalDashboard


class GlobalIntelligence:
    """
    Módulo de inteligência global do Nautilus One Pro.
    Consolida dados de toda a frota e realiza aprendizado contínuo.
    """

    def __init__(self):
        self.collector = FleetCollector()
        self.trainer = GlobalTrainer()
        self.forecaster = GlobalForecaster()
        self.dashboard = GlobalDashboard()

    def executar(self):
        """
        Executa o fluxo completo de inteligência global:
        1. Coleta dados da frota
        2. Treina o modelo global
        3. Gera previsões de risco
        4. Exibe dashboard consolidado
        """
        print("\n🌍 Iniciando IA Global da Frota Nautilus...")
        dados = self.collector.coletar_dados()
        self.trainer.treinar(dados)
        previsoes = self.forecaster.prever(dados)
        self.dashboard.mostrar(previsoes)
