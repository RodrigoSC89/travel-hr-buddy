import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, FileText } from "lucide-react";

export default function Patch493ComplianceTracker() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PATCH 493 - Compliance Tracker</h1>
          <p className="text-muted-foreground">Rastreamento de conformidade regulatória</p>
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
              <Shield className="w-5 h-5" />
              Status de Conformidade
            </CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Nível Geral</span>
                <Badge variant="outline" className="bg-success/10">98% Conforme</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Certificações Ativas</span>
                <span className="text-sm text-muted-foreground">24 válidas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próximas Renovações</span>
                <span className="text-sm text-muted-foreground">3 em 30 dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentação
            </CardTitle>
            <CardDescription>Gestão de documentos regulatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Documentos Válidos</span>
                <Badge variant="outline">156 ativos</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auditorias Passadas</span>
                <span className="text-sm text-muted-foreground">18/18 aprovadas</span>
              </div>
              <Button className="w-full">
                Gerar Relatório de Conformidade
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
              <span className="text-sm">Sistema de rastreamento ativo</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Alertas de vencimento configurados</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Base de dados regulatória atualizada</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm">Relatórios automáticos funcionais</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
