import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ListChecks, Clock, TrendingUp } from "lucide-react";

const ChecklistsInteligentesModule = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Checklists Inteligentes</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checklists Ativos</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">Em uso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Concluídos</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,247</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12min</div>
            <p className="text-xs text-muted-foreground">Por checklist</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">Média</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de checklists digitais com IA integrada, templates personalizáveis,
            auditoria automática e relatórios de conformidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistsInteligentesModule;
