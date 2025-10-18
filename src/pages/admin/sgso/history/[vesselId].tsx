import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Info } from "lucide-react";
import { SGSOHistoryTable, SGSOActionPlan } from "@/components/sgso/SGSOHistoryTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * SGSO History Page
 * 
 * Displays action plans history for a specific vessel
 * Provides complete traceability and QSMS compliance support
 */
export default function SGSOHistoryPage() {
  const { vesselId } = useParams<{ vesselId: string }>();
  const [plans, setPlans] = useState<SGSOActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [vesselName, setVesselName] = useState<string>("");

  const fetchHistory = async () => {
    if (!vesselId) {
      toast.error("ID da embarcação não especificado");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sgso/history/${vesselId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao buscar histórico");
      }

      const data = await response.json();
      setPlans(data);
      
      if (data.length > 0) {
        toast.success(`${data.length} plano(s) de ação carregado(s)`);
      } else {
        toast.info("Nenhum plano de ação encontrado para esta embarcação");
      }
    } catch (error) {
      console.error("Error fetching SGSO history:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Erro ao carregar histórico de planos de ação"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchVesselName = async () => {
    if (!vesselId) return;

    try {
      // Fetch vessel name from vessels table
      // This is a placeholder - adjust according to your API structure
      const response = await fetch(`/api/vessels/${vesselId}`);
      if (response.ok) {
        const data = await response.json();
        setVesselName(data.name || `Embarcação ${vesselId}`);
      }
    } catch (error) {
      console.error("Error fetching vessel name:", error);
      setVesselName(`Embarcação ${vesselId.substring(0, 8)}...`);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchVesselName();
  }, [vesselId]);

  const handleEdit = (plan: SGSOActionPlan) => {
    // Placeholder for edit functionality
    toast.info("Funcionalidade de edição será implementada em breve");
    console.log("Edit plan:", plan);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/sgso">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para SGSO Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              Histórico de Planos de Ação SGSO
            </h1>
            {vesselName && (
              <p className="text-muted-foreground mt-1">
                {vesselName}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={fetchHistory}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Information Card */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sistema de Rastreabilidade SGSO</AlertTitle>
        <AlertDescription>
          Este painel exibe o histórico completo de planos de ação por embarcação e incidente,
          incluindo status de execução, aprovações documentadas e conformidade com QSMS.
          Ideal para auditorias externas (IBAMA/IMCA).
        </AlertDescription>
      </Alert>

      {/* History Table */}
      <SGSOHistoryTable 
        plans={plans} 
        onEdit={handleEdit}
      />

      {/* Summary Card */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>
              Estatísticas dos planos de ação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-red-600">
                  {plans.filter(p => p.status === "aberto").length}
                </div>
                <div className="text-sm text-muted-foreground">Abertos</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {plans.filter(p => p.status === "em_andamento").length}
                </div>
                <div className="text-sm text-muted-foreground">Em Andamento</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-green-600">
                  {plans.filter(p => p.status === "resolvido").length}
                </div>
                <div className="text-sm text-muted-foreground">Resolvidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
