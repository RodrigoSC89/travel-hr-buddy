import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 366 - Crew Management - Rotation & Alerts
 * Complete crew rotation system with conflict detection and notifications
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Bell,
  UserCheck,
  UserX
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CrewRotation {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  vessel_id?: string;
  vessel_name?: string;
  rotation_start: string;
  rotation_end: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  conflicts?: string[];
  created_at: string;
}

interface RotationConflict {
  type: "overlap" | "certification_expiry" | "rest_period" | "availability";
  message: string;
  severity: "warning" | "error";
}

export default function CrewRotationModule() {
  const { toast } = useToast();
  const [rotations, setRotations] = useState<CrewRotation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [showNewRotation, setShowNewRotation] = useState(false);
  
  const [newRotation, setNewRotation] = useState({
    crew_member_id: "",
    vessel_id: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadRotations();
    setupRealtimeSubscription();
  }, []);

  const loadRotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crew_rotations")
        .select(`
          *,
          crew_member:crew_members(name),
          vessel:vessels(name)
        `)
        .order("rotation_start", { ascending: true });

      if (error) throw error;

      const formattedRotations = data?.map(r => ({
        id: r.id,
        crew_member_id: r.crew_member_id,
        crew_member_name: r.crew_member?.name || "Unknown",
        vessel_id: r.vessel_id,
        vessel_name: r.vessel?.name || "Unassigned",
        rotation_start: r.rotation_start,
        rotation_end: r.rotation_end,
        status: r.status,
        conflicts: r.conflicts,
        created_at: r.created_at
      })) || [];

      setRotations(formattedRotations);
    } catch (error) {
      console.error("Error loading rotations:", error);
      console.error("Error loading rotations:", error);
      toast({
        title: "Erro ao carregar rotações",
        description: "Não foi possível carregar as rotações de tripulação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("crew_rotations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crew_rotations"
        },
        (payload) => {
          loadRotations();
          
          toast({
            title: "Atualização em tempo real",
            description: "Uma rotação foi atualizada.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    });
  });

  const detectConflicts = (rotation: unknown: unknown: unknown): RotationConflict[] => {
    const conflicts: RotationConflict[] = [];

    // Check for overlapping rotations
    const overlapping = rotations.filter(r => 
      r.crew_member_id === rotation.crew_member_id &&
      r.status !== "cancelled" &&
      (
        (new Date(rotation.start_date) >= new Date(r.rotation_start) && 
         new Date(rotation.start_date) <= new Date(r.rotation_end)) ||
        (new Date(rotation.end_date) >= new Date(r.rotation_start) && 
         new Date(rotation.end_date) <= new Date(r.rotation_end))
      )
    );

    if (overlapping.length > 0) {
      conflicts.push({
        type: "overlap",
        message: `Conflito com ${overlapping.length} rotação(ões) existente(s)`,
        severity: "error"
      });
    }

    // Check rotation duration (max 180 days)
    const duration = differenceInDays(
      new Date(rotation.end_date),
      new Date(rotation.start_date)
    );

    if (duration > 180) {
      conflicts.push({
        type: "rest_period",
        message: "Rotação excede período máximo de 180 dias",
        severity: "warning"
      });
    }

    return conflicts;
  };

  const createRotation = async () => {
    const conflicts = detectConflicts(newRotation);
    
    const hasErrors = conflicts.some(c => c.severity === "error");
    
    if (hasErrors) {
      toast({
        title: "Conflitos detectados",
        description: conflicts.map(c => c.message).join(". "),
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("crew_rotations")
        .insert({
          crew_member_id: newRotation.crew_member_id,
          vessel_id: newRotation.vessel_id || null,
          rotation_start: newRotation.start_date,
          rotation_end: newRotation.end_date,
          status: "scheduled",
          conflicts: conflicts.map(c => c.message)
        });

      if (error) throw error;

      toast({
        title: "Rotação criada",
        description: "A rotação foi agendada com sucesso.",
      });

      setShowNewRotation(false);
      setNewRotation({
        crew_member_id: "",
        vessel_id: "",
        start_date: "",
        end_date: ""
      });
      
      loadRotations();
      
      // Send notification
      sendRotationNotification("scheduled", newRotation);
      
    } catch (error) {
      console.error("Error creating rotation:", error);
      console.error("Error creating rotation:", error);
      toast({
        title: "Erro ao criar rotação",
        description: "Não foi possível criar a rotação.",
        variant: "destructive"
      });
    }
  };

  const sendRotationNotification = async (type: string, rotation: unknown: unknown: unknown) => {
    try {
      await supabase.from("notifications").insert({
        user_id: rotation.crew_member_id,
        type: "crew_rotation",
        title: `Rotação ${type === "scheduled" ? "Agendada" : "Atualizada"}`,
        message: `Sua rotação foi ${type === "scheduled" ? "agendada" : "atualizada"} para ${format(new Date(rotation.start_date), "dd/MM/yyyy", { locale: ptBR })}`,
        read: false
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      console.error("Error sending notification:", error);
    }
  };

  const upcomingRotations = rotations.filter(r => 
    new Date(r.rotation_start) > new Date() && 
    r.status === "scheduled"
  ).slice(0, 5);

  const activeRotations = rotations.filter(r => r.status === "active");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Rotação de Tripulação</h1>
            <p className="text-muted-foreground">
              Gerenciamento completo de rotações com detecção de conflitos
            </p>
          </div>
        </div>

        <Dialog open={showNewRotation} onOpenChange={setShowNewRotation}>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Nova Rotação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Rotação</DialogTitle>
              <DialogDescription>
                Crie uma nova rotação de tripulação. Conflitos serão detectados automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tripulante</Label>
                <Input
                  placeholder="ID do tripulante"
                  value={newRotation.crew_member_id}
                  onChange={handleChange})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Embarcação (opcional)</Label>
                <Input
                  placeholder="ID da embarcação"
                  value={newRotation.vessel_id}
                  onChange={handleChange})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={newRotation.start_date}
                    onChange={handleChange})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={newRotation.end_date}
                    onChange={handleChange})}
                  />
                </div>
              </div>

              <Button onClick={createRotation} className="w-full">
                Criar Rotação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rotações Ativas</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRotations.length}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas Rotações</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRotations.length}</div>
            <p className="text-xs text-muted-foreground">Agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Com Conflitos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotations.filter(r => r.conflicts && r.conflicts.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotations.filter(r => 
                new Date(r.rotation_start) <= addDays(new Date(), 7) && 
                r.status === "scheduled"
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Próxima semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotações Agendadas</CardTitle>
              <CardDescription>
                Próximas rotações programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingRotations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma rotação agendada
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingRotations.map((rotation) => (
                    <div key={rotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{rotation.crew_member_name}</h4>
                          <Badge variant="outline">{rotation.vessel_name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(rotation.rotation_start), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(rotation.rotation_end), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {rotation.conflicts && rotation.conflicts.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-xs text-destructive">
                              {rotation.conflicts.length} conflito(s) detectado(s)
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge>{rotation.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Rotações em Andamento</CardTitle>
              <CardDescription>
                Tripulantes atualmente em rotação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeRotations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma rotação ativa no momento
                </p>
              ) : (
                <div className="space-y-4">
                  {activeRotations.map((rotation) => (
                    <div key={rotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{rotation.crew_member_name}</h4>
                          <Badge variant="secondary">{rotation.vessel_name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Termina em: {format(new Date(rotation.rotation_end), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Rotações</CardTitle>
              <CardDescription>
                Visualização mensal das rotações
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={ptBR}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Completo</CardTitle>
              <CardDescription>
                Todas as rotações registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {rotations.map((rotation) => (
                    <div key={rotation.id} className="flex items-center justify-between p-3 border rounded text-sm">
                      <div>
                        <span className="font-medium">{rotation.crew_member_name}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span>{rotation.vessel_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rotation.rotation_start), "dd/MM", { locale: ptBR })}
                        </span>
                        <Badge variant={rotation.status === "active" ? "default" : "outline"}>
                          {rotation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
