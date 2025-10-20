"""
Decision Core - Sistema Nautilus One
Central de decisões e módulos de análise preditiva
"""

def main_menu():
    """Menu principal do Decision Core"""
    print("\n" + "="*50)
    print("🔱 NAUTILUS ONE - DECISION CORE")
    print("="*50)
    print("\n1. Análise FMEA")
    print("2. Forecast de Risco")
    print("3. Análise ASOG")
    print("0. Sair")
    print("\n" + "="*50)
    
    choice = input("\nEscolha uma opção: ")
    return choice

def main():
    """Função principal"""
    while True:
        choice = main_menu()
        
        if choice == "0":
            print("\n👋 Encerrando Decision Core...")
            break
        elif choice == "1":
            print("\n⚠️ Módulo FMEA em desenvolvimento...")
        elif choice == "2":
            from modules.forecast_risk import RiskForecast
            RiskForecast().analyze()
        elif choice == "3":
            print("\n⚠️ Módulo ASOG em desenvolvimento...")
        else:
            print("\n❌ Opção inválida. Tente novamente.")
        
        input("\n\nPressione ENTER para continuar...")

if __name__ == "__main__":
    main()
