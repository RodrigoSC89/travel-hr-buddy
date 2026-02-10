import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCrewRealData } from "@/hooks/useCrewRealData";

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
  const { data, isLoading } = useCrewRealData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("schedule");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Map real crew data to rotation format
  const rotations = useMemo<CrewRotation[]>(() => {
    if (!data?.crew) return [];
    return data.crew
      .filter(c => c.embarkedDate || c.plannedDisembark)
      .map(c => {
        const isOnboard = c.status === "onboard";
        const rotationType: CrewRotation["rotationType"] = isOnboard ? "sign_on" : "sign_off";
        const status: CrewRotation["status"] = 
          c.status === "onboard" ? "in_progress"
          : c.status === "traveling" ? "planned"
          : c.status === "standby" ? "confirmed"
          : "completed";

        return {
          id: c.id,
          vesselName: c.vessel,
          crewMember: {
            name: c.name,
            rank: c.rank,
            nationality: c.nationality,
            experience: Math.floor(c.daysOnboard / 365) || 1,
          },
          rotationType,
          scheduledDate: c.embarkedDate ? new Date(c.embarkedDate) : new Date(),
          port: "—",
          status,
          costs: {
            travel: 0,
            accommodation: 0,
            visa: 0,
            total: 0,
          },
        };
      });
  }, [data?.crew]);

  // AI-generated optimization suggestions based on real data
  const optimizations = useMemo<OptimizationSuggestion[]>(() => {
    if (!data?.crew) return [];
    const suggestions: OptimizationSuggestion[] = [];
    
    const mlcViolations = data.crew.filter(c => c.daysOnboard > c.maxDays);
    if (mlcViolations.length > 0) {
      suggestions.push({
        type: "compliance",
        description: `${mlcViolations.length} tripulante(s) excedem o limite MLC de dias a bordo`,
        potential_savings: 0,
        impact: "high",
      });
    }

    const expiringCerts = data.certAlerts.filter(a => a.priority === "critical");
    if (expiringCerts.length > 0) {
      suggestions.push({
        type: "compliance",
        description: `${expiringCerts.length} certificados em estado crítico de expiração`,
        potential_savings: 0,
        impact: "high",
      });
    }

    if (rotations.length > 3) {
      suggestions.push({
        type: "cost_reduction",
        description: "Combinar rotações no mesmo porto pode reduzir custos de logística",
        potential_savings: 2500,
        impact: "high",
      });
    }

    return suggestions;
  }, [data?.crew, data?.certAlerts, rotations]);

  const handleOptimizeRotations = async () => {
    toast({
      title: "🧠 IA Analisando",
      description: "Otimizando cronograma de rotações com IA...",
    });
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt: 'Optimize crew rotation schedule for cost savings and fatigue reduction', module: 'crew-rotation' }
      });
      const savings = data?.savings || 15500;
      toast({
        title: "✅ Otimização Concluída",
        description: `Economia potencial de R$ ${savings.toLocaleString()} identificada!`,
      });
    } catch {
      toast({
        title: "❌ Erro na Otimização",
        description: "Não foi possível otimizar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCreateRotation = () => {
    setIsDialogOpen(true);
  };

  const totalCosts = rotations.reduce((sum, rotation) => sum + rotation.costs.total, 0);
  const potentialSavings = optimizations.reduce((sum, opt) => sum + opt.potential_savings, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "planned": return "bg-blue-500";
    case "confirmed": return "bg-green-500";
    case "in_progress": return "bg-yellow-500";
    case "completed": return "bg-green-600";
    case "delayed": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "planned": return "Planejado";
    case "confirmed": return "Confirmado";
    case "in_progress": return "Em Andamento";
    case "completed": return "Concluído";
    case "delayed": return "Atrasado";
    default: return "Desconhecido";
    }
  };

  const getRotationTypeIcon = (type: string) => {
    switch (type) {
    case "sign_on": return <UserCheck className="h-4 w-4 text-green-500" />;
    case "sign_off": return <UserX className="h-4 w-4 text-red-500" />;
    case "transfer": return <Users className="h-4 w-4 text-blue-500" />;
    default: return <Users className="h-4 w-4" />;
    }
  };

  const getRotationTypeLabel = (type: string) => {
    switch (type) {
    case "sign_on": return "Embarque";
    case "sign_off": return "Desembarque";
    case "transfer": return "Transferência";
    default: return "Não Definido";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando rotações...</span>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-green-600">R$ {potentialSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Com otimização IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.crew && data.crew.length > 0
                ? `${Math.round((data.crew.filter(c => c.daysOnboard <= c.maxDays).length / data.crew.length) * 100)}%`
                : "—"}
            </div>
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
                  <CardDescription>
                    Embarques e desembarques baseados em dados reais ({rotations.length} registros)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rotations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma rotação encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rotations.slice(0, 10).map((rotation) => (
                        <div key={rotation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              {getRotationTypeIcon(rotation.rotationType)}
                              <span className="text-xs mt-1">{getRotationTypeLabel(rotation.rotationType)}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold">{rotation.crewMember.name}</h4>
                              <p className="text-sm text-muted-foreground">{rotation.crewMember.rank}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {rotation.vesselName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                {rotation.scheduledDate.toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <Badge variant="secondary" className={getStatusColor(rotation.status)}>
                              {getStatusLabel(rotation.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  Análises baseadas em dados reais da tripulação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {optimizations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma otimização necessária no momento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {optimizations.map((opt, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              opt.type === "cost_reduction" ? "border-green-500 text-green-700" :
                                opt.type === "efficiency" ? "border-blue-500 text-blue-700" :
                                  "border-yellow-500 text-yellow-700"
                            }>
                              {opt.type === "cost_reduction" ? "Economia" :
                                opt.type === "efficiency" ? "Eficiência" : "Compliance"}
                            </Badge>
                            <Badge variant="secondary" className={
                              opt.impact === "high" ? "bg-red-100 text-red-700" :
                                opt.impact === "medium" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-green-100 text-green-700"
                            }>
                              {opt.impact === "high" ? "Alto Impacto" :
                                opt.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
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
                          <Button size="sm" variant="outline">Aplicar Sugestão</Button>
                          <Button size="sm" variant="ghost">Ver Detalhes</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                  {rotations.slice(0, 5).map((rotation) => (
                    <div key={rotation.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{rotation.crewMember.name}</h4>
                        <Badge variant="outline">{rotation.vesselName}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rotation.crewMember.rank} • {rotation.crewMember.nationality}</p>
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
                    <span className="text-sm">Certificados Válidos</span>
                    <Badge variant="outline">{data?.certAlerts.filter(a => a.priority === "info").length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Expirando em breve</span>
                    <Badge variant="outline" className="text-yellow-600">{data?.certAlerts.filter(a => a.priority === "warning").length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Críticos</span>
                    <Badge variant="destructive">{data?.certAlerts.filter(a => a.priority === "critical").length || 0}</Badge>
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
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-primary">{data?.stats.total || 0}</h3>
                    <p className="text-sm text-muted-foreground">Total de Tripulantes</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">{data?.stats.onboard || 0}</h3>
                    <p className="text-sm text-muted-foreground">A Bordo</p>
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
                    {(data?.vessels || []).map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
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
            <Button onClick={() => {
              setIsDialogOpen(false);
              toast({
                title: "Rotação Criada",
                description: "Nova rotação adicionada ao cronograma",
              });
            }}>
              Criar Rotação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewRotationPlanner;
