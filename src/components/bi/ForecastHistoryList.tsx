import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching forecast history:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Carregando previsões...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">📊 Histórico de Previsões</h2>
        {items.length === 0 && (
          <p className="text-muted-foreground">Nenhuma previsão registrada ainda.</p>
        )}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 bg-card hover:bg-accent transition-colors"
            >
              <div className="text-sm text-muted-foreground mb-2">
                {new Date(item.created_at).toLocaleString()} — {item.source} por{" "}
                {item.created_by}
              </div>
              <p className="text-sm">{item.forecast_summary}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
