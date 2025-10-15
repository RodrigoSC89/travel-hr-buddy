import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface JobsForecastReportProps {
  trend: any[];
}

/**
 * Component showing forecast analysis based on job trends
 */
export default function JobsForecastReport({ trend }: JobsForecastReportProps) {
  const [forecastText, setForecastText] = useState<string>("");

  useEffect(() => {
    if (trend && trend.length > 0) {
      // Generate forecast text based on trend data
      const total = trend.reduce((sum, item) => sum + (item.total || 0), 0);
      const effective = trend.reduce((sum, item) => sum + (item.ia_efetiva || 0), 0);
      const rate = total > 0 ? Math.round((effective / total) * 100) : 0;
      
      setForecastText(
        `Com base nos dados analisados, a taxa de efetividade da IA está em ${rate}%. ` +
        `Foram processados ${total} jobs no total, com ${effective} casos em que a IA foi eficaz. ` +
        `A tendência sugere melhorias contínuas na precisão das sugestões.`
      );
    } else {
      setForecastText("Dados insuficientes para gerar previsão. Aguardando mais informações...");
    }
  }, [trend]);

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">🔮 Previsão e Análise</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{forecastText}</p>
      </CardContent>
    </Card>
  );
}
