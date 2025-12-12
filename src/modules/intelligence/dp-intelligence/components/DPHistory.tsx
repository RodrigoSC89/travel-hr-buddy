import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Download, Filter, TrendingUp, Activity, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: number;
  date: string;
  event: string;
  type: string;
  status: string;
  details: string;
}

const historyData: HistoryItem[] = [
  {
    id: 1,
    date: "2024-12-06 14:30",
    event: "Análise IA Completa",
    type: "analysis",
    status: "success",
    details: "Todos os sistemas operando normalmente. Confidence 98%",
  },
  {
    id: 2,
    date: "2024-12-06 12:15",
    event: "Troca de Referência",
    type: "operation",
    status: "success",
    details: "DGPS Primary → HPR System (manutenção programada)",
  },
  {
    id: 3,
    date: "2024-12-06 10:00",
    event: "Alerta de Vento",
    type: "alert",
    status: "warning",
    details: "Velocidade do vento atingiu 25 knots. Capability reduzida.",
  },
  {
    id: 4,
    date: "2024-12-05 18:45",
    event: "Análise Preditiva",
    type: "analysis",
    status: "success",
    details: "Nenhuma falha prevista nas próximas 24h. Manutenção recomendada em 7 dias.",
  },
  {
    id: 5,
    date: "2024-12-05 16:30",
    event: "Otimização de Energia",
    type: "optimization",
    status: "success",
    details: "Economia de 12% no consumo de energia. Configuração otimizada aplicada.",
  },
  {
    id: 6,
    date: "2024-12-05 08:00",
    event: "Início de Operação",
    type: "operation",
    status: "success",
    details: "Operação DP iniciada. Todos os sistemas online.",
  },
  {
    id: 7,
    date: "2024-12-04 22:15",
    event: "Manutenção Preventiva",
    type: "maintenance",
    status: "info",
    details: "Thruster #3 - manutenção preventiva realizada.",
  },
  {
    id: 8,
    date: "2024-12-04 14:00",
    event: "Falha de Sensor",
    type: "alert",
    status: "error",
    details: "Wind Sensor #2 offline. Backup ativado automaticamente.",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
  case "success":
    return <Badge className="bg-emerald-100 text-emerald-700">Sucesso</Badge>;
  case "warning":
    return <Badge className="bg-amber-100 text-amber-700">Alerta</Badge>;
  case "error":
    return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
  case "info":
    return <Badge className="bg-blue-100 text-blue-700">Info</Badge>;
  default:
    return <Badge>{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
  case "analysis":
    return <TrendingUp className="h-4 w-4 text-purple-500" />;
  case "operation":
    return <Activity className="h-4 w-4 text-blue-500" />;
  case "alert":
    return <Activity className="h-4 w-4 text-amber-500" />;
  case "optimization":
    return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  case "maintenance":
    return <Activity className="h-4 w-4 text-cyan-500" />;
  default:
    return <Clock className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    analysis: "Análise",
    operation: "Operação",
    alert: "Alerta",
    optimization: "Otimização",
    maintenance: "Manutenção",
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    success: "Sucesso",
    warning: "Alerta",
    error: "Erro",
    info: "Info",
  };
  return labels[status] || status;
};

export default function DPHistory() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    statuses: [] as string[],
    dateFrom: "",
    dateTo: "",
    searchText: "",
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const allTypes = ["analysis", "operation", "alert", "optimization", "maintenance"];
  const allStatuses = ["success", "warning", "error", "info"];

  const filteredData = historyData.filter((item) => {
    // Type filter
    if (activeFilters.types.length > 0 && !activeFilters.types.includes(item.type)) {
      return false;
    }
    // Status filter
    if (activeFilters.statuses.length > 0 && !activeFilters.statuses.includes(item.status)) {
      return false;
    }
    // Text search
    if (activeFilters.searchText) {
      const searchLower = activeFilters.searchText.toLowerCase();
      if (
        !item.event.toLowerCase().includes(searchLower) &&
        !item.details.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    // Date filters
    if (activeFilters.dateFrom) {
      const itemDate = new Date(item.date.replace(" ", "T"));
      const fromDate = new Date(activeFilters.dateFrom);
      if (itemDate < fromDate) return false;
    }
    if (activeFilters.dateTo) {
      const itemDate = new Date(item.date.replace(" ", "T"));
      const toDate = new Date(activeFilters.dateTo);
      toDate.setHours(23, 59, 59);
      if (itemDate > toDate) return false;
    }
    return true;
  });

  const handleApplyFilters = () => {
    setActiveFilters({ ...filters });
    setIsFilterOpen(false);
    toast.success("Filtros aplicados", {
      description: `${filteredData.length} eventos encontrados.`,
    });
  };

  const handleClearFilters = () => {
    const cleared = {
      types: [],
      statuses: [],
      dateFrom: "",
      dateTo: "",
      searchText: "",
    };
    setFilters(cleared);
    setActiveFilters(cleared);
    toast.success("Filtros limpos");
  };

  const handleToggleType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const handleToggleStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleExport = (format: "csv" | "json" | "pdf") => {
    const dataToExport = filteredData;

    if (format === "csv") {
      const headers = ["Data", "Evento", "Tipo", "Status", "Detalhes"];
      const rows = dataToExport.map((item) => [
        item.date,
        item.event,
        getTypeLabel(item.type),
        getStatusLabel(item.status),
        item.details,
      ]);
      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dp-historico-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("Exportação concluída", { description: "Arquivo CSV baixado com sucesso." });
    } else if (format === "json") {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dp-historico-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      toast.success("Exportação concluída", { description: "Arquivo JSON baixado com sucesso." });
    } else if (format === "pdf") {
      // Simple text-based PDF simulation - in production would use jsPDF
      const textContent = dataToExport
        .map((item) => `${item.date} - ${item.event}\nTipo: ${getTypeLabel(item.type)} | Status: ${getStatusLabel(item.status)}\n${item.details}\n\n`)
        .join("");
      const blob = new Blob([`DP INTELLIGENCE - HISTÓRICO DE EVENTOS\n\n${textContent}`], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dp-historico-${new Date().toISOString().split("T")[0]}.txt`;
      link.click();
      toast.success("Exportação concluída", { description: "Relatório baixado com sucesso." });
    }

    setIsExportOpen(false);
  };

  const hasActiveFilters =
    activeFilters.types.length > 0 ||
    activeFilters.statuses.length > 0 ||
    activeFilters.dateFrom ||
    activeFilters.dateTo ||
    activeFilters.searchText;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Histórico de Eventos</h2>
          {hasActiveFilters && (
            <Badge variant="secondary" className="gap-1">
              {filteredData.length} resultados
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={handleClearFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {/* Filter Dialog */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={hasActiveFilters ? "border-primary" : ""}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filtrar Eventos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <Input
                    placeholder="Buscar por evento ou detalhes..."
                    value={filters.searchText}
                    onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                  />
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label>Tipo de Evento</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTypes.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.types.includes(type)}
                          onCheckedChange={() => handleToggleType(type)}
                        />
                        <span className="text-sm">{getTypeLabel(type)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.statuses.includes(status)}
                          onCheckedChange={() => handleToggleStatus(status)}
                        />
                        <span className="text-sm">{getStatusLabel(status)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Inicial</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpar
                </Button>
                <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Dialog */}
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Exportar Histórico</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <p className="text-sm text-muted-foreground">
                  Exportar {filteredData.length} eventos selecionados
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport("csv")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar como CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport("json")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar como JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleExport("pdf")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar como Relatório
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Timeline de Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
              <div className="space-y-6">
                {filteredData.map((item) => (
                  <div key={item.id} className="relative pl-10">
                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{item.event}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Análises IA</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operações</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relatórios</p>
                <p className="text-2xl font-bold">56</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
