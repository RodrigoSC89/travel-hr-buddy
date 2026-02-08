import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SimulationExercise {
  id: string;
  title: string;
  exercise_type: string;
  description: string | null;
  status: string | null;
  frequency_days: number | null;
  last_executed: string | null;
  next_due: string | null;
  participants: unknown;
  scenario: string | null;
}

export default function SimulationsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch simulation exercises
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ["simulations", selectedType],
    queryFn: async () => {
      let query = supabase
        .from("simulation_exercises")
        .select("*")
        .order("next_due", { ascending: true });

      if (selectedType) {
        query = query.eq("exercise_type", selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SimulationExercise[];
    },
  });

  // Compute stats from data
  const stats = {
    total: simulations.length,
    completed: simulations.filter(s => s.status === "completed").length,
    overdue: simulations.filter(s => s.status === "overdue").length,
    upcoming: simulations.filter(s => {
      if (!s.next_due) return false;
      const dueDate = new Date(s.next_due);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return dueDate <= thirtyDays && s.status !== "completed";
    }).length,
    completion_rate: simulations.length > 0 
      ? (simulations.filter(s => s.status === "completed").length / simulations.length) * 100 
      : 0,
  };

  const simulationTypes = ["DP", "Blackout", "Abandono", "Incêndio", "Man Overboard", "Spill"];

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return variants[status || "scheduled"] || variants.scheduled;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de Simulações Embarcadas</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de simulações obrigatórias (IMCA, MTS, IBAMA)
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Simulação
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">simulações cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completion_rate.toFixed(1)}% de taxa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">nos próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              Todos
            </Button>
            {simulationTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulations List */}
      <Card>
        <CardHeader>
          <CardTitle>Simulações Registradas</CardTitle>
          <CardDescription>
            Lista de todas as simulações com status e datas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando simulações...</div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma simulação cadastrada
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{simulation.title}</h3>
                        <Badge className={getStatusBadge(simulation.status)}>
                          {simulation.status || "scheduled"}
                        </Badge>
                        <Badge variant="outline">{simulation.exercise_type}</Badge>
                      </div>
                      {simulation.description && (
                        <p className="text-sm text-muted-foreground">
                          {simulation.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {simulation.last_executed && (
                          <span>
                            Última: {new Date(simulation.last_executed).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {simulation.next_due && (
                          <span>
                            Próxima: {new Date(simulation.next_due).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {simulation.frequency_days && (
                          <span>Frequência: {simulation.frequency_days} dias</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Evidências
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                  {simulation.scenario && (
                    <p className="mt-3 text-sm border-t pt-3 text-muted-foreground">
                      {simulation.scenario}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
