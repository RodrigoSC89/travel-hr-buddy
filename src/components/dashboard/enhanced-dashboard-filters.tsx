import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Settings, Filter, Clock, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface DashboardFiltersProps {
  selectedKPIs: string[];
  onKPIToggle: (kpi: string) => void;
  filterPeriod: string;
  onPeriodChange: (period: string) => void;
  isAutoUpdate: boolean;
  onAutoUpdateToggle: (enabled: boolean) => void;
  lastUpdated: Date;
}

const availableKPIs = [
  { id: "revenue", label: "Receita Total", icon: DollarSign, color: "text-green-600" },
  { id: "users", label: "Usuários Ativos", icon: Users, color: "text-blue-600" },
  { id: "performance", label: "Performance Sistema", icon: Activity, color: "text-orange-600" },
  { id: "satisfaction", label: "Satisfação", icon: TrendingUp, color: "text-purple-600" },
];

const periodOptions = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "1y", label: "Último ano" },
];

export const EnhancedDashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedKPIs,
  onKPIToggle,
  filterPeriod,
  onPeriodChange,
  isAutoUpdate,
  onAutoUpdateToggle,
  lastUpdated,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState("grade");
  const { toast } = useToast();

  const handleLayoutChange = (layout: string) => {
    setSelectedLayout(layout);
    toast({
      title: "📊 Layout Alterado",
      description: `Dashboard exibindo em modo ${layout}`
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="auto-update"
              checked={isAutoUpdate}
              onCheckedChange={onAutoUpdateToggle}
            />
            <Label htmlFor="auto-update" className="text-sm">
              Atualização automática
            </Label>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isFiltersOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Personalizar Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Selection */}
            <div className="space-y-2">
              <Label>Período de Análise</Label>
              <Select value={filterPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* KPI Selection */}
            <div className="space-y-4">
              <Label>KPIs Visíveis</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableKPIs.map((kpi) => (
                  <div
                    key={kpi.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      selectedKPIs.includes(kpi.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    }`}
                    onClick={() => onKPIToggle(kpi.id)}
                  >
                    <div className="flex items-center gap-3">
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      <span className="font-medium">{kpi.label}</span>
                    </div>
                    <Switch
                      checked={selectedKPIs.includes(kpi.id)}
                      onCheckedChange={() => onKPIToggle(kpi.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-2">
              <Label>Layout do Dashboard</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleLayoutChange("compacto")}
                  className={selectedLayout === "compacto" ? "border-primary" : ""}
                >
                  <div className="text-center">
                    <div className="w-8 h-6 mx-auto mb-1 bg-muted rounded"></div>
                    <span className="text-xs">Compacto</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleLayoutChange("grade")}
                  className={selectedLayout === "grade" ? "border-primary" : ""}
                >
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-1 w-8 h-6 mx-auto mb-1">
                      <div className="bg-primary rounded"></div>
                      <div className="bg-primary rounded"></div>
                      <div className="bg-primary rounded"></div>
                      <div className="bg-primary rounded"></div>
                    </div>
                    <span className="text-xs">Grade</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleLayoutChange("lista")}
                  className={selectedLayout === "lista" ? "border-primary" : ""}
                >
                  <div className="text-center">
                    <div className="w-8 h-6 mx-auto mb-1 bg-muted rounded flex flex-col gap-1">
                      <div className="h-2 bg-muted-foreground rounded"></div>
                      <div className="h-2 bg-muted-foreground rounded"></div>
                    </div>
                    <span className="text-xs">Lista</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Save Preferences */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsFiltersOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsFiltersOpen(false)}>
                Salvar Preferências
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};