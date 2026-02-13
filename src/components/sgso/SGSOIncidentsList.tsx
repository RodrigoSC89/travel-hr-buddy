import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Search, Filter, RefreshCw, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SGSOIncident {
  id: string;
  title: string | null;
  message: string | null;
  severity: string | null;
  alert_type: string | null;
  source_module: string | null;
  acknowledged_at: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  investigating: "bg-info/10 text-info",
  resolved: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  near_miss: "Quase Acidente",
  minor: "Menor",
  major: "Maior",
  environmental: "Ambiental",
  operational: "Operacional",
  safety: "Segurança",
  equipment: "Equipamento",
  incident: "Incidente",
};

function getStatus(incident: SGSOIncident): string {
  if (incident.acknowledged_at) return "closed";
  return "open";
}

export const SGSOIncidentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { data: incidents, isLoading, refetch } = useQuery({
    queryKey: ["sgso-incidents-list", statusFilter, severityFilter],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("soc_alerts")
          .select("id, title, message, severity, alert_type, source_module, acknowledged_at, created_at, metadata")
          .or("source_module.ilike.%sgso%,source_module.ilike.%incident%,alert_type.ilike.%incident%")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          logger.error("Error fetching SGSO incidents: " + error.message);
          return [];
        }
        return (data || []) as SGSOIncident[];
      } catch {
        return [];
      }
    },
  });

  const filteredIncidents = incidents?.filter((incident) => {
    const matchesSearch =
      !searchTerm ||
      incident.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.alert_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getStatus(incident);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: incidents?.length || 0,
    open: incidents?.filter(i => !i.acknowledged_at).length || 0,
    critical: incidents?.filter(i => i.severity === "critical").length || 0,
    high: incidents?.filter(i => i.severity === "high").length || 0,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <CardTitle>Incidentes SGSO</CardTitle>
            <Badge variant="outline">{stats.total} registros</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {stats.open} Abertos
          </Badge>
          <Badge className="bg-red-600 text-white">
            {stats.critical} Críticos
          </Badge>
          <Badge className="bg-orange-600 text-white">
            {stats.high} Altos
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar incidentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            Carregando incidentes...
          </div>
        ) : filteredIncidents?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum incidente encontrado</p>
            <p className="text-sm mt-2">Use o botão "Novo Incidente" para registrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents?.map((incident) => {
                  const status = getStatus(incident);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="whitespace-nowrap">
                        {incident.created_at
                          ? format(new Date(incident.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TYPE_LABELS[incident.alert_type || ""] || incident.alert_type || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {incident.message || incident.title || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={SEVERITY_COLORS[incident.severity || "low"]}>
                          {incident.severity === "critical" ? "Crítica" :
                           incident.severity === "high" ? "Alta" :
                           incident.severity === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[status]}>
                          {status === "open" ? "Aberto" : "Fechado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" aria-label="Visualizar incidente" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
