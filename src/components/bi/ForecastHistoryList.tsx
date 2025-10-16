import { useEffect, useState } from "react";

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
    fetch("/api/forecast/list")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Carregando previsões...</div>;
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📊 Histórico de Previsões</h2>
      {items.length === 0 && (
        <p className="text-gray-500">Nenhuma previsão registrada ainda.</p>
      )}
      {items.map(item => (
        <div key={item.id} className="border p-3 mb-2 rounded">
          <div className="text-sm text-gray-600">
            {new Date(item.created_at).toLocaleString()} — {item.source} por {item.created_by}
          </div>
          <div className="mt-2">{item.forecast_summary}</div>
        </div>
      ))}
    </div>
  );
}
