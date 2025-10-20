"""
Decision Core - FMEA Auditor
Performs Failure Mode and Effects Analysis for technical audits
"""

from datetime import datetime
import json


class FMEAAuditor:
    """FMEA (Failure Mode and Effects Analysis) auditor"""
    
    def __init__(self):
        self.components = [
            "Sistema Hidráulico",
            "Sistema Elétrico",
            "Sistema de Controle",
            "Sistema de Propulsão",
            "Sistema de Posicionamento Dinâmico",
            "Sistema de Navegação",
            "Sistema de Comunicação",
            "Sistema de Segurança",
            "Sistema de Emergência",
            "Sistema de Monitoramento",
            "Sistema de Automação",
            "Sistema Estrutural"
        ]
        
    def run_audit(self) -> dict:
        """
        Execute FMEA audit
        
        Returns:
            Audit results dictionary
        """
        failure_modes = []
        
        for i, component in enumerate(self.components, 1):
            # Simulate FMEA analysis
            severity = (i % 3) + 1  # 1-3 scale
            occurrence = ((i + 1) % 3) + 1
            detection = ((i + 2) % 3) + 1
            rpn = severity * occurrence * detection
            
            criticality = "High" if rpn >= 20 else "Medium" if rpn >= 10 else "Low"
            
            failure_mode = {
                "id": i,
                "component": component,
                "failure_mode": f"Falha operacional em {component}",
                "severity": severity,
                "occurrence": occurrence,
                "detection": detection,
                "rpn": rpn,
                "criticality": criticality,
                "recommendations": f"Revisar manutenção preventiva de {component}"
            }
            failure_modes.append(failure_mode)
            
        # Calculate statistics
        high_criticality = sum(1 for fm in failure_modes if fm["criticality"] == "High")
        medium_criticality = sum(1 for fm in failure_modes if fm["criticality"] == "Medium")
        low_criticality = sum(1 for fm in failure_modes if fm["criticality"] == "Low")
        
        audit_result = {
            "type": "FMEA_AUDIT",
            "timestamp": datetime.now().isoformat(),
            "total_components": len(self.components),
            "failure_modes": failure_modes,
            "statistics": {
                "high_criticality": high_criticality,
                "medium_criticality": medium_criticality,
                "low_criticality": low_criticality,
                "total_modes": len(failure_modes)
            },
            "status": "Completed"
        }
        
        return audit_result
        
    def save_report(self, audit_result: dict, filename: str = None) -> str:
        """
        Save audit report to file
        
        Args:
            audit_result: Audit result dictionary
            filename: Optional output filename
            
        Returns:
            Path to saved report
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"relatorio_fmea_{timestamp}.json"
            
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(audit_result, f, indent=2, ensure_ascii=False)
            
        return filename
