#!/usr/bin/env python3
"""
Nautilus One - Decision Core
Python-based Intelligent Command Center

Entry point for the Decision Core system that provides an interactive
CLI menu for operators to execute operational modules.
"""

import sys
from modules.decision_core import DecisionCore


def display_menu():
    """Display the interactive CLI menu"""
    print("\n" + "=" * 60)
    print("🧭 NAUTILUS ONE - DECISION CORE")
    print("=" * 60)
    print("\n🔧 Deseja seguir com:\n")
    print("1. 📄 Exportar parecer da IA como PDF")
    print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
    print("3. 🔗 Conectar com SGSO/Logs")
    print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
    print("5. 🚪 Sair")
    print("=" * 60)


def display_submenu():
    """Display the sub-modules menu"""
    print("\n" + "=" * 60)
    print("🧾 SUB-MÓDULOS DISPONÍVEIS")
    print("=" * 60)
    print("\n1. 📊 Risk Forecast (Previsão de Riscos - 30 dias)")
    print("2. ✅ ASOG Review (Avaliação de Objetivos Operacionais)")
    print("3. 🔙 Voltar ao menu principal")
    print("=" * 60)


def main():
    """Main entry point"""
    print("\n🚀 Iniciando Decision Core...")
    print("⚙️  Carregando módulos operacionais...")
    
    # Initialize Decision Core
    try:
        decision_core = DecisionCore()
        print("✅ Decision Core inicializado com sucesso!\n")
    except Exception as e:
        print(f"❌ Erro ao inicializar Decision Core: {e}")
        return 1
    
    # Main loop
    while True:
        display_menu()
        
        try:
            choice = input("\n👉 Escolha uma opção (1-5): ").strip()
            
            if choice == "1":
                print("\n📄 Exportando relatório como PDF...")
                pdf_file = decision_core.export_pdf_report()
                print(f"✅ PDF exportado com sucesso: {pdf_file}")
                
            elif choice == "2":
                print("\n🧠 Executando Auditoria Técnica FMEA...")
                result = decision_core.run_fmea_audit()
                stats = result["statistics"]
                print(f"\n✅ Auditoria FMEA concluída:")
                print(f"   • Total de modos de falha: {stats['total_modes']}")
                print(f"   • Criticidade Alta: {stats['high_criticality']}")
                print(f"   • Criticidade Média: {stats['medium_criticality']}")
                print(f"   • Criticidade Baixa: {stats['low_criticality']}")
                
            elif choice == "3":
                print("\n🔗 Conectando ao SGSO...")
                result = decision_core.connect_sgso()
                if result["success"]:
                    print(f"✅ Conectado ao SGSO com sucesso!")
                    print(f"   • Logs sincronizados: {result['logs_synced']}")
                    print(f"   • Registros atualizados: {result['records_updated']}")
                else:
                    print(f"❌ Erro ao conectar: {result.get('error', 'Unknown')}")
                    
            elif choice == "4":
                # Sub-menu for additional modules
                submenu_active = True
                while submenu_active:
                    display_submenu()
                    sub_choice = input("\n👉 Escolha uma opção (1-3): ").strip()
                    
                    if sub_choice == "1":
                        print("\n📊 Executando Risk Forecast...")
                        result = decision_core.run_risk_forecast(30)
                        stats = result["statistics"]
                        print(f"\n✅ Risk Forecast concluído:")
                        print(f"   • Total de riscos: {result['total_risks']}")
                        print(f"   • Prioridade Alta: {stats['high_priority']}")
                        print(f"   • Prioridade Média: {stats['medium_priority']}")
                        print(f"   • Prioridade Baixa: {stats['low_priority']}")
                        print(f"   • Score médio de risco: {stats['average_risk_score']}")
                        
                    elif sub_choice == "2":
                        print("\n✅ Executando ASOG Review...")
                        result = decision_core.run_asog_review()
                        stats = result["statistics"]
                        print(f"\n✅ ASOG Review concluída:")
                        print(f"   • Total de áreas: {result['total_areas']}")
                        print(f"   • Conformidade média: {stats['average_compliance']}%")
                        print(f"   • Áreas conformes: {stats['compliant_areas']}")
                        print(f"   • Áreas não conformes: {stats['non_compliant_areas']}")
                        print(f"   • Status geral: {result['overall_status']}")
                        
                    elif sub_choice == "3":
                        print("\n🔙 Voltando ao menu principal...")
                        submenu_active = False
                        
                    else:
                        print("\n⚠️  Opção inválida. Tente novamente.")
                        
            elif choice == "5":
                print("\n👋 Encerrando Decision Core...")
                print("💾 Estado do sistema salvo com sucesso")
                print("🔒 Desconectando módulos...")
                print("✅ Sistema encerrado. Até logo!\n")
                return 0
                
            else:
                print("\n⚠️  Opção inválida. Por favor, escolha entre 1 e 5.")
                
        except KeyboardInterrupt:
            print("\n\n⚠️  Operação interrompida pelo usuário.")
            print("👋 Encerrando Decision Core...\n")
            return 0
            
        except Exception as e:
            print(f"\n❌ Erro durante execução: {e}")
            print("⚠️  Continuando operação...")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
