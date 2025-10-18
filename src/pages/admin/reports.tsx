import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileText, BarChart3, Mail, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              Relatórios Inteligentes
            </h1>
            <p className="text-muted-foreground mt-2">
              Geração e exportação de relatórios em PDF com dados reais.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Logs de Restore
                </CardTitle>
                <CardDescription>
                  Relatórios de execução de tarefas restore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/reports/logs">
                  <Button className="w-full">Acessar Logs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Relatórios de Assistente
                </CardTitle>
                <CardDescription>
                  Logs de interações com IA Assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/reports/assistant">
                  <Button className="w-full">Ver Relatórios</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dashboard Logs
                </CardTitle>
                <CardDescription>
                  Logs de atividades do dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/reports/dashboard-logs">
                  <Button className="w-full">Visualizar Logs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Restore
                </CardTitle>
                <CardDescription>
                  Análise de dados de restore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/reports/restore-analytics">
                  <Button className="w-full">Ver Analytics</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportação de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Todos os relatórios podem ser exportados em diversos formatos:
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                <li>PDF com gráficos e tabelas formatadas</li>
                <li>CSV para análise em planilhas</li>
                <li>JSON para integração com sistemas</li>
                <li>Envio automático por email</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
