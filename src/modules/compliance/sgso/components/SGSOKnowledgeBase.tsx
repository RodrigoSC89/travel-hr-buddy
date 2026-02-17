/**
 * SGSO Knowledge Base - Maritime Legislation Reference
 * ANP, IBP, ABNT integrated knowledge base
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, BookOpen, FileText, ExternalLink, 
  Scale, Building2, Shield, Anchor, Download
} from "lucide-react";

interface LegislationItem {
  id: string;
  title: string;
  number: string;
  date: string;
  source: "ANP" | "IBP" | "ABNT" | "IMO";
  category: string;
  summary: string;
  link?: string;
  relatedPractices: string[];
}

const LEGISLATION_DATABASE: LegislationItem[] = [
  {
    id: "1",
    title: "Regulamento Técnico do SGSO",
    number: "Resolução ANP nº 46/2016",
    date: "2016-12-21",
    source: "ANP",
    category: "SGSO",
    summary: "Estabelece o Regulamento Técnico do Sistema de Gestão da Segurança Operacional (SGSO) das instalações marítimas de perfuração e de produção de petróleo e gás natural.",
    link: "https://www.gov.br/anp/pt-br",
    relatedPractices: ["PG-01", "PG-02", "PG-03", "PG-04", "PG-05", "PG-06", "PG-07", "PG-08", "PG-09", "PG-10", "PG-11", "PG-12", "PG-13", "PG-14", "PG-15", "PG-16"],
  },
  {
    id: "2",
    title: "Guia de Boas Práticas SGSO",
    number: "Guia ANP 2022",
    date: "2022-01-01",
    source: "ANP",
    category: "Boas Práticas",
    summary: "Guia orientativo com boas práticas para implementação e manutenção do SGSO em instalações marítimas.",
    relatedPractices: ["PG-01", "PG-02", "PG-08", "PG-10"],
  },
  {
    id: "3",
    title: "Código ISM",
    number: "IMO Resolution A.741(18)",
    date: "1993-11-04",
    source: "IMO",
    category: "Segurança Marítima",
    summary: "International Safety Management Code - Código Internacional de Gestão de Segurança para operação segura de navios e prevenção de poluição.",
    link: "https://www.imo.org",
    relatedPractices: ["PG-01", "PG-02", "PG-04", "PG-07", "PG-12"],
  },
  {
    id: "4",
    title: "Gestão de Riscos - Princípios e Diretrizes",
    number: "ABNT NBR ISO 31000:2018",
    date: "2018-03-01",
    source: "ABNT",
    category: "Gestão de Riscos",
    summary: "Fornece princípios, estrutura e processo para gestão de riscos aplicáveis a qualquer tipo de organização.",
    relatedPractices: ["PG-08", "PG-10", "PG-11"],
  },
  {
    id: "5",
    title: "Segurança de Processo - Gestão de Elementos Críticos",
    number: "IBP - Guia RBPS",
    date: "2021-06-01",
    source: "IBP",
    category: "Segurança de Processo",
    summary: "Guia para implementação de Sistema de Gestão de Segurança de Processo baseado em riscos.",
    relatedPractices: ["PG-08", "PG-09", "PG-10"],
  },
  {
    id: "6",
    title: "SOLAS - Convenção para Salvaguarda da Vida Humana no Mar",
    number: "SOLAS 1974 (consolidated)",
    date: "1974-11-01",
    source: "IMO",
    category: "Segurança Marítima",
    summary: "Tratado internacional que estabelece padrões mínimos de segurança na construção, equipamento e operação de navios.",
    link: "https://www.imo.org",
    relatedPractices: ["PG-09", "PG-12", "PG-14"],
  },
  {
    id: "7",
    title: "Gestão de Mudanças",
    number: "Resolução ANP nº 43/2007",
    date: "2007-12-06",
    source: "ANP",
    category: "MOC",
    summary: "Estabelece requisitos para gestão de mudanças em instalações de perfuração e produção.",
    relatedPractices: ["PG-11"],
  },
  {
    id: "8",
    title: "Investigação de Incidentes",
    number: "API RP 754",
    date: "2016-04-01",
    source: "IBP",
    category: "Incidentes",
    summary: "Indicadores de desempenho de segurança de processo para a indústria de refino e petroquímica.",
    relatedPractices: ["PG-15", "PG-16"],
  },
];

const PRACTICE_GUIDELINES: Record<string, { title: string; requirements: string[] }> = {
  "PG-01": {
    title: "Liderança e Comprometimento",
    requirements: [
      "Definir e comunicar a visão de segurança",
      "Alocar recursos adequados para o SGSO",
      "Participar ativamente das atividades de segurança",
      "Demonstrar compromisso visível com a segurança",
      "Estabelecer cultura de segurança positiva",
    ],
  },
  "PG-02": {
    title: "Política de SGSO",
    requirements: [
      "Política documentada e aprovada pela alta direção",
      "Compromisso com melhoria contínua",
      "Comunicação a todas as partes interessadas",
      "Revisão periódica da política",
      "Alinhamento com objetivos organizacionais",
    ],
  },
  "PG-08": {
    title: "Gestão de Riscos",
    requirements: [
      "Identificação sistemática de perigos",
      "Análise e avaliação de riscos",
      "Implementação de medidas de controle",
      "Monitoramento contínuo dos riscos",
      "Registro e documentação das análises",
      "Revisão periódica dos estudos de risco",
    ],
  },
  "PG-10": {
    title: "Segurança de Processo",
    requirements: [
      "Análise de segurança de processo (HAZOP, APP)",
      "Gestão de elementos críticos de segurança",
      "Procedimentos operacionais atualizados",
      "Competência técnica dos operadores",
      "Manutenção preventiva de sistemas críticos",
    ],
  },
};

export const SGSOKnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("legislation");

  const filteredLegislation = LEGISLATION_DATABASE.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = selectedSource === "all" || item.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
    case "ANP":
      return <Scale className="h-4 w-4" />;
    case "IBP":
      return <Building2 className="h-4 w-4" />;
    case "ABNT":
      return <Shield className="h-4 w-4" />;
    case "IMO":
      return <Anchor className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
    case "ANP":
      return "bg-primary";
    case "IBP":
      return "bg-success";
    case "ABNT":
      return "bg-accent";
    case "IMO":
      return "bg-warning";
    default:
      return "bg-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="legislation">Legislação</TabsTrigger>
          <TabsTrigger value="practices">Práticas de Gestão</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="legislation" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar legislação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "ANP", "IBP", "ABNT", "IMO"].map((source) => (
                    <Button
                      key={source}
                      variant={selectedSource === source ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSource(source)}
                    >
                      {source === "all" ? "Todos" : source}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legislation List */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredLegislation.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getSourceColor(item.source)} text-white`}>
                            {getSourceIcon(item.source)}
                            <span className="ml-1">{item.source}</span>
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{item.number}</p>
                        <p className="text-sm mt-2">{item.summary}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.relatedPractices.map((pg) => (
                            <Badge key={pg} variant="secondary" className="text-xs">
                              {pg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {item.link && (
                        <Button variant="ghost" size="icon" asChild aria-label="Abrir link externo" title="Abrir link">
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Requisitos por Prática de Gestão
              </CardTitle>
              <CardDescription>
                Requisitos detalhados conforme Resolução ANP 46/2016
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(PRACTICE_GUIDELINES).map(([pgId, data]) => (
                  <AccordionItem key={pgId} value={pgId}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">{pgId}</Badge>
                        <span>{data.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 ml-4">
                        {data.requirements.map((req, idx) => (
                          <li key={`req-${idx}-${req.slice(0, 15)}`} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates e Modelos</CardTitle>
              <CardDescription>
                Modelos de documentos para auditorias e conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Checklist de Auditoria SGSO", type: "Excel", size: "45 KB" },
                  { name: "Modelo de Relatório de NC", type: "Word", size: "32 KB" },
                  { name: "Plano de Ação Corretiva", type: "Excel", size: "28 KB" },
                  { name: "Matriz de Riscos SGSO", type: "Excel", size: "156 KB" },
                  { name: "Formulário de Investigação", type: "Word", size: "48 KB" },
                  { name: "Template de Política SGSO", type: "Word", size: "24 KB" },
                ].map((template) => (
                  <Card key={template.name} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.type} • {template.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="Baixar template" title="Baixar">
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
