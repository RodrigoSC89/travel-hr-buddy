#!/usr/bin/env python3
"""
Test script for MMI v2 - Marine Maintenance Intelligence 2.0
Demonstrates all features of the system
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from modules.mmi_v2 import MMIv2, AssetTree, MaintenancePlanner, CostControl, NautilusLLM


def test_asset_tree():
    """Test Asset Tree functionality"""
    print("\n" + "="*60)
    print("🌳 TESTE: ÁRVORE DE ATIVOS")
    print("="*60)
    
    tree = AssetTree("test_assets.json")
    
    # Add some assets
    tree.adicionar_ativo("Propulsão", tipo="Sistema")
    tree.adicionar_ativo("Motor Principal", pai=1, tipo="Equipamento")
    tree.adicionar_ativo("Motor STBD", pai=1, tipo="Equipamento")
    tree.adicionar_ativo("Sistema DP", tipo="Sistema")
    tree.adicionar_ativo("Thruster STBD FWD", pai=4, tipo="Equipamento")
    
    # List hierarchy
    print("\n📋 Estrutura de Ativos:")
    tree.listar()
    
    print(f"\n✅ Total de ativos criados: {len(tree.assets)}")
    return tree


def test_maintenance_planner(tree):
    """Test Maintenance Planner functionality"""
    print("\n" + "="*60)
    print("🧭 TESTE: PLANOS PREVENTIVOS")
    print("="*60)
    
    planner = MaintenancePlanner(tree, "test_plans.json")
    
    # Create maintenance plans
    planner.criar_plano(1, "Troca de óleo - Motor Principal", 90)
    planner.criar_plano(2, "Inspeção de filtros - Motor Principal", 30)
    planner.criar_plano(5, "Manutenção de selo mecânico - Thruster", 180)
    
    # List plans
    planner.listar_planos()
    
    print(f"\n✅ Total de planos criados: {len(planner.plans)}")
    return planner


def test_cost_control():
    """Test Cost Control functionality"""
    print("\n" + "="*60)
    print("💰 TESTE: CONTROLE DE CUSTOS")
    print("="*60)
    
    costs = CostControl("test_costs.json")
    
    # Register costs
    costs.registrar_custo(1, "material", 2500.00, "Óleo e filtros")
    costs.registrar_custo(1, "mão de obra", 800.00, "4h técnico especializado")
    costs.registrar_custo(2, "material", 450.00, "Filtros de ar")
    costs.registrar_custo(2, "mão de obra", 200.00, "1h técnico")
    costs.registrar_custo(3, "material", 3200.00, "Selo mecânico")
    costs.registrar_custo(3, "mão de obra", 1600.00, "8h técnico especializado")
    
    # Show summary
    costs.resumo()
    
    print(f"\n✅ Total de registros: {len(costs.costs)}")
    return costs


def test_llm_assistant():
    """Test LLM Assistant functionality"""
    print("\n" + "="*60)
    print("🧠 TESTE: ASSISTENTE IA (LLM)")
    print("="*60)
    
    assistant = NautilusLLM()
    
    # Test queries
    perguntas = [
        "Como está o thruster?",
        "Qual o custo médio mensal?",
        "Manutenção do motor principal",
        "Sistema DP",
        "Sistema hidráulico"
    ]
    
    print("\n💬 Testando consultas técnicas:\n")
    for pergunta in perguntas:
        print(f"❓ Pergunta: {pergunta}")
        resposta = assistant.responder(pergunta)
        print(f"🤖 Resposta: {resposta}\n")
    
    # Test report generation
    print("\n📊 Gerando relatório mensal:")
    relatorio = assistant.gerar_relatorio("mensal")
    print(relatorio)
    
    print("✅ Assistente IA testado com sucesso!")
    return assistant


def test_full_integration():
    """Test full MMI v2 integration"""
    print("\n" + "="*60)
    print("⚓ TESTE: INTEGRAÇÃO COMPLETA MMI v2")
    print("="*60)
    
    # Initialize MMI v2
    print("\n🚀 Inicializando MMI v2...")
    mmi = MMIv2()
    
    # Add some data
    print("\n📝 Adicionando dados de teste...")
    mmi.asset_tree.adicionar_ativo("Sistema Elétrico", tipo="Sistema")
    mmi.planner.criar_plano(1, "Teste de baterias", 30)
    mmi.costs.registrar_custo(100, "material", 500.00, "Teste")
    
    # Test assistant
    print("\n🤖 Testando assistente:")
    resposta = mmi.assistant.responder("custo")
    print(f"Resposta: {resposta}")
    
    print("\n✅ Integração completa testada com sucesso!")
    return mmi


def cleanup_test_files():
    """Clean up test files"""
    test_files = [
        "test_assets.json",
        "test_plans.json",
        "test_costs.json",
        "mmi_assets.json",
        "mmi_preventive_plans.json",
        "mmi_costs.json"
    ]
    
    for file in test_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"🗑️  Removido: {file}")


def main():
    """Run all tests"""
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              🧪 TESTE COMPLETO DO MMI v2                          ║
║         Marine Maintenance Intelligence 2.0                       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        # Run individual tests
        tree = test_asset_tree()
        planner = test_maintenance_planner(tree)
        costs = test_cost_control()
        assistant = test_llm_assistant()
        
        # Run full integration test
        mmi = test_full_integration()
        
        # Summary
        print("\n" + "="*60)
        print("📊 RESUMO DOS TESTES")
        print("="*60)
        print(f"✅ Ativos criados: {len(tree.assets)}")
        print(f"✅ Planos preventivos: {len(planner.plans)}")
        print(f"✅ Registros de custo: {len(costs.costs)}")
        print(f"✅ Assistente IA: Operacional")
        print(f"✅ Integração completa: OK")
        print("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!")
        
        # Cleanup
        print("\n" + "="*60)
        print("🧹 LIMPEZA")
        print("="*60)
        cleanup_test_files()
        
        print("\n⚓ Nautilus One - MMI v2 testado e aprovado!")
        return 0
        
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
