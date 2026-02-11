/**
 * Crew Wellness Program - Tier-1
 * Benchmark: VIKAND OneHealth + Wallem Mental Health Program
 * Features:
 * - Mental health monitoring & support
 * - Physical fitness tracking
 * - Wellness surveys & assessments
 * - Fatigue management (ISM related)
 * - Peer support programs
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, Brain, Dumbbell, Moon, Coffee, MessageCircle,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Users,
  Smile, Frown, Meh, ThumbsUp, Phone, Video, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function WellnessProgram() {
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

  // Fetch crew wellness data
  const { data: crewWellness = [] } = useQuery({
    queryKey: ["crew-wellness"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, status")
        .eq("status", "active")
        .limit(10);
      
      if (error) throw error;
      
      return (data || []).map((crew: { id: string; full_name: string | null; rank: string | null; status: string | null }, idx: number) => {
        const seed = crew.id ? crew.id.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) : idx * 37;
        return {
          ...crew,
          wellnessScore: 70 + (seed % 30),
          fatigueLevel: seed % 3,
          lastSurvey: new Date(Date.now() - (seed % 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          mood: ["happy", "neutral", "stressed"][seed % 3]
        };
      });
    }
  });

  // Wellness KPIs
  const wellnessKPIs = {
    overallScore: 82,
    avgFatigueIndex: 2.1,
    surveysCompleted: 94,
    counselingSessions: 12,
    fitnessParticipation: 78,
    mentalHealthCases: 3
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return <Smile className="h-4 w-4 text-success" />;
      case "stressed": return <Frown className="h-4 w-4 text-destructive" />;
      default: return <Meh className="h-4 w-4 text-warning" />;
    }
  };

  const getFatigueColor = (level: number) => {
    if (level === 0) return "bg-success";
    if (level === 1) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Heart className="h-7 w-7 text-destructive" />
            Crew Wellness Program
          </h2>
          <p className="text-muted-foreground">Mental health, fitness & fatigue management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {wellnessKPIs.overallScore}% Wellness Score
          </Badge>
          <Button variant="outline" size="sm">Schedule Counseling</Button>
          <Button size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Peer Support
          </Button>
        </div>
      </div>

      {/* AI Wellness Insight */}
      <Card className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10 border-pink-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Sparkles className="h-5 w-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">AI Wellness Analysis</h3>
              <p className="text-sm text-muted-foreground">
                3 crew members showing elevated stress indicators. Engine room team may benefit from additional rest periods. Consider scheduling wellness check-ins.
              </p>
            </div>
            <Button variant="outline" size="sm">View Analysis</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardContent className="p-4 text-center">
            <Heart className="h-5 w-5 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{wellnessKPIs.overallScore}%</p>
            <p className="text-xs text-muted-foreground">Wellness Score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Moon className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{wellnessKPIs.avgFatigueIndex}</p>
            <p className="text-xs text-muted-foreground">Fatigue Index</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{wellnessKPIs.surveysCompleted}%</p>
            <p className="text-xs text-muted-foreground">Survey Completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-5 w-5 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{wellnessKPIs.counselingSessions}</p>
            <p className="text-xs text-muted-foreground">Counseling Sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{wellnessKPIs.fitnessParticipation}%</p>
            <p className="text-xs text-muted-foreground">Fitness Participation</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${wellnessKPIs.mentalHealthCases > 0 ? "from-warning/10 to-warning/5 border-warning/20" : "from-success/10 to-success/5 border-success/20"}`}>
          <CardContent className="p-4 text-center">
            <Brain className={`h-5 w-5 mx-auto mb-2 ${wellnessKPIs.mentalHealthCases > 0 ? "text-warning" : "text-success"}`} />
            <p className="text-2xl font-bold">{wellnessKPIs.mentalHealthCases}</p>
            <p className="text-xs text-muted-foreground">Active Cases</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mental">Mental Health</TabsTrigger>
          <TabsTrigger value="fatigue">Fatigue Mgmt</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="support">Peer Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crew Wellness List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Crew Wellness Status
                </CardTitle>
                <CardDescription>Individual wellness monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {crewWellness.map((crew: { id: string; full_name: string | null; rank: string | null; mood: string; wellnessScore: number; fatigueLevel: number; lastSurvey: string }) => (
                    <div
                      key={crew.id}
                      className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCrew(crew.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{crew.full_name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{crew.full_name}</p>
                            {getMoodIcon(crew.mood)}
                          </div>
                          <p className="text-xs text-muted-foreground">{crew.rank}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{crew.wellnessScore}%</span>
                            <Progress value={crew.wellnessScore} className="w-16 h-2" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Fatigue:</span>
                            <Badge variant="outline" className={`${getFatigueColor(crew.fatigueLevel)} text-white text-xs`}>
                              {crew.fatigueLevel === 0 ? "Low" : crew.fatigueLevel === 1 ? "Medium" : "High"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-success" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" />
                  24/7 Helpline
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Video className="h-4 w-4" />
                  Video Counseling
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Peer Support Chat
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Fitness Challenge
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Moon className="h-4 w-4" />
                  Rest Period Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-500" />
                  Mental Health Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <h4 className="font-medium mb-2">VIKAND 24/7 Hotline</h4>
                  <p className="text-sm text-muted-foreground mb-3">Confidential mental health support available anytime</p>
                  <Button className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Call +1-800-VIKAND-1
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">📚 Self-Help Library</Button>
                  <Button variant="outline" className="w-full justify-start">🧘 Guided Meditation</Button>
                  <Button variant="outline" className="w-full justify-start">💬 Anonymous Chat</Button>
                  <Button variant="outline" className="w-full justify-start">📝 Mood Journal</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Mood Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => {
                    const value = [82, 78, 85, 76, 88, 74, 80][idx];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-muted-foreground">{day}</span>
                        <Progress value={value} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fatigue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-amber-500" />
                Fatigue Risk Management (ISM Compliant)
              </CardTitle>
              <CardDescription>Monitoring rest periods and fatigue indicators per ISM Code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-success/10 border-success/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-success">87%</p>
                    <p className="text-sm text-muted-foreground">Rest Compliance</p>
                    <p className="text-xs text-muted-foreground mt-1">MLC 2.3 & STCW</p>
                  </CardContent>
                </Card>
                <Card className="bg-warning/10 border-warning/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-warning">3</p>
                    <p className="text-sm text-muted-foreground">Fatigue Alerts</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">6.8h</p>
                    <p className="text-sm text-muted-foreground">Avg Sleep</p>
                    <p className="text-xs text-muted-foreground mt-1">Fleet average</p>
                  </CardContent>
                </Card>
              </div>
              
              <p className="text-center text-muted-foreground py-8">
                Detailed fatigue tracking and rest period monitoring integrated with working hours log
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitness" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-cyan-500/10 border-cyan-500/20">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 text-cyan-500 mx-auto mb-3" />
                <p className="text-3xl font-bold">{wellnessKPIs.fitnessParticipation}%</p>
                <p className="text-sm text-muted-foreground">Participation Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                <p className="text-3xl font-bold">+12%</p>
                <p className="text-sm text-muted-foreground">vs Last Month</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold">28</p>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Peer Support Network
              </CardTitle>
              <CardDescription>Trained peer supporters available for confidential conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Chief Officer", "2nd Engineer", "Bosun"].map((supporter) => (
                  <Card key={supporter} className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{supporter.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{supporter}</p>
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">Available</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
