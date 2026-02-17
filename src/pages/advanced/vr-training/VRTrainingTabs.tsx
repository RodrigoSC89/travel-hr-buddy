/**
 * VR Training Tabs - Scenarios, Leaderboard, Achievements, Analytics
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, Users, Clock, Trophy, Star, CheckCircle,
  Plus, Trash2, Edit, Copy, Search, Filter, Target, Gamepad2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { leaderboard, getDifficultyColor, type VRScenario, type TrainingSession } from "./types";

interface VRTrainingTabsProps {
  scenarios: VRScenario[];
  filteredScenarios: VRScenario[];
  selectedScenario: VRScenario | null;
  activeSession: TrainingSession | null;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  onStartSession: (s: VRScenario) => void;
  onOpenEdit: (s: VRScenario) => void;
  onDuplicate: (s: VRScenario) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onOpenCreate: () => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "published": return <Badge className="bg-success">Publicado</Badge>;
    case "draft": return <Badge variant="outline">Rascunho</Badge>;
    case "archived": return <Badge variant="secondary">Arquivado</Badge>;
    default: return null;
  }
}

export function VRTrainingTabs({
  scenarios, filteredScenarios, selectedScenario, activeSession,
  searchTerm, setSearchTerm, difficultyFilter, setDifficultyFilter,
  onStartSession, onOpenEdit, onDuplicate, onDelete, onPublish, onOpenCreate,
}: VRTrainingTabsProps) {
  return (
    <Tabs defaultValue="scenarios" className="space-y-6">
      <TabsList>
        <TabsTrigger value="scenarios">Cenários VR ({filteredScenarios.length})</TabsTrigger>
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="scenarios" className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cenários..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Dificuldade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredScenarios.length === 0 ? (
          <Card className="p-12 text-center">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
            <p className="text-muted-foreground mb-4">Crie seu primeiro cenário de treinamento VR</p>
            <Button onClick={onOpenCreate}><Plus className="h-4 w-4 mr-2" />Criar Cenário</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredScenarios.map((scenario, index) => (
                <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedScenario?.id === scenario.id ? "ring-2 ring-primary" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{scenario.title}</CardTitle>
                        <div className="flex gap-1">
                          {getStatusBadge(scenario.status)}
                          <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div><Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /><span>{scenario.duration}</span></div>
                        <div><Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /><span>{scenario.completions}</span></div>
                        <div><Star className="h-4 w-4 mx-auto mb-1 text-warning" /><span>{scenario.avgScore}%</span></div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => onStartSession(scenario)} disabled={activeSession !== null || scenario.status !== "published"}>
                          <Play className="h-4 w-4 mr-1" />Iniciar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onOpenEdit(scenario)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => onDuplicate(scenario)}><Copy className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(scenario.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                      {scenario.status === "draft" && (
                        <Button className="w-full mt-2" size="sm" onClick={() => onPublish(scenario.id)}>Publicar Cenário</Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </TabsContent>

      <TabsContent value="leaderboard">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" />Ranking Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg ${user.rank <= 3 ? "bg-gradient-to-r from-warning/10 to-transparent" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? "bg-warning text-warning-foreground" : user.rank === 2 ? "bg-muted text-foreground" : user.rank === 3 ? "bg-warning/70 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>{user.rank}</div>
                    <div><p className="font-semibold">{user.name}</p><p className="text-sm text-muted-foreground">{user.scenarios} cenários completados</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{user.badge}</Badge>
                    <p className="text-xl font-bold text-primary">{user.score.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements">
        <Card>
          <CardHeader><CardTitle>Conquistas</CardTitle><CardDescription>Complete cenários para desbloquear conquistas</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Primeiro Cenário", icon: "🎯", unlocked: true, description: "Complete seu primeiro cenário VR" },
                { name: "Apagador de Incêndios", icon: "🔥", unlocked: true, description: "Complete todos os cenários de incêndio" },
                { name: "Socorrista", icon: "🏥", unlocked: true, description: "Complete o cenário de emergência médica" },
                { name: "Herói MOB", icon: "🌊", unlocked: true, description: "Score perfeito em Homem ao Mar" },
                { name: "Expert em Abandono", icon: "🚤", unlocked: false, description: "Complete todos os níveis de abandono" },
                { name: "Mestre de Emergências", icon: "👑", unlocked: false, description: "Complete todos os cenários com 90%+" },
              ].map((achievement) => (
                <div key={achievement.name} className={`p-4 rounded-lg border ${achievement.unlocked ? "bg-primary/5" : "bg-muted/30 opacity-60"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div><p className="font-semibold">{achievement.name}</p>{achievement.unlocked && <CheckCircle className="h-4 w-4 text-success" />}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader><CardTitle>Performance Analytics</CardTitle><CardDescription>Análise detalhada de performance e métricas de treinamento</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card><CardContent className="pt-6"><div className="text-center"><Target className="h-10 w-10 text-primary mx-auto mb-2" /><p className="text-3xl font-bold">{scenarios.reduce((acc, s) => acc + s.completions, 0)}</p><p className="text-sm text-muted-foreground">Total de Completions</p></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-center"><Star className="h-10 w-10 text-yellow-500 mx-auto mb-2" /><p className="text-3xl font-bold">{Math.round(scenarios.reduce((acc, s) => acc + s.avgScore, 0) / scenarios.length)}%</p><p className="text-sm text-muted-foreground">Score Médio Global</p></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-center"><Trophy className="h-10 w-10 text-amber-500 mx-auto mb-2" /><p className="text-3xl font-bold">{scenarios.filter(s => s.status === "published").length}</p><p className="text-sm text-muted-foreground">Cenários Publicados</p></div></CardContent></Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
