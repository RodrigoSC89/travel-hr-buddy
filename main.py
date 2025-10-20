#!/usr/bin/env python3
"""
Nautilus One Decision Core - Main Entry Point
Python-based intelligent command center for maritime, offshore, and industrial operations
"""
from modules.decision_core import DecisionCore


def main():
    """Main execution function"""
    # Initialize Decision Core
    decision_core = DecisionCore()
    
    # Load previous state if exists
    state = decision_core.load_state()
    if state:
        print(f"\n✓ Estado anterior carregado: {state['ultima_acao']} em {state['timestamp']}")
    
    # Main loop
    running = True
    while running:
        choice = decision_core.show_menu()
        
        if choice == "1":
            # Export PDF
            decision_core.export_pdf()
            
        elif choice == "2":
            # Run FMEA Audit
            decision_core.run_fmea_audit()
            
        elif choice == "3":
            # Connect to SGSO
            decision_core.connect_sgso()
            
        elif choice == "4":
            # Sub-modules menu
            sub_running = True
            while sub_running:
                sub_choice = decision_core.show_submodule_menu()
                
                if sub_choice == "1":
                    # Risk Forecast
                    decision_core.run_risk_forecast()
                    
                elif sub_choice == "2":
                    # ASOG Review
                    decision_core.run_asog_review()
                    
                elif sub_choice == "3":
                    # Return to main menu
                    sub_running = False
                    
                else:
                    print("\n⚠️  Opção inválida. Tente novamente.")
            
        elif choice == "5":
            # Exit
            print("\n👋 Encerrando Decision Core. Até logo!")
            decision_core.logger.log("Decision Core encerrado pelo usuário")
            running = False
            
        else:
            print("\n⚠️  Opção inválida. Tente novamente.")
    
    print("\n" + "=" * 60)
    print("Decision Core finalizado com sucesso!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
