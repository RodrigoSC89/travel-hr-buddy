/**
 * Gamification Extreme - Maritime Gaming Ecosystem
 * PATCH REVOLUTION v1.0
 * Transform work into game with XP, levels, achievements
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Star, Medal, Target, Zap, Award, 
  Crown, Flame, Users, Ship, TrendingUp, Gift,
  Sparkles, Shield, Anchor, Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  streak: number;
  achievements: Achievement[];
  skills: Skill[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

interface Skill {
  name: string;
  level: number;
  maxLevel: number;
}

interface TeamCompetition {
  id: string;
  vesselName: string;
  score: number;
  rank: number;
  safetyScore: number;
  efficiencyScore: number;
  customerScore: number;
  prize?: string;
}

// Fallback data
const fallbackCrewMember: CrewMember = {
  id: "1", name: "João Silva", role: "Chief Engineer",
  level: 67, xp: 245780, xpToNext: 300000, rank: 12, streak: 45,
  achievements: [
    { id: "1", name: "Zero Breakdowns", description: "1 ano sem falhas", icon: "shield", rarity: "legendary", unlockedAt: "2024-12-15" },
    { id: "2", name: "Perfect Maintenance", description: "Score perfeito", icon: "star", rarity: "epic", unlockedAt: "2024-11-20" },
  ],
  skills: [
    { name: "Diesel Engines", level: 5, maxLevel: 5 },
    { name: "Electrical Systems", level: 4, maxLevel: 5 },
    { name: "Safety Protocols", level: 5, maxLevel: 5 },
  ],
};

const fallbackTeamCompetition: TeamCompetition[] = [
  { id: "1", vesselName: "MV Ocean Star", score: 94.5, rank: 1, safetyScore: 98, efficiencyScore: 92, customerScore: 96, prize: "$50,000" },
  { id: "2", vesselName: "MV Sea Pride", score: 92.1, rank: 2, safetyScore: 95, efficiencyScore: 90, customerScore: 93, prize: "$30,000" },
];

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
};

const rarityGlow = {
  common: "",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-amber-500/50 animate-pulse",
};

export function GamificationExtreme() {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [user, setUser] = useState<CrewMember>(fallbackCrewMember);
  const [leaderboard, setLeaderboard] = useState<CrewMember[]>([]);
  const [teamCompetition, setTeamCompetition] = useState<TeamCompetition[]>(fallbackTeamCompetition);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.from("crew_members").select("id, full_name, rank, position").order("full_name").limit(10);
        if (data && data.length > 0) {
          const lb: CrewMember[] = data.map((m, i) => ({
            ...fallbackCrewMember, id: m.id, name: m.full_name || "Tripulante",
            role: m.rank || "Crew", rank: i + 1, level: 90 - i * 5, xp: (90 - i * 5) * 10000,
            xpToNext: (90 - i * 5 + 1) * 10000,
          }));
          setLeaderboard(lb);
          if (lb.length > 0) setUser(prev => ({ ...prev, name: lb[0].name }));
        } else {
          setLeaderboard([fallbackCrewMember]);
        }
        const { data: vessels } = await supabase.from("vessels").select("id, name").limit(5);
        if (vessels && vessels.length > 0) {
          setTeamCompetition(vessels.map((v, i) => ({
            id: v.id, vesselName: v.name || "Embarcação", score: 95 - i * 3,
            rank: i + 1, safetyScore: 98 - i * 2, efficiencyScore: 92 - i * 3,
            customerScore: 96 - i * 2, prize: i < 3 ? `$${(50 - i * 10) * 1000}` : undefined,
          })));
        }
      } catch { /* fallback */ }
    };
    loadData();
  }, []);

  const xpProgress = (user.xp / user.xpToNext) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Maritime Gaming Ecosystem
          </h2>
          <p className="text-muted-foreground">
            Gamificação extrema - Trabalho como jogo
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <Flame className="h-3 w-3 mr-1" />
          {user.streak} dias de streak
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="teams">Competições</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                      Lv.{user.level}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-muted-foreground">{user.role}</p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">#{user.rank}</div>
                      <div className="text-muted-foreground">Rank Global</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{user.achievements.length}</div>
                      <div className="text-muted-foreground">Conquistas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Progresso de XP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level {user.level}</span>
                    <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-4" />
                  <p className="text-xs text-muted-foreground">
                    Faltam {(user.xpToNext - user.xp).toLocaleString()} XP para o próximo nível
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-2xl font-bold">+500</div>
                    <div className="text-xs text-muted-foreground">XP Hoje</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-muted-foreground">Tarefas</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                    <div className="text-2xl font-bold">{user.streak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Gift className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <div className="text-2xl font-bold">$2.5k</div>
                    <div className="text-xs text-muted-foreground">Rewards</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Skills Tree
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.skills.map((skill) => (
                  <div key={skill.name} className="p-4 rounded-lg border bg-card">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: skill.maxLevel }).map((_, i) => (
                          <Star
                            key={`star-${skill.name}-${i}`}
                            className={`h-4 w-4 ${
                              i < skill.level ? "text-amber-500 fill-amber-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Progress value={(skill.level / skill.maxLevel) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-500" />
                Conquistas Desbloqueadas ({user.achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border bg-card shadow-lg ${rarityGlow[achievement.rarity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-full ${rarityColors[achievement.rarity]}`}>
                        {achievement.icon === "shield" && <Shield className="h-5 w-5 text-white" />}
                        {achievement.icon === "star" && <Star className="h-5 w-5 text-white" />}
                        {achievement.icon === "zap" && <Zap className="h-5 w-5 text-white" />}
                        {achievement.icon === "users" && <Users className="h-5 w-5 text-white" />}
                        {achievement.icon === "trophy" && <Trophy className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{achievement.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {leaderboard.map((member: CrewMember, index: number) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border flex items-center gap-4 ${
                        member.name === user.name ? "bg-primary/10 border-primary" : "bg-card"
                      }`}
                    >
                      <div className="w-12 text-center">
                        {member.rank === 1 && <Crown className="h-8 w-8 mx-auto text-amber-500" />}
                        {member.rank === 2 && <Medal className="h-8 w-8 mx-auto text-muted-foreground" />}
                        {member.rank === 3 && <Medal className="h-8 w-8 mx-auto text-amber-700" />}
                        {member.rank > 3 && <span className="text-2xl font-bold text-muted-foreground">#{member.rank}</span>}
                      </div>
                      <Avatar>
                        <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-bold">{member.name}</div>
                        <div className="text-sm text-muted-foreground">Level {member.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{member.xp.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP Total</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Competição de Embarcações - Q1 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamCompetition.map((team: TeamCompetition, index: number) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      team.rank <= 3 ? "bg-gradient-to-r from-amber-500/10 to-transparent" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-center">
                          {team.rank === 1 && <Trophy className="h-6 w-6 text-amber-500" />}
                          {team.rank === 2 && <Medal className="h-6 w-6 text-muted-foreground" />}
                          {team.rank === 3 && <Medal className="h-6 w-6 text-amber-700" />}
                          {team.rank > 3 && <span className="font-bold text-muted-foreground">#{team.rank}</span>}
                        </div>
                        <div>
                          <h4 className="font-bold">{team.vesselName}</h4>
                          {team.prize && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                              <Gift className="h-3 w-3 mr-1" />
                              {team.prize}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{team.score}</div>
                        <div className="text-xs text-muted-foreground">pontos</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-sm font-medium">{team.safetyScore}/100</div>
                        <div className="text-xs text-muted-foreground">Segurança</div>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-sm font-medium">{team.efficiencyScore}/100</div>
                        <div className="text-xs text-muted-foreground">Eficiência</div>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <div className="text-sm font-medium">{team.customerScore}/100</div>
                        <div className="text-xs text-muted-foreground">Cliente</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
