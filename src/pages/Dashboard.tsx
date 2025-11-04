import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Layers, TrendingUp, Ship, Shield, Zap } from "lucide-react";
import nautilusLogo from "@/assets/nautilus-logo.png";

/**
 * PATCH 613 - Simplified Dashboard
 * Stable dashboard without complex hooks that could cause loops
 */
export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={nautilusLogo} alt="Nautilus One" className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-bold font-playfair">NAUTILUS ONE</h1>
            <p className="text-muted-foreground mt-1">
              Sistema Revolucionário de Gestão Marítima e IA Distribuída
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-2 py-2 px-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Sistema Operacional
        </Badge>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-3xl font-bold">R$ 45.2M</p>
                <p className="text-xs text-green-600 mt-1">↑ 12.5% vs mês anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações</p>
                <p className="text-3xl font-bold">42</p>
                <p className="text-xs text-blue-600 mt-1">38 operacionais</p>
              </div>
              <Ship className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-3xl font-bold">94.8%</p>
                <p className="text-xs text-amber-600 mt-1">2 pendências</p>
              </div>
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-3xl font-bold">87.3%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3.2% vs baseline</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Módulos Totais</p>
                <p className="text-3xl font-bold">39</p>
              </div>
              <Layers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operacionais</p>
                <p className="text-3xl font-bold text-green-600">36</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime Médio</p>
                <p className="text-3xl font-bold text-blue-600">98.9%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Todos os componentes críticos estão operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Dashboard otimizado e estável</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Todos os módulos acessíveis via sidebar</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Navegação SPA funcional</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Sistema de segurança ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
