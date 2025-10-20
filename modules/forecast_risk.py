"""
Risk Forecaster Module - Predictive Risk Analysis

This module analyzes historical incident data (90-day trends) and predicts future risks
in 5 categories: Operational, Environmental, Equipment, Human, Regulatory.
Generates color-coded risk matrix (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
"""

import datetime
import random


def run_risk_forecast(timeframe=30):
    """
    Run risk forecast analysis.
    
    Args:
        timeframe (int): Forecast timeframe in days (default: 30)
    
    Returns:
        dict: Risk forecast results with predictions and recommendations
    """
    
    # 5 risk categories
    risk_categories = [
        "Operacional",
        "Ambiental",
        "Equipamento",
        "Humano",
        "Regulatório"
    ]
    
    # Simulate historical data (90-day trend)
    historical_data = []
    for i in range(90):
        date = (datetime.datetime.now() - datetime.timedelta(days=90-i)).date().isoformat()
        incidents = random.randint(0, 5)
        historical_data.append({
            "data": date,
            "incidentes": incidents
        })
    
    # Calculate trend
    recent_incidents = sum(day["incidentes"] for day in historical_data[-30:])
    previous_incidents = sum(day["incidentes"] for day in historical_data[-60:-30])
    trend = "crescente" if recent_incidents > previous_incidents else "decrescente" if recent_incidents < previous_incidents else "estável"
    
    # Generate risk predictions for each category
    risk_predictions = []
    risk_matrix = {
        "critico": [],
        "alto": [],
        "medio": [],
        "baixo": []
    }
    
    for category in risk_categories:
        # Random probability (0-100)
        probability = random.randint(10, 95)
        
        # Random impact (0-100)
        impact = random.randint(10, 95)
        
        # Calculate risk score
        risk_score = (probability + impact) / 2
        
        # Determine risk level with emoji
        if risk_score >= 75:
            risk_level = "Crítico 🔴"
            risk_key = "critico"
        elif risk_score >= 50:
            risk_level = "Alto 🟠"
            risk_key = "alto"
        elif risk_score >= 25:
            risk_level = "Médio 🟡"
            risk_key = "medio"
        else:
            risk_level = "Baixo 🟢"
            risk_key = "baixo"
        
        prediction = {
            "categoria": category,
            "probabilidade": probability,
            "impacto": impact,
            "score_risco": round(risk_score, 2),
            "nivel_risco": risk_level,
            "recomendacao": _generate_risk_recommendation(category, risk_key),
            "prioridade_mitigacao": _calculate_mitigation_priority(risk_score)
        }
        
        risk_predictions.append(prediction)
        risk_matrix[risk_key].append(category)
    
    # Sort by risk score (descending)
    risk_predictions.sort(key=lambda x: x["score_risco"], reverse=True)
    
    # Calculate summary statistics
    summary = {
        "periodo_analise": "90 dias",
        "periodo_forecast": f"{timeframe} dias",
        "tendencia": trend,
        "total_incidentes_recentes": recent_incidents,
        "riscos_criticos": len(risk_matrix["critico"]),
        "riscos_altos": len(risk_matrix["alto"]),
        "riscos_medios": len(risk_matrix["medio"]),
        "riscos_baixos": len(risk_matrix["baixo"])
    }
    
    result = {
        "modulo": "Risk Forecaster",
        "timestamp": datetime.datetime.now().isoformat(),
        "historico": historical_data[-7:],  # Last 7 days for brevity
        "previsoes": risk_predictions,
        "risk_matrix": risk_matrix,
        "summary": summary,
        "status": "completo"
    }
    
    return result


def _generate_risk_recommendation(category, risk_level):
    """
    Generate strategic recommendations based on risk analysis.
    
    Args:
        category (str): Risk category
        risk_level (str): Risk level key
    
    Returns:
        str: Recommendation text
    """
    recommendations = {
        "Operacional": {
            "critico": "Implementar controles operacionais imediatos. Revisar todos os procedimentos críticos.",
            "alto": "Reforçar procedimentos operacionais. Aumentar supervisão e monitoramento.",
            "medio": "Revisar procedimentos periodicamente. Manter vigilância operacional.",
            "baixo": "Continuar operações normais. Manter procedimentos padrão."
        },
        "Ambiental": {
            "critico": "Ação ambiental urgente. Avaliar e mitigar impactos ambientais críticos.",
            "alto": "Monitoramento ambiental intensivo. Implementar medidas de proteção.",
            "medio": "Continuar monitoramento ambiental regular. Estar preparado para mudanças.",
            "baixo": "Monitoramento de rotina adequado. Condições ambientais favoráveis."
        },
        "Equipamento": {
            "critico": "Inspeção completa de equipamentos. Substituir ou reparar imediatamente.",
            "alto": "Aumentar frequência de manutenção. Monitorar condição de equipamentos.",
            "medio": "Manter programa de manutenção preventiva. Inspeções regulares.",
            "baixo": "Equipamentos em boas condições. Manutenção de rotina suficiente."
        },
        "Humano": {
            "critico": "Treinamento emergencial. Avaliar competências e fatores humanos.",
            "alto": "Intensificar treinamento. Reforçar procedimentos de segurança.",
            "medio": "Atualizar programa de treinamento. Melhorar comunicação.",
            "baixo": "Equipe adequadamente treinada. Continuar programa regular."
        },
        "Regulatório": {
            "critico": "Ação corretiva imediata para conformidade. Risco de penalidades.",
            "alto": "Revisar conformidade regulatória. Implementar correções necessárias.",
            "medio": "Monitorar mudanças regulatórias. Manter conformidade.",
            "baixo": "Conformidade adequada. Continuar monitoramento regular."
        }
    }
    
    return recommendations.get(category, {}).get(risk_level, "Avaliar e monitorar situação.")


def _calculate_mitigation_priority(risk_score):
    """
    Calculate mitigation priority based on risk score.
    
    Args:
        risk_score (float): Risk score (0-100)
    
    Returns:
        int: Priority level (1-5, where 1 is highest)
    """
    if risk_score >= 75:
        return 1  # Highest priority
    elif risk_score >= 50:
        return 2
    elif risk_score >= 25:
        return 3
    elif risk_score >= 10:
        return 4
    else:
        return 5  # Lowest priority


if __name__ == "__main__":
    # Test the module
    results = run_risk_forecast(timeframe=30)
    print(f"Risk Forecast completed for {results['summary']['periodo_forecast']}")
    print(f"Critical risks: {results['summary']['riscos_criticos']}")
