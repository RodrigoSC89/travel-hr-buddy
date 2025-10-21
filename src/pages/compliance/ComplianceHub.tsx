import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, AlertCircle, TrendingUp } from "lucide-react";

export default function ComplianceHub() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Compliance Hub</h1>
        <p className="text-muted-foreground">
          Centro de Gestão de Conformidade e Regulamentações
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade Geral</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">+2.3% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditorias</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Completadas este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Positiva</div>
            <p className="text-xs text-muted-foreground">Melhorias contínuas</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Conformidade</CardTitle>
          <CardDescription>
            Monitoramento de regulamentações e conformidade normativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">ISO 9001</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">100%</p>
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">SOLAS</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">97%</p>
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button>Nova Auditoria</Button>
              <Button variant="outline">Ver Relatórios</Button>
              <Button variant="outline">Certificações</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
