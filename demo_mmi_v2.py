#!/usr/bin/env python3
"""
Demo script for MMI v2 - Marine Maintenance Intelligence 2.0
Demonstrates the system with sample data
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from modules.mmi_v2 import MMIv2


def setup_demo_data(mmi):
    """Setup demo data for the MMI v2 system"""
    print("\n🔧 Configurando dados de demonstração...")
    
    # Add asset hierarchy
    print("📦 Criando árvore de ativos...")
    mmi.asset_tree.adicionar_ativo("Propulsão Principal", tipo="Sistema")
    mmi.asset_tree.adicionar_ativo("Motor ME 4500", pai=1, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Motor STBD 4500", pai=1, tipo="Equipamento")
    
    mmi.asset_tree.adicionar_ativo("Sistema DP", tipo="Sistema")
    mmi.asset_tree.adicionar_ativo("Thruster STBD FWD", pai=4, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Thruster PORT FWD", pai=4, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Thruster STBD AFT", pai=4, tipo="Equipamento")
    
    mmi.asset_tree.adicionar_ativo("Sistema Elétrico", tipo="Sistema")
    mmi.asset_tree.adicionar_ativo("Gerador Principal 1", pai=8, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Gerador Principal 2", pai=8, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Gerador Emergência", pai=8, tipo="Equipamento")
    
    mmi.asset_tree.adicionar_ativo("Sistema Hidráulico", tipo="Sistema")
    mmi.asset_tree.adicionar_ativo("Bomba Hidráulica Principal", pai=12, tipo="Equipamento")
    mmi.asset_tree.adicionar_ativo("Bomba Hidráulica Reserva", pai=12, tipo="Equipamento")
    
    # Create maintenance plans
    print("📋 Criando planos preventivos...")
    mmi.planner.criar_plano(2, "Troca de óleo e filtros - Motor ME", 500)
    mmi.planner.criar_plano(3, "Troca de óleo e filtros - Motor STBD", 500)
    mmi.planner.criar_plano(5, "Inspeção de selo mecânico - Thruster STBD FWD", 180)
    mmi.planner.criar_plano(6, "Inspeção de selo mecânico - Thruster PORT FWD", 180)
    mmi.planner.criar_plano(7, "Inspeção de selo mecânico - Thruster STBD AFT", 180)
    mmi.planner.criar_plano(9, "Manutenção preventiva - Gerador 1", 90)
    mmi.planner.criar_plano(10, "Manutenção preventiva - Gerador 2", 90)
    mmi.planner.criar_plano(13, "Verificação de pressão e óleo - Bomba Principal", 30)
    
    # Register some costs
    print("💰 Registrando custos de exemplo...")
    mmi.costs.registrar_custo(1, "material", 2500.00, "Óleo e filtros - Motor ME")
    mmi.costs.registrar_custo(1, "mão de obra", 800.00, "4h técnico especializado")
    mmi.costs.registrar_custo(2, "material", 2500.00, "Óleo e filtros - Motor STBD")
    mmi.costs.registrar_custo(2, "mão de obra", 800.00, "4h técnico especializado")
    mmi.costs.registrar_custo(3, "material", 3200.00, "Selo mecânico - Thruster")
    mmi.costs.registrar_custo(3, "mão de obra", 1600.00, "8h técnico especializado")
    mmi.costs.registrar_custo(4, "material", 450.00, "Filtros - Gerador")
    mmi.costs.registrar_custo(4, "mão de obra", 200.00, "1h técnico")
    
    print("\n✅ Dados de demonstração configurados com sucesso!")
    print(f"   • {len(mmi.asset_tree.assets)} ativos criados")
    print(f"   • {len(mmi.planner.plans)} planos preventivos")
    print(f"   • {len(mmi.costs.costs)} registros de custo")


def main():
    """Run MMI v2 demo"""
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              ⚓ DEMONSTRAÇÃO DO MMI v2                            ║
║         Marine Maintenance Intelligence 2.0                       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

Este é um sistema demonstração do MMI v2 com dados pré-configurados.

Você pode explorar todas as funcionalidades:
  🌳 Árvore de ativos hierárquica
  🧭 Planos preventivos inteligentes
  💰 Controle de custos e peças
  🧠 Assistente IA técnico

Os dados são armazenados em arquivos JSON na raiz do projeto.
    """)
    
    resposta = input("\nDeseja configurar dados de demonstração? (s/n): ").strip().lower()
    
    # Initialize MMI v2
    mmi = MMIv2()
    
    if resposta == 's':
        setup_demo_data(mmi)
        input("\nPressione Enter para abrir o menu principal...")
    
    # Start interactive menu
    mmi.menu()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Demo encerrada pelo usuário.")
        print("⚓ Nautilus One - Até a próxima!")
