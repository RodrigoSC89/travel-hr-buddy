"""
Global Intelligence Core Module

Main orchestrator for Nautilus Global Intelligence system.
Consolidates data from entire fleet, trains ML models, and generates predictions.
"""

import json
from modules.global_intelligence.gi_sync import FleetCollector
from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_forecast import GlobalForecaster
from modules.global_intelligence.gi_dashboard import GlobalDashboard
from modules.global_intelligence.gi_alerts import GlobalAlerts


class GlobalIntelligence:
    """
    Global Intelligence orchestrator for Nautilus One Pro.
    Consolidates data from entire fleet and performs continuous learning.
    """

    def __init__(self):
        """Initialize all Global Intelligence components"""
        self.collector = FleetCollector()
        self.trainer = GlobalTrainer()
        self.forecaster = GlobalForecaster()
        self.dashboard = GlobalDashboard()
        self.alerts = GlobalAlerts()

    def executar(self):
        """
        Execute complete Global Intelligence workflow:
        1. Collect fleet data via BridgeLink
        2. Train global ML model
        3. Generate risk predictions
        4. Display corporate dashboard
        5. Analyze patterns and send alerts
        """
        print("\n🌍 Iniciando IA Global da Frota Nautilus...")
        
        # Step 1: Collect fleet data
        dados = self.collector.coletar_dados()
        
        if not dados:
            print("⚠️ Nenhum dado coletado. Encerrando.")
            return
        
        # Step 2: Train global model
        self.trainer.treinar(dados)
        
        # Step 3: Generate predictions
        previsoes = self.forecaster.prever(dados)
        
        # Step 4: Display dashboard
        self.dashboard.mostrar(previsoes)
        
        # Step 5: Analyze patterns and alerts
        self.alerts.analisar_padroes(previsoes)
        
        print("\n✅ Ciclo de IA Global concluído com sucesso!")
