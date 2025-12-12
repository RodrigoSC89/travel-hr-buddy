// PATCH 598: AI Training Dashboard Page
import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Brain, BookOpen, Trophy, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingAIService } from "@/services/training-ai.service";
import type { AITrainingSession, TrainingStats } from "@/types/training-ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const AITraining: React.FC = () => {
  const [sessions, setSessions] = useState<AITrainingSession[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadTrainingData(user.id);
      }
    } catch (error) {
      logger.error("Error loading user", { error });
      toast.error("Failed to load user data");
    }
  };

  const loadTrainingData = async (crewMemberId: string) => {
    try {
      setLoading(true);
      const sessionsData = await TrainingAIService.getTrainingSessions(crewMemberId);
      const statsData = await TrainingAIService.getTrainingStats(crewMemberId, {
        sessions: sessionsData,
      };
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      logger.error("Error loading training data", { error, crewMemberId });
      toast.error("Failed to load training data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportHistory = async () => {
    if (!userId) return;
    
    try {
      const csv = await TrainingAIService.exportTrainingHistory(userId);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `training-history-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Training history exported");
    } catch (error) {
      logger.error("Error exporting history", { error, userId });
      toast.error("Failed to export history");
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Training Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized training with AI-powered feedback
          </p>
        </div>
        <Button onClick={handleExportHistory}>
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading training data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_sessions || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats?.completed_sessions || 0} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(stats?.average_score || 0)}`}>
                  {stats?.average_score ? stats.average_score.toFixed(1) : "0"}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pass rate: {stats?.pass_rate ? stats.pass_rate.toFixed(1) : "0"}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Training Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_duration_minutes || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  minutes total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.modules_trained?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  modules trained
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Sessions */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {sessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No training sessions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{session.topic}</CardTitle>
                            <CardDescription className="mt-1">
                              Module: {session.module}
                            </CardDescription>
                          </div>
                          <Badge variant={session.passed ? "default" : "secondary"}>
                            {session.completed_at ? (session.passed ? "Passed" : "Failed") : "In Progress"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {session.score !== null && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Score</span>
                                <span className={`font-bold ${getScoreColor(session.score)}`}>
                                  {session.score.toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={session.score} />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>
                              Started: {new Date(session.created_at).toLocaleDateString()}
                            </div>
                            {session.completed_at && (
                              <div>
                                Completed: {new Date(session.completed_at).toLocaleDateString()}
                              </div>
                            )}
                            {session.duration_minutes && (
                              <div>
                                Duration: {session.duration_minutes} min
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {sessions.filter(s => s.completed_at).map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{session.topic}</CardTitle>
                      <CardDescription>Module: {session.module}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`text-xl font-bold ${getScoreColor(session.score || 0)}`}>
                            {session.score?.toFixed(1)}%
                          </span>
                        </div>
                        <Badge variant={session.passed ? "default" : "destructive"}>
                          {session.passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {sessions.filter(s => !s.completed_at).map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{session.topic}</CardTitle>
                      <CardDescription>Module: {session.module}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">In Progress</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
});

export default AITraining;
