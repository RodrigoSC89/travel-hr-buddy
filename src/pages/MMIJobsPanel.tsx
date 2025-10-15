import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TrendingUp, CheckCircle, Clock } from "lucide-react";
import JobCards from "@/components/mmi/JobCards";
import MMICopilot from "@/components/mmi/MMICopilot";

export default function MMIJobsPanel() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Central de Jobs MMI</h1>
        </div>
        <p className="text-muted-foreground">
          Gestão inteligente de manutenção e melhoria industrial com automação via IA
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total de Jobs</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Com Sugestão IA</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MMI Copilot - AI Assistant */}
      <MMICopilot />

      {/* Main Content - Jobs Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Ativos</CardTitle>
          <CardDescription>
            Gerencie suas ordens de manutenção com auxílio da Inteligência Artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobCards />
        </CardContent>
      </Card>

      {/* Features Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Automação Inteligente Integrada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-1">📩</div>
                <div>
                  <strong>Criar OS com 1 clique</strong>
                  <p className="text-muted-foreground">
                    Gere ordens de serviço instantaneamente
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">🧠</div>
                <div>
                  <strong>Postergar com IA</strong>
                  <p className="text-muted-foreground">
                    Justificativa automatizada e inteligente
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">👁️‍🗨️</div>
                <div>
                  <strong>Sugestões da IA</strong>
                  <p className="text-muted-foreground">
                    Recomendações direto no card
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
