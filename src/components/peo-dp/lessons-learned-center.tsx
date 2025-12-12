import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  Zap,
  Settings,
  Activity,
  Target,
  TrendingUp,
  FileText,
  Link2,
  Calendar,
  Ship,
  Globe,
  Lightbulb,
  Shield,
  CheckCircle
} from "lucide-react";

interface LessonLearned {
  id: string;
  title: string;
  date: string;
  source: "IMCA" | "Internal" | "Petrobras" | "Industry";
  failureType: "Human" | "Electrical" | "Software" | "Sensors" | "Mechanical" | "Environmental";
  severity: "Critical" | "High" | "Medium" | "Low";
  vesselType?: string;
  dpClass?: string;
  description: string;
  rootCause: string;
  correctiveActions: string[];
  preventiveActions: string[];
  relatedDocuments: string[];
  mitigationRecommendations: string[];
  tags: string[];
  viewCount: number;
  usedInTraining: boolean;
  usedInAudit: boolean;
}

const mockLessons: LessonLearned[] = [
  {
    id: "LL-001",
    title: "Perda de Referência PRS com Erro de Fallback",
    date: "2024-03-15",
    source: "IMCA",
    failureType: "Software",
    severity: "Critical",
    vesselType: "PSV",
    dpClass: "DP-2",
    description: "Durante operação de offloading, o sistema DP perdeu referência do PRS sem ativar corretamente o sistema de fallback configurado. A embarcação experimentou desvio de posição de 15 metros antes da intervenção manual.",
    rootCause: "Configuração incorreta do threshold de fallback combinada com falha de comunicação entre sistemas redundantes.",
    correctiveActions: [
      "Revisão completa das configurações de fallback",
      "Atualização do software do sistema DP",
      "Treinamento da equipe em procedimentos de emergência"
    ],
    preventiveActions: [
      "Implementar verificação diária de configurações de fallback",
      "Criar checklist pré-operacional específico para referências",
      "Realizar simulações mensais de perda de referência"
    ],
    relatedDocuments: ["ASOG-2024-001", "FMEA-PSV-001", "DPOM-Rev.5"],
    mitigationRecommendations: [
      "Verificar threshold de fallback antes de cada operação crítica",
      "Manter operador em alerta durante transições de referência",
      "Configurar alarme antecipado de degradação de sinal"
    ],
    tags: ["PRS", "Fallback", "Referência", "Posicionamento"],
    viewCount: 156,
    usedInTraining: true,
    usedInAudit: true
  },
  {
    id: "LL-002",
    title: "Cross-Connection Não Documentada entre Switchboards",
    date: "2024-07-22",
    source: "Internal",
    failureType: "Electrical",
    severity: "High",
    vesselType: "AHTS",
    dpClass: "DP-2",
    description: "Durante FMEA Trial, foi identificada cross-connection não documentada entre switchboards A e B, comprometendo a redundância do sistema elétrico e invalidando a configuração DP-2.",
    rootCause: "Modificação realizada durante manutenção anterior não foi registrada na documentação técnica.",
    correctiveActions: [
      "Remoção imediata da cross-connection",
      "Atualização de todos os diagramas elétricos",
      "Realização de novo FMEA Trial completo"
    ],
    preventiveActions: [
      "Implementar processo de MOC (Management of Change) rigoroso",
      "Criar checklist de verificação pós-manutenção",
      "Realizar auditorias trimestrais de configuração elétrica"
    ],
    relatedDocuments: ["FMEA-AHTS-002", "SLD-Rev.3", "CAMO-2024"],
    mitigationRecommendations: [
      "Verificar documentação técnica antes de qualquer manutenção",
      "Exigir aprovação de múltiplos níveis para modificações elétricas",
      "Implementar registro fotográfico de todas as modificações"
    ],
    tags: ["Elétrico", "Redundância", "FMEA", "MOC"],
    viewCount: 89,
    usedInTraining: true,
    usedInAudit: false
  },
  {
    id: "LL-003",
    title: "Blackout Parcial Durante Operação SIMOPS",
    date: "2024-05-10",
    source: "Petrobras",
    failureType: "Electrical",
    severity: "Critical",
    vesselType: "PLSV",
    dpClass: "DP-3",
    description: "Blackout parcial em um barramento durante operação SIMOPS com ROV a 200m de profundidade. Sistema DP manteve posição com redundância, mas operação foi suspensa por 4 horas.",
    rootCause: "Falha de disjuntor principal combinada com sobrecarga momentânea durante manobra de guindaste.",
    correctiveActions: [
      "Substituição do disjuntor defeituoso",
      "Revisão do plano de carga elétrica para operações SIMOPS",
      "Implementação de monitoramento contínuo de carga"
    ],
    preventiveActions: [
      "Estabelecer margem de segurança de 20% na capacidade elétrica durante SIMOPS",
      "Realizar testes de disjuntores antes de operações críticas",
      "Criar procedimento de verificação de carga em tempo real"
    ],
    relatedDocuments: ["ASOG-PLSV-001", "SIMOPS-Procedure", "PMS-Manual"],
    mitigationRecommendations: [
      "Limitar operações simultâneas de alta carga durante SIMOPS",
      "Manter gerador de reserva em hot standby",
      "Estabelecer comunicação contínua entre ponte e praça de máquinas"
    ],
    tags: ["Blackout", "SIMOPS", "Carga Elétrica", "ROV"],
    viewCount: 234,
    usedInTraining: true,
    usedInAudit: true
  },
  {
    id: "LL-004",
    title: "Erro Humano na Configuração de Ganho do Sistema DP",
    date: "2024-08-05",
    source: "Industry",
    failureType: "Human",
    severity: "Medium",
    vesselType: "DSV",
    dpClass: "DP-2",
    description: "Operador configurou ganho excessivo no eixo de heading, causando oscilações durante aproximação à plataforma. Situação controlada após intervenção do SDPO.",
    rootCause: "Falta de familiarização com características específicas da embarcação e ausência de verificação por segundo operador.",
    correctiveActions: [
      "Briefing detalhado sobre características de cada embarcação",
      "Implementação de verificação dupla para configurações críticas",
      "Atualização do treinamento de familiarização"
    ],
    preventiveActions: [
      "Criar guia de configuração padrão por embarcação",
      "Implementar período de supervisão para novos operadores",
      "Realizar simulações de ajuste de ganho regularmente"
    ],
    relatedDocuments: ["DPOM-DSV-001", "Training-Manual", "Familiarization-Checklist"],
    mitigationRecommendations: [
      "Sempre verificar configurações com SDPO antes de operações críticas",
      "Utilizar configurações conservadoras em condições desconhecidas",
      "Documentar ajustes de ganho no logbook"
    ],
    tags: ["Ganho", "Erro Humano", "Familiarização", "Configuração"],
    viewCount: 67,
    usedInTraining: true,
    usedInAudit: false
  }
];

const failureTypeColors: Record<string, string> = {
  Human: "bg-purple-500",
  Electrical: "bg-yellow-500",
  Software: "bg-blue-500",
  Sensors: "bg-cyan-500",
  Mechanical: "bg-orange-500",
  Environmental: "bg-green-500"
};

const sourceColors: Record<string, string> = {
  IMCA: "bg-blue-600",
  Internal: "bg-green-600",
  Petrobras: "bg-yellow-600",
  Industry: "bg-purple-600"
};

export const LessonsLearnedCenter: React.FC = () => {
  const [lessons, setLessons] = useState<LessonLearned[]>(mockLessons);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterFailureType, setFilterFailureType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<LessonLearned | null>(null);
  const [activeTab, setActiveTab] = useState("catalog");

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = filterSource === "all" || lesson.source === filterSource;
    const matchesFailure = filterFailureType === "all" || lesson.failureType === filterFailureType;
    const matchesSeverity = filterSeverity === "all" || lesson.severity === filterSeverity;
    return matchesSearch && matchesSource && matchesFailure && matchesSeverity;
  });

  const stats = {
    total: lessons.length,
    critical: lessons.filter(l => l.severity === "Critical").length,
    usedInTraining: lessons.filter(l => l.usedInTraining).length,
    byFailureType: Object.entries(
      lessons.reduce((acc, l) => {
        acc[l.failureType] = (acc[l.failureType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
  };

  const handleDownloadPDF = (lesson: LessonLearned) => {
    toast.success(`Baixando PDF: ${lesson.id}`);
  };

  const handleLinkToTraining = (lesson: LessonLearned) => {
    setLessons(lessons.map(l => l.id === lesson.id ? { ...l, usedInTraining: true } : l));
    toast.success("Lição vinculada ao treinamento CPD");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
    case "Critical": return <Badge variant="destructive">Crítico</Badge>;
    case "High": return <Badge className="bg-orange-500 text-white">Alto</Badge>;
    case "Medium": return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
    default: return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Central de Lições Aprendidas</h2>
            <p className="text-muted-foreground">DP Knowledge Center - IMCA Events & Internal Database</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar Base</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Nova Lição</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Lições</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Treinamentos</p>
                <p className="text-2xl font-bold">{stats.usedInTraining}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falha Humana</p>
                <p className="text-2xl font-bold">{lessons.filter(l => l.failureType === "Human").length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falha Elétrica</p>
                <p className="text-2xl font-bold">{lessons.filter(l => l.failureType === "Electrical").length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />Catálogo de Eventos
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />Análise de Tendências
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />Recomendações IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por título, descrição ou tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="w-36"><Globe className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Fontes</SelectItem>
                    <SelectItem value="IMCA">IMCA</SelectItem>
                    <SelectItem value="Internal">Interno</SelectItem>
                    <SelectItem value="Petrobras">Petrobras</SelectItem>
                    <SelectItem value="Industry">Indústria</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterFailureType} onValueChange={setFilterFailureType}>
                  <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Human">Humana</SelectItem>
                    <SelectItem value="Electrical">Elétrica</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Sensors">Sensores</SelectItem>
                    <SelectItem value="Mechanical">Mecânica</SelectItem>
                    <SelectItem value="Environmental">Ambiental</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Severidade</SelectItem>
                    <SelectItem value="Critical">Crítico</SelectItem>
                    <SelectItem value="High">Alto</SelectItem>
                    <SelectItem value="Medium">Médio</SelectItem>
                    <SelectItem value="Low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={sourceColors[lesson.source]}>{lesson.source}</Badge>
                        <Badge className={failureTypeColors[lesson.failureType]}>{lesson.failureType}</Badge>
                        {getSeverityBadge(lesson.severity)}
                        {lesson.usedInTraining && <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Treinamento</Badge>}
                        {lesson.usedInAudit && <Badge variant="outline" className="border-blue-500 text-blue-500"><Shield className="w-3 h-3 mr-1" />Auditoria</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(lesson.date).toLocaleDateString("pt-BR")}</span>
                        {lesson.vesselType && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{lesson.vesselType} ({lesson.dpClass})</span>}
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{lesson.viewCount} visualizações</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lesson.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(lesson); }}>
                        <Download className="w-3 h-3 mr-1" />PDF
                      </Button>
                      {!lesson.usedInTraining && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleLinkToTraining(lesson); }}>
                          <Link2 className="w-3 h-3 mr-1" />CPD
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Falha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.byFailureType.map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span className="font-medium">{count} ({Math.round((count / stats.total) * 100)}%)</span>
                      </div>
                      <Progress value={(count / stats.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="font-medium text-red-600">⚠️ Tendência Crescente</p>
                    <p className="text-sm text-muted-foreground">Falhas de Software aumentaram 25% no último trimestre</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="font-medium text-green-600">✅ Tendência Decrescente</p>
                    <p className="text-sm text-muted-foreground">Erros humanos reduziram 15% após treinamentos</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="font-medium text-yellow-600">📊 Estável</p>
                    <p className="text-sm text-muted-foreground">Falhas elétricas mantêm média histórica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recomendações Inteligentes baseadas em ML
              </CardTitle>
              <CardDescription>Análise automática de padrões e sugestões de mitigação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Recomendação: Atualização de ASOG</p>
                      <p className="text-sm text-muted-foreground mt-1">Com base em 3 eventos similares de perda de referência, recomenda-se incluir threshold de alarme antecipado para degradação de sinal PRS no ASOG.</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>ASOG</Badge>
                        <Badge>PRS</Badge>
                        <Badge>Referência</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-purple-500 mt-1" />
                    <div>
                      <p className="font-medium">Recomendação: Treinamento Específico</p>
                      <p className="text-sm text-muted-foreground mt-1">Padrão identificado: 40% dos erros humanos relacionados a configuração de ganho. Sugestão: incluir módulo prático no próximo ciclo de treinamento CPD.</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>CPD</Badge>
                        <Badge>Ganho</Badge>
                        <Badge>Treinamento</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Recomendação: Atualização de FMEA</p>
                      <p className="text-sm text-muted-foreground mt-1">Evento de cross-connection sugere revisão da matriz FMEA para incluir verificação de modificações não documentadas em sistemas elétricos.</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>FMEA</Badge>
                        <Badge>MOC</Badge>
                        <Badge>Elétrico</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLesson && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedLesson.id} - {selectedLesson.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={sourceColors[selectedLesson.source]}>{selectedLesson.source}</Badge>
                  <Badge className={failureTypeColors[selectedLesson.failureType]}>{selectedLesson.failureType}</Badge>
                  {getSeverityBadge(selectedLesson.severity)}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descrição do Evento</h4>
                  <p className="text-sm text-muted-foreground">{selectedLesson.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Causa Raiz</h4>
                  <p className="text-sm text-muted-foreground">{selectedLesson.rootCause}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ações Corretivas</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedLesson.correctiveActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ações Preventivas</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedLesson.preventiveActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recomendações de Mitigação</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedLesson.mitigationRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Documentos Relacionados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.relatedDocuments.map((doc, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-accent">
                        <FileText className="w-3 h-3 mr-1" />{doc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleDownloadPDF(selectedLesson)}>
                    <Download className="w-4 h-4 mr-2" />Baixar PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleLinkToTraining(selectedLesson)}>
                    <Link2 className="w-4 h-4 mr-2" />Vincular ao CPD
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonsLearnedCenter;
