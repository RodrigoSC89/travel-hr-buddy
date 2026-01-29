/**
 * 🎓 Training Dashboard - Learning Experience Platform
 * NAUTILUS ONE v5.0 - Revolutionary Maritime Training
 * 
 * Gamified learning dashboard with progress tracking,
 * microlearning, and adaptive curriculum
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GraduationCap, Target, Award, Flame, Trophy, Star, Zap, Clock,
  BookOpen, Play, CheckCircle, Lock, ArrowRight, Brain, Sparkles,
  TrendingUp, Calendar, Users, Medal, Crown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { microLearningEngine, type GameProgress, type MicroLesson, type Badge as GameBadge, type LeaderboardEntry } from '../ai/MicroLearningEngine';
import { adaptiveLearningEngine, type PersonalizedCurriculum, type LearnerProfile } from '../ai/AdaptiveLearningEngine';
import { toast } from 'sonner';

// Level Progress Ring
function LevelRing({ level, xp, xpToNext, size = 120 }: { 
  level: number; 
  xp: number; 
  xpToNext: number;
  size?: number;
}) {
  const progress = xpToNext > 0 ? ((xp % 500) / xpToNext) * 100 : 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
        />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Crown className="h-5 w-5 text-yellow-500 mb-1" />
        <span className="text-3xl font-bold">{level}</span>
        <span className="text-xs text-muted-foreground">Level</span>
      </div>
    </div>
  );
}

// Streak Display
function StreakDisplay({ streak }: { streak: number }) {
  const isActive = streak > 0;
  
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        isActive ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"
      )}
    >
      <Flame className={cn("h-5 w-5", isActive && "animate-pulse")} />
      <span className="font-bold">{streak}</span>
      <span className="text-sm">day streak</span>
    </motion.div>
  );
}

// XP Display
function XPDisplay({ xp, xpGained }: { xp: number; xpGained?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-yellow-500" />
      <span className="font-bold text-lg">{xp.toLocaleString()}</span>
      <span className="text-muted-foreground">XP</span>
      {xpGained && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-500 font-medium"
        >
          +{xpGained}
        </motion.span>
      )}
    </div>
  );
}

// Badge Display
function BadgeDisplay({ badge }: { badge: GameBadge }) {
  const rarityColors = {
    common: 'border-gray-400 bg-gray-400/10',
    uncommon: 'border-green-500 bg-green-500/10',
    rare: 'border-blue-500 bg-blue-500/10',
    epic: 'border-purple-500 bg-purple-500/10',
    legendary: 'border-yellow-500 bg-yellow-500/10'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "flex flex-col items-center p-3 rounded-lg border-2",
        rarityColors[badge.rarity]
      )}
    >
      <span className="text-3xl">{badge.icon}</span>
      <span className="text-xs font-medium mt-1">{badge.name}</span>
    </motion.div>
  );
}

// Daily Challenge Card
function DailyChallengeCard({ 
  lesson, 
  onStart 
}: { 
  lesson: MicroLesson | null;
  onStart: () => void;
}) {
  if (!lesson) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
        <CardContent className="p-6 flex items-center justify-center h-40">
          <span className="text-muted-foreground">Loading today's challenge...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/20 text-primary border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Daily Challenge
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lesson.estimatedTime} min
            </div>
          </div>
          <CardTitle className="text-xl">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{lesson.hook}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">+{lesson.xpReward} XP</span>
              </div>
              {lesson.completionBadge && (
                <div className="flex items-center gap-1 text-sm">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>{lesson.completionBadge}</span>
                </div>
              )}
            </div>
            
            <Button onClick={onStart} className="gap-2">
              <Play className="h-4 w-4" />
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Leaderboard Component
function Leaderboard({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.learnerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                entry.learnerId === currentUserId ? "bg-primary/10" : "bg-muted/50",
                index === 0 && "bg-yellow-500/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                index === 0 && "bg-yellow-500 text-yellow-950",
                index === 1 && "bg-gray-400 text-gray-950",
                index === 2 && "bg-orange-600 text-orange-50",
                index > 2 && "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{entry.name}</div>
                <div className="text-xs text-muted-foreground">
                  Level {entry.level} • {entry.streak} day streak
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold">{entry.xp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Learning Path Module Card
function ModuleCard({ 
  module, 
  isLocked, 
  isCompleted,
  onClick 
}: { 
  module: any;
  isLocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500',
    intermediate: 'bg-yellow-500/10 text-yellow-500',
    advanced: 'bg-red-500/10 text-red-500'
  };

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      className={cn(
        "p-4 rounded-lg border",
        isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary",
        isCompleted && "border-green-500/50 bg-green-500/5"
      )}
      onClick={() => !isLocked && onClick()}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isCompleted ? "bg-green-500" : isLocked ? "bg-muted" : "bg-primary"
        )}>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-white" />
          ) : isLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            <BookOpen className="h-5 w-5 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{module.title}</h4>
            <Badge variant="outline" className={cn("text-xs", difficultyColors[module.difficulty as keyof typeof difficultyColors])}>
              {module.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              +{module.xpReward} XP
            </span>
            {module.badge && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {module.badge}
              </span>
            )}
          </div>
        </div>
        
        {!isLocked && !isCompleted && (
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </motion.div>
  );
}

// Main Dashboard Component
export function TrainingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLearnerId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch game progress
  const { data: progress } = useQuery<GameProgress>({
    queryKey: ['game-progress'],
    queryFn: async () => {
      // Would use actual user ID
      return microLearningEngine.getCurrentProgress('current-user');
    }
  });

  // Fetch daily learning
  const { data: dailyLearning } = useQuery({
    queryKey: ['daily-learning'],
    queryFn: async () => microLearningEngine.generateDailyLearning('current-user')
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => microLearningEngine.getLeaderboard(10)
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (data: { lessonId: string; score: number }) => {
      return microLearningEngine.updateGameProgress('current-user', data.lessonId, data.score);
    },
    onSuccess: (newProgress) => {
      queryClient.setQueryData(['game-progress'], newProgress);
      toast.success(`🎉 +${50} XP earned!`);
    }
  });

  const handleStartLesson = () => {
    // Would navigate to lesson view
    toast.info('Starting lesson...');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Learning Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Master maritime skills through gamified microlearning
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <StreakDisplay streak={progress?.streak || 0} />
          <XPDisplay xp={progress?.xp || 0} />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Level Card */}
        <Card className="col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <LevelRing 
              level={progress?.level || 1} 
              xp={progress?.xp || 0} 
              xpToNext={progress?.xpToNextLevel || 100}
            />
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground">XP to next level</div>
              <div className="font-bold">{progress?.xpToNextLevel || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress?.completedLessons || 0}</div>
            <p className="text-xs text-muted-foreground">Keep learning!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress?.badges.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {10 - (progress?.badges.length || 0)} more to unlock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leaderboard Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{progress?.leaderboardPosition || '--'}</div>
            <p className="text-xs text-muted-foreground">Keep climbing!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Challenge */}
          <DailyChallengeCard 
            lesson={dailyLearning?.lesson || null}
            onStart={handleStartLesson}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Badges Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {progress?.badges.map((badge) => (
                    <BadgeDisplay key={badge.id} badge={badge} />
                  ))}
                  {(!progress?.badges || progress.badges.length === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Complete lessons to earn your first badge!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress?.achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{achievement.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Learning Path
              </CardTitle>
              <CardDescription>
                Personalized curriculum based on your role and skill gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ModuleCard
                module={{
                  title: 'Safety Fundamentals',
                  description: 'Essential safety procedures for maritime operations',
                  difficulty: 'beginner',
                  duration: 30,
                  xpReward: 100
                }}
                isLocked={false}
                isCompleted={true}
                onClick={() => {}}
              />
              <ModuleCard
                module={{
                  title: 'Fire Prevention & Response',
                  description: 'Learn to prevent and respond to fires on board',
                  difficulty: 'intermediate',
                  duration: 45,
                  xpReward: 150,
                  badge: 'Fire Safety Expert'
                }}
                isLocked={false}
                isCompleted={false}
                onClick={handleStartLesson}
              />
              <ModuleCard
                module={{
                  title: 'Emergency Response Simulation',
                  description: 'VR simulation of emergency scenarios',
                  difficulty: 'advanced',
                  duration: 60,
                  xpReward: 250
                }}
                isLocked={true}
                isCompleted={false}
                onClick={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress?.achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      achievement.completed ? "bg-green-500/10 border-green-500/50" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <Badge variant={achievement.completed ? "default" : "outline"}>
                        {achievement.completed ? 'Completed' : `${achievement.progress}/${achievement.target}`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {!achievement.completed && (
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2"
                      />
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span>+{achievement.reward} XP reward</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard entries={leaderboard || []} currentUserId="current-user" />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Total XP</span>
                  <span className="font-bold">{progress?.totalXP.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Current Streak</span>
                  <span className="font-bold flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    {progress?.streak} days
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Longest Streak</span>
                  <span className="font-bold">{progress?.longestStreak} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Lessons Completed</span>
                  <span className="font-bold">{progress?.completedLessons}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TrainingDashboard;
