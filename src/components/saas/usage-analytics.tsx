import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  Ship, 
  Database, 
  Clock, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const mockUsageData = [
  { date: "2024-01-01", users: 15, storage: 2.5, api_calls: 1200 },
  { date: "2024-01-02", users: 18, storage: 2.8, api_calls: 1400 },
  { date: "2024-01-03", users: 22, storage: 3.1, api_calls: 1600 },
  { date: "2024-01-04", users: 25, storage: 3.4, api_calls: 1800 },
  { date: "2024-01-05", users: 20, storage: 3.2, api_calls: 1500 },
  { date: "2024-01-06", users: 28, storage: 3.8, api_calls: 2000 },
  { date: "2024-01-07", users: 32, storage: 4.2, api_calls: 2200 }
];

const mockModuleUsage = [
  { name: "PEOTRAM", usage: 85, color: "#3b82f6" },
  { name: "Fleet Management", usage: 70, color: "#10b981" },
  { name: "HR Dashboard", usage: 60, color: "#f59e0b" },
  { name: "Analytics", usage: 45, color: "#ef4444" },
  { name: "Communication", usage: 30, color: "#8b5cf6" }
];

const mockActivityLog = [
  { time: "2024-01-07 14:30", user: "admin@blueshipping.com", action: "Criou novo audit PEOTRAM", module: "PEOTRAM" },
  { time: "2024-01-07 14:15", user: "captain@blueshipping.com", action: "Atualizou posição da embarcação", module: "Fleet" },
  { time: "2024-01-07 13:45", user: "hr@blueshipping.com", action: "Adicionou certificado marítimo", module: "HR" },
  { time: "2024-01-07 13:30", user: "admin@blueshipping.com", action: "Configurou alertas inteligentes", module: "Intelligence" },
  { time: "2024-01-07 12:15", user: "operator@blueshipping.com", action: "Concluiu checklist operacional", module: "Operations" }
];

export const UsageAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">32</p>
                <p className="text-sm text-green-600">+12% vs ontem</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chamadas API</p>
                <p className="text-2xl font-bold">2.2k</p>
                <p className="text-sm text-green-600">+8% vs ontem</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold">4.2 GB</p>
                <p className="text-sm text-yellow-600">+2% vs ontem</p>
              </div>
              <Database className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-green-600">Excelente</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Hoje</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendências de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Usuários"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="api_calls" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="API Calls"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Uso de Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value) => [`${value} GB`, "Armazenamento"]}
                    />
                    <Bar dataKey="storage" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* Module Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Uso por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockModuleUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="usage"
                      >
                        {mockModuleUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Uso"]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Módulos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockModuleUsage.map((module) => (
                    <div key={module.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-sm text-muted-foreground">{module.usage}%</span>
                      </div>
                      <Progress 
                        value={module.usage} 
                        className="h-2"
                        style={{ 
                          backgroundColor: module.color + "20"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Adoption */}
          <Card>
            <CardHeader>
              <CardTitle>Adoção de Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IA Insights</span>
                    <Badge variant="secondary">75%</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Alertas Inteligentes</span>
                    <Badge variant="secondary">60%</Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Automação</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horário</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Módulo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityLog.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {formatTime(activity.time)}
                      </TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.module}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Resposta</p>
                    <p className="text-2xl font-bold">142ms</p>
                    <p className="text-sm text-green-600">-5ms vs ontem</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Erro</p>
                    <p className="text-2xl font-bold">0.02%</p>
                    <p className="text-sm text-green-600">Muito baixa</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sessões Ativas</p>
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-yellow-600">Normal</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};