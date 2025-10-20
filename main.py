#!/usr/bin/env python3
"""
Sistema Nautilus One - Decision Core
Menu principal para operação dos módulos do sistema.
"""

from core.logger import log_event


def exibir_menu():
    """Exibe o menu principal do sistema."""
    print("\n" + "="*60)
    print("🔱 NAUTILUS ONE - DECISION CORE")
    print("="*60)
    print("1. 🔍 FMEA Auditor - Diagnóstico e análise de falhas")
    print("2. ✅ ASOG Review - Verificação operacional")
    print("3. 📊 Forecast de Risco - Previsão preditiva")
    print("4. 📝 Auto-Report - Consolidação e geração de relatório")
    print("5. 🎯 Executar todos os módulos")
    print("6. 🌐 Transmitir relatórios ao SGSO (BridgeLink)")
    print("0. ❌ Sair")
    print("="*60)


def main():
    """Função principal do Decision Core."""
    log_event("Sistema Nautilus One iniciado")
    
    while True:
        exibir_menu()
        escolha = input("\n➤ Escolha uma opção: ").strip()
        
        if escolha == "0":
            print("\n👋 Encerrando sistema Nautilus One...")
            log_event("Sistema Nautilus One encerrado")
            break
            
        elif escolha == "1":
            print("\n🔍 Iniciando FMEA Auditor...")
            log_event("FMEA Auditor solicitado")
            print("⚠️ Módulo FMEA Auditor em desenvolvimento")
            
        elif escolha == "2":
            print("\n✅ Iniciando ASOG Review...")
            log_event("ASOG Review solicitado")
            print("⚠️ Módulo ASOG Review em desenvolvimento")
            
        elif escolha == "3":
            print("\n📊 Iniciando Forecast de Risco...")
            log_event("Forecast de Risco solicitado")
            print("⚠️ Módulo Forecast de Risco em desenvolvimento")
            
        elif escolha == "4":
            print("\n📝 Iniciando Auto-Report...")
            log_event("Auto-Report solicitado")
            print("⚠️ Módulo Auto-Report em desenvolvimento")
            
        elif escolha == "5":
            print("\n🎯 Executando todos os módulos...")
            log_event("Execução completa solicitada")
            print("⚠️ Execução completa em desenvolvimento")
            
        elif escolha == "6":
            print("\n🌐 Iniciando transmissão BridgeLink...")
            log_event("BridgeLink solicitado")
            try:
                from modules.bridge_link import BridgeLink
                bridge = BridgeLink()
                bridge.sincronizar()
            except Exception as e:
                print(f"❌ Erro ao executar BridgeLink: {e}")
                log_event(f"Erro no BridgeLink: {e}")
                
        else:
            print("\n❌ Opção inválida! Tente novamente.")
            
        input("\n⏸️  Pressione ENTER para continuar...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupção detectada pelo usuário")
        log_event("Sistema interrompido pelo usuário (Ctrl+C)")
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        log_event(f"Erro fatal no sistema: {e}")
