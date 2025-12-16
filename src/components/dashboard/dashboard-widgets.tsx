import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Ship,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KPIWidget {
  id: string;
  title: string;
  value: number | string;
  target?: number;
  unit?: string;
  trend: "up" | "down" | "stable";
  change: number;
  icon: React.ElementType;
  color: string;
  priority: "high" | "medium" | "low";
}

interface ExportOption {
  format: "pdf" | "excel" | "csv";
  label: string;
  description: string;
}

const DashboardKPIWidget: React.FC<{ 
  kpi: KPIWidget; 
  onExport?: (kpiId: string, format: string) => void;
}> = ({ kpi, onExport }) => {
  const formatValue = (value: number | string, unit?: string): string => {
    if (typeof value === "string") return value;
    
    switch (unit) {
    case "%":
      return `${value.toFixed(1)}%`;
    case "BRL":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(value);
    case "days":
      return `${value} dias`;
    case "hours":
      return `${value}h`;
    default:
      return value.toLocaleString("pt-BR");
    }
  };

  const getTrendIcon = () => {
    switch (kpi.trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-success" />;
    case "down":
      return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
    default:
      return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getProgressValue = (): number => {
    if (!kpi.target || typeof kpi.value !== "number") return 0;
    return Math.min((kpi.value / kpi.target) * 100, 100);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <kpi.icon className={`h-4 w-4 ${kpi.color} group-hover:scale-110 transition-transform`} />
          <Badge 
            variant={kpi.priority === "high" ? "destructive" : kpi.priority === "medium" ? "default" : "secondary"}
            className="text-xs"
          >
            {kpi.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {formatValue(kpi.value, kpi.unit)}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon()}
            <span className={`font-medium ${
              kpi.trend === "up" ? "text-success" : 
                kpi.trend === "down" ? "text-destructive" : 
                  "text-muted-foreground"
            }`}>
              {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
            </span>
          </div>
          
          {onExport && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onExport(kpi.id, "excel")}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>

        {kpi.target && typeof kpi.value === "number" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Meta</span>
              <span>{formatValue(kpi.target, kpi.unit)}</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              {getProgressValue().toFixed(1)}% da meta
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardExportPanel: React.FC<{
  onExport: (format: string, options?: any) => void;
  isExporting?: boolean;
}> = ({ onExport, isExporting }) => {
  const exportOptions: ExportOption[] = [
    {
      format: "pdf",
      label: "Relatório PDF",
      description: "Relatório completo com gráficos e análises"
    },
    {
      format: "excel",
      label: "Planilha Excel",
      description: "Dados estruturados para análise avançada"
    },
    {
      format: "csv",
      label: "Arquivo CSV",
      description: "Dados brutos para importação"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Exportação de Dados
        </CardTitle>
        <CardDescription>
          Exporte os dados do dashboard em diferentes formatos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {exportOptions.map((option) => (
          <div 
            key={option.format}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm">{option.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExport(option.format)}
              disabled={isExporting}
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button 
            onClick={() => onExport("full")}
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dashboard Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardFilters: React.FC<{
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}> = ({ onFilterChange, currentFilters }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });

  const [selectedModules, setSelectedModules] = useState<string[]>(["all"]);
  const [selectedVessels, setSelectedVessels] = useState<string[]>(["all"]);

  const modules = [
    { id: "all", label: "Todos os Módulos" },
    { id: "peotram", label: "PEOTRAM" },
    { id: "hr", label: "Recursos Humanos" },
    { id: "fleet", label: "Gestão de Frota" },
    { id: "checklists", label: "Checklists" },
    { id: "travel", label: "Viagens" }
  ];

  const vessels = [
    { id: "all", label: "Todas as Embarcações" },
    { id: "mv-alpha", label: "MV Alpha" },
    { id: "mv-beta", label: "MV Beta" },
    { id: "mv-gamma", label: "MV Gamma" },
    { id: "mv-delta", label: "MV Delta" }
  ];

  const applyFilters = () => {
    onFilterChange({
      dateRange,
      modules: selectedModules,
      vessels: selectedVessels
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filtros Avançados
        </CardTitle>
        <CardDescription>
          Personalize a visualização dos dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Período</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Data Inicial</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Data Final</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Módulos</h4>
          <div className="space-y-2">
            {modules.map((module) => (
              <label key={module.id} className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedModules.includes(module.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModules(prev => [...prev, module.id]);
                    } else {
                      setSelectedModules(prev => prev.filter(id => id !== module.id));
                    }
                  }}
                  className="rounded"
                />
                <span>{module.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vessels */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Embarcações</h4>
          <div className="space-y-2">
            {vessels.map((vessel) => (
              <label key={vessel.id} className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedVessels.includes(vessel.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedVessels(prev => [...prev, vessel.id]);
                    } else {
                      setSelectedVessels(prev => prev.filter(id => id !== vessel.id));
                    }
                  }}
                  className="rounded"
                />
                <span>{vessel.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={applyFilters} className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { DashboardKPIWidget, DashboardExportPanel, DashboardFilters };