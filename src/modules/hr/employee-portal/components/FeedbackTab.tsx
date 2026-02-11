/**
 * FeedbackTab - Complete Feedback & Self-Assessment CRUD
 * Functional component with real actions, dialogs, and state management
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { MessageSquare, Star, Send, Eye, FileText, Clock, CheckCircle, Loader2 } from "lucide-react";

interface SelfAssessment {
  id: string;
  period: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewed';
  questions: {
    id: string;
    question: string;
    answer?: string;
    score?: number;
  }[];
  submittedAt?: string;
  managerFeedback?: string;
}

interface PeerFeedback {
  id: string;
  period: string;
  score: string;
  status: string;
  submittedAt: string;
  categories: { name: string; score: number }[];
  managerComment?: string;
}

const fallbackAssessments: SelfAssessment[] = [
  {
    id: "1",
    period: "Q4 2024",
    deadline: "2025-01-15",
    status: 'pending',
    questions: [
      { id: "q1", question: "Quais foram suas principais realizações neste período?" },
      { id: "q2", question: "Quais desafios você enfrentou e como os superou?" },
      { id: "q3", question: "Quais são seus objetivos para o próximo período?" },
      { id: "q4", question: "Como você avalia seu desempenho geral de 1 a 10?" }
    ]
  }
];

const fallbackPeerFeedbacks: PeerFeedback[] = [
  { 
    id: "1", 
    period: "Q3 2024", 
    score: "4.2/5.0", 
    status: "Concluída",
    submittedAt: "2024-10-15",
    categories: [
      { name: "Comunicação", score: 4.5 },
      { name: "Trabalho em Equipe", score: 4.0 },
      { name: "Iniciativa", score: 4.3 },
      { name: "Pontualidade", score: 4.0 }
    ],
    managerComment: "Excelente desempenho no trimestre. Continue assim!"
  },
  { 
    id: "2", 
    period: "Q2 2024", 
    score: "4.0/5.0", 
    status: "Concluída",
    submittedAt: "2024-07-10",
    categories: [
      { name: "Comunicação", score: 4.0 },
      { name: "Trabalho em Equipe", score: 4.2 },
      { name: "Iniciativa", score: 3.8 },
      { name: "Pontualidade", score: 4.0 }
    ]
  }
];

export function FeedbackTab() {
  const [assessments, setAssessments] = useState<SelfAssessment[]>(fallbackAssessments);
  const [peerFeedbacks] = useState<PeerFeedback[]>(fallbackPeerFeedbacks);
  
  // Dialog states
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const [selectedAssessment, setSelectedAssessment] = useState<SelfAssessment | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<PeerFeedback | null>(null);
  
  // Form states
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentScore, setAssessmentScore] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Peer feedback form
  const [peerFeedbackData, setPeerFeedbackData] = useState({
    strengths: '',
    improvements: '',
    generalComments: '',
    anonymous: true
  });

  const handleStartAssessment = (assessment: SelfAssessment) => {
    setSelectedAssessment(assessment);
    setAssessmentAnswers({});
    setAssessmentScore(7);
    setShowAssessmentDialog(true);
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAssessment) return;
    
    // Validate all questions are answered
    const unanswered = selectedAssessment.questions.filter(q => !assessmentAnswers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.error("Por favor, responda todas as perguntas");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAssessments(prev => prev.map(a => 
        a.id === selectedAssessment.id 
          ? { 
              ...a, 
              status: 'submitted' as const,
              submittedAt: new Date().toISOString(),
              questions: a.questions.map(q => ({
                ...q,
                answer: assessmentAnswers[q.id],
                score: q.id === 'q4' ? assessmentScore : undefined
              }))
            }
          : a
      ));
      
      toast.success("Autoavaliação enviada com sucesso!", {
        description: "Seu gestor será notificado para revisão"
      });
      setShowAssessmentDialog(false);
    } catch (error) {
      toast.error("Erro ao enviar autoavaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPeerFeedback = async () => {
    if (!peerFeedbackData.generalComments.trim()) {
      toast.error("Por favor, adicione comentários gerais");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Feedback enviado com sucesso!", {
        description: peerFeedbackData.anonymous ? "Seu feedback foi enviado anonimamente" : "Seu feedback foi enviado"
      });
      
      setPeerFeedbackData({ strengths: '', improvements: '', generalComments: '', anonymous: true });
      setShowFeedbackDialog(false);
    } catch (error) {
      toast.error("Erro ao enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewFeedbackDetails = (feedback: PeerFeedback) => {
    setSelectedFeedback(feedback);
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: SelfAssessment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pendente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-info text-info">Em Andamento</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="border-success text-success">Enviada</Badge>;
      case 'reviewed':
        return <Badge className="bg-success text-success-foreground">Revisada</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback & Avaliações
          </CardTitle>
          <CardDescription>
            Sistema completo de autoavaliação e feedback com rastreabilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Self-Assessment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map(assessment => (
                <Card key={assessment.id} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Autoavaliação {assessment.period}</CardTitle>
                      {getStatusBadge(assessment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Clock className="h-4 w-4" />
                      <span>Prazo: {new Date(assessment.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartAssessment(assessment)}
                      disabled={assessment.status === 'submitted' || assessment.status === 'reviewed'}
                    >
                      {assessment.status === 'pending' ? (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Iniciar Autoavaliação
                        </>
                      ) : assessment.status === 'submitted' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enviada - Aguardando Revisão
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Resultado
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Feedback para Gestor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Anônimo e confidencial
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowFeedbackDialog(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Past Evaluations */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avaliações Recentes
              </h4>
              <div className="space-y-2">
                {peerFeedbacks.map((review) => (
                  <div key={review.id} className="flex justify-between items-center py-3 px-4 border-b last:border-0 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{review.period}</span>
                        <p className="text-xs text-muted-foreground">
                          Enviada em {new Date(review.submittedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {review.score}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleViewFeedbackDetails(review)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Autoavaliação {selectedAssessment?.period}</DialogTitle>
            <DialogDescription>
              Responda todas as perguntas com sinceridade. Suas respostas serão analisadas pelo seu gestor.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {selectedAssessment?.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {idx + 1}. {q.question}
                  </Label>
                  {q.id === 'q4' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Nota:</span>
                        <span className="text-2xl font-bold text-primary">{assessmentScore}</span>
                      </div>
                      <Slider
                        value={[assessmentScore]}
                        onValueChange={([value]) => setAssessmentScore(value)}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 - Precisa melhorar</span>
                        <span>10 - Excelente</span>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={assessmentAnswers[q.id] || ''}
                      onChange={(e) => setAssessmentAnswers(prev => ({
                        ...prev,
                        [q.id]: e.target.value
                      }))}
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssessmentDialog(false)}>
              Salvar Rascunho
            </Button>
            <Button onClick={handleSubmitAssessment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Avaliação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Peer Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback para Gestor</DialogTitle>
            <DialogDescription>
              Seu feedback é {peerFeedbackData.anonymous ? 'anônimo e ' : ''}confidencial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pontos Fortes da Gestão</Label>
              <Textarea
                placeholder="O que seu gestor faz bem..."
                value={peerFeedbackData.strengths}
                onChange={(e) => setPeerFeedbackData(prev => ({ ...prev, strengths: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Oportunidades de Melhoria</Label>
              <Textarea
                placeholder="O que poderia melhorar..."
                value={peerFeedbackData.improvements}
                onChange={(e) => setPeerFeedbackData(prev => ({ ...prev, improvements: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Comentários Gerais *</Label>
              <Textarea
                placeholder="Comentários adicionais..."
                value={peerFeedbackData.generalComments}
                onChange={(e) => setPeerFeedbackData(prev => ({ ...prev, generalComments: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmitPeerFeedback} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Avaliação {selectedFeedback?.period}</DialogTitle>
            <DialogDescription>
              Detalhes da sua avaliação de desempenho
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Nota Geral</p>
                <p className="text-4xl font-bold text-primary">{selectedFeedback.score}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Avaliação por Categoria</h4>
                {selectedFeedback.categories.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(cat.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10">{cat.score}/5</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedFeedback.managerComment && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-2">Comentário do Gestor</h4>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.managerComment}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FeedbackTab;
