"""
ASOG Review Module - Operational Safety Analysis
Reviews operational items, tracks compliance, and identifies attention areas
"""
from typing import Dict, List, Any
from datetime import datetime


class ASOGReviewer:
    """
    ASOG (Análise de Segurança Operacional e Gestão) Reviewer
    Performs operational safety analysis
    """
    
    OPERATIONAL_ITEMS = [
        "Procedimentos de emergência",
        "Protocolos de segurança",
        "Treinamento da equipe",
        "Equipamentos de proteção individual",
        "Inspeções periódicas",
        "Documentação técnica",
        "Comunicação de turnos",
        "Manutenção preventiva",
        "Gestão de riscos",
        "Resposta a incidentes",
        "Auditorias internas",
        "Conformidade regulatória"
    ]
    
    def __init__(self):
        """Initialize ASOG Reviewer"""
        self.results = []
        
    def run_review(self) -> Dict[str, Any]:
        """
        Execute ASOG operational safety review
        
        Returns:
            Review results with compliance status
        """
        print("\n" + "=" * 80)
        print("REVISÃO ASOG - ANÁLISE DE SEGURANÇA OPERACIONAL E GESTÃO")
        print("=" * 80)
        
        # Review operational items
        items_status = self._review_operational_items()
        
        # Calculate compliance
        compliance = self._calculate_compliance(items_status)
        
        # Identify attention areas
        attention_areas = self._identify_attention_areas(items_status)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(items_status, compliance)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "review_type": "ASOG",
            "total_items": len(items_status),
            "items_status": items_status,
            "compliance": compliance,
            "attention_areas": attention_areas,
            "recommendations": recommendations
        }
        
        self.results = results
        self._display_results(results)
        
        return results
    
    def _review_operational_items(self) -> List[Dict[str, Any]]:
        """
        Review operational items and assess compliance
        
        Returns:
            List of items with status
        """
        # Simulate review with varying compliance levels
        import random
        random.seed(42)  # For consistent results
        
        items = []
        for i, item in enumerate(self.OPERATIONAL_ITEMS, 1):
            # Simulate compliance status
            score = random.randint(60, 100)
            
            status = {
                "id": i,
                "item": item,
                "score": score,
                "status": "Conforme ✅" if score >= 80 else "Requer atenção ⚠️",
                "last_review": datetime.now().strftime("%Y-%m-%d"),
                "notes": self._generate_notes(item, score)
            }
            
            items.append(status)
        
        return items
    
    def _generate_notes(self, item: str, score: int) -> str:
        """
        Generate notes based on item and score
        
        Args:
            item: Item name
            score: Compliance score
            
        Returns:
            Notes string
        """
        if score >= 90:
            return "Excelente conformidade. Manter padrão."
        elif score >= 80:
            return "Conforme. Pequenos ajustes recomendados."
        elif score >= 70:
            return "Atenção necessária. Revisar procedimentos."
        else:
            return "Ação corretiva urgente necessária."
    
    def _calculate_compliance(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall compliance metrics
        
        Args:
            items: List of reviewed items
            
        Returns:
            Compliance metrics
        """
        total = len(items)
        conformes = len([i for i in items if "Conforme" in i["status"]])
        atencao = total - conformes
        
        avg_score = sum(i["score"] for i in items) / total if total > 0 else 0
        
        return {
            "total_items": total,
            "conformes": conformes,
            "requer_atencao": atencao,
            "taxa_conformidade": (conformes / total * 100) if total > 0 else 0,
            "score_medio": avg_score
        }
    
    def _identify_attention_areas(self, items: List[Dict[str, Any]]) -> List[str]:
        """
        Identify areas requiring attention
        
        Args:
            items: List of reviewed items
            
        Returns:
            List of attention areas
        """
        attention = []
        
        for item in items:
            if "Requer atenção" in item["status"]:
                attention.append(f"{item['item']} (Score: {item['score']})")
        
        return attention
    
    def _generate_recommendations(
        self,
        items: List[Dict[str, Any]],
        compliance: Dict[str, Any]
    ) -> List[str]:
        """
        Generate recommendations based on review
        
        Args:
            items: Reviewed items
            compliance: Compliance metrics
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        if compliance["taxa_conformidade"] < 80:
            recommendations.append(
                "URGENTE: Taxa de conformidade abaixo de 80%. Implementar plano de ação imediato."
            )
        
        # Focus on lowest scoring items
        sorted_items = sorted(items, key=lambda x: x["score"])
        lowest = sorted_items[:3]
        
        recommendations.append(
            f"Priorizar melhorias em: {', '.join([i['item'] for i in lowest])}"
        )
        
        # General recommendations
        recommendations.extend([
            "Realizar treinamento de atualização para toda equipe",
            "Revisar e atualizar documentação operacional",
            "Implementar auditorias mensais de conformidade",
            "Estabelecer indicadores de desempenho (KPIs) de segurança",
            "Criar canal de comunicação para reporte de não-conformidades"
        ])
        
        return recommendations
    
    def _display_results(self, results: Dict[str, Any]) -> None:
        """
        Display review results
        
        Args:
            results: Review results
        """
        print(f"\nRESULTADOS DA REVISÃO ASOG")
        print("-" * 80)
        print(f"Total de itens revisados: {results['compliance']['total_items']}")
        print(f"Taxa de conformidade: {results['compliance']['taxa_conformidade']:.1f}%")
        print(f"Score médio: {results['compliance']['score_medio']:.1f}")
        print(f"\nStatus:")
        print(f"  Conformes: {results['compliance']['conformes']} ✅")
        print(f"  Requer atenção: {results['compliance']['requer_atencao']} ⚠️")
        
        if results['attention_areas']:
            print(f"\nÁreas que requerem atenção:")
            for i, area in enumerate(results['attention_areas'][:5], 1):
                print(f"{i}. {area}")
        
        print(f"\nRecomendações:")
        for i, rec in enumerate(results['recommendations'][:5], 1):
            print(f"{i}. {rec}")
        
        print("=" * 80 + "\n")


def run_asog_review() -> Dict[str, Any]:
    """
    Convenience function to run ASOG review
    
    Returns:
        Review results
    """
    reviewer = ASOGReviewer()
    return reviewer.run_review()
