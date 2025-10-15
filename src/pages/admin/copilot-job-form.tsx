"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobFormWithExamples } from "@/components/copilot";
import { Sparkles, Info } from "lucide-react";

export default function CopilotJobFormPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Copilot - Criação de Jobs com IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Crie jobs de manutenção com sugestões inteligentes baseadas em histórico
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Formulário de Criação</CardTitle>
              <CardDescription>
                Preencha os dados do job e receba sugestões automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobFormWithExamples />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Como funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🔍 Busca Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Ao digitar a descrição, o sistema busca automaticamente jobs similares no histórico
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">📊 Score de Similaridade</h4>
                <p className="text-sm text-muted-foreground">
                  Cada exemplo mostra um percentual de similaridade para ajudar na escolha
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">✨ Preenchimento Rápido</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em &quot;Usar&quot; para preencher automaticamente com um exemplo similar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Busca em tempo real com debouncing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Histórico de jobs similares</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Score de similaridade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Preenchimento automático</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Interface responsiva</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
