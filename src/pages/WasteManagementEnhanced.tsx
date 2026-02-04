/**
 * Waste Management Enhanced - Gestão de Resíduos Premium
 * PATCH PREMIUM-2.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Recycle, Droplets, Trash2, FileText, Leaf,
  AlertTriangle, TrendingDown, MapPin, Calendar,
  CheckCircle, Brain, Plus, Download, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const wasteKPIs = [
  { id: "compliance", label: "Conformidade MARPOL", value: "100%", icon: CheckCircle, color: "success" },
  { id: "discharges", label: "Descartes (Mês)", value: "12", icon: Recycle, color: "primary" },
  { id: "warnings", label: "Tanques Alerta", value: "2", icon: AlertTriangle, color: "warning" },
  { id: "reduction", label: "Redução CO₂", value: "-15%", icon: TrendingDown, color: "success" },
];

const wasteTanks = [
  { id: "1", name: "Tanque Óleo Usado", type: "oily", capacity: 5000, current: 3200, unit: "L", status: "warning", lastDischarge: "2026-01-28" },
  { id: "2", name: "Tanque Esgoto", type: "sewage", capacity: 8000, current: 2100, unit: "L", status: "ok", lastDischarge: "2026-02-01" },
  { id: "3", name: "Água de Porão", type: "bilge", capacity: 3000, current: 2800, unit: "L", status: "critical", lastDischarge: "2026-01-20" },
  { id: "4", name: "Resíduos Sólidos", type: "garbage", capacity: 500, current: 180, unit: "kg", status: "ok", lastDischarge: "2026-02-03" },
  { id: "5", name: "Lodo de Óleo", type: "sludge", capacity: 2000, current: 450, unit: "L", status: "ok", lastDischarge: "2026-01-25" },
];

const dischargeRecords = [
  { id: "1", date: "2026-02-03", type: "Resíduos Sólidos", quantity: 120, unit: "kg", location: "Porto de Santos", method: "Empresa credenciada", certificate: "CERT-2026-045" },
  { id: "2", date: "2026-02-01", type: "Esgoto Sanitário", quantity: 4500, unit: "L", location: "Porto de Santos", method: "Caminhão limpa-fossa", certificate: "CERT-2026-044" },
  { id: "3", date: "2026-01-28", type: "Óleo Usado", quantity: 2000, unit: "L", location: "Porto de Vitória", method: "Re-refino", certificate: "CERT-2026-043" },
  { id: "4", date: "2026-01-25", type: "Lodo de Óleo", quantity: 800, unit: "L", location: "Porto de Vitória", method: "Incineração", certificate: "CERT-2026-042" },
];

const marpolAnnexes = [
  { annex: "I", title: "Óleo e Misturas Oleosas", status: "compliant", lastAudit: "2026-01-15" },
  { annex: "II", title: "Substâncias Nocivas Líquidas", status: "compliant", lastAudit: "2026-01-15" },
  { annex: "IV", title: "Esgoto Sanitário", status: "compliant", lastAudit: "2026-01-15" },
  { annex: "V", title: "Lixo e Resíduos Sólidos", status: "compliant", lastAudit: "2026-01-15" },
  { annex: "VI", title: "Emissões Atmosféricas", status: "attention", lastAudit: "2026-01-15" },
];

export default function WasteManagementEnhanced() {
  const getTankIcon = (type: string) => {
    switch (type) {
      case "oily": case "sludge": return <Droplets className="h-5 w-5 text-amber-600" />;
      case "sewage": return <Trash2 className="h-5 w-5 text-stone-600" />;
      case "bilge": return <Droplets className="h-5 w-5 text-blue-600" />;
      case "garbage": return <Recycle className="h-5 w-5 text-green-600" />;
      default: return <Trash2 className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "warning": return <Badge variant="secondary">Atenção</Badge>;
      default: return <Badge>Normal</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-emerald-500/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg">
                <Recycle className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Gestão de Resíduos</h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600">MARPOL</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Conformidade ambiental e registros MARPOL</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar ORB
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wasteKPIs.map((kpi) => (
            <Card key={kpi.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 ${kpi.color === "success" ? "text-emerald-500" : kpi.color === "warning" ? "text-amber-500" : "text-primary"}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tanks" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="tanks" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Tanques
              <Badge variant="destructive" className="h-5 w-5 p-0 text-[10px]">1</Badge>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Record Books
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              MARPOL
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tanques */}
          <TabsContent value="tanks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Status dos Tanques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wasteTanks.map((tank) => {
                  const percentage = (tank.current / tank.capacity) * 100;
                  
                  return (
                    <div key={tank.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTankIcon(tank.type)}
                          <div>
                            <p className="font-medium">{tank.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Último descarte: {tank.lastDischarge}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{tank.current}/{tank.capacity} {tank.unit}</span>
                          {getStatusBadge(tank.status)}
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-3 ${
                          tank.status === "critical" ? "[&>div]:bg-destructive" : 
                          tank.status === "warning" ? "[&>div]:bg-amber-500" : 
                          "[&>div]:bg-emerald-500"
                        }`}
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{Math.round(percentage)}% ocupado</span>
                        {tank.status !== "ok" && (
                          <Button variant="outline" size="sm" onClick={() => toast.success(`Agendando descarte: ${tank.name}`)}>
                            Agendar Descarte
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Record Books */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Registros de Descarte
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left py-3 px-4 text-sm font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Quantidade</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Local</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Método</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Certificado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dischargeRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {record.date}
                            </div>
                          </td>
                          <td className="py-3 px-4">{record.type}</td>
                          <td className="py-3 px-4">{record.quantity} {record.unit}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {record.location}
                            </div>
                          </td>
                          <td className="py-3 px-4">{record.method}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              {record.certificate}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MARPOL Compliance */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-500" />
                  Conformidade MARPOL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marpolAnnexes.map((annex) => (
                    <div key={annex.annex} className="p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          Anexo {annex.annex}
                        </Badge>
                        <div>
                          <p className="font-medium">{annex.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Última auditoria: {annex.lastAudit}
                          </p>
                        </div>
                      </div>
                      <Badge variant={annex.status === "compliant" ? "default" : "secondary"}>
                        {annex.status === "compliant" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Conforme
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Atenção
                          </span>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Total Reciclado (Ano)</p>
                    <Recycle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold">45.2 ton</p>
                  <p className="text-xs text-emerald-600 mt-1">+12% vs ano anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Economia Descarte</p>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold">R$ 128k</p>
                  <p className="text-xs text-emerald-600 mt-1">Otimização de rotas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Certificados Válidos</p>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground mt-1">100% conformidade</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
