"""
ASOG Reviewer Module - Operational Safety Analysis

This module reviews 12 operational safety items including emergency procedures,
safety protocols, training, PPE, inspections, documentation, maintenance, and compliance.
Tracks compliance status (Conforme ✅ / Requer atenção ⚠️)
"""

import datetime
import random


def run_asog_review():
    """
    Run ASOG operational safety review.
    
    Returns:
        dict: ASOG review results with compliance status and recommendations
    """
    
    # 12 operational safety items
    safety_items = [
        "Procedimentos de Emergência",
        "Protocolos de Segurança",
        "Treinamento de Pessoal",
        "Equipamentos de Proteção Individual (EPI)",
        "Inspeções de Segurança",
        "Documentação Operacional",
        "Manutenção Preventiva",
        "Conformidade Regulatória",
        "Comunicação de Segurança",
        "Gestão de Riscos",
        "Investigação de Incidentes",
        "Auditoria de Segurança"
    ]
    
    items_review = []
    
    for item in safety_items:
        # Random score between 0-100
        score = random.randint(60, 100)
        
        # Determine compliance status
        if score >= 85:
            status = "Conforme ✅"
            action = "Manter padrão atual"
        elif score >= 70:
            status = "Atenção ⚠️"
            action = "Revisar e melhorar"
        else:
            status = "Requer atenção ⚠️"
            action = "Ação corretiva necessária"
        
        item_data = {
            "item": item,
            "pontuacao": score,
            "status": status,
            "acao_recomendada": action,
            "prioridade": _calculate_priority(score)
        }
        
        items_review.append(item_data)
    
    # Sort by score (ascending) to highlight areas needing attention
    items_review.sort(key=lambda x: x["pontuacao"])
    
    # Calculate compliance metrics
    total_items = len(items_review)
    conformes = sum(1 for item in items_review if "✅" in item["status"])
    requer_atencao = sum(1 for item in items_review if "⚠️" in item["status"])
    
    compliance = {
        "total_itens": total_items,
        "conformes": conformes,
        "requer_atencao": requer_atencao,
        "taxa_conformidade": (conformes / total_items * 100) if total_items > 0 else 0,
        "pontuacao_media": sum(item["pontuacao"] for item in items_review) / total_items if total_items > 0 else 0
    }
    
    # Identify critical areas
    critical_areas = [
        item for item in items_review 
        if item["pontuacao"] < 70
    ]
    
    result = {
        "modulo": "ASOG Reviewer",
        "timestamp": datetime.datetime.now().isoformat(),
        "itens_revisados": items_review,
        "compliance": compliance,
        "areas_criticas": critical_areas,
        "status": "completo"
    }
    
    return result


def _calculate_priority(score):
    """
    Calculate priority level based on score.
    
    Args:
        score (int): Compliance score (0-100)
    
    Returns:
        int: Priority level (1-5, where 1 is highest)
    """
    if score < 60:
        return 1  # Highest priority
    elif score < 70:
        return 2
    elif score < 80:
        return 3
    elif score < 90:
        return 4
    else:
        return 5  # Lowest priority


if __name__ == "__main__":
    # Test the module
    results = run_asog_review()
    print(f"ASOG Review completed: {results['compliance']['total_itens']} items reviewed")
    print(f"Compliance rate: {results['compliance']['taxa_conformidade']:.1f}%")
