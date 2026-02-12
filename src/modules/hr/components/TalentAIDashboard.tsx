/**
 * 🧠 Talent AI Dashboard
 * AI-powered HR talent management
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Users, TrendingUp, Heart, Target, Sparkles,
  Award, BarChart3, Zap, ChevronRight, UserCheck,
  GraduationCap, Activity, Shield, Clock, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useTalentMatch,
  useCareerPath,
  useWellnessAnalysis,
  useTeamDynamics,
  useTalentAnalytics,
  TalentMatchResult,
  CareerPath,
  WellnessAnalysis,
} from "../hooks/useTalentAI";
import { cn } from "@/lib/utils";

export function TalentAIDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: analytics, isLoading } = useTalentAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Talent AI
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Multi-IA
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Gestão inteligente de talentos com IA
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <KPICard
            title="Total Crew"
            value={analytics.totalCrew}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Ativos"
            value={analytics.activeCrew}
            icon={UserCheck}
            color="green"
          />
          <KPICard
            title="Retenção"
            value={`${analytics.retentionRate}%`}
            icon={TrendingUp}
            color="emerald"
          />
          <KPICard
            title="Tenure Médio"
            value={`${analytics.avgTenure}y`}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Skills"
            value={`${analytics.skillCoverage}%`}
            icon={Award}
            color="orange"
          />
          <KPICard
            title="Training"
            value={`${analytics.trainingCompletion}%`}
            icon={GraduationCap}
            color="cyan"
          />
          <KPICard
            title="Wellness"
            value={`${analytics.wellnessScore}/100`}
            icon={Heart}
            color="pink"
          />
          <KPICard
            title="Diversidade"
            value={`${Math.round(analytics.diversityIndex * 100)}%`}
            icon={Star}
            color="yellow"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="talent-match" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Talent Match
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Carreira
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wellness
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {analytics && <OverviewTab analytics={analytics} />}
        </TabsContent>

        <TabsContent value="talent-match">
          <TalentMatchTab />
        </TabsContent>

        <TabsContent value="career">
          <CareerPathTab />
        </TabsContent>

        <TabsContent value="wellness">
          <WellnessTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", `bg-${color}-500/20`)}>
            <Icon className={cn("h-4 w-4", `text-${color}-400`)} />
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

function OverviewTab({ analytics }: { analytics: Record<string, unknown> & { positionDistribution: { position: string; count: number }[]; totalCrew: number; trends?: Record<string, unknown> } }) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Distribuição por Cargo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.positionDistribution.slice(0, 6).map((item: { position: string; count: number }) => (
              <div key={item.position} className="flex items-center justify-between">
                <span className="text-sm">{item.position}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(item.count / analytics.totalCrew) * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-sm font-medium w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Tendências (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TrendLine 
              label="Retenção" 
              data={(analytics.trends?.retention as number[]) || []} 
              color="emerald" 
            />
            <TrendLine 
              label="Wellness" 
              data={(analytics.trends?.wellness as number[]) || []} 
              color="pink" 
            />
            <TrendLine 
              label="Training" 
              data={(analytics.trends?.training as number[]) || []} 
              color="blue" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendLine({ label, data, color }: { label: string; data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const current = data[data.length - 1];
  const trend = current > data[0] ? "up" : current < data[0] ? "down" : "stable";

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm w-20">{label}</span>
      <div className="flex-1 flex items-center gap-1">
        {data.map((value, i) => (
          <div
            key={i}
            className={cn("flex-1 rounded", `bg-${color}-500`)}
            style={{ 
              height: `${((value - min) / (max - min) * 20) + 8}px`,
              opacity: 0.4 + (i / data.length) * 0.6,
            }}
          />
        ))}
      </div>
      <Badge variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}>
        {current}%
      </Badge>
    </div>
  );
}

function TalentMatchTab() {
  const [selectedVessel, setSelectedVessel] = useState("");
  const { mutate: runMatch, isPending, data: matches } = useTalentMatch();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Talent Matching com IA
          </CardTitle>
          <CardDescription>
            Encontre a tripulação perfeita para cada posição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vessel-1">MV Atlantic Star</SelectItem>
                <SelectItem value="vessel-2">MV Pacific Dream</SelectItem>
                <SelectItem value="vessel-3">MV Ocean Spirit</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => runMatch({ vesselId: selectedVessel })}
              disabled={!selectedVessel || isPending}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              {isPending ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Encontrar Matches
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {matches && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {matches.map((match, index) => (
              <MatchCard key={match.crewMemberId} match={match} rank={index + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCard({ match, rank }: { match: TalentMatchResult; rank: number }) {
  const recConfig = {
    hire: { color: "green", label: "Recomendado" },
    consider: { color: "yellow", label: "Considerar" },
    pass: { color: "red", label: "Não Recomendado" },
  }[match.recommendation] || { color: "gray", label: match.recommendation };

  return (
    <Card className={rank === 1 ? "border-indigo-500/50" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
            rank === 1 ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" :
            rank === 2 ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" :
            rank === 3 ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" :
            "bg-muted"
          )}>
            #{rank}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{match.name}</h3>
              <Badge className={cn(`bg-${recConfig.color}-500`)}>
                {recConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Match Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={match.matchScore} className="h-2 flex-1" />
                  <span className="font-medium">{match.matchScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Team Compatibility</p>
                <div className="flex items-center gap-2">
                  <Progress value={match.teamCompatibility} className="h-2 flex-1" />
                  <span className="font-medium">{match.teamCompatibility}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pontos fortes: </span>
                {match.strengths.slice(0, 2).join(", ")}
              </div>
              {match.gaps.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Gaps: </span>
                  {match.gaps.slice(0, 2).join(", ")}
                </div>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CareerPathTab() {
  const [selectedCrew, setSelectedCrew] = useState("");
  const { mutate: generatePath, isPending, data: careerPath } = useCareerPath();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Plano de Carreira com IA
          </CardTitle>
          <CardDescription>
            Gere um plano de desenvolvimento personalizado de 5 anos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedCrew} onValueChange={setSelectedCrew}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar tripulante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crew-1">João Silva</SelectItem>
                <SelectItem value="crew-2">Maria Santos</SelectItem>
                <SelectItem value="crew-3">Pedro Costa</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => generatePath({ crewMemberId: selectedCrew })}
              disabled={!selectedCrew || isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isPending ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Plano
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {careerPath && <CareerPathView path={careerPath} />}
      </AnimatePresence>
    </div>
  );
}

function CareerPathView({ path }: { path: CareerPath }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" />
            Trajetória: {path.currentPosition} → {path.targetPosition}
          </CardTitle>
          <CardDescription>{path.estimatedSalaryGrowth}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-primary" />
            
            {path.timeline.map((milestone, milestoneIdx) => (
              <div key={`${milestone.year}-${milestone.position}`} className="relative pl-12 pb-8 last:pb-0">
                <div className={cn(
                  "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                  milestoneIdx === 0 ? "bg-accent text-accent-foreground" :
                  milestoneIdx === path.timeline.length - 1 ? "bg-primary text-primary-foreground" :
                  "bg-muted border-2 border-accent/50"
                )}>
                  {milestone.year}
                </div>
                
                <div>
                  <h4 className="font-medium">{milestone.position}</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    {milestone.actions.join(" • ")}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {milestone.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Plano de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {path.developmentPlan.map((item, devIdx) => (
              <div key={`dev-${devIdx}-${item.type}`} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className={cn(
                  "p-2 rounded-lg",
                  item.type === 'certification' ? "bg-primary/20" :
                  item.type === 'training' ? "bg-success/20" :
                  item.type === 'experience' ? "bg-warning/20" :
                  "bg-accent/20"
                )}>
                  {item.type === 'certification' ? <Award className="h-4 w-4 text-primary" /> :
                   item.type === 'training' ? <GraduationCap className="h-4 w-4 text-success" /> :
                   item.type === 'experience' ? <Target className="h-4 w-4 text-warning" /> :
                   <Users className="h-4 w-4 text-accent" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant={
                      item.priority === 'high' ? 'destructive' :
                      item.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deadline: {new Date(item.deadline).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WellnessTab() {
  const [selectedCrew, setSelectedCrew] = useState("");
  const { mutate: analyze, isPending, data: wellness } = useWellnessAnalysis();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            Análise de Wellness com IA
          </CardTitle>
          <CardDescription>
            Monitore o bem-estar e detecte riscos de burnout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedCrew} onValueChange={setSelectedCrew}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar tripulante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crew-1">João Silva</SelectItem>
                <SelectItem value="crew-2">Maria Santos</SelectItem>
                <SelectItem value="crew-3">Pedro Costa</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => analyze({ crewMemberId: selectedCrew })}
              disabled={!selectedCrew || isPending}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {isPending ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Analisando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Analisar Wellness
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {wellness && <WellnessView wellness={wellness} />}
      </AnimatePresence>
    </div>
  );
}

function WellnessView({ wellness }: { wellness: WellnessAnalysis }) {
  const stressConfig = {
    low: { color: "green", label: "Baixo" },
    medium: { color: "yellow", label: "Moderado" },
    high: { color: "orange", label: "Alto" },
    critical: { color: "red", label: "Crítico" },
  }[wellness.stressLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Overview */}
      <Card className={cn(
        "border-2",
        wellness.urgency === 'critical' ? "border-red-500" :
        wellness.urgency === 'high' ? "border-orange-500" :
        "border-transparent"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Wellness Score</p>
              <p className="text-4xl font-bold">{wellness.overallScore}</p>
            </div>
            <div className={cn(
              "p-4 rounded-full",
              `bg-${stressConfig.color}-500/20`
            )}>
              <Heart className={cn("h-8 w-8", `text-${stressConfig.color}-400`)} />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nível de Stress</span>
                <Badge className={cn(`bg-${stressConfig.color}-500`)}>
                  {stressConfig.label}
                </Badge>
              </div>
              <Progress value={100 - wellness.overallScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risco de Burnout</span>
                <span className="font-medium">{wellness.burnoutRisk}%</span>
              </div>
              <Progress value={wellness.burnoutRisk} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-green-400 mb-2">✅ Positivos</p>
              <ul className="space-y-1 text-sm">
                {wellness.positiveIndicators.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            {wellness.concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-orange-400 mb-2">⚠️ Preocupações</p>
                <ul className="space-y-1 text-sm">
                  {wellness.concerns.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wellness.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TalentAIDashboard;
