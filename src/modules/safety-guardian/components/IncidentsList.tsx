/**
 * Incidents List Component
 * Lista de ocorrências com filtros e ações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  Shield,
  Ship,
  Eye,
  Brain,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Download,
} from "lucide-react";
import type { SafetyIncident, SafetyFilter } from "../types";

interface IncidentsListProps {
  incidents: SafetyIncident[];
  filters: SafetyFilter;
  onFilterChange: (filters: SafetyFilter) => void;
  onViewDetails: (incident: SafetyIncident) => void;
  onAnalyze: (incident: SafetyIncident) => void;
  loading?: boolean;
}

const typeConfig = {
  incident: { label: "Incidente", icon: AlertCircle, bgColor: "bg-destructive/10", textColor: "text-destructive" },
  near_miss: { label: "Near Miss", icon: AlertTriangle, bgColor: "bg-warning/10", textColor: "text-warning" },
  unsafe_condition: { label: "Cond. Insegura", icon: Shield, bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-600 dark:text-blue-400" },
  unsafe_act: { label: "Ato Inseguro", icon: AlertTriangle, bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-600 dark:text-orange-400" },
};

const statusConfig = {
  open: { label: "Aberto", color: "bg-warning/10 text-warning border-warning/20" },
  investigating: { label: "Investigando", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
  action_pending: { label: "Ação Pendente", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success border-success/20" },
  closed: { label: "Fechado", color: "bg-muted text-muted-foreground" },
};

const severityConfig = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-destructive/10 text-destructive",
};

export const IncidentsList: React.FC<IncidentsListProps> = ({
  incidents,
  filters,
  onFilterChange,
  onViewDetails,
  onAnalyze,
  loading,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ocorrências Recentes
            <Badge variant="outline">{incidents.length}</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ocorrências..."
                value={filters.searchTerm || ""}
                onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t mt-4">
            <Select
              value={filters.types?.[0] || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  types: value === "all" ? undefined : [value],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="incident">Incidentes</SelectItem>
                <SelectItem value="near_miss">Near Miss</SelectItem>
                <SelectItem value="unsafe_condition">Condição Insegura</SelectItem>
                <SelectItem value="unsafe_act">Ato Inseguro</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severities?.[0] || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  severities: value === "all" ? undefined : [value],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas severidades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.statuses?.[0] || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  statuses: value === "all" ? undefined : [value],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="investigating">Investigando</SelectItem>
                <SelectItem value="action_pending">Ação Pendente</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma ocorrência encontrada</p>
              </div>
            ) : (
              incidents.map((incident) => {
                const typeInfo = typeConfig[incident.type];
                const TypeIcon = typeInfo.icon;

                return (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
                        <TypeIcon className={`h-5 w-5 ${typeInfo.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{incident.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                          <Badge className={`text-xs ${severityConfig[incident.severity]}`}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {incident.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {incident.vessel_name}
                          </span>
                          <span>{incident.incident_date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={statusConfig[incident.status].color}>
                        {statusConfig[incident.status].label}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails(incident)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAnalyze(incident)}>
                            <Brain className="h-4 w-4 mr-2" />
                            Analisar com IA
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar Relatório
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
