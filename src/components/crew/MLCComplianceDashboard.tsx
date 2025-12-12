import { memo, memo, useState } from "react";;;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Scale, Clock, AlertTriangle, CheckCircle2, Users, 
  FileText, Moon, Sun, Coffee, Download, Sparkles
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface MLCRestHours {
  id: string;
  crew_member_id: string;
  vessel_id: string;
  record_date: string;
  rest_periods: unknown[];
  total_rest_hours: number;
  total_work_hours: number;
  compliant: boolean;
  violation_type: string | null;
  violation_details: string | null;
}

interface CrewMember {
  id: string;
  full_name: string;
  rank: string;
}

// MLC 2006 Requirements
const MLC_REQUIREMENTS = {
  minRestIn24h: 10, // Minimum 10 hours rest in any 24-hour period
  minRestIn7Days: 77, // Minimum 77 hours rest in any 7-day period
  maxWorkIn24h: 14, // Maximum 14 hours work in any 24-hour period
  maxWorkIn7Days: 72, // Maximum 72 hours work in any 7-day period
  minRestPeriods: 2, // Rest may be divided into no more than 2 periods
  minRestPeriodLength: 6, // One period of rest must be at least 6 hours
};

const checklistItems = [
  { id: "rest_10h", label: "Mínimo 10h de descanso em 24h", category: "A2.3" },
  { id: "rest_77h", label: "Mínimo 77h de descanso em 7 dias", category: "A2.3" },
  { id: "max_work_14h", label: "Máximo 14h de trabalho em 24h", category: "A2.3" },
  { id: "max_work_72h", label: "Máximo 72h de trabalho em 7 dias", category: "A2.3" },
  { id: "rest_periods", label: "Descanso dividido em no máximo 2 períodos", category: "A2.3" },
  { id: "min_period_6h", label: "Pelo menos 1 período de descanso ≥ 6h", category: "A2.3" },
  { id: "records_kept", label: "Registros mantidos e acessíveis", category: "A2.3" },
  { id: "crew_notified", label: "Tripulação informada dos horários", category: "A2.3" },
];

export const MLCComplianceDashboard = memo(function() {
  const [selectedVessel, setSelectedVessel] = useState<string>("all");

  const { data: restHours = [], isLoading } = useQuery({
    queryKey: ["mlc-rest-hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mlc_rest_hours")
        .select("*")
        .gte("record_date", subDays(new Date(), 30).toISOString())
        .order("record_date", { ascending: false });
      if (error) throw error;
      return data as MLCRestHours[];
    },
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-mlc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank")
        .eq("status", "active");
      if (error) throw error;
      return data as CrewMember[];
    },
  });

  const getCrewName = (id: string) => {
    const crew = crewMembers.find(c => c.id === id);
    return crew?.full_name || "N/A";
  });

  // Calculate stats
  const totalRecords = restHours.length;
  const compliantRecords = restHours.filter(r => r.compliant).length;
  const violations = restHours.filter(r => !r.compliant);
  const complianceRate = totalRecords > 0 ? ((compliantRecords / totalRecords) * 100).toFixed(1) : 100;
  
  const avgRestHours = restHours.length > 0 
    ? (restHours.reduce((sum, r) => sum + (r.total_rest_hours || 0), 0) / restHours.length).toFixed(1)
    : 0;

  const avgWorkHours = restHours.length > 0
    ? (restHours.reduce((sum, r) => sum + (r.total_work_hours || 0), 0) / restHours.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            MLC 2006 Compliance Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitoramento de horas de trabalho e descanso conforme MLC 2006
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Análise IA
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Relatório PSC
          </Button>
        </div>
      </div>

      {/* Compliance Score */}
      <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Taxa de Conformidade MLC 2006</p>
              <div className="flex items-end gap-2">
                <span className={cn(
                  "text-5xl font-bold",
                  Number(complianceRate) >= 95 ? "text-emerald-400" :
                    Number(complianceRate) >= 80 ? "text-amber-400" : "text-destructive"
                )}>
                  {complianceRate}%
                </span>
                <span className="text-muted-foreground mb-2">nos últimos 30 dias</span>
              </div>
              <Progress 
                value={Number(complianceRate)} 
                className="h-3 mt-3"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <Moon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{avgRestHours}h</p>
                <p className="text-xs text-muted-foreground">Média Descanso/Dia</p>
              </div>
              <div className="text-center">
                <Sun className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{avgWorkHours}h</p>
                <p className="text-xs text-muted-foreground">Média Trabalho/Dia</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{violations.length}</p>
                <p className="text-xs text-muted-foreground">Violações</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registros (30 dias)</p>
                <p className="text-xl font-bold text-foreground">{totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-xl font-bold text-emerald-400">{compliantRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Coffee className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mín. Descanso MLC</p>
                <p className="text-xl font-bold text-foreground">{MLC_REQUIREMENTS.minRestIn24h}h/24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
                <p className="text-xl font-bold text-foreground">{crewMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MLC Checklist */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Checklist MLC 2006 - Reg. 2.3
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Violations */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Violações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {violations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma violação nos últimos 30 dias</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Excelente conformidade com MLC 2006
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.slice(0, 5).map((violation) => (
                  <div 
                    key={violation.id}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {getCrewName(violation.crew_member_id)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(violation.record_date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-destructive">
                        Descanso: {violation.total_rest_hours}h
                      </span>
                      <span className="text-amber-400">
                        Trabalho: {violation.total_work_hours}h
                      </span>
                    </div>
                    {violation.violation_details && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {violation.violation_details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MLC Requirements Reference */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Requisitos MLC 2006 - Regulação 2.3</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-foreground mb-2">Horas de Descanso</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Mínimo 10 horas em qualquer período de 24 horas</li>
                <li>• Mínimo 77 horas em qualquer período de 7 dias</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-foreground mb-2">Períodos de Descanso</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Máximo 2 períodos de descanso</li>
                <li>• Um período deve ser de pelo menos 6 horas</li>
                <li>• Intervalo entre períodos não deve exceder 14 horas</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-foreground mb-2">Documentação</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Registros devem ser mantidos a bordo</li>
                <li>• Tripulação deve ter cópia dos registros</li>
                <li>• Registros disponíveis para PSC</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
