#!/usr/bin/env python3
"""
Decision Core - Interface CLI para Análise de Risco Operacional
Sistema Nautilus One

Interface interativa para execução de análises preditivas de risco.
"""

import sys
from modules.forecast_risk import RiskForecast


def exibir_menu():
    """Exibe o menu principal do sistema."""
    print("\n" + "="*60)
    print("🔱 NAUTILUS ONE - Sistema de Análise de Risco Operacional")
    print("="*60)
    print("\nSelecione uma opção:")
    print("\n1. Visualizar dados FMEA atuais")
    print("2. Executar Análise Preditiva de Risco (Forecast)")
    print("3. Gerar Relatório ASOG")
    print("4. Ajuda sobre o sistema")
    print("0. Sair")
    print("\n" + "-"*60)


def visualizar_fmea():
    """Exibe informações sobre os dados FMEA."""
    print("\n📋 Dados FMEA - Análise de Modos de Falha")
    print("-"*60)
    
    forecast = RiskForecast()
    if forecast.carregar_dados_fmea():
        print(f"\n✅ {len(forecast.fmea_data)} sistemas carregados para análise:")
        print()
        
        for i, sistema in enumerate(forecast.fmea_data, 1):
            rpn = forecast.calcular_rpn(sistema)
            print(f"{i}. {sistema['nome']}")
            print(f"   Modo de Falha: {sistema['modo_falha']}")
            print(f"   RPN = {rpn} (S:{sistema['severidade']} × O:{sistema['ocorrencia']} × D:{sistema['deteccao']})")
            print()
    else:
        print("\n❌ Erro ao carregar dados FMEA")


def executar_forecast():
    """Executa a análise preditiva de risco."""
    print("\n🔮 Executando Análise Preditiva de Risco...")
    print("-"*60)
    
    forecast = RiskForecast()
    forecast.analyze()
    
    print("\n✅ Análise concluída com sucesso!")
    input("\nPressione ENTER para continuar...")


def exibir_asog():
    """Exibe informações sobre o relatório ASOG."""
    print("\n📊 Relatório ASOG - Conformidade Operacional")
    print("-"*60)
    
    forecast = RiskForecast()
    if forecast.carregar_dados_asog():
        status = forecast.avaliar_status_asog()
        parametros = forecast.asog_data.get('parametros', [])
        
        print(f"\n✅ Status Geral: {status.upper()}")
        print(f"\nParâmetros avaliados: {len(parametros)}")
        print()
        
        for param in parametros:
            status_icon = "✅" if param['status'] == 'conforme' else "⚠️"
            print(f"{status_icon} {param['parametro']}")
            print(f"   Valor: {param['valor_atual']} {param['unidade']}")
            print(f"   Mínimo: {param['valor_minimo']} {param['unidade']}")
            print(f"   Status: {param['status']}")
            print()
    else:
        print("\n❌ Erro ao carregar dados ASOG")
    
    input("\nPressione ENTER para continuar...")


def exibir_ajuda():
    """Exibe informações de ajuda sobre o sistema."""
    print("\n📖 Ajuda - Sistema de Análise de Risco")
    print("-"*60)
    print("""
SOBRE O SISTEMA:
O Nautilus One Risk Forecast é um sistema de análise preditiva de risco
para operações marítimas e offshore baseado em:

• FMEA (Failure Mode and Effects Analysis)
  - Análise de modos de falha e seus efeitos
  - Cálculo de RPN (Risk Priority Number = S × O × D)
  - Identificação de sistemas críticos

• ASOG (Assurance of Operational Compliance)
  - Verificação de conformidade operacional
  - Monitoramento de parâmetros críticos
  - Avaliação de disponibilidade e confiabilidade

COMO USAR:
1. Visualizar dados FMEA: Lista sistemas e seus RPNs
2. Executar Forecast: Gera análise preditiva completa
3. Relatório ASOG: Verifica conformidade operacional

CLASSIFICAÇÃO DE RISCO:
🔴 ALTA (RPN > 200): Requer ação imediata
🟡 MODERADA (150-200): Intensificar monitoramento
🟢 BAIXA (≤ 150): Operação normal

SAÍDA:
O sistema gera um arquivo 'forecast_risco.json' com:
- Timestamp da análise
- Risco previsto
- RPN médio e variabilidade
- Status operacional ASOG
- Recomendações automáticas
    """)
    input("\nPressione ENTER para continuar...")


def main():
    """Função principal que gerencia o loop do menu."""
    while True:
        try:
            exibir_menu()
            opcao = input("\nOpção: ").strip()
            
            if opcao == "0":
                print("\n👋 Encerrando sistema. Até logo!")
                sys.exit(0)
            elif opcao == "1":
                visualizar_fmea()
                input("\nPressione ENTER para continuar...")
            elif opcao == "2":
                executar_forecast()
            elif opcao == "3":
                exibir_asog()
            elif opcao == "4":
                exibir_ajuda()
            else:
                print("\n⚠️  Opção inválida. Por favor, escolha uma opção válida.")
                input("\nPressione ENTER para continuar...")
                
        except KeyboardInterrupt:
            print("\n\n👋 Encerrando sistema. Até logo!")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Erro inesperado: {e}")
            input("\nPressione ENTER para continuar...")


if __name__ == "__main__":
    main()
