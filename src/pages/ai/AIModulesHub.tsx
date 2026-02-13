/**
 * AI Modules Hub - Central de módulos IA
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Bot, Workflow, BarChart3, Eye } from "lucide-react";

const modules = [
  { id: 1, name: "IA Generativa", description: "Geração de conteúdo com IA", icon: Sparkles, status: "active" },
  { id: 2, name: "Agentes Autônomos", description: "Automação inteligente", icon: Bot, status: "active" },
  { id: 3, name: "Workflows IA", description: "Fluxos automatizados", icon: Workflow, status: "active" },
  { id: 4, name: "Analytics IA", description: "Análise preditiva", icon: BarChart3, status: "active" },
  { id: 5, name: "Monitoramento", description: "Observabilidade IA", icon: Eye, status: "active" },
];

export default function AIModulesHub() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Central de Módulos IA</h2>
          <p className="text-muted-foreground">Todos os módulos de inteligência artificial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <module.icon className="h-8 w-8 text-primary" />
                <Badge variant="outline" className="bg-success/10 text-success">
                  {module.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardTitle className="mt-2">{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clique para acessar o módulo
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
