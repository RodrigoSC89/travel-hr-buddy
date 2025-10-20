"""
Risk Forecast Module - Predictive Risk Analysis
Predicts future risks, generates risk matrix, and provides recommendations
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta
import random


class RiskForecaster:
    """
    Risk Forecaster
    Analyzes historical data and predicts future risks
    """
    
    RISK_CATEGORIES = [
        "Operacional",
        "Ambiental",
        "Equipamento",
        "Humano",
        "Regulatório"
    ]
    
    RISK_LEVELS = ["Baixo", "Médio", "Alto", "Crítico"]
    
    def __init__(self):
        """Initialize Risk Forecaster"""
        self.results = []
        random.seed(42)  # For consistent results
        
    def run_forecast(self, timeframe: int = 30) -> Dict[str, Any]:
        """
        Execute risk forecast analysis
        
        Args:
            timeframe: Number of days to forecast (default: 30)
            
        Returns:
            Forecast results with risk predictions
        """
        print("\n" + "=" * 80)
        print("PREVISÃO DE RISCOS - ANÁLISE PREDITIVA")
        print("=" * 80)
        
        # Analyze historical data
        historical = self._analyze_historical_data()
        
        # Predict future risks
        predictions = self._predict_risks(timeframe)
        
        # Generate risk matrix
        risk_matrix = self._generate_risk_matrix(predictions)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(predictions, risk_matrix)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "forecast_type": "Risk Prediction",
            "timeframe_days": timeframe,
            "historical_analysis": historical,
            "predictions": predictions,
            "risk_matrix": risk_matrix,
            "recommendations": recommendations
        }
        
        self.results = results
        self._display_results(results)
        
        return results
    
    def _analyze_historical_data(self) -> Dict[str, Any]:
        """
        Analyze historical incident data
        
        Returns:
            Historical analysis summary
        """
        # Simulate historical data analysis
        historical = {
            "period": "Últimos 90 dias",
            "total_incidents": random.randint(15, 45),
            "by_category": {},
            "trend": "stable"
        }
        
        for category in self.RISK_CATEGORIES:
            historical["by_category"][category] = random.randint(2, 12)
        
        # Determine trend
        recent = sum(random.randint(1, 5) for _ in range(3))
        past = sum(random.randint(1, 5) for _ in range(3))
        
        if recent > past * 1.2:
            historical["trend"] = "increasing"
        elif recent < past * 0.8:
            historical["trend"] = "decreasing"
        else:
            historical["trend"] = "stable"
        
        return historical
    
    def _predict_risks(self, timeframe: int) -> List[Dict[str, Any]]:
        """
        Predict risks for the specified timeframe
        
        Args:
            timeframe: Number of days to forecast
            
        Returns:
            List of risk predictions
        """
        predictions = []
        
        for category in self.RISK_CATEGORIES:
            # Simulate prediction
            probability = random.uniform(0.2, 0.8)
            impact = random.choice(self.RISK_LEVELS)
            
            # Calculate risk score (0-100)
            impact_scores = {"Baixo": 25, "Médio": 50, "Alto": 75, "Crítico": 100}
            risk_score = probability * impact_scores[impact]
            
            # Determine risk level
            if risk_score >= 75:
                risk_level = "Crítico"
                color = "🔴"
            elif risk_score >= 50:
                risk_level = "Alto"
                color = "🟠"
            elif risk_score >= 25:
                risk_level = "Médio"
                color = "🟡"
            else:
                risk_level = "Baixo"
                color = "🟢"
            
            prediction = {
                "category": category,
                "probability": round(probability * 100, 1),
                "impact": impact,
                "risk_score": round(risk_score, 1),
                "risk_level": risk_level,
                "color": color,
                "timeframe_days": timeframe,
                "mitigation_priority": self._calculate_priority(risk_score)
            }
            
            predictions.append(prediction)
        
        # Sort by risk score (descending)
        predictions.sort(key=lambda x: x["risk_score"], reverse=True)
        
        return predictions
    
    def _calculate_priority(self, risk_score: float) -> int:
        """
        Calculate mitigation priority (1-5, where 1 is highest)
        
        Args:
            risk_score: Risk score (0-100)
            
        Returns:
            Priority level
        """
        if risk_score >= 75:
            return 1
        elif risk_score >= 60:
            return 2
        elif risk_score >= 40:
            return 3
        elif risk_score >= 20:
            return 4
        else:
            return 5
    
    def _generate_risk_matrix(self, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate risk priority matrix
        
        Args:
            predictions: Risk predictions
            
        Returns:
            Risk matrix with color-coded severity
        """
        matrix = {
            "critico": [],
            "alto": [],
            "medio": [],
            "baixo": []
        }
        
        for pred in predictions:
            level = pred["risk_level"].lower()
            if level == "crítico":
                matrix["critico"].append(pred["category"])
            elif level == "alto":
                matrix["alto"].append(pred["category"])
            elif level == "médio":
                matrix["medio"].append(pred["category"])
            else:
                matrix["baixo"].append(pred["category"])
        
        matrix["summary"] = {
            "total": len(predictions),
            "critico_count": len(matrix["critico"]),
            "alto_count": len(matrix["alto"]),
            "medio_count": len(matrix["medio"]),
            "baixo_count": len(matrix["baixo"])
        }
        
        return matrix
    
    def _generate_recommendations(
        self,
        predictions: List[Dict[str, Any]],
        risk_matrix: Dict[str, Any]
    ) -> List[str]:
        """
        Generate strategic recommendations
        
        Args:
            predictions: Risk predictions
            risk_matrix: Risk matrix
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Critical risks
        critical = [p for p in predictions if p["risk_level"] == "Crítico"]
        if critical:
            recommendations.append(
                f"AÇÃO URGENTE: {len(critical)} categoria(s) com risco crítico identificada(s)"
            )
            for pred in critical:
                recommendations.append(
                    f"  - {pred['category']}: Implementar plano de mitigação imediato (Prioridade {pred['mitigation_priority']})"
                )
        
        # High risks
        high = [p for p in predictions if p["risk_level"] == "Alto"]
        if high:
            recommendations.append(
                f"ATENÇÃO: {len(high)} categoria(s) com risco alto"
            )
        
        # General recommendations
        recommendations.extend([
            "Intensificar monitoramento de indicadores de risco",
            "Revisar e atualizar matriz de riscos mensalmente",
            "Realizar simulações de cenários de risco",
            "Implementar controles preventivos nas áreas críticas",
            "Estabelecer planos de contingência atualizados"
        ])
        
        return recommendations
    
    def _display_results(self, results: Dict[str, Any]) -> None:
        """
        Display forecast results
        
        Args:
            results: Forecast results
        """
        print(f"\nRESULTADOS DA PREVISÃO DE RISCOS")
        print("-" * 80)
        print(f"Período de previsão: {results['timeframe_days']} dias")
        print(f"Análise histórica: {results['historical_analysis']['period']}")
        print(f"Tendência: {results['historical_analysis']['trend']}")
        
        print(f"\nMatriz de Riscos:")
        matrix = results['risk_matrix']
        print(f"  🔴 Crítico: {matrix['summary']['critico_count']} - {', '.join(matrix['critico']) if matrix['critico'] else 'Nenhum'}")
        print(f"  🟠 Alto: {matrix['summary']['alto_count']} - {', '.join(matrix['alto']) if matrix['alto'] else 'Nenhum'}")
        print(f"  🟡 Médio: {matrix['summary']['medio_count']} - {', '.join(matrix['medio']) if matrix['medio'] else 'Nenhum'}")
        print(f"  🟢 Baixo: {matrix['summary']['baixo_count']} - {', '.join(matrix['baixo']) if matrix['baixo'] else 'Nenhum'}")
        
        print(f"\nTop 3 Riscos Prioritários:")
        for i, pred in enumerate(results['predictions'][:3], 1):
            print(f"{i}. {pred['category']} {pred['color']}")
            print(f"   Probabilidade: {pred['probability']}% | Impacto: {pred['impact']} | Score: {pred['risk_score']}")
        
        print(f"\nRecomendações:")
        for i, rec in enumerate(results['recommendations'][:5], 1):
            print(f"{i}. {rec}")
        
        print("=" * 80 + "\n")


def run_risk_forecast(timeframe: int = 30) -> Dict[str, Any]:
    """
    Convenience function to run risk forecast
    
    Args:
        timeframe: Number of days to forecast
        
    Returns:
        Forecast results
    """
    forecaster = RiskForecaster()
    return forecaster.run_forecast(timeframe)
