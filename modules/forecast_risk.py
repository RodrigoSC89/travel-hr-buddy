"""
Risk Forecaster Module - Predictive Risk Analysis with FMEA/ASOG Integration

This module analyzes historical FMEA (Failure Mode and Effects Analysis) data from 8 critical
maritime systems and ASOG (Assurance of Operational Compliance) data to generate predictive
risk forecasts based on RPN (Risk Priority Number) calculations.

RPN = Severity × Occurrence × Detection

Risk Classification:
- 🔴 HIGH (RPN > 200): Immediate action required
- 🟡 MODERATE (150-200): Intensify monitoring
- 🟢 LOW (≤150): Normal operation
"""

import json
import datetime
import statistics
import os


class RiskForecast:
    """Main risk forecast class with FMEA/ASOG analysis capabilities"""
    
    def __init__(self, fmea_file="relatorio_fmea_atual.json", asog_file="asog_report.json"):
        """
        Initialize the Risk Forecast module.
        
        Args:
            fmea_file (str): Path to FMEA data file
            asog_file (str): Path to ASOG compliance data file
        """
        self.fmea_file = fmea_file
        self.asog_file = asog_file
        self.fmea_data = None
        self.asog_data = None
    
    def carregar_dados_fmea(self):
        """
        Load historical FMEA data from JSON file.
        
        Returns:
            dict: FMEA data or None if file not found
        """
        if not os.path.exists(self.fmea_file):
            print(f"⚠️ Arquivo FMEA não encontrado: {self.fmea_file}")
            return None
        
        try:
            with open(self.fmea_file, "r", encoding="utf-8") as f:
                self.fmea_data = json.load(f)
            return self.fmea_data
        except Exception as e:
            print(f"❌ Erro ao carregar dados FMEA: {e}")
            return None
    
    def carregar_dados_asog(self):
        """
        Load ASOG compliance data from JSON file.
        
        Returns:
            dict: ASOG data or None if file not found
        """
        if not os.path.exists(self.asog_file):
            print(f"⚠️ Arquivo ASOG não encontrado: {self.asog_file}")
            return None
        
        try:
            with open(self.asog_file, "r", encoding="utf-8") as f:
                self.asog_data = json.load(f)
            return self.asog_data
        except Exception as e:
            print(f"❌ Erro ao carregar dados ASOG: {e}")
            return None
    
    def calcular_rpn_medio(self):
        """
        Calculate average RPN from all failure modes in FMEA data.
        
        Returns:
            float: Average RPN value
        """
        if not self.fmea_data:
            return 0.0
        
        rpn_values = []
        for sistema in self.fmea_data.get("sistemas_criticos", []):
            for modo_falha in sistema.get("modos_falha", []):
                rpn_values.append(modo_falha.get("rpn", 0))
        
        return statistics.mean(rpn_values) if rpn_values else 0.0
    
    def calcular_variabilidade(self):
        """
        Calculate standard deviation of RPN values.
        
        Returns:
            float: Standard deviation of RPN values
        """
        if not self.fmea_data:
            return 0.0
        
        rpn_values = []
        for sistema in self.fmea_data.get("sistemas_criticos", []):
            for modo_falha in sistema.get("modos_falha", []):
                rpn_values.append(modo_falha.get("rpn", 0))
        
        return statistics.stdev(rpn_values) if len(rpn_values) > 1 else 0.0
    
    def classificar_risco(self, rpn_medio):
        """
        Classify risk level based on average RPN.
        
        Args:
            rpn_medio (float): Average RPN value
        
        Returns:
            tuple: (risk_level, emoji, description)
        """
        if rpn_medio > 200:
            return ("ALTA", "🔴", "Requer ação imediata")
        elif rpn_medio > 150:
            return ("MODERADA", "🟡", "Intensificar monitoramento")
        else:
            return ("BAIXA", "🟢", "Operação normal")
    
    def verificar_conformidade_asog(self):
        """
        Verify ASOG operational compliance status.
        
        Returns:
            tuple: (status, description)
        """
        if not self.asog_data:
            return ("sem_dados", "Dados ASOG não disponíveis")
        
        compliance = self.asog_data.get("compliance_summary", {})
        status_geral = compliance.get("status_geral", "desconhecido")
        taxa_conformidade = compliance.get("taxa_conformidade", 0)
        
        if status_geral == "conforme" and taxa_conformidade == 100:
            return ("conforme", "Todos os parâmetros dentro dos limites")
        elif taxa_conformidade >= 90:
            return ("atencao", "Alguns parâmetros requerem atenção")
        else:
            return ("fora_limites", "Parâmetros críticos fora dos limites")
    
    def gerar_recomendacao(self, nivel_risco, status_asog):
        """
        Generate operational recommendations based on risk level and ASOG status.
        
        Args:
            nivel_risco (str): Risk level (ALTA, MODERADA, BAIXA)
            status_asog (str): ASOG compliance status
        
        Returns:
            str: Recommendation text with emoji
        """
        if nivel_risco == "ALTA":
            return "🔴 Ação imediata necessária. Revisar todos os sistemas críticos e implementar controles emergenciais."
        elif nivel_risco == "MODERADA":
            return "🟡 Intensificar monitoramento. Revisar procedimentos e aumentar frequência de inspeções."
        else:
            if status_asog == "conforme":
                return "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
            elif status_asog == "atencao":
                return "🟡 Operação estável, mas alguns parâmetros requerem atenção."
            else:
                return "🟠 Revisar parâmetros operacionais. Verificar conformidade ASOG."
    
    def gerar_previsao(self):
        """
        Generate complete risk forecast with FMEA/ASOG analysis.
        
        Returns:
            dict: Complete forecast report
        """
        print("🔮 Iniciando análise preditiva de risco...")
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Carregando dados históricos FMEA/ASOG...")
        
        # Load data
        self.carregar_dados_fmea()
        self.carregar_dados_asog()
        
        if not self.fmea_data:
            return {
                "erro": "Dados FMEA não disponíveis",
                "timestamp": datetime.datetime.now().isoformat()
            }
        
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Calculando tendência de RPN...")
        
        # Calculate metrics
        rpn_medio = self.calcular_rpn_medio()
        variabilidade = self.calcular_variabilidade()
        
        # Classify risk
        nivel_risco, emoji, descricao = self.classificar_risco(rpn_medio)
        
        # Check ASOG compliance
        status_asog, asog_desc = self.verificar_conformidade_asog()
        
        # Generate recommendation
        recomendacao = self.gerar_recomendacao(nivel_risco, status_asog)
        
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Gerando relatório preditivo...")
        
        # Build forecast report
        forecast = {
            "timestamp": datetime.datetime.now().isoformat(),
            "risco_previsto": nivel_risco,
            "rpn_medio": round(rpn_medio, 2),
            "variabilidade": round(variabilidade, 2),
            "status_operacional": status_asog,
            "recomendacao": recomendacao,
            "detalhes": {
                "descricao_risco": descricao,
                "descricao_asog": asog_desc,
                "total_sistemas": len(self.fmea_data.get("sistemas_criticos", [])),
                "total_modos_falha": sum(
                    len(s.get("modos_falha", [])) 
                    for s in self.fmea_data.get("sistemas_criticos", [])
                )
            }
        }
        
        print(f"\n📈 Tendência de risco: {nivel_risco}")
        print(f"RPN médio: {rpn_medio:.2f} | Variabilidade: {variabilidade:.2f}")
        print(f"Status ASOG: {status_asog}")
        print(f"Recomendação: {recomendacao}")
        
        return forecast
    
    def salvar_relatorio(self, forecast, filename="forecast_risco.json"):
        """
        Save forecast report to JSON file.
        
        Args:
            forecast (dict): Forecast data to save
            filename (str): Output filename
        
        Returns:
            bool: True if successful
        """
        try:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(forecast, f, indent=2, ensure_ascii=False)
            print(f"\n📊 Forecast de Risco salvo como: {filename}")
            return True
        except Exception as e:
            print(f"❌ Erro ao salvar relatório: {e}")
            return False
    
    def analyze(self):
        """
        Run complete analysis and save report.
        
        Returns:
            dict: Forecast results
        """
        forecast = self.gerar_previsao()
        self.salvar_relatorio(forecast)
        return forecast


def run_risk_forecast(timeframe=30):
    """
    Legacy function for backward compatibility with existing tests.
    
    Args:
        timeframe (int): Forecast timeframe in days (not used in new implementation)
    
    Returns:
        dict: Risk forecast results
    """
    forecaster = RiskForecast()
    forecast = forecaster.gerar_previsao()
    
    # Transform to legacy format for compatibility
    return {
        "modulo": "Risk Forecaster",
        "timestamp": forecast.get("timestamp"),
        "previsoes": [],
        "risk_matrix": {
            "critico": [],
            "alto": [],
            "medio": [],
            "baixo": []
        },
        "summary": {
            "periodo_analise": "Histórico FMEA",
            "periodo_forecast": f"{timeframe} dias",
            "tendencia": forecast.get("risco_previsto", "BAIXA").lower(),
            "total_incidentes_recentes": 0,
            "riscos_criticos": 1 if forecast.get("risco_previsto") == "ALTA" else 0,
            "riscos_altos": 1 if forecast.get("risco_previsto") == "MODERADA" else 0,
            "riscos_medios": 0,
            "riscos_baixos": 1 if forecast.get("risco_previsto") == "BAIXA" else 0
        },
        "status": "completo"
    }


if __name__ == "__main__":
    # Test the module
    print("=" * 80)
    print("NAUTILUS ONE - RISK FORECAST MODULE")
    print("=" * 80)
    print()
    
    forecaster = RiskForecast()
    resultado = forecaster.analyze()
    
    print()
    print("=" * 80)
    print("Análise concluída com sucesso!")
    print("=" * 80)
