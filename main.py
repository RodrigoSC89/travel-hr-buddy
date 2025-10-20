"""
Decision Core CLI - Nautilus One System
Interactive menu system for Nautilus One operations
"""

import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from modules.bridge_link import BridgeLink
from core.logger import log_event


def exibir_menu():
    """Display the main menu"""
    print("\n" + "="*60)
    print("         🚢 NAUTILUS ONE - DECISION CORE")
    print("="*60)
    print("\n📋 Selecione uma opção:")
    print("\n1. 📊 Executar análise FMEA")
    print("2. 🔍 Realizar auditoria ASOG")
    print("3. 📈 Gerar forecast de risco")
    print("4. 📄 Criar auto-relatório do sistema")
    print("5. 📋 Visualizar relatórios disponíveis")
    print("6. 🌐 Transmitir relatórios ao SGSO (BridgeLink)")
    print("0. 🚪 Sair")
    print("\n" + "="*60)


def executar_opcao(escolha):
    """
    Execute the selected menu option
    
    Args:
        escolha (str): User's menu choice
        
    Returns:
        bool: False if user wants to exit, True otherwise
    """
    if escolha == "1":
        print("\n📊 Executando análise FMEA...")
        log_event("FMEA analysis requested")
        print("⚠️ Funcionalidade em desenvolvimento.")
        
    elif escolha == "2":
        print("\n🔍 Realizando auditoria ASOG...")
        log_event("ASOG audit requested")
        print("⚠️ Funcionalidade em desenvolvimento.")
        
    elif escolha == "3":
        print("\n📈 Gerando forecast de risco...")
        log_event("Risk forecast requested")
        print("⚠️ Funcionalidade em desenvolvimento.")
        
    elif escolha == "4":
        print("\n📄 Criando auto-relatório do sistema...")
        log_event("Auto-report requested")
        print("⚠️ Funcionalidade em desenvolvimento.")
        
    elif escolha == "5":
        print("\n📋 Visualizando relatórios disponíveis...")
        log_event("Report list requested")
        print("⚠️ Funcionalidade em desenvolvimento.")
        
    elif escolha == "6":
        try:
            bridge = BridgeLink()
            bridge.sincronizar()
        except Exception as e:
            print(f"❌ Erro ao executar BridgeLink: {e}")
            log_event(f"BridgeLink error: {e}")
            
    elif escolha == "0":
        print("\n👋 Encerrando Nautilus One Decision Core...")
        log_event("System shutdown requested")
        return False
        
    else:
        print("\n❌ Opção inválida. Por favor, selecione uma opção válida.")
    
    return True


def main():
    """Main function to run the Decision Core CLI"""
    print("\n🚀 Iniciando Nautilus One Decision Core...")
    log_event("Nautilus One Decision Core started")
    
    continuar = True
    try:
        while continuar:
            exibir_menu()
            escolha = input("\n➡️ Digite sua escolha: ").strip()
            continuar = executar_opcao(escolha)
            
            if continuar:
                input("\n⏎ Pressione ENTER para continuar...")
    
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupção detectada. Encerrando...")
        log_event("System interrupted by user (Ctrl+C)")
    
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        log_event(f"Unexpected error: {e}")
    
    finally:
        print("\n✅ Sistema encerrado com sucesso.")
        log_event("System shutdown complete")


if __name__ == "__main__":
    main()
