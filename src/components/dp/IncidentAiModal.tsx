"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function IncidentAiModal() {
  const [incident, setIncident] = useState<unknown>(null);
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const checkForIncident = () => {
      const data = localStorage.getItem("incident_to_analyze");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setIncident(parsed);
          setOpen(true);
          setAnalysis(""); // Reset analysis when new incident is loaded
          localStorage.removeItem("incident_to_analyze");
        } catch (error) {
          console.error("Error parsing incident data:", error);
        }
      }
    };

    // Check immediately on mount
    checkForIncident();

    // Listen for storage events (triggered by other windows/tabs or manual dispatch)
    const handleStorageChange = () => {
      checkForIncident();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!incident) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("dp-intel-analyze", {
        body: { incident },
      });

      if (error) {
        console.error("Error calling AI analysis:", error);
        toast.error("Erro ao analisar incidente", {
          description: error.message || "Tente novamente mais tarde",
        });
        setAnalysis("Erro ao processar análise. Por favor, tente novamente.");
        return;
      }

      if (data?.result) {
        setAnalysis(data.result);
        toast.success("Análise concluída com sucesso");
      } else {
        setAnalysis("Análise não retornou resultados.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro inesperado ao analisar incidente");
      setAnalysis("Erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setAnalysis("");
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análise IA – {incident.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {incident.summary || incident.description || "Sem descrição"}
          </p>
          
          {!analysis && (
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? "Analisando..." : "Executar análise IA"}
            </Button>
          )}
          
          {analysis && (
            <>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-line border">
                {analysis}
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={loading} 
                variant="outline"
                className="w-full"
              >
                {loading ? "Analisando..." : "Executar nova análise"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
