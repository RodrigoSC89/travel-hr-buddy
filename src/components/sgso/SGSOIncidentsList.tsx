import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { AlertTriangle, Search, Filter, RefreshCw, Eye, Ship } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SGSOIncident {
  id: string;
  vessel_id: string | null;
  type: string | null;
  description: string | null;
  reported_at: string | null;
  severity: string | null;
  status: string | null;
  corrective_action: string | null;
  created_at: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const TYPE_LABELS: Record<string, string> = {
  near_miss: "Quase Acidente",
  minor: "Menor",
  major: "Maior",
  environmental: "Ambiental",
  operational: "Operacional",
  safety: "Segurança",
  equipment: "Equipamento",
};

export const SGSOIncidentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { data: incidents, isLoading, refetch } = useQuery({
    queryKey: ["sgso-incidents", statusFilter, severityFilter],
    queryFn: async () => {
      let query = (supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            order: (column: string, options: { ascending: boolean }) => Promise<{
              data: SGSOIncident[] | null;
              error: { message: string } | null;
            }>;
          };
        };
      }).from("sgso_incidents").select("*");
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SGSOIncident[];
    },
  });

  const filteredIncidents = incidents?.filter((incident) => {
    const matchesSearch = 
      !searchTerm ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: incidents?.length || 0,
    open: incidents?.filter(i => i.status === "open").length || 0,
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
              <SelectItem value="investigating">Investigando</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
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
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
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
                {filteredIncidents?.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="whitespace-nowrap">
                      {incident.reported_at
                        ? format(new Date(incident.reported_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : incident.created_at
                        ? format(new Date(incident.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TYPE_LABELS[incident.type || ""] || incident.type || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {incident.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={SEVERITY_COLORS[incident.severity || "low"]}>
                        {incident.severity === "critical" ? "Crítica" :
                         incident.severity === "high" ? "Alta" :
                         incident.severity === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[incident.status || "open"]}>
                        {incident.status === "open" ? "Aberto" :
                         incident.status === "investigating" ? "Investigando" :
                         incident.status === "resolved" ? "Resolvido" : "Fechado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
