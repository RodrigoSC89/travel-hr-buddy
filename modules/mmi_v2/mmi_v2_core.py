"""
MMI v2 Core - Marine Maintenance Intelligence 2.0
Complete system for technical management and embedded maintenance
"""
from modules.mmi_v2.asset_tree import AssetTree
from modules.mmi_v2.maintenance_planner import MaintenancePlanner
from modules.mmi_v2.cost_control import CostControl
from modules.mmi_v2.llm_assistant import NautilusLLM
from core.logger import log_event


class MMIv2:
    """
    MMI v2 – Marine Maintenance Intelligence 2.0
    Complete technical management and embedded maintenance system.
    
    Features:
    - 🌳 Hierarchical Asset Tree
    - 🧭 Intelligent Preventive Plans (auto-generated)
    - ⚙️ Parts and technical consumption control
    - 💰 Cost and man-hours management
    - 🧠 Embedded LLM for queries and automatic technical reports
    
    Modular and ready for integration with SGSO, Workflow and BridgeLink.
    """
    
    def __init__(self):
        """Initialize MMI v2 system"""
        log_event("Inicializando MMI v2 - Marine Maintenance Intelligence 2.0")
        
        try:
            self.asset_tree = AssetTree()
            self.planner = MaintenancePlanner(self.asset_tree)
            self.costs = CostControl()
            self.assistant = NautilusLLM()
            
            log_event("MMI v2 inicializado com sucesso")
            print("\n✅ MMI v2 inicializado com sucesso!")
        except Exception as e:
            log_event(f"Erro ao inicializar MMI v2: {str(e)}", "ERROR")
            raise
    
    def exibir_banner(self) -> None:
        """Display system banner"""
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              ⚓ NAUTILUS ONE - MMI v2 PRO EDITION ⚓              ║
║                                                                   ║
║         Marine Maintenance Intelligence 2.0                       ║
║         Sistema Completo de Gestão Técnica Embarcada            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

🔱 Evolução Total do MMI - A Nova Era do Nautilus One

Características:
  🌳 Árvore hierárquica de ativos (Asset Tree)
  🧭 Planos preventivos inteligentes (auto-gerados)
  ⚙️  Controle de peças e consumo técnico
  💰 Gestão de custos e horas-homem
  🧠 LLM embarcada para consultas técnicas

Modular e pronto para integração com SGSO, Workflow e BridgeLink.
        """)
    
    def menu(self) -> None:
        """Main system menu"""
        self.exibir_banner()
        
        while True:
            try:
                print("\n⚙️  MMI v2 – Marine Maintenance Intelligence 2.0")
                print("═" * 60)
                print("1. 🌳 Gerenciar Árvore de Ativos")
                print("2. 🧭 Gerenciar Planos Preventivos")
                print("3. 💰 Controle de Custos e Peças")
                print("4. 🧠 Consultar IA Técnica (LLM)")
                print("5. 📊 Gerar Relatório Mensal")
                print("6. ℹ️  Sobre o MMI v2")
                print("0. ⏹  Sair")
                print("═" * 60)
                
                opcao = input("\n⚡ Selecione uma opção: ").strip()
                
                if opcao == "1":
                    self.asset_tree.menu()
                elif opcao == "2":
                    self.planner.menu()
                elif opcao == "3":
                    self.costs.menu()
                elif opcao == "4":
                    self.assistant.chat()
                elif opcao == "5":
                    print(self.assistant.gerar_relatorio("mensal"))
                elif opcao == "6":
                    self.exibir_sobre()
                elif opcao == "0":
                    print("\n👋 Encerrando MMI v2...")
                    log_event("MMI v2 encerrado pelo usuário")
                    print("⚓ Nautilus One - Até a próxima!")
                    break
                else:
                    print("❌ Opção inválida. Tente novamente.")
                    
            except KeyboardInterrupt:
                print("\n\n⏹  Operação cancelada pelo usuário.")
                print("👋 Encerrando MMI v2...")
                log_event("MMI v2 encerrado (Ctrl+C)")
                break
            except Exception as e:
                log_event(f"Erro no menu principal: {str(e)}", "ERROR")
                print(f"\n❌ Erro: {str(e)}")
                print("Tente novamente ou pressione Ctrl+C para sair.")
    
    def exibir_sobre(self) -> None:
        """Display system information"""
        print("""
╔═══════════════════════════════════════════════════════════════════╗
║                         SOBRE O MMI v2                            ║
╚═══════════════════════════════════════════════════════════════════╝

📋 MMI v2 - Marine Maintenance Intelligence 2.0

O MMI v2 representa a evolução completa do sistema de manutenção
inteligente para embarcações. Desenvolvido para deixar o TM Master
comendo poeira no costado, o MMI v2 é a espinha dorsal do sistema
técnico embarcado do Nautilus One.

🎯 FUNCIONALIDADES PRINCIPAIS:

  🌳 Árvore de Ativos
     Estrutura hierárquica completa de equipamentos e sistemas:
     • Motor e propulsão
     • DP (Dynamic Positioning)
     • Sistemas elétricos
     • Sistemas hidráulicos

  🧭 Planos Preventivos Inteligentes
     Manutenções planejadas com base em:
     • Histórico de uso
     • Intervalos configuráveis
     • Auto-geração de tarefas
     • Alertas de vencimento

  💰 Controle de Custos
     Gestão completa de:
     • Material e peças
     • Mão de obra (horas-homem)
     • Análise por OS
     • Relatórios financeiros

  🧠 Assistente IA (LLM)
     Inteligência embarcada para:
     • Consultas técnicas
     • Análise de histórico
     • Recomendações automáticas
     • Geração de relatórios

🔗 INTEGRAÇÃO:

  O MMI v2 está pronto para integração com:
  • SGSO - Sistema de Gestão de Segurança Operacional
  • Workflow - Fluxos de trabalho inteligentes
  • BridgeLink - Comunicação ponte-praça de máquinas

📦 VERSÃO: 2.0.0
👨‍💻 DESENVOLVIDO POR: Nautilus AI Team
📅 DATA: Outubro 2025

⚓ Nautilus One Pro Edition - Tecnologia Embarcada de Ponta
        """)


def main():
    """Main entry point"""
    try:
        mmi = MMIv2()
        mmi.menu()
    except Exception as e:
        log_event(f"Erro fatal: {str(e)}", "ERROR")
        print(f"\n❌ Erro fatal ao inicializar o sistema: {str(e)}")
        print("Verifique os logs para mais detalhes.")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
