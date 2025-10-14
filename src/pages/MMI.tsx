import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JobCards from "@/components/mmi/JobCards";
import { Wrench, Activity } from "lucide-react";

export default function MMI() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Wrench className="h-8 w-8 text-yellow-600" />
        <div>
          <h1 className="text-3xl font-bold">MMI - Manutenção e Melhoria de Instalações</h1>
          <p className="text-muted-foreground">Central de Jobs e Manutenção Inteligente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Central de Jobs Ativos
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todos os jobs de manutenção e melhorias em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobCards />
        </CardContent>
      </Card>
    </div>
  );
}
