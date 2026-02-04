/**
 * MARPOL Compliance Panel - Monitoramento de conformidade ambiental
 * Inclui ORB, GRB, descartes e alertas regulatórios
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  Flame,
  Leaf,
  MapPin,
  Plus,
  Ship,
  Trash2,
  Waves,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Globe,
  Anchor,
  BookOpen,
  Download,
  Printer,
  Eye,
  Calendar,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface WasteRecord {
  id: string;
  type: "oil" | "garbage" | "sewage" | "ballast";
  category: string;
  quantity: number;
  unit: string;
  action: "retained" | "discharged" | "incinerated" | "landed";
  location: string;
  date: Date;
  officerName: string;
  remarks?: string;
}

interface TankLevel {
  id: string;
  name: string;
  type: "slop" | "sludge" | "bilge" | "sewage" | "garbage";
  currentLevel: number;
  capacity: number;
  unit: string;
  lastUpdated: Date;
  status: "ok" | "warning" | "critical";
}

interface ComplianceAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  regulation: string;
  deadline?: Date;
  resolved: boolean;
}

const WASTE_DATA = [
  { name: "Óleo", value: 35, color: "#8B5CF6" },
  { name: "Plástico", value: 25, color: "#3B82F6" },
  { name: "Alimentos", value: 20, color: "#10B981" },
  { name: "Papel", value: 15, color: "#F59E0B" },
  { name: "Outros", value: 5, color: "#6B7280" },
];

const DISCHARGE_TREND = [
  { month: "Set", oil: 120, garbage: 450, sewage: 800 },
  { month: "Out", oil: 100, garbage: 380, sewage: 750 },
  { month: "Nov", oil: 85, garbage: 420, sewage: 820 },
  { month: "Dez", oil: 90, garbage: 350, sewage: 700 },
  { month: "Jan", oil: 75, garbage: 320, sewage: 680 },
  { month: "Fev", oil: 65, garbage: 290, sewage: 650 },
];

const MOCK_TANKS: TankLevel[] = [
  { id: "1", name: "Slop Tank #1", type: "slop", currentLevel: 75, capacity: 100, unit: "m³", lastUpdated: new Date(), status: "warning" },
  { id: "2", name: "Slop Tank #2", type: "slop", currentLevel: 45, capacity: 100, unit: "m³", lastUpdated: new Date(), status: "ok" },
  { id: "3", name: "Sludge Tank", type: "sludge", currentLevel: 88, capacity: 50, unit: "m³", lastUpdated: new Date(), status: "critical" },
  { id: "4", name: "Bilge Tank", type: "bilge", currentLevel: 30, capacity: 80, unit: "m³", lastUpdated: new Date(), status: "ok" },
  { id: "5", name: "Sewage Tank", type: "sewage", currentLevel: 60, capacity: 40, unit: "m³", lastUpdated: new Date(), status: "warning" },
];

const MOCK_ALERTS: ComplianceAlert[] = [
  {
    id: "1",
    type: "error",
    title: "Sludge Tank Próximo da Capacidade",
    description: "O tanque de lodo está em 88% da capacidade. Providencie descarga em porto.",
    regulation: "MARPOL Annex I",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    resolved: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Registro ORB Pendente",
    description: "Há 3 operações de descarga de óleo não registradas no ORB.",
    regulation: "MARPOL Annex I, Reg. 17",
    resolved: false,
  },
  {
    id: "3",
    type: "info",
    title: "Zona Especial: Mar Báltico",
    description: "Embarcação entrará em área especial em 48h. Verificar restrições de descarga.",
    regulation: "MARPOL Annex I, IV",
    resolved: false,
  },
];

const MOCK_RECORDS: WasteRecord[] = [
  {
    id: "1",
    type: "oil",
    category: "Sludge",
    quantity: 15,
    unit: "m³",
    action: "landed",
    location: "Porto de Santos",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    officerName: "Cap. João Silva",
    remarks: "Entregue ao receptor autorizado",
  },
  {
    id: "2",
    type: "garbage",
    category: "Plástico",
    quantity: 450,
    unit: "kg",
    action: "landed",
    location: "Porto de Santos",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    officerName: "Cap. João Silva",
  },
  {
    id: "3",
    type: "sewage",
    category: "Treated",
    quantity: 20,
    unit: "m³",
    action: "discharged",
    location: "12nm offshore",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    officerName: "1° Of. Pedro Costa",
    remarks: "Conforme MARPOL Annex IV",
  },
];

export default function MARPOLCompliancePanel() {
  const [showNewRecord, setShowNewRecord] = useState(false);

  const getAlertIcon = (type: ComplianceAlert["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Globe className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTankColor = (status: TankLevel["status"]) => {
    switch (status) {
      case "ok":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
    }
  };

  const getActionBadge = (action: WasteRecord["action"]) => {
    switch (action) {
      case "retained":
        return <Badge variant="outline">Retido</Badge>;
      case "discharged":
        return <Badge className="bg-blue-500/10 text-blue-500">Descartado</Badge>;
      case "incinerated":
        return <Badge className="bg-orange-500/10 text-orange-500">Incinerado</Badge>;
      case "landed":
        return <Badge className="bg-green-500/10 text-green-500">Desembarcado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${98 * 3.51} 351`}
                  strokeLinecap="round"
                  transform="rotate(-90 64 64)"
                  className="text-green-500"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1 text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+2% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tendência de Descartes (m³/kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={DISCHARGE_TREND}>
                <defs>
                  <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGarbage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="oil" stroke="#8B5CF6" fill="url(#colorOil)" name="Óleo" />
                <Area type="monotone" dataKey="garbage" stroke="#3B82F6" fill="url(#colorGarbage)" name="Resíduos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {MOCK_ALERTS.filter((a) => !a.resolved).length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Conformidade ({MOCK_ALERTS.filter((a) => !a.resolved).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_ALERTS.filter((a) => !a.resolved).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {alert.regulation}
                      </Badge>
                      {alert.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Prazo: {format(alert.deadline, "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolver
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Níveis dos Tanques
            </CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TANKS.map((tank) => (
                <div key={tank.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tank.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {tank.currentLevel}/{tank.capacity} {tank.unit}
                      </span>
                      <div className={`h-2 w-2 rounded-full ${getTankColor(tank.status)}`} />
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={(tank.currentLevel / tank.capacity) * 100} className="h-3" />
                    {tank.status === "critical" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/20 rounded-full"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Resíduos
            </CardTitle>
            <CardDescription>Por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={WASTE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {WASTE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {WASTE_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={showNewRecord} onOpenChange={setShowNewRecord}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registro de Descarte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Operação de Descarte</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Resíduo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oil">Óleo / Derivados</SelectItem>
                          <SelectItem value="garbage">Lixo</SelectItem>
                          <SelectItem value="sewage">Esgoto</SelectItem>
                          <SelectItem value="ballast">Água de Lastro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Operação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landed">Desembarque em Porto</SelectItem>
                          <SelectItem value="discharged">Descarte no Mar</SelectItem>
                          <SelectItem value="incinerated">Incineração</SelectItem>
                          <SelectItem value="retained">Retenção a Bordo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="m³" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m3">m³</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="l">litros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Localização</Label>
                    <Input placeholder="Coordenadas ou nome do porto" />
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea placeholder="Detalhes adicionais..." />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => {
                      toast.success("Registro adicionado com sucesso!");
                      setShowNewRecord(false);
                    }}>
                      Registrar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewRecord(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Abrir ORB (Livro de Óleo)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Abrir GRB (Livro de Lixo)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório MARPOL
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Registros
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Registros Recentes
            </CardTitle>
            <CardDescription>Últimas operações registradas</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_RECORDS.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    record.type === "oil" ? "bg-purple-500/10" :
                    record.type === "garbage" ? "bg-blue-500/10" :
                    record.type === "sewage" ? "bg-cyan-500/10" :
                    "bg-green-500/10"
                  }`}>
                    {record.type === "oil" ? <Droplets className="h-5 w-5 text-purple-500" /> :
                     record.type === "garbage" ? <Trash2 className="h-5 w-5 text-blue-500" /> :
                     record.type === "sewage" ? <Waves className="h-5 w-5 text-cyan-500" /> :
                     <Anchor className="h-5 w-5 text-green-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{record.category}</p>
                      {getActionBadge(record.action)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{record.quantity} {record.unit}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{format(record.date, "dd/MM/yyyy HH:mm")}</p>
                  <p className="text-xs text-muted-foreground">{record.officerName}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
