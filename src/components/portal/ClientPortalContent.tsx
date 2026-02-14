/**
 * Client Portal Content
 * Real-time fleet visibility for external clients
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Ship, CheckCircle, AlertTriangle, Clock, FileText,
  Download, Activity, Users, Globe, BarChart3, RefreshCw, Anchor
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function useClientPortalData() {
  const vessels = useQuery({
    queryKey: ["portal-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type, flag_state, current_location, imo_number")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const certifications = useQuery({
    queryKey: ["portal-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, certification_name, status, expiry_date")
        .order("expiry_date", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const maintenance = useQuery({
    queryKey: ["portal-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, status, priority, due_date")
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    vessels: vessels.data || [],
    certifications: certifications.data || [],
    maintenance: maintenance.data || [],
    isLoading: vessels.isLoading || certifications.isLoading || maintenance.isLoading,
  };
}

export default function ClientPortalContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const { vessels, certifications, maintenance, isLoading } = useClientPortalData();
  const queryClient = useQueryClient();

  const activeVessels = vessels.filter((v) => v.status === "active" || v.status === "operational");
  const validCerts = certifications.filter((c) => c.status === "valid" || c.status === "active");
  const complianceScore = certifications.length > 0
    ? Math.round((validCerts.length / certifications.length) * 100)
    : 100;
  const pendingMaint = maintenance.filter((m) => m.status === "pending" || m.status === "scheduled");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["portal-vessels"] });
    queryClient.invalidateQueries({ queryKey: ["portal-certifications"] });
    queryClient.invalidateQueries({ queryKey: ["portal-maintenance"] });
  };

  const handleExportReport = () => {
    const lines = [
      "Relatório do Portal do Cliente",
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
      "",
      `Embarcações Ativas: ${activeVessels.length}`,
      `Compliance Score: ${complianceScore}%`,
      `Manutenções Pendentes: ${pendingMaint.length}`,
      "",
      "Embarcações:",
      ...vessels.map((v) => `  - ${v.name} (${v.vessel_type}) - ${v.status} - ${v.current_location || "N/A"}`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `client-report-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portal do Cliente</h1>
            <p className="text-muted-foreground">Visibilidade operacional em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} aria-label="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleExportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-success/20 bg-success/5">
          <CardContent className="pt-4 text-center">
            <Ship className="h-8 w-8 text-success mx-auto" />
            <p className="text-3xl font-bold mt-2">{activeVessels.length}</p>
            <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${complianceScore >= 90 ? "border-success/20 bg-success/5" : complianceScore >= 70 ? "border-warning/20 bg-warning/5" : "border-destructive/20 bg-destructive/5"}`}>
          <CardContent className="pt-4 text-center">
            <Shield className={`h-8 w-8 mx-auto ${complianceScore >= 90 ? "text-success" : complianceScore >= 70 ? "text-warning" : "text-destructive"}`} />
            <p className="text-3xl font-bold mt-2">{complianceScore}%</p>
            <p className="text-sm text-muted-foreground">Compliance Score</p>
            <Progress value={complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-8 w-8 text-primary mx-auto" />
            <p className="text-3xl font-bold mt-2">{validCerts.length}</p>
            <p className="text-sm text-muted-foreground">Certificações Válidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Activity className="h-8 w-8 text-warning mx-auto" />
            <p className="text-3xl font-bold mt-2">{pendingMaint.length}</p>
            <p className="text-sm text-muted-foreground">Manutenções Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Frota</TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2"><Shield className="w-4 h-4" />Compliance</TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2"><Activity className="w-4 h-4" />Manutenções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Anchor className="h-5 w-5" />Embarcações</CardTitle>
              <CardDescription>{vessels.length} embarcações registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {vessels.map((vessel) => (
                    <div key={vessel.id} className="p-4 rounded-lg border flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Ship className={`h-5 w-5 ${vessel.status === "active" || vessel.status === "operational" ? "text-success" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium">{vessel.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vessel.vessel_type} • IMO: {vessel.imo_number || "N/A"} • {vessel.flag_state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vessel.current_location && (
                          <span className="text-xs text-muted-foreground">{vessel.current_location}</span>
                        )}
                        <Badge variant={vessel.status === "active" || vessel.status === "operational" ? "default" : "secondary"}>
                          {vessel.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {vessels.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma embarcação registrada</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
              <CardDescription>{certifications.length} certificações monitoradas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {certifications.map((cert) => {
                    const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                    const isExpiring = cert.expiry_date && !isExpired && new Date(cert.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <div key={cert.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpired ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          ) : isExpiring ? (
                            <Clock className="h-5 w-5 text-warning" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{cert.certification_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Validade: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString("pt-BR") : "N/A"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}>
                          {isExpired ? "Vencido" : isExpiring ? "Vencendo" : cert.status || "Válido"}
                        </Badge>
                      </div>
                    );
                  })}
                  {certifications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma certificação registrada</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções</CardTitle>
              <CardDescription>{maintenance.length} tarefas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {maintenance.map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border-l-4 ${task.priority === "high" || task.priority === "critical" ? "border-l-destructive bg-destructive/5" : task.priority === "medium" ? "border-l-warning bg-warning/5" : "border-l-primary bg-primary/5"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.due_date ? `Prazo: ${new Date(task.due_date).toLocaleDateString("pt-BR")}` : "Sem prazo definido"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.priority || "normal"}</Badge>
                          <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                            {task.status || "pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {maintenance.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhuma manutenção registrada</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
