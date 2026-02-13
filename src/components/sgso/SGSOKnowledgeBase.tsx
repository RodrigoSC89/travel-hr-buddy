/**
 * PATCH 912 - SGSO Knowledge Base
 * Integrated reference system for ANP, IBP, and industry best practices
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  BookOpen,
  Search,
  FileText,
  ExternalLink,
  Download,
  Scale,
  Building2,
  Globe,
  Lightbulb,
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  category: 'legislation' | 'standard' | 'guide' | 'practice';
  source: string;
  description: string;
  relatedPractices: string[];
  url?: string;
  lastUpdated: string;
}

const knowledgeItems: KnowledgeItem[] = [
  // Legislação ANP
  {
    id: 'anp-46-2016',
    title: 'Resolução ANP nº 46/2016',
    category: 'legislation',
    source: 'ANP',
    description: 'Regulamento Técnico do Sistema de Gerenciamento da Segurança Operacional das Instalações Marítimas de Perfuração e Produção de Petróleo e Gás Natural (SGSO).',
    relatedPractices: ['PG1', 'PG2', 'PG3', 'PG4', 'PG5', 'PG6', 'PG7', 'PG8', 'PG9', 'PG10', 'PG11', 'PG12', 'PG13', 'PG14', 'PG15', 'PG16', 'PG17'],
    url: 'https://www.gov.br/anp',
    lastUpdated: '2016-11-14',
  },
  {
    id: 'anp-43-2007',
    title: 'Resolução ANP nº 43/2007',
    category: 'legislation',
    source: 'ANP',
    description: 'Institui o Sistema de Gerenciamento da Segurança Operacional para as Instalações Marítimas de Produção de Petróleo e Gás Natural.',
    relatedPractices: ['PG1', 'PG7', 'PG12', 'PG13'],
    lastUpdated: '2007-12-06',
  },
  {
    id: 'anp-44-2009',
    title: 'Resolução ANP nº 44/2009',
    category: 'legislation',
    source: 'ANP',
    description: 'Procedimento para Comunicação de Incidentes à ANP.',
    relatedPractices: ['PG9'],
    lastUpdated: '2009-12-22',
  },
  // Normas Técnicas
  {
    id: 'abnt-iso-31000',
    title: 'ABNT NBR ISO 31000:2018',
    category: 'standard',
    source: 'ABNT',
    description: 'Gestão de riscos - Diretrizes para implementação de processo de gestão de riscos.',
    relatedPractices: ['PG12'],
    lastUpdated: '2018-03-28',
  },
  {
    id: 'api-rp-750',
    title: 'API RP 750',
    category: 'standard',
    source: 'API',
    description: 'Management of Process Hazards - Gestão de perigos de processo.',
    relatedPractices: ['PG12', 'PG13', 'PG16'],
    lastUpdated: '2016-01-01',
  },
  {
    id: 'api-580',
    title: 'API 580/581',
    category: 'standard',
    source: 'API',
    description: 'Risk-Based Inspection (RBI) - Inspeção Baseada em Risco.',
    relatedPractices: ['PG11', 'PG13'],
    lastUpdated: '2016-01-01',
  },
  // Guias IBP
  {
    id: 'ibp-sgso-2022',
    title: 'Guia de Boas Práticas SGSO',
    category: 'guide',
    source: 'IBP',
    description: 'Guia de orientação para implementação do SGSO conforme requisitos ANP.',
    relatedPractices: ['PG1', 'PG2', 'PG3', 'PG7', 'PG12', 'PG13'],
    lastUpdated: '2022-06-15',
  },
  {
    id: 'ibp-gm',
    title: 'Guia de Gestão de Mudanças',
    category: 'guide',
    source: 'IBP',
    description: 'Orientações para implementação de processo de gestão de mudanças.',
    relatedPractices: ['PG16'],
    lastUpdated: '2020-03-01',
  },
  // Boas Práticas
  {
    id: 'bow-tie',
    title: 'Metodologia Bow-Tie',
    category: 'practice',
    source: 'Indústria',
    description: 'Técnica visual de análise de riscos que integra análise de causas e consequências.',
    relatedPractices: ['PG12', 'PG14'],
    lastUpdated: '2023-01-01',
  },
  {
    id: 'hearts-minds',
    title: 'Hearts and Minds',
    category: 'practice',
    source: 'Shell/Energy Institute',
    description: 'Programa de desenvolvimento de cultura de segurança.',
    relatedPractices: ['PG1', 'PG2'],
    lastUpdated: '2023-01-01',
  },
];

const evidenceSuggestions: Record<string, string[]> = {
  'PG1': [
    'Política de Segurança Operacional assinada',
    'Organograma com responsabilidades SGSO',
    'Atas de reunião da alta direção',
    'Orçamento aprovado para segurança',
    'Relatório de análise crítica pela direção',
  ],
  'PG7': [
    'Cronograma anual de auditorias',
    'Relatórios de auditoria interna',
    'Planos de ação de NC',
    'Qualificação dos auditores',
    'Matriz de auditoria por prática',
  ],
  'PG12': [
    'Estudos HAZOP atualizados',
    'Matriz de riscos',
    'Análises LOPA',
    'Registros de análise de risco',
    'Plano de ação de recomendações',
  ],
  'PG13': [
    'Plano de manutenção preventiva',
    'Relatórios de inspeção',
    'Análise de vibração e termografia',
    'RBI - Inspeção baseada em risco',
    'Histórico de manutenção',
  ],
  'PG16': [
    'Procedimento de gestão de mudanças',
    'Formulários de solicitação de mudança',
    'Análises de risco de mudança',
    'Parecer técnico aprovado',
    'Comunicação da mudança',
  ],
};

const categoryIcons: Record<string, React.ReactNode> = {
  legislation: <Scale className="h-4 w-4" />,
  standard: <FileText className="h-4 w-4" />,
  guide: <BookOpen className="h-4 w-4" />,
  practice: <Lightbulb className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  legislation: 'bg-destructive/10 text-destructive',
  standard: 'bg-info/10 text-info',
  guide: 'bg-success/10 text-success',
  practice: 'bg-accent/10 text-accent',
};

export const SGSOKnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.relatedPractices.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Base de Conhecimento SGSO
          </h2>
          <p className="text-muted-foreground">Legislação, normas técnicas e boas práticas</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descrição ou prática (ex: PG12)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="legislation" className="gap-2">
            <Scale className="h-4 w-4" />
            Legislação
          </TabsTrigger>
          <TabsTrigger value="standard" className="gap-2">
            <FileText className="h-4 w-4" />
            Normas
          </TabsTrigger>
          <TabsTrigger value="guide" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Guias
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Boas Práticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Knowledge Items */}
            <Card>
              <CardHeader>
                <CardTitle>Referências ({filteredItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={categoryColors[item.category]}>
                                {categoryIcons[item.category]}
                                <span className="ml-1 capitalize">{item.category}</span>
                              </Badge>
                              <Badge variant="outline">{item.source}</Badge>
                            </div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.relatedPractices.map((pg) => (
                                <Badge key={pg} variant="secondary" className="text-xs">{pg}</Badge>
                              ))}
                            </div>
                          </div>
                          {item.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Evidence Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Sugestão de Evidências por Prática</CardTitle>
                <CardDescription>Documentos recomendados para demonstrar conformidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(evidenceSuggestions).map(([practice, evidences]) => (
                      <AccordionItem key={practice} value={practice}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{practice}</Badge>
                            <span className="text-sm">{evidences.length} evidências sugeridas</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {evidences.map((evidence) => (
                              <li key={evidence} className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 dark:from-destructive/10 dark:to-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Scale className="h-8 w-8 text-destructive" />
              <div>
                <h3 className="font-bold">Prazos NC - ANP</h3>
                <p className="text-sm text-muted-foreground">Classificação de não conformidades</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Crítica:</span><span className="font-bold text-destructive">Interdição</span></div>
              <div className="flex justify-between"><span>Grave:</span><span className="font-bold">30 dias</span></div>
              <div className="flex justify-between"><span>Moderada:</span><span className="font-bold">90 dias</span></div>
              <div className="flex justify-between"><span>Leve:</span><span className="font-bold">180 dias</span></div>
            </div>
          </CardContent>
        </Card>

         <Card className="bg-gradient-to-br from-info/5 to-info/10 dark:from-info/10 dark:to-info/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-8 w-8 text-info" />
              <div>
                <h3 className="font-bold">Órgãos de Referência</h3>
                <p className="text-sm text-muted-foreground">Entidades reguladoras</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Badge>ANP</Badge> Agência Nacional do Petróleo</div>
              <div className="flex items-center gap-2"><Badge>IBP</Badge> Instituto Brasileiro do Petróleo</div>
              <div className="flex items-center gap-2"><Badge>API</Badge> American Petroleum Institute</div>
              <div className="flex items-center gap-2"><Badge>ABNT</Badge> Assoc. Brasileira de Normas Técnicas</div>
            </div>
          </CardContent>
        </Card>

         <Card className="bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="h-8 w-8 text-success" />
              <div>
                <h3 className="font-bold">DSO Obrigatória</h3>
                <p className="text-sm text-muted-foreground">Documentação de Segurança</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Badge variant="outline">MC</Badge> Matriz de Correlação</div>
              <div className="flex items-center gap-2"><Badge variant="outline">DUM</Badge> Descrição da Unidade</div>
              <div className="flex items-center gap-2"><Badge variant="outline">RIC</Badge> Relatório do Concessionário</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SGSOKnowledgeBase;
