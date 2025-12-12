import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Wind, 
  Waves, 
  Thermometer, 
  Eye, 
  CloudLightning,
  ChevronRight,
  Bell,
  Clock
} from "lucide-react";

interface WeatherAlert {
  id: string;
  type: "storm" | "wind" | "waves" | "visibility" | "temperature" | "lightning";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  location: string;
  validFrom: Date;
  validUntil: Date;
  source: string;
}

const demoAlerts: WeatherAlert[] = [
  {
    id: "1",
    type: "wind",
    severity: "warning",
    title: "Aviso de Vento Forte",
    description: "Ventos de até 35 nós previstos para o período da tarde. Operações de guindastes podem ser afetadas.",
    location: "Costa de Santos",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
    source: "Marinha do Brasil"
  },
  {
    id: "2",
    type: "waves",
    severity: "info",
    title: "Ondulação Aumentada",
    description: "Ondas de 2.0 a 2.5 metros previstas para as próximas 24 horas.",
    location: "Bacia de Campos",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    source: "CHM"
  },
  {
    id: "3",
    type: "visibility",
    severity: "warning",
    title: "Nevoeiro Previsto",
    description: "Redução de visibilidade para menos de 1km durante a madrugada.",
    location: "Porto de Rio Grande",
    validFrom: new Date(Date.now() + 8 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 14 * 60 * 60 * 1000),
    source: "INMET"
  },
];

const alertIcons: Record<string, React.ElementType> = {
  storm: CloudLightning,
  wind: Wind,
  waves: Waves,
  visibility: Eye,
  temperature: Thermometer,
  lightning: CloudLightning,
};

const severityStyles: Record<string, { bg: string; text: string; border: string; badge: "default" | "secondary" | "destructive" }> = {
  info: { 
    bg: "bg-blue-50 dark:bg-blue-950/30", 
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    badge: "secondary"
  },
  warning: { 
    bg: "bg-orange-50 dark:bg-orange-950/30", 
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    badge: "default"
  },
  critical: { 
    bg: "bg-red-50 dark:bg-red-950/30", 
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    badge: "destructive"
  },
};

export const MaritimeWeatherAlerts: React.FC = () => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Meteorológicos Marítimos
          </CardTitle>
          <Badge variant="outline">
            {demoAlerts.length} alertas ativos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta meteorológico ativo</p>
          </div>
        ) : (
          demoAlerts.map((alert) => {
            const Icon = alertIcons[alert.type] || AlertTriangle;
            const style = severityStyles[alert.severity];
            
            return (
              <Card 
                key={alert.id} 
                className={`${style.bg} ${style.border} border`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                      <Icon className={`h-6 w-6 ${style.text}`} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${style.text}`}>{alert.title}</h4>
                          <Badge variant={style.badge}>
                            {alert.severity === "critical" ? "Crítico" : 
                              alert.severity === "warning" ? "Atenção" : "Informativo"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          📍 {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(alert.validFrom)} {formatTime(alert.validFrom)} - {formatTime(alert.validUntil)}
                        </span>
                        <span>
                          Fonte: {alert.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm">
            Ver todos os alertas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
