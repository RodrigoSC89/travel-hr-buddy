"""
FMEA (Failure Mode and Effects Analysis) Auditor for Nautilus One.
Technical auditing using FMEA methodology with RPN calculation.
"""

from datetime import datetime
from typing import Dict, List


class FMEAAuditor:
    """FMEA auditing module for failure mode analysis."""
    
    def __init__(self):
        """Initialize FMEA auditor."""
        self.categories = [
            "Operacional",
            "Equipamento",
            "Humano",
            "Ambiental"
        ]
    
    def run_audit(self) -> Dict:
        """
        Execute FMEA audit analysis.
        
        Returns:
            Dictionary containing audit results with failure modes and RPN scores
        """
        print("\n" + "="*80)
        print("AUDITORIA FMEA - FAILURE MODE AND EFFECTS ANALYSIS")
        print("="*80 + "\n")
        
        failure_modes = self._identify_failure_modes()
        results = self._analyze_failures(failure_modes)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "tipo": "FMEA Audit",
            "categorias": self.categories,
            "modos_falha": results,
            "total_modos": len(results),
            "resumo": self._generate_summary(results)
        }
    
    def _identify_failure_modes(self) -> List[Dict]:
        """
        Identify potential failure modes across categories.
        
        Returns:
            List of failure modes with initial data
        """
        failure_modes = [
            {
                "id": "FM001",
                "categoria": "Operacional",
                "modo": "Falha em procedimento de ancoragem",
                "causa": "Procedimento não atualizado",
                "efeito": "Perda de posicionamento",
                "severidade": 9,
                "ocorrencia": 3,
                "deteccao": 4
            },
            {
                "id": "FM002",
                "categoria": "Equipamento",
                "modo": "Falha em sistema hidráulico",
                "causa": "Falta de manutenção preventiva",
                "efeito": "Parada de operação",
                "severidade": 8,
                "ocorrencia": 4,
                "deteccao": 3
            },
            {
                "id": "FM003",
                "categoria": "Humano",
                "modo": "Erro em comunicação de turno",
                "causa": "Treinamento inadequado",
                "efeito": "Retrabalho e perda de tempo",
                "severidade": 6,
                "ocorrencia": 5,
                "deteccao": 5
            },
            {
                "id": "FM004",
                "categoria": "Ambiental",
                "modo": "Condições climáticas adversas",
                "causa": "Falta de previsão adequada",
                "efeito": "Atraso nas operações",
                "severidade": 7,
                "ocorrencia": 6,
                "deteccao": 2
            },
            {
                "id": "FM005",
                "categoria": "Operacional",
                "modo": "Falha em sistema de segurança",
                "causa": "Bypass de procedimentos",
                "efeito": "Risco de acidente",
                "severidade": 10,
                "ocorrencia": 2,
                "deteccao": 6
            }
        ]
        return failure_modes
    
    def _calculate_rpn(self, severidade: int, ocorrencia: int, deteccao: int) -> int:
        """
        Calculate Risk Priority Number (RPN).
        
        Args:
            severidade: Severity score (1-10)
            ocorrencia: Occurrence score (1-10)
            deteccao: Detection difficulty score (1-10)
            
        Returns:
            RPN score (1-1000)
        """
        return severidade * ocorrencia * deteccao
    
    def _get_priority_level(self, rpn: int) -> str:
        """
        Determine priority level based on RPN score.
        
        Args:
            rpn: Risk Priority Number
            
        Returns:
            Priority level string
        """
        if rpn >= 200:
            return "Crítico"
        elif rpn >= 100:
            return "Alto"
        elif rpn >= 50:
            return "Médio"
        else:
            return "Baixo"
    
    def _analyze_failures(self, failure_modes: List[Dict]) -> List[Dict]:
        """
        Analyze failure modes and calculate RPN.
        
        Args:
            failure_modes: List of identified failure modes
            
        Returns:
            List of analyzed failure modes with RPN and recommendations
        """
        results = []
        
        for fm in failure_modes:
            rpn = self._calculate_rpn(
                fm["severidade"],
                fm["ocorrencia"],
                fm["deteccao"]
            )
            
            priority = self._get_priority_level(rpn)
            
            result = {
                **fm,
                "rpn": rpn,
                "prioridade": priority,
                "recomendacoes": self._generate_recommendations(fm, rpn)
            }
            
            results.append(result)
            
            # Display result
            print(f"[{result['id']}] {result['modo']}")
            print(f"  Categoria: {result['categoria']}")
            print(f"  RPN: {rpn} ({priority})")
            print(f"  Severidade: {fm['severidade']} | Ocorrência: {fm['ocorrencia']} | Detecção: {fm['deteccao']}")
            print(f"  Recomendações: {', '.join(result['recomendacoes'])}")
            print()
        
        # Sort by RPN (highest first)
        results.sort(key=lambda x: x["rpn"], reverse=True)
        
        return results
    
    def _generate_recommendations(self, failure_mode: Dict, rpn: int) -> List[str]:
        """
        Generate recommendations based on failure mode and RPN.
        
        Args:
            failure_mode: Failure mode dictionary
            rpn: Risk Priority Number
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        if rpn >= 200:
            recommendations.append("Ação imediata requerida")
            recommendations.append("Implementar controles de mitigação")
        elif rpn >= 100:
            recommendations.append("Revisão prioritária")
            recommendations.append("Desenvolver plano de ação")
        
        if failure_mode["severidade"] >= 8:
            recommendations.append("Revisar procedimentos de segurança")
        
        if failure_mode["ocorrencia"] >= 5:
            recommendations.append("Implementar manutenção preventiva")
        
        if failure_mode["deteccao"] >= 5:
            recommendations.append("Melhorar sistemas de monitoramento")
        
        if not recommendations:
            recommendations.append("Manter monitoramento contínuo")
        
        return recommendations
    
    def _generate_summary(self, results: List[Dict]) -> Dict:
        """
        Generate summary statistics.
        
        Args:
            results: List of analyzed failure modes
            
        Returns:
            Summary dictionary with statistics
        """
        total = len(results)
        critico = sum(1 for r in results if r["prioridade"] == "Crítico")
        alto = sum(1 for r in results if r["prioridade"] == "Alto")
        medio = sum(1 for r in results if r["prioridade"] == "Médio")
        baixo = sum(1 for r in results if r["prioridade"] == "Baixo")
        
        avg_rpn = sum(r["rpn"] for r in results) / total if total > 0 else 0
        
        print("\n" + "-"*80)
        print("RESUMO DA AUDITORIA FMEA")
        print("-"*80)
        print(f"Total de modos de falha identificados: {total}")
        print(f"  - Crítico: {critico}")
        print(f"  - Alto: {alto}")
        print(f"  - Médio: {medio}")
        print(f"  - Baixo: {baixo}")
        print(f"RPN Médio: {avg_rpn:.2f}")
        print("-"*80 + "\n")
        
        return {
            "total": total,
            "critico": critico,
            "alto": alto,
            "medio": medio,
            "baixo": baixo,
            "rpn_medio": round(avg_rpn, 2)
        }


def run() -> Dict:
    """
    Execute FMEA audit.
    
    Returns:
        Audit results dictionary
    """
    auditor = FMEAAuditor()
    return auditor.run_audit()
