import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Wrench, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function MMIModule() {
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
              <Wrench className="h-7 w-7 text-primary" />
              MMI - Manutenção Inteligente
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestão de manutenção baseada em IA, horímetros e previsão.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Painel de Jobs
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie jobs de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/mmi/jobs">
                  <Button className="w-full">Acessar Painel</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Business Intelligence
                </CardTitle>
                <CardDescription>
                  Análise de dados e relatórios MMI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/mmi/bi">
                  <Button className="w-full">Ver Dashboard BI</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Criação com IA
                </CardTitle>
                <CardDescription>
                  Criar jobs com exemplos similares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/mmi/job-creation-demo">
                  <Button className="w-full">Criar Job</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recursos do MMI</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                <li>Gestão de manutenção preventiva e corretiva</li>
                <li>Controle de horímetros e ciclos de operação</li>
                <li>Previsão de manutenções com IA</li>
                <li>Histórico completo de manutenções</li>
                <li>Integração com sistemas de embarcações</li>
                <li>Relatórios e exportação de dados</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
