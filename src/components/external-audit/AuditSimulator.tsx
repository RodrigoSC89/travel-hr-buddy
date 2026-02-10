/**
 * Audit Simulator - Full Implementation
 * Simulates external maritime audits (ISM, ISPS, MLC 2006)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ClipboardCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Ship,
  Shield,
  Users,
  Calendar,
  Clock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditQuestion {
  id: string;
  category: string;
  question: string;
  regulation: string;
  status: 'pending' | 'compliant' | 'non-compliant' | 'observation';
  evidence?: string;
}

const auditTemplates = [
  { id: 'ism', name: 'ISM Code', icon: Ship, questions: 42, duration: '4-6 horas' },
  { id: 'isps', name: 'ISPS Code', icon: Shield, questions: 38, duration: '3-4 horas' },
  { id: 'mlc', name: 'MLC 2006', icon: Users, questions: 56, duration: '6-8 horas' },
  { id: 'solas', name: 'SOLAS', icon: ClipboardCheck, questions: 64, duration: '8-10 horas' },
];

const fallbackQuestions: AuditQuestion[] = [
  { id: '1', category: 'SMS Documentation', question: 'O Manual do Sistema de Gestão de Segurança está atualizado e aprovado?', regulation: 'ISM 11.2', status: 'pending' },
  { id: '2', category: 'SMS Documentation', question: 'Existe política de segurança e proteção ambiental documentada?', regulation: 'ISM 2.1', status: 'pending' },
  { id: '3', category: 'Crew Competence', question: 'Todos os tripulantes possuem certificados STCW válidos?', regulation: 'STCW I/2', status: 'pending' },
  { id: '4', category: 'Crew Competence', question: 'O treinamento de familiarização foi realizado para todos os novos tripulantes?', regulation: 'ISM 6.3', status: 'pending' },
  { id: '5', category: 'Emergency Preparedness', question: 'Os exercícios de abandono são realizados mensalmente?', regulation: 'SOLAS III/19', status: 'pending' },
  { id: '6', category: 'Emergency Preparedness', question: 'O plano de contingência está atualizado e acessível?', regulation: 'ISM 8', status: 'pending' },
  { id: '7', category: 'Maintenance', question: 'O sistema de manutenção planejada está sendo seguido?', regulation: 'ISM 10.2', status: 'pending' },
  { id: '8', category: 'Maintenance', question: 'Os equipamentos críticos de segurança estão em bom estado?', regulation: 'ISM 10.3', status: 'pending' },
];

export function AuditSimulator() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startSimulation = (templateId: string) => {
    setSelectedTemplate(templateId);
    setQuestions(fallbackQuestions.map(q => ({ ...q, status: 'pending' })));
    setCurrentQuestionIndex(0);
    setElapsedTime(0);
    setIsRunning(true);
    toast({
      title: "🚀 Simulação Iniciada",
      description: `Auditoria ${templateId.toUpperCase()} em andamento`,
    });
  };

  const handleAnswer = (status: 'compliant' | 'non-compliant' | 'observation') => {
    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex ? { ...q, status } : q
    ));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsRunning(false);
      toast({
        title: "✅ Simulação Concluída",
        description: "Revise os resultados no relatório",
      });
    }
  };

  const resetSimulation = () => {
    setSelectedTemplate(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setElapsedTime(0);
    setIsRunning(false);
  };

  const getStats = () => {
    const compliant = questions.filter(q => q.status === 'compliant').length;
    const nonCompliant = questions.filter(q => q.status === 'non-compliant').length;
    const observations = questions.filter(q => q.status === 'observation').length;
    const pending = questions.filter(q => q.status === 'pending').length;
    const total = questions.length;
    const progress = total > 0 ? ((total - pending) / total) * 100 : 0;
    const score = total > 0 ? (compliant / total) * 100 : 0;
    return { compliant, nonCompliant, observations, pending, progress, score };
  };

  const stats = getStats();

  if (!selectedTemplate) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Simulador de Auditoria Externa</h1>
          <p className="text-muted-foreground">
            Prepare sua embarcação para auditorias reais simulando inspeções completas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auditTemplates.map((template) => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <template.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.questions} questões</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duração: {template.duration}</span>
                </div>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => startSimulation(template.id)}
                >
                  <Play className="h-4 w-4" />
                  Iniciar Simulação
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Benefícios do Simulador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold">🎯 Preparação Completa</h4>
                <p className="text-sm text-muted-foreground">
                  Identifique gaps de conformidade antes da auditoria real
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">📊 Relatórios Detalhados</h4>
                <p className="text-sm text-muted-foreground">
                  Receba análise completa com recomendações de correção
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🔄 Treinamento Contínuo</h4>
                <p className="text-sm text-muted-foreground">
                  Treine sua equipe para responder com confiança
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Simulação {selectedTemplate.toUpperCase()}</h1>
          <p className="text-muted-foreground">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{questions[currentQuestionIndex]?.category}</Badge>
                <Badge>{questions[currentQuestionIndex]?.regulation}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium">
                {questions[currentQuestionIndex]?.question}
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAnswer('compliant')}
                  disabled={!isRunning}
                >
                  <CheckCircle className="h-4 w-4" />
                  Conforme
                </Button>
                <Button 
                  variant="outline"
                  className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => handleAnswer('observation')}
                  disabled={!isRunning}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Observação
                </Button>
                <Button 
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleAnswer('non-compliant')}
                  disabled={!isRunning}
                >
                  <XCircle className="h-4 w-4" />
                  Não Conforme
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progresso da Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.progress} className="h-3" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{Math.round(stats.progress)}% concluído</span>
                <span>{questions.length - stats.pending} de {questions.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Conforme
                </span>
                <Badge variant="secondary">{stats.compliant}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Observações
                </span>
                <Badge variant="secondary">{stats.observations}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Não Conforme
                </span>
                <Badge variant="secondary">{stats.nonCompliant}</Badge>
              </div>
              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{Math.round(stats.score)}%</p>
                  <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questões Respondidas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div 
                      key={q.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer hover:bg-muted/50 ${
                        idx === currentQuestionIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => setCurrentQuestionIndex(idx)}
                    >
                      {q.status === 'compliant' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {q.status === 'non-compliant' && <XCircle className="h-4 w-4 text-red-600" />}
                      {q.status === 'observation' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {q.status === 'pending' && <div className="h-4 w-4 rounded-full border-2" />}
                      <span className="truncate">Q{idx + 1}: {q.regulation}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}