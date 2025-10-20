"""
Decision Core - Main orchestrator for Nautilus One decision system.
Central decision engine that manages state, routing, and execution flow.
"""

import json
from datetime import datetime
from typing import Optional, Dict

from core.logger import log_event
from core.pdf_exporter import export_fmea_report
from core.sgso_connector import SGSOClient
from modules import audit_fmea, asog_review, forecast_risk


class DecisionCore:
    """Main decision engine for Nautilus One."""
    
    STATE_FILE = "nautilus_state.json"
    
    def __init__(self):
        """Initialize Decision Core."""
        self.state = self._load_state()
        self.sgso_client = SGSOClient()
        log_event("Decision Core inicializado")
    
    def processar_decisao(self) -> None:
        """
        Process decision through interactive menu.
        Presents operational modes and routes to appropriate modules.
        """
        while True:
            self._display_menu()
            escolha = input("\nEscolha uma opção (1-5): ").strip()
            
            if escolha == "1":
                self._executar_auditoria_fmea()
            elif escolha == "2":
                self._executar_revisao_asog()
            elif escolha == "3":
                self._executar_previsao_risco()
            elif escolha == "4":
                self._verificar_status_sistema()
            elif escolha == "5":
                print("\nEncerrando Nautilus One Decision Core...")
                log_event("Decision Core encerrado")
                break
            else:
                print("\n⚠️ Opção inválida. Tente novamente.")
            
            input("\nPressione ENTER para continuar...")
    
    def _display_menu(self) -> None:
        """Display interactive menu."""
        print("\n" + "="*80)
        print("NAUTILUS ONE - DECISION CORE")
        print("="*80)
        print("\nModos Operacionais:")
        print("  1. Rodar Auditoria FMEA")
        print("  2. Executar Revisão ASOG")
        print("  3. Gerar Previsão de Riscos")
        print("  4. Verificar Status do Sistema")
        print("  5. Sair")
        print("\n" + "-"*80)
        
        if self.state.get("ultima_acao"):
            print(f"Última ação: {self.state['ultima_acao']}")
            print(f"Timestamp: {self.state.get('timestamp', 'N/A')}")
            print("-"*80)
    
    def _executar_auditoria_fmea(self) -> None:
        """Execute FMEA audit module."""
        print("\n🔍 Iniciando Auditoria FMEA...")
        log_event("Iniciando Auditoria FMEA")
        
        try:
            resultado = audit_fmea.run()
            
            # Save to file
            filename = "relatorio_fmea_atual.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(resultado, f, indent=2, ensure_ascii=False)
            
            # Export report
            export_fmea_report(resultado)
            
            # Update state
            self._update_state("Rodar Auditoria FMEA")
            
            log_event(f"Auditoria FMEA concluída. Total: {resultado['total_modos']} modos de falha")
            print(f"\n✅ Auditoria FMEA concluída com sucesso!")
            print(f"📄 Relatório salvo em: {filename}")
            
        except Exception as e:
            error_msg = f"Erro ao executar Auditoria FMEA: {e}"
            print(f"\n❌ {error_msg}")
            log_event(error_msg)
    
    def _executar_revisao_asog(self) -> None:
        """Execute ASOG review module."""
        print("\n🔍 Iniciando Revisão ASOG...")
        log_event("Iniciando Revisão ASOG")
        
        try:
            resultado = asog_review.run()
            
            # Save to file
            filename = "relatorio_asog_atual.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(resultado, f, indent=2, ensure_ascii=False)
            
            # Update state
            self._update_state("Executar Revisão ASOG")
            
            taxa = resultado['resumo']['taxa_conformidade']
            log_event(f"Revisão ASOG concluída. Taxa de conformidade: {taxa}%")
            print(f"\n✅ Revisão ASOG concluída com sucesso!")
            print(f"📄 Relatório salvo em: {filename}")
            
        except Exception as e:
            error_msg = f"Erro ao executar Revisão ASOG: {e}"
            print(f"\n❌ {error_msg}")
            log_event(error_msg)
    
    def _executar_previsao_risco(self) -> None:
        """Execute risk forecast module."""
        print("\n🔍 Gerando Previsão de Riscos...")
        log_event("Iniciando Previsão de Riscos")
        
        try:
            resultado = forecast_risk.run()
            
            # Save to file
            filename = "relatorio_forecast_atual.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(resultado, f, indent=2, ensure_ascii=False)
            
            # Update state
            self._update_state("Gerar Previsão de Riscos")
            
            total_previsoes = len(resultado['previsoes'])
            log_event(f"Previsão de Riscos concluída. Total: {total_previsoes} previsões")
            print(f"\n✅ Previsão de Riscos concluída com sucesso!")
            print(f"📄 Relatório salvo em: {filename}")
            
        except Exception as e:
            error_msg = f"Erro ao executar Previsão de Riscos: {e}"
            print(f"\n❌ {error_msg}")
            log_event(error_msg)
    
    def _verificar_status_sistema(self) -> None:
        """Verify system status."""
        print("\n🔍 Verificando Status do Sistema...")
        log_event("Verificando status do sistema")
        
        print("\n" + "-"*80)
        print("STATUS DO SISTEMA")
        print("-"*80)
        
        # Check SGSO connection
        print("SGSO Client:")
        if self.sgso_client.is_connected():
            print("  ✅ Conectado")
            print(f"  Tempo de conexão: {self.sgso_client.connection_time}")
        else:
            print("  ⚠️ Não conectado")
            print("  Tentando conectar...")
            if self.sgso_client.connect():
                print("  ✅ Conexão estabelecida")
            else:
                print("  ❌ Falha na conexão")
        
        # Check state persistence
        print("\nState Management:")
        if self.state:
            print("  ✅ Estado carregado")
            print(f"  Última ação: {self.state.get('ultima_acao', 'Nenhuma')}")
        else:
            print("  ⚠️ Sem estado salvo")
        
        # Check log file
        print("\nSistema de Logs:")
        try:
            from core.logger import get_logs
            logs = get_logs(5)
            if logs:
                print(f"  ✅ Logs ativos ({len(logs)} entradas recentes)")
            else:
                print("  ⚠️ Nenhum log encontrado")
        except Exception as e:
            print(f"  ❌ Erro ao verificar logs: {e}")
        
        print("-"*80)
        
        # Update state
        self._update_state("Verificar Status do Sistema")
    
    def _load_state(self) -> Dict:
        """
        Load system state from persistence file.
        
        Returns:
            State dictionary
        """
        try:
            with open(self.STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        except Exception as e:
            print(f"Erro ao carregar estado: {e}")
            return {}
    
    def _save_state(self) -> None:
        """Save system state to persistence file."""
        try:
            with open(self.STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erro ao salvar estado: {e}")
    
    def _update_state(self, acao: str) -> None:
        """
        Update system state with new action.
        
        Args:
            acao: Action description
        """
        self.state = {
            "ultima_acao": acao,
            "timestamp": datetime.now().isoformat()
        }
        self._save_state()


def main():
    """Entry point for Decision Core module."""
    nautilus = DecisionCore()
    nautilus.processar_decisao()


if __name__ == "__main__":
    main()
