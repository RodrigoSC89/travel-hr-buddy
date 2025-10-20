"""
Módulo Auto-Report – Sistema Nautilus One
Consolida dados do FMEA, ASOG e Forecast de Risco
em um relatório técnico único, com assinatura digital e timestamp.
"""
import json
from datetime import datetime
from core.logger import log_event
from core.pdf_exporter import export_report


class AutoReport:
    """
    Módulo Auto-Report – Sistema Nautilus One
    Consolida dados do FMEA, ASOG e Forecast de Risco
    em um relatório técnico único, com assinatura digital e timestamp.
    """

    def __init__(self):
        self.fmea_file = "relatorio_fmea_atual.json"
        self.asog_file = "asog_report.json"
        self.forecast_file = "forecast_risco.json"
        self.output_json = "nautilus_full_report.json"
        self.output_pdf = "Nautilus_Tech_Report.pdf"

    def carregar_dados(self):
        """
        Carrega dados dos arquivos JSON
        
        Returns:
            Tupla com (fmea, asog, forecast) ou None se não encontrado
        """
        def safe_load(path):
            try:
                with open(path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                log_event(f"Arquivo não encontrado: {path}")
                return None

        fmea = safe_load(self.fmea_file)
        asog = safe_load(self.asog_file)
        forecast = safe_load(self.forecast_file)
        return fmea, asog, forecast

    def consolidar(self):
        """
        Consolida os dados de FMEA, ASOG e Forecast
        
        Returns:
            Dict com dados consolidados
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

        with open(self.output_json, "w") as f:
            json.dump(consolidado, f, indent=4)

        log_event("Auto-Report consolidado em JSON.")
        return consolidado

    def gerar_assinatura(self):
        """
        Gera assinatura digital simbólica para o relatório
        
        Returns:
            String com a assinatura digital
        """
        # Carimbo simbólico – simula assinatura digital IA
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        chave = f"NAUTILUS-IA-SIGN-{timestamp}"
        log_event(f"Assinatura digital gerada: {chave}")
        return chave

    def exportar_pdf(self, consolidado):
        """
        Exporta o relatório consolidado para PDF
        
        Args:
            consolidado: Dict com dados consolidados
        """
        log_event("Gerando PDF técnico completo...")

        # Gera PDF a partir dos dados consolidados
        conteudo = [
            {"titulo": "Relatório Técnico – Sistema Nautilus One"},
            {"seção": "Sumário FMEA", "dados": consolidado["fmea_summary"]},
            {"seção": "Status ASOG", "dados": consolidado["asog_status"]},
            {"seção": "Forecast de Risco", "dados": consolidado["forecast_summary"]},
            {"seção": "Assinatura Digital IA", "dados": consolidado["assinatura_ia"]},
        ]

        export_report(conteudo, output_name=self.output_pdf)
        log_event("PDF técnico final exportado com sucesso.")
        print(f"📘 Relatório completo gerado: {self.output_pdf}")

    def run(self):
        """
        Executa o processo completo de geração do auto-report
        """
        print("\n🧾 Gerando Auto-Report consolidado...")
        consolidado = self.consolidar()
        self.exportar_pdf(consolidado)
        print("✅ Relatório técnico do Nautilus One finalizado com sucesso.")
