/**
import { useState, useCallback } from "react";;
 * Quantum Computing Page
 * Simulações avançadas com computação quântica
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity,
  Atom,
  Zap,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Sparkles,
  Cpu,
  Waves
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

interface QuantumExperiment {
  id: string;
  name: string;
  type: "optimization" | "simulation" | "cryptography" | "ml";
  status: "running" | "completed" | "queued" | "failed";
  qubits: number;
  progress: number;
  accuracy: number;
  startedAt: string;
  estimatedTime: string;
}

const QuantumComputingPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  const experiments: QuantumExperiment[] = [
    {
      id: "1",
      name: "Otimização de Rotas Marítimas",
      type: "optimization",
      status: "running",
      qubits: 127,
      progress: 67,
      accuracy: 94.5,
      startedAt: "10:30:00",
      estimatedTime: "2h 15min"
    },
    {
      id: "2",
      name: "Simulação de Condições Climáticas",
      type: "simulation",
      status: "completed",
      qubits: 256,
      progress: 100,
      accuracy: 97.2,
      startedAt: "08:00:00",
      estimatedTime: "Concluído"
    },
    {
      id: "3",
      name: "Criptografia Quântica - Comunicações",
      type: "cryptography",
      status: "queued",
      qubits: 64,
      progress: 0,
      accuracy: 0,
      startedAt: "-",
      estimatedTime: "~45min"
    },
    {
      id: "4",
      name: "ML Quântico - Previsão de Manutenção",
      type: "ml",
      status: "running",
      qubits: 512,
      progress: 34,
      accuracy: 89.3,
      startedAt: "09:45:00",
      estimatedTime: "4h 30min"
    },
    {
      id: "5",
      name: "Otimização de Alocação de Recursos",
      type: "optimization",
      status: "failed",
      qubits: 128,
      progress: 45,
      accuracy: 0,
      startedAt: "Ontem",
      estimatedTime: "Falhou"
    }
  ];

  const quantumMetrics = [
    { metric: "Coerência", value: 95 },
    { metric: "Fidelidade", value: 92 },
    { metric: "Conectividade", value: 88 },
    { metric: "T1 Time", value: 97 },
    { metric: "T2 Time", value: 91 },
    { metric: "Gate Error", value: 94 },
  ];

  const performanceHistory = [
    { month: "Set", classical: 45, quantum: 78 },
    { month: "Out", classical: 48, quantum: 82 },
    { month: "Nov", classical: 52, quantum: 89 },
    { month: "Dez", classical: 55, quantum: 94 },
    { month: "Jan", classical: 58, quantum: 97 },
  ];

  const getStatusBadge = (status: QuantumExperiment["status"]) => {
    switch (status) {
    case "running":
      return <Badge className="bg-blue-500/20 text-blue-400"><Activity className="h-3 w-3 mr-1 animate-pulse" />Executando</Badge>;
    case "completed":
      return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
    case "queued":
      return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Na Fila</Badge>;
    case "failed":
      return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1" />Falhou</Badge>;
    }
  };

  const getTypeBadge = (type: QuantumExperiment["type"]) => {
    switch (type) {
    case "optimization":
      return <Badge variant="outline" className="border-purple-500/30 text-purple-400">Otimização</Badge>;
    case "simulation":
      return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Simulação</Badge>;
    case "cryptography":
      return <Badge variant="outline" className="border-green-500/30 text-green-400">Criptografia</Badge>;
    case "ml":
      return <Badge variant="outline" className="border-orange-500/30 text-orange-400">Machine Learning</Badge>;
    }
  };

  const handleRunExperiment = (expId: string) => {
    toast({
      title: "Experimento Iniciado",
      description: "O experimento quântico foi adicionado à fila de execução.",
    };
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Atom}
        title="Computação Quântica"
        description="Simulações avançadas e otimização com processadores quânticos"
        gradient="purple"
        badges={[
          { icon: Sparkles, label: "Experimental" },
          { icon: Cpu, label: "512 Qubits" },
          { icon: Waves, label: "Em Pesquisa" }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Experimentos</p>
                <p className="text-2xl font-bold">{experiments.length}</p>
              </div>
              <Atom className="h-8 w-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold">{experiments.filter(e => e.status === "running").length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Speedup Médio</p>
                <p className="text-2xl font-bold">1000x</p>
              </div>
              <Zap className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="experiments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">Experimentos</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="research">Pesquisa</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {experiments.map((exp) => (
                <Card key={exp.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{exp.name}</h3>
                          {getStatusBadge(exp.status)}
                          {getTypeBadge(exp.type)}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Qubits:</span>
                            <span className="ml-2 font-medium">{exp.qubits}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Início:</span>
                            <span className="ml-2">{exp.startedAt}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tempo Est.:</span>
                            <span className="ml-2">{exp.estimatedTime}</span>
                          </div>
                        </div>

                        {exp.status === "running" && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{exp.progress}%</span>
                            </div>
                            <Progress value={exp.progress} className="h-2" />
                          </div>
                        )}

                        {exp.accuracy > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Precisão:</span>
                            <span className="ml-2 text-green-500 font-medium">{exp.accuracy}%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {exp.status === "queued" && (
                          <Button size="sm" onClick={() => handlehandleRunExperiment}>
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {exp.status === "running" && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </Button>
                        )}
                        {exp.status === "failed" && (
                          <Button size="sm" variant="outline" onClick={() => handlehandleRunExperiment}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5" />
                  Métricas do Processador Quântico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={quantumMetrics}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Especificações do Hardware
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/20 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processador</span>
                    <span className="font-medium">IBM Quantum Eagle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qubits</span>
                    <span className="font-medium">512</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantum Volume</span>
                    <span className="font-medium">256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Erro de Gate</span>
                    <span className="font-medium">0.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conectividade</span>
                    <span className="font-medium">Heavy-Hex</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium">15 mK</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparativo: Clássico vs Quântico
              </CardTitle>
              <CardDescription>
                Tempo de execução normalizado (menor é melhor)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="classical" stroke="#6b7280" strokeWidth={2} name="Clássico" />
                  <Line type="monotone" dataKey="quantum" stroke="hsl(var(--primary))" strokeWidth={2} name="Quântico" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projetos de Pesquisa em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Algoritmos de Otimização Variacional", status: "Em progresso", completion: 65 },
                  { title: "Correção de Erros Quânticos", status: "Pesquisa", completion: 35 },
                  { title: "Simulação de Moléculas para Combustíveis", status: "Planejado", completion: 10 },
                  { title: "Machine Learning Quântico Híbrido", status: "Em progresso", completion: 48 },
                ].map((project, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{project.title}</span>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <Progress value={project.completion} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{project.completion}% concluído</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default QuantumComputingPage;
