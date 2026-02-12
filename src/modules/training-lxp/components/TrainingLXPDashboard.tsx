/**
 * 🎓 Training LXP Dashboard
 * Adaptive Learning, Gamification, VR Training
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Brain, Gamepad2, Headset, Trophy, Zap,
  Target, BookOpen, Play, Star, Flame, Medal, Award,
  Clock, TrendingUp, Users, ChevronRight, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  useLearnerProfile,
  usePersonalizedCurriculum,
  useMicroLesson,
  useVRScenario,
  useGameProgress,
  useTrainingAnalytics,
  MicroLesson,
  PersonalizedCurriculum,
  VRScenario,
} from "../hooks/useTrainingLXP";
import { cn } from "@/lib/utils";

export function TrainingLXPDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: analytics, isLoading } = useTrainingAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-primary/20">
            <GraduationCap className="h-8 w-8 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Training LXP
              <Badge className="bg-gradient-to-r from-success to-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Adaptive AI
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Plataforma de aprendizagem adaptativa com IA
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPICard title="Cursos" value={analytics.totalCourses} icon={BookOpen} color="blue" />
          <KPICard title="Matrículas" value={analytics.totalEnrollments} icon={Users} color="green" />
          <KPICard title="Learners Ativos" value={analytics.activeLearners} icon={Brain} color="purple" />
          <KPICard title="Conclusão Média" value={`${analytics.avgCompletion}%`} icon={Target} color="emerald" />
          <KPICard title="Certificados" value={analytics.certificatesIssued} icon={Award} color="yellow" />
          <KPICard title="VR Sessions" value="135" icon={Headset} color="pink" />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="adaptive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Adaptive
          </TabsTrigger>
          <TabsTrigger value="microlearning" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Micro
          </TabsTrigger>
          <TabsTrigger value="vr" className="flex items-center gap-2">
            <Headset className="h-4 w-4" />
            VR/AR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab analytics={analytics ?? null} />
        </TabsContent>

        <TabsContent value="adaptive">
          <AdaptiveLearningTab />
        </TabsContent>

        <TabsContent value="microlearning">
          <MicrolearningTab />
        </TabsContent>

        <TabsContent value="vr">
          <VRTrainingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const kpiColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-primary/20", text: "text-primary" },
  green: { bg: "bg-success/20", text: "text-success" },
  purple: { bg: "bg-accent/20", text: "text-accent-foreground" },
  emerald: { bg: "bg-success/20", text: "text-success" },
  yellow: { bg: "bg-warning/20", text: "text-warning" },
  pink: { bg: "bg-destructive/20", text: "text-destructive" },
};

function KPICard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colors = kpiColorMap[color] || kpiColorMap.blue;
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.text)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- analytics from useTrainingAnalytics hook has dynamic shape
function OverviewTab({ analytics }: { analytics: Record<string, unknown> | null }) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Top Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analytics.topCourses as Array<{ id: string; name: string; enrollments: number }>).map((course, i: number) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 ? "bg-warning text-warning-foreground" :
                  i === 1 ? "bg-muted text-muted-foreground" :
                  i === 2 ? "bg-accent text-accent-foreground" :
                  "bg-muted"
                )}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm truncate">{course.name}</span>
                <Badge variant="secondary">{course.enrollments}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VR Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headset className="h-5 w-5 text-accent-foreground" />
            Cenários VR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analytics.vrScenarios as Array<{ id: string; name: string; completions: number }>).map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between">
                <span className="text-sm">{scenario.name}</span>
                <div className="flex items-center gap-2">
                  <Progress value={(scenario.completions / 60) * 100} className="w-20 h-2" />
                  <span className="text-sm font-medium">{scenario.completions}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gamification Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-success" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Carlos M.", xp: 2450, level: 8, streak: 15 },
              { name: "Ana S.", xp: 2200, level: 7, streak: 12 },
              { name: "Pedro L.", xp: 1980, level: 6, streak: 8 },
              { name: "Maria F.", xp: 1750, level: 5, streak: 20 },
            ].map((learner, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 ? "bg-gradient-to-r from-warning to-warning text-warning-foreground" :
                  i === 1 ? "bg-gradient-to-r from-muted to-muted text-muted-foreground" :
                  i === 2 ? "bg-gradient-to-r from-warning to-warning text-warning-foreground" :
                  "bg-muted"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{learner.name}</p>
                  <p className="text-xs text-muted-foreground">Level {learner.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{learner.xp} XP</p>
                  <p className="text-xs text-warning flex items-center gap-1">
                    <Flame className="h-3 w-3" /> {learner.streak}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdaptiveLearningTab() {
  const [objective, setObjective] = useState("");
  const { mutate: buildProfile, isPending: buildingProfile, data: profile } = useLearnerProfile();
  const { mutate: generateCurriculum, isPending: generating, data: curriculum } = usePersonalizedCurriculum();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-success" />
            Adaptive Learning Engine
          </CardTitle>
          <CardDescription>
            Currículo personalizado baseado no seu perfil de aprendizagem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={() => buildProfile({ learnerId: "demo-learner" })}
              disabled={buildingProfile}
              variant="outline"
            >
              {buildingProfile ? "Analisando..." : "🧠 Criar Perfil"}
            </Button>

            <Input
              placeholder="Objetivo: Ex: STCW Avançado, Safety Officer..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="flex-1"
            />

            <Button
              onClick={() => generateCurriculum({ learnerId: "demo-learner", objective })}
              disabled={!objective || generating}
              className="bg-gradient-to-r from-success to-primary"
            >
              {generating ? "Gerando..." : "📚 Gerar Currículo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil de Aprendizagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {Object.entries(profile.learningStyle).map(([style, value]) => (
                    <div key={style} className="text-center">
                      <div className="text-2xl font-bold">{value}%</div>
                      <div className="text-xs text-muted-foreground capitalize">{style}</div>
                      <Progress value={value as number} className="h-1 mt-1" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge>Nível: {profile.currentLevel}</Badge>
                  <Badge variant="secondary">Ritmo: {profile.preferredPace}</Badge>
                  <Badge variant="outline">Horário: {profile.optimalStudyTime}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {curriculum && <CurriculumView curriculum={curriculum} />}
      </AnimatePresence>
    </div>
  );
}

function CurriculumView({ curriculum }: { curriculum: PersonalizedCurriculum }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {curriculum.title}
          </CardTitle>
          <CardDescription>
            {curriculum.estimatedHours}h estimadas | {curriculum.modules.length} módulos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {curriculum.modules.map((module) => (
              <div key={module.order} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                  {module.order}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{module.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {module.type} • {module.duration}
                  </p>
                </div>
                <Badge variant="outline">{module.assessment}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MicrolearningTab() {
  const [topic, setTopic] = useState("");
  const { mutate: createLesson, isPending, data: lesson } = useMicroLesson();
  const { mutate: updateProgress } = useGameProgress();
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSubmitQuiz = () => {
    if (!lesson) return;
    const correct = lesson.quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
    const score = (correct / lesson.quiz.length) * 100;
    
    updateProgress({
      learnerId: "demo-learner",
      xpGained: Math.round(lesson.xpReward * (score / 100)),
      completedLesson: lesson.id,
    });
    setShowResults(true);
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Microlearning Generator
          </CardTitle>
          <CardDescription>
            Crie micro-aulas de 5-7 minutos sobre qualquer tópico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Tópico: Ex: Fire Safety, Navigation Rules..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                createLesson({ topic });
                setQuizAnswers({});
                setShowResults(false);
              }}
              disabled={!topic || isPending}
              className="bg-gradient-to-r from-warning to-warning"
            >
              {isPending ? "Criando..." : "⚡ Criar Micro-aula"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {lesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{lesson.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning text-warning-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      {lesson.xpReward} XP
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {lesson.estimatedMinutes} min
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="font-medium text-warning">🎯 Hook</p>
                  <p className="text-sm">{lesson.hook}</p>
                </div>

                <div>
                  <p className="font-medium mb-2">📖 Conceito</p>
                  <p className="text-sm text-muted-foreground">{lesson.concept}</p>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Exemplos Práticos</p>
                  <ul className="space-y-1">
                    {lesson.examples.map((ex, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-success">🚀 Aplicação</p>
                  <p className="text-sm">{lesson.application}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quiz */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Quiz Rápido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.quiz.map((q, qIndex) => (
                  <div key={q.question} className="space-y-2">
                    <p className="font-medium">{qIndex + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIndex) => (
                        <Button
                          key={opt}
                          variant={quizAnswers[qIndex] === optIndex ? "default" : "outline"}
                          className={cn(
                            "justify-start",
                            showResults && optIndex === q.correctIndex && "bg-success",
                            showResults && quizAnswers[qIndex] === optIndex && optIndex !== q.correctIndex && "bg-destructive"
                          )}
                          onClick={() => !showResults && setQuizAnswers({ ...quizAnswers, [qIndex]: optIndex })}
                          disabled={showResults}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {showResults && (
                      <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {!showResults && (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length !== lesson.quiz.length}
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    Enviar Respostas
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VRTrainingTab() {
  const { mutate: loadScenario, isPending, data: scenario } = useVRScenario();

  const scenarios = [
    { id: "fire-fighting", name: "🔥 Fire Fighting", description: "Engine room fire response" },
    { id: "abandon-ship", name: "🚢 Abandon Ship", description: "Emergency evacuation drill" },
    { id: "medical-emergency", name: "🏥 Medical Emergency", description: "CPR and AED training" },
  ];

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headset className="h-5 w-5 text-accent-foreground" />
            VR/AR Training Scenarios
          </CardTitle>
          <CardDescription>
            Treinamento imersivo em cenários de emergência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => loadScenario({ scenarioType: s.id })}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-2">{s.name.split(" ")[0]}</div>
                  <h3 className="font-medium">{s.name.slice(2)}</h3>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                  <Button size="sm" className="mt-3" disabled={isPending}>
                    <Play className="h-4 w-4 mr-1" />
                    Start VR
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {scenario && <VRScenarioView scenario={scenario} />}
      </AnimatePresence>
    </div>
  );
}

function VRScenarioView({ scenario }: { scenario: VRScenario }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{scenario.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-accent text-accent-foreground">
                <Star className="h-3 w-3 mr-1" />
                {scenario.xpReward} XP
              </Badge>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {scenario.duration}
              </Badge>
            </div>
          </div>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment */}
          <div className="p-4 rounded-lg bg-accent/10">
            <p className="font-medium mb-2">🌍 Environment</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">📍 {scenario.environment.location}</Badge>
              {scenario.environment.visibility && (
                <Badge variant="outline">👁️ Visibility: {scenario.environment.visibility}</Badge>
              )}
              {scenario.environment.conditions && (
                <Badge variant="outline">🌊 {scenario.environment.conditions}</Badge>
              )}
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Hazards: </span>
              {scenario.environment.hazards.map((h) => (
                <Badge key={h} variant="destructive" className="mr-1 text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <p className="font-medium mb-2">🎯 Objectives</p>
            <div className="space-y-2">
              {scenario.objectives.map((obj) => (
                <div key={obj.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {obj.weight}%
                  </div>
                  <span className="text-sm">{obj.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button className="w-full bg-gradient-to-r from-accent to-destructive" size="lg">
            <Headset className="h-5 w-5 mr-2" />
            Launch VR Experience
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Passing score: {scenario.passingScore}% | Requires VR headset
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TrainingLXPDashboard;
