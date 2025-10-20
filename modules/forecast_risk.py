"""
Decision Core - Risk Forecast
Analyzes and predicts operational risks for next 30 days
"""

from datetime import datetime, timedelta
import json


class RiskForecaster:
    """Risk forecasting and analysis"""
    
    def __init__(self):
        self.risk_categories = [
            "Meteorológico",
            "Técnico",
            "Recursos Humanos",
            "Conformidade",
            "Logístico",
            "Segurança",
            "Operacional"
        ]
        
    def analyze_risks(self, days_ahead: int = 30) -> dict:
        """
        Analyze and forecast operational risks
        
        Args:
            days_ahead: Number of days to forecast
            
        Returns:
            Risk analysis dictionary
        """
        risks = []
        
        for i, category in enumerate(self.risk_categories, 1):
            # Simulate risk analysis
            probability = (i * 15) % 100  # 0-100 scale
            impact = ((i + 2) * 12) % 10 + 1  # 1-10 scale
            risk_score = (probability * impact) / 100
            
            priority = "High" if risk_score >= 7 else "Medium" if risk_score >= 4 else "Low"
            
            risk = {
                "id": i,
                "category": category,
                "description": f"Risco operacional relacionado a {category}",
                "probability": probability,
                "impact": impact,
                "risk_score": round(risk_score, 2),
                "priority": priority,
                "mitigation": f"Implementar medidas preventivas para {category}",
                "timeline": f"Próximos {days_ahead} dias"
            }
            risks.append(risk)
            
        # Calculate statistics
        high_priority = sum(1 for r in risks if r["priority"] == "High")
        medium_priority = sum(1 for r in risks if r["priority"] == "Medium")
        low_priority = sum(1 for r in risks if r["priority"] == "Low")
        avg_risk_score = sum(r["risk_score"] for r in risks) / len(risks)
        
        forecast_result = {
            "type": "RISK_FORECAST",
            "timestamp": datetime.now().isoformat(),
            "forecast_period": f"{days_ahead} days",
            "forecast_end": (datetime.now() + timedelta(days=days_ahead)).isoformat(),
            "total_risks": len(risks),
            "risks": risks,
            "statistics": {
                "high_priority": high_priority,
                "medium_priority": medium_priority,
                "low_priority": low_priority,
                "average_risk_score": round(avg_risk_score, 2)
            },
            "recommendations": self._generate_recommendations(risks),
            "status": "Completed"
        }
        
        return forecast_result
        
    def _generate_recommendations(self, risks: list) -> list:
        """
        Generate recommendations based on risk analysis
        
        Args:
            risks: List of identified risks
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Focus on high priority risks
        high_risks = [r for r in risks if r["priority"] == "High"]
        for risk in high_risks[:3]:  # Top 3 high priority
            recommendations.append({
                "category": risk["category"],
                "action": risk["mitigation"],
                "urgency": "Immediate"
            })
            
        return recommendations
        
    def save_report(self, forecast_result: dict, filename: str = None) -> str:
        """
        Save forecast report to file
        
        Args:
            forecast_result: Forecast result dictionary
            filename: Optional output filename
            
        Returns:
            Path to saved report
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"relatorio_forecast_{timestamp}.json"
            
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(forecast_result, f, indent=2, ensure_ascii=False)
            
        return filename
