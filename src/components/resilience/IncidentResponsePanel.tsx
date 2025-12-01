// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * IncidentResponsePanel - Real-time monitoring of AI-detected incidents
 * Displays incidents with compliance scores and AI recommendations
 */
export default function IncidentResponsePanel() {
  const [incidents, setIncidents] = useState([]);

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
      .order("timestamp", { ascending: false })
      .limit(10);
    
    setIncidents(data || []);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Resposta Automática a Incidentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum incidente registrado.</p>
          ) : (
            incidents.map((i) => (
              <div key={i.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold">{i.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(i.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm">{i.description}</p>
                
                <div className="flex justify-between items-center">
                  <p className={`text-sm font-semibold ${
                    i.level === "Não Conforme" 
                      ? "text-red-400" 
                      : i.level === "Risco" 
                        ? "text-yellow-400" 
                        : "text-green-400"
                  }`}>
                    {i.level} ({(i.score * 100).toFixed(1)}%)
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground italic">
                  {i.recommendation}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
