/**
 * Crew Wellness Hub - Centro de Bem-Estar da Tripulação
 * Saúde mental, física e conformidade MLC 2006
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Heart, Brain, Activity, Users, Smile, Frown, Meh,
  Moon, Sun, Coffee, Dumbbell, MessageCircle, Phone,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Calendar, Clock, Star, ThumbsUp, Shield, Award,
  Sparkles, Send, PieChart, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  wellnessScore: number;
  restHoursCompliance: number;
  moodTrend: "up" | "down" | "stable";
  lastCheckIn: string;
  alerts: string[];
}

const CREW_WELLNESS: CrewMember[] = [
  {
    id: "1",
    name: "Carlos Silva",
    role: "Capitão",
    wellnessScore: 92,
    restHoursCompliance: 100,
    moodTrend: "stable",
    lastCheckIn: "2024-01-15T08:00:00",
    alerts: []
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Oficial de Convés",
    wellnessScore: 78,
    restHoursCompliance: 95,
    moodTrend: "down",
    lastCheckIn: "2024-01-14T20:00:00",
    alerts: ["Horas de descanso abaixo do ideal"]
  },
  {
    id: "3",
    name: "João Costa",
    role: "Chefe de Máquinas",
    wellnessScore: 85,
    restHoursCompliance: 100,
    moodTrend: "up",
    lastCheckIn: "2024-01-15T06:00:00",
    alerts: []
  },
  {
    id: "4",
    name: "Ana Oliveira",
    role: "Cozinheira",
    wellnessScore: 65,
    restHoursCompliance: 88,
    moodTrend: "down",
    lastCheckIn: "2024-01-13T18:00:00",
    alerts: ["Check-in atrasado", "Score de bem-estar baixo"]
  },
];

const wellnessRadarData = [
  { subject: "Sono", A: 85, fullMark: 100 },
  { subject: "Exercício", A: 72, fullMark: 100 },
  { subject: "Nutrição", A: 90, fullMark: 100 },
  { subject: "Social", A: 65, fullMark: 100 },
  { subject: "Mental", A: 78, fullMark: 100 },
  { subject: "Físico", A: 82, fullMark: 100 },
];

const moodDistribution = [
  { name: "Excelente", value: 35, color: "#22c55e" },
  { name: "Bom", value: 40, color: "#3b82f6" },
  { name: "Neutro", value: 15, color: "#f59e0b" },
  { name: "Baixo", value: 10, color: "#ef4444" },
];

const weeklyActivities = [
  { day: "Seg", exercise: 45, sleep: 7.5, social: 2 },
  { day: "Ter", exercise: 30, sleep: 6.8, social: 1.5 },
  { day: "Qua", exercise: 60, sleep: 8.0, social: 3 },
  { day: "Qui", exercise: 0, sleep: 7.2, social: 2 },
  { day: "Sex", exercise: 45, sleep: 7.0, social: 2.5 },
  { day: "Sáb", exercise: 30, sleep: 8.5, social: 4 },
  { day: "Dom", exercise: 60, sleep: 9.0, social: 5 },
];

export default function CrewWellnessHub() {
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [checkInNotes, setCheckInNotes] = useState("");

  const overallStats = {
    averageWellness: Math.round(CREW_WELLNESS.reduce((acc, c) => acc + c.wellnessScore, 0) / CREW_WELLNESS.length),
    restCompliance: Math.round(CREW_WELLNESS.reduce((acc, c) => acc + c.restHoursCompliance, 0) / CREW_WELLNESS.length),
    alertCount: CREW_WELLNESS.reduce((acc, c) => acc + c.alerts.length, 0),
    checkInRate: 85,
  };

  const handleCheckIn = () => {
    if (selectedMood === null) {
      toast.error("Selecione como você está se sentindo");
      return;
    }
    toast.success("Check-in registrado com sucesso!");
    setShowCheckInDialog(false);
    setSelectedMood(null);
    setCheckInNotes("");
  };

  const moodEmojis = [
    { value: 1, icon: Frown, label: "Muito Baixo", color: "text-destructive" },
    { value: 2, icon: Frown, label: "Baixo", color: "text-warning" },
    { value: 3, icon: Meh, label: "Neutro", color: "text-warning" },
    { value: 4, icon: Smile, label: "Bom", color: "text-info" },
    { value: 5, icon: Smile, label: "Excelente", color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bem-Estar Médio</p>
                  <p className="text-3xl font-bold text-success">{overallStats.averageWellness}%</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +3% vs semana anterior
                  </p>
                </div>
                <Heart className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">MLC Rest Hours</p>
                  <p className="text-2xl font-bold">{overallStats.restCompliance}%</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Conforme
                  </p>
                </div>
                <Moon className="h-8 w-8 text-info opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taxa Check-in</p>
                  <p className="text-2xl font-bold">{overallStats.checkInRate}%</p>
                  <p className="text-xs text-muted-foreground">Últimas 24h</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={overallStats.alertCount > 0 ? "border-warning/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alertas Ativos</p>
                  <p className="text-2xl font-bold text-warning">{overallStats.alertCount}</p>
                  <p className="text-xs text-muted-foreground">Atenção necessária</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4">
              <Button 
                className="w-full h-full gap-2" 
                onClick={() => setShowCheckInDialog(true)}
              >
                <Smile className="h-5 w-5" />
                Fazer Check-in
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Perfil de Bem-Estar
            </CardTitle>
            <CardDescription>Análise multidimensional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={wellnessRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button variant="outline" size="sm" className="gap-1">
                <Dumbbell className="h-3 w-3" />
                Exercício
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Moon className="h-3 w-3" />
                Sono
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Coffee className="h-3 w-3" />
                Nutrição
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-warning" />
              Distribuição de Humor
            </CardTitle>
            <CardDescription>Tripulação nas últimas 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {moodDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card className="bg-gradient-to-br from-info/5 to-primary/5 border-info/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-info" />
              Recursos de Apoio
            </CardTitle>
            <CardDescription>Suporte 24/7 disponível</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start gap-3 h-12" 
              variant="outline"
              onClick={() => setShowSupportDialog(true)}
            >
              <div className="p-2 rounded-lg bg-success/10">
                <MessageCircle className="h-4 w-4 text-success" />
              </div>
              <div className="text-left">
                <p className="font-medium">Chat Confidencial</p>
                <p className="text-xs text-muted-foreground">Fale com um profissional</p>
              </div>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <div className="p-2 rounded-lg bg-info/10">
                <Phone className="h-4 w-4 text-info" />
              </div>
              <div className="text-left">
                <p className="font-medium">Linha de Apoio</p>
                <p className="text-xs text-muted-foreground">+55 11 9999-8888</p>
              </div>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Exercícios de Mindfulness</p>
                <p className="text-xs text-muted-foreground">Meditação guiada</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Crew List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Status da Tripulação
              </CardTitle>
              <CardDescription>
                Monitoramento individual de bem-estar
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Enviar Lembrete Coletivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREW_WELLNESS.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={member.alerts.length > 0 ? "border-warning/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.moodTrend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : member.moodTrend === "down" ? (
                              <TrendingDown className="h-4 w-4 text-warning" />
                            ) : (
                              <Activity className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={`text-lg font-bold ${
                              member.wellnessScore >= 80 ? "text-success" :
                              member.wellnessScore >= 60 ? "text-warning" : "text-destructive"
                            }`}>
                              {member.wellnessScore}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Bem-estar</span>
                              <span>{member.wellnessScore}%</span>
                            </div>
                            <Progress 
                              value={member.wellnessScore} 
                              className={`h-1.5 ${
                                member.wellnessScore >= 80 ? "[&>div]:bg-success" :
                                member.wellnessScore >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Moon className="h-3 w-3" />
                                Rest Hours MLC
                              </span>
                              <span>{member.restHoursCompliance}%</span>
                            </div>
                            <Progress value={member.restHoursCompliance} className="h-1.5" />
                          </div>
                        </div>

                        {member.alerts.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {member.alerts.map((alert) => (
                              <div key={alert} className="flex items-center gap-2 text-xs text-warning">
                                <AlertTriangle className="h-3 w-3" />
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary" />
              Check-in de Bem-Estar
            </DialogTitle>
            <DialogDescription>
              Como você está se sentindo hoje?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-center gap-4">
              {moodEmojis.map((mood) => {
                const Icon = mood.icon;
                return (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-full transition-all ${
                      selectedMood === mood.value 
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${selectedMood !== mood.value ? mood.color : ""}`} />
                  </motion.button>
                );
              })}
            </div>
            
            {selectedMood && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center font-medium"
              >
                {moodEmojis.find(m => m.value === selectedMood)?.label}
              </motion.p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações (opcional)</label>
              <Textarea
                placeholder="Algo que gostaria de compartilhar..."
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCheckIn}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-info" />
              Chat Confidencial
            </DialogTitle>
            <DialogDescription>
              Suas conversas são privadas e protegidas
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Esta funcionalidade conecta você com profissionais de saúde mental.
              Todas as conversas são confidenciais.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => {
              toast.success("Conectando com um profissional...");
              setShowSupportDialog(false);
            }}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Iniciar Conversa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
