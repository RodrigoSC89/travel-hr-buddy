import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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
    async function fetchForecasts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (sourceFilter) params.append("source", sourceFilter);
        if (createdByFilter) params.append("created_by", createdByFilter);

        const response = await fetch(`/api/forecast/list?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setItems(data || []);
        } else {
          console.error("Error fetching forecasts:", data.error);
          setItems([]);
        }
      } catch (error) {
        console.error("Error fetching forecasts:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchForecasts();
  }, [sourceFilter, createdByFilter]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Histórico de Previsões</h2>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Input
            type="text"
            placeholder="Filtrar por fonte..."
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
          <Input
            type="text"
            placeholder="Filtrar por criador..."
            value={createdByFilter}
            onChange={(e) => setCreatedByFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">🔍</p>
            <p>Nenhuma previsão encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-600">{item.source}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.forecast_summary}</p>
                <div className="text-xs text-gray-500">
                  <span>👤 {item.created_by}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
