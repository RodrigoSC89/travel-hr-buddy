"""
Sistema Nautilus One - Decision Core
Menu principal para acesso aos módulos do sistema
"""


def exibir_menu():
    """Exibe o menu principal do sistema"""
    print("\n" + "="*60)
    print("🚢 SISTEMA NAUTILUS ONE - DECISION CORE")
    print("="*60)
    print("1. 📊 Módulo FMEA")
    print("2. 🔍 Módulo ASOG")
    print("3. 📈 Módulo Forecast de Risco")
    print("4. 🔄 Sincronizar Dados")
    print("5. 🧾 Gerar Relatório Técnico Consolidado (Auto-Report)")
    print("0. ❌ Sair")
    print("="*60)


def main():
    """Função principal do sistema"""
    while True:
        exibir_menu()
        escolha = input("\n👉 Escolha uma opção: ").strip()

        if escolha == "0":
            print("\n✅ Encerrando Sistema Nautilus One...")
            print("👋 Até logo!\n")
            break

        elif escolha == "1":
            print("\n📊 Módulo FMEA - Em desenvolvimento")
            print("Este módulo será implementado em breve.")

        elif escolha == "2":
            print("\n🔍 Módulo ASOG - Em desenvolvimento")
            print("Este módulo será implementado em breve.")

        elif escolha == "3":
            print("\n📈 Módulo Forecast de Risco - Em desenvolvimento")
            print("Este módulo será implementado em breve.")

        elif escolha == "4":
            print("\n🔄 Sincronização de Dados - Em desenvolvimento")
            print("Este módulo será implementado em breve.")

        elif escolha == "5":
            from modules.auto_report import AutoReport
            AutoReport().run()

        else:
            print("\n⚠️  Opção inválida! Por favor, escolha uma opção válida.")

        if escolha != "0":
            input("\nPressione ENTER para continuar...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Sistema interrompido pelo usuário.")
        print("👋 Até logo!\n")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        print("Por favor, contate o suporte técnico.\n")
