"""
Decision Core - Sistema Nautilus One
Interactive menu for module selection and execution
"""


def exibir_menu():
    """Display the main menu options."""
    print("\n" + "="*60)
    print("🚢 SISTEMA NAUTILUS ONE - DECISION CORE")
    print("="*60)
    print("\nSelecione um módulo para executar:\n")
    print("1. 📊 Análise FMEA")
    print("2. 🔍 Análise ASOG")
    print("3. 📈 Forecast de Risco")
    print("4. 🤖 Assistente IA")
    print("5. 🧾 Gerar Relatório Técnico Consolidado (Auto-Report)")
    print("0. ❌ Sair")
    print("\n" + "="*60)


def executar_modulo(escolha):
    """
    Execute the selected module.
    
    Args:
        escolha: User's menu choice
    """
    if escolha == "1":
        print("\n📊 Módulo FMEA ainda não implementado.")
        print("Este módulo realizará análise de Failure Mode and Effects Analysis.")
    
    elif escolha == "2":
        print("\n🔍 Módulo ASOG ainda não implementado.")
        print("Este módulo realizará Analysis of Safety and Operational Guidelines.")
    
    elif escolha == "3":
        print("\n📈 Módulo Forecast de Risco ainda não implementado.")
        print("Este módulo realizará previsões e análise de riscos.")
    
    elif escolha == "4":
        print("\n🤖 Módulo Assistente IA ainda não implementado.")
        print("Este módulo fornecerá assistência inteligente baseada em IA.")
    
    elif escolha == "5":
        from modules.auto_report import AutoReport
        AutoReport().run()
    
    elif escolha == "0":
        print("\n👋 Encerrando Sistema Nautilus One. Até logo!")
        return False
    
    else:
        print("\n⚠️  Opção inválida. Por favor, escolha uma opção válida.")
    
    return True


def main():
    """Main function to run the Decision Core menu."""
    print("\n🚀 Iniciando Sistema Nautilus One...")
    
    continuar = True
    while continuar:
        exibir_menu()
        try:
            escolha = input("\n➤ Digite sua escolha: ").strip()
            continuar = executar_modulo(escolha)
            
            if continuar and escolha != "0":
                input("\n⏎ Pressione ENTER para continuar...")
        
        except KeyboardInterrupt:
            print("\n\n⚠️  Operação interrompida pelo usuário.")
            print("👋 Encerrando Sistema Nautilus One. Até logo!")
            break
        
        except Exception as e:
            print(f"\n❌ Erro inesperado: {e}")
            print("Por favor, tente novamente.")
            input("\n⏎ Pressione ENTER para continuar...")


if __name__ == "__main__":
    main()
