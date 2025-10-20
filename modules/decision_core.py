"""
Decision Core Module - Main Controller.
The "brain" of Nautilus One that orchestrates operational modules.
"""

import json
from datetime import datetime
from typing import Optional

from core.logger import NautilusLogger
from core.pdf_exporter import PDFExporter
from core.sgso_connector import SGSOConnector
from modules.audit_fmea import FMEAAuditor
from modules.asog_review import ASOGReviewer
from modules.forecast_risk import RiskForecaster


class DecisionCore:
    """
    Main controller for Nautilus One Decision Core.
    Orchestrates operational modules and maintains system state.
    """
    
    def __init__(self, state_file: str = "nautilus_state.json"):
        """
        Initialize the Decision Core.
        
        Args:
            state_file: Path to the state persistence file
        """
        self.state_file = state_file
        self.logger = NautilusLogger()
        self.pdf_exporter = PDFExporter(self.logger)
        self.sgso_connector = SGSOConnector(self.logger)
        self.fmea_auditor = FMEAAuditor(self.logger)
        self.asog_reviewer = ASOGReviewer(self.logger)
        self.risk_forecaster = RiskForecaster(self.logger)
        
        self.logger.log("Decision Core inicializado")
    
    def show_menu(self) -> None:
        """Display the interactive menu."""
        print("\n" + "="*60)
        print("🧭 NAUTILUS ONE - DECISION CORE")
        print("="*60)
        print("\n🔧 Deseja seguir com:\n")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        print("5. 🚪 Sair")
        print("\n" + "="*60)
    
    def export_pdf(self) -> None:
        """Execute PDF export operation."""
        print("\n📄 Exportando parecer da IA como PDF...")
        
        # Create a sample report file if it doesn't exist
        report_file = "relatorio_fmea_atual.json"
        sample_report = {
            "tipo": "Relatório IA",
            "timestamp": datetime.now().isoformat(),
            "analise": "Análise completa do sistema",
            "recomendacoes": ["Manutenção preventiva", "Inspeção trimestral"]
        }
        
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(sample_report, f, ensure_ascii=False, indent=2)
        
        output_file = self.pdf_exporter.export_report(report_file)
        
        if output_file:
            print(f"✅ PDF exportado com sucesso: {output_file}")
            self.save_state("Exportar PDF")
        else:
            print("❌ Erro ao exportar PDF")
    
    def run_fmea_audit(self) -> None:
        """Execute FMEA audit."""
        print("\n🧠 Iniciando Auditoria Técnica FMEA...")
        
        results = self.fmea_auditor.run_audit()
        
        # Save results to file
        output_file = f"relatorio_fmea_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Auditoria FMEA concluída")
        print(f"📊 Resultados salvos em: {output_file}")
        print(f"⚠️  Modos de falha identificados: {results['modos_falha_identificados']}")
        print(f"🔴 Criticidade alta: {results['criticidade_alta']}")
        
        self.save_state("Auditoria FMEA")
    
    def connect_sgso(self) -> None:
        """Connect to SGSO system."""
        print("\n🔗 Conectando com SGSO/Logs...")
        
        if self.sgso_connector.connect():
            self.sgso_connector.sync_logs()
            print("✅ Conexão estabelecida e logs sincronizados")
            self.save_state("Conexão SGSO")
        else:
            print("❌ Erro ao conectar com SGSO")
    
    def show_sub_modules(self) -> None:
        """Display sub-modules menu."""
        print("\n🧾 Módulos Disponíveis:\n")
        print("1. 📊 Risk Forecast - Análise de Riscos")
        print("2. 📋 ASOG Review - Avaliação de Objetivos Operacionais")
        print("3. 🔙 Voltar ao menu principal")
        print("\n" + "="*60)
        
        choice = input("\nEscolha uma opção (1-3): ").strip()
        
        if choice == "1":
            self.run_risk_forecast()
        elif choice == "2":
            self.run_asog_review()
        elif choice == "3":
            return
        else:
            print("❌ Opção inválida")
    
    def run_risk_forecast(self) -> None:
        """Execute risk forecast analysis."""
        print("\n📊 Iniciando Risk Forecast...")
        
        results = self.risk_forecaster.analyze_risks()
        
        # Save results to file
        output_file = f"relatorio_forecast_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Análise de riscos concluída")
        print(f"📊 Resultados salvos em: {output_file}")
        print(f"⚠️  Índice de risco geral: {results['indice_risco_geral']}")
        print(f"🔴 Riscos identificados: {len(results['riscos_identificados'])}")
        
        self.save_state("Risk Forecast")
    
    def run_asog_review(self) -> None:
        """Execute ASOG review."""
        print("\n📋 Iniciando ASOG Review...")
        
        results = self.asog_reviewer.conduct_review()
        
        # Save results to file
        output_file = f"relatorio_asog_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ ASOG Review concluída")
        print(f"📊 Resultados salvos em: {output_file}")
        print(f"✅ Conformidade geral: {results['conformidade_geral']}")
        print(f"⚠️  Áreas não conformes: {results['areas_nao_conformes']}")
        
        self.save_state("ASOG Review")
    
    def save_state(self, action: str) -> None:
        """
        Save current system state to file.
        
        Args:
            action: Description of the action performed
        """
        state = {
            "ultima_acao": action,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        
        self.logger.log(f"Estado atualizado: {action}")
    
    def load_state(self) -> Optional[dict]:
        """
        Load system state from file.
        
        Returns:
            State dictionary if file exists, None otherwise
        """
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                state = json.load(f)
            self.logger.log("Estado anterior carregado")
            return state
        except FileNotFoundError:
            self.logger.log("Nenhum estado anterior encontrado")
            return None
    
    def run(self) -> None:
        """Run the Decision Core interactive loop."""
        # Load previous state if exists
        previous_state = self.load_state()
        if previous_state:
            print(f"\n📌 Última ação: {previous_state['ultima_acao']}")
            print(f"🕐 Timestamp: {previous_state['timestamp']}")
        
        while True:
            self.show_menu()
            choice = input("\nEscolha uma opção (1-5): ").strip()
            
            if choice == "1":
                self.export_pdf()
            elif choice == "2":
                self.run_fmea_audit()
            elif choice == "3":
                self.connect_sgso()
            elif choice == "4":
                self.show_sub_modules()
            elif choice == "5":
                print("\n👋 Encerrando Decision Core...")
                self.logger.log("Decision Core encerrado")
                break
            else:
                print("\n❌ Opção inválida. Por favor, escolha uma opção de 1 a 5.")
            
            input("\nPressione Enter para continuar...")
