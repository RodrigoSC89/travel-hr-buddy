import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

export default function ComplianceDashboard() {
  const [status, setStatus] = useState({ score: 0, complianceLevel: "Carregando..." });

  useEffect(() => {
    async function audit() {
      const result = await runComplianceAudit([0.9, 0.85, 0.78, 0.92, 0.8]);
      setStatus(result);
    }
    audit();
  }, []);

  const icon =
    status.complianceLevel === "Conforme" ? <CheckCircle className="text-success" /> :
      status.complianceLevel === "Risco" ? <AlertTriangle className="text-warning" /> :
        <XCircle className="text-destructive" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <Gauge /> Auditoria de Conformidade – Nautilus AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">{icon}<span className="text-xl font-semibold">{status.complianceLevel}</span></div>
          <span className="text-xl font-mono">{(status.score * 100).toFixed(1)}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Auditoria baseada em: IMCA, IMO, MTS, ISM, ISPS e NORMAM 101.
        </p>
      </CardContent>
    </Card>
  );
}
