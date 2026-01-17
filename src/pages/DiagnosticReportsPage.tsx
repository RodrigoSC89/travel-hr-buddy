/**
 * DiagnosticReportsPage - Problema #2: Relatórios Levam Horas
 */
import { AutomaticReportsGenerator } from '@/components/compliance/diagnostic';

export default function DiagnosticReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📈 Relatórios Automáticos</h1>
        <p className="text-muted-foreground">
          De 4 horas para menos de 1 minuto - sem copiar dados de múltiplas planilhas
        </p>
      </div>
      <AutomaticReportsGenerator />
    </div>
  );
}
