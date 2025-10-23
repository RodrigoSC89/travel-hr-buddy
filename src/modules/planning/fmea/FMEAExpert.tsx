import React from "react";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function FMEAExpert() {
  const { applyMitigation } = useButtonHandlers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">FMEA Expert</h1>
        <p className="text-muted-foreground">
          Sistema Especialista de Análise de Modos de Falha
        </p>
      </div>

      {/* Recommended Actions Card */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <AlertTriangle className="h-5 w-5" />
            Ação Recomendada
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Sistema detectou oportunidade de otimização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900 dark:text-amber-100 mb-4">
            <strong>Verificação de Redundância do Sistema de Propulsão</strong>
            <br />
            Recomenda-se realizar verificação completa das redundâncias do sistema de propulsão para garantir conformidade com os padrões FMEA.
          </p>
        </CardContent>
      </Card>

      {/* Mitigation Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Ações de Mitigação
          </CardTitle>
          <CardDescription>Interface de controle de mitigação FMEA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Status do Sistema</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Criticidade</p>
                <p className="text-lg font-bold text-amber-600">Média</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ações Pendentes</p>
                <p className="text-lg font-bold">3</p>
              </div>
            </div>
          </div>
          <Button onClick={applyMitigation} className="w-full" size="lg">
            Aplicar Mitigação
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Análise FMEA</CardTitle>
          <CardDescription>Panorama geral dos modos de falha identificados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-muted-foreground">Crítico</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-muted-foreground">Alto</p>
              <p className="text-2xl font-bold text-amber-600">3</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">Baixo</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
