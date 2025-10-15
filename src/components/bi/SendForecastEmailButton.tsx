import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function SendForecastEmailButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setStatus(null);
    
    try {
      // First, get the trend data
      const { data: trendData, error: trendError } = await supabase.rpc("jobs_trend_by_month");

      if (trendError) {
        console.error("Error fetching trend data:", trendError);
        setStatus('❌ Erro ao buscar dados de tendência');
        setLoading(false);
        return;
      }

      // Then, generate the forecast using AI
      const { data: forecastData, error: forecastError } = await supabase.functions.invoke("jobs-forecast", {
        body: { trend: trendData }
      });

      if (forecastError) {
        console.error("Error generating forecast:", forecastError);
        setStatus('❌ Erro ao gerar previsão com IA');
        setLoading(false);
        return;
      }

      // In production, you would send the forecast via email here
      console.log("✅ Forecast generated:", forecastData);
      setStatus('✅ Previsão gerada com sucesso! (E-mail seria enviado em produção)');
    } catch (error) {
      console.error("Error in forecast generation:", error);
      setStatus('❌ Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
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
