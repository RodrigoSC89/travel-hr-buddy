import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SGSOHistoryTable } from "@/components/sgso/SGSOHistoryTable";
import { ArrowLeft, RefreshCw, Ship } from "lucide-react";
import { toast } from "sonner";

interface DPIncident {
  description?: string;
  updated_at?: string;
  sgso_category?: string;
  sgso_risk_level?: string;
  title?: string;
  date?: string;
}

interface ActionPlan {
  id: string;
  corrective_action?: string;
  preventive_action?: string;
  recommendation?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  dp_incidents?: DPIncident;
}

export default function SGSOHistoryPage() {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [vesselName, setVesselName] = useState<string>("");

  useEffect(() => {
    if (vesselId) {
      fetchActionPlans();
      fetchVesselName();
    }
  }, [vesselId]);

  const fetchActionPlans = async () => {
    if (!vesselId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/sgso/history/${vesselId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching action plans:", error);
      toast.error("Erro ao carregar planos de ação", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVesselName = async () => {
    if (!vesselId) return;

    try {
      // Fetch vessel name from Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/vessels?id=eq.${vesselId}&select=name`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setVesselName(data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching vessel name:", error);
    }
  };

  const handleEdit = (planId: string) => {
    toast.info("Funcionalidade de edição", {
      description: "A edição de planos de ação será implementada em breve.",
    });
    // Future: navigate to edit page or open modal
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/sgso")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Ship className="h-8 w-8 text-primary" />
              Histórico de Planos de Ação SGSO
            </h1>
            {vesselName && (
              <p className="text-muted-foreground mt-2">
                Embarcação: <strong>{vesselName}</strong>
              </p>
            )}
            {!vesselName && vesselId && (
              <p className="text-muted-foreground mt-2">
                ID da Embarcação: <strong>{vesselId}</strong>
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchActionPlans}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Ação por Incidente</CardTitle>
          <CardDescription>
            Histórico completo de planos de ação SGSO para incidentes de DP desta embarcação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando planos de ação...</p>
            </div>
          ) : (
            <SGSOHistoryTable plans={plans} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-semibold">📜 Histórico completo:</span>
            <span className="text-muted-foreground">
              Todos os planos de ação criados para incidentes desta embarcação, ordenados do mais recente ao mais antigo
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">✅ Status executável:</span>
            <span className="text-muted-foreground">
              Acompanhamento do ciclo de correção (aberto, em andamento, resolvido)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">🔐 Aprovação documentada:</span>
            <span className="text-muted-foreground">
              Registro de aprovador, cargo e data para conformidade com QSMS e auditorias (IBAMA/IMCA)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
