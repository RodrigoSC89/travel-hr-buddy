/**
 * OCIMF OVMSA Self-Assessment - Enterprise Intelligence Suite
 * Sistema de auto-avaliação OCIMF OVMSA/TMSA com gap analysis
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  code: string;
  text: string;
  guidance: string;
  level: 1 | 2 | 3 | 4;
  answer?: 'yes' | 'partial' | 'no' | 'na';
  evidence?: string;
  recommendation?: string;
}

interface Section {
  id: string;
  code: string;
  title: string;
  questions: Question[];
  weight: number;
}

const ASSESSMENT_SECTIONS: Section[] = [
  {
    id: '1',
    code: 'SMS',
    title: 'Safety Management System',
    weight: 15,
    questions: [
      {
        id: '1.1',
        code: 'SMS-1.1',
        text: 'A empresa possui um Sistema de Gestão de Segurança (SMS) documentado e implementado?',
        guidance: 'O SMS deve estar de acordo com o ISM Code e cobrir todas as operações da embarcação.',
        level: 1,
      },
      {
        id: '1.2',
        code: 'SMS-1.2',
        text: 'Existem objetivos e metas de segurança claramente definidos e comunicados?',
        guidance: 'Os objetivos devem ser mensuráveis e revisados periodicamente.',
        level: 2,
      },
      {
        id: '1.3',
        code: 'SMS-1.3',
        text: 'Há um programa de auditorias internas do SMS com cronograma definido?',
        guidance: 'Auditorias devem ser conduzidas pelo menos anualmente.',
        level: 2,
      },
    ],
  },
  {
    id: '2',
    code: 'NAV',
    title: 'Navigation & Watchkeeping',
    weight: 20,
    questions: [
      {
        id: '2.1',
        code: 'NAV-2.1',
        text: 'Existe um sistema de gestão de ponte implementado (BRM)?',
        guidance: 'O BRM deve incluir procedimentos para todas as operações de navegação.',
        level: 1,
      },
      {
        id: '2.2',
        code: 'NAV-2.2',
        text: 'Os oficiais de navegação recebem treinamento em ECDIS regularmente?',
        guidance: 'Treinamento deve ser realizado conforme requisitos STCW.',
        level: 2,
      },
    ],
  },
  {
    id: '3',
    code: 'CAR',
    title: 'Cargo Operations',
    weight: 15,
    questions: [
      {
        id: '3.1',
        code: 'CAR-3.1',
        text: 'Existem procedimentos documentados para todas as operações de carga?',
        guidance: 'Procedimentos devem cobrir carregamento, descarregamento e manuseio.',
        level: 1,
      },
    ],
  },
  {
    id: '4',
    code: 'ENG',
    title: 'Engine & Machinery',
    weight: 15,
    questions: [
      {
        id: '4.1',
        code: 'ENG-4.1',
        text: 'Existe um programa de manutenção preventiva para todos os equipamentos críticos?',
        guidance: 'O programa deve incluir intervalos e procedimentos específicos.',
        level: 1,
      },
    ],
  },
  {
    id: '5',
    code: 'ENV',
    title: 'Environmental Protection',
    weight: 10,
    questions: [
      {
        id: '5.1',
        code: 'ENV-5.1',
        text: 'A empresa possui um plano de gestão ambiental (EMP) documentado?',
        guidance: 'O EMP deve cobrir emissões, resíduos e efluentes.',
        level: 1,
      },
    ],
  },
];

export default function OCIMFAssessmentPage() {
  const [sections, setSections] = useState<Section[]>(ASSESSMENT_SECTIONS);
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const [showGuidance, setShowGuidance] = useState(false);

  const updateAnswer = (sectionId: string, questionId: string, answer: Question['answer']) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : s
      )
    );
  };

  const updateEvidence = (sectionId: string, questionId: string, evidence: string) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, evidence } : q
              ),
            }
          : s
      )
    );
  };

  const calculateScore = (section: Section): number => {
    const answered = section.questions.filter(q => q.answer);
    if (answered.length === 0) return 0;
    
    const score = answered.reduce((acc, q) => {
      if (q.answer === 'yes') return acc + 100;
      if (q.answer === 'partial') return acc + 50;
      return acc;
    }, 0);
    
    return score / section.questions.length;
  };

  const totalScore = sections.reduce((acc, s) => acc + calculateScore(s) * (s.weight / 100), 0);
  const completedQuestions = sections.flatMap(s => s.questions).filter(q => q.answer).length;
  const totalQuestions = sections.flatMap(s => s.questions).length;
  const completionRate = (completedQuestions / totalQuestions) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const gaps = sections.flatMap(s =>
    s.questions
      .filter(q => q.answer === 'no' || q.answer === 'partial')
      .map(q => ({ section: s.title, question: q }))
  );

  return (
    <>
      <Helmet>
        <title>OCIMF OVMSA Self-Assessment | Nautilus One</title>
        <meta name="description" content="Auto-avaliação OCIMF OVMSA/TMSA com análise de gaps" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                OCIMF Self-Assessment
                <Badge className="bg-gradient-to-r from-primary to-info">
                  OVMSA
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Auto-avaliação completa com gap analysis em tempo real
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-3xl font-bold", getScoreColor(totalScore))}>
                    {totalScore.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Score Geral</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{completionRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Progresso</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{gaps.length}</p>
                  <p className="text-xs text-muted-foreground">Gaps Identificados</p>
                </div>
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{completedQuestions}/{totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Questões Respondidas</p>
                </div>
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assessment">
          <TabsList>
            <TabsTrigger value="assessment">Avaliação</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis ({gaps.length})</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações IA</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sections List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Seções</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const score = calculateScore(section);
                      const answered = section.questions.filter(q => q.answer).length;
                      
                      return (
                        <div
                          key={section.id}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all",
                            activeSection === section.id
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{section.code}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                score >= 80 && "bg-success/10 text-success",
                                score >= 60 && score < 80 && "bg-warning/10 text-warning",
                                score < 60 && answered > 0 && "bg-destructive/10 text-destructive"
                              )}
                            >
                              {score.toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{section.title}</p>
                          <Progress value={(answered / section.questions.length) * 100} className="h-1 mt-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  {sections.find(s => s.id === activeSection) && (
                    <>
                      <CardTitle>{sections.find(s => s.id === activeSection)?.title}</CardTitle>
                      <CardDescription>
                        {sections.find(s => s.id === activeSection)?.questions.length} questões • 
                        Peso: {sections.find(s => s.id === activeSection)?.weight}%
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <Accordion type="single" collapsible className="space-y-4">
                      {sections
                        .find(s => s.id === activeSection)
                        ?.questions.map((question, idx) => (
                          <AccordionItem key={question.id} value={question.id} className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 text-left">
                                <div className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                                  question.answer === 'yes' && "bg-success/20 text-success",
                                  question.answer === 'partial' && "bg-warning/20 text-warning",
                                  question.answer === 'no' && "bg-destructive/20 text-destructive",
                                  !question.answer && "bg-muted text-muted-foreground"
                                )}>
                                  {question.answer === 'yes' && <CheckCircle2 className="h-4 w-4" />}
                                  {question.answer === 'partial' && <AlertTriangle className="h-4 w-4" />}
                                  {question.answer === 'no' && <XCircle className="h-4 w-4" />}
                                  {!question.answer && idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{question.code}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{question.text}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Nível {question.level}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              <p className="text-sm">{question.text}</p>
                              
                              {/* Guidance */}
                              <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="h-4 w-4 text-info mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-info mb-1">Orientação OCIMF</p>
                                    <p className="text-xs text-muted-foreground">{question.guidance}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Answer */}
                              <div>
                                <Label className="text-sm mb-2 block">Resposta:</Label>
                                <RadioGroup
                                  value={question.answer || ''}
                                  onValueChange={(value) => updateAnswer(activeSection, question.id, value as Question['answer'])}
                                  className="flex gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                    <Label htmlFor={`${question.id}-yes`} className="text-sm font-normal cursor-pointer">
                                      Sim, conforme
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="partial" id={`${question.id}-partial`} />
                                    <Label htmlFor={`${question.id}-partial`} className="text-sm font-normal cursor-pointer">
                                      Parcialmente
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id={`${question.id}-no`} />
                                    <Label htmlFor={`${question.id}-no`} className="text-sm font-normal cursor-pointer">
                                      Não conforme
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="na" id={`${question.id}-na`} />
                                    <Label htmlFor={`${question.id}-na`} className="text-sm font-normal cursor-pointer">
                                      N/A
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* Evidence */}
                              <div>
                                <Label className="text-sm mb-2 block">Evidência/Comentários:</Label>
                                <Textarea
                                  value={question.evidence || ''}
                                  onChange={(e) => updateEvidence(activeSection, question.id, e.target.value)}
                                  placeholder="Descreva as evidências que suportam sua resposta..."
                                  className="h-20"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gaps">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Gap Analysis
                </CardTitle>
                <CardDescription>
                  {gaps.length} não conformidades e gaps identificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gaps.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                    <h3 className="text-lg font-medium">Nenhum gap identificado</h3>
                    <p className="text-muted-foreground">Continue respondendo as questões para análise de gaps</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gaps.map((gap, idx) => (
                      <motion.div
                        key={gap.question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="border-warning/20">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge variant="outline" className="mb-2">{gap.section}</Badge>
                                <h4 className="font-medium">{gap.question.code}</h4>
                              </div>
                              <Badge
                                className={cn(
                                  gap.question.answer === 'no' ? 'bg-destructive' : 'bg-warning'
                                )}
                              >
                                {gap.question.answer === 'no' ? 'Não Conforme' : 'Parcial'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{gap.question.text}</p>
                            <div className="p-3 bg-warning/10 rounded-lg">
                              <p className="text-xs font-medium text-warning mb-1">Ação Requerida:</p>
                              <p className="text-xs text-muted-foreground">
                                Desenvolver e implementar procedimentos para atender ao requisito. 
                                Prazo sugerido: 30 dias.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recomendações da IA
                </CardTitle>
                <CardDescription>
                  Análise inteligente baseada nos gaps identificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gaps.length > 0 ? (
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Plano de Ação Prioritário
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Com base na análise de {gaps.length} gaps identificados, recomendamos:
                      </p>
                      <ol className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span>
                          <span>Priorizar itens de Nível 1 (requisitos fundamentais)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span>
                          <span>Revisar procedimentos de SMS e Navigation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span>
                          <span>Agendar treinamentos complementares para tripulação</span>
                        </li>
                      </ol>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                      <p className="text-muted-foreground">
                        Complete a avaliação para receber recomendações personalizadas
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
