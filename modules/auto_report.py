"""
Auto-Report Module - Sistema Nautilus One
Consolidates data from FMEA, ASOG, and Forecast de Risco
into a unified technical report with digital signature and timestamp.
"""
import json
from datetime import datetime
from core.logger import log_event
from core.pdf_exporter import export_report


class AutoReport:
    """
    Auto-Report Module for Sistema Nautilus One
    Consolidates FMEA, ASOG, and Risk Forecast data
    into a single technical report with digital signature and timestamp.
    """
    
    def __init__(self):
        """Initialize AutoReport with default file paths."""
        self.fmea_file = "relatorio_fmea_atual.json"
        self.asog_file = "asog_report.json"
        self.forecast_file = "forecast_risco.json"
        self.output_json = "nautilus_full_report.json"
        self.output_pdf = "Nautilus_Tech_Report.pdf"
    
    def carregar_dados(self):
        """
        Load data from FMEA, ASOG, and Forecast files.
        
        Returns:
            tuple: (fmea_data, asog_data, forecast_data)
        """
        def safe_load(path):
            """Safely load JSON file, return None if not found."""
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except FileNotFoundError:
                log_event(f"Arquivo não encontrado: {path}")
                return None
            except json.JSONDecodeError:
                log_event(f"Erro ao decodificar JSON: {path}")
                return None
        
        fmea = safe_load(self.fmea_file)
        asog = safe_load(self.asog_file)
        forecast = safe_load(self.forecast_file)
        return fmea, asog, forecast
    
    def consolidar(self):
        """
        Consolidate all data sources into a single report.
        
        Returns:
            dict: Consolidated report data
        """
        fmea, asog, forecast = self.carregar_dados()
        
        log_event("Consolidando dados para Auto-Report...")
        
        consolidado = {
            "timestamp": datetime.now().isoformat(),
            "fmea_summary": fmea if fmea else "Sem dados disponíveis",
            "asog_status": asog if asog else "Sem dados disponíveis",
            "forecast_summary": forecast if forecast else "Sem dados disponíveis",
            "assinatura_ia": self.gerar_assinatura()
        }
        
        with open(self.output_json, "w", encoding="utf-8") as f:
            json.dump(consolidado, f, indent=4, ensure_ascii=False)
        
        log_event(f"Auto-Report consolidado em JSON: {self.output_json}")
        return consolidado
    
    def gerar_assinatura(self):
        """
        Generate a symbolic digital signature timestamp.
        
        Returns:
            str: Digital signature in format NAUTILUS-IA-SIGN-YYYYMMDDHHMMSS
        """
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        chave = f"NAUTILUS-IA-SIGN-{timestamp}"
        log_event(f"Assinatura digital gerada: {chave}")
        return chave
    
    def exportar_pdf(self, consolidado):
        """
        Export consolidated data to PDF format.
        
        Args:
            consolidado: Consolidated report data
        """
        log_event("Gerando PDF técnico completo...")
        
        # Prepare content structure for PDF
        conteudo = [
            {"titulo": "Relatório Técnico – Sistema Nautilus One"},
            {"secao": "Sumário FMEA", "dados": consolidado["fmea_summary"]},
            {"secao": "Status ASOG", "dados": consolidado["asog_status"]},
            {"secao": "Forecast de Risco", "dados": consolidado["forecast_summary"]},
            {"secao": "Assinatura Digital IA", "dados": consolidado["assinatura_ia"]},
        ]
        
        export_report(conteudo, output_name=self.output_pdf)
        log_event(f"PDF técnico final exportado: {self.output_pdf}")
        print(f"📘 Relatório completo gerado: {self.output_pdf}")
    
    def run(self):
        """
        Execute the complete Auto-Report generation process.
        """
        print("\n🧾 Gerando Auto-Report consolidado...")
        consolidado = self.consolidar()
        self.exportar_pdf(consolidado)
        print("✅ Relatório técnico do Nautilus One finalizado com sucesso.")
        return consolidado


if __name__ == "__main__":
    # Allow direct execution
    AutoReport().run()
