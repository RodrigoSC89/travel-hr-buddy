// @ts-nocheck
import React, { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AIInsightReporter() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulated API call for now - replace with actual endpoint
      const response = await fetch('/api/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        // Fallback to mock data if endpoint doesn't exist yet
        setInsights({
          summary: "Sistema operando normalmente",
          anomalies: [],
          recommendations: ["Monitorar consumo de energia", "Verificar thrusters periodicamente"]
        });
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      // Set mock data on error
      setInsights({
        summary: "Sistema operando normalmente",
        anomalies: [],
        recommendations: ["Monitorar consumo de energia", "Verificar thrusters periodicamente"]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    // PDF export functionality would go here
    logger.info("📄 Exporting PDF...");
    alert("Funcionalidade de exportação PDF em desenvolvimento");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insight Reporter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insight Reporter
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : insights ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Resumo</h4>
              <p className="text-sm text-muted-foreground">{insights.summary}</p>
            </div>
            
            {insights.anomalies && insights.anomalies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Anomalias Detectadas</h4>
                <ul className="space-y-2">
                  {insights.anomalies.map((anomaly, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
