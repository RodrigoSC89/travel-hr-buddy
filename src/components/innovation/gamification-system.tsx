import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Award,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Flame,
  Medal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  category: 'productivity' | 'collaboration' | 'innovation' | 'quality' | 'leadership';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface Leaderboard {
  rank: number;
  user: string;
  points: number;
  level: number;
  avatar?: string;
  trend: 'up' | 'down' | 'stable';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  participants: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
}

export const GamificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userLevel, setUserLevel] = useState(12);
  const [userPoints, setUserPoints] = useState(2480);
  const [userXP, setUserXP] = useState(380);
  const [xpToNextLevel, setXpToNextLevel] = useState(620);
  const [streak, setStreak] = useState(7);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Primeira Missão',
      description: 'Complete sua primeira tarefa no sistema',
      points: 100,
      icon: <Target className="h-5 w-5" />,
      category: 'productivity',
      rarity: 'common',
      earned: true,
      earnedDate: '2024-01-08'
    },
    {
      id: '2',
      title: 'Colaborador Estrela',
      description: 'Ajude 10 colegas diferentes',
      points: 500,
      icon: <Star className="h-5 w-5" />,
      category: 'collaboration',
      rarity: 'rare',
      earned: true,
      earnedDate: '2024-01-15',
      progress: 10,
      maxProgress: 10
    },
    {
      id: '3',
      title: 'Inovador',
      description: 'Tenha 3 sugestões implementadas',
      points: 1000,
      icon: <Zap className="h-5 w-5" />,
      category: 'innovation',
      rarity: 'epic',
      earned: false,
      progress: 1,
      maxProgress: 3
    },
    {
      id: '4',
      title: 'Lenda do Sistema',
      description: 'Alcance 50.000 pontos totais',
      points: 5000,
      icon: <Crown className="h-5 w-5" />,
      category: 'leadership',
      rarity: 'legendary',
      earned: false,
      progress: 2480,
      maxProgress: 50000
    }
  ]);

  const [leaderboard] = useState<Leaderboard[]>([
    { rank: 1, user: 'Ana Silva', points: 5420, level: 18, trend: 'up' },
    { rank: 2, user: 'João Santos', points: 4850, level: 16, trend: 'stable' },
    { rank: 3, user: 'Maria Costa', points: 3920, level: 15, trend: 'down' },
    { rank: 4, user: 'Você', points: userPoints, level: userLevel, trend: 'up' },
    { rank: 5, user: 'Pedro Lima', points: 2340, level: 11, trend: 'up' }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Produtividade Diária',
      description: 'Complete 5 tarefas hoje',
      reward: 50,
      deadline: '2024-01-20',
      participants: 23,
      completed: false,
      progress: 3,
      maxProgress: 5,
      type: 'daily'
    },
    {
      id: '2',
      title: 'Colaboração Semanal',
      description: 'Ajude 3 colegas esta semana',
      reward: 200,
      deadline: '2024-01-22',
      participants: 15,
      completed: true,
      progress: 3,
      maxProgress: 3,
      type: 'weekly'
    },
    {
      id: '3',
      title: 'Mestre da Qualidade',
      description: 'Tenha 0 bugs relatados por 30 dias',
      reward: 1000,
      deadline: '2024-02-15',
      participants: 8,
      completed: false,
      progress: 12,
      maxProgress: 30,
      type: 'monthly'
    }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground border-gray-200 bg-gray-50';
      case 'rare': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'epic': return 'text-purple-600 border-purple-200 bg-purple-50';
      case 'legendary': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      default: return 'text-muted-foreground border-gray-200 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const claimReward = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setUserPoints(prev => prev + challenge.reward);
      toast({
        title: "Recompensa Coletada!",
        description: `Você ganhou ${challenge.reward} pontos!`,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Sistema de Gamificação
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e conquiste recompensas
          </p>
        </div>
      </div>

      {/* Status do Usuário */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{userLevel}</div>
              <div className="text-sm text-muted-foreground">Nível</div>
              <Progress value={(userXP / (userXP + xpToNextLevel)) * 100} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {userXP}/{userXP + xpToNextLevel} XP
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{userPoints.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pontos Totais</div>
              <div className="flex items-center justify-center mt-2">
                <Medal className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">Posição #4</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{streak}</div>
              <div className="text-sm text-muted-foreground">Dias Seguidos</div>
              <div className="flex items-center justify-center mt-2">
                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm">Em chamas!</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{achievements.filter(a => a.earned).length}</div>
              <div className="text-sm text-muted-foreground">Conquistas</div>
              <div className="text-xs text-muted-foreground mt-2">
                de {achievements.length} disponíveis
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.earned ? 'ring-2 ring-green-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                        {achievement.earned ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Conquistado</span>
                          </div>
                        ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="w-20 h-2 mt-1"
                            />
                          </div>
                        ) : null}
                      </div>
                      {achievement.earnedDate && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Conquistado em {new Date(achievement.earnedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge variant={challenge.type === 'daily' ? 'default' : 
                                  challenge.type === 'weekly' ? 'secondary' : 'outline'}>
                      {challenge.type === 'daily' ? 'Diário' :
                       challenge.type === 'weekly' ? 'Semanal' : 
                       challenge.type === 'monthly' ? 'Mensal' : 'Especial'}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span>{challenge.progress}/{challenge.maxProgress}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        {challenge.reward} pts
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {challenge.participants} participantes
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(challenge.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {challenge.completed ? (
                    <Button 
                      onClick={() => claimReward(challenge.id)}
                      className="w-full"
                    >
                      Coletar Recompensa
                    </Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full">
                      Em Progresso...
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Global</CardTitle>
              <CardDescription>
                Os melhores performers do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank} 
                    className={`flex items-center space-x-4 p-3 rounded-lg ${
                      entry.user === 'Você' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.user}</div>
                      <div className="text-sm text-muted-foreground">Nível {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.points.toLocaleString()} pts</div>
                      <div className="flex items-center justify-end">
                        {getTrendIcon(entry.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Dia de Folga Extra', points: 5000, description: 'Ganhe um dia de folga adicional', available: false },
              { title: 'Vale Presente', points: 2000, description: 'Vale de R$ 200 em loja de sua escolha', available: true },
              { title: 'Curso Online', points: 1500, description: 'Acesso a qualquer curso da plataforma', available: true },
              { title: 'Upgrade de Equipamento', points: 3000, description: 'Melhore seu setup de trabalho', available: true },
              { title: 'Estacionamento VIP', points: 1000, description: 'Vaga exclusiva por 1 mês', available: true },
              { title: 'Happy Hour da Equipe', points: 800, description: 'Organize um happy hour para sua equipe', available: true }
            ].map((reward, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <Award className="h-12 w-12 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{reward.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  <div className="text-lg font-bold text-primary mb-3">
                    {reward.points.toLocaleString()} pts
                  </div>
                  <Button 
                    disabled={!reward.available || userPoints < reward.points}
                    className="w-full"
                  >
                    {userPoints >= reward.points ? 'Resgatar' : 'Pontos Insuficientes'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};