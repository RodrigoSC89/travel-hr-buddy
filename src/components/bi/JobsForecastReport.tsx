import { Card, CardContent } from "@/components/ui/card";

interface JobsForecastReportProps {
  forecastText: string;
}

export default function JobsForecastReport({ forecastText }: JobsForecastReportProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">🔮 Previsão de Manutenção</h2>
        <div className="text-sm text-muted-foreground">
          {forecastText || "Sem dados de previsão disponíveis."}
        </div>
      </CardContent>
    </Card>
  );
}
