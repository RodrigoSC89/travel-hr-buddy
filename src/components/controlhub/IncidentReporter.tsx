import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText } from "lucide-react";

interface AIInsightReport {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  severity?: "low" | "medium" | "high" | "critical";
}

/**
 * IncidentReporter - AI Insight Reports Display
 * 
 * Displays AI-generated incident reports and insights from the system.
 * 
 * Features:
 * - Displays AI-generated incident reports
 * - Shows title, summary, and timestamp
 * - Loading and empty states
 * - Accessible card structure
 * - Severity badges for quick identification
 * 
 * WCAG 2.1 AA Compliant:
 * - Proper heading hierarchy
 * - Semantic HTML structure
 * - ARIA live regions for dynamic content
 * - Icons marked as decorative
 * - Color contrast meets AA standards
 */
export default function IncidentReporter() {
  const [reports, setReports] = useState<AIInsightReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/ai-insights");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        } else {
          console.warn("Failed to fetch AI insights, using empty array");
          setReports([]);
        }
      } catch (error) {
        console.error("Error fetching AI insights:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "default";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <section aria-labelledby="incident-reporter-heading">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-[var(--nautilus-primary)]" aria-hidden="true" />
            <div>
              <CardTitle 
                id="incident-reporter-heading"
                role="heading"
                aria-level={2}
              >
                AI Insight Reporter
              </CardTitle>
              <CardDescription>
                Relatórios e análises geradas por IA
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div 
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" aria-hidden="true" />
              <p>Carregando insights...</p>
            </div>
          ) : reports.length > 0 ? (
            <div 
              className="space-y-4"
              role="list"
              aria-label="Lista de relatórios de IA"
            >
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className="border-l-4 border-[var(--nautilus-accent)]"
                  role="listitem"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <FileText className="h-5 w-5 mt-1 text-[var(--nautilus-primary)]" aria-hidden="true" />
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          {report.severity && (
                            <Badge 
                              variant={getSeverityColor(report.severity) as any}
                              className="mt-2"
                            >
                              {report.severity.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <time 
                        className="text-sm text-muted-foreground whitespace-nowrap"
                        dateTime={report.timestamp}
                      >
                        {formatTimestamp(report.timestamp)}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p>Nenhum relatório disponível no momento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
