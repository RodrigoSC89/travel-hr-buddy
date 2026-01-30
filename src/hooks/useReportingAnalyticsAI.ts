/**
 * Hook for Reporting & Analytics AI Module
 * Custom reports, executive dashboards, KPI visualization, AI insights
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'safety' | 'compliance' | 'hr' | 'environmental';
  format: 'pdf' | 'excel' | 'powerpoint' | 'dashboard';
  parameters: Array<{ name: string; type: string; required: boolean; defaultValue?: unknown }>;
  schedule?: { frequency: string; recipients: string[]; nextRun: string };
  lastGenerated?: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  generatedAt: string;
  format: string;
  size: number;
  url: string;
  parameters: Record<string, unknown>;
  expiresAt: string;
}

export interface ExecutiveKPI {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'on_track' | 'at_risk' | 'behind';
  sparkline: number[];
  lastUpdated: string;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  relatedKPIs: string[];
  suggestedActions: string[];
  createdAt: string;
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: Array<{
    id: string;
    type: 'kpi' | 'chart' | 'table' | 'map' | 'gauge' | 'list';
    title: string;
    dataSource: string;
    config: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }>;
  filters: Array<{ field: string; operator: string; value: unknown }>;
  refreshInterval: number;
  isPublic: boolean;
}

export function useReportingAnalyticsAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReportTemplates = useCallback(async (
    category?: string
  ): Promise<ReportTemplate[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'get_report_templates',
          category
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.reportTemplates;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar templates';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (
    templateId: string,
    parameters: Record<string, unknown>,
    format: 'pdf' | 'excel' | 'powerpoint' = 'pdf'
  ): Promise<GeneratedReport | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'generate_report',
          templateId,
          parameters,
          format
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Relatório Gerado',
        description: `Formato: ${format.toUpperCase()}`,
      });

      return data.generatedReport;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getExecutiveKPIs = useCallback(async (
    category?: string
  ): Promise<ExecutiveKPI[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'get_executive_kpis',
          category
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.executiveKPIs;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar KPIs';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAIInsights = useCallback(async (): Promise<AIInsight[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'get_ai_insights'
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      const highImpact = data.aiInsights?.filter(
        (i: AIInsight) => i.impact === 'high'
      ).length || 0;

      if (highImpact > 0) {
        toast({
          title: 'Insights de Alto Impacto',
          description: `${highImpact} insights precisam de atenção`,
        });
      }

      return data.aiInsights;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar insights';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createCustomReport = useCallback(async (
    config: {
      name: string;
      description: string;
      dataSource: string;
      columns: string[];
      filters: Array<{ field: string; operator: string; value: unknown }>;
      groupBy?: string[];
      sortBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
      charts?: Array<{ type: string; config: Record<string, unknown> }>;
    }
  ): Promise<ReportTemplate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'create_custom_report',
          config
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Relatório Criado',
        description: `${config.name} salvo com sucesso`,
      });

      return data.reportTemplate;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar relatório';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveDashboard = useCallback(async (
    dashboard: Omit<DashboardConfig, 'id'>
  ): Promise<DashboardConfig | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'save_dashboard',
          dashboard
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Dashboard Salvo',
        description: `${dashboard.name} atualizado`,
      });

      return data.dashboardConfig;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar dashboard';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const scheduleReport = useCallback(async (
    templateId: string,
    schedule: { frequency: 'daily' | 'weekly' | 'monthly'; time: string; recipients: string[] }
  ): Promise<{ scheduled: boolean; nextRun: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('reporting-analytics-ai', {
        body: { 
          action: 'schedule_report',
          templateId,
          schedule
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Agendamento Configurado',
        description: `Frequência: ${schedule.frequency}`,
      });

      return data.scheduleResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao agendar relatório';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    getReportTemplates,
    generateReport,
    getExecutiveKPIs,
    getAIInsights,
    createCustomReport,
    saveDashboard,
    scheduleReport
  };
}
