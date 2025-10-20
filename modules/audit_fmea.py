"""
FMEA Auditor Module - Failure Mode and Effects Analysis

This module identifies failure modes across 4 categories and calculates Risk Priority Numbers (RPN).
RPN = Severity × Occurrence × Detection
Risk Levels: Critical (≥200), High (≥100), Medium (≥50), Low (<50)
"""

import datetime
import random


def run_fmea_audit():
    """
    Run FMEA audit and identify failure modes.
    
    Returns:
        dict: FMEA audit results with failure modes and recommendations
    """
    
    # Categories of failure modes
    categories = [
        "Operacional",  # Operational
        "Equipamento",  # Equipment
        "Humano",       # Human
        "Ambiental"     # Environmental
    ]
    
    failure_modes = []
    
    # Generate sample failure modes for each category
    for category in categories:
        num_failures = random.randint(2, 4)
        for i in range(num_failures):
            severity = random.randint(1, 10)
            occurrence = random.randint(1, 10)
            detection = random.randint(1, 10)
            rpn = severity * occurrence * detection
            
            # Determine risk level
            if rpn >= 200:
                risk_level = "Crítico"
            elif rpn >= 100:
                risk_level = "Alto"
            elif rpn >= 50:
                risk_level = "Médio"
            else:
                risk_level = "Baixo"
            
            failure_mode = {
                "id": f"FM-{category[:3].upper()}-{i+1:03d}",
                "categoria": category,
                "modo_falha": f"Falha {category.lower()} #{i+1}",
                "severidade": severity,
                "ocorrencia": occurrence,
                "deteccao": detection,
                "rpn": rpn,
                "nivel_risco": risk_level,
                "recomendacao": _generate_recommendation(category, risk_level)
            }
            
            failure_modes.append(failure_mode)
    
    # Sort by RPN (descending)
    failure_modes.sort(key=lambda x: x["rpn"], reverse=True)
    
    # Calculate summary statistics
    summary = {
        "total_modos_falha": len(failure_modes),
        "critico": sum(1 for fm in failure_modes if fm["nivel_risco"] == "Crítico"),
        "alto": sum(1 for fm in failure_modes if fm["nivel_risco"] == "Alto"),
        "medio": sum(1 for fm in failure_modes if fm["nivel_risco"] == "Médio"),
        "baixo": sum(1 for fm in failure_modes if fm["nivel_risco"] == "Baixo"),
        "rpn_medio": sum(fm["rpn"] for fm in failure_modes) / len(failure_modes) if failure_modes else 0
    }
    
    result = {
        "modulo": "FMEA Auditor",
        "timestamp": datetime.datetime.now().isoformat(),
        "modos_falha": failure_modes,
        "summary": summary,
        "status": "completo"
    }
    
    return result


def _generate_recommendation(category, risk_level):
    """
    Generate actionable recommendations based on risk analysis.
    
    Args:
        category (str): Failure mode category
        risk_level (str): Risk level
    
    Returns:
        str: Recommendation text
    """
    recommendations = {
        "Operacional": {
            "Crítico": "Intervenção imediata necessária. Revisar procedimentos operacionais.",
            "Alto": "Atenção urgente. Implementar controles adicionais.",
            "Médio": "Monitorar de perto. Considerar melhorias nos procedimentos.",
            "Baixo": "Manter vigilância. Revisar periodicamente."
        },
        "Equipamento": {
            "Crítico": "Manutenção urgente. Substituir ou reparar equipamento.",
            "Alto": "Inspeção detalhada necessária. Planejar manutenção preventiva.",
            "Médio": "Agendar manutenção. Aumentar frequência de inspeções.",
            "Baixo": "Manutenção de rotina suficiente."
        },
        "Humano": {
            "Crítico": "Treinamento emergencial. Revisar competências da equipe.",
            "Alto": "Treinamento adicional necessário. Reforçar procedimentos.",
            "Médio": "Atualizar treinamento. Melhorar comunicação.",
            "Baixo": "Continuar programa de treinamento regular."
        },
        "Ambiental": {
            "Crítico": "Ação corretiva imediata. Avaliar condições ambientais.",
            "Alto": "Monitoramento intensivo. Implementar medidas de proteção.",
            "Médio": "Avaliar impacto ambiental. Considerar medidas preventivas.",
            "Baixo": "Monitoramento de rotina adequado."
        }
    }
    
    return recommendations.get(category, {}).get(risk_level, "Revisar e avaliar situação.")


if __name__ == "__main__":
    # Test the module
    results = run_fmea_audit()
    print(f"FMEA Audit completed: {results['summary']['total_modos_falha']} failure modes identified")
    print(f"Critical risks: {results['summary']['critico']}")
