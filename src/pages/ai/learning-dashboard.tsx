/**
 * PATCH 509: AI Learning Dashboard
 * Visualize AI self-reflection and continuous learning metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LearningInsight {
  action_type: string;
  avg_composite_score: number;
  avg_accuracy: number;
  avg_utility: number;
  avg_user_rating: number;
  total_actions: number;
  improvement_trend: string;
}

interface ImprovementSuggestion {
  action_type: string;
  suggestion: string;
  priority: number;
  based_on_samples: number;
}

interface LearningProgress {
  date: string;
  avg_score: number;
  actions_count: number;
}

export default function AILearningDashboard() {
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load learning insights
      const { data: insightsData, error: insightsError } = await supabase
        .rpc('get_ai_learning_insights', { p_days: timeRange });

      if (insightsError) throw insightsError;
      setInsights(insightsData || []);

      // Load improvement suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .rpc('get_ai_improvement_suggestions', { p_limit: 10 });

      if (suggestionsError) throw suggestionsError;
      setSuggestions(suggestionsData || []);

      // Load learning progress
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_ai_learning_progress', { p_days: timeRange });

      if (progressError) throw progressError;
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error loading AI learning data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'excellent':
      case 'good':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'needs_improvement':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      excellent: 'default',
      good: 'default',
      needs_improvement: 'secondary',
      poor: 'destructive',
    };
    return <Badge variant={variants[trend] || 'secondary'}>{trend.replace('_', ' ')}</Badge>;
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-yellow-600';
      case 3:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const exportLearningData = () => {
    const data = {
      insights,
      suggestions,
      progress,
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-learning-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Learning data exported successfully',
    });
  };

  const calculateOverallScore = () => {
    if (insights.length === 0) return 0;
    const total = insights.reduce((sum, insight) => sum + insight.avg_composite_score, 0);
    return (total / insights.length) * 100;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Learning Dashboard
          </h1>
          <p className="text-muted-foreground">Self-reflection and continuous improvement metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLearningData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <Button
            key={days}
            variant={timeRange === days ? 'default' : 'outline'}
            onClick={() => setTimeRange(days)}
            size="sm"
          >
            Last {days} days
          </Button>
        ))}
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall AI Performance</CardTitle>
          <CardDescription>Composite score across all action types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-2xl font-bold">{calculateOverallScore().toFixed(1)}%</span>
            </div>
            <Progress value={calculateOverallScore()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
          <TabsTrigger value="suggestions">Improvements</TabsTrigger>
          <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Loading insights...</p>
              </CardContent>
            </Card>
          ) : insights.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No learning data available yet. The AI will start collecting insights as it processes tasks.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <Card key={insight.action_type}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg capitalize">
                        {insight.action_type.replace('_', ' ')}
                      </CardTitle>
                      {getTrendBadge(insight.improvement_trend)}
                    </div>
                    <CardDescription>{insight.total_actions} actions analyzed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Composite Score</span>
                        <span className="font-semibold">
                          {(insight.avg_composite_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={insight.avg_composite_score * 100} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-semibold">
                          {(insight.avg_accuracy * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Utility</div>
                        <div className="font-semibold">
                          {(insight.avg_utility * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {insight.avg_user_rating > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">User Rating:</span>
                        <span className="font-semibold">
                          {insight.avg_user_rating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Loading suggestions...</p>
              </CardContent>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No improvement suggestions available. Keep using the AI to generate insights.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <Card key={idx}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`font-bold text-lg ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority === 1 ? '!' : suggestion.priority === 2 ? '⚠' : 'ℹ'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold capitalize">
                          {suggestion.action_type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.suggestion}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Based on {suggestion.based_on_samples} samples
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Over Time</CardTitle>
              <CardDescription>Track AI performance improvement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading progress data...</p>
                </div>
              ) : progress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No progress data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progress.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avg_score" 
                      stroke="#8884d8" 
                      name="Average Score"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Actions Count</CardTitle>
              <CardDescription>Number of AI actions per day</CardDescription>
            </CardHeader>
            <CardContent>
              {progress.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={progress.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="actions_count" fill="#82ca9d" name="Actions" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
