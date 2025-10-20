"""
FMEA Auditor Module - Failure Mode and Effects Analysis
Identifies failure modes, calculates RPN, and prioritizes risks
"""
from typing import Dict, List, Any
from datetime import datetime


class FMEAAuditor:
    """
    FMEA (Failure Mode and Effects Analysis) Auditor
    Performs technical auditing using FMEA methodology
    """
    
    CATEGORIES = [
        "Operacional",
        "Equipamento",
        "Humano",
        "Ambiental"
    ]
    
    def __init__(self):
        """Initialize FMEA Auditor"""
        self.results = []
        
    def run_audit(self) -> Dict[str, Any]:
        """
        Execute FMEA audit
        
        Returns:
            Audit results with failure modes and RPN calculations
        """
        print("\n" + "=" * 80)
        print("AUDITORIA FMEA - ANÁLISE DE MODOS DE FALHA E EFEITOS")
        print("=" * 80)
        
        # Simulate FMEA analysis for different categories
        failure_modes = self._identify_failure_modes()
        
        # Calculate RPN for each failure mode
        analyzed_modes = self._calculate_rpn(failure_modes)
        
        # Prioritize risks
        prioritized = self._prioritize_risks(analyzed_modes)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(prioritized)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "audit_type": "FMEA",
            "total_modes": len(failure_modes),
            "failure_modes": prioritized,
            "recommendations": recommendations,
            "summary": self._generate_summary(prioritized)
        }
        
        self.results = results
        self._display_results(results)
        
        return results
    
    def _identify_failure_modes(self) -> List[Dict[str, Any]]:
        """
        Identify failure modes across different categories
        
        Returns:
            List of identified failure modes
        """
        modes = [
            {
                "id": 1,
                "category": "Operacional",
                "mode": "Falha em procedimento de startup",
                "effect": "Atraso operacional, risco de segurança",
                "cause": "Procedimento não atualizado",
                "severity": 8,
                "occurrence": 4,
                "detection": 6
            },
            {
                "id": 2,
                "category": "Equipamento",
                "mode": "Falha em sistema hidráulico",
                "effect": "Parada não programada",
                "cause": "Manutenção preventiva inadequada",
                "severity": 9,
                "occurrence": 3,
                "detection": 4
            },
            {
                "id": 3,
                "category": "Humano",
                "mode": "Erro em comunicação entre turnos",
                "effect": "Perda de informação crítica",
                "cause": "Falta de protocolo padronizado",
                "severity": 6,
                "occurrence": 7,
                "detection": 5
            },
            {
                "id": 4,
                "category": "Ambiental",
                "mode": "Condições climáticas adversas",
                "effect": "Suspensão de operações",
                "cause": "Previsão meteorológica inadequada",
                "severity": 7,
                "occurrence": 5,
                "detection": 3
            },
            {
                "id": 5,
                "category": "Equipamento",
                "mode": "Desgaste prematuro de componentes",
                "effect": "Redução de vida útil",
                "cause": "Especificação incorreta de material",
                "severity": 5,
                "occurrence": 6,
                "detection": 7
            },
            {
                "id": 6,
                "category": "Operacional",
                "mode": "Calibração inadequada de instrumentos",
                "effect": "Medições incorretas",
                "cause": "Intervalo de calibração não cumprido",
                "severity": 7,
                "occurrence": 4,
                "detection": 5
            }
        ]
        
        return modes
    
    def _calculate_rpn(self, modes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate Risk Priority Number (RPN) for each failure mode
        RPN = Severity × Occurrence × Detection
        
        Args:
            modes: List of failure modes
            
        Returns:
            Modes with RPN calculated
        """
        for mode in modes:
            mode["rpn"] = mode["severity"] * mode["occurrence"] * mode["detection"]
        
        return modes
    
    def _prioritize_risks(self, modes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Prioritize risks based on RPN
        
        Args:
            modes: List of failure modes with RPN
            
        Returns:
            Sorted list from highest to lowest priority
        """
        # Sort by RPN (descending)
        sorted_modes = sorted(modes, key=lambda x: x["rpn"], reverse=True)
        
        # Assign priority levels
        for mode in sorted_modes:
            rpn = mode["rpn"]
            if rpn >= 200:
                mode["priority"] = "Crítico"
            elif rpn >= 100:
                mode["priority"] = "Alto"
            elif rpn >= 50:
                mode["priority"] = "Médio"
            else:
                mode["priority"] = "Baixo"
        
        return sorted_modes
    
    def _generate_recommendations(self, modes: List[Dict[str, Any]]) -> List[str]:
        """
        Generate recommendations based on prioritized risks
        
        Args:
            modes: Prioritized failure modes
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        critical_modes = [m for m in modes if m["priority"] == "Crítico"]
        if critical_modes:
            recommendations.append(
                f"AÇÃO IMEDIATA: {len(critical_modes)} modo(s) de falha crítico(s) identificado(s)"
            )
            for mode in critical_modes[:3]:  # Top 3
                recommendations.append(
                    f"  - {mode['mode']} (RPN={mode['rpn']}): Implementar ação corretiva urgente"
                )
        
        high_modes = [m for m in modes if m["priority"] == "Alto"]
        if high_modes:
            recommendations.append(
                f"PRIORIDADE ALTA: {len(high_modes)} modo(s) de falha requer(em) atenção"
            )
        
        recommendations.append("Implementar programa de manutenção preventiva")
        recommendations.append("Revisar procedimentos operacionais")
        recommendations.append("Realizar treinamento adicional da equipe")
        
        return recommendations
    
    def _generate_summary(self, modes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate summary statistics
        
        Args:
            modes: Failure modes
            
        Returns:
            Summary dictionary
        """
        return {
            "total": len(modes),
            "critico": len([m for m in modes if m["priority"] == "Crítico"]),
            "alto": len([m for m in modes if m["priority"] == "Alto"]),
            "medio": len([m for m in modes if m["priority"] == "Médio"]),
            "baixo": len([m for m in modes if m["priority"] == "Baixo"]),
            "rpn_medio": sum(m["rpn"] for m in modes) / len(modes) if modes else 0
        }
    
    def _display_results(self, results: Dict[str, Any]) -> None:
        """
        Display audit results
        
        Args:
            results: Audit results
        """
        print(f"\nRESULTADOS DA AUDITORIA FMEA")
        print("-" * 80)
        print(f"Total de modos de falha: {results['total_modes']}")
        print(f"RPN médio: {results['summary']['rpn_medio']:.1f}")
        print(f"\nDistribuição por prioridade:")
        print(f"  Crítico: {results['summary']['critico']}")
        print(f"  Alto: {results['summary']['alto']}")
        print(f"  Médio: {results['summary']['medio']}")
        print(f"  Baixo: {results['summary']['baixo']}")
        
        print(f"\nTop 3 Riscos Prioritários:")
        for i, mode in enumerate(results['failure_modes'][:3], 1):
            print(f"{i}. {mode['mode']} - RPN: {mode['rpn']} ({mode['priority']})")
        
        print(f"\nRecomendações:")
        for i, rec in enumerate(results['recommendations'][:5], 1):
            print(f"{i}. {rec}")
        
        print("=" * 80 + "\n")


def run_fmea_audit() -> Dict[str, Any]:
    """
    Convenience function to run FMEA audit
    
    Returns:
        Audit results
    """
    auditor = FMEAAuditor()
    return auditor.run_audit()
