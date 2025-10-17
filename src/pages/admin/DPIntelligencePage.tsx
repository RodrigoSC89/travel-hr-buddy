import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Brain } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Incident = {
  id: string;
  title: string;
  vessel?: string;
  date?: string;
  root_cause?: string;
  class_dp?: string;
  severity?: string;
  gpt_analysis?: any;
  updated_at?: string;
};

export default function DPIntelligencePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching incidents:", error);
        toast.error("Erro ao carregar incidentes", {
          description: error.message
        });
        return;
      }

      // Calculate severity based on root cause and class
      const incidentsWithSeverity = (data || []).map((inc) => ({
        ...inc,
        severity: determineSeverity(inc),
      }));

      setIncidents(incidentsWithSeverity);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
    }
  }

  function determineSeverity(incident: any): string {
    const criticalKeywords = ["loss of position", "drive off", "blackout"];
    const highKeywords = ["thruster failure", "reference loss", "pms"];

    const text = `${incident.title || ""} ${incident.root_cause || ""}`.toLowerCase();

    if (criticalKeywords.some((keyword) => text.includes(keyword))) {
      return "Crítico";
    }
    if (highKeywords.some((keyword) => text.includes(keyword))) {
      return "Alto";
    }
    if (incident.class_dp?.includes("3")) {
      return "Alto";
    }
    return "Médio";
  }

  async function handleExplain(id: string) {
    try {
      setAnalyzingId(id);
      
      // Find the incident to analyze
      const incident = incidents.find((inc) => inc.id === id);
      if (!incident) {
        toast.error("Incidente não encontrado");
        return;
      }

      // Call the Supabase Edge Function to analyze the incident
      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident }
      });

      if (error) {
        console.error("Error analyzing incident:", error);
        toast.error("Erro ao analisar incidente", {
          description: error.message || "Tente novamente mais tarde"
        });
        return;
      }

      // Update the incident with the analysis result
      if (data?.result) {
        const { error: updateError } = await supabase
          .from("dp_incidents")
          .update({ 
            gpt_analysis: { result: data.result },
            updated_at: new Date().toISOString()
          })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating incident:", updateError);
          toast.error("Erro ao salvar análise");
          return;
        }

        toast.success("Análise concluída com sucesso");
        
        // Refresh the incidents list
        await fetchIncidents();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao analisar incidente");
    } finally {
      setAnalyzingId(null);
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            🧠 Centro de Inteligência DP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando incidentes...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Navio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>IA</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.title}</TableCell>
                    <TableCell>{incident.vessel || "-"}</TableCell>
                    <TableCell>{formatDate(incident.date)}</TableCell>
                    <TableCell>{incident.severity || "-"}</TableCell>
                    <TableCell>
                      {incident.gpt_analysis ? (
                        <pre className="text-xs whitespace-pre-wrap bg-slate-100 p-2 rounded-md max-w-md">
                          {JSON.stringify(incident.gpt_analysis, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-gray-400 italic">Não analisado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        disabled={analyzingId === incident.id}
                        onClick={() => handleExplain(incident.id)}
                      >
                        {analyzingId === incident.id ? "Analisando..." : "Explicar com IA"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
