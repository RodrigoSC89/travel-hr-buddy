/**
 * AI Audit Page - Auditoria de IA
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileText, Clock, User, Shield } from "lucide-react";

const auditLogs = [
  { id: 1, action: "Documento analisado", user: "Sistema", time: "5 min atrás", status: "success" },
  { id: 2, action: "Previsão de manutenção", user: "AI Agent", time: "12 min atrás", status: "success" },
  { id: 3, action: "Alerta de compliance", user: "Sistema", time: "1h atrás", status: "warning" },
  { id: 4, action: "Otimização de rota", user: "AI Agent", time: "2h atrás", status: "success" },
  { id: 5, action: "Análise de tripulação", user: "Sistema", time: "3h atrás", status: "success" },
];

export default function AIAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Auditoria de IA</h2>
          <p className="text-muted-foreground">Logs e registros de todas as ações de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">1,234</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">98.5%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-yellow-500">3</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
          <CardDescription>Últimas ações registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.user}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={log.status === "success" ? "default" : "secondary"}>
                  {log.status === "success" ? "Sucesso" : "Alerta"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
