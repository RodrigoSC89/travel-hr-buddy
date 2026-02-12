/**
 * HR Climate Survey Component
 * Pesquisa de Clima e Pulso com IA
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smile, 
  Meh, 
  Frown,
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Sparkles,
  MessageSquare,
  BarChart3,
  Calendar,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from "lucide-react";

interface PulseResponse {
  question: string;
  responses: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trend: "up" | "down" | "stable";
  change: number;
}

const pulseData: PulseResponse[] = [
  {
    question: "Como você está se sentindo no trabalho esta semana?",
    responses: { positive: 68, neutral: 22, negative: 10 },
    trend: "up",
    change: 5,
  },
  {
    question: "Você tem clareza sobre suas prioridades?",
    responses: { positive: 75, neutral: 18, negative: 7 },
    trend: "stable",
    change: 0,
  },
  {
    question: "Você sente que seu trabalho é reconhecido?",
    responses: { positive: 52, neutral: 28, negative: 20 },
    trend: "down",
    change: -8,
  },
];

const departmentScores = [
  { name: "Tecnologia", score: 78, employees: 45, trend: "up" },
  { name: "Operações", score: 72, employees: 120, trend: "stable" },
  { name: "RH", score: 85, employees: 12, trend: "up" },
  { name: "Financeiro", score: 68, employees: 18, trend: "down" },
  { name: "Comercial", score: 71, employees: 35, trend: "stable" },
];

export function HRClimateSurvey() {
  const [activeTab, setActiveTab] = useState("pulse");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");

  const pulseQuestions = [
    "Como você está se sentindo no trabalho esta semana?",
    "Você tem os recursos necessários para fazer seu trabalho?",
    "Você se sente apoiado pelo seu gestor?",
  ];

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    if (currentQuestion < pulseQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
  };

  const overallENPS = 72;
  const participationRate = 87;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pesquisa de Clima</h2>
          <p className="text-muted-foreground">Pulsos semanais e análise de satisfação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Criar Pesquisa
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Relatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eNPS</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+{overallENPS}</div>
            <p className="text-xs text-muted-foreground">+5 vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <Progress value={participationRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Geral</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5</div>
            <p className="text-xs text-muted-foreground">Média das respostas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas de Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">3</div>
            <p className="text-xs text-muted-foreground">Precisam de ação</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pulse">Pulso Semanal</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pulse" className="space-y-4 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Answer Pulse */}
            <Card>
              <CardHeader>
                <CardTitle>Responda o Pulso</CardTitle>
                <CardDescription>3 perguntas rápidas (30 segundos)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2 mb-4">
                  {pulseQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-12 rounded-full ${
                        i < currentQuestion ? "bg-primary" :
                        i === currentQuestion ? "bg-primary/50" :
                        "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="text-center space-y-6">
                  <h3 className="font-medium text-lg">
                    {pulseQuestions[currentQuestion]}
                  </h3>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleAnswer("negative")}
                      className={`p-6 rounded-2xl transition-all hover:scale-110 ${
                        answers[currentQuestion] === "negative" 
                          ? "bg-red-500/20 ring-2 ring-red-500" 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Frown className="h-12 w-12 text-red-500" />
                    </button>
                    <button
                      onClick={() => handleAnswer("neutral")}
                      className={`p-6 rounded-2xl transition-all hover:scale-110 ${
                        answers[currentQuestion] === "neutral" 
                          ? "bg-yellow-500/20 ring-2 ring-yellow-500" 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Meh className="h-12 w-12 text-yellow-500" />
                    </button>
                    <button
                      onClick={() => handleAnswer("positive")}
                      className={`p-6 rounded-2xl transition-all hover:scale-110 ${
                        answers[currentQuestion] === "positive" 
                          ? "bg-green-500/20 ring-2 ring-green-500" 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Smile className="h-12 w-12 text-green-500" />
                    </button>
                  </div>
                </div>

                {currentQuestion === pulseQuestions.length - 1 && answers[currentQuestion] && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Quer adicionar algum comentário? (opcional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Respostas
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Results */}
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Semana</CardTitle>
                <CardDescription>Respostas agregadas do time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pulseData.map((pulse) => (
                  <div key={pulse.question} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{pulse.question}</p>
                      <div className="flex items-center gap-1">
                        {pulse.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : pulse.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={`text-xs ${
                          pulse.change > 0 ? "text-green-500" :
                          pulse.change < 0 ? "text-red-500" :
                          "text-muted-foreground"
                        }`}>
                          {pulse.change > 0 ? "+" : ""}{pulse.change}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 transition-all"
                        style={{ width: `${pulse.responses.positive}%` }}
                      />
                      <div 
                        className="bg-yellow-500 transition-all"
                        style={{ width: `${pulse.responses.neutral}%` }}
                      />
                      <div 
                        className="bg-red-500 transition-all"
                        style={{ width: `${pulse.responses.negative}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Smile className="h-3 w-3 text-green-500" />
                        {pulse.responses.positive}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Meh className="h-3 w-3 text-yellow-500" />
                        {pulse.responses.neutral}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Frown className="h-3 w-3 text-red-500" />
                        {pulse.responses.negative}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-4">
          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Satisfação por Departamento</CardTitle>
              <CardDescription>Comparativo de áreas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentScores.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{dept.name}</div>
                    <div className="flex-1">
                      <Progress value={dept.score} className="h-3" />
                    </div>
                    <div className="w-12 text-right font-bold">{dept.score}</div>
                    <div className="w-8">
                      {dept.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : dept.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                    <Badge variant="outline" className="w-16 justify-center">
                      {dept.employees}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Heatmap by Question */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Calor por Tema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div></div>
                {["Tec", "Ops", "RH", "Fin", "Com"].map(d => (
                  <div key={d} className="text-center font-medium">{d}</div>
                ))}
                {[
                  { tema: "Liderança", scores: [82, 75, 90, 65, 72] },
                  { tema: "Crescimento", scores: [78, 68, 85, 70, 75] },
                  { tema: "Reconhecimento", scores: [65, 72, 88, 55, 68] },
                  { tema: "Colaboração", scores: [85, 80, 92, 78, 82] },
                  { tema: "Recursos", scores: [72, 65, 82, 75, 70] },
                ].map(row => (
                  <>
                    <div key={row.tema} className="font-medium py-2">{row.tema}</div>
                    {row.scores.map((score, i) => (
                      <div
                        key={i}
                        className={`py-2 text-center rounded ${
                          score >= 80 ? "bg-green-500/30 text-green-700" :
                          score >= 70 ? "bg-blue-500/30 text-blue-700" :
                          score >= 60 ? "bg-yellow-500/30 text-yellow-700" :
                          "bg-red-500/30 text-red-700"
                        }`}
                      >
                        {score}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Análise de IA - Clima Organizacional</CardTitle>
                  <CardDescription>Insights gerados automaticamente dos feedbacks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-red-500">Ponto Crítico</span>
                  </div>
                  <p className="text-sm">
                    <strong>Financeiro</strong> apresenta queda de 12 pontos em reconhecimento. 
                    Análise de comentários indica frustração com falta de feedback do gestor direto.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Ver Detalhes
                  </Button>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-500">Destaque Positivo</span>
                  </div>
                  <p className="text-sm">
                    <strong>RH</strong> atingiu 92 pontos em colaboração - maior score da história. 
                    Menções frequentes ao programa de mentoria lançado em novembro.
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-blue-500">Tema Emergente</span>
                  </div>
                  <p className="text-sm">
                    15% dos comentários mencionam "home office" e "flexibilidade". 
                    Considere revisar política de trabalho remoto.
                  </p>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-purple-500">Recomendação IA</span>
                  </div>
                  <p className="text-sm">
                    Baseado nos padrões, sugiro reunião 1-on-1 entre CEO e time Financeiro 
                    para discutir percepção de reconhecimento. Impacto estimado: +8 pontos eNPS.
                  </p>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-3">Análise de Sentimento - Comentários</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Positivo</span>
                      <span>58%</span>
                    </div>
                    <Progress value={58} className="h-2 bg-muted [&>div]:bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Neutro</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="h-2 bg-muted [&>div]:bg-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Negativo</span>
                      <span>14%</span>
                    </div>
                    <Progress value={14} className="h-2 bg-muted [&>div]:bg-red-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do eNPS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {[58, 62, 65, 60, 68, 72, 70, 75, 72].map((score, i) => (
                  <div key={`enps-${i}-${score}`} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{score}</span>
                    <div 
                      className={`w-full rounded-t transition-all ${
                        score >= 70 ? "bg-green-500" :
                        score >= 50 ? "bg-blue-500" :
                        "bg-yellow-500"
                      }`}
                      style={{ height: `${(score / 100) * 150}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {["Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
