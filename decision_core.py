#!/usr/bin/env python3
"""
Decision Core - Nautilus One System
Interactive menu interface for Python modules.
"""


def display_menu():
    """Display the main menu."""
    print("\n" + "="*60)
    print("🔱 NAUTILUS ONE - Decision Core")
    print("="*60)
    print("\n📊 Módulos Disponíveis:")
    print("\n1. Sistema de Gestão (placeholder)")
    print("2. Forecast de Risco Preditivo")
    print("3. Análise FMEA (placeholder)")
    print("4. Relatório ASOG (placeholder)")
    print("\n0. Sair")
    print("\n" + "="*60)


def main():
    """Main program loop."""
    while True:
        display_menu()
        
        try:
            choice = input("\n➤ Selecione uma opção: ").strip()
            
            if choice == "0":
                print("\n✅ Encerrando Decision Core. Até logo!")
                break
            
            elif choice == "1":
                print("\n⚠️  Módulo ainda não implementado.")
                input("\nPressione ENTER para continuar...")
            
            elif choice == "2":
                print("\n" + "="*60)
                print("🔮 Forecast de Risco Preditivo")
                print("="*60)
                from modules.forecast_risk import RiskForecast
                RiskForecast().analyze()
                input("\n\nPressione ENTER para continuar...")
            
            elif choice == "3":
                print("\n⚠️  Módulo ainda não implementado.")
                input("\nPressione ENTER para continuar...")
            
            elif choice == "4":
                print("\n⚠️  Módulo ainda não implementado.")
                input("\nPressione ENTER para continuar...")
            
            else:
                print("\n❌ Opção inválida. Tente novamente.")
                input("\nPressione ENTER para continuar...")
        
        except KeyboardInterrupt:
            print("\n\n✅ Encerrando Decision Core. Até logo!")
            break
        except Exception as e:
            print(f"\n❌ Erro: {e}")
            input("\nPressione ENTER para continuar...")


if __name__ == "__main__":
    main()
