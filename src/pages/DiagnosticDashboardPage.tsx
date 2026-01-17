/**
 * DiagnosticDashboardPage - Problema #5: Sem Visibilidade do Status
 */
import { RealTimeComplianceDashboard } from '@/components/compliance/diagnostic';

export default function DiagnosticDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📊 Dashboard de Compliance em Tempo Real</h1>
        <p className="text-muted-foreground">
          Visibilidade 100% do status de conformidade - decisões baseadas em dados
        </p>
      </div>
      <RealTimeComplianceDashboard />
    </div>
  );
}
