import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrainingModule } from "@/types/training";
import { BookOpen, Clock, Award } from "lucide-react";

export const TrainingModuleList = () => {
  const { data: modules, isLoading } = useQuery({
    queryKey: ["training-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data as TrainingModule[];
    }
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Safety": "bg-red-100 text-red-800",
      "Technical": "bg-blue-100 text-blue-800",
      "DP Operations": "bg-purple-100 text-purple-800",
      "Emergency Response": "bg-orange-100 text-orange-800",
      "SGSO Compliance": "bg-green-100 text-green-800",
      "Equipment Operation": "bg-yellow-100 text-yellow-800",
      "Other": "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors["Other"];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando módulos de treinamento...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulos de Treinamento Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules && modules.length > 0 ? (
            modules.map((module) => (
              <div 
                key={module.id} 
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{module.title}</h3>
                      <Badge className={getCategoryColor(module.category)}>
                        {module.category}
                      </Badge>
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{module.duration_hours}h</span>
                      </div>
                      {module.validity_days && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>Validade: {module.validity_days} dias</span>
                        </div>
                      )}
                    </div>
                    {module.normative_reference && (
                      <div className="text-xs text-muted-foreground">
                        Norma: {module.normative_reference}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum módulo de treinamento cadastrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
