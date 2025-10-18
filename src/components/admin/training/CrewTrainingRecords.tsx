import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrewTrainingRecord } from "@/types/training";
import { format } from "date-fns";
import { User, BookOpen, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

export const CrewTrainingRecords = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ["crew-training-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_training_records")
        .select("*, crew_members(full_name), training_modules(title)")
        .order("date_completed", { ascending: false });
      
      if (error) throw error;
      return data as (CrewTrainingRecord & { 
        crew_members: { full_name: string },
        training_modules: { title: string }
      })[];
    }
  });

  const getStatusBadge = (status: string, validUntil?: string) => {
    if (validUntil && new Date(validUntil) < new Date()) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Expirado
        </Badge>
      );
    }
    
    switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
            Concluído
        </Badge>
      );
    case "in_progress":
      return <Badge variant="secondary">Em Progresso</Badge>;
    case "scheduled":
      return <Badge variant="outline">Agendado</Badge>;
    case "failed":
      return <Badge variant="destructive">Reprovado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando registros de treinamento...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Treinamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records && records.length > 0 ? (
            records.map((record) => (
              <div 
                key={record.id} 
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{record.crew_members?.full_name}</span>
                      {getStatusBadge(record.status, record.valid_until)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span>{record.training_modules?.title}</span>
                    </div>
                    {record.date_completed && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Concluído em: {format(new Date(record.date_completed), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                    {record.valid_until && (
                      <div className="text-sm text-muted-foreground">
                        Válido até: {format(new Date(record.valid_until), "dd/MM/yyyy")}
                      </div>
                    )}
                    {record.result && (
                      <div className="text-sm">
                        Resultado: <span className="font-medium">{record.result}</span>
                      </div>
                    )}
                  </div>
                </div>
                {record.notes && (
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    {record.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro de treinamento encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
