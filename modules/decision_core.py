"""
Decision Core Module - Main orchestrator for Nautilus One decision system
Manages state, routing, and execution flow for all analysis modules
"""
import json
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

# Import core services
from core.logger import log_event
from core.pdf_exporter import export_report, create_report_json
from core.sgso_connector import SGSOClient

# Import analysis modules
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast


class DecisionCore:
    """
    Decision Core - Central orchestrator for the decision system
    Manages state, module routing, and maintains audit trail
    """
    
    STATE_FILE = "nautilus_state.json"
    
    def __init__(self):
        """Initialize Decision Core"""
        self.state = self._load_state()
        self.sgso_client = None
        log_event("Decision Core initialized")
        
    def _load_state(self) -> Dict[str, Any]:
        """
        Load system state from JSON file
        
        Returns:
            State dictionary
        """
        try:
            if Path(self.STATE_FILE).exists():
                with open(self.STATE_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading state: {e}")
        
        return {
            "ultima_acao": None,
            "timestamp": None,
            "historico": []
        }
    
    def _save_state(self) -> None:
        """Save current state to JSON file"""
        try:
            with open(self.STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving state: {e}")
    
    def _update_state(self, action: str) -> None:
        """
        Update system state with new action
        
        Args:
            action: Description of the action performed
        """
        timestamp = datetime.now().isoformat()
        
        self.state["ultima_acao"] = action
        self.state["timestamp"] = timestamp
        
        if "historico" not in self.state:
            self.state["historico"] = []
        
        self.state["historico"].append({
            "acao": action,
            "timestamp": timestamp
        })
        
        # Keep only last 20 actions
        if len(self.state["historico"]) > 20:
            self.state["historico"] = self.state["historico"][-20:]
        
        self._save_state()
        log_event(f"Action performed: {action}")
    
    def processar_decisao(self) -> None:
        """
        Main interactive decision menu
        Presents options and routes to appropriate modules
        """
        while True:
            self._display_menu()
            
            try:
                escolha = input("\nEscolha uma opção (1-6): ").strip()
                
                if escolha == "1":
                    self._run_fmea_audit()
                elif escolha == "2":
                    self._run_asog_review()
                elif escolha == "3":
                    self._run_risk_forecast()
                elif escolha == "4":
                    self._connect_sgso()
                elif escolha == "5":
                    self._view_state()
                elif escolha == "6":
                    print("\n👋 Encerrando Decision Core. Até logo!")
                    log_event("Decision Core terminated by user")
                    break
                else:
                    print("\n❌ Opção inválida. Tente novamente.")
            
            except KeyboardInterrupt:
                print("\n\n👋 Encerrando Decision Core. Até logo!")
                log_event("Decision Core terminated by user (Ctrl+C)")
                break
            except Exception as e:
                print(f"\n❌ Erro: {e}")
                log_event(f"Error in decision processing: {e}")
    
    def _display_menu(self) -> None:
        """Display interactive menu"""
        print("\n" + "=" * 80)
        print("🧠 NAUTILUS ONE - DECISION CORE")
        print("=" * 80)
        print("\nMódulos Disponíveis:")
        print("  1. 🔍 Rodar Auditoria FMEA (Análise de Modos de Falha)")
        print("  2. ✅ Rodar Revisão ASOG (Segurança Operacional)")
        print("  3. 📊 Rodar Previsão de Riscos (Análise Preditiva)")
        print("  4. 🔗 Conectar ao SGSO (Sistema de Gestão)")
        print("  5. 📋 Ver Status do Sistema")
        print("  6. 🚪 Sair")
        print("=" * 80)
        
        if self.state.get("ultima_acao"):
            print(f"\n📌 Última ação: {self.state['ultima_acao']}")
            print(f"   Timestamp: {self.state.get('timestamp', 'N/A')}")
    
    def _run_fmea_audit(self) -> None:
        """Execute FMEA audit and handle results"""
        print("\n🔍 Iniciando Auditoria FMEA...")
        log_event("FMEA Audit started")
        
        try:
            results = run_fmea_audit()
            
            # Save results to JSON
            json_file = create_report_json("fmea_atual", results)
            
            # Update state
            self._update_state("Rodar Auditoria FMEA")
            
            # Ask if user wants to export
            export = input("\n📄 Deseja exportar o relatório? (s/n): ").strip().lower()
            if export == 's':
                format_choice = input("Formato (pdf/txt): ").strip().lower()
                if format_choice in ['pdf', 'txt']:
                    export_file = export_report(json_file, format_choice)
                    if export_file:
                        print(f"✓ Relatório exportado: {export_file}")
                        log_event(f"FMEA report exported: {export_file}")
            
            # Sync with SGSO if connected
            if self.sgso_client and self.sgso_client.connected:
                sync = input("\n🔗 Sincronizar com SGSO? (s/n): ").strip().lower()
                if sync == 's':
                    self.sgso_client.sync_analysis("fmea", results)
                    log_event("FMEA results synced with SGSO")
            
            print("\n✓ Auditoria FMEA concluída com sucesso!")
            
        except Exception as e:
            print(f"\n❌ Erro ao executar auditoria FMEA: {e}")
            log_event(f"Error in FMEA audit: {e}")
    
    def _run_asog_review(self) -> None:
        """Execute ASOG review and handle results"""
        print("\n✅ Iniciando Revisão ASOG...")
        log_event("ASOG Review started")
        
        try:
            results = run_asog_review()
            
            # Save results to JSON
            json_file = create_report_json("asog_atual", results)
            
            # Update state
            self._update_state("Rodar Revisão ASOG")
            
            # Ask if user wants to export
            export = input("\n📄 Deseja exportar o relatório? (s/n): ").strip().lower()
            if export == 's':
                format_choice = input("Formato (pdf/txt): ").strip().lower()
                if format_choice in ['pdf', 'txt']:
                    export_file = export_report(json_file, format_choice)
                    if export_file:
                        print(f"✓ Relatório exportado: {export_file}")
                        log_event(f"ASOG report exported: {export_file}")
            
            # Sync with SGSO if connected
            if self.sgso_client and self.sgso_client.connected:
                sync = input("\n🔗 Sincronizar com SGSO? (s/n): ").strip().lower()
                if sync == 's':
                    self.sgso_client.sync_analysis("asog", results)
                    log_event("ASOG results synced with SGSO")
            
            print("\n✓ Revisão ASOG concluída com sucesso!")
            
        except Exception as e:
            print(f"\n❌ Erro ao executar revisão ASOG: {e}")
            log_event(f"Error in ASOG review: {e}")
    
    def _run_risk_forecast(self) -> None:
        """Execute risk forecast and handle results"""
        print("\n📊 Iniciando Previsão de Riscos...")
        
        try:
            # Ask for timeframe
            timeframe_input = input("Período de previsão em dias (padrão: 30): ").strip()
            timeframe = int(timeframe_input) if timeframe_input else 30
            
            log_event(f"Risk Forecast started (timeframe: {timeframe} days)")
            
            results = run_risk_forecast(timeframe)
            
            # Save results to JSON
            json_file = create_report_json("forecast_atual", results)
            
            # Update state
            self._update_state(f"Rodar Previsão de Riscos ({timeframe} dias)")
            
            # Ask if user wants to export
            export = input("\n📄 Deseja exportar o relatório? (s/n): ").strip().lower()
            if export == 's':
                format_choice = input("Formato (pdf/txt): ").strip().lower()
                if format_choice in ['pdf', 'txt']:
                    export_file = export_report(json_file, format_choice)
                    if export_file:
                        print(f"✓ Relatório exportado: {export_file}")
                        log_event(f"Risk forecast report exported: {export_file}")
            
            # Sync with SGSO if connected
            if self.sgso_client and self.sgso_client.connected:
                sync = input("\n🔗 Sincronizar com SGSO? (s/n): ").strip().lower()
                if sync == 's':
                    self.sgso_client.sync_analysis("forecast", results)
                    log_event("Risk forecast results synced with SGSO")
            
            print("\n✓ Previsão de Riscos concluída com sucesso!")
            
        except ValueError:
            print("\n❌ Erro: Valor inválido para período. Use um número inteiro.")
        except Exception as e:
            print(f"\n❌ Erro ao executar previsão de riscos: {e}")
            log_event(f"Error in risk forecast: {e}")
    
    def _connect_sgso(self) -> None:
        """Connect to SGSO system"""
        print("\n🔗 Conectando ao SGSO...")
        log_event("SGSO connection attempt")
        
        try:
            if not self.sgso_client:
                self.sgso_client = SGSOClient()
            
            if self.sgso_client.connect():
                self._update_state("Conectar ao SGSO")
                print("\n✓ Conexão com SGSO estabelecida!")
                
                # Display status
                status = self.sgso_client.get_status()
                print(f"\nStatus SGSO:")
                print(f"  Conectado: {status['connected']}")
                print(f"  Endpoint: {status['endpoint']}")
                print(f"  Session ID: {status['session_id']}")
            else:
                print("\n❌ Falha ao conectar com SGSO")
                
        except Exception as e:
            print(f"\n❌ Erro ao conectar com SGSO: {e}")
            log_event(f"Error connecting to SGSO: {e}")
    
    def _view_state(self) -> None:
        """View system status and state"""
        print("\n📋 STATUS DO SISTEMA")
        print("=" * 80)
        
        # Current state
        print(f"\nÚltima ação: {self.state.get('ultima_acao', 'Nenhuma')}")
        print(f"Timestamp: {self.state.get('timestamp', 'N/A')}")
        
        # SGSO status
        if self.sgso_client:
            status = self.sgso_client.get_status()
            print(f"\nSGSO:")
            print(f"  Status: {'Conectado ✓' if status['connected'] else 'Desconectado'}")
            if status['connected']:
                print(f"  Session: {status['session_id']}")
        else:
            print(f"\nSGSO: Não inicializado")
        
        # History
        if self.state.get("historico"):
            print(f"\nHistórico (últimas 5 ações):")
            for i, item in enumerate(self.state["historico"][-5:], 1):
                print(f"  {i}. {item['acao']} - {item['timestamp']}")
        
        print("=" * 80)
        
        log_event("System state viewed")


def main():
    """Main entry point for Decision Core"""
    print("\n🚀 Iniciando Nautilus One Decision Core...")
    
    try:
        nautilus = DecisionCore()
        nautilus.processar_decisao()
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        log_event(f"Fatal error: {e}")


if __name__ == "__main__":
    main()
