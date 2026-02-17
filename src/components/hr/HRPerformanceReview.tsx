/**
 * HR Performance Review Component
 * Avaliação de Desempenho 360° com IA
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  Target, 
  TrendingUp, 
  MessageSquare, 
  Award,
  Users,
  Brain,
  Sparkles,
  ChevronRight,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PerformanceData {
  id: string;
  employee_name: string;
  role: string;
  department: string;
  avatar_url?: string;
  overall_score: number;
  competencies: {
    name: string;
    score: number;
    weight: number;
  }[];
  okrs: {
    objective: string;
    progress: number;
    key_results: string[];
  }[];
  feedbacks: {
    from: string;
    type: string;
    content: string;
    date: string;
  }[];
  nine_box: {
    performance: number;
    potential: number;
  };
}

export function HRPerformanceReview() {
  const [selectedEmployee, setSelectedEmployee] = useState<PerformanceData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newFeedback, setNewFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const { data: crewMembers } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, nationality, status, vessel_id')
        .limit(10);

      const { data: reviews } = await supabase
        .from('crew_performance_reviews')
        .select('*')
        .order('review_date', { ascending: false })
        .limit(20);

      if (crewMembers && crewMembers.length > 0) {
        const employees: PerformanceData[] = crewMembers.map(cm => {
          const memberReviews = reviews?.filter(r => r.crew_member_id === cm.id) || [];
          const avgScore = memberReviews.length > 0
            ? memberReviews.reduce((s, r) => s + (r.overall_score || 0), 0) / memberReviews.length
            : 3.5;

          return {
            id: cm.id,
            employee_name: cm.full_name || 'Sem nome',
            role: cm.rank || 'Tripulante',
            department: 'Operações Marítimas',
            overall_score: Math.round(avgScore * 10) / 10,
            competencies: [
              { name: "Liderança", score: Math.min(5, avgScore + 0.3), weight: 20 },
              { name: "Comunicação", score: Math.min(5, avgScore - 0.2), weight: 15 },
              { name: "Técnico", score: Math.min(5, avgScore + 0.6), weight: 30 },
              { name: "Trabalho em Equipe", score: Math.min(5, avgScore), weight: 20 },
              { name: "Segurança", score: Math.min(5, avgScore + 0.2), weight: 15 },
            ],
            okrs: [
              { objective: "Manter certificações em dia", progress: 85, key_results: ["STCW atualizado", "Certificados válidos"] },
              { objective: "Participar de treinamentos", progress: 60, key_results: ["Completar 3 cursos", "Score acima de 80%"] },
            ],
            feedbacks: memberReviews.slice(0, 3).map(r => ({
              from: r.reviewer_name || 'Avaliador',
              type: 'manager',
              content: r.strengths || r.improvement_areas || 'Sem comentários',
              date: r.review_date || new Date().toISOString().slice(0, 10),
            })),
            nine_box: {
              performance: Math.min(5, Math.round(avgScore)),
              potential: Math.min(5, Math.round(avgScore + 0.5)),
            },
          };
        });

        setSelectedEmployee(employees[0]);
      }
    } catch (error) {
      toast.error("Erro ao carregar avaliações de desempenho");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-success";
    if (score >= 3.5) return "text-primary";
    if (score >= 2.5) return "text-warning";
    return "text-destructive";
  };

  const getNineBoxPosition = (perf: number, pot: number) => {
    if (perf >= 4 && pot >= 4) return { label: "High Performer", color: "bg-success" };
    if (perf >= 4 && pot < 4) return { label: "Core Player", color: "bg-primary" };
    if (perf < 4 && pot >= 4) return { label: "Rising Star", color: "bg-accent" };
    return { label: "Development Needed", color: "bg-warning" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Avaliação de Desempenho</h2>
          <p className="text-muted-foreground">Ciclo Q1 2026 - Avaliação 360°</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Novo Ciclo
          </Button>
          <Button>
            <Brain className="mr-2 h-4 w-4" />
            Análise IA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Completas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127/150</div>
            <Progress value={85} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">85% concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">4.1 / 5.0</div>
            <p className="text-xs text-muted-foreground">+0.3 vs ciclo anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedbacks Enviados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">423</div>
            <p className="text-xs text-muted-foreground">Média: 3.2 por pessoa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">28</div>
            <p className="text-xs text-muted-foreground">18.7% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedEmployee && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Employee Profile */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.employee_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedEmployee.employee_name}</CardTitle>
                  <CardDescription>{selectedEmployee.role}</CardDescription>
                  <Badge variant="outline" className="mt-1">
                    {selectedEmployee.department}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className={`text-4xl font-bold ${getScoreColor(selectedEmployee.overall_score)}`}>
                  {selectedEmployee.overall_score.toFixed(1)}
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={`star-${i}`}
                      className={`h-5 w-5 ${i <= Math.round(selectedEmployee.overall_score) ? "fill-warning text-warning" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>

              {/* 9-Box Position */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Matriz 9-Box</span>
                  <Badge className={getNineBoxPosition(selectedEmployee.nine_box.performance, selectedEmployee.nine_box.potential).color}>
                    {getNineBoxPosition(selectedEmployee.nine_box.performance, selectedEmployee.nine_box.potential).label}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  {[3, 2, 1].map(row => (
                    [1, 2, 3].map(col => {
                      const isSelected = 
                        col === Math.ceil(selectedEmployee.nine_box.performance / 2) && 
                        row === Math.ceil(selectedEmployee.nine_box.potential / 2);
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`h-8 rounded ${isSelected ? "bg-primary" : "bg-muted"}`}
                        />
                      );
                    })
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Performance →</span>
                  <span>Potencial ↑</span>
                </div>
              </div>

              {/* Competencies */}
              <div className="space-y-3">
                <h4 className="font-medium">Competências</h4>
                {selectedEmployee.competencies.map((comp) => (
                  <div key={comp.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{comp.name}</span>
                      <span className={getScoreColor(comp.score)}>{comp.score.toFixed(1)}</span>
                    </div>
                    <Progress value={(comp.score / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Card className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="okrs">OKRs</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="pdi">PDI</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="space-y-4">
                  {/* AI Insights */}
                  <div className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-accent-foreground" />
                      <span className="font-medium">Insights da IA</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-success mt-0.5" />
                        <span>Forte candidata para promoção a Tech Lead nos próximos 6 meses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                        <span>Recomendado curso de gestão de conflitos para desenvolver soft skills</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-warning mt-0.5" />
                        <span>Salário 12% abaixo do mercado - revisar na próxima janela</span>
                      </li>
                    </ul>
                  </div>

                  {/* Performance Trend */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Evolução do Desempenho</h4>
                    <div className="flex items-end gap-2 h-32">
                      {[3.8, 4.0, 3.9, 4.1, 4.2].map((score, i) => (
                        <div key={`perf-q${i}`} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-primary rounded-t transition-all"
                            style={{ height: `${(score / 5) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="okrs" className="space-y-4">
                  {selectedEmployee.okrs.map((okr) => (
                    <div key={okr.objective} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="font-medium">{okr.objective}</span>
                        </div>
                        <Badge variant={okr.progress >= 70 ? "default" : "secondary"}>
                          {okr.progress}%
                        </Badge>
                      </div>
                      <Progress value={okr.progress} className="mb-3" />
                      <div className="space-y-2">
                        {okr.key_results.map((kr, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                            <span>{kr}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  {selectedEmployee.feedbacks.map((fb, i) => (
                    <div key={`fb-${i}-${fb.from}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{fb.from.split(" ")[0][0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-sm">{fb.from}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {fb.type === "manager" ? "Gestor" : "Par"}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{fb.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{fb.content}</p>
                    </div>
                  ))}
                  
                  {/* Add Feedback */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Adicionar Feedback</h4>
                    <Textarea 
                      placeholder="Escreva seu feedback..."
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      className="mb-2"
                    />
                    <Button size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Enviar Feedback
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="pdi" className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-3">Plano de Desenvolvimento Individual</h4>
                    <div className="space-y-4">
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Liderança de Equipes</span>
                          <Badge>Em andamento</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Desenvolver habilidades de gestão de pessoas e liderança situacional
                        </p>
                        <Progress value={45} className="h-2" />
                      </div>
                      
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Comunicação Executiva</span>
                          <Badge variant="outline">Planejado</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Curso de apresentações executivas e storytelling com dados
                        </p>
                        <Progress value={0} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    IA: Sugerir Desenvolvimento
                  </Button>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}
