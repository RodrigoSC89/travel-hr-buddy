import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AlertTriangle, User, BookOpen } from "lucide-react";

export const ExpiredTrainings = () => {
  const { data: expired, isLoading } = useQuery({
    queryKey: ["expired-trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_expired_trainings");
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando treinamentos expirados...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Treinamentos Expirados
        </CardTitle>
        <CardDescription>
          Certificações que necessitam renovação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expired && expired.length > 0 ? (
            expired.map((item: { id: string; crew_name: string; training_title: string; valid_until: string; days_expired: number }) => (
              <div 
                key={item.id} 
                className="border border-red-200 rounded-lg p-3 bg-red-50 dark:bg-red-950/10"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{item.crew_name}</span>
                      <Badge variant="destructive" className="text-xs">
                        {item.days_expired} dias vencido
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span>{item.training_title}</span>
                    </div>
                    {item.valid_until && (
                      <div className="text-sm text-muted-foreground">
                        Expirou em: {format(new Date(item.valid_until), "dd/MM/yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum treinamento expirado!</p>
              <p className="text-sm mt-1">Todos os treinamentos estão em dia.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Import CheckCircle that was missing
import { CheckCircle } from "lucide-react";
