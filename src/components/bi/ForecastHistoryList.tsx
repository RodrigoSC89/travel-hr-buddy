import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
    const fetchForecasts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (sourceFilter) params.append("source", sourceFilter);
        if (createdByFilter) params.append("created_by", createdByFilter);

        const response = await fetch(`/api/forecast/list?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setItems(data);
        } else {
          console.error("Error fetching forecasts:", data);
          setItems([]);
        }
      } catch (error) {
        console.error("Error fetching forecasts:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, [sourceFilter, createdByFilter]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Histórico de Previsões</h2>
      
      <CardContent>
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <Input
            type="text"
            placeholder="Filtrar por origem..."
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
          <Input
            type="text"
            placeholder="Filtrar por responsável..."
            value={createdByFilter}
            onChange={(e) => setCreatedByFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma previsão encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                  <span>
                    {new Date(item.created_at).toLocaleString("pt-BR")}
                  </span>
                  <span className="font-medium">
                    {item.source} por {item.created_by}
                  </span>
                </div>
                <p className="text-gray-800">{item.forecast_summary}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
