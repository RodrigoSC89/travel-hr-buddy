/**
 * PMS Hour Meter Alerts - Real data from maintenance_records
 * Preventive maintenance tracking
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, AlertTriangle, CheckCircle, Wrench, Gauge, Bell, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

export default function PMSHourMeterAlerts() {
  const [selectedTab, setSelectedTab] = useState("tasks");
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pms-maintenance-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("id, title, description, maintenance_type, priority, status, scheduled_date, completed_date, estimated_duration, actual_duration, vessel_id, assigned_technician")
        .order("priority", { ascending: true })
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ["pms-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maintenance_records")
        .update({ status: "completed", completed_date: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pms-maintenance-records"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Manutenção marcada como concluída");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createOSMutation = useMutation({
    mutationFn: async (record: { id: string }) => {
      const { error } = await supabase
        .from("maintenance_records")
        .update({ status: "in_progress" })
        .eq("id", record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pms-maintenance-records"] });
      toast.success("Ordem de serviço iniciada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Gauge}
        title="Nenhuma tarefa PMS"
        message="Cadastre tarefas de manutenção preventiva para acompanhar intervalos e horímetros."
      />
    );
  }

  const vesselMap = new Map(vessels.map((v) => [v.id, v.name]));

  type MaintenanceRecord = typeof records[number];

  const getStatus = (r: MaintenanceRecord) => {
    if (r.status === "completed") return "ok";
    const scheduled = new Date(r.scheduled_date);
    const now = new Date();
    if (scheduled < now) return "overdue";
    const daysLeft = (scheduled.getTime() - now.getTime()) / (1000 * 86400);
    if (daysLeft < 7) return "warning";
    return "ok";
  };

  const enrichedRecords = records.map((r) => ({
    ...r,
    vesselName: vesselMap.get(r.vessel_id) || "N/A",
    computedStatus: getStatus(r),
  }));

  const overdueCount = enrichedRecords.filter((r) => r.computedStatus === "overdue").length;
  const warningCount = enrichedRecords.filter((r) => r.computedStatus === "warning").length;
  const completedCount = enrichedRecords.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-success">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tarefas</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <Wrench className="h-4 w-4" /> Tarefas PMS
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="h-4 w-4" /> Vencidas ({overdueCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          {enrichedRecords
            .filter((r) => r.status !== "completed")
            .sort((a, b) => {
              const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
              return (order[a.priority ?? ""] ?? 9) - (order[b.priority ?? ""] ?? 9);
            })
            .map((task) => (
            <Card key={task.id} className={`border-l-4 ${
              task.computedStatus === "overdue" ? "border-l-destructive" :
              task.computedStatus === "warning" ? "border-l-warning" : "border-l-success"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge variant={
                        task.priority === "critical" ? "destructive" :
                        task.priority === "high" ? "secondary" : "outline"
                      }>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.maintenance_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.vesselName} • {task.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => createOSMutation.mutate(task)} disabled={createOSMutation.isPending}>
                      <Wrench className="h-4 w-4 mr-1" /> Iniciar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => completeMutation.mutate(task.id)} disabled={completeMutation.isPending}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Agendada: {new Date(task.scheduled_date).toLocaleDateString("pt-BR")}</span>
                  <span>Duração est.: {task.estimated_duration || "?"}h</span>
                  {task.assigned_technician && <span>Responsável: {task.assigned_technician}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4 mt-4">
          {enrichedRecords.filter((r) => r.computedStatus === "overdue").length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              Nenhuma manutenção vencida!
            </CardContent></Card>
          ) : (
            enrichedRecords.filter((r) => r.computedStatus === "overdue").map((task) => (
              <Card key={task.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.vesselName}</p>
                      <p className="text-xs text-destructive mt-1">
                        Vencida desde {new Date(task.scheduled_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => createOSMutation.mutate(task)}>
                      <Wrench className="h-4 w-4 mr-1" /> Criar OS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
