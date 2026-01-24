import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Recycle, LayoutDashboard, Droplets, Trash2, FileText, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Leaf,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

// Import new components
import { TanksManagement } from "./components/TanksManagement";
import { GarbageRegistry } from "./components/GarbageRegistry";
import { RecordBooks } from "./components/RecordBooks";
import { WasteReports } from "./components/WasteReports";
import { ESGAIChat } from "@/components/shared/ESGAIChat";
import { AIAnalyzeButton } from "@/components/shared/AIAnalyzeButton";
import { AIInsightsPanel } from "@/components/shared/AIInsightsPanel";

interface WasteTank {
  id: string;
  name: string;
  type: "oily" | "sewage" | "garbage" | "bilge";
  capacity: number;
  currentLevel: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  lastDischarge: string;
}

interface DischargeRecord {
  id: string;
  date: string;
  type: string;
  quantity: number;
  unit: string;
  location: string;
  method: string;
  certificate: string;
}

const mockTanks: WasteTank[] = [
  { id: "1", name: "Tanque de Óleo Usado", type: "oily", capacity: 5000, currentLevel: 3200, unit: "L", status: "warning", lastDischarge: "2024-01-10" },
  { id: "2", name: "Tanque de Esgoto", type: "sewage", capacity: 8000, currentLevel: 2100, unit: "L", status: "ok", lastDischarge: "2024-01-12" },
  { id: "3", name: "Água de Porão", type: "bilge", capacity: 3000, currentLevel: 2800, unit: "L", status: "critical", lastDischarge: "2024-01-05" },
  { id: "4", name: "Resíduos Sólidos", type: "garbage", capacity: 500, currentLevel: 180, unit: "kg", status: "ok", lastDischarge: "2024-01-14" },
];

const mockRecords: DischargeRecord[] = [
  { id: "1", date: "2024-01-14", type: "Resíduos Sólidos", quantity: 120, unit: "kg", location: "Porto de Macaé", method: "Empresa credenciada", certificate: "CERT-2024-001" },
  { id: "2", date: "2024-01-12", type: "Esgoto Sanitário", quantity: 4500, unit: "L", location: "Porto de Macaé", method: "Caminhão limpa-fossa", certificate: "CERT-2024-002" },
  { id: "3", date: "2024-01-10", type: "Óleo Usado", quantity: 2000, unit: "L", location: "Porto de Macaé", method: "Re-refino", certificate: "CERT-2024-003" },
];

function WasteManagement() {
  const criticalTanks = mockTanks.filter(t => t.status === "critical").length;
  const warningTanks = mockTanks.filter(t => t.status === "warning").length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "oily": return <Droplets className="h-5 w-5 text-amber-600" />;
      case "sewage": return <Trash2 className="h-5 w-5 text-stone-600" />;
      case "bilge": return <Droplets className="h-5 w-5 text-blue-600" />;
      case "garbage": return <Recycle className="h-5 w-5 text-green-600" />;
      default: return <Trash2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-info/10 via-success/10 to-success/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-info to-success text-primary-foreground">
              <Recycle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Gestão de Resíduos
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  MARPOL
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Conformidade ambiental MARPOL, Oil Record Book e Garbage Record Book
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tanks" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Tanques</span>
            </TabsTrigger>
            <TabsTrigger value="garbage" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Resíduos</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Record Books</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <AIAnalyzeButton 
                  analysisType="waste" 
                  data={{ tanks: mockTanks, records: mockRecords }}
                  label="Classificar Resíduos"
                />
                <AIAnalyzeButton 
                  analysisType="compliance" 
                  data={{ tanks: mockTanks, regulations: ['MARPOL I', 'MARPOL IV', 'MARPOL V'] }}
                  label="Check MARPOL"
                />
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-teal-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conformidade MARPOL</p>
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-teal-600">Todos os anexos</p>
                      </div>
                      <Leaf className="h-8 w-8 text-teal-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Descartes (Mês)</p>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-xs text-blue-600">Todos certificados</p>
                      </div>
                      <Recycle className="h-8 w-8 text-blue-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tanques Alerta</p>
                        <p className="text-2xl font-bold">{warningTanks}</p>
                        <p className="text-xs text-amber-600">&gt;60% capacidade</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tanques Críticos</p>
                        <p className="text-2xl font-bold">{criticalTanks}</p>
                        <p className="text-xs text-red-600">Descarte urgente</p>
                      </div>
                      <Droplets className="h-8 w-8 text-red-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Redução CO₂</p>
                        <p className="text-2xl font-bold">12%</p>
                        <p className="text-xs text-green-600">vs. mês anterior</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-green-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tanks Status */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Status dos Tanques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockTanks.map((tank) => (
                      <div key={tank.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tank.type)}
                            <span className="font-medium">{tank.name}</span>
                            <Badge variant={tank.status === "critical" ? "destructive" : tank.status === "warning" ? "secondary" : "outline"}>
                              {tank.status === "critical" ? "Crítico" : tank.status === "warning" ? "Atenção" : "Normal"}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tank.currentLevel}/{tank.capacity} {tank.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(tank.currentLevel / tank.capacity) * 100} 
                          className={`h-2 ${tank.status === "critical" ? "[&>div]:bg-red-500" : tank.status === "warning" ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Último descarte: {tank.lastDischarge}</span>
                          <span>{Math.round((tank.currentLevel / tank.capacity) * 100)}% ocupado</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Assistant - Real AI Integration */}
                <ESGAIChat 
                  module="waste" 
                  context={{ 
                    tanks: mockTanks, 
                    records: mockRecords,
                    criticalTanks,
                    warningTanks 
                  }} 
                />
              </div>

              {/* Recent Discharges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    Últimos Descartes Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Data</th>
                          <th className="text-left py-3 px-2">Tipo</th>
                          <th className="text-left py-3 px-2">Quantidade</th>
                          <th className="text-left py-3 px-2">Local</th>
                          <th className="text-left py-3 px-2">Método</th>
                          <th className="text-left py-3 px-2">Certificado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {record.date}
                              </div>
                            </td>
                            <td className="py-3 px-2">{record.type}</td>
                            <td className="py-3 px-2">{record.quantity} {record.unit}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {record.location}
                              </div>
                            </td>
                            <td className="py-3 px-2">{record.method}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
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

              {/* AI Insights Panel */}
              <AIInsightsPanel 
                module="waste"
                data={{
                  tanks: mockTanks,
                  records: mockRecords,
                  criticalTanks,
                  warningTanks
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="tanks">
            <TanksManagement />
          </TabsContent>

          <TabsContent value="garbage">
            <GarbageRegistry />
          </TabsContent>

          <TabsContent value="records">
            <RecordBooks />
          </TabsContent>

          <TabsContent value="reports">
            <WasteReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default WasteManagement;
