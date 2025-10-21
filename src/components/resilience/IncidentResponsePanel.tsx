// @ts-nocheck
/**
 * Incident Response Panel
 * Displays automated incident reports with real-time updates via Supabase
 */

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Incident {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  level: string;
  score: number;
  recommendation: string;
}

export default function IncidentResponsePanel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetchIncidents();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel("incident_watch")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "incident_reports" 
      }, fetchIncidents)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchIncidents() {
    const { data } = await supabase
      .from("incident_reports")
      .select("*")
      .order("timestamp", { ascending: false });
    
    setIncidents(data || []);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <AlertTriangle /> Resposta Automática a Incidentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum incidente detectado
          </p>
        ) : (
          incidents.map((i) => (
            <div key={i.id} className="border-b border-gray-700 py-2">
              <div className="flex justify-between">
                <span className="font-semibold">{i.type}</span>
                <span className="text-xs text-gray-400">
                  {new Date(i.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-1">{i.description}</p>
              <p className={`text-sm mt-1 ${
                i.level === "Não Conforme" 
                  ? "text-red-400" 
                  : i.level === "Risco" 
                  ? "text-yellow-400" 
                  : "text-green-400"
              }`}>
                {i.level} ({(i.score * 100).toFixed(1)}%)
              </p>
              <p className="text-xs text-gray-500 mt-1 italic">
                <FileText className="inline w-3 h-3 mr-1" /> 
                {i.recommendation}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
