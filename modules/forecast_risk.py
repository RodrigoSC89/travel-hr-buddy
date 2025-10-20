"""
Risk Forecast Module - Nautilus One System
Analyzes historical FMEA and ASOG reports to calculate operational risk trends.
"""
import json
import statistics
from datetime import datetime
from core.logger import log_event


class RiskForecast:
    """
    Risk Forecast Module – Nautilus One System
    Analyzes previous reports (FMEA and ASOG) and calculates operational risk trends.
    """

    def __init__(self):
        self.historico_fmea = "relatorio_fmea_atual.json"
        self.historico_asog = "asog_report.json"
        self.relatorio_saida = "forecast_risco.json"

    def carregar_dados(self):
        """Load historical FMEA and ASOG data."""
        log_event("Carregando dados históricos FMEA/ASOG...")

        try:
            with open(self.historico_fmea, "r") as file:
                fmea = json.load(file)
        except FileNotFoundError:
            fmea = []

        try:
            with open(self.historico_asog, "r") as file:
                asog = json.load(file)
        except FileNotFoundError:
            asog = {}

        return fmea, asog

    def calcular_tendencias(self, fmea):
        """Calculate RPN trends from FMEA data."""
        log_event("Calculando tendência de RPN...")

        if not fmea:
            return {"tendencia": "indeterminada", "risco_medio": 0, "variabilidade": 0}

        rpn_values = [item["RPN"] for item in fmea]
        media = round(statistics.mean(rpn_values), 2)
        desvio = round(statistics.pstdev(rpn_values), 2)

        if media > 200:
            tendencia = "ALTA"
        elif media > 150:
            tendencia = "MODERADA"
        else:
            tendencia = "BAIXA"

        return {"tendencia": tendencia, "risco_medio": media, "variabilidade": desvio}

    def avaliar_conformidade_asog(self, asog):
        """Evaluate ASOG compliance."""
        if not asog:
            return "sem dados"

        conforme = asog.get("resultado", {}).get("conformidade", True)
        return "fora dos limites" if not conforme else "conforme"

    def gerar_previsao(self):
        """Generate risk forecast report."""
        fmea, asog = self.carregar_dados()

        tendencia = self.calcular_tendencias(fmea)
        status_asog = self.avaliar_conformidade_asog(asog)

        log_event("Gerando relatório preditivo...")

        forecast = {
            "timestamp": datetime.now().isoformat(),
            "risco_previsto": tendencia["tendencia"],
            "rpn_medio": tendencia["risco_medio"],
            "variabilidade": tendencia["variabilidade"],
            "status_operacional": status_asog,
            "recomendacao": self.recomendar_acao(tendencia["tendencia"], status_asog)
        }

        with open(self.relatorio_saida, "w") as file:
            json.dump(forecast, file, indent=4)

        log_event("Forecast de risco gerado com sucesso.")
        print("📊 Forecast de Risco salvo como:", self.relatorio_saida)
        return forecast

    def recomendar_acao(self, tendencia, status_asog):
        """Recommend action based on risk trend and ASOG status."""
        if tendencia == "ALTA" or status_asog == "fora dos limites":
            return "⚠️ Revisar redundâncias e planejar DP Trials adicionais."
        elif tendencia == "MODERADA":
            return "🟡 Intensificar inspeções preventivas e validar sensores críticos."
        else:
            return "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."

    def analyze(self):
        """Run analysis and display results."""
        print("\n🔮 Iniciando análise preditiva de risco...")
        resultado = self.gerar_previsao()
        print(f"\n📈 Tendência de risco: {resultado['risco_previsto']}")
        print(f"RPN médio: {resultado['rpn_medio']} | Variabilidade: {resultado['variabilidade']}")
        print(f"Status ASOG: {resultado['status_operacional']}")
        print(f"Recomendação: {resultado['recomendacao']}")
