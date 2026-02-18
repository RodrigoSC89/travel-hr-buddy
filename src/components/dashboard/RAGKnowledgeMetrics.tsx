/**
 * Wave 38: RAG Knowledge Metrics
 * Knowledge base health, article quality scoring, coverage analytics
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Star, Eye, ThumbsUp, Layers, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RAGKnowledgeMetrics() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['rag-knowledge-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, title, module, type, status, difficulty, rating, views, helpful_votes, created_at, tags')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const published = articles.filter(a => a.status === 'published' || a.status === 'active');
    const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);
    const totalVotes = articles.reduce((s, a) => s + (a.helpful_votes || 0), 0);
    const avgRating = articles.length > 0
      ? articles.reduce((s, a) => s + (a.rating || 0), 0) / articles.filter(a => a.rating).length || 0
      : 0;

    // By module coverage
    const byModule: Record<string, number> = {};
    articles.forEach(a => {
      const m = a.module || 'general';
      byModule[m] = (byModule[m] || 0) + 1;
    });

    // By type
    const byType: Record<string, number> = {};
    articles.forEach(a => {
      const t = a.type || 'article';
      byType[t] = (byType[t] || 0) + 1;
    });

    // Quality score (0-100): based on avg rating, helpful votes ratio, coverage breadth
    const ratingScore = (avgRating / 5) * 40;
    const coverageScore = Math.min(Object.keys(byModule).length / 10, 1) * 30;
    const engagementScore = Math.min(totalVotes / Math.max(articles.length, 1) / 5, 1) * 30;
    const qualityScore = Math.round(ratingScore + coverageScore + engagementScore);

    return {
      totalArticles: articles.length,
      published: published.length,
      totalViews,
      totalVotes,
      avgRating: avgRating.toFixed(1),
      qualityScore,
      byModule: Object.entries(byModule).sort(([,a],[,b]) => b - a).slice(0, 6),
      byType: Object.entries(byType).sort(([,a],[,b]) => b - a).slice(0, 4),
      topArticles: articles.filter(a => a.views).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3),
    };
  }, [articles]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-hub-ai" />
            RAG Knowledge Metrics
          </CardTitle>
          <Badge variant="outline" className={metrics.qualityScore >= 70
            ? 'bg-success/10 text-success border-success/20'
            : metrics.qualityScore >= 40
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }>
            {metrics.qualityScore}/100 quality
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Layers, value: metrics.totalArticles, label: 'Artigos', color: 'text-primary' },
            { icon: Eye, value: metrics.totalViews.toLocaleString(), label: 'Views', color: 'text-muted-foreground' },
            { icon: Star, value: metrics.avgRating, label: 'Rating', color: 'text-warning' },
            { icon: ThumbsUp, value: metrics.totalVotes, label: 'Úteis', color: 'text-success' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Quality Score Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Knowledge Quality Score</span>
            <span>{metrics.qualityScore}%</span>
          </div>
          <Progress value={metrics.qualityScore} className="h-2" />
        </div>

        {/* Module Coverage */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Cobertura por Módulo</p>
          {metrics.byModule.map(([mod, count]) => (
            <div key={mod} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-sm text-foreground capitalize">{mod.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-16">
                  <Progress value={(count / Math.max(metrics.totalArticles, 1)) * 100} className="h-1.5" />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            </div>
          ))}
          {metrics.byModule.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum artigo na knowledge base</p>
          )}
        </div>

        {/* Top viewed articles */}
        {metrics.topArticles.length > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Mais Consultados</p>
            {metrics.topArticles.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                <span className="truncate text-foreground">{a.title}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {a.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
