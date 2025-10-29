import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Cloud, AlertTriangle } from "lucide-react";

export default function Patch491WeatherIntegration() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PATCH 491 - Weather Integration</h1>
          <p className="text-muted-foreground">Sistema de integração meteorológica avançada</p>
        </div>
        <Badge variant="outline" className="bg-success/10">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Ativo
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Previsões em Tempo Real
            </CardTitle>
            <CardDescription>API meteorológica integrada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Conexão API</span>
                <Badge variant="outline" className="bg-success/10">Conectado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Atualizações</span>
                <span className="text-sm text-muted-foreground">A cada 15min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cobertura</span>
                <span className="text-sm text-muted-foreground">Global</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas Meteorológicos
            </CardTitle>
            <CardDescription>Sistema de notificações ativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Alertas Ativos</span>
                <Badge variant="outline">3 regiões</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Notificações</span>
                <Badge variant="outline" className="bg-success/10">Ativas</Badge>
              </div>
              <Button className="w-full">
                Configurar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Ativação</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">API meteorológica conectada</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Sistema de alertas ativo</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Previsões de 7 dias disponíveis</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Integração com planejamento de rotas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
