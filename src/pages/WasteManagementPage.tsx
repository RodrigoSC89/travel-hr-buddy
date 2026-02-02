/**
 * Gestão de Resíduos - Página dedicada
 * MARPOL Annex V compliance e gestão de resíduos marítimos
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trash2, Recycle, Ship, AlertTriangle, FileText,
  Download, CheckCircle2, Clock, BarChart3, Droplets
} from "lucide-react";

// Mock data
const wasteStats = {
  totalWaste: 45.8,
  recycled: 32.4,
  disposed: 13.4,
  recyclingRate: 71,
  marpolCompliance: 100,
};

const wasteCategories = [
  { category: "Plásticos", amount: 12.5, unit: "m³", status: "segregated" },
  { category: "Resíduos Alimentares", amount: 18.2, unit: "m³", status: "processed" },
  { category: "Óleo Residual (Sludge)", amount: 5.8, unit: "m³", status: "stored" },
  { category: "Resíduos Operacionais", amount: 6.3, unit: "m³", status: "segregated" },
  { category: "Águas Oleosas", amount: 3.0, unit: "m³", status: "treated" },
];

const recentDisposals = [
  { vessel: "MV Atlântico Sul", port: "Santos", date: "2025-01-28", waste: "Óleo Residual", amount: 2.5, receipt: "BR-2025-0128" },
  { vessel: "MV Pacífico Norte", port: "Rotterdam", date: "2025-01-25", waste: "Plásticos", amount: 4.2, receipt: "NL-2025-0125" },
  { vessel: "MV Caribe Star", port: "Houston", date: "2025-01-22", waste: "Resíduos Diversos", amount: 3.8, receipt: "US-2025-0122" },
];

export default function WasteManagementPage() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "segregated": return "bg-blue-500";
      case "processed": return "bg-green-500";
      case "stored": return "bg-yellow-500";
      case "treated": return "bg-cyan-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "segregated": return "Segregado";
      case "processed": return "Processado";
      case "stored": return "Armazenado";
      case "treated": return "Tratado";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/20 rounded-xl">
            <Recycle className="h-8 w-8 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Gestão de Resíduos
              <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">
                MARPOL V
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Controle de resíduos e conformidade ambiental marítima
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Garbage Record Book
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resíduos</p>
                <p className="text-3xl font-bold">{wasteStats.totalWaste}</p>
                <p className="text-xs text-muted-foreground">m³ este mês</p>
              </div>
              <Trash2 className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reciclado</p>
                <p className="text-3xl font-bold text-green-500">{wasteStats.recycled}</p>
                <p className="text-xs text-muted-foreground">m³</p>
              </div>
              <Recycle className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descartado</p>
                <p className="text-3xl font-bold text-orange-500">{wasteStats.disposed}</p>
                <p className="text-xs text-muted-foreground">m³</p>
              </div>
              <Droplets className="h-10 w-10 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Reciclagem</p>
                <p className="text-3xl font-bold text-teal-500">{wasteStats.recyclingRate}%</p>
                <Progress value={wasteStats.recyclingRate} className="mt-2 h-2" />
              </div>
              <BarChart3 className="h-10 w-10 text-teal-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MARPOL V</p>
                <p className="text-3xl font-bold text-green-500">{wasteStats.marpolCompliance}%</p>
                <p className="text-xs text-green-500">Conforme</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="disposals">Descartes</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Resíduos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wasteCategories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(cat.status)}`} />
                        <span>{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.amount} {cat.unit}</span>
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(cat.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Últimos Descartes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDisposals.map((disposal, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{disposal.vessel}</p>
                          <p className="text-sm text-muted-foreground">{disposal.port}</p>
                        </div>
                        <Badge variant="secondary">{disposal.receipt}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{disposal.waste}</span>
                        <span className="font-medium">{disposal.amount} m³</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias MARPOL Annex V</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { code: "A", name: "Plásticos", color: "red", allowed: "Nunca", notes: "Proibido descarte no mar" },
                  { code: "B", name: "Restos Alimentares", color: "green", allowed: ">12nm", notes: "Triturado, longe da costa" },
                  { code: "C", name: "Resíduos Domésticos", color: "yellow", allowed: ">12nm", notes: "Triturado ou compactado" },
                  { code: "D", name: "Óleo de Cozinha", color: "orange", allowed: ">12nm", notes: "Misturado com água" },
                  { code: "E", name: "Cinzas de Incinerador", color: "gray", allowed: ">12nm", notes: "Fora de áreas especiais" },
                  { code: "F", name: "Resíduos Operacionais", color: "blue", allowed: "Porto", notes: "Entrega em instalações" },
                ].map((cat, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded bg-${cat.color}-500/20 flex items-center justify-center font-bold text-${cat.color}-500`}>
                        {cat.code}
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Descarte:</strong> {cat.allowed}</p>
                      <p>{cat.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registro de Descartes
                </span>
                <Button size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar GRB
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Embarcação</th>
                      <th className="text-left py-3 px-4">Porto</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Tipo</th>
                      <th className="text-left py-3 px-4">Quantidade</th>
                      <th className="text-left py-3 px-4">Recibo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDisposals.map((disposal, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{disposal.vessel}</td>
                        <td className="py-3 px-4">{disposal.port}</td>
                        <td className="py-3 px-4">{new Date(disposal.date).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-4">{disposal.waste}</td>
                        <td className="py-3 px-4">{disposal.amount} m³</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{disposal.receipt}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Status MARPOL Annex V
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { item: "Garbage Management Plan", status: true },
                    { item: "Garbage Record Book", status: true },
                    { item: "Placards Exibidos", status: true },
                    { item: "Tripulação Treinada", status: true },
                    { item: "Equipamentos Adequados", status: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.item}</span>
                      <Badge className={item.status ? "bg-green-500" : "bg-red-500"}>
                        {item.status ? "Conforme" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Próximas Ações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Revisão do Garbage Management Plan", date: "2025-03-15", vessel: "Toda Frota" },
                    { action: "Treinamento MARPOL V", date: "2025-02-20", vessel: "MV Caribe Star" },
                    { action: "Inspeção de Equipamentos", date: "2025-02-10", vessel: "MV Mediterranean" },
                  ].map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.action}</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{item.vessel}</span>
                        <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
