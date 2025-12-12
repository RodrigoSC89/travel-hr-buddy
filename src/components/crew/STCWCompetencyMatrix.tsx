import { memo, memo, useMemo, useState } from "react";;;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, Search, Filter, Download, AlertTriangle, 
  CheckCircle2, Clock, XCircle, HelpCircle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface STCWCompetency {
  id: string;
  code: string;
  name: string;
  stcw_table: string;
  function_area: string;
  level: string;
  applicable_ranks: string[];
}

interface CrewMember {
  id: string;
  full_name: string;
  rank: string;
}

interface CompetencyAssessment {
  id: string;
  crew_member_id: string;
  competency_id: string;
  status: string;
  score: number | null;
  expiry_date: string | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  competent: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/20", label: "Competente" },
  in_training: { icon: Clock, color: "text-amber-400 bg-amber-500/20", label: "Em Treinamento" },
  not_yet_competent: { icon: XCircle, color: "text-orange-400 bg-orange-500/20", label: "Não Competente" },
  expired: { icon: AlertTriangle, color: "text-destructive bg-destructive/20", label: "Expirado" },
  not_assessed: { icon: HelpCircle, color: "text-muted-foreground bg-muted", label: "Não Avaliado" },
};

const functionAreas: Record<string, string> = {
  navigation: "Navegação",
  cargo_handling: "Carga",
  marine_engineering: "Máquinas",
  electrical: "Elétrica",
  maintenance: "Manutenção",
  radio_communications: "Rádio",
  safety: "Segurança",
};

export const STCWCompetencyMatrix = memo(function() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const { data: competencies = [], isLoading: competenciesLoading } = useQuery({
    queryKey: ["stcw-competencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stcw_competencies")
        .select("*")
        .order("code");
      if (error) throw error;
      return data as STCWCompetency[];
    },
  });

  const { data: crewMembers = [], isLoading: crewLoading } = useQuery({
    queryKey: ["crew-members-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data as CrewMember[];
    },
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["competency-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_competency_assessments")
        .select("*");
      if (error) throw error;
      return data as CompetencyAssessment[];
    },
  });

  const filteredCompetencies = useMemo(() => {
    return competencies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = filterArea === "all" || c.function_area === filterArea;
      const matchesLevel = filterLevel === "all" || c.level === filterLevel;
      return matchesSearch && matchesArea && matchesLevel;
    });
  }, [competencies, searchQuery, filterArea, filterLevel]);

  const getAssessmentStatus = (crewId: string, competencyId: string): string => {
    const assessment = assessments.find(
      a => a.crew_member_id === crewId && a.competency_id === competencyId
    );
    if (!assessment) return "not_assessed";
    
    // Check if expired
    if (assessment.expiry_date && new Date(assessment.expiry_date) < new Date()) {
      return "expired";
    }
    
    return assessment.status;
  };

  const calculateStats = useMemo(() => {
    const total = crewMembers.length * filteredCompetencies.length;
    let competent = 0;
    let inTraining = 0;
    let gaps = 0;

    crewMembers.forEach(crew => {
      filteredCompetencies.forEach(comp => {
        const status = getAssessmentStatus(crew.id, comp.id);
        if (status === "competent") competent++;
        else if (status === "in_training") inTraining++;
        else gaps++;
      });
    });

    return {
      total,
      competent,
      inTraining,
      gaps,
      complianceRate: total > 0 ? ((competent / total) * 100).toFixed(1) : 0,
    };
  }, [crewMembers, filteredCompetencies, assessments]);

  const isLoading = competenciesLoading || crewLoading || assessmentsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Matriz de Competências STCW
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualização e gestão de competências da tripulação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Análise IA
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
            <p className="text-2xl font-bold text-foreground">{calculateStats.complianceRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Competentes</p>
            <p className="text-2xl font-bold text-emerald-400">{calculateStats.competent}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Em Treinamento</p>
            <p className="text-2xl font-bold text-amber-400">{calculateStats.inTraining}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Gaps Identificados</p>
            <p className="text-2xl font-bold text-destructive">{calculateStats.gaps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar competência por nome ou código..." 
            className="pl-10 bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px] bg-muted/30">
            <SelectValue placeholder="Área Funcional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Áreas</SelectItem>
            {Object.entries(functionAreas).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[180px] bg-muted/30">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Níveis</SelectItem>
            <SelectItem value="support">Suporte</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="management">Gerencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matrix Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando matriz...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="sticky left-0 bg-muted/50 backdrop-blur text-left p-3 text-muted-foreground font-medium min-w-[250px] z-10">
                      Competência
                    </th>
                    {crewMembers.map((crew) => (
                      <th key={crew.id} className="p-3 text-center min-w-[100px]">
                        <div className="text-xs text-muted-foreground truncate">{crew.full_name}</div>
                        <div className="text-[10px] text-muted-foreground/70 capitalize">{crew.rank}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetencies.map((comp, idx) => (
                    <tr key={comp.id} className={cn("border-b border-border/30", idx % 2 === 0 && "bg-muted/10")}>
                      <td className="sticky left-0 bg-card/95 backdrop-blur p-3 z-10">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs shrink-0">
                            {comp.code}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{comp.name}</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {functionAreas[comp.function_area]}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {comp.level}
                          </Badge>
                        </div>
                      </td>
                      {crewMembers.map((crew) => {
                        const status = getAssessmentStatus(crew.id, comp.id);
                        const config = statusConfig[status];
                        const StatusIcon = config.icon;

                        return (
                          <td key={`${crew.id}-${comp.id}`} className="p-3 text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className={cn(
                                    "p-2 rounded-lg transition-colors hover:opacity-80",
                                    config.color
                                  )}>
                                    <StatusIcon className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{config.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-muted-foreground">Legenda:</span>
        {Object.entries(statusConfig).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("p-1 rounded", config.color)}>
                <StatusIcon className="h-3 w-3" />
              </span>
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
