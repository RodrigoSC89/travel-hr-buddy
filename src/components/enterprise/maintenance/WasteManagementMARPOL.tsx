/**
 * WasteManagementMARPOL - Gestão de Resíduos MARPOL Annex V
 * Enterprise-grade waste management with e-GRB integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trash2, Recycle, Ship, AlertTriangle, CheckCircle2, 
  FileText, Download, Calendar, MapPin, Scale, Droplets
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface WasteRecord {
  id: string;
  vessel: string;
  vesselId: string;
  date: Date;
  category: MARPOLCategory;
  quantity: number; // m³ or kg
  unit: "m3" | "kg";
  disposalMethod: "shore" | "incineration" | "sea" | "compaction";
  port?: string;
  receptorCompany?: string;
  certificateNumber?: string;
  signedBy: string;
  latitude?: number;
  longitude?: number;
}

type MARPOLCategory = 
  | "A" // Plastics
  | "B" // Food waste
  | "C" // Domestic waste
  | "D" // Cooking oil
  | "E" // Incinerator ash
  | "F" // Operational waste
  | "G" // Animal carcasses
  | "H" // Fishing gear
  | "I" // E-waste
  | "J"; // Cargo residues

const categoryConfig: Record<MARPOLCategory, { label: string; color: string; icon: React.ReactNode }> = {
  A: { label: "Plásticos", color: "#ef4444", icon: <Trash2 className="h-4 w-4" /> },
  B: { label: "Resíduos Alimentares", color: "#22c55e", icon: <Trash2 className="h-4 w-4" /> },
  C: { label: "Resíduos Domésticos", color: "#3b82f6", icon: <Trash2 className="h-4 w-4" /> },
  D: { label: "Óleo de Cozinha", color: "#f59e0b", icon: <Droplets className="h-4 w-4" /> },
  E: { label: "Cinzas de Incinerador", color: "#6b7280", icon: <Trash2 className="h-4 w-4" /> },
  F: { label: "Resíduos Operacionais", color: "#8b5cf6", icon: <Trash2 className="h-4 w-4" /> },
  G: { label: "Carcaças de Animais", color: "#ec4899", icon: <Trash2 className="h-4 w-4" /> },
  H: { label: "Equipamentos de Pesca", color: "#14b8a6", icon: <Trash2 className="h-4 w-4" /> },
  I: { label: "Lixo Eletrônico", color: "#f97316", icon: <Trash2 className="h-4 w-4" /> },
  J: { label: "Resíduos de Carga", color: "#84cc16", icon: <Trash2 className="h-4 w-4" /> },
};

const mockRecords: WasteRecord[] = [
  {
    id: "1",
    vessel: "MV Atlantic Star",
    vesselId: "v1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: "A",
    quantity: 0.5,
    unit: "m3",
    disposalMethod: "shore",
    port: "Rotterdam, NL",
    receptorCompany: "ECO Marine Services BV",
    certificateNumber: "MARPOL-2024-00123",
    signedBy: "Capt. João Silva",
  },
  {
    id: "2",
    vessel: "MV Atlantic Star",
    vesselId: "v1",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: "B",
    quantity: 150,
    unit: "kg",
    disposalMethod: "sea",
    signedBy: "Chief Officer Pedro Santos",
    latitude: 52.3702,
    longitude: 4.8952,
  },
  {
    id: "3",
    vessel: "MV Pacific Dawn",
    vesselId: "v2",
    date: new Date(),
    category: "C",
    quantity: 0.8,
    unit: "m3",
    disposalMethod: "shore",
    port: "Singapore",
    receptorCompany: "PSA Green Solutions",
    certificateNumber: "MARPOL-2024-00124",
    signedBy: "Capt. Maria Oliveira",
  },
  {
    id: "4",
    vessel: "MV Caribbean Blue",
    vesselId: "v3",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: "D",
    quantity: 50,
    unit: "kg",
    disposalMethod: "shore",
    port: "Houston, TX",
    receptorCompany: "Gulf Coast Waste Mgmt",
    certificateNumber: "MARPOL-2024-00120",
    signedBy: "Capt. Roberto Almeida",
  },
];

const wasteByCategory = Object.entries(categoryConfig).map(([key, value]) => ({
  category: key as MARPOLCategory,
  label: value.label,
  total: mockRecords.filter(r => r.category === key).reduce((sum, r) => sum + r.quantity, 0),
  color: value.color,
})).filter(c => c.total > 0);

const monthlyWaste = [
  { month: "Set", shore: 2.5, sea: 0.8, incineration: 0.3 },
  { month: "Out", shore: 2.8, sea: 0.6, incineration: 0.4 },
  { month: "Nov", shore: 2.2, sea: 0.9, incineration: 0.2 },
  { month: "Dez", shore: 3.0, sea: 0.7, incineration: 0.5 },
  { month: "Jan", shore: 2.6, sea: 0.5, incineration: 0.3 },
  { month: "Fev", shore: 2.3, sea: 0.6, incineration: 0.4 },
];

export function WasteManagementMARPOL() {
  const [activeTab, setActiveTab] = useState("records");
  const [selectedVessel, setSelectedVessel] = useState<string>("all");

  const totalWaste = mockRecords.reduce((sum, r) => sum + r.quantity, 0);
  const shoreDisposal = mockRecords.filter(r => r.disposalMethod === "shore").length;
  const seaDisposal = mockRecords.filter(r => r.disposalMethod === "sea").length;
  const complianceRate = 98.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Recycle className="h-6 w-6" />
            Gestão de Resíduos MARPOL
          </h2>
          <p className="text-muted-foreground">e-GRB (Electronic Garbage Record Book) Annex V</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar GRB
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Descartado</p>
                <p className="text-2xl font-bold">{totalWaste.toFixed(1)} m³</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descarte em Porto</p>
                <p className="text-2xl font-bold">{shoreDisposal}</p>
                <p className="text-xs text-green-600">Com certificado</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descarte no Mar</p>
                <p className="text-2xl font-bold">{seaDisposal}</p>
                <p className="text-xs text-muted-foreground">Cat. B permitido</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Ship className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold text-green-600">{complianceRate}%</p>
                <p className="text-xs text-green-600">MARPOL Annex V</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Registros GRB</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="categories">Categorias MARPOL</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4 mt-4">
          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Registros Recentes</CardTitle>
              <CardDescription>Últimos descartes registrados no e-GRB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecords.map((record) => (
                  <motion.div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: categoryConfig[record.category].color + "20" }}
                      >
                        <span className="text-lg font-bold" style={{ color: categoryConfig[record.category].color }}>
                          {record.category}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{categoryConfig[record.category].label}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ship className="h-3 w-3" />
                          <span>{record.vessel}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{format(record.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{record.quantity} {record.unit}</p>
                        <Badge className={
                          record.disposalMethod === "shore" ? "bg-green-100 text-green-700" :
                          record.disposalMethod === "sea" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {record.disposalMethod === "shore" ? "Porto" :
                           record.disposalMethod === "sea" ? "Mar" :
                           record.disposalMethod === "incineration" ? "Incineração" : "Compactação"}
                        </Badge>
                      </div>
                      {record.certificateNumber && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Certificado
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Descarte por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={wasteByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                      label={({ label, total }) => `${label}: ${total}`}
                    >
                      {wasteByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tendência Mensal (m³)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyWaste}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="shore" stackId="a" fill="#22c55e" name="Porto" />
                    <Bar dataKey="sea" stackId="a" fill="#3b82f6" name="Mar" />
                    <Bar dataKey="incineration" stackId="a" fill="#f59e0b" name="Incineração" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist MARPOL Annex V</CardTitle>
              <CardDescription>Verificação de conformidade por embarcação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Plano de Gestão de Lixo (GMP)</span>
                  </div>
                  <p className="text-sm text-green-600">Atualizado e conforme regulamento IMO MEPC.219(63)</p>
                </div>

                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Placards de Descarte</span>
                  </div>
                  <p className="text-sm text-green-600">Instalados em todas as áreas requeridas</p>
                </div>

                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Livro de Registro de Lixo (GRB)</span>
                  </div>
                  <p className="text-sm text-green-600">e-GRB ativo com backups automáticos</p>
                </div>

                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-700">Treinamento de Tripulação</span>
                  </div>
                  <p className="text-sm text-amber-600">3 tripulantes pendentes de atualização (vence em 30 dias)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias MARPOL Annex V</CardTitle>
              <CardDescription>Regras de descarte por tipo de resíduo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <div key={key} className="p-4 rounded-lg border flex items-start gap-4">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: config.color + "20" }}
                    >
                      <span className="font-bold" style={{ color: config.color }}>{key}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{config.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {key === "A" && "Proibido descarte no mar em qualquer circunstância"}
                        {key === "B" && "Permitido >12nm da costa, triturado (<25mm) >3nm"}
                        {key === "C" && "Permitido >12nm da costa se misturado com comida"}
                        {key === "D" && "Descarte em porto obrigatório"}
                        {key === "E" && "Permitido >12nm da costa"}
                        {key === "F" && "Dependendo do tipo, pode requerer porto"}
                        {key === "G" && "Permitido descarte no mar com registro"}
                        {key === "H" && "Proibido descarte no mar"}
                        {key === "I" && "Descarte em porto obrigatório"}
                        {key === "J" && "Regras específicas por tipo de carga"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WasteManagementMARPOL;
