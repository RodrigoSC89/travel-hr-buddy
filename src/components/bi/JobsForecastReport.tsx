import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Calendar, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForecastItem {
  component: string;
  prediction: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
}

const mockForecastData: ForecastItem[] = [
  {
    component: "Gerador Principal",
    prediction: "Provável falha nas próximas 48h baseado em padrões históricos",
    action: "Agendar inspeção preventiva imediata",
    priority: "critical"
  },
  {
    component: "Sistema Hidráulico",
    prediction: "Manutenção preventiva recomendada em 7 dias",
    action: "Preparar equipe e materiais necessários",
    priority: "high"
  },
  {
    component: "Propulsão",
    prediction: "Desempenho normal, próxima revisão em 30 dias",
    action: "Monitoramento contínuo de parâmetros",
    priority: "medium"
  },
  {
    component: "Climatização",
    prediction: "Tendência de aumento no consumo energético",
    action: "Verificar eficiência do sistema na próxima semana",
    priority: "low"
  }
];

const priorityColors = {
  critical: "border-red-500 bg-red-50",
  high: "border-orange-500 bg-orange-50",
  medium: "border-yellow-500 bg-yellow-50",
  low: "border-blue-500 bg-blue-50"
};

const priorityIcons = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵"
};

export default function JobsForecastReport() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">🔮 Previsão IA com Ações Preventivas</h2>
      <CardContent>
        <Alert className="mb-4 border-blue-500 bg-blue-50">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Análise preditiva baseada em dados históricos e padrões de falhas dos últimos 6 meses
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {mockForecastData.map((item, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-r-lg ${priorityColors[item.priority]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{priorityIcons[item.priority]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4" />
                    <h3 className="font-semibold">{item.component}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Previsão:</span>
                        <p className="text-muted-foreground">{item.prediction}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Ação Recomendada:</span>
                        <p className="text-muted-foreground">{item.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumo Geral
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total de Previsões:</span>
              <span className="ml-2 font-semibold">{mockForecastData.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ações Críticas:</span>
              <span className="ml-2 font-semibold text-red-600">
                {mockForecastData.filter(item => item.priority === "critical").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Alta Prioridade:</span>
              <span className="ml-2 font-semibold text-orange-600">
                {mockForecastData.filter(item => item.priority === "high").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Taxa de Acerto IA:</span>
              <span className="ml-2 font-semibold text-green-600">87%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
