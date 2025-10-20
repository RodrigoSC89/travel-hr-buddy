"""
FMEA (Failure Mode and Effects Analysis) Auditor module
Performs technical auditing using FMEA methodology
"""
from datetime import datetime
from core.logger import log_event


class FMEAAuditor:
    """
    Auditor for FMEA analysis
    Evaluates failure modes, effects, and criticality
    """
    
    def __init__(self):
        self.audit_data = []
        self.start_time = None
        
    def run(self):
        """
        Executes FMEA audit process
        """
        self.start_time = datetime.now()
        log_event("Iniciando auditoria FMEA")
        
        print("\n🔍 FMEA - Auditoria Técnica")
        print("=" * 80)
        
        # Simulate FMEA audit steps
        self._analyze_failure_modes()
        self._calculate_risk_priority()
        self._generate_recommendations()
        
        log_event("Auditoria FMEA concluída")
        print("\n✅ Auditoria FMEA concluída com sucesso")
        print(f"⏱️  Tempo de execução: {(datetime.now() - self.start_time).seconds}s")
    
    def _analyze_failure_modes(self):
        """
        Analyzes potential failure modes
        """
        print("\n📋 Analisando modos de falha...")
        
        failure_modes = [
            "Falha de equipamento crítico",
            "Erro humano operacional",
            "Falha de comunicação",
            "Condições ambientais adversas"
        ]
        
        for i, mode in enumerate(failure_modes, 1):
            self.audit_data.append({
                "id": i,
                "mode": mode,
                "severity": self._calculate_severity(i),
                "occurrence": self._calculate_occurrence(i),
                "detection": self._calculate_detection(i)
            })
            print(f"  {i}. {mode}")
        
        log_event(f"Analisados {len(failure_modes)} modos de falha")
    
    def _calculate_severity(self, mode_id):
        """Calculate severity score (1-10)"""
        # Simplified calculation
        return min(10, mode_id * 2)
    
    def _calculate_occurrence(self, mode_id):
        """Calculate occurrence probability (1-10)"""
        # Simplified calculation
        return min(10, mode_id + 3)
    
    def _calculate_detection(self, mode_id):
        """Calculate detection difficulty (1-10)"""
        # Simplified calculation
        return min(10, 11 - mode_id)
    
    def _calculate_risk_priority(self):
        """
        Calculates Risk Priority Number (RPN) for each failure mode
        RPN = Severity × Occurrence × Detection
        """
        print("\n📊 Calculando prioridade de risco (RPN)...")
        
        for item in self.audit_data:
            rpn = item["severity"] * item["occurrence"] * item["detection"]
            item["rpn"] = rpn
            print(f"  Modo {item['id']}: RPN = {rpn} " + 
                  f"(S:{item['severity']} × O:{item['occurrence']} × D:{item['detection']})")
        
        log_event("RPNs calculados")
    
    def _generate_recommendations(self):
        """
        Generates recommendations based on audit findings
        """
        print("\n💡 Recomendações:")
        
        # Sort by RPN (highest first)
        sorted_data = sorted(self.audit_data, key=lambda x: x["rpn"], reverse=True)
        
        for item in sorted_data[:3]:  # Top 3 critical items
            print(f"  🔴 Prioridade Alta - {item['mode']}")
            print(f"     → Implementar controles preventivos")
            print(f"     → RPN: {item['rpn']}")
        
        log_event("Recomendações geradas")
