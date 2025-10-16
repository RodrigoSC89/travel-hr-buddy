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
  const [sourceFilter, setSourceFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (sourceFilter) params.append("source", sourceFilter);
    if (createdByFilter) params.append("created_by", createdByFilter);

    fetch(`/api/forecast/list?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching forecast history:", error);
        setLoading(false);
      });
  }, [sourceFilter, createdByFilter]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📊 Histórico de Previsões</h2>
      
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por origem (source)"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Filtrar por responsável (created_by)"
          value={createdByFilter}
          onChange={(e) => setCreatedByFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p>Carregando previsões...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma previsão encontrada com os filtros atuais.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="border rounded p-4 bg-slate-50 shadow-sm">
              <p className="text-sm text-slate-500">
                {new Date(item.created_at).toLocaleString()} — <strong>{item.source}</strong> por {item.created_by}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mt-2">{item.forecast_summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
