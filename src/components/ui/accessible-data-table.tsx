import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataRow {
  id: string;
  name: string;
  status: "active" | "inactive" | "warning" | "expired";
  type: string;
  lastUpdate: string;
  responsible: string;
  priority: "high" | "medium" | "low";
}

interface AccessibleDataTableProps {
  title: string;
  description?: string;
  data: DataRow[];
  searchPlaceholder?: string;
  onRowAction?: (action: string, row: DataRow) => void;
}

const AccessibleDataTable: React.FC<AccessibleDataTableProps> = ({
  title,
  description,
  data,
  searchPlaceholder = "Buscar...",
  onRowAction,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof DataRow>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        label: "Ativo",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      inactive: {
        label: "Inativo",
        className: "bg-slate-100 text-slate-800 border-slate-200",
        icon: <Clock className="w-3 h-3" />,
      },
      warning: {
        label: "Atenção",
        className: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      expired: {
        label: "Expirado",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
    };
    return configs[status as keyof typeof configs] || configs.inactive;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: {
        label: "Alta",
        className: "bg-red-100 text-red-800 border-red-200",
        sortOrder: 3,
      },
      medium: {
        label: "Média",
        className: "bg-amber-100 text-amber-800 border-amber-200",
        sortOrder: 2,
      },
      low: {
        label: "Baixa",
        className: "bg-green-100 text-green-800 border-green-200",
        sortOrder: 1,
      },
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const filteredAndSortedData = data
    .filter(row => {
      const matchesSearch =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || row.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "priority") {
        const aPriority = getPriorityConfig(a.priority).sortOrder;
        const bPriority = getPriorityConfig(b.priority).sortOrder;
        return (aPriority - bPriority) * direction;
      }

      return aValue.toString().localeCompare(bValue.toString()) * direction;
    });

  const handleSort = (field: keyof DataRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowAction = (action: string, row: DataRow) => {
    onRowAction?.(action, row);
  };

  return (
    <Card className="w-full border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
            {description && (
              <CardDescription className="text-muted-foreground mt-1">
                {description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" aria-label="Exportar dados">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Controles de busca e filtro */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Buscar registros
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-background text-foreground border-border focus:ring-2 focus:ring-primary/50"
                aria-label="Campo de busca"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList className="grid grid-cols-5 bg-muted/50">
                <TabsTrigger value="all" className="text-xs">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Ativos
                </TabsTrigger>
                <TabsTrigger value="warning" className="text-xs">
                  Atenção
                </TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs">
                  Inativos
                </TabsTrigger>
                <TabsTrigger value="expired" className="text-xs">
                  Expirados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label={`Tabela de ${title.toLowerCase()}`}>
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left p-4 font-semibold text-foreground">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="p-0 h-auto font-semibold text-foreground hover:text-primary"
                    aria-label="Ordenar por nome"
                  >
                    Nome
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="p-0 h-auto font-semibold text-foreground hover:text-primary"
                    aria-label="Ordenar por status"
                  >
                    Status
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </th>
                <th className="text-left p-4 font-semibold text-foreground">Tipo</th>
                <th className="text-left p-4 font-semibold text-foreground">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("priority")}
                    className="p-0 h-auto font-semibold text-foreground hover:text-primary"
                    aria-label="Ordenar por prioridade"
                  >
                    Prioridade
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                </th>
                <th className="text-left p-4 font-semibold text-foreground">Responsável</th>
                <th className="text-left p-4 font-semibold text-foreground">Última Atualização</th>
                <th className="text-center p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, index) => {
                const statusConfig = getStatusConfig(row.status);
                const priorityConfig = getPriorityConfig(row.priority);

                return (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200"
                    role="row"
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground">{row.name}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusConfig.className} gap-1 font-medium border`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{row.type}</td>
                    <td className="p-4">
                      <Badge className={`${priorityConfig.className} font-medium border`}>
                        {priorityConfig.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{row.responsible}</td>
                    <td className="p-4 text-muted-foreground">{row.lastUpdate}</td>
                    <td className="p-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            aria-label={`Ações para ${row.name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-popover border-border shadow-lg"
                        >
                          <DropdownMenuLabel className="text-popover-foreground">
                            Ações
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => handleRowAction("view", row)}
                            className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRowAction("edit", row)}
                            className="text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRowAction("delete", row)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
            </div>
          </div>
        )}

        {/* Footer com informações */}
        {filteredAndSortedData.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Mostrando {filteredAndSortedData.length} de {data.length} registros
              </span>
              <span>Última atualização: {new Date().toLocaleString("pt-BR")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessibleDataTable;
