"""
Decision Core Module for Nautilus One
Main controller that orchestrates operational modules
"""
import json
import os
from datetime import datetime
from core.logger import Logger
from core.pdf_exporter import PDFExporter
from core.sgso_connector import SGSOConnector
from modules.audit_fmea import FMEAAuditor
from modules.asog_review import ASOGReview
from modules.forecast_risk import RiskForecast


class DecisionCore:
    """
    Main controller for Nautilus One Decision Core
    Orchestrates operational modules and manages system state
    """
    
    def __init__(self):
        """Initialize Decision Core with all components"""
        self.logger = Logger()
        self.pdf_exporter = PDFExporter(logger=self.logger)
        self.sgso_connector = SGSOConnector(logger=self.logger)
        self.fmea_auditor = FMEAAuditor(logger=self.logger)
        self.asog_review = ASOGReview(logger=self.logger)
        self.risk_forecast = RiskForecast(logger=self.logger)
        self.state_file = "nautilus_state.json"
        
        self.logger.log("Decision Core inicializado")
        
    def export_pdf(self):
        """
        Export IA report as PDF
        
        Returns:
            bool: Success status
        """
        self.logger.log("=== Módulo: Exportar Parecer da IA como PDF ===")
        
        # Look for most recent report file
        report_files = [f for f in os.listdir(".") if f.startswith("relatorio_") and f.endswith(".json")]
        
        if not report_files:
            self.logger.log("Nenhum relatório encontrado para exportar")
            # Create a sample report for demonstration
            sample_report = {
                "tipo": "Relatório de Demonstração",
                "timestamp": datetime.now().isoformat(),
                "conteudo": "Este é um relatório de demonstração do Decision Core"
            }
            report_file = "relatorio_fmea_atual.json"
            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(sample_report, f, indent=2, ensure_ascii=False)
            self.logger.log(f"Relatório de demonstração criado: {report_file}")
        else:
            # Use the most recent report
            report_file = max(report_files, key=os.path.getmtime)
        
        # Export to PDF
        pdf_file = self.pdf_exporter.export_report(report_file)
        
        if pdf_file:
            self.save_state("Exportar PDF")
            return True
        
        return False
    
    def run_fmea_audit(self):
        """
        Run FMEA technical audit
        
        Returns:
            dict: Audit results
        """
        self.logger.log("=== Módulo: Auditoria Técnica FMEA ===")
        
        # Execute FMEA audit
        results = self.fmea_auditor.run_audit()
        
        self.save_state("Auditoria FMEA")
        return results
    
    def connect_sgso(self):
        """
        Connect to SGSO and sync logs
        
        Returns:
            bool: Connection status
        """
        self.logger.log("=== Módulo: Conectar com SGSO/Logs ===")
        
        # Connect to SGSO
        if self.sgso_connector.connect():
            # Sync logs
            self.sgso_connector.sync_logs()
            self.save_state("Conectar SGSO")
            return True
        
        return False
    
    def run_asog_review(self):
        """
        Run ASOG review module
        
        Returns:
            dict: Review results
        """
        self.logger.log("=== Sub-Módulo: ASOG Review ===")
        
        # Execute ASOG review
        results = self.asog_review.run_review()
        
        self.save_state("ASOG Review")
        return results
    
    def run_risk_forecast(self):
        """
        Run risk forecast module
        
        Returns:
            dict: Forecast results
        """
        self.logger.log("=== Sub-Módulo: Risk Forecast ===")
        
        # Execute risk forecast
        results = self.risk_forecast.run_forecast()
        
        self.save_state("Risk Forecast")
        return results
    
    def save_state(self, action):
        """
        Save current system state
        
        Args:
            action (str): Last action performed
        """
        state = {
            "ultima_acao": action,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        
        self.logger.log(f"Estado atualizado: {action}")
    
    def load_state(self):
        """
        Load saved system state
        
        Returns:
            dict: System state or None if not found
        """
        if os.path.exists(self.state_file):
            with open(self.state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return None
    
    def show_menu(self):
        """
        Display interactive menu
        
        Returns:
            str: User's choice
        """
        print("\n" + "=" * 60)
        print("🧭 NAUTILUS ONE - DECISION CORE")
        print("=" * 60)
        print("\n🔧 Deseja seguir com:\n")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        print("5. 🚪 Sair")
        print("\n" + "=" * 60)
        
        choice = input("\nEscolha uma opção (1-5): ").strip()
        return choice
    
    def show_submodule_menu(self):
        """
        Display sub-module menu
        
        Returns:
            str: User's choice
        """
        print("\n" + "=" * 60)
        print("🧾 SUB-MÓDULOS DISPONÍVEIS")
        print("=" * 60)
        print("\n1. 📊 Risk Forecast - Análise de Riscos Operacionais")
        print("2. ✅ ASOG Review - Avaliação de Metas Operacionais")
        print("3. 🔙 Voltar ao menu principal")
        print("\n" + "=" * 60)
        
        choice = input("\nEscolha uma opção (1-3): ").strip()
        return choice
