import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, Heart, Users, AlertTriangle, TrendingUp, 
  Activity, Zap, Shield, RefreshCw, Play, CheckCircle
} from "lucide-react";

interface QEScore {
  self_awareness: number;
  self_regulation: number;
  empathy: number;
  social_skills: number;
  motivation: number;
  total: number;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  qe_score?: QEScore;
  risk_level: "low" | "medium" | "high";
  last_assessment?: string;
}

const QE_QUESTIONS = [
  { id: 1, dimension: "self_awareness", question: "Consigo identificar minhas emoções quando estou sob pressão operacional" },
  { id: 2, dimension: "self_awareness", question: "Reconheço como minhas emoções afetam meu desempenho no trabalho" },
  { id: 3, dimension: "self_regulation", question: "Mantenho a calma em situações de emergência" },
  { id: 4, dimension: "self_regulation", question: "Consigo controlar reações impulsivas durante o turno" },
  { id: 5, dimension: "empathy", question: "Percebo quando um colega está passando por dificuldades" },
  { id: 6, dimension: "empathy", question: "Compreendo diferentes perspectivas da equipe" },
  { id: 7, dimension: "social_skills", question: "Comunico-me claramente durante passagem de turno" },
  { id: 8, dimension: "social_skills", question: "Resolvo conflitos de forma construtiva" },
  { id: 9, dimension: "motivation", question: "Mantenho-me motivado mesmo em turnos longos" },
  { id: 10, dimension: "motivation", question: "Busco constantemente melhorar minhas habilidades" },
];

const SafetyHumanFactors = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Demo data
  const [crewMembers] = useState<CrewMember[]>([
    {
      id: "1",
      name: "João Silva",
      role: "Capitão",
      qe_score: { self_awareness: 85, self_regulation: 78, empathy: 82, social_skills: 88, motivation: 90, total: 85 },
      risk_level: "low",
      last_assessment: "2024-12-15"
    },
    {
      id: "2",
      name: "Maria Santos",
      role: "Oficial de Máquinas",
      qe_score: { self_awareness: 72, self_regulation: 68, empathy: 75, social_skills: 70, motivation: 80, total: 73 },
      risk_level: "medium",
      last_assessment: "2024-12-20"
    },
    {
      id: "3",
      name: "Carlos Eduardo",
      role: "Operador DP",
      qe_score: { self_awareness: 60, self_regulation: 55, empathy: 65, social_skills: 58, motivation: 70, total: 62 },
      risk_level: "high",
      last_assessment: "2024-12-10"
    }
  ]);

  const humanFactors = [
    { name: "Fadiga", icon: Activity, incidents: 5, trend: "down" },
    { name: "Stress", icon: Zap, incidents: 3, trend: "up" },
    { name: "Comunicação", icon: Users, incidents: 2, trend: "stable" },
    { name: "Distração", icon: AlertTriangle, incidents: 4, trend: "down" },
  ];

  const handleStartAssessment = () => {
    setCurrentQuestion(0);
    setResponses({});
    setAssessmentResult(null);
    setIsAssessmentOpen(true);
  };

  const handleAnswer = (value: string) => {
    setResponses({ ...responses, [QE_QUESTIONS[currentQuestion].id]: parseInt(value) });
    
    if (currentQuestion < QE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("human-factors-assessment", {
        body: {
          crew_member: { id: "current-user", name: "Usuário Atual", role: "Tripulante" },
          assessment_type: "qi",
          responses
        }
      });

      if (error) throw error;

      setAssessmentResult(data);
      toast({
        title: "Avaliação Concluída",
        description: "Seu perfil de Quociente Emocional foi gerado."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar avaliação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      low: { variant: "default", label: "Baixo" },
      medium: { variant: "secondary", label: "Médio" },
      high: { variant: "destructive", label: "Alto" }
    };
    const { variant, label } = config[level] || { variant: "secondary" as const, label: level };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getQEColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Neurociência & Fatores Humanos"
        description="Avaliação de QE, fatores humanos e bem-estar da tripulação"
        gradient="purple"
        badges={[
          { icon: Heart, label: "Quociente Emocional" },
          { icon: Shield, label: "Segurança Comportamental" },
          { icon: TrendingUp, label: "Análise de Risco" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="qe">Avaliação QE</TabsTrigger>
            <TabsTrigger value="factors">Fatores Humanos</TabsTrigger>
            <TabsTrigger value="wellness">Bem-estar</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleStartAssessment}>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Avaliação QE
          </Button>
        </div>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">QE Médio da Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">73%</div>
                <Progress value={73} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tripulantes Avaliados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{crewMembers.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risco Alto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {crewMembers.filter(c => c.risk_level === "high").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Incidentes Humanos (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">14</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fatores Humanos em Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {humanFactors.map((factor) => (
                    <div key={factor.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <factor.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{factor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{factor.incidents}</span>
                        <Badge variant={factor.trend === "up" ? "destructive" : factor.trend === "down" ? "default" : "secondary"}>
                          {factor.trend === "up" ? "↑" : factor.trend === "down" ? "↓" : "→"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tripulantes por Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crewMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getQEColor(member.qe_score?.total || 0)}`}>
                          QE: {member.qe_score?.total || 0}%
                        </span>
                        {getRiskBadge(member.risk_level)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfis de Quociente Emocional</CardTitle>
              <CardDescription>Avaliação das 5 dimensões do QE por tripulante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {crewMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${getQEColor(member.qe_score?.total || 0)}`}>
                          {member.qe_score?.total || 0}%
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Última avaliação: {member.last_assessment ? new Date(member.last_assessment).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {member.qe_score && (
                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Autoconhecimento</p>
                          <Progress value={member.qe_score.self_awareness} className="mt-1" />
                          <p className="text-sm font-medium mt-1">{member.qe_score.self_awareness}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Autorregulação</p>
                          <Progress value={member.qe_score.self_regulation} className="mt-1" />
                          <p className="text-sm font-medium mt-1">{member.qe_score.self_regulation}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Empatia</p>
                          <Progress value={member.qe_score.empathy} className="mt-1" />
                          <p className="text-sm font-medium mt-1">{member.qe_score.empathy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hab. Sociais</p>
                          <Progress value={member.qe_score.social_skills} className="mt-1" />
                          <p className="text-sm font-medium mt-1">{member.qe_score.social_skills}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Motivação</p>
                          <Progress value={member.qe_score.motivation} className="mt-1" />
                          <p className="text-sm font-medium mt-1">{member.qe_score.motivation}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Fatores Humanos</CardTitle>
              <CardDescription>Fatores humanos identificados em incidentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { factor: "Fadiga/Cansaço", icon: "😴", count: 5 },
                    { factor: "Stress Operacional", icon: "😰", count: 3 },
                    { factor: "Falta de Atenção", icon: "🎯", count: 4 },
                    { factor: "Comunicação", icon: "💬", count: 2 },
                    { factor: "Excesso de Confiança", icon: "😎", count: 1 },
                    { factor: "Violação de Procedimento", icon: "⚠️", count: 2 },
                    { factor: "Problemas Pessoais", icon: "💔", count: 1 },
                    { factor: "Tomada de Risco", icon: "🎲", count: 1 },
                  ].map((item) => (
                    <Card key={item.factor} className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <span className="text-2xl">{item.icon}</span>
                        <p className="text-sm font-medium mt-2">{item.factor}</p>
                        <p className="text-2xl font-bold mt-1">{item.count}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Bem-estar</CardTitle>
              <CardDescription>Recomendações personalizadas para cada tripulante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewMembers.filter(c => c.risk_level !== "low").map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      {getRiskBadge(member.risk_level)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
                        <p className="font-medium text-blue-700 dark:text-blue-300">Exercícios Recomendados</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Respiração 4-7-8</li>
                          <li>• Mindfulness 5 min</li>
                          <li>• Alongamento</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
                        <p className="font-medium text-green-700 dark:text-green-300">Pausas Recomendadas</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• 10 min a cada 2h</li>
                          <li>• Descanso adequado</li>
                          <li>• Hidratação regular</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded">
                        <p className="font-medium text-purple-700 dark:text-purple-300">Suporte Disponível</p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Apoio psicológico</li>
                          <li>• Linha 24h</li>
                          <li>• Coaching individual</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QE Assessment Dialog */}
      <Dialog open={isAssessmentOpen} onOpenChange={setIsAssessmentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {assessmentResult ? "Resultado da Avaliação" : `Avaliação QE - Pergunta ${currentQuestion + 1}/${QE_QUESTIONS.length}`}
            </DialogTitle>
          </DialogHeader>
          
          {!assessmentResult ? (
            <div className="space-y-6 py-4">
              {!isLoading ? (
                <>
                  <Progress value={((currentQuestion + 1) / QE_QUESTIONS.length) * 100} />
                  
                  <p className="text-lg">{QE_QUESTIONS[currentQuestion].question}</p>
                  
                  <RadioGroup onValueChange={handleAnswer} className="space-y-3">
                    {[
                      { value: "1", label: "Discordo totalmente" },
                      { value: "2", label: "Discordo parcialmente" },
                      { value: "3", label: "Neutro" },
                      { value: "4", label: "Concordo parcialmente" },
                      { value: "5", label: "Concordo totalmente" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4">Analisando suas respostas com IA...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getQEColor(assessmentResult.scores?.total_qi || 70)}`}>
                  {assessmentResult.scores?.total_qi || 70}%
                </div>
                <p className="text-muted-foreground">Quociente Emocional</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Análise</h4>
                <p className="text-sm text-muted-foreground">
                  {assessmentResult.analysis?.substring(0, 300)}...
                </p>
              </div>
              
              {assessmentResult.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {assessmentResult.recommendations.slice(0, 3).map((rec: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button className="w-full" onClick={() => setIsAssessmentOpen(false)}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModulePageWrapper>
  );
};

export default SafetyHumanFactors;
