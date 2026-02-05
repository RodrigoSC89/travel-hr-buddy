/**
 * FASE 5 - Compliance Hub
 * Gestão de Resíduos e-GRB/e-ORB MARPOL Annex V (benchmark: DNV Navigator)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trash2, Recycle, Leaf, Ship, MapPin, Calendar,
  FileText, AlertTriangle, CheckCircle, Download, Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

interface WasteRecord {
  id: string;
  vessel: string;
  date: string;
  category: string;
  quantity: number;
  unit: string;
  disposalMethod: "port" | "sea" | "incinerated" | "stored";
  port?: string;
  position?: string;
  remarks?: string;
  status: "logged" | "submitted" | "verified";
}

const wasteRecords: WasteRecord[] = [
  { id: "1", vessel: "MV Atlântico Sul", date: "2024-02-15", category: "A - Plásticos", quantity: 0, unit: "m³", disposalMethod: "port", port: "Rotterdam", status: "verified" },
  { id: "2", vessel: "MV Atlântico Sul", date: "2024-02-15", category: "B - Restos Alimentares", quantity: 0.5, unit: "m³", disposalMethod: "sea", position: "45°N 15°W", status: "verified" },
  { id: "3", vessel: "PSV Oceano Azul", date: "2024-02-14", category: "C - Resíduos Domésticos", quantity: 1.2, unit: "m³", disposalMethod: "port", port: "Santos", status: "submitted" },
  { id: "4", vessel: "AHTS Maré Alta", date: "2024-02-13", category: "E - Cinzas de Incinerador", quantity: 0.3, unit: "m³", disposalMethod: "stored", status: "logged" },
  { id: "5", vessel: "MV Atlântico Sul", date: "2024-02-12", category: "F - Resíduos Operacionais", quantity: 2.1, unit: "m³", disposalMethod: "port", port: "Antwerp", status: "verified" },
];

const wasteCategories = [
  { name: "A - Plásticos", value: 0, color: "#ef4444", rule: "Proibido descarte no mar" },
  { name: "B - Restos Alimentares", value: 15.5, color: "#22c55e", rule: ">12 NM da costa, triturado" },
  { name: "C - Resíduos Domésticos", value: 8.2, color: "#3b82f6", rule: ">12 NM da costa" },
  { name: "D - Óleo de Cozinha", value: 2.1, color: "#f59e0b", rule: "Porto apenas" },
  { name: "E - Cinzas", value: 1.8, color: "#6b7280", rule: ">12 NM da costa" },
  { name: "F - Resíduos Operacionais", value: 12.4, color: "#8b5cf6", rule: "Varia por tipo" },
];

const monthlyDisposal = [
  { month: "Set", port: 45, sea: 12, stored: 5 },
  { month: "Out", port: 52, sea: 15, stored: 3 },
  { month: "Nov", port: 48, sea: 18, stored: 4 },
  { month: "Dez", port: 55, sea: 14, stored: 6 },
  { month: "Jan", port: 42, sea: 16, stored: 8 },
  { month: "Fev", port: 38, sea: 11, stored: 5 },
];

export default function WasteManagementMARPOLPremium() {
  const [selectedVessel, setSelectedVessel] = useState("all");
  
  const totalWaste = wasteCategories.reduce((sum, cat) => sum + cat.value, 0);
  const portDisposal = wasteRecords.filter(r => r.disposalMethod === "port").length;
  const seaDisposal = wasteRecords.filter(r => r.disposalMethod === "sea").length;

  const handleExportGRB = () => {
    toast.success("e-GRB exportado em formato IMO");
  };

  const handleNewEntry = () => {
    toast.info("Abrindo formulário de novo registro...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[250px]">
              <Ship className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todas embarcações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas embarcações</SelectItem>
              <SelectItem value="mv-atlantico">MV Atlântico Sul</SelectItem>
              <SelectItem value="psv-oceano">PSV Oceano Azul</SelectItem>
              <SelectItem value="ahts-mare">AHTS Maré Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportGRB}>
            <Download className="h-4 w-4 mr-2" />
            Exportar e-GRB
          </Button>
          <Button onClick={handleNewEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Descartado (YTD)</p>
                <p className="text-2xl font-bold">{totalWaste.toFixed(1)} m³</p>
              </div>
              <Trash2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Descarte em Porto</p>
                <p className="text-2xl font-bold">{portDisposal}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Descarte no Mar</p>
                <p className="text-2xl font-bold">{seaDisposal}</p>
              </div>
              <Recycle className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Compliance MARPOL</p>
                <p className="text-2xl font-bold text-success">100%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records" className="gap-2">
            <FileText className="h-4 w-4" />
            Garbage Record Book
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Leaf className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                e-GRB - Electronic Garbage Record Book
              </CardTitle>
              <CardDescription>
                Conforme MARPOL Annex V Reg. 10.3
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wasteRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Trash2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{record.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.vessel} • {record.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{record.quantity} {record.unit}</p>
                      <Badge variant="secondary">
                        {record.disposalMethod === "port" && `Porto: ${record.port}`}
                        {record.disposalMethod === "sea" && `Mar: ${record.position}`}
                        {record.disposalMethod === "incinerated" && "Incinerado"}
                        {record.disposalMethod === "stored" && "Armazenado"}
                      </Badge>
                    </div>
                    <Badge variant={
                      record.status === "verified" ? "default" :
                      record.status === "submitted" ? "secondary" : "outline"
                    }>
                      {record.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wasteCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.split(' - ')[0]} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {wasteCategories.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regras MARPOL Annex V</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wasteCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div>
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.rule}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm">{cat.value} m³</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Descarte (Últimos 6 Meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyDisposal}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="port" name="Porto" fill="hsl(var(--primary))" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sea" name="Mar" fill="hsl(var(--success))" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stored" name="Armazenado" fill="hsl(var(--warning))" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
