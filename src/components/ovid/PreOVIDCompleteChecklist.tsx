import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle, XCircle, AlertTriangle, ChevronRight, Save, Loader2,
  Ship, FileText, Users, Navigation, Shield, LifeBuoy,
  Flame, Droplets, Building2, Anchor, Radio, Settings,
  Eye, Snowflake, Plane, Target, Wrench, Camera, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { OVIQ4_CHAPTERS, OVIQQuestion } from '@/data/oviq4-complete-data';
import { PreOVIDChapterTabs, ChapterProgress } from './PreOVIDChapterTabs';
import { useOVIDInspection, OVIDAnswer } from '@/hooks/useOVIDInspection';
import { OVIDPhotoEvidence } from './OVIDPhotoEvidence';

const CHAPTER_ICONS: Record<number, React.FC<{ className?: string }>> = {
  1: Ship, 2: FileText, 3: Users, 4: Navigation, 5: Shield, 6: LifeBuoy,
  7: Flame, 8: Droplets, 9: Building2, 10: Wrench, 11: Anchor, 12: Radio,
  13: Settings, 14: Eye, 15: Snowflake, 16: Plane, 17: Target,
};

interface PreOVIDCompleteChecklistProps {
  vesselType: string;
  inspectionId?: string;
  onProgressChange?: (progress: Record<string, ChapterProgress>) => void;
  onInspectionCreated?: (id: string) => void;
}

export const PreOVIDCompleteChecklist: React.FC<PreOVIDCompleteChecklistProps> = ({
  vesselType,
  inspectionId,
  onProgressChange,
  onInspectionCreated,
}) => {
  const [activeChapter, setActiveChapter] = useState('1');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  
  const { 
    inspection, 
    answers, 
    photos,
    isLoading, 
    isSaving,
    loadInspection,
    updateAnswer,
    uploadPhoto,
    getPhotosForQuestion,
  } = useOVIDInspection(inspectionId);

  // Load inspection if ID provided
  useEffect(() => {
    if (inspectionId) {
      loadInspection(inspectionId);
    }
  }, [inspectionId, loadInspection]);

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
      
      progress[chapter.id.toString()] = { total, completed, compliant, nonCompliant };
    });
    
    return progress;
  }, [answers]);

  // Notify parent of progress changes
  useEffect(() => {
    onProgressChange?.(chapterProgress);
  }, [chapterProgress, onProgressChange]);

  const handleAnswerChange = useCallback((questionId: string, value: 'yes' | 'no' | 'na') => {
    const chapterId = questionId.split('.')[0];
    const currentAnswer = answers[questionId];
    
    const newAnswer: OVIDAnswer = {
      question_id: questionId,
      chapter_id: chapterId,
      answer: value,
      observation: currentAnswer?.observation || '',
    };
    
    updateAnswer(questionId, chapterId, newAnswer);

    if (value === 'no') {
      toast.info('Não conformidade registrada. Adicione uma observação.');
      if (!expandedQuestions.includes(questionId)) {
        setExpandedQuestions(prev => [...prev, questionId]);
      }
    }
  }, [answers, updateAnswer, expandedQuestions]);

  const handleObservationChange = useCallback((questionId: string, observation: string) => {
    const chapterId = questionId.split('.')[0];
    const currentAnswer = answers[questionId];
    
    const newAnswer: OVIDAnswer = {
      question_id: questionId,
      chapter_id: chapterId,
      answer: currentAnswer?.answer || null,
      observation,
    };
    
    updateAnswer(questionId, chapterId, newAnswer);
  }, [answers, updateAnswer]);

  const handlePhotoUpload = useCallback(async (questionId: string, file: File) => {
    await uploadPhoto(questionId, file);
  }, [uploadPhoto]);

  const currentChapter = OVIQ4_CHAPTERS.find(c => c.id.toString() === activeChapter);
  const currentProgress = chapterProgress[activeChapter] || { total: 0, completed: 0, compliant: 0, nonCompliant: 0 };
  const currentProgressPercent = currentProgress.total > 0 
    ? Math.round((currentProgress.completed / currentProgress.total) * 100) 
    : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive" className="text-xs">Crítico</Badge>;
      case 'high': return <Badge className="bg-warning text-xs">Alto</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs">Médio</Badge>;
      default: return <Badge variant="outline" className="text-xs">Baixo</Badge>;
    }
  };

  const ChapterIcon = CHAPTER_ICONS[parseInt(activeChapter)] || Ship;

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Carregando inspeção...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Salvando...</span>
        </div>
      )}

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
              {currentChapter?.questions.map((question) => {
                const answer = answers[question.id];
                const hasAnswer = answer?.answer !== null && answer?.answer !== undefined;
                const questionPhotos = getPhotosForQuestion(question.id);
                
                return (
                  <AccordionItem 
                    key={question.id} 
                    value={question.id}
                    className={`border rounded-lg ${
                      answer?.answer === 'no' ? 'border-destructive/30 bg-destructive/5' :
                      answer?.answer === 'yes' ? 'border-success/30 bg-success/5' :
                      answer?.answer === 'na' ? 'border-muted bg-muted/50' :
                      'border-border'
                    }`}
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-start gap-3 text-left w-full pr-4">
                        <div className="flex items-center gap-2 shrink-0">
                          {hasAnswer ? (
                            answer?.answer === 'yes' ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : answer?.answer === 'no' ? (
                              <XCircle className="w-5 h-5 text-destructive" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
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
                              <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-950">
                                Comentário obrigatório
                              </Badge>
                            )}
                            {questionPhotos.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Camera className="w-3 h-3 mr-1" />
                                {questionPhotos.length}
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
                              {question.references.map((ref) => (
                                <Badge key={ref} variant="secondary" className="text-xs">{ref}</Badge>
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
                                <CheckCircle className="w-4 h-4 text-success" />
                                Sim
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`${question.id}-no`} />
                              <Label htmlFor={`${question.id}-no`} className="flex items-center gap-1 cursor-pointer">
                                <XCircle className="w-4 h-4 text-destructive" />
                                Não
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="na" id={`${question.id}-na`} />
                              <Label htmlFor={`${question.id}-na`} className="flex items-center gap-1 cursor-pointer">
                                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
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
                            className={answer?.answer === 'no' && !answer?.observation ? 'border-destructive/50' : ''}
                          />
                        </div>

                        {/* Photo Evidence */}
                        <div className="flex items-center gap-2">
                          <OVIDPhotoEvidence
                            inspectionId={inspectionId}
                            questionId={question.id}
                            photos={questionPhotos}
                            onPhotoUploaded={() => {}}
                          />
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
        
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          <span className="text-sm text-muted-foreground">
            Capítulo {activeChapter} de {OVIQ4_CHAPTERS.length}
          </span>
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
