#!/usr/bin/env python3
"""
Demonstração do Módulo Forecast de Risco
Mostra as principais funcionalidades do sistema

Versão: 1.0.0
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.forecast_risk import RiskForecast


def demo_basico():
    """Demonstração básica do módulo"""
    print("=" * 70)
    print("🔱 DEMONSTRAÇÃO DO MÓDULO FORECAST DE RISCO")
    print("=" * 70)
    print()
    
    print("1️⃣  Criando instância do módulo...")
    forecast = RiskForecast()
    print("   ✅ Módulo inicializado\n")
    
    print("2️⃣  Carregando dados FMEA e ASOG...")
    forecast.carregar_dados()
    print("   ✅ Dados carregados com sucesso\n")
    
    print("3️⃣  Calculando métricas...")
    rpn_medio = forecast.calcular_rpn_medio()
    variabilidade = forecast.calcular_variabilidade()
    risco = forecast.classificar_risco(rpn_medio)
    status_asog = forecast.verificar_status_asog()
    print(f"   📊 RPN Médio: {rpn_medio:.2f}")
    print(f"   📊 Variabilidade (σ): {variabilidade:.2f}")
    print(f"   📊 Classificação: {risco}")
    print(f"   📊 Status ASOG: {status_asog}\n")
    
    print("4️⃣  Gerando forecast completo...")
    resultado = forecast.gerar_previsao()
    print("   ✅ Forecast gerado com sucesso\n")
    
    print("5️⃣  Salvando relatório...")
    forecast.salvar_relatorio(resultado, "demo_forecast.json")
    print("   ✅ Relatório salvo em: demo_forecast.json\n")
    
    print("=" * 70)
    print("📊 RESULTADO FINAL DO FORECAST")
    print("=" * 70)
    print()
    print(f"🕐 Timestamp: {resultado['timestamp']}")
    print(f"📈 Risco Previsto: {resultado['risco_previsto']}")
    print(f"📊 RPN Médio: {resultado['rpn_medio']}")
    print(f"📊 Variabilidade: {resultado['variabilidade']}")
    print(f"🔍 Status Operacional: {resultado['status_operacional']}")
    print(f"\n💡 Recomendação:")
    print(f"   {resultado['recomendacao']}")
    print()
    print("=" * 70)
    print()


def demo_sistemas_fmea():
    """Demonstração da análise de sistemas FMEA"""
    print("=" * 70)
    print("📋 ANÁLISE DETALHADA DOS SISTEMAS FMEA")
    print("=" * 70)
    print()
    
    forecast = RiskForecast()
    forecast.carregar_dados()
    
    sistemas = forecast.dados_fmea['sistemas_analisados']
    
    print(f"Total de sistemas analisados: {len(sistemas)}\n")
    
    # Ordenar por RPN (maior primeiro)
    sistemas_ordenados = sorted(sistemas, key=lambda x: x['rpn'], reverse=True)
    
    print("🔴 TOP 3 SISTEMAS DE MAIOR RISCO:")
    print("-" * 70)
    for i, sistema in enumerate(sistemas_ordenados[:3], 1):
        emoji = "🔴" if sistema['rpn'] > 100 else "🟡" if sistema['rpn'] > 50 else "🟢"
        print(f"{i}. {emoji} {sistema['nome']}")
        print(f"   RPN: {sistema['rpn']} (S={sistema['severidade']}, O={sistema['ocorrencia']}, D={sistema['deteccao']})")
        print(f"   Ação: {sistema['acoes_recomendadas']}")
        print()
    
    # Estatísticas
    rpn_values = [s['rpn'] for s in sistemas]
    rpn_max = max(rpn_values)
    rpn_min = min(rpn_values)
    
    print("📊 ESTATÍSTICAS GERAIS:")
    print("-" * 70)
    print(f"RPN Máximo: {rpn_max}")
    print(f"RPN Mínimo: {rpn_min}")
    print(f"RPN Médio: {forecast.calcular_rpn_medio():.2f}")
    print(f"Variabilidade (σ): {forecast.calcular_variabilidade():.2f}")
    print()


def demo_conformidade_asog():
    """Demonstração da verificação de conformidade ASOG"""
    print("=" * 70)
    print("✅ VERIFICAÇÃO DE CONFORMIDADE ASOG")
    print("=" * 70)
    print()
    
    forecast = RiskForecast()
    forecast.carregar_dados()
    
    parametros = forecast.dados_asog['parametros_operacionais']
    
    print(f"Embarcação: {forecast.dados_asog['embarcacao']}")
    print(f"Data de Verificação: {forecast.dados_asog['data_verificacao']}\n")
    
    print("PARÂMETROS OPERACIONAIS:")
    print("-" * 70)
    
    for param in parametros:
        status_emoji = "✅" if param['status'] == 'conforme' else "❌"
        print(f"{status_emoji} {param['parametro']}")
        print(f"   Valor: {param['valor_atual']} {param['unidade']}")
        print(f"   Limite: ≥ {param['limite_minimo']} {param['unidade']}")
        print(f"   Status: {param['status'].upper()}")
        print()
    
    status_geral = forecast.verificar_status_asog()
    print("=" * 70)
    print(f"STATUS GERAL: {'✅ CONFORME' if status_geral == 'conforme' else '❌ NÃO CONFORME'}")
    print("=" * 70)
    print()


def main():
    """Executa todas as demonstrações"""
    print("\n")
    
    # Demonstração básica
    demo_basico()
    
    input("⏎ Pressione ENTER para continuar para análise FMEA...")
    print("\n")
    
    # Análise FMEA
    demo_sistemas_fmea()
    
    input("⏎ Pressione ENTER para continuar para verificação ASOG...")
    print("\n")
    
    # Conformidade ASOG
    demo_conformidade_asog()
    
    print("🎉 DEMONSTRAÇÃO CONCLUÍDA!")
    print("\nPróximos passos:")
    print("  1. Execute: python3 decision_core.py (menu interativo)")
    print("  2. Ou use: python3 modules/forecast_risk.py (standalone)")
    print("  3. Ou integre via: from modules.forecast_risk import RiskForecast")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Demonstração interrompida. Até logo!")
        sys.exit(0)
