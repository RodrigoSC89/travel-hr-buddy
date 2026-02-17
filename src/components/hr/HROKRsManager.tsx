/**
 * HR OKRs Manager Component
 * Gestão de OKRs com IA
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  Plus,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  Calendar,
  Users,
  Inbox
} from "lucide-react";
import { useOKRsData, type OKR, type KeyResult } from "@/hooks/useOKRsData";

export function HROKRsManager() {
  const { data: okrs = [], isLoading } = useOKRsData();
  const [expandedOKRs, setExpandedOKRs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("tree");

  const toggleExpand = (id: string) => {
    setExpandedOKRs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "on_track": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "at_risk": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "behind": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "achieved": return <Badge className="bg-green-500">Atingido</Badge>;
      case "on_track": return <Badge className="bg-blue-500">No Prazo</Badge>;
      case "at_risk": return <Badge className="bg-yellow-500 text-yellow-950">Em Risco</Badge>;
      case "behind": return <Badge variant="destructive">Atrasado</Badge>;
      default: return null;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "company": return <Badge variant="outline" className="border-secondary text-secondary">Empresa</Badge>;
      case "team": return <Badge variant="outline" className="border-primary text-primary">Time</Badge>;
      case "individual": return <Badge variant="outline" className="border-success text-success">Individual</Badge>;
      default: return null;
    }
  };

  const renderOKR = (okr: OKR, depth = 0) => {
    const isExpanded = expandedOKRs.includes(okr.id);
    const hasChildren = okr.children && okr.children.length > 0;

    return (
      <div key={okr.id} className="space-y-2">
        <Card className={`${depth > 0 ? "ml-8 border-l-4 border-l-primary/30" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Expand Button */}
              {hasChildren && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0"
                  onClick={() => toggleExpand(okr.id)}
                  aria-label={isExpanded ? "Recolher OKR" : "Expandir OKR"}
                  title={isExpanded ? "Recolher" : "Expandir"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-8" />}

              {/* OKR Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{okr.objective}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{okr.owner}</span>
                      <span>•</span>
                      <span>{okr.quarter}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLevelBadge(okr.level)}
                    {getStatusBadge(okr.status)}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span className="font-medium">{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} className="h-2" />
                </div>

                {/* Key Results */}
                <div className="space-y-2 pt-2">
                  {okr.key_results.map(kr => (
                    <div key={kr.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                      {getStatusIcon(kr.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{kr.title}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {kr.current}{kr.unit} / {kr.target}{kr.unit}
                      </div>
                      <Progress 
                        value={(kr.current / kr.target) * 100} 
                        className="w-20 h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children OKRs */}
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {okr.children!.map(child => renderOKR(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OKRs & Metas</h2>
          <p className="text-muted-foreground">Ciclo Q1 2026 - Janeiro a Março</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Check-in Semanal
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo OKR
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OKRs Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">5 empresa, 12 time, 7 individual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">67%</div>
            <Progress value={67} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">6</div>
            <p className="text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atingidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">4</div>
            <p className="text-xs text-muted-foreground">16.7% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Insights da IA</h3>
              <p className="text-sm text-muted-foreground">Análise do ciclo atual</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Atenção Necessária</span>
              </div>
              <p className="text-xs text-muted-foreground">
                KR "90% leitura de comunicados" está 28% abaixo da meta. Sugiro revisar a estratégia de distribuição.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium text-sm">Tendência Positiva</span>
              </div>
              <p className="text-xs text-muted-foreground">
                eNPS subiu 5 pontos nas últimas 4 semanas. No ritmo atual, atingiremos a meta em 15 dias.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Sugestão</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Considere criar OKR específico para retenção de talentos tech - turnover está 15% acima da média.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tree">Árvore de OKRs</TabsTrigger>
          <TabsTrigger value="my-okrs">Meus OKRs</TabsTrigger>
          <TabsTrigger value="team">Time</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={`okr-skeleton-${i}`} className="h-32 w-full" />
              ))}
            </div>
          ) : okrs.length === 0 ? (
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Inbox className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold text-lg">Nenhum OKR Configurado</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Configure os Objetivos e Resultados-Chave da sua organização para começar a acompanhar o progresso estratégico.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro OKR
                </Button>
              </div>
            </Card>
          ) : (
            okrs.map((okr: OKR) => renderOKR(okr))
          )}
        </TabsContent>

        <TabsContent value="my-okrs" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="text-center space-y-3">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold">Seus OKRs Individuais</h3>
              <p className="text-sm text-muted-foreground">
                Você ainda não tem OKRs individuais definidos para este ciclo.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Meu OKR
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe de Tecnologia
                </CardTitle>
                <CardDescription>8 membros • 4 OKRs ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Time</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe de RH
                </CardTitle>
                <CardDescription>5 membros • 3 OKRs ativos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Time</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ciclos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Q4 2025", "Q3 2025", "Q2 2025", "Q1 2025"].map((quarter, i) => (
                  <div key={quarter} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{quarter}</p>
                      <p className="text-sm text-muted-foreground">
                        {20 + i * 2} OKRs • {65 + i * 5}% atingidos
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
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
