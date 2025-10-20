"""
Risk Forecast module for Nautilus One.
Predictive risk analysis using historical data and trend analysis.
"""

from datetime import datetime, timedelta
from typing import Dict, List


class RiskForecaster:
    """Risk forecasting module for predictive risk analysis."""
    
    def __init__(self):
        """Initialize risk forecaster."""
        self.risk_categories = [
            "Operacional",
            "Ambiental",
            "Equipamento",
            "Humano",
            "Regulatório"
        ]
        self.timeframes = ["30 dias", "60 dias", "90 dias"]
    
    def run_forecast(self) -> Dict:
        """
        Execute risk forecast analysis.
        
        Returns:
            Dictionary containing forecast results with risk predictions
        """
        print("\n" + "="*80)
        print("PREVISÃO DE RISCOS - RISK FORECAST")
        print("="*80 + "\n")
        
        historical_data = self._analyze_historical_data()
        predictions = self._predict_risks(historical_data)
        matrix = self._generate_risk_matrix(predictions)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "tipo": "Risk Forecast",
            "periodo_analise": self.timeframes,
            "categorias": self.risk_categories,
            "dados_historicos": historical_data,
            "previsoes": predictions,
            "matriz_risco": matrix,
            "recomendacoes": self._generate_recommendations(predictions)
        }
    
    def _analyze_historical_data(self) -> Dict:
        """
        Analyze historical incident data.
        
        Returns:
            Dictionary with historical analysis
        """
        # Simulated historical data
        # In production, this would query actual incident database
        historical = {
            "periodo": "Últimos 90 dias",
            "total_incidentes": 24,
            "por_categoria": {
                "Operacional": 8,
                "Ambiental": 4,
                "Equipamento": 7,
                "Humano": 3,
                "Regulatório": 2
            },
            "tendencia": "Estável"
        }
        
        print("Dados Históricos:")
        print(f"  Período: {historical['periodo']}")
        print(f"  Total de incidentes: {historical['total_incidentes']}")
        print(f"  Tendência: {historical['tendencia']}")
        print()
        
        return historical
    
    def _predict_risks(self, historical_data: Dict) -> List[Dict]:
        """
        Predict future risks based on historical data.
        
        Args:
            historical_data: Historical incident data
            
        Returns:
            List of risk predictions
        """
        predictions = []
        
        # Define predictions based on historical patterns
        risk_predictions = [
            {
                "categoria": "Operacional",
                "probabilidade": 0.75,
                "impacto": 8,
                "descricao": "Possível falha em procedimentos operacionais",
                "periodo": "30 dias"
            },
            {
                "categoria": "Ambiental",
                "probabilidade": 0.45,
                "impacto": 7,
                "descricao": "Condições climáticas adversas previstas",
                "periodo": "30 dias"
            },
            {
                "categoria": "Equipamento",
                "probabilidade": 0.60,
                "impacto": 9,
                "descricao": "Desgaste natural de equipamentos críticos",
                "periodo": "60 dias"
            },
            {
                "categoria": "Humano",
                "probabilidade": 0.30,
                "impacto": 6,
                "descricao": "Necessidade de reciclagem de treinamento",
                "periodo": "90 dias"
            },
            {
                "categoria": "Regulatório",
                "probabilidade": 0.25,
                "impacto": 5,
                "descricao": "Novas regulamentações em tramitação",
                "periodo": "90 dias"
            }
        ]
        
        for pred in risk_predictions:
            risk_score = pred["probabilidade"] * pred["impacto"]
            severity = self._get_severity_level(risk_score)
            color = self._get_severity_color(severity)
            
            prediction = {
                **pred,
                "score_risco": round(risk_score, 2),
                "severidade": severity,
                "cor": color
            }
            
            predictions.append(prediction)
            
            # Display prediction
            print(f"{color} [{prediction['categoria']}] {prediction['descricao']}")
            print(f"  Período: {prediction['periodo']}")
            print(f"  Probabilidade: {prediction['probabilidade']*100:.0f}%")
            print(f"  Impacto: {prediction['impacto']}/10")
            print(f"  Score de Risco: {prediction['score_risco']} ({severity})")
            print()
        
        # Sort by risk score (highest first)
        predictions.sort(key=lambda x: x["score_risco"], reverse=True)
        
        return predictions
    
    def _get_severity_level(self, risk_score: float) -> str:
        """
        Determine severity level based on risk score.
        
        Args:
            risk_score: Calculated risk score
            
        Returns:
            Severity level string
        """
        if risk_score >= 6.0:
            return "Crítico"
        elif risk_score >= 4.0:
            return "Alto"
        elif risk_score >= 2.0:
            return "Médio"
        else:
            return "Baixo"
    
    def _get_severity_color(self, severity: str) -> str:
        """
        Get color indicator for severity level.
        
        Args:
            severity: Severity level
            
        Returns:
            Color emoji/indicator
        """
        colors = {
            "Crítico": "🔴",
            "Alto": "🟠",
            "Médio": "🟡",
            "Baixo": "🟢"
        }
        return colors.get(severity, "⚪")
    
    def _generate_risk_matrix(self, predictions: List[Dict]) -> Dict:
        """
        Generate risk priority matrix.
        
        Args:
            predictions: List of risk predictions
            
        Returns:
            Risk matrix dictionary
        """
        matrix = {
            "critico": [],
            "alto": [],
            "medio": [],
            "baixo": []
        }
        
        for pred in predictions:
            severity = pred["severidade"].lower()
            if severity == "crítico":
                matrix["critico"].append(pred["categoria"])
            elif severity == "alto":
                matrix["alto"].append(pred["categoria"])
            elif severity == "médio":
                matrix["medio"].append(pred["categoria"])
            else:
                matrix["baixo"].append(pred["categoria"])
        
        print("-"*80)
        print("MATRIZ DE PRIORIDADE DE RISCOS")
        print("-"*80)
        print(f"🔴 Crítico: {', '.join(matrix['critico']) if matrix['critico'] else 'Nenhum'}")
        print(f"🟠 Alto: {', '.join(matrix['alto']) if matrix['alto'] else 'Nenhum'}")
        print(f"🟡 Médio: {', '.join(matrix['medio']) if matrix['medio'] else 'Nenhum'}")
        print(f"🟢 Baixo: {', '.join(matrix['baixo']) if matrix['baixo'] else 'Nenhum'}")
        print("-"*80 + "\n")
        
        return matrix
    
    def _generate_recommendations(self, predictions: List[Dict]) -> List[str]:
        """
        Generate strategic recommendations based on predictions.
        
        Args:
            predictions: List of risk predictions
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Analyze predictions and generate recommendations
        critical_risks = [p for p in predictions if p["severidade"] == "Crítico"]
        high_risks = [p for p in predictions if p["severidade"] == "Alto"]
        
        if critical_risks:
            recommendations.append("Implementar plano de ação imediata para riscos críticos")
            recommendations.append("Estabelecer monitoramento contínuo 24/7")
        
        if high_risks:
            recommendations.append("Desenvolver estratégias de mitigação prioritárias")
            recommendations.append("Realizar reuniões semanais de acompanhamento")
        
        operational_risks = [p for p in predictions if p["categoria"] == "Operacional"]
        if operational_risks and operational_risks[0]["severidade"] in ["Crítico", "Alto"]:
            recommendations.append("Revisar e atualizar procedimentos operacionais")
        
        equipment_risks = [p for p in predictions if p["categoria"] == "Equipamento"]
        if equipment_risks and equipment_risks[0]["severidade"] in ["Crítico", "Alto"]:
            recommendations.append("Intensificar programa de manutenção preventiva")
        
        if not recommendations:
            recommendations.append("Manter rotinas de monitoramento e prevenção")
        
        print("RECOMENDAÇÕES ESTRATÉGICAS:")
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")
        print()
        
        return recommendations


def run() -> Dict:
    """
    Execute risk forecast.
    
    Returns:
        Forecast results dictionary
    """
    forecaster = RiskForecaster()
    return forecaster.run_forecast()
