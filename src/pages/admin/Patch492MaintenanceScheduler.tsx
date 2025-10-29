import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Wrench } from "lucide-react";

export default function Patch492MaintenanceScheduler() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PATCH 492 - Maintenance Scheduler</h1>
          <p className="text-muted-foreground">Agendamento inteligente de manutenções</p>
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
              <Calendar className="w-5 h-5" />
              Agendamento Automático
            </CardTitle>
            <CardDescription>Sistema de planejamento ativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Manutenções Agendadas</span>
                <Badge variant="outline">12 ativas</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próxima Manutenção</span>
                <span className="text-sm text-muted-foreground">Em 3 dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de Conclusão</span>
                <span className="text-sm text-muted-foreground">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Manutenção Preditiva
            </CardTitle>
            <CardDescription>IA prevendo necessidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Previsões Ativas</span>
                <Badge variant="outline">8 componentes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Precisão do Modelo</span>
                <span className="text-sm text-muted-foreground">89%</span>
              </div>
              <Button className="w-full">
                Ver Análises Preditivas
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
              <span className="text-sm">Sistema de agendamento configurado</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Notificações automáticas ativas</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">IA preditiva treinada</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Integração com inventário ativa</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
