import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SendForecastEmailButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setStatus(null);
    
    try {
      const res = await fetch('/api/cron/send-forecast-report');
      const json = await res.json();
      
      if (json.sent) {
        setStatus('✅ E-mail enviado com sucesso!');
        toast.success('E-mail de previsão enviado com sucesso!');
      } else {
        setStatus('❌ Falha no envio: ' + (json.error || 'Erro desconhecido'));
        toast.error('Falha ao enviar e-mail de previsão');
      }
    } catch (error) {
      setStatus('❌ Falha no envio: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      toast.error('Erro ao enviar e-mail de previsão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSend} 
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? 'Enviando...' : '📧 Disparar Previsão por E-mail'}
      </Button>
      
      {status && (
        <div className={`p-4 rounded-lg ${status.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
