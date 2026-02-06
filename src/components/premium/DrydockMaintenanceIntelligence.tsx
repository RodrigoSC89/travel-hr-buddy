/**
 * Drydock & Maintenance Intelligence Hub - Real data from class_surveys + vessels
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ship, Calendar, Shield, DollarSign, Wrench, Gauge, FileText, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

export default function DrydockMaintenanceIntelligence() {
  const [activeTab, setActiveTab] = useState("surveys");

  const { data, isLoading } = useQuery({
    queryKey: ["dnv-class-intelligence"],
    queryFn: async () => {
      const [surveyResult, vesselResult, maintResult] = await Promise.all([
        supabase.from("class_surveys")
          .select("id, vessel_id, survey_type, survey_name, due_date, completed_date, surveyor_name, survey_location, status, cost, notes")
          .order("due_date"),
        supabase.from("vessels").select("id, name, imo_number").order("name"),
        supabase.from("maintenance_records")
          .select("id, vessel_id, title, status, priority, maintenance_type, scheduled_date")
          .order("scheduled_date"),
      ]);
      if (surveyResult.error) throw surveyResult.error;
      if (vesselResult.error) throw vesselResult.error;
      if (maintResult.error) throw maintResult.error;
      return { surveys: surveyResult.data || [], vessels: vesselResult.data || [], maintenance: maintResult.data || [] };
    },
    staleTime: 30000,
  });

  if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64" /></div>;

  const { surveys = [], vessels = [], maintenance = [] } = data || {};
  const vesselMap = new Map(vessels.map((v: any) => [v.id, v.name]));

  if (surveys.length === 0 && maintenance.length === 0) {
    return <EmptyState icon={Shield} title="Sem surveys de classe" message="Cadastre surveys DNV/LR/BV para acompanhar certificações e inspeções." />;
  }

  const validSurveys = surveys.filter((s: any) => s.status === "completed" || s.status === "valid").length;
  const totalCost = surveys.reduce((sum: number, s: any) => sum + (Number(s.cost) || 0), 0);
  const avgHealth = maintenance.length > 0
    ? Math.round(maintenance.filter((m: any) => m.status === "completed").length / maintenance.length * 100)
    : 100;

  const exportCSV = () => {
    const headers = ["Tipo", "Embarcação", "Data Vencimento", "Data Conclusão", "Status", "Custo", "Surveyor"];
    const rows = surveys.map((s: any) => [
      s.survey_type, vesselMap.get(s.vessel_id) || "N/A", s.due_date, s.completed_date || "", s.status, s.cost || "", s.surveyor_name || ""
    ]);
    const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "class-surveys.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Surveys exportados");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Surveys</p><p className="text-2xl font-bold">{surveys.length}</p></div><Ship className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Custo Total</p><p className="text-2xl font-bold">${(totalCost / 1000).toFixed(0)}K</p></div><DollarSign className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Health Equipamentos</p><p className="text-2xl font-bold">{avgHealth}%</p><Progress value={avgHealth} className="h-1 mt-1" /></div><Gauge className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Surveys Válidos</p><p className="text-2xl font-bold">{validSurveys}/{surveys.length}</p></div><Shield className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="surveys" className="flex items-center gap-2"><Shield className="h-4 w-4" />Surveys</TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Equipamentos</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Class Survey Schedule</CardTitle><CardDescription>{surveys.length} surveys registrados</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {surveys.map((survey: any) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${survey.status === "completed" ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                          <span className="font-bold text-sm">{(survey.survey_type || "?").substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{survey.survey_name || survey.survey_type}</p>
                          <p className="text-sm text-muted-foreground">{vesselMap.get(survey.vessel_id) || "N/A"} • {survey.surveyor_name || "N/A"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Vencimento: {survey.due_date || "N/A"}</p>
                        {survey.completed_date && <p className="text-sm text-green-600">Concluído: {survey.completed_date}</p>}
                      </div>
                      <Badge className={survey.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                        {survey.status === "completed" ? "Concluído" : survey.status === "pending" ? "Pendente" : survey.status || "N/A"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Registros de Manutenção</CardTitle><CardDescription>{maintenance.length} registros</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {maintenance.slice(0, 20).map((m: any) => (
                    <div key={m.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{m.title}</p>
                          <p className="text-sm text-muted-foreground">{vesselMap.get(m.vessel_id) || "N/A"} • {m.maintenance_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={m.priority === "critical" ? "destructive" : m.priority === "high" ? "secondary" : "outline"}>{m.priority}</Badge>
                          <Badge variant={m.status === "completed" ? "default" : "secondary"}>{m.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
