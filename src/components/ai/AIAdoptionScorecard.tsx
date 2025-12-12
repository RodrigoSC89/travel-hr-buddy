/**
 * PATCH 653 - AI Adoption Scorecard Component
 * Displays AI adoption metrics and trends
 */

import { memo, memo, useEffect, useState, useMemo } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles
} from "lucide-react";

interface AdoptionMetrics {
  totalInteractions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  avgResponseTime: number;
  adoptionScore: number;
  moduleBreakdown: Record<string, number>;
}

interface AIAdoptionScorecardProps {
  organizationId?: string;
  className?: string;
}

export const AIAdoptionScorecard = memo(function({ organizationId, className }: AIAdoptionScorecardProps) {
  const [metrics, setMetrics] = useState<AdoptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [organizationId]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch adoption metrics
      const { data: adoptionData, error: adoptionError } = await supabase
        .from("ia_adoption_metrics")
        .select("*")
        .gte("period_end", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .order("created_at", { ascending: false });

      if (adoptionError) throw adoptionError;

      // Fetch recent suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from("ia_suggestions_log")
        .select("accepted, suggestion_type")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (suggestionsError) throw suggestionsError;

      // Fetch performance logs
      const { data: performanceData, error: performanceError } = await supabase
        .from("ia_performance_log")
        .select("execution_time_ms, module_name")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (performanceError) throw performanceError;

      // Calculate metrics
      const totalInteractions = adoptionData?.reduce((sum, m) => sum + (m.total_interactions || 0), 0) || 0;
      const acceptedSuggestions = suggestionsData?.filter(s => s.accepted).length || 0;
      const rejectedSuggestions = suggestionsData?.filter(s => !s.accepted).length || 0;
      const avgResponseTime = performanceData?.length 
        ? performanceData.reduce((sum, p) => sum + (p.execution_time_ms || 0), 0) / performanceData.length 
        : 0;
      
      const adoptionScore = totalInteractions > 0 
        ? Math.round((acceptedSuggestions / (acceptedSuggestions + rejectedSuggestions || 1)) * 100)
        : 0;

      // Module breakdown
      const moduleBreakdown: Record<string, number> = {};
      performanceData?.forEach(p => {
        if (p.module_name) {
          moduleBreakdown[p.module_name] = (moduleBreakdown[p.module_name] || 0) + 1;
        }
      });

      setMetrics({
        totalInteractions,
        acceptedSuggestions,
        rejectedSuggestions,
        avgResponseTime: Math.round(avgResponseTime),
        adoptionScore,
        moduleBreakdown
      });

    } catch (error) {
      logger.error("Failed to fetch AI adoption metrics", error);
    } finally {
      setIsLoading(false);
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excelente", variant: "default" as const };
    if (score >= 60) return { label: "Bom", variant: "secondary" as const };
    if (score >= 40) return { label: "Regular", variant: "outline" as const };
    return { label: "Baixo", variant: "destructive" as const };
  };

  const scoreBadge = getScoreBadge(metrics?.adoptionScore || 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Adoção de IA</CardTitle>
          </div>
          <Badge variant={scoreBadge.variant}>
            <Sparkles className="h-3 w-3 mr-1" />
            {scoreBadge.label}
          </Badge>
        </div>
        <CardDescription>Métricas dos últimos 30 dias</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className="text-center py-4">
          <div className={`text-5xl font-bold ${getScoreColor(metrics?.adoptionScore || 0)}`}>
            {metrics?.adoptionScore || 0}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">Score de Adoção</p>
          <Progress 
            value={metrics?.adoptionScore || 0} 
            className="mt-3 h-2"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-semibold">{metrics?.totalInteractions || 0}</p>
              <p className="text-xs text-muted-foreground">Interações</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-semibold">{metrics?.avgResponseTime || 0}ms</p>
              <p className="text-xs text-muted-foreground">Tempo Médio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-semibold">{metrics?.acceptedSuggestions || 0}</p>
              <p className="text-xs text-muted-foreground">Aceitas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-semibold">{metrics?.rejectedSuggestions || 0}</p>
              <p className="text-xs text-muted-foreground">Rejeitadas</p>
            </div>
          </div>
        </div>

        {/* Module Breakdown */}
        {metrics?.moduleBreakdown && Object.keys(metrics.moduleBreakdown).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uso por Módulo</p>
            <div className="space-y-2">
              {Object.entries(metrics.moduleBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([module, count]) => (
                  <div key={module} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">{module}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
