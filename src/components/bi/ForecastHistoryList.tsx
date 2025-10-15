import { useEffect, useState } from 'react';

interface ForecastItem {
  id: number;
  forecast_summary: string;
  source: string;
  created_by: string;
  created_at: string;
}

export function ForecastHistoryList() {
  const [items, setItems] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forecast/list')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching forecasts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Carregando previsões...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">📊 Histórico de Previsões</h2>
      {items.length === 0 && <p className="text-sm text-slate-500">Nenhuma previsão registrada ainda.</p>}
      {items.map(item => (
        <div key={item.id} className="border rounded p-4 bg-slate-50 shadow-sm">
          <p className="text-sm text-slate-500">
            {new Date(item.created_at).toLocaleString()} — <strong>{item.source}</strong> por {item.created_by}
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap mt-2">{item.forecast_summary}</p>
        </div>
      ))}
    </div>
  );
}
