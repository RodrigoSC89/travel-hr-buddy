import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Calendar } from "lucide-react";

export default function Patch494CrewManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PATCH 494 - Crew Management</h1>
          <p className="text-muted-foreground">Gestão avançada de tripulação</p>
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
              <Users className="w-5 h-5" />
              Tripulação Ativa
            </CardTitle>
            <CardDescription>Status da equipe em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Membros Ativos</span>
                <Badge variant="outline">48 embarcados</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Certificações Válidas</span>
                <span className="text-sm text-muted-foreground">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Treinamentos Pendentes</span>
                <span className="text-sm text-muted-foreground">3 agendados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gestão de Escalas
            </CardTitle>
            <CardDescription>Planejamento inteligente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Escalas Ativas</span>
                <Badge variant="outline">6 embarcações</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próxima Rotação</span>
                <span className="text-sm text-muted-foreground">Em 5 dias</span>
              </div>
              <Button className="w-full">
                Gerenciar Escalas
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
              <span className="text-sm">Base de dados de tripulação sincronizada</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Sistema de escalas automatizado</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Rastreamento de certificações ativo</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Portal de tripulação acessível</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
