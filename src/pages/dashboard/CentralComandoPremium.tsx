/**
 * Central de Comando Premium - v2.0
 * Dashboard Executivo com visão 360° da frota
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Ship, Activity, AlertTriangle, CheckCircle,
  TrendingUp, Clock, Calendar, Users, Wrench, Shield, DollarSign,
  Navigation, Fuel, Anchor, Bell, MapPin, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function CentralComandoPremium() {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [vesselsRes, crewRes] = await Promise.all([
        supabase.from("vessels").select("*").limit(20),
        supabase.from("crew_members").select("*").limit(50)
      ]);
      
      if (vesselsRes.data) setVessels(vesselsRes.data);
      if (crewRes.data) setCrew(crewRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const activeVessels = vessels.filter(v => v.status === "active").length;
  const activeCrew = crew.filter(c => c.status === "active" || c.status === "on_board").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">Central de Comando</h1>
                  <Badge variant="secondary" className="gap-1 bg-success/10 text-success">
                    <Activity className="h-3 w-3" />
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Visão executiva 360° das operações</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Alertas
              </Button>
              <Button size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                Ação Rápida
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Embarcações</p>
                  <p className="text-2xl font-bold text-success">{activeVessels}</p>
                  <p className="text-xs">ativas</p>
                </div>
                <Ship className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tripulação</p>
                  <p className="text-2xl font-bold">{activeCrew}</p>
                  <p className="text-xs">embarcados</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Manutenções</p>
                  <p className="text-2xl font-bold text-warning">5</p>
                  <p className="text-xs">pendentes</p>
                </div>
                <Wrench className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conformidade</p>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs">score</p>
                </div>
                <Shield className="h-8 w-8 text-info opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Receita</p>
                  <p className="text-2xl font-bold">R$ 2.4M</p>
                  <p className="text-xs">este mês</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Eficiência</p>
                  <p className="text-2xl font-bold">94.5%</p>
                  <p className="text-xs">operacional</p>
                </div>
                <TrendingUp className="h-8 w-8 text-violet-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fleet Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Status da Frota
              </CardTitle>
              <CardDescription>Posição e status em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : vessels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma embarcação cadastrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vessels.slice(0, 5).map((vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          vessel.status === "active" ? "bg-success/10" : "bg-muted"
                        }`}>
                          <Ship className={`h-5 w-5 ${
                            vessel.status === "active" ? "text-success" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vessel.current_location || "Localização não informada"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={vessel.status === "active" ? "default" : "secondary"}>
                        {vessel.status === "active" ? "Navegando" : vessel.status || "Em Porto"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Certificado Expirando", vessel: "MV Atlantic Star", days: 15, severity: "warning" },
                  { type: "Manutenção Pendente", vessel: "MV Pacific", days: 7, severity: "warning" },
                  { type: "Documento Vencido", vessel: "OSV-01", days: -2, severity: "error" },
                ].map((alert, i) => (
                  <div key={i} className={`p-3 border rounded-lg ${
                    alert.severity === "error" ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.vessel}</p>
                      </div>
                      <Badge variant={alert.severity === "error" ? "destructive" : "secondary"}>
                        {alert.days < 0 ? `Vencido há ${Math.abs(alert.days)}d` : `${alert.days} dias`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operations Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Viagens Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">2 em trânsito, 2 em porto</p>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Consumo Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12.4 ton</p>
              <p className="text-xs text-success">-5% vs. média</p>
              <Progress value={72} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tarefas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8/12</p>
              <p className="text-xs text-muted-foreground">concluídas</p>
              <Progress value={67} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Próximo Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">Inspeção PSC</p>
              <p className="text-xs text-muted-foreground">MV Atlantic - 3 dias</p>
              <Button size="sm" variant="outline" className="mt-2 w-full">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Frota", icon: Ship, href: "/fleet-operations" },
                { name: "Tripulação", icon: Users, href: "/people-hub" },
                { name: "Manutenção", icon: Wrench, href: "/maintenance-hub" },
                { name: "Conformidade", icon: Shield, href: "/compliance-hub" },
                { name: "Financeiro", icon: DollarSign, href: "/finance-hub" },
                { name: "IA", icon: Activity, href: "/ai-control-tower" },
              ].map((link) => (
                <Button 
                  key={link.name} 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate(link.href)}
                >
                  <link.icon className="h-6 w-6" />
                  <span>{link.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
