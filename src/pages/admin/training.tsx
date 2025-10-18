import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, AlertTriangle, Clock, Plus, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CrewTrainingRecord, TrainingModuleExtended, CrewTrainingStats } from "@/types/training";

export default function TrainingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"modules" | "records">("modules");

  // Fetch training statistics
  const { data: stats } = useQuery<CrewTrainingStats>({
    queryKey: ["training-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_crew_training_stats");
      
      if (error) throw error;
      return data as CrewTrainingStats;
    },
  });

  // Fetch training modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery<TrainingModuleExtended[]>({
    queryKey: ["training-modules", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("training_modules")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TrainingModuleExtended[];
    },
  });

  // Fetch training records
  const { data: records = [], isLoading: recordsLoading } = useQuery<CrewTrainingRecord[]>({
    queryKey: ["training-records", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("crew_training_records")
        .select("*")
        .order("date_completed", { ascending: false })
        .limit(100);

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrewTrainingRecord[];
    },
  });

  const categories = [
    "DP Operations",
    "Emergency Response",
    "Fire Fighting",
    "Blackout Recovery",
    "MOB Response",
    "SGSO Compliance",
    "Technical",
  ];

  const getCategoryBadge = (category?: string) => {
    const variants: Record<string, string> = {
      "DP Operations": "bg-blue-100 text-blue-800",
      "Emergency Response": "bg-red-100 text-red-800",
      "Fire Fighting": "bg-orange-100 text-orange-800",
      "Blackout Recovery": "bg-purple-100 text-purple-800",
      "MOB Response": "bg-yellow-100 text-yellow-800",
      "SGSO Compliance": "bg-green-100 text-green-800",
      "Technical": "bg-gray-100 text-gray-800",
    };
    return variants[category || ""] || variants.Technical;
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isExpiringSoon = (validUntil?: string) => {
    if (!validUntil) return false;
    const date = new Date(validUntil);
    const now = new Date();
    const daysUntilExpiration = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Treinamento e Certificações</h1>
          <p className="text-muted-foreground mt-2">
            Rastreamento de treinamentos, certificações e conformidade da tripulação
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinamentos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_trainings || 0}</div>
            <p className="text-xs text-muted-foreground">registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificações Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active_certifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">válidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.expired_certifications || 0}
            </div>
            <p className="text-xs text-muted-foreground">requerem renovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Expirar</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.upcoming_expirations || 0}
            </div>
            <p className="text-xs text-muted-foreground">próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Visualização</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "modules" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("modules")}
              >
                Módulos de Treinamento
              </Button>
              <Button
                variant={viewMode === "records" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("records")}
              >
                Registros de Certificação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas as Categorias
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Modules View */}
      {viewMode === "modules" && (
        <Card>
          <CardHeader>
            <CardTitle>Módulos de Treinamento</CardTitle>
            <CardDescription>
              Lista de módulos de treinamento disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modulesLoading ? (
              <div className="text-center py-8">Carregando módulos...</div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum módulo encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{module.title}</h3>
                          {module.category && (
                            <Badge className={getCategoryBadge(module.category)}>
                              {module.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {module.norm_reference}
                        </p>
                        <p className="text-sm">{module.gap_detected}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {module.duration_hours && (
                            <span>Duração: {module.duration_hours}h</span>
                          )}
                          {module.expiration_months && (
                            <span>Validade: {module.expiration_months} meses</span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training Records View */}
      {viewMode === "records" && (
        <Card>
          <CardHeader>
            <CardTitle>Registros de Certificação</CardTitle>
            <CardDescription>
              Histórico de treinamentos e certificações da tripulação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="text-center py-8">Carregando registros...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum registro encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => {
                  const expired = isExpired(record.valid_until);
                  const expiringSoon = isExpiringSoon(record.valid_until);

                  return (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {record.category && (
                              <Badge className={getCategoryBadge(record.category)}>
                                {record.category}
                              </Badge>
                            )}
                            {expired && (
                              <Badge className="bg-red-100 text-red-800">
                                Expirado
                              </Badge>
                            )}
                            {!expired && expiringSoon && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Expira em breve
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm space-y-1">
                            <p>
                              Concluído em: {new Date(record.date_completed).toLocaleDateString("pt-BR")}
                            </p>
                            {record.valid_until && (
                              <p>
                                Válido até: {new Date(record.valid_until).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                            {record.result && <p>Resultado: {record.result}</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {record.cert_url && (
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              Certificado
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
