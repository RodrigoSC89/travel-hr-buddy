import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar as CalendarIcon,
  Plane,
  Ship,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Brain,
  Globe,
  UserCheck,
  UserX,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrewRotation {
  id: string;
  vesselName: string;
  crewMember: {
    name: string;
    rank: string;
    nationality: string;
    experience: number;
  };
  rotationType: "sign_on" | "sign_off" | "transfer";
  scheduledDate: Date;
  port: string;
  status: "planned" | "confirmed" | "in_progress" | "completed" | "delayed";
  costs: {
    travel: number;
    accommodation: number;
    visa: number;
    total: number;
  };
  replacementCrew?: {
    name: string;
    rank: string;
    availability: Date;
  };
}

interface OptimizationSuggestion {
  type: "cost_reduction" | "efficiency" | "compliance";
  description: string;
  potential_savings: number;
  impact: "low" | "medium" | "high";
}

export const CrewRotationPlanner: React.FC = () => {
  const [rotations, setRotations] = useState<CrewRotation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("schedule");
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data para demonstração
    const mockRotations: CrewRotation[] = [
      {
        id: "1",
        vesselName: "MV Ocean Pioneer",
        crewMember: {
          name: "Carlos Silva",
          rank: "AB Seaman",
          nationality: "Brazilian",
          experience: 8,
        },
        rotationType: "sign_off",
        scheduledDate: new Date("2024-01-15"),
        port: "Santos, BR",
        status: "planned",
        costs: {
          travel: 800,
          accommodation: 200,
          visa: 0,
          total: 1000,
        },
        replacementCrew: {
          name: "João Santos",
          rank: "AB Seaman",
          availability: new Date("2024-01-14"),
        },
      },
      {
        id: "2",
        vesselName: "MV Atlantic Star",
        crewMember: {
          name: "Maria Costa",
          rank: "Cook",
          nationality: "Brazilian",
          experience: 5,
        },
        rotationType: "sign_on",
        scheduledDate: new Date("2024-01-20"),
        port: "Rio de Janeiro, BR",
        status: "confirmed",
        costs: {
          travel: 600,
          accommodation: 150,
          visa: 100,
          total: 850,
        },
      },
    ];

    const mockOptimizations: OptimizationSuggestion[] = [
      {
        type: "cost_reduction",
        description: "Combinar rotações no mesmo porto pode reduzir custos de logística",
        potential_savings: 2500,
        impact: "high",
      },
      {
        type: "efficiency",
        description: "Antecipar rotação da MV Ocean Pioneer em 2 dias melhora eficiência",
        potential_savings: 1200,
        impact: "medium",
      },
      {
        type: "compliance",
        description: "Verificar documentação para rotação internacional",
        potential_savings: 0,
        impact: "high",
      },
    ];

    setRotations(mockRotations);
    setOptimizations(mockOptimizations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "planned":
      return "bg-blue-500";
    case "confirmed":
      return "bg-green-500";
    case "in_progress":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-600";
    case "delayed":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "planned":
      return "Planejado";
    case "confirmed":
      return "Confirmado";
    case "in_progress":
      return "Em Andamento";
    case "completed":
      return "Concluído";
    case "delayed":
      return "Atrasado";
    default:
      return "Desconhecido";
    }
  };

  const getRotationTypeIcon = (type: string) => {
    switch (type) {
    case "sign_on":
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case "sign_off":
      return <UserX className="h-4 w-4 text-red-500" />;
    case "transfer":
      return <Users className="h-4 w-4 text-blue-500" />;
    default:
      return <Users className="h-4 w-4" />;
    }
  };

  const getRotationTypeLabel = (type: string) => {
    switch (type) {
    case "sign_on":
      return "Embarque";
    case "sign_off":
      return "Desembarque";
    case "transfer":
      return "Transferência";
    default:
      return "Não Definido";
    }
  };

  const handleOptimizeRotations = () => {
    toast({
      title: "🧠 IA Analisando",
      description: "Otimizando cronograma de rotações com IA...",
    });

    setTimeout(() => {
      toast({
        title: "✅ Otimização Concluída",
        description: "Economia potencial de R$ 15.500 identificada!",
      });
    }, 2000);
  };

  const handleCreateRotation = () => {
    setIsDialogOpen(true);
  };

  const totalCosts = rotations.reduce((sum, rotation) => sum + rotation.costs.total, 0);
  const potentialSavings = optimizations.reduce((sum, opt) => sum + opt.potential_savings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Planejador de Rotação de Tripulação
          </h1>
          <p className="text-muted-foreground">
            Gestão inteligente de embarques e desembarques com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOptimizeRotations}>
            <Brain className="h-4 w-4 mr-2" />
            Otimizar com IA
          </Button>
          <Button onClick={handleCreateRotation}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Nova Rotação
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rotações Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {rotations.filter(r => r.status === "confirmed").length} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {potentialSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Com otimização IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">Score de conformidade</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
          <TabsTrigger value="optimization">Otimização IA</TabsTrigger>
          <TabsTrigger value="logistics">Logística</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rotações Programadas</CardTitle>
                  <CardDescription>Embarques e desembarques nos próximos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rotations.map(rotation => (
                      <div
                        key={rotation.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            {getRotationTypeIcon(rotation.rotationType)}
                            <span className="text-xs mt-1">
                              {getRotationTypeLabel(rotation.rotationType)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{rotation.crewMember.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {rotation.crewMember.rank}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              {rotation.vesselName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {rotation.port}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {rotation.scheduledDate.toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rotation.scheduledDate.toLocaleDateString("pt-BR", {
                                weekday: "short",
                              })}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              R$ {rotation.costs.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Custo total</p>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(rotation.status)}>
                            {getStatusLabel(rotation.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Calendário</CardTitle>
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Sugestões de Otimização IA
                </CardTitle>
                <CardDescription>
                  Algoritmos avançados analisam padrões e sugerem melhorias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizations.map((opt, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              opt.type === "cost_reduction"
                                ? "border-green-500 text-green-700"
                                : opt.type === "efficiency"
                                  ? "border-blue-500 text-blue-700"
                                  : "border-yellow-500 text-yellow-700"
                            }
                          >
                            {opt.type === "cost_reduction"
                              ? "Economia"
                              : opt.type === "efficiency"
                                ? "Eficiência"
                                : "Compliance"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={
                              opt.impact === "high"
                                ? "bg-red-100 text-red-700"
                                : opt.impact === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {opt.impact === "high"
                              ? "Alto Impacto"
                              : opt.impact === "medium"
                                ? "Médio Impacto"
                                : "Baixo Impacto"}
                          </Badge>
                        </div>
                        {opt.potential_savings > 0 && (
                          <span className="text-green-600 font-semibold">
                            R$ {opt.potential_savings.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{opt.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Aplicar Sugestão
                        </Button>
                        <Button size="sm" variant="ghost">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Preditiva</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Demanda Futura</h4>
                      <p className="text-sm text-blue-600">
                        IA prevê aumento de 15% nas rotações nos próximos 3 meses
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800">Otimização de Rotas</h4>
                      <p className="text-sm text-green-600">
                        Combinação de rotações pode economizar 23% em custos de viagem
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Machine Learning Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Padrões Identificados</h4>
                      <p className="text-sm text-purple-600">
                        Rotações às quartas-feiras têm 30% menos atrasos
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Alerta Preventivo</h4>
                      <p className="text-sm text-orange-600">
                        Verificar disponibilidade de substitutos para próximo trimestre
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Logística de Transporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rotations.map(rotation => (
                    <div key={rotation.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{rotation.crewMember.name}</h4>
                        <Badge variant="outline">{rotation.port}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Viagem: R$ {rotation.costs.travel}</div>
                        <div>Acomodação: R$ {rotation.costs.accommodation}</div>
                        <div>Visto: R$ {rotation.costs.visa}</div>
                        <div className="font-semibold">Total: R$ {rotation.costs.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Documentação Internacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Passaportes Válidos</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Vistos em Ordem</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Certificados Médicos</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">STCW Atualizado</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">94.2%</h3>
                    <p className="text-sm text-blue-600">Taxa de Sucesso</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">2.3 dias</h3>
                    <p className="text-sm text-green-600">Tempo Médio de Rotação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Automáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório Mensal de Rotações
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Análise de Custos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="h-4 w-4 mr-2" />
                    Insights de IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Nova Rotação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Rotação de Tripulação</DialogTitle>
            <DialogDescription>
              Planeje uma nova rotação de embarque ou desembarque
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vessel">Embarcação</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mv-ocean-pioneer">MV Ocean Pioneer</SelectItem>
                    <SelectItem value="mv-atlantic-star">MV Atlantic Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Rotação</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sign_on">Embarque</SelectItem>
                    <SelectItem value="sign_off">Desembarque</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crew">Tripulante</Label>
              <Input placeholder="Nome do tripulante" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">Porto</Label>
                <Input placeholder="Porto de embarque/desembarque" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data Programada</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                toast({
                  title: "Rotação Criada",
                  description: "Nova rotação adicionada ao cronograma",
                });
              }}
            >
              Criar Rotação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
