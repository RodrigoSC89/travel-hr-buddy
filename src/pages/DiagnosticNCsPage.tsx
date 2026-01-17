/**
 * DiagnosticNCsPage - Problema #3: NCs Não Fecham no Prazo
 */
import { NCAutomaticWorkflowAdvanced } from '@/components/compliance/diagnostic';

export default function DiagnosticNCsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">⚠️ Workflow Automático de NCs</h1>
        <p className="text-muted-foreground">
          100% das NCs no prazo - Abertura → Acompanhamento → Fechamento automático
        </p>
      </div>
      <NCAutomaticWorkflowAdvanced />
    </div>
  );
}
