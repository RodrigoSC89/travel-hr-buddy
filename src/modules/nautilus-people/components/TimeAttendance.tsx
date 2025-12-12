/**
 * Time & Attendance - Controle de Frequência e Escalas
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar as CalendarIcon,
  Users,
  Timer,
  Coffee,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  LogIn,
  LogOut,
  TrendingUp,
  Search,
  Filter,
  Download
} from "lucide-react";
import { motion } from "framer-motion";

interface TimeRecord {
  id: string;
  colaborador: string;
  data: string;
  entrada: string;
  saidaAlmoco: string;
  retornoAlmoco: string;
  saida: string;
  horasTrabalhadas: string;
  extras: string;
  status: "normal" | "atraso" | "falta" | "ferias" | "folga";
}

interface BankHours {
  colaborador: string;
  saldoAtual: number;
  horasMes: number;
  tendencia: "up" | "down" | "stable";
}

const TimeAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ponto");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isPontoActive, setIsPontoActive] = useState(false);

  const timeRecords: TimeRecord[] = [
    {
      id: "1",
      colaborador: "Carlos Silva",
      data: "2025-12-07",
      entrada: "08:02",
      saidaAlmoco: "12:05",
      retornoAlmoco: "13:00",
      saida: "17:15",
      horasTrabalhadas: "08:15",
      extras: "+0:15",
      status: "normal"
    },
    {
      id: "2",
      colaborador: "Ana Martins",
      data: "2025-12-07",
      entrada: "08:45",
      saidaAlmoco: "12:00",
      retornoAlmoco: "13:00",
      saida: "17:00",
      horasTrabalhadas: "07:15",
      extras: "-0:45",
      status: "atraso"
    },
    {
      id: "3",
      colaborador: "Roberto Santos",
      data: "2025-12-07",
      entrada: "-",
      saidaAlmoco: "-",
      retornoAlmoco: "-",
      saida: "-",
      horasTrabalhadas: "0:00",
      extras: "-8:00",
      status: "ferias"
    }
  ];

  const bankHoursData: BankHours[] = [
    { colaborador: "Carlos Silva", saldoAtual: 16.5, horasMes: 4.5, tendencia: "up" },
    { colaborador: "Ana Martins", saldoAtual: -8.25, horasMes: -3.75, tendencia: "down" },
    { colaborador: "Roberto Santos", saldoAtual: 24.0, horasMes: 0, tendencia: "stable" },
    { colaborador: "Maria Costa", saldoAtual: 12.0, horasMes: 6.0, tendencia: "up" },
    { colaborador: "Pedro Lima", saldoAtual: -4.5, horasMes: -2.0, tendencia: "down" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "normal":
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Normal</Badge>;
    case "atraso":
      return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Atraso</Badge>;
    case "falta":
      return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Falta</Badge>;
    case "ferias":
      return <Badge className="bg-blue-500"><Sun className="w-3 h-3 mr-1" />Férias</Badge>;
    case "folga":
      return <Badge variant="secondary"><Coffee className="w-3 h-3 mr-1" />Folga</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">1,189</p>
                <p className="text-sm text-muted-foreground">Presentes Hoje</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Atrasos</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">35</p>
                <p className="text-sm text-muted-foreground">Em Férias</p>
              </div>
              <Sun className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">+2.450h</p>
                <p className="text-sm text-muted-foreground">Banco de Horas Total</p>
              </div>
              <Timer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border p-1">
          <TabsTrigger value="ponto" className="gap-2">
            <Clock className="w-4 h-4" />
            Registro de Ponto
          </TabsTrigger>
          <TabsTrigger value="banco" className="gap-2">
            <Timer className="w-4 h-4" />
            Banco de Horas
          </TabsTrigger>
          <TabsTrigger value="escalas" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            Escalas
          </TabsTrigger>
          <TabsTrigger value="meu-ponto" className="gap-2">
            <LogIn className="w-4 h-4" />
            Meu Ponto
          </TabsTrigger>
        </TabsList>

        {/* Registro de Ponto Tab */}
        <TabsContent value="ponto" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar colaborador..." className="pl-9 w-64" />
              </div>
              <Select defaultValue="todos">
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="presentes">Presentes</SelectItem>
                  <SelectItem value="atrasos">Atrasos</SelectItem>
                  <SelectItem value="faltas">Faltas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registros de Hoje</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium">Colaborador</th>
                      <th className="text-center p-3 text-sm font-medium">Entrada</th>
                      <th className="text-center p-3 text-sm font-medium">Saída Almoço</th>
                      <th className="text-center p-3 text-sm font-medium">Retorno</th>
                      <th className="text-center p-3 text-sm font-medium">Saída</th>
                      <th className="text-center p-3 text-sm font-medium">Horas</th>
                      <th className="text-center p-3 text-sm font-medium">Extras</th>
                      <th className="text-center p-3 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {record.colaborador.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{record.colaborador}</span>
                          </div>
                        </td>
                        <td className="text-center p-3 text-sm">{record.entrada}</td>
                        <td className="text-center p-3 text-sm">{record.saidaAlmoco}</td>
                        <td className="text-center p-3 text-sm">{record.retornoAlmoco}</td>
                        <td className="text-center p-3 text-sm">{record.saida}</td>
                        <td className="text-center p-3 text-sm font-medium">{record.horasTrabalhadas}</td>
                        <td className={`text-center p-3 text-sm font-medium ${
                          record.extras.startsWith("+") ? "text-green-500" : 
                            record.extras.startsWith("-") ? "text-red-500" : ""
                        }`}>
                          {record.extras}
                        </td>
                        <td className="text-center p-3">{getStatusBadge(record.status)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banco de Horas Tab */}
        <TabsContent value="banco" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Banco de Horas</CardTitle>
              <CardDescription>Acompanhamento por colaborador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bankHoursData.map((item, index) => (
                  <motion.div
                    key={item.colaborador}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {item.colaborador.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.colaborador}</p>
                        <p className="text-sm text-muted-foreground">
                          Mês atual: {item.horasMes >= 0 ? "+" : ""}{item.horasMes}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        item.saldoAtual >= 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {item.saldoAtual >= 0 ? "+" : ""}{item.saldoAtual}h
                      </div>
                      {item.tendencia === "up" && <TrendingUp className="w-5 h-5 text-green-500" />}
                      {item.tendencia === "down" && <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />}
                      {item.tendencia === "stable" && <span className="text-yellow-500">→</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalas Tab */}
        <TabsContent value="escalas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Escalas</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Escalas do Dia</CardTitle>
                <CardDescription>
                  {selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Turno Diurno (06h-14h)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">45 colaboradores escalados</p>
                </div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Turno Vespertino (14h-22h)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">38 colaboradores escalados</p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Turno Noturno (22h-06h)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">22 colaboradores escalados</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meu Ponto Tab */}
        <TabsContent value="meu-ponto" className="space-y-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Registrar Ponto</CardTitle>
              <CardDescription>
                {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="h-20 flex-col gap-2 bg-green-500 hover:bg-green-600"
                  onClick={() => setIsPontoActive(true)}
                >
                  <LogIn className="w-6 h-6" />
                  Entrada
                </Button>
                <Button
                  size="lg"
                  className="h-20 flex-col gap-2 bg-red-500 hover:bg-red-600"
                  onClick={() => setIsPontoActive(false)}
                >
                  <LogOut className="w-6 h-6" />
                  Saída
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Coffee className="w-6 h-6" />
                  Início Intervalo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Play className="w-6 h-6" />
                  Fim Intervalo
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Registros de Hoje</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrada</span>
                    <span className="font-medium">08:02</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo</span>
                    <span className="font-medium">12:05 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horas Trabalhadas</span>
                    <span className="font-medium text-primary">05:23</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeAttendance;
