/**
 * ESG Settings - Configurações de Fatores de Emissão e Parâmetros
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Settings,
  Save,
  RefreshCw,
  Fuel,
  Calculator,
  Bell,
  Target,
  Ship,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface EmissionFactor {
  id: string;
  fuelType: string;
  co2Factor: number;
  soxFactor: number;
  noxFactor: number;
  pmFactor: number;
  source: string;
  lastUpdated: string;
}

interface Target {
  id: string;
  name: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: "on_track" | "at_risk" | "off_track";
}

const initialFactors: EmissionFactor[] = [
  { id: "1", fuelType: "HFO (Heavy Fuel Oil)", co2Factor: 3.114, soxFactor: 0.02, noxFactor: 0.087, pmFactor: 0.0015, source: "IMO MEPC.308(73)", lastUpdated: "2024-01-01" },
  { id: "2", fuelType: "MGO (Marine Gas Oil)", co2Factor: 3.206, soxFactor: 0.001, noxFactor: 0.087, pmFactor: 0.0003, source: "IMO MEPC.308(73)", lastUpdated: "2024-01-01" },
  { id: "3", fuelType: "VLSFO (0.5% S)", co2Factor: 3.151, soxFactor: 0.005, noxFactor: 0.087, pmFactor: 0.0008, source: "IMO MEPC.308(73)", lastUpdated: "2024-01-01" },
  { id: "4", fuelType: "LNG", co2Factor: 2.750, soxFactor: 0.0, noxFactor: 0.015, pmFactor: 0.0001, source: "IMO MEPC.308(73)", lastUpdated: "2024-01-01" },
  { id: "5", fuelType: "Metanol", co2Factor: 1.375, soxFactor: 0.0, noxFactor: 0.02, pmFactor: 0.0001, source: "GHG Protocol", lastUpdated: "2024-01-01" },
  { id: "6", fuelType: "Biocombustível", co2Factor: 0.0, soxFactor: 0.0, noxFactor: 0.05, pmFactor: 0.0002, source: "GHG Protocol", lastUpdated: "2024-01-01" },
];

const initialTargets: Target[] = [
  { id: "1", name: "Redução CO₂ Anual", metric: "CO₂", target: 2000, current: 1769, unit: "ton", deadline: "2024-12-31", status: "on_track" },
  { id: "2", name: "Rating CII Frota", metric: "CII", target: 4.0, current: 4.8, unit: "gCO₂/dwt·nm", deadline: "2024-12-31", status: "at_risk" },
  { id: "3", name: "Limite SOx", metric: "SOx", target: 0.5, current: 0.35, unit: "% S", deadline: "Contínuo", status: "on_track" },
  { id: "4", name: "Uso de LNG", metric: "LNG", target: 15, current: 5, unit: "% mix", deadline: "2025-12-31", status: "off_track" },
];

export function ESGSettings() {
  const [factors, setFactors] = useState<EmissionFactor[]>(() => {
    const saved = localStorage.getItem("esg-emission-factors");
    return saved ? JSON.parse(saved) : initialFactors;
  });
  const [targets, setTargets] = useState<Target[]>(() => {
    const saved = localStorage.getItem("esg-targets");
    return saved ? JSON.parse(saved) : initialTargets;
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("esg-notifications");
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      weeklyReport: true,
      complianceAlerts: true,
      targetAlerts: true,
    };
  });
  const [autoCollection, setAutoCollection] = useState(() => {
    const saved = localStorage.getItem("esg-auto-collection");
    return saved ? JSON.parse(saved) : {
      enabled: true,
      frequency: "daily",
      vessels: ["all"],
    };
  });

  const handleSaveFactors = () => {
    localStorage.setItem("esg-emission-factors", JSON.stringify(factors));
    toast.success("Fatores de emissão salvos com sucesso!");
  };

  const handleUpdateFactors = () => {
    setFactors(initialFactors);
    localStorage.setItem("esg-emission-factors", JSON.stringify(initialFactors));
    toast.success("Fatores atualizados para versão mais recente IMO!");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("esg-notifications", JSON.stringify(notifications));
    toast.success("Configurações de notificação salvas!");
  };

  const handleExportConfig = () => {
    const config = { factors, targets, notifications, autoCollection };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "esg-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configurações exportadas para arquivo JSON!");
  };

  const handleImportConfig = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string);
            if (config.factors) setFactors(config.factors);
            if (config.targets) setTargets(config.targets);
            if (config.notifications) setNotifications(config.notifications);
            if (config.autoCollection) setAutoCollection(config.autoCollection);
            toast.success("Configurações importadas com sucesso!");
          } catch {
            toast.error("Erro ao importar arquivo de configuração");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="factors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="factors">Fatores de Emissão</TabsTrigger>
          <TabsTrigger value="targets">Metas ESG</TabsTrigger>
          <TabsTrigger value="collection">Coleta de Dados</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* Emission Factors */}
        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Fatores de Emissão por Combustível
                  </CardTitle>
                  <CardDescription>
                    Fatores GHG Protocol / IMO MEPC para cálculo de emissões (kg/ton de combustível)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleUpdateFactors} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar IMO
                  </Button>
                  <Button onClick={handleSaveFactors} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Combustível</TableHead>
                    <TableHead>CO₂ (kg/ton)</TableHead>
                    <TableHead>SOx (kg/ton)</TableHead>
                    <TableHead>NOx (kg/ton)</TableHead>
                    <TableHead>PM (kg/ton)</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factors.map((factor) => (
                    <TableRow key={factor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-muted-foreground" />
                          {factor.fuelType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.001"
                          value={factor.co2Factor} 
                          onChange={(e) => {
                            setFactors(factors.map(f => 
                              f.id === factor.id ? { ...f, co2Factor: Number(e.target.value) } : f
                            ));
                          }}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.001"
                          value={factor.soxFactor} 
                          onChange={(e) => {
                            setFactors(factors.map(f => 
                              f.id === factor.id ? { ...f, soxFactor: Number(e.target.value) } : f
                            ));
                          }}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.001"
                          value={factor.noxFactor} 
                          onChange={(e) => {
                            setFactors(factors.map(f => 
                              f.id === factor.id ? { ...f, noxFactor: Number(e.target.value) } : f
                            ));
                          }}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.0001"
                          value={factor.pmFactor} 
                          onChange={(e) => {
                            setFactors(factors.map(f => 
                              f.id === factor.id ? { ...f, pmFactor: Number(e.target.value) } : f
                            ));
                          }}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{factor.source}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{factor.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Sobre os Fatores de Emissão</p>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Os fatores padrão são baseados nas diretrizes IMO MEPC.308(73) e GHG Protocol. 
                    Você pode ajustar os valores conforme necessário para sua operação específica.
                    Alterações são registradas para auditoria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targets */}
        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas ESG
                  </CardTitle>
                  <CardDescription>
                    Configure metas de redução de emissões e sustentabilidade
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Target className="h-4 w-4" />
                  Nova Meta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targets.map((target) => (
                  <div key={target.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          target.status === "on_track" ? "bg-green-100 dark:bg-green-900" :
                          target.status === "at_risk" ? "bg-amber-100 dark:bg-amber-900" :
                          "bg-red-100 dark:bg-red-900"
                        }`}>
                          {target.status === "on_track" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : target.status === "at_risk" ? (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{target.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Prazo: {target.deadline}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        target.status === "on_track" ? "default" :
                        target.status === "at_risk" ? "secondary" : "destructive"
                      } className={target.status === "on_track" ? "bg-green-600" : target.status === "at_risk" ? "bg-amber-500" : ""}>
                        {target.status === "on_track" ? "No Caminho" :
                         target.status === "at_risk" ? "Em Risco" : "Fora da Meta"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Meta</Label>
                        <p className="font-medium">{target.target} {target.unit}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Atual</Label>
                        <p className="font-medium">{target.current} {target.unit}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Progresso</Label>
                        <p className="font-medium">
                          {Math.round((1 - target.current / target.target) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection */}
        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Coleta Automática de Dados
              </CardTitle>
              <CardDescription>
                Configure a coleta automática de dados de consumo e emissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Coleta Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Coletar dados automaticamente das embarcações
                  </p>
                </div>
                <Switch 
                  checked={autoCollection.enabled}
                  onCheckedChange={(checked) => setAutoCollection({ ...autoCollection, enabled: checked })}
                />
              </div>

              {autoCollection.enabled && (
                <>
                  <div className="grid gap-2">
                    <Label>Frequência de Coleta</Label>
                    <Select 
                      value={autoCollection.frequency}
                      onValueChange={(v) => setAutoCollection({ ...autoCollection, frequency: v })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Embarcações Monitoradas</Label>
                    <div className="space-y-2">
                      {["PSV Atlantic Explorer", "AHTS Pacific Star", "OSV Caribbean Wind", "PSV Gulf Stream"].map(vessel => (
                        <div key={vessel} className="flex items-center gap-2">
                          <Switch defaultChecked />
                          <span className="text-sm">{vessel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Notificação
                  </CardTitle>
                  <CardDescription>
                    Gerencie alertas e relatórios automáticos
                  </CardDescription>
                </div>
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas críticos por e-mail
                  </p>
                </div>
                <Switch 
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatório Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo semanal de emissões
                  </p>
                </div>
                <Switch 
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Compliance</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre prazos regulatórios
                  </p>
                </div>
                <Switch 
                  checked={notifications.complianceAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, complianceAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Metas</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando metas estão em risco
                  </p>
                </div>
                <Switch 
                  checked={notifications.targetAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, targetAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Integrações e Exportação
              </CardTitle>
              <CardDescription>
                Gerencie integrações com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Exportar Configurações</p>
                        <p className="text-sm text-muted-foreground">
                          Baixar todas as configurações em JSON
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleExportConfig}>
                      Exportar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Upload className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">Importar Configurações</p>
                        <p className="text-sm text-muted-foreground">
                          Carregar configurações de arquivo
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleImportConfig}>
                      Importar
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">APIs e Integrações Disponíveis</h4>
                  <div className="space-y-2">
                    {[
                      { name: "IMO GISIS", status: "connected", desc: "Submissão automática DCS" },
                      { name: "EU THETIS-MRV", status: "connected", desc: "Reporting MRV" },
                      { name: "Classificadora (DNV/ABS)", status: "pending", desc: "Verificação CII" },
                      { name: "ERP (SAP/Oracle)", status: "disconnected", desc: "Dados financeiros" },
                    ].map((api) => (
                      <div key={api.name} className="flex items-center justify-between p-2 bg-background rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{api.name}</p>
                          <p className="text-xs text-muted-foreground">{api.desc}</p>
                        </div>
                        <Badge variant={
                          api.status === "connected" ? "default" :
                          api.status === "pending" ? "secondary" : "outline"
                        } className={api.status === "connected" ? "bg-green-600" : ""}>
                          {api.status === "connected" ? "Conectado" :
                           api.status === "pending" ? "Pendente" : "Desconectado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
