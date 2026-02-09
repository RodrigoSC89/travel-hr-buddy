import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { IMCAIncidentAnalyzer } from "@/components/compliance/IMCAIncidentAnalyzer";
import { 
  Shield, Search, AlertTriangle, FileText, TrendingUp,
  ExternalLink, BookOpen, Users, Calendar, Brain
} from "lucide-react";

interface IMCAIncident {
  id: string;
  title: string;
  category: string;
  date: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  lessons_learned: string[];
  recommendations: string[];
  source: string;
}

const SafetyIMCA = () => {
  const [activeTab, setActiveTab] = useState("database");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Demo IMCA Safety Flashes data
  const [imcaIncidents] = useState<IMCAIncident[]>([
    {
      id: "SF-2024-001",
      title: "Falha em Sistema de Âncora durante Operação DP",
      category: "Marine",
      date: "2024-12-15",
      severity: "high",
      description: "Durante operação de posicionamento dinâmico, o sistema de âncora apresentou falha no mecanismo de liberação, causando deriva não controlada.",
      lessons_learned: [
        "Manutenção preventiva dos sistemas de âncora é crítica",
        "Procedimentos de emergência devem ser revisados trimestralmente",
        "Treinamento de emergência deve incluir cenários de falha de âncora"
      ],
      recommendations: [
        "Implementar inspeção semanal do sistema de liberação",
        "Atualizar procedimento de emergência para falha de âncora",
        "Realizar drill de emergência mensal"
      ],
      source: "IMCA Safety Flash 24/2024"
    },
    {
      id: "SF-2024-002",
      title: "Queda de Objeto em Área de Convés",
      category: "Diving",
      date: "2024-12-10",
      severity: "critical",
      description: "Ferramenta de trabalho caiu de altura de 15 metros durante operação de mergulho, passando próximo à área de entrada de mergulhadores.",
      lessons_learned: [
        "Zonas de exclusão devem ser claramente demarcadas",
        "Ferramentas devem ser amarradas durante trabalhos em altura",
        "Comunicação entre equipes é essencial"
      ],
      recommendations: [
        "Implementar sistema de amarração obrigatória para ferramentas",
        "Revisar zonas de exclusão e sinalização",
        "Treinar equipe em procedimentos de dropped objects"
      ],
      source: "IMCA Safety Flash 22/2024"
    },
    {
      id: "SF-2024-003",
      title: "Incidente com ROV durante Inspeção Submarina",
      category: "Remote Systems",
      date: "2024-11-28",
      severity: "medium",
      description: "ROV ficou preso em estrutura submarina durante inspeção, resultando em perda temporária de comunicação e controle.",
      lessons_learned: [
        "Planejamento de rotas de inspeção deve considerar obstruções",
        "Backup de comunicação é essencial",
        "Procedimentos de recuperação devem ser testados regularmente"
      ],
      recommendations: [
        "Realizar survey prévio antes de inspeções",
        "Testar sistemas de backup semanalmente",
        "Atualizar procedimentos de emergência para ROV"
      ],
      source: "IMCA Safety Flash 20/2024"
    }
  ]);

  const categories = ["all", "Marine", "Diving", "Remote Systems", "Regulatory", "Offshore"];

  const filteredIncidents = imcaIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || incident.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      low: { variant: "outline", label: "Baixo" },
      medium: { variant: "secondary", label: "Médio" },
      high: { variant: "default", label: "Alto" },
      critical: { variant: "destructive", label: "Crítico" }
    };
    const { variant, label } = config[severity] || { variant: "outline" as const, label: severity };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="IMCA Safety Flashes"
        description="Base de dados de incidentes e lições aprendidas da IMCA"
        gradient="red"
        badges={[
          { icon: BookOpen, label: "Base IMCA" },
          { icon: AlertTriangle, label: "Análise de Risco" },
          { icon: TrendingUp, label: "Prevenção" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Base de Dados</TabsTrigger>
          <TabsTrigger value="fleet">Incidentes da Frota</TabsTrigger>
          <TabsTrigger value="ai-analyzer">
            <Brain className="h-4 w-4 mr-1" />
            Análise IA
          </TabsTrigger>
          <TabsTrigger value="analysis">Análise Comparativa</TabsTrigger>
          <TabsTrigger value="briefings">Briefings</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar incidentes..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "Todas as Categorias" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{imcaIncidents.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {imcaIncidents.filter(i => i.severity === "critical").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lições Aprendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {imcaIncidents.reduce((acc, i) => acc + i.lessons_learned.length, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">{incident.id}</span>
                        <Badge variant="outline">{incident.category}</Badge>
                        {getSeverityBadge(incident.severity)}
                      </div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(incident.date).toLocaleDateString('pt-BR')}
                        <span className="text-xs">• {incident.source}</span>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open('https://www.imca-int.com/safety-flashes/', '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      IMCA
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{incident.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Lições Aprendidas
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {incident.lessons_learned.map((lesson, i) => (
                          <li key={i} className="text-muted-foreground">• {lesson}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                      <h4 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Recomendações
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {incident.recommendations.map((rec, i) => (
                          <li key={i} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle>Incidentes da Frota</CardTitle>
              <CardDescription>Incidentes registrados em nossa frota com cruzamento IMCA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum incidente registrado na frota este período.</p>
                <Button className="mt-4" onClick={() => setActiveTab('database')}>
                  Registrar Incidente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI-Powered IMCA Analyzer */}
        <TabsContent value="ai-analyzer">
          <IMCAIncidentAnalyzer />
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa</CardTitle>
              <CardDescription>Comparação entre incidentes da frota e base IMCA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-success">0</p>
                    <p className="text-sm text-muted-foreground">Incidentes Similares</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-warning">3</p>
                    <p className="text-sm text-muted-foreground">Riscos Identificados</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-info">85%</p>
                    <p className="text-sm text-muted-foreground">Conformidade</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefings">
          <Card>
            <CardHeader>
              <CardTitle>Briefings de Segurança</CardTitle>
              <CardDescription>Gerar briefings baseados em lições IMCA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-medium">Briefing: Prevenção de Queda de Objetos</h4>
                      <p className="text-sm text-muted-foreground">Baseado em SF-2024-002</p>
                    </div>
                    <Badge>Novo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Este briefing aborda práticas de prevenção de dropped objects durante operações de mergulho...
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={async () => {
                      try {
                        await supabase.from("ai_audit_logs").insert({
                          user_input: "Briefing aplicado: Prevenção de Queda de Objetos (SF-2024-002)",
                          module_name: "safety_imca",
                          interaction_type: "briefing_applied"
                        });
                        toast.success("Briefing de segurança registrado e aplicado à tripulação!");
                      } catch { toast.error("Erro ao aplicar briefing"); }
                    }}>
                      <Users className="h-4 w-4 mr-1" />
                      Aplicar Briefing
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Briefing: Prevenção de queda de objetos durante operações de mergulho - Técnicas de amarração e zonas de exclusão', { duration: 8000 })}>
                      <FileText className="h-4 w-4 mr-1" />
                      Ver Conteúdo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SafetyIMCA;
