"""
Decision Core - Main Controller
Orchestrates operational modules for maritime, offshore, and industrial operations
"""

import json
from datetime import datetime
from core.logger import Logger
from core.pdf_exporter import PDFExporter
from core.sgso_connector import SGSOConnector
from modules.audit_fmea import FMEAAuditor
from modules.asog_review import ASOGReviewer
from modules.forecast_risk import RiskForecaster


class DecisionCore:
    """
    Decision Core - Intelligent Command Center
    
    The "brain" of Nautilus One that interprets operator commands
    and executes appropriate modules while maintaining state persistence
    and comprehensive logging.
    """
    
    def __init__(self):
        self.logger = Logger()
        self.pdf_exporter = PDFExporter()
        self.sgso_connector = SGSOConnector()
        self.fmea_auditor = FMEAAuditor()
        self.asog_reviewer = ASOGReviewer()
        self.risk_forecaster = RiskForecaster()
        self.state_file = "nautilus_state.json"
        self.logger.log("Decision Core inicializado")
        
    def export_pdf_report(self) -> str:
        """
        Export IA report as PDF
        
        Returns:
            Path to exported PDF file
        """
        self.logger.log("Iniciando exportação de relatório PDF...")
        
        # Detect available reports
        reports = self.pdf_exporter.detect_reports()
        
        if not reports:
            self.logger.log("Nenhum relatório disponível para exportação")
            # Create a sample report
            sample_report = {
                "type": "Sample Report",
                "timestamp": datetime.now().isoformat(),
                "content": "Relatório de exemplo gerado pelo Decision Core"
            }
            report_file = f"relatorio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(sample_report, f, indent=2, ensure_ascii=False)
            reports = [report_file]
            
        # Export the first available report
        with open(reports[0], "r", encoding="utf-8") as f:
            report_data = json.load(f)
            
        pdf_file = self.pdf_exporter.export_report(report_data, reports[0])
        self.logger.log(f"Relatório exportado como PDF: {pdf_file}")
        self._save_state("Exportar PDF")
        
        return pdf_file
        
    def run_fmea_audit(self) -> dict:
        """
        Run FMEA technical audit
        
        Returns:
            Audit results dictionary
        """
        self.logger.log("Iniciando Auditoria Técnica FMEA...")
        
        audit_result = self.fmea_auditor.run_audit()
        report_file = self.fmea_auditor.save_report(audit_result)
        
        stats = audit_result["statistics"]
        self.logger.log(
            f"Auditoria FMEA concluída: {stats['total_modes']} modos de falha identificados "
            f"(Alta: {stats['high_criticality']}, Média: {stats['medium_criticality']}, "
            f"Baixa: {stats['low_criticality']})"
        )
        
        self._save_state("Auditoria FMEA")
        return audit_result
        
    def connect_sgso(self) -> dict:
        """
        Connect to SGSO and sync logs
        
        Returns:
            Connection status dictionary
        """
        self.logger.log("Conectando ao SGSO...")
        
        self.sgso_connector.connect()
        sync_result = self.sgso_connector.sync_logs()
        
        if sync_result["success"]:
            self.logger.log(
                f"SGSO conectado com sucesso. {sync_result['logs_synced']} logs sincronizados"
            )
        else:
            self.logger.log(f"Erro ao conectar SGSO: {sync_result.get('error', 'Unknown')}")
            
        self._save_state("Conectar SGSO")
        return sync_result
        
    def run_asog_review(self) -> dict:
        """
        Conduct ASOG review
        
        Returns:
            Review results dictionary
        """
        self.logger.log("Iniciando ASOG Review...")
        
        review_result = self.asog_reviewer.conduct_review()
        report_file = self.asog_reviewer.save_report(review_result)
        
        stats = review_result["statistics"]
        self.logger.log(
            f"ASOG Review concluída: {stats['compliance_percentage']}% de conformidade "
            f"({stats['compliant_areas']} áreas conformes de {review_result['total_areas']})"
        )
        
        self._save_state("ASOG Review")
        return review_result
        
    def run_risk_forecast(self, days: int = 30) -> dict:
        """
        Run risk forecast analysis
        
        Args:
            days: Number of days to forecast
            
        Returns:
            Forecast results dictionary
        """
        self.logger.log(f"Iniciando Risk Forecast (próximos {days} dias)...")
        
        forecast_result = self.risk_forecaster.analyze_risks(days)
        report_file = self.risk_forecaster.save_report(forecast_result)
        
        stats = forecast_result["statistics"]
        self.logger.log(
            f"Risk Forecast concluído: {forecast_result['total_risks']} riscos identificados "
            f"(Alta: {stats['high_priority']}, Média: {stats['medium_priority']}, "
            f"Baixa: {stats['low_priority']})"
        )
        
        self._save_state("Risk Forecast")
        return forecast_result
        
    def _save_state(self, action: str) -> None:
        """
        Save system state to file
        
        Args:
            action: Last action performed
        """
        state = {
            "ultima_acao": action,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
            
    def get_state(self) -> dict:
        """
        Retrieve current system state
        
        Returns:
            State dictionary
        """
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {"status": "No state saved yet"}
            
    def get_logs(self, lines: int = 50) -> list:
        """
        Retrieve recent log entries
        
        Args:
            lines: Number of recent lines to retrieve
            
        Returns:
            List of log entries
        """
        return self.logger.get_logs(lines)
