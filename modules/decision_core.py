"""
Decision Core Module - Main orchestrator for Nautilus One decision system

This module serves as the "logical brain" of the system, presenting an interactive CLI menu,
managing state persistence, routing execution to appropriate analysis modules,
and maintaining complete audit trail of all actions.
"""

import json
import os
import datetime
from core.logger import logger
from core.pdf_exporter import exporter
from core.sgso_connector import connector
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast


class DecisionCore:
    """Main decision engine orchestrator"""
    
    def __init__(self, state_file="nautilus_state.json"):
        """
        Initialize the Decision Core.
        
        Args:
            state_file (str): Path to the state persistence file
        """
        self.state_file = state_file
        self.state = self._load_state()
        logger.info("Decision Core initialized")
    
    def _load_state(self):
        """
        Load system state from file.
        
        Returns:
            dict: System state
        """
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading state: {e}")
                return self._create_default_state()
        else:
            return self._create_default_state()
    
    def _create_default_state(self):
        """
        Create default system state.
        
        Returns:
            dict: Default state
        """
        return {
            "created": datetime.datetime.now().isoformat(),
            "last_updated": datetime.datetime.now().isoformat(),
            "executions": [],
            "context": {}
        }
    
    def _save_state(self):
        """Save system state to file"""
        self.state["last_updated"] = datetime.datetime.now().isoformat()
        try:
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2, ensure_ascii=False)
            logger.info("State saved successfully")
        except Exception as e:
            logger.error(f"Error saving state: {e}")
    
    def processar_decisao(self):
        """
        Present interactive CLI menu and process user decisions.
        """
        while True:
            self._show_menu()
            choice = input("\nEscolha uma opção: ").strip()
            
            if choice == "1":
                self._run_fmea()
            elif choice == "2":
                self._run_asog()
            elif choice == "3":
                self._run_forecast()
            elif choice == "4":
                self._export_results()
            elif choice == "5":
                self._connect_sgso()
            elif choice == "6":
                self._view_history()
            elif choice == "0":
                logger.info("Exiting Decision Core")
                break
            else:
                print("Opção inválida. Tente novamente.")
    
    def _show_menu(self):
        """Display the interactive menu"""
        print("\n" + "=" * 80)
        print("NAUTILUS ONE - DECISION CORE")
        print("=" * 80)
        print("1. Executar Auditoria FMEA")
        print("2. Executar Revisão ASOG")
        print("3. Executar Forecast de Riscos")
        print("4. Exportar Resultados (JSON/PDF/TXT)")
        print("5. Conectar ao Sistema SGSO")
        print("6. Ver Histórico de Execuções")
        print("0. Sair")
        print("=" * 80)
    
    def _run_fmea(self):
        """Execute FMEA audit"""
        logger.info("Starting FMEA audit")
        print("\nExecutando Auditoria FMEA...")
        
        try:
            results = run_fmea_audit()
            self._record_execution("FMEA Audit", results)
            
            print(f"\n✅ Auditoria FMEA concluída!")
            print(f"Modos de falha identificados: {results['summary']['total_modos_falha']}")
            print(f"Riscos críticos: {results['summary']['critico']}")
            print(f"Riscos altos: {results['summary']['alto']}")
            
            logger.info("FMEA audit completed successfully")
        except Exception as e:
            logger.error(f"Error running FMEA audit: {e}")
            print(f"\n❌ Erro ao executar auditoria FMEA: {e}")
    
    def _run_asog(self):
        """Execute ASOG review"""
        logger.info("Starting ASOG review")
        print("\nExecutando Revisão ASOG...")
        
        try:
            results = run_asog_review()
            self._record_execution("ASOG Review", results)
            
            print(f"\n✅ Revisão ASOG concluída!")
            print(f"Itens revisados: {results['compliance']['total_itens']}")
            print(f"Taxa de conformidade: {results['compliance']['taxa_conformidade']:.1f}%")
            print(f"Áreas críticas: {len(results['areas_criticas'])}")
            
            logger.info("ASOG review completed successfully")
        except Exception as e:
            logger.error(f"Error running ASOG review: {e}")
            print(f"\n❌ Erro ao executar revisão ASOG: {e}")
    
    def _run_forecast(self):
        """Execute risk forecast"""
        logger.info("Starting risk forecast")
        print("\nExecutando Forecast de Riscos...")
        
        timeframe = input("Período de previsão em dias (default: 30): ").strip()
        timeframe = int(timeframe) if timeframe.isdigit() else 30
        
        try:
            results = run_risk_forecast(timeframe)
            self._record_execution("Risk Forecast", results)
            
            print(f"\n✅ Forecast de Riscos concluído!")
            print(f"Período: {results['summary']['periodo_forecast']}")
            print(f"Tendência: {results['summary']['tendencia']}")
            print(f"Riscos críticos: {results['summary']['riscos_criticos']}")
            print(f"Riscos altos: {results['summary']['riscos_altos']}")
            
            logger.info("Risk forecast completed successfully")
        except Exception as e:
            logger.error(f"Error running risk forecast: {e}")
            print(f"\n❌ Erro ao executar forecast: {e}")
    
    def _export_results(self):
        """Export results to file"""
        logger.info("Starting export")
        print("\nExportar Resultados")
        print("1. Exportar última execução")
        print("2. Exportar todas as execuções")
        
        choice = input("Escolha: ").strip()
        
        if not self.state.get("executions"):
            print("\n❌ Nenhuma execução para exportar.")
            return
        
        format_choice = input("Formato (json/txt): ").strip().lower()
        
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if choice == "1":
                data = self.state["executions"][-1]
                filename = f"relatorio_{timestamp}"
            else:
                data = {"executions": self.state["executions"]}
                filename = f"relatorio_completo_{timestamp}"
            
            if format_choice == "json":
                exporter.export_to_json(data, f"{filename}.json")
                print(f"\n✅ Exportado para {filename}.json")
            else:
                exporter.export_to_text(data, f"{filename}.txt")
                print(f"\n✅ Exportado para {filename}.txt")
            
            logger.info(f"Results exported to {filename}")
        except Exception as e:
            logger.error(f"Error exporting results: {e}")
            print(f"\n❌ Erro ao exportar: {e}")
    
    def _connect_sgso(self):
        """Connect to SGSO system"""
        logger.info("Connecting to SGSO system")
        print("\nConectando ao Sistema SGSO...")
        
        try:
            if connector.connect():
                print("✅ Conectado ao sistema SGSO com sucesso!")
                logger.info("Connected to SGSO system")
            else:
                print("❌ Falha ao conectar ao sistema SGSO")
                logger.warning("Failed to connect to SGSO system")
        except Exception as e:
            logger.error(f"Error connecting to SGSO: {e}")
            print(f"\n❌ Erro ao conectar: {e}")
    
    def _view_history(self):
        """View execution history"""
        print("\nHistórico de Execuções")
        print("=" * 80)
        
        if not self.state.get("executions"):
            print("Nenhuma execução registrada.")
            return
        
        for i, execution in enumerate(self.state["executions"][-10:], 1):  # Last 10
            print(f"\n{i}. {execution['modulo']}")
            print(f"   Timestamp: {execution['timestamp']}")
            print(f"   Status: {execution['status']}")
    
    def _record_execution(self, module_name, results):
        """
        Record execution in state.
        
        Args:
            module_name (str): Name of the executed module
            results (dict): Execution results
        """
        execution = {
            "modulo": module_name,
            "timestamp": datetime.datetime.now().isoformat(),
            "status": results.get("status", "unknown"),
            "results": results
        }
        
        self.state["executions"].append(execution)
        self._save_state()
        logger.info(f"Execution recorded: {module_name}")


if __name__ == "__main__":
    # Test the module
    core = DecisionCore()
    core.processar_decisao()
