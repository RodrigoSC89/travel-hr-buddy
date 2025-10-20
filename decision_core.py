#!/usr/bin/env python3
"""
Decision Core - Interface CLI para Sistema Nautilus One
Interface interativa de linha de comando para análise de risco

Versão: 1.0.0
Compatibilidade: Python 3.6+
"""

import sys
from modules.forecast_risk import RiskForecast
from core.logger import log


def exibir_menu():
    """Exibe o menu principal da interface CLI"""
    print("\n" + "="*60)
    print("🔱 NAUTILUS ONE - Sistema de Análise de Risco")
    print("="*60)
    print("\nMódulos Disponíveis:")
    print("  1. Visualizar dados FMEA")
    print("  2. Executar Forecast de Risco Preditivo")
    print("  3. Verificar Status ASOG")
    print("  4. Gerar Relatório Completo")
    print("  0. Sair")
    print("\n" + "-"*60)


def visualizar_fmea():
    """Exibe os dados FMEA carregados"""
    print("\n📋 Carregando dados FMEA...")
    forecast = RiskForecast()
    
    if not forecast.carregar_dados():
        print("❌ Erro ao carregar dados FMEA")
        return
    
    if not forecast.dados_fmea or 'sistemas_analisados' not in forecast.dados_fmea:
        print("❌ Nenhum dado FMEA disponível")
        return
    
    print(f"\n🔍 Sistema: {forecast.dados_fmea.get('sistema', 'N/A')}")
    print(f"📅 Data de Análise: {forecast.dados_fmea.get('data_analise', 'N/A')}\n")
    
    print(f"{'ID':<5} {'Sistema':<35} {'RPN':<8} {'S':<3} {'O':<3} {'D':<3}")
    print("-" * 60)
    
    for sistema in forecast.dados_fmea['sistemas_analisados']:
        print(f"{sistema['id']:<5} {sistema['nome']:<35} {sistema['rpn']:<8} "
              f"{sistema['severidade']:<3} {sistema['ocorrencia']:<3} {sistema['deteccao']:<3}")
    
    print("\n📊 Legenda: S=Severidade | O=Ocorrência | D=Detecção | RPN=S×O×D")


def executar_forecast():
    """Executa a análise de forecast de risco"""
    print("\n🔮 Iniciando Análise Preditiva de Risco...\n")
    
    forecast = RiskForecast()
    resultado = forecast.gerar_previsao()
    
    # Salvar relatório
    if forecast.salvar_relatorio(resultado):
        log("Relatório salvo com sucesso")
    
    # Exibir resultados
    print("\n" + "="*60)
    print("📊 RESULTADO DO FORECAST DE RISCO")
    print("="*60)
    print(f"\n🕐 Timestamp: {resultado['timestamp']}")
    print(f"\n📈 RISCO PREVISTO: {resultado['risco_previsto']}")
    print(f"   RPN Médio: {resultado['rpn_medio']}")
    print(f"   Variabilidade (σ): {resultado['variabilidade']}")
    print(f"   Status Operacional ASOG: {resultado['status_operacional']}")
    print(f"\n💡 RECOMENDAÇÃO:")
    print(f"   {resultado['recomendacao']}")
    print("\n" + "="*60)
    print(f"\n💾 Relatório JSON salvo em: forecast_risco.json")


def verificar_asog():
    """Verifica e exibe o status ASOG"""
    print("\n🔍 Verificando Conformidade ASOG...")
    
    forecast = RiskForecast()
    
    if not forecast.carregar_dados():
        print("❌ Erro ao carregar dados ASOG")
        return
    
    if not forecast.dados_asog or 'parametros_operacionais' not in forecast.dados_asog:
        print("❌ Nenhum dado ASOG disponível")
        return
    
    print(f"\n📋 Relatório: {forecast.dados_asog.get('relatorio', 'N/A')}")
    print(f"🚢 Embarcação: {forecast.dados_asog.get('embarcacao', 'N/A')}")
    print(f"📅 Data: {forecast.dados_asog.get('data_verificacao', 'N/A')}\n")
    
    print(f"{'Parâmetro':<45} {'Valor':<12} {'Limite':<12} {'Status':<15}")
    print("-" * 85)
    
    for param in forecast.dados_asog['parametros_operacionais']:
        status_icon = "✅" if param['status'] == 'conforme' else "❌"
        print(f"{param['parametro']:<45} {str(param['valor_atual']) + ' ' + param['unidade']:<12} "
              f"{'≥ ' + str(param['limite_minimo']):<12} {status_icon + ' ' + param['status']:<15}")
    
    status_geral = forecast.verificar_status_asog()
    print("\n" + "="*60)
    print(f"Status Geral: {'✅ CONFORME' if status_geral == 'conforme' else '❌ NÃO CONFORME'}")
    print("="*60)


def gerar_relatorio_completo():
    """Gera e exibe relatório completo com todas as análises"""
    print("\n📊 Gerando Relatório Completo...\n")
    
    # Executar forecast
    executar_forecast()
    
    # Exibir FMEA
    print("\n")
    visualizar_fmea()
    
    # Exibir ASOG
    print("\n")
    verificar_asog()
    
    print("\n✅ Relatório completo gerado com sucesso!")


def main():
    """Função principal da interface CLI"""
    while True:
        exibir_menu()
        
        try:
            opcao = input("\nEscolha uma opção: ").strip()
            
            if opcao == "0":
                print("\n👋 Encerrando sistema... Até logo!")
                sys.exit(0)
            elif opcao == "1":
                visualizar_fmea()
            elif opcao == "2":
                executar_forecast()
            elif opcao == "3":
                verificar_asog()
            elif opcao == "4":
                gerar_relatorio_completo()
            else:
                print("\n❌ Opção inválida! Escolha entre 0-4.")
                
            input("\n⏎ Pressione ENTER para continuar...")
            
        except KeyboardInterrupt:
            print("\n\n👋 Sistema interrompido pelo usuário. Até logo!")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Erro inesperado: {e}")
            log(f"Erro na interface CLI: {e}")
            input("\n⏎ Pressione ENTER para continuar...")


if __name__ == "__main__":
    main()
