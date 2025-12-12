/**
 * PATCH 574 - Dashboard de Internacionalização
 * Painel para monitorar uso multilíngue do sistema
 */

import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/core/i18n/ui-hooks";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, Globe, TrendingUp, AlertCircle } from "lucide-react";

interface LanguageStats {
  language: string;
  translation_count: number;
  user_count: number;
  region?: string;
}

interface TranslationLog {
  id: string;
  source_lang: string;
  target_lang: string;
  key: string;
  source_type: string;
  success: boolean;
  response_time_ms: number;
  created_at: string;
}

interface TranslationFeedback {
  id: string;
  original_translation: string;
  suggested_translation: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

const COLORS = {
  pt: "#10b981",
  en: "#3b82f6",
  es: "#f59e0b",
  fr: "#8b5cf6",
  de: "#ef4444",
};

const LANGUAGE_NAMES: Record<string, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export default function I18nDashboard() {
  const { t, language } = useTranslation();
  const [stats, setStats] = useState<LanguageStats[]>([]);
  const [logs, setLogs] = useState<TranslationLog[]>([]);
  const [feedback, setFeedback] = useState<TranslationFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas de uso
      const { data: statsData, error: statsError } = await supabase
        .from("language_usage_stats")
        .select("*")
        .gte(
          "date",
          getStartDate(timeRange)
        )
        .order("translation_count", { ascending: false });

      if (statsError) throw statsError;
      setStats(statsData || []);

      // Carregar logs de tradução
      const { data: logsData, error: logsError } = await supabase
        .from("translation_logs")
        .select("*")
        .gte(
          "created_at",
          getStartDate(timeRange)
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Carregar feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("translation_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);

      logger.info("[I18nDashboard] Data loaded successfully");
    } catch (error) {
      logger.error("[I18nDashboard] Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: "day" | "week" | "month"): string => {
    const date = new Date();
    switch (range) {
    case "day":
      date.setDate(date.getDate() - 1);
      break;
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
    }
    return date.toISOString();
  };

  const exportData = () => {
    const dataToExport = {
      stats,
      logs,
      feedback,
      exportedAt: new Date().toISOString(),
    });

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `i18n-dashboard-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Agregar dados para gráficos
  const aggregateByLanguage = stats.reduce((acc, stat) => {
    const existing = acc.find((item) => item.language === stat.language);
    if (existing) {
      existing.count += stat.translation_count;
    } else {
      acc.push({
        language: LANGUAGE_NAMES[stat.language] || stat.language,
        count: stat.translation_count,
        color: COLORS[stat.language as keyof typeof COLORS],
      });
    }
    return acc;
  }, [] as Array<{ language: string; count: number; color: string }>);

  const successRate =
    logs.length > 0
      ? ((logs.filter((log) => log.success).length / logs.length) * 100).toFixed(1)
      : "0.0";

  const avgResponseTime =
    logs.length > 0
      ? (
        logs.reduce((sum, log) => sum + log.response_time_ms, 0) / logs.length
      ).toFixed(0)
      : "0";

  const failedTranslations = logs.filter((log) => !log.success);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Globe className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="w-8 h-8" />
            {t("navigation.i18n_dashboard") || "i18n Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {t("i18n.dashboard_subtitle") || "Multilingual System Monitoring"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSetTimeRange}
            className={timeRange === "day" ? "bg-primary text-white" : ""}
          >
            24h
          </Button>
          <Button
            variant="outline"
            onClick={handleSetTimeRange}
            className={timeRange === "week" ? "bg-primary text-white" : ""}
          >
            7d
          </Button>
          <Button
            variant="outline"
            onClick={handleSetTimeRange}
            className={timeRange === "month" ? "bg-primary text-white" : ""}
          >
            30d
          </Button>
          <Button onClick={exportData} className="ml-4">
            <Download className="w-4 h-4 mr-2" />
            {t("common.export")}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("i18n.total_translations") || "Total Translations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("i18n.in_period") || "in selected period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("i18n.success_rate") || "Success Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t("i18n.translation_accuracy") || "translation accuracy"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("i18n.avg_response_time") || "Avg Response Time"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {t("i18n.per_translation") || "per translation"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("i18n.languages_active") || "Active Languages"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateByLanguage.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("i18n.of_5_supported") || "of 5 supported"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso por Idioma */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("i18n.usage_by_language") || "Usage by Language"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aggregateByLanguage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Idiomas */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("i18n.language_distribution") || "Language Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aggregateByLanguage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.language}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {aggregateByLanguage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Logs de Tradução com Falhas */}
      {failedTranslations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              {t("i18n.failed_translations") || "Failed Translations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedTranslations.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-mono text-sm">{log.key}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.source_lang} → {log.target_lang}
                    </div>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("i18n.user_feedback") || "User Feedback"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedback.slice(0, 10).map((item) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      Rating: {"⭐".repeat(item.rating)}
                    </div>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "default"
                          : item.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Original:</div>
                    <div className="font-mono">{item.original_translation}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Suggested:</div>
                    <div className="font-mono">{item.suggested_translation}</div>
                  </div>
                </div>
                {item.comment && (
                  <div className="text-sm text-muted-foreground">
                    {item.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
