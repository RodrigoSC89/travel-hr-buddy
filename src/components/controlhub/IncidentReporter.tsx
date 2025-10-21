/**
 * IncidentReporter Component
 * Displays AI Insight reports and incidents in real-time
 */

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Report {
  id: string;
  title: string;
  summary: string;
  timestamp?: string;
}

export default function IncidentReporter() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Try to fetch from API - in production this would be a real endpoint
        // For now, simulate with empty array
        setReports([]);
      } catch (error) {
        console.error("Erro ao carregar relatórios AI:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <Card aria-label="Relatórios AI Insight">
      <CardHeader>
        <CardTitle>Relatórios AI Insight</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum incidente relatado</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="border-b border-gray-700 pb-2">
                <strong>{r.title}</strong>
                <p className="text-sm text-muted-foreground">{r.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
