#!/usr/bin/env python3
"""
Demo script for Nautilus Global Intelligence

Demonstrates the complete workflow using sample data from fleet_profiles.json
"""

import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from modules.global_intelligence.gi_trainer import GlobalTrainer
from modules.global_intelligence.gi_forecast import GlobalForecaster
from modules.global_intelligence.gi_dashboard import GlobalDashboard
from modules.global_intelligence.gi_alerts import GlobalAlerts


def carregar_dados_exemplo():
    """Carrega dados de exemplo do fleet_profiles.json"""
    try:
        with open('modules/global_intelligence/fleet_profiles.json', 'r', encoding='utf-8') as f:
            config = json.load(f)
            return config['vessels']
    except FileNotFoundError:
        print("⚠️ Arquivo fleet_profiles.json não encontrado.")
        return []


def main():
    """Executa demonstração completa do sistema"""
    print("=" * 70)
    print("🌍 NAUTILUS GLOBAL INTELLIGENCE - DEMONSTRAÇÃO")
    print("=" * 70)

    # 1. Carregar dados de exemplo
    print("\n📥 Carregando dados de exemplo...")
    dados = carregar_dados_exemplo()

    if not dados:
        print("❌ Nenhum dado disponível para demonstração.")
        return

    print(f"✅ {len(dados)} embarcações carregadas:")
    for vessel in dados:
        print(f"   - {vessel['embarcacao']} ({vessel['tipo']}, {vessel['dp_class']})")

    # 2. Treinar modelo
    print("\n🤖 Treinando modelo global...")
    trainer = GlobalTrainer()
    trainer.treinar(dados)

    # 3. Gerar previsões
    print("\n🔮 Gerando previsões de risco...")
    forecaster = GlobalForecaster()
    previsoes = forecaster.prever(dados)

    # 4. Exibir dashboard
    dashboard = GlobalDashboard()
    dashboard.mostrar(previsoes)

    # 5. Analisar alertas
    print("\n🚨 Analisando padrões de risco...")
    alerts = GlobalAlerts()
    alerts.analisar_padroes(previsoes)

    print("\n" + "=" * 70)
    print("✅ Demonstração concluída com sucesso!")
    print("=" * 70)


if __name__ == "__main__":
    main()
