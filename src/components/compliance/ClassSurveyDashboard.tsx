import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Calendar, AlertTriangle, CheckCircle2, Clock, 
  Plus, FileText, Building2, Ship, ChevronRight
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ClassSurvey {
  id: string;
  vessel_id: string;
  classification_society_id: string;
  survey_type: string;
  survey_name: string;
  due_date: string;
  window_start: string | null;
  window_end: string | null;
  completed_date: string | null;
  surveyor_name: string | null;
  survey_location: string | null;
  status: string;
  findings: any[];
  conditions_of_class: any[];
  cost: number | null;
}

interface ClassificationSociety {
  id: string;
  code: string;
  name: string;
  country: string;
  is_iacs_member: boolean;
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Pendente", icon: Clock },
  due_soon: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Vence em Breve", icon: AlertTriangle },
  overdue: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Vencido", icon: AlertTriangle },
  in_progress: { color: "bg-primary/20 text-primary border-primary/30", label: "Em Andamento", icon: Clock },
  completed: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Concluído", icon: CheckCircle2 },
  postponed: { color: "bg-muted text-muted-foreground border-muted", label: "Adiado", icon: Clock },
};

const surveyTypeLabels: Record<string, string> = {
  annual: "Survey Anual",
  intermediate: "Survey Intermediário",
  special: "Survey Especial",
  bottom: "Survey de Fundo",
  tailshaft: "Survey de Eixo de Popa",
  boiler: "Survey de Caldeira",
  docking: "Survey de Docagem",
  class_renewal: "Renovação de Classe",
  condition_of_class: "Condição de Classe",
};

export function ClassSurveyDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSociety, setFilterSociety] = useState<string>("all");

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ["class-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_surveys")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as ClassSurvey[];
    },
  });

  const { data: societies = [] } = useQuery({
    queryKey: ["classification-societies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classification_societies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as ClassificationSociety[];
    },
  });

  const getSocietyName = (id: string) => {
    const society = societies.find(s => s.id === id);
    return society?.code || "N/A";
  };

  const getSocietyFullName = (id: string) => {
    const society = societies.find(s => s.id === id);
    return society?.name || "N/A";
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesStatus = filterStatus === "all" || survey.status === filterStatus;
    const matchesSociety = filterSociety === "all" || survey.classification_society_id === filterSociety;
    return matchesStatus && matchesSociety;
  });

  // Calculate stats
  const stats = {
    total: surveys.length,
    pending: surveys.filter(s => s.status === "pending" || s.status === "due_soon").length,
    overdue: surveys.filter(s => s.status === "overdue").length,
    completed: surveys.filter(s => s.status === "completed").length,
    conditionsOfClass: surveys.reduce((sum, s) => sum + (s.conditions_of_class?.length || 0), 0),
  };

  const complianceRate = stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Class Survey Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestão de surveys e certificações de classificadoras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Survey
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Surveys</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Conformidade</p>
            <p className="text-2xl font-bold text-emerald-400">{complianceRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Vencidos</p>
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Condições de Classe</p>
            <p className="text-2xl font-bold text-orange-400">{stats.conditionsOfClass}</p>
          </CardContent>
        </Card>
      </div>

      {/* Classification Societies */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Sociedades Classificadoras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {societies.slice(0, 5).map((society) => {
              const societySurveys = surveys.filter(s => s.classification_society_id === society.id);
              const pendingSurveys = societySurveys.filter(s => s.status !== "completed");
              
              return (
                <div 
                  key={society.id} 
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-bold">
                      {society.code}
                    </Badge>
                    {society.is_iacs_member && (
                      <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                        IACS
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{society.name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{societySurveys.length} surveys</span>
                    {pendingSurveys.length > 0 && (
                      <span className="text-amber-400">{pendingSurveys.length} pendentes</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-muted/30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSociety} onValueChange={setFilterSociety}>
          <SelectTrigger className="w-[200px] bg-muted/30">
            <SelectValue placeholder="Classificadora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Classificadoras</SelectItem>
            {societies.map((society) => (
              <SelectItem key={society.id} value={society.id}>
                {society.code} - {society.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Survey List */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Surveys Programados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {surveysLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredSurveys.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum survey encontrado</p>
              <Button variant="link" className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Survey
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSurveys.map((survey) => {
                const daysUntil = differenceInDays(new Date(survey.due_date), new Date());
                const config = statusConfig[survey.status];
                const StatusIcon = config.icon;

                return (
                  <div 
                    key={survey.id} 
                    className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("border", config.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline">{getSocietyName(survey.classification_society_id)}</Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h4 className="font-medium text-foreground mb-1">{survey.survey_name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {surveyTypeLabels[survey.survey_type] || survey.survey_type}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Vence: {format(new Date(survey.due_date), "dd/MM/yyyy")}</span>
                      </div>
                      {daysUntil > 0 && survey.status !== "completed" && (
                        <span className={cn(
                          "font-medium",
                          daysUntil <= 30 ? "text-amber-400" : 
                            daysUntil <= 7 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {daysUntil} dias restantes
                        </span>
                      )}
                      {survey.surveyor_name && (
                        <span className="text-muted-foreground">
                          Surveyor: {survey.surveyor_name}
                        </span>
                      )}
                    </div>

                    {(survey.findings?.length > 0 || survey.conditions_of_class?.length > 0) && (
                      <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                        {survey.findings?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {survey.findings.length} achados
                          </Badge>
                        )}
                        {survey.conditions_of_class?.length > 0 && (
                          <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {survey.conditions_of_class.length} condições de classe
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
