/**
 * IncidentReporter Component
 * Integration with AI-powered incident reporting
 * 
 * Features:
 * - Displays AI-generated incident reports
 * - Shows title, summary, timestamp, and severity badges
 * - Loading and empty states
 * - Accessible card structure with proper ARIA labels
 * - WCAG 2.1 AA compliant
 * 
 * @module IncidentReporter
 * @version 2.0.0 (Patch 9)
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIReport {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
  severity: "info" | "warning" | "error" | "critical";
  confidence: number;
}

interface IncidentReporterProps {
  className?: string;
}

export default function IncidentReporter({ className }: IncidentReporterProps) {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/ai-insights");
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        // Mock data for development
        setReports([]);
      }
    } catch (error) {
      console.error("❌ Falha ao carregar relatórios de IA:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: AIReport["severity"]) => {
    const variants: Record<AIReport["severity"], { color: string; icon: string; label: string }> = {
      info: { color: "bg-blue-500", icon: "ℹ️", label: "Info" },
      warning: { color: "bg-yellow-500", icon: "⚠️", label: "Aviso" },
      error: { color: "bg-orange-500", icon: "❌", label: "Erro" },
      critical: { color: "bg-red-500", icon: "🚨", label: "Crítico" },
    };

    const { color, icon, label } = variants[severity];

    return (
      <Badge className={color} aria-label={`Severidade: ${label}`}>
        <span aria-hidden="true">{icon}</span> {label}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    let variant: "default" | "secondary" | "outline" = "outline";
    
    if (percentage >= 80) variant = "default";
    else if (percentage >= 60) variant = "secondary";

    return (
      <Badge variant={variant} aria-label={`Confiança: ${percentage}%`}>
        🎯 {percentage}%
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            🤖 AI Insight Reporter
          </CardTitle>
          <CardDescription>
            Relatórios de incidentes gerados por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="status"
            aria-live="polite"
            aria-label="Carregando relatórios..."
            className="flex items-center justify-center p-8 text-muted-foreground"
          >
            Carregando relatórios...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle role="heading" aria-level={2}>
              🤖 AI Insight Reporter
            </CardTitle>
            <CardDescription>
              Relatórios de incidentes gerados por IA
            </CardDescription>
          </div>
          <Badge variant="outline" aria-label={`${reports.length} relatórios`}>
            {reports.length} {reports.length === 1 ? "Relatório" : "Relatórios"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center text-muted-foreground p-8"
          >
            Nenhum relatório de IA disponível no momento.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-l-4 border-l-[var(--nautilus-secondary)]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <CardTitle className="text-base" role="heading" aria-level={3}>
                          {report.title}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          {getSeverityBadge(report.severity)}
                          {getConfidenceBadge(report.confidence)}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {formatTimestamp(report.timestamp)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {report.summary}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
