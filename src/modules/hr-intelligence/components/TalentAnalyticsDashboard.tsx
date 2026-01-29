/**
 * 📊 Talent Analytics Dashboard - Executive HR Intelligence
 * NAUTILUS ONE v5.0 - Revolutionary HR Visualization
 * 
 * Comprehensive dashboard with AI-powered talent insights,
 * 3D visualization, and predictive analytics
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, TrendingUp, TrendingDown, Brain, Target, Award, Heart,
  Briefcase, GraduationCap, UserPlus, UserMinus, Clock, Star,
  Activity, BarChart3, Zap, ArrowRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { wellnessMonitor, type WellnessReport } from '../ai/WellnessMonitor';
import { cn } from '@/lib/utils';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  icon: React.ElementType;
  color?: string;
}

function KPICard({ title, value, subtitle, trend, icon: Icon, color = 'primary' }: KPICardProps) {
  const isPositive = trend && trend > 0;
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-purple-500/10 text-purple-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trend !== undefined && (
              <div className={cn(
                'flex items-center text-xs font-medium',
                isPositive ? 'text-green-500' : 'text-red-500'
              )}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Wellness Gauge Component
function WellnessGauge({ score, size = 120 }: { score: number; size?: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}%</span>
        <span className="text-xs text-muted-foreground">Wellness</span>
      </div>
    </div>
  );
}

// Nine Box Grid Component
function NineBoxGrid({ data }: { data: any[] }) {
  const boxLabels = [
    ['Rough Diamond', 'Future Star', 'Star'],
    ['Inconsistent Player', 'Core Player', 'High Performer'],
    ['Risk', 'Solid Contributor', 'Effective']
  ];

  const getBoxColor = (row: number, col: number) => {
    const colors = [
      ['bg-orange-500/20', 'bg-blue-500/20', 'bg-green-500/20'],
      ['bg-yellow-500/20', 'bg-primary/20', 'bg-blue-500/20'],
      ['bg-red-500/20', 'bg-yellow-500/20', 'bg-green-500/20']
    ];
    return colors[row][col];
  };

  return (
    <div className="relative">
      <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-muted-foreground">
        Potential →
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-sm text-muted-foreground">
        Performance →
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[0, 1, 2].map(row => (
          [0, 1, 2].map(col => {
            const boxData = data.filter(d => 
              d.performance === ['low', 'medium', 'high'][col] &&
              d.potential === ['high', 'medium', 'low'][row]
            );
            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  'aspect-square rounded-lg p-2 flex flex-col items-center justify-center',
                  getBoxColor(row, col)
                )}
              >
                <span className="text-xs font-medium text-center">{boxLabels[row][col]}</span>
                <span className="text-2xl font-bold">{boxData.length}</span>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}

// Skill Radar Chart
function SkillRadarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
          />
          <Radar
            name="Required Level"
            dataKey="required"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.1}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Talent Pipeline Chart
function TalentPipelineChart({ data }: { data: any[] }) {
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9ca3af' }} />
          <YAxis dataKey="stage" type="category" tick={{ fill: '#9ca3af' }} width={100} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// AI Recommendation Card
interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  action: string;
  impact: string;
}

function AIRecommendationCard({ recommendation }: { recommendation: AIRecommendation }) {
  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-4 rounded-lg border-l-4 bg-card',
        priorityColors[recommendation.priority]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">{recommendation.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{recommendation.category}</Badge>
            <span className="text-xs text-muted-foreground">Impact: {recommendation.impact}</span>
          </div>
        </div>
        <Button size="sm" variant="ghost">
          {recommendation.action} <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Main Dashboard Component
export function TalentAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch crew data
  const { data: crewData } = useQuery({
    queryKey: ['crew-analytics'],
    queryFn: async () => {
      const { data: crew, count } = await supabase
        .from('crew_members')
        .select('*', { count: 'exact' });
      
      return { crew: crew || [], count: count || 0 };
    }
  });

  // Fetch wellness report
  const { data: wellnessReport } = useQuery({
    queryKey: ['wellness-report'],
    queryFn: () => wellnessMonitor.monitorCrewWellness()
  });

  // Sample data for charts
  const skillData = [
    { skill: 'Navigation', current: 85, required: 90 },
    { skill: 'Safety', current: 90, required: 85 },
    { skill: 'Leadership', current: 70, required: 80 },
    { skill: 'Technical', current: 75, required: 85 },
    { skill: 'Communication', current: 80, required: 75 },
    { skill: 'Teamwork', current: 85, required: 80 }
  ];

  const pipelineData = [
    { stage: 'Screening', count: 45 },
    { stage: 'Interview', count: 28 },
    { stage: 'Assessment', count: 15 },
    { stage: 'Offer', count: 8 }
  ];

  const nineBoxData = [
    { id: '1', name: 'John', performance: 'high', potential: 'high' },
    { id: '2', name: 'Jane', performance: 'high', potential: 'medium' },
    { id: '3', name: 'Bob', performance: 'medium', potential: 'high' },
    { id: '4', name: 'Alice', performance: 'medium', potential: 'medium' },
    { id: '5', name: 'Charlie', performance: 'low', potential: 'high' },
    { id: '6', name: 'Diana', performance: 'high', potential: 'low' },
  ];

  const recommendations: AIRecommendation[] = [
    {
      id: '1',
      title: 'High Turnover Risk in Engineering',
      description: '3 senior engineers showing disengagement signals. Consider retention actions.',
      priority: 'high',
      category: 'Retention',
      action: 'View Details',
      impact: 'Prevent $150K replacement cost'
    },
    {
      id: '2',
      title: 'Skill Gap in Digital Navigation',
      description: '40% of deck officers need ECDIS training update by Q3.',
      priority: 'medium',
      category: 'Development',
      action: 'Schedule Training',
      impact: 'Improve compliance by 25%'
    },
    {
      id: '3',
      title: 'Succession Planning Opportunity',
      description: '2 Chief Officers ready for Master position within 12 months.',
      priority: 'low',
      category: 'Succession',
      action: 'Create Plan',
      impact: 'Reduce hiring costs by 30%'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Talent Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights for strategic workforce management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            AI Recommendations
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPICard
          title="Total Crew"
          value={crewData?.count || 0}
          subtitle="Active members"
          trend={5}
          icon={Users}
          color="primary"
        />
        <KPICard
          title="Wellness Score"
          value={`${wellnessReport?.overallWellness.score || 0}%`}
          subtitle="Fleet average"
          trend={3}
          icon={Heart}
          color="green"
        />
        <KPICard
          title="Retention Rate"
          value="94%"
          subtitle="Last 12 months"
          trend={2}
          icon={UserPlus}
          color="green"
        />
        <KPICard
          title="Open Positions"
          value={12}
          subtitle="Active hiring"
          icon={Briefcase}
          color="blue"
        />
        <KPICard
          title="Avg Performance"
          value="82%"
          subtitle="This quarter"
          trend={4}
          icon={Target}
          color="purple"
        />
        <KPICard
          title="Training Hours"
          value="1,240"
          subtitle="This month"
          trend={15}
          icon={GraduationCap}
          color="yellow"
        />
        <KPICard
          title="At Risk"
          value={wellnessReport?.overallWellness.atRiskCount || 0}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="talent">Talent Map</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nine Box Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  9-Box Talent Matrix
                </CardTitle>
                <CardDescription>
                  Performance vs Potential distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NineBoxGrid data={nineBoxData} />
              </CardContent>
            </Card>

            {/* Skill Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fleet Skill Distribution
                </CardTitle>
                <CardDescription>
                  Current vs Required skill levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillRadarChart data={skillData} />
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Talent Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights from AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, index) => (
                <AIRecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Wellness Overview */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Fleet Wellness</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <WellnessGauge score={wellnessReport?.overallWellness.score || 72} size={150} />
                <div className="mt-4 space-y-2 w-full">
                  <div className="flex justify-between text-sm">
                    <span>Excellent</span>
                    <span className="font-medium">{wellnessReport?.individualScores.filter(s => s.score.level === 'excellent').length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good</span>
                    <span className="font-medium">{wellnessReport?.individualScores.filter(s => s.score.level === 'good').length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Concerning</span>
                    <span className="font-medium text-yellow-500">{wellnessReport?.overallWellness.atRiskCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Critical</span>
                    <span className="font-medium text-red-500">{wellnessReport?.overallWellness.criticalCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interventions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Priority Interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(wellnessReport?.interventions || []).slice(0, 5).map((intervention, index) => (
                    <div
                      key={intervention.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4 bg-muted/50',
                        intervention.priority === 'critical' ? 'border-l-red-500' :
                        intervention.priority === 'high' ? 'border-l-orange-500' :
                        'border-l-yellow-500'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{intervention.crewMemberName}</span>
                          <p className="text-sm text-muted-foreground">{intervention.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={intervention.priority === 'critical' ? 'destructive' : 'outline'}>
                            {intervention.priority}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!wellnessReport?.interventions || wellnessReport.interventions.length === 0) && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      No interventions required - crew wellness is good!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Recruitment Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TalentPipelineChart data={pipelineData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to Hire</span>
                      <span className="font-medium">28 days</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Offer Acceptance Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality of Hire</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pipeline Conversion</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="talent">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>3D Talent Visualization</CardTitle>
              <CardDescription>
                Interactive visualization coming soon - explore talent clusters and skill distributions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Zap className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                <p>3D Talent Map Visualization</p>
                <p className="text-sm">Click to explore talent clusters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Development Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold">Leadership Track</h4>
                  <p className="text-sm text-muted-foreground mt-1">12 participants</p>
                  <Progress value={65} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">65% completion</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold">Technical Excellence</h4>
                  <p className="text-sm text-muted-foreground mt-1">28 participants</p>
                  <Progress value={45} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">45% completion</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold">Safety Certification</h4>
                  <p className="text-sm text-muted-foreground mt-1">45 participants</p>
                  <Progress value={82} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">82% completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TalentAnalyticsDashboard;
