import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TestForecastMockButton() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  async function handleRunTest() {
    setLoading(true);
    try {
      const res = await fetch('/api/dev/test-forecast-with-mock');
      const json = await res.json();
      setOutput(json.forecast || 'Sem resposta da IA');
    } catch (error) {
      setOutput(`Erro ao executar teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleRunTest} disabled={loading}>
        {loading ? 'Executando IA...' : '🧪 Testar Forecast com Mock'}
      </Button>
      {output && (
        <div className="whitespace-pre-wrap rounded border p-4 text-sm bg-slate-50">
          {output}
        </div>
      )}
    </div>
  );
}
