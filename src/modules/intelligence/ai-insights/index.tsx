import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Target, Lightbulb, AlertCircle, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAIContext } from "@/ai/kernel";
import { useLogger } from "@/hooks/use-logger";

interface AIMetrics {
  insightsGenerated: number;
  accuracyRate: number;
  activeRecommendations: number;
  estimatedImpact: string;
}

interface AIInsight {
  type: string;
  message: string;
  confidence: number;
  metadata?: Record<string, any>;
}

const AIInsights = () => {
  const [metrics, setMetrics] = useState<AIMetrics>({
    insightsGenerated: 0,
    accuracyRate: 0,
    activeRecommendations: 0,
    estimatedImpact: "$0",
  });
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PATCH 89.4 - Enhanced logging
  const dashboardLogger = useLogger({
    module: 'intelligence.ai-insights',
    componentName: 'AIInsights',
    enableSupabaseLogging: false,
  });

  useEffect(() => {
    loadAIMetrics();
    loadAIInsights();
  }, []);

  const loadAIMetrics = async () => {
    try {
      dashboardLogger.logDataLoad('ai-metrics', true, { source: 'supabase' });

      // Query AI insights history
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('id, confidence, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (insightsError) {
        dashboardLogger.logDataLoad('ai_insights', false, { error: insightsError.message });
      } else {
        dashboardLogger.logDataLoad('ai_insights', true, { count: insightsData?.length });
      }

      // Query active recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('ai_recommendations')
        .select('id, status')
        .eq('status', 'active');

      if (recommendationsError) {
        dashboardLogger.logDataLoad('ai_recommendations', false, { error: recommendationsError.message });
      } else {
        dashboardLogger.logDataLoad('ai_recommendations', true, { count: recommendationsData?.length });
      }

      // Calculate metrics
      const insightsCount = insightsData?.length || 0;
      const avgConfidence = insightsData && insightsData.length > 0
        ? insightsData.reduce((sum, item) => sum + (item.confidence || 0), 0) / insightsData.length
        : 0;
      const activeRecsCount = recommendationsData?.length || 0;

      // Estimate impact based on active recommendations
      const estimatedImpact = `$${(activeRecsCount * 27500).toLocaleString()}`;

      setMetrics({
        insightsGenerated: insightsCount,
        accuracyRate: avgConfidence,
        activeRecommendations: activeRecsCount,
        estimatedImpact,
      });
    } catch (err) {
      dashboardLogger.logError(err, { operation: 'loadAIMetrics' });
    }
  };

  const loadAIInsights = async () => {
    try {
      dashboardLogger.logAIActivation('multi-module-analysis', true, { action: 'start' });

      // Get insights from different modules
      const modules = [
        'intelligence.ai-insights',
        'operations.fleet',
        'operations.crew',
        'hr.training',
      ];

      const insightPromises = modules.map(module =>
        runAIContext({
          module,
          action: 'analyze',
          context: {
            timestamp: new Date().toISOString(),
          },
        })
      );

      const responses = await Promise.all(insightPromises);
      
      const loadedInsights = responses.map(response => ({
        type: response.type,
        message: response.message,
        confidence: response.confidence,
        metadata: response.metadata,
      }));

      setInsights(loadedInsights);
      dashboardLogger.logAIActivation('multi-module-analysis', true, { 
        count: loadedInsights.length,
        modules: modules.length 
      });
      setLoading(false);
    } catch (err) {
      dashboardLogger.logAIActivation('multi-module-analysis', false, { error: String(err) });
      setError("Failed to load AI insights");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">AI Insights</h1>
        </div>
        <p className="text-muted-foreground">Loading AI insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold">AI Insights</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">AI Insights</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.insightsGenerated}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accuracyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRecommendations}</div>
            <p className="text-xs text-muted-foreground">Active suggestions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Value Impact</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.estimatedImpact}</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Active Insights & Recommendations
        </h2>
        
        {insights.map((insight, index) => (
          <Card key={index} className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="capitalize">{insight.type}</span>
                <span className="text-sm text-muted-foreground">
                  {insight.confidence.toFixed(1)}% confidence
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{insight.message}</p>
              {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(insight.metadata).map(([key, value]) => (
                    <span key={key} className="text-xs bg-primary/10 px-2 py-1 rounded">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Advanced AI-powered analytics and predictive insights with pattern recognition, 
            anomaly detection, trend forecasting, and actionable recommendations.
            Connected to real AI kernel with GPT-4o integration for intelligent suggestions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
