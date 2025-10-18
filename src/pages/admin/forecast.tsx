import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Brain, Calendar, Send, Clock } from "lucide-react";

export default function ForecastPage() {
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
              <Brain className="h-7 w-7 text-primary" />
              Forecast IA
            </h1>
            <p className="text-muted-foreground mt-2">
              Previsões automatizadas com GPT-4 e cron jobs integrados.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Previsões Ativas
                </CardTitle>
                <CardDescription>
                  Visualize previsões geradas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  O sistema gera previsões de manutenção baseadas em:
                </p>
                <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                  <li>Histórico de manutenções anteriores</li>
                  <li>Horímetros e ciclos de operação</li>
                  <li>Padrões identificados por IA</li>
                  <li>Recomendações de fabricantes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Execução Automática
                </CardTitle>
                <CardDescription>
                  Cron jobs configurados para execução periódica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tarefas automatizadas incluem:
                </p>
                <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                  <li>Geração diária de previsões</li>
                  <li>Envio de relatórios por email</li>
                  <li>Alertas de manutenções próximas</li>
                  <li>Atualização de dashboards</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Relatórios Automatizados
              </CardTitle>
              <CardDescription>
                Relatórios enviados automaticamente por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Os relatórios de forecast são enviados automaticamente para gestores e equipes de manutenção,
                incluindo previsões de jobs, análises de tendências e recomendações de ações.
              </p>
              <div className="flex gap-2">
                <Link to="/admin/bi">
                  <Button variant="outline">Ver Dashboard BI</Button>
                </Link>
                <Link to="/mmi/jobs">
                  <Button variant="outline">Ver Jobs MMI</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
