import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SendForecastEmailButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    const res = await fetch('/api/cron/send-forecast-report');
    const json = await res.json();
    setStatus(json.sent ? '✅ E-mail enviado com sucesso!' : '❌ Falha no envio');
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleSend} disabled={loading}>
        {loading ? 'Enviando...' : '📧 Disparar Previsão por E-mail'}
      </Button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </div>
  );
}
