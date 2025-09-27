import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Target, 
  Star, 
  Flame, 
  Award, 
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Zap,
  Crown,
  Medal,
  Gift,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'productivity' | 'collaboration' | 'innovation' | 'leadership';
}

interface UserStats {
  totalPoints: number;
  level: number;
  rank: string;
  streak: number;
  achievements: number;
  completedTasks: number;
  collaborationScore: number;
  innovationIndex: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  avatar: string;
  badges: string[];
  trend: 'up' | 'down' | 'stable';
}

export const Gamification = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 2847,
    level: 12,
    rank: 'Especialista Corporate',
    streak: 15,
    achievements: 23,
    completedTasks: 156,
    collaborationScore: 87,
    innovationIndex: 92
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: 'Mestre da Colaboração',
      description: 'Participou de 50 sessões colaborativas',
      icon: '🤝',
      points: 500,
      unlocked: true,
      progress: 50,
      maxProgress: 50,
      category: 'collaboration'
    },
    {
      id: 2,
      title: 'Inovador Digital',
      description: 'Utilizou 10 recursos de IA diferentes',
      icon: '🚀',
      points: 750,
      unlocked: true,
      progress: 12,
      maxProgress: 10,
      category: 'innovation'
    },
    {
      id: 3,
      title: 'Workflow Master',
      description: 'Criou e otimizou 25 workflows',
      icon: '⚡',
      points: 600,
      unlocked: false,
      progress: 18,
      maxProgress: 25,
      category: 'productivity'
    },
    {
      id: 4,
      title: 'Líder de Insights',
      description: 'Gerou 100 insights valiosos',
      icon: '💡',
      points: 800,
      unlocked: false,
      progress: 73,
      maxProgress: 100,
      category: 'leadership'
    },
    {
      id: 5,
      title: 'Comunicador Expert',
      description: 'Sequência de 30 dias ativos',
      icon: '🔥',
      points: 300,
      unlocked: true,
      progress: 30,
      maxProgress: 30,
      category: 'collaboration'
    },
    {
      id: 6,
      title: 'Analytics Guru',
      description: 'Analisou dados por 100 horas',
      icon: '📊',
      points: 1000,
      unlocked: false,
      progress: 67,
      maxProgress: 100,
      category: 'innovation'
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      name: 'Rodrigo Silva de Carvalho',
      points: 2847,
      level: 12,
      avatar: '',
      badges: ['🚀', '💡', '🤝'],
      trend: 'stable'
    },
    {
      rank: 2,
      name: 'Ana Silva Santos',
      points: 2650,
      level: 11,
      avatar: '',
      badges: ['⚡', '📊', '🔥'],
      trend: 'up'
    },
    {
      rank: 3,
      name: 'Carlos Eduardo Lima',
      points: 2401,
      level: 10,
      avatar: '',
      badges: ['🤝', '🎯', '💡'],
      trend: 'down'
    },
    {
      rank: 4,
      name: 'Maria Costa Oliveira',
      points: 2198,
      level: 9,
      avatar: '',
      badges: ['📊', '🚀'],
      trend: 'up'
    },
    {
      rank: 5,
      name: 'João Pedro Souza',
      points: 1995,
      level: 8,
      avatar: '',
      badges: ['⚡', '🔥'],
      trend: 'stable'
    }
  ]);

  const { toast } = useToast();

  const claimReward = (achievementId: number) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement?.unlocked) {
      toast({
        title: "Recompensa Coletada! 🎉",
        description: `Você ganhou ${achievement.points} pontos por "${achievement.title}"`,
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />;
      case 'collaboration': return <Users className="w-4 h-4" />;
      case 'innovation': return <Sparkles className="w-4 h-4" />;
      case 'leadership': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'collaboration': return 'bg-green-100 text-green-700 border-green-200';
      case 'innovation': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'leadership': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500 rotate-90" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
                <p className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</p>
                <p className="text-xs text-primary">Nível {userStats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Flame className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência</p>
                <p className="text-2xl font-bold">{userStats.streak}</p>
                <p className="text-xs text-green-600">dias consecutivos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conquistas</p>
                <p className="text-2xl font-bold">{userStats.achievements}</p>
                <p className="text-xs text-purple-600">desbloqueadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ranking</p>
                <p className="text-lg font-bold">{userStats.rank}</p>
                <p className="text-xs text-orange-600">Posição #1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Conquistas & Badges
            </CardTitle>
            <CardDescription>
              Seus marcos e realizações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-card' : 'bg-muted/50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                            {achievement.title}
                          </h4>
                          <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                            {getCategoryIcon(achievement.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          
                          {achievement.unlocked ? (
                            <Button 
                              size="sm" 
                              onClick={() => claimReward(achievement.id)}
                              className="h-6 text-xs"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              {achievement.points}pts
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {achievement.points}pts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Ranking Corporativo
            </CardTitle>
            <CardDescription>
              Top performers da organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={`p-4 rounded-lg border ${entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-card'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-500 text-azure-50' :
                      entry.rank === 2 ? 'bg-gray-400 text-azure-50' :
                      entry.rank === 3 ? 'bg-orange-600 text-azure-50' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.rank}
                    </div>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{entry.name}</h4>
                        {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Nível {entry.level}</span>
                        <span>•</span>
                        <span>{entry.points.toLocaleString()} pts</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {entry.badges.map((badge, index) => (
                          <span key={index} className="text-sm">{badge}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getTrendIcon(entry.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Métricas de Performance
          </CardTitle>
          <CardDescription>
            Seus indicadores de produtividade e engajamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Score de Colaboração</span>
                <span className="text-sm text-muted-foreground">{userStats.collaborationScore}%</span>
              </div>
              <Progress value={userStats.collaborationScore} className="h-3" />
              <p className="text-xs text-muted-foreground">Baseado em interações e trabalho em equipe</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Índice de Inovação</span>
                <span className="text-sm text-muted-foreground">{userStats.innovationIndex}%</span>
              </div>
              <Progress value={userStats.innovationIndex} className="h-3" />
              <p className="text-xs text-muted-foreground">Uso de recursos de IA e inovação</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tarefas Completadas</span>
                <span className="text-sm text-muted-foreground">{userStats.completedTasks}</span>
              </div>
              <Progress value={85} className="h-3" />
              <p className="text-xs text-muted-foreground">Workflows e tarefas finalizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};