import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Ship, FileText, Users, Navigation, Shield, LifeBuoy,
  Flame, Droplets, Building2, Anchor, Radio, Settings,
  Eye, Snowflake, Plane, Target, Wrench, Brain, Camera, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { OVIQ4_CHAPTERS, OVIQQuestion } from '@/data/oviq4-complete-data';
import { PreOVIDChapterTabs, ChapterProgress } from './PreOVIDChapterTabs';

const CHAPTER_ICONS: Record<number, React.FC<any>> = {
  1: Ship,
  2: FileText,
  3: Users,
  4: Navigation,
  5: Shield,
  6: LifeBuoy,
  7: Flame,
  8: Droplets,
  9: Building2,
  10: Wrench,
  11: Anchor,
  12: Radio,
  13: Settings,
  14: Eye,
  15: Snowflake,
  16: Plane,
  17: Target,
};

interface QuestionAnswer {
  answer: 'yes' | 'no' | 'na' | null;
  observation: string;
  evidence?: string[];
  photos?: string[];
}

interface PreOVIDCompleteChecklistProps {
  vesselType: string;
  onProgressChange?: (progress: Record<string, ChapterProgress>) => void;
  onAnswerUpdate?: (questionId: string, answer: QuestionAnswer) => void;
}

export const PreOVIDCompleteChecklist: React.FC<PreOVIDCompleteChecklistProps> = ({
  vesselType,
  onProgressChange,
  onAnswerUpdate,
}) => {
  const [activeChapter, setActiveChapter] = useState('1');
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  // Calculate progress for each chapter
  const chapterProgress = useMemo(() => {
    const progress: Record<string, ChapterProgress> = {};
    
    OVIQ4_CHAPTERS.forEach(chapter => {
      const chapterAnswers = Object.entries(answers).filter(([key]) => 
        key.startsWith(`${chapter.id}.`)
      );
      
      const total = chapter.questions.length;
      const completed = chapterAnswers.filter(([, a]) => a.answer !== null).length;
      const compliant = chapterAnswers.filter(([, a]) => a.answer === 'yes').length;
      const nonCompliant = chapterAnswers.filter(([, a]) => a.answer === 'no').length;
      
      progress[chapter.id.toString()] = {
        total,
        completed,
        compliant,
        nonCompliant,
      };
    });
    
    return progress;
  }, [answers]);

  // Notify parent of progress changes
  React.useEffect(() => {
    onProgressChange?.(chapterProgress);
  }, [chapterProgress, onProgressChange]);

  const handleAnswerChange = (questionId: string, value: 'yes' | 'no' | 'na') => {
    setAnswers(prev => {
      const newAnswer: QuestionAnswer = {
        ...prev[questionId],
        answer: value,
        observation: prev[questionId]?.observation || '',
      };
      
      onAnswerUpdate?.(questionId, newAnswer);
      
      return {
        ...prev,
        [questionId]: newAnswer,
      };
    });

    if (value === 'no') {
      toast.info('Não conformidade registrada. Adicione uma observação.');
      if (!expandedQuestions.includes(questionId)) {
        setExpandedQuestions(prev => [...prev, questionId]);
      }
    }
  };

  const handleObservationChange = (questionId: string, observation: string) => {
    setAnswers(prev => {
      const newAnswer: QuestionAnswer = {
        ...prev[questionId],
        answer: prev[questionId]?.answer || null,
        observation,
      };
      
      onAnswerUpdate?.(questionId, newAnswer);
      
      return {
        ...prev,
        [questionId]: newAnswer,
      };
    });
  };

  const currentChapter = OVIQ4_CHAPTERS.find(c => c.id.toString() === activeChapter);
  const currentProgress = chapterProgress[activeChapter] || { total: 0, completed: 0, compliant: 0, nonCompliant: 0 };
  const currentProgressPercent = currentProgress.total > 0 
    ? Math.round((currentProgress.completed / currentProgress.total) * 100) 
    : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-xs">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Médio</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Baixo</Badge>;
    }
  };

  const ChapterIcon = CHAPTER_ICONS[parseInt(activeChapter)] || Ship;

  return (
    <div className="space-y-4">
      {/* Chapter Navigation */}
      <PreOVIDChapterTabs
        activeChapter={activeChapter}
        onChapterChange={setActiveChapter}
        chapterProgress={chapterProgress}
      />

      {/* Chapter Header */}
      {currentChapter && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ChapterIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Capítulo {currentChapter.id}: {currentChapter.name}
                    {currentChapter.criticalCount && currentChapter.criticalCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {currentChapter.criticalCount} críticos
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{currentChapter.description}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{currentProgress.completed}/{currentProgress.total}</p>
                <p className="text-xs text-muted-foreground">{currentProgressPercent}% completo</p>
              </div>
            </div>
            <Progress value={currentProgressPercent} className="h-2 mt-3" />
          </CardHeader>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[500px] pr-4">
            <Accordion 
              type="multiple" 
              value={expandedQuestions}
              onValueChange={setExpandedQuestions}
              className="space-y-3"
            >
              {currentChapter?.questions.map((question, index) => {
                const answer = answers[question.id];
                const hasAnswer = answer?.answer !== null && answer?.answer !== undefined;
                
                return (
                  <AccordionItem 
                    key={question.id} 
                    value={question.id}
                    className={`border rounded-lg ${
                      answer?.answer === 'no' ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' :
                      answer?.answer === 'yes' ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' :
                      answer?.answer === 'na' ? 'border-gray-300 bg-gray-50/50 dark:bg-gray-950/20' :
                      'border-border'
                    }`}
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-start gap-3 text-left w-full pr-4">
                        <div className="flex items-center gap-2 shrink-0">
                          {hasAnswer ? (
                            answer?.answer === 'yes' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : answer?.answer === 'no' ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-gray-400" />
                            )
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <Badge variant="outline" className="font-mono text-xs">
                            {question.id}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{question.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityBadge(question.priority)}
                            {question.mandatoryComment && (
                              <Badge variant="outline" className="text-xs bg-yellow-50">
                                Comentário obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 pt-2">
                        {/* Guidance */}
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Orientação:</p>
                          <p className="text-sm">{question.guidance}</p>
                          {question.references && question.references.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.references.map((ref, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Answer Options */}
                        <div>
                          <Label className="text-sm mb-2 block">Resposta:</Label>
                          <RadioGroup
                            value={answer?.answer || ''}
                            onValueChange={(value) => handleAnswerChange(question.id, value as 'yes' | 'no' | 'na')}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                              <Label htmlFor={`${question.id}-yes`} className="flex items-center gap-1 cursor-pointer">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Sim
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`${question.id}-no`} />
                              <Label htmlFor={`${question.id}-no`} className="flex items-center gap-1 cursor-pointer">
                                <XCircle className="w-4 h-4 text-red-500" />
                                Não
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="na" id={`${question.id}-na`} />
                              <Label htmlFor={`${question.id}-na`} className="flex items-center gap-1 cursor-pointer">
                                <AlertTriangle className="w-4 h-4 text-gray-400" />
                                N/A
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Observation */}
                        <div>
                          <Label className="text-sm mb-2 block">
                            Observação {question.mandatoryComment && <span className="text-red-500">*</span>}:
                          </Label>
                          <Textarea
                            placeholder="Adicione observações, evidências ou detalhes..."
                            value={answer?.observation || ''}
                            onChange={(e) => handleObservationChange(question.id, e.target.value)}
                            rows={3}
                            className={answer?.answer === 'no' && !answer?.observation ? 'border-red-300' : ''}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Camera className="w-4 h-4 mr-1" />
                            Foto
                          </Button>
                          <Button variant="outline" size="sm">
                            <Sparkles className="w-4 h-4 mr-1" />
                            Gerar Evidência IA
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chapter Navigation Footer */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => {
            const currentIndex = OVIQ4_CHAPTERS.findIndex(c => c.id.toString() === activeChapter);
            if (currentIndex > 0) {
              setActiveChapter(OVIQ4_CHAPTERS[currentIndex - 1].id.toString());
            }
          }}
          disabled={activeChapter === '1'}
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Capítulo Anterior
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Capítulo {activeChapter} de {OVIQ4_CHAPTERS.length}
        </div>
        
        <Button
          onClick={() => {
            const currentIndex = OVIQ4_CHAPTERS.findIndex(c => c.id.toString() === activeChapter);
            if (currentIndex < OVIQ4_CHAPTERS.length - 1) {
              setActiveChapter(OVIQ4_CHAPTERS[currentIndex + 1].id.toString());
            }
          }}
          disabled={activeChapter === OVIQ4_CHAPTERS.length.toString()}
        >
          Próximo Capítulo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
