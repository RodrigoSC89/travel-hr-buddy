import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SimulationExercise } from "@/types/simulation";
import { format } from "date-fns";
import { Ship, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

export const SimulationExerciseList = () => {
  const { data: simulations, isLoading } = useQuery({
    queryKey: ["simulation-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_exercises")
        .select("*, vessels(name)")
        .order("next_due", { ascending: true });
      
      if (error) throw error;
      return data as (SimulationExercise & { vessels: { name: string } })[];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Concluído</Badge>;
    case "scheduled":
      return <Badge variant="secondary">Agendado</Badge>;
    case "overdue":
      return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Atrasado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando simulações...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulações Registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {simulations && simulations.length > 0 ? (
            simulations.map((sim) => (
              <div 
                key={sim.id} 
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{sim.type}</h3>
                      {getStatusBadge(sim.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ship className="h-4 w-4" />
                      <span>{sim.vessels?.name || "N/A"}</span>
                    </div>
                    {sim.normative_reference && (
                      <p className="text-sm text-muted-foreground">
                        Norma: {sim.normative_reference}
                      </p>
                    )}
                    {sim.next_due && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Próxima simulação: {format(new Date(sim.next_due), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Frequência: {sim.frequency_days} dias</div>
                    {sim.last_simulation && (
                      <div>Última: {format(new Date(sim.last_simulation), "dd/MM/yyyy")}</div>
                    )}
                  </div>
                </div>
                {sim.notes && (
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    {sim.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma simulação registrada. Clique em &quot;Agendar Simulação&quot; para começar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
