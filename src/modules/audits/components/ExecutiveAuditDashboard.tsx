/**
 * 📊 Executive Audit Dashboard - World-Class Visualization
 * NAUTILUS ONE v5.0 - Executive Intelligence Suite
 * 
 * Comprehensive dashboard with AI insights, predictions, and benchmarking
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, FileCheck, BarChart3, Brain, Target, Award, Zap,
  Globe, Ship, Users, Calendar, Activity, ArrowRight
} from 'lucide-react';
import { predictiveAuditEngine, type AuditPrediction } from '../services/PredictiveAuditEngine';
import { auditRiskAnalyzer, type RiskPrediction } from '../ml/RiskAnalysisModel';
import { AuditTimeline3D, type TimelineEvent } from './AuditTimeline3D';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const colorClasses = {
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
          <div className={cn('p-2 rounded-lg', colorClasses[color as keyof typeof colorClasses])}>
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

// AI Insight Card
interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  category: string;
}

function AIInsightsFeed({ insights }: { insights: AIInsight[] }) {
  const priorityColors = {
    low: 'border-l-green-500 bg-green-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    high: 'border-l-orange-500 bg-orange-500/5',
    critical: 'border-l-red-500 bg-red-500/5'
  };

  const priorityIcons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: Zap
  };

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => {
        const Icon = priorityIcons[insight.priority];
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex gap-3 p-4 rounded-lg border-l-4',
              priorityColors[insight.priority]
            )}
          >
            <div className="flex-shrink-0">
              <Icon className={cn(
                'h-5 w-5',
                insight.priority === 'critical' ? 'text-red-500' :
                insight.priority === 'high' ? 'text-orange-500' :
                insight.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              
              {insight.actionable && (
                <Button size="sm" variant="link" className="mt-2 h-auto p-0">
                  Take Action <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {insight.confidence}% conf.
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Benchmark Comparison Component
function BenchmarkComparison({ data }: { data: any }) {
  const benchmarkData = [
    { metric: 'Compliance Score', fleet: data?.fleetScore || 92, industry: 89 },
    { metric: 'Audit Pass Rate', fleet: data?.passRate || 96, industry: 91 },
    { metric: 'Finding Closure', fleet: data?.closureRate || 88, industry: 82 },
    { metric: 'Response Time', fleet: data?.responseTime || 85, industry: 75 },
    { metric: 'Documentation', fleet: data?.docScore || 94, industry: 87 },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={benchmarkData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <Radar
            name="Your Fleet"
            dataKey="fleet"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Industry Average"
            dataKey="industry"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Trend Chart with Prediction
function TrendWithPrediction({ data }: { data: any[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
          <YAxis tick={{ fill: '#9ca3af' }} domain={[70, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="score"
            fill="#6366f1"
            fillOpacity={0.3}
            stroke="#6366f1"
            strokeWidth={2}
            name="Actual Score"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="AI Prediction"
            dot={false}
          />
          <Bar
            dataKey="findings"
            fill="#ef4444"
            opacity={0.5}
            name="Findings"
            barSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Risk Heat Map
function RiskHeatMap({ data }: { data: any[] }) {
  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
  
  const heatMapData = data || [
    { name: 'Safety', risk: 25 },
    { name: 'Documentation', risk: 35 },
    { name: 'Equipment', risk: 45 },
    { name: 'Training', risk: 20 },
    { name: 'Environmental', risk: 30 },
    { name: 'Security', risk: 15 }
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {heatMapData.map((item, index) => {
        const colorIndex = Math.min(Math.floor(item.risk / 25), 3);
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg text-center"
            style={{ backgroundColor: `${COLORS[colorIndex]}20`, borderLeft: `3px solid ${COLORS[colorIndex]}` }}
          >
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-2xl font-bold" style={{ color: COLORS[colorIndex] }}>
              {item.risk}%
            </div>
            <div className="text-xs text-muted-foreground">Risk Level</div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Dashboard Component
export function ExecutiveAuditDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  // Fetch audit analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['audit-analytics'],
    queryFn: async () => {
      // Fetch audit counts
      const { count: totalAudits } = await supabase
        .from('peotram_audits')
        .select('*', { count: 'exact', head: true });

      const { count: scheduledAudits } = await supabase
        .from('peotram_audits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'agendado');

      const { data: recentAudits } = await supabase
        .from('peotram_audits')
        .select('compliance_score, audit_date, status')
        .order('audit_date', { ascending: false })
        .limit(12);

      const avgScore = recentAudits?.length 
        ? recentAudits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / recentAudits.length
        : 0;

      return {
        totalAudits: totalAudits || 0,
        scheduledAudits: scheduledAudits || 0,
        complianceRate: avgScore,
        improvement: 8.2,
        passRate: 94,
        avgFindings: 3.2,
        recentAudits
      };
    }
  });

  // Generate trend data
  const trendData = [
    { month: 'Jan', score: 88, predicted: null, findings: 5 },
    { month: 'Feb', score: 89, predicted: null, findings: 4 },
    { month: 'Mar', score: 91, predicted: null, findings: 4 },
    { month: 'Apr', score: 90, predicted: null, findings: 5 },
    { month: 'May', score: 92, predicted: null, findings: 3 },
    { month: 'Jun', score: 93, predicted: null, findings: 3 },
    { month: 'Jul', score: 94, predicted: 94, findings: 2 },
    { month: 'Aug', score: null, predicted: 95, findings: null },
    { month: 'Sep', score: null, predicted: 95, findings: null },
    { month: 'Oct', score: null, predicted: 96, findings: null },
  ];

  // Sample AI insights
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Certificate Renewal Alert',
      description: '3 vessels have certificates expiring within 60 days. Schedule renewals to avoid compliance gaps.',
      priority: 'high',
      confidence: 95,
      actionable: true,
      category: 'certification'
    },
    {
      id: '2',
      title: 'Predicted Finding Pattern',
      description: 'Historical analysis shows increased documentation findings in Q4. Recommend proactive review.',
      priority: 'medium',
      confidence: 82,
      actionable: true,
      category: 'prediction'
    },
    {
      id: '3',
      title: 'Fleet Performance Improving',
      description: 'Overall compliance score trending 8% above industry average over last 6 months.',
      priority: 'low',
      confidence: 91,
      actionable: false,
      category: 'trend'
    }
  ];

  // Sample timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date('2025-01-10'),
      type: 'audit',
      severity: 'low',
      title: 'ISM Internal Audit',
      description: 'Annual internal audit completed successfully',
      status: 'completed',
      score: 94
    },
    {
      id: '2',
      date: new Date('2025-01-15'),
      type: 'finding',
      severity: 'medium',
      title: 'SMS Documentation Gap',
      description: 'Minor gaps identified in SMS revision tracking',
      status: 'in_progress',
      assignedTo: 'John Smith'
    },
    {
      id: '3',
      date: new Date('2025-01-20'),
      type: 'action',
      severity: 'low',
      title: 'SMS Update Implementation',
      description: 'Corrective action for documentation gap',
      status: 'pending'
    },
    {
      id: '4',
      date: new Date('2025-02-01'),
      type: 'audit',
      severity: 'low',
      title: 'ISPS Verification',
      description: 'Scheduled ISPS security verification',
      status: 'pending'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Executive Audit Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered audit intelligence and compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Run AI Analysis
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <KPICard
          title="Total Audits"
          value={analytics?.totalAudits || 0}
          subtitle="This year"
          trend={12}
          icon={FileCheck}
          color="primary"
        />
        <KPICard
          title="Scheduled"
          value={analytics?.scheduledAudits || 0}
          subtitle="Next 30 days"
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="Compliance Rate"
          value={`${(analytics?.complianceRate || 0).toFixed(1)}%`}
          subtitle="Fleet average"
          trend={analytics?.improvement}
          icon={Shield}
          color="green"
        />
        <KPICard
          title="Pass Rate"
          value={`${analytics?.passRate || 0}%`}
          subtitle="First attempt"
          trend={3}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Avg Findings"
          value={analytics?.avgFindings || 0}
          subtitle="Per audit"
          trend={-15}
          icon={AlertTriangle}
          color="yellow"
        />
        <KPICard
          title="Open Actions"
          value={12}
          subtitle="Pending closure"
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="Vessels"
          value={8}
          subtitle="Active fleet"
          icon={Ship}
          color="blue"
        />
        <KPICard
          title="AI Confidence"
          value="94%"
          subtitle="Prediction accuracy"
          icon={Brain}
          color="purple"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend with Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Audit Score Trend & AI Prediction
            </CardTitle>
            <CardDescription>
              Historical scores with AI-powered forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendWithPrediction data={trendData} />
          </CardContent>
        </Card>

        {/* Risk Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Risk Heat Map by Category
            </CardTitle>
            <CardDescription>
              Current risk levels across audit areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskHeatMap data={[]} />
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Industry Benchmarking
          </CardTitle>
          <CardDescription>
            How your fleet compares with industry averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BenchmarkComparison data={null} />
        </CardContent>
      </Card>

      {/* 3D Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Audit Timeline (3D Interactive)
          </CardTitle>
          <CardDescription>
            Explore audit history in an immersive 3D view
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AuditTimeline3D 
            events={timelineEvents}
            onEventSelect={(event) => console.log('Selected:', event)}
            onAction={(event, action) => console.log('Action:', event, action)}
          />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Intelligent recommendations based on data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIInsightsFeed insights={aiInsights} />
        </CardContent>
      </Card>
    </div>
  );
}

export default ExecutiveAuditDashboard;
