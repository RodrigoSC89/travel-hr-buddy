import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SGSOHistoryTable, SGSOActionPlan } from "@/components/sgso/SGSOHistoryTable";
import { ArrowLeft, RefreshCw, History, Shield, Info } from "lucide-react";

const SGSOHistoryPage: React.FC = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [actionPlans, setActionPlans] = useState<SGSOActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActionPlans = async (showRefreshToast = false) => {
    if (!vesselId) {
      toast({
        title: "Erro",
        description: "ID da embarcação não fornecido",
        variant: "destructive",
      });
      return;
    }

    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/sgso/history/${encodeURIComponent(vesselId)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao buscar histórico");
      }

      setActionPlans(result.data || []);

      if (showRefreshToast) {
        toast({
          title: "Atualizado",
          description: "Histórico atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Error fetching action plans:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar histórico de planos de ação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActionPlans();
  }, [vesselId]);

  const handleRefresh = () => {
    fetchActionPlans(true);
  };

  const handleBackToSGSO = () => {
    navigate("/admin/sgso");
  };

  // Calculate summary statistics
  const openCount = actionPlans.filter((plan) => plan.status === "aberto").length;
  const inProgressCount = actionPlans.filter((plan) => plan.status === "em_andamento").length;
  const resolvedCount = actionPlans.filter((plan) => plan.status === "resolvido").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToSGSO}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para SGSO Admin
          </Button>
          <div className="h-6 border-l border-border" />
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Histórico de Planos de Ação SGSO</h1>
              <p className="text-sm text-muted-foreground">
                Embarcação: <span className="font-medium">{vesselId}</span>
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5" />
            Rastreabilidade SGSO
          </CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            Sistema de rastreamento completo de planos de ação para compliance QSMS e auditorias externas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Compliance:</strong> Trilha de auditoria completa com aprovações documentadas e histórico de mudanças de status
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Auditorias Externas:</strong> Preparado para inspeções IBAMA e IMCA com rastreabilidade por incidente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Planos Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{openCount}</span>
              <Badge variant="destructive" className="ml-auto">Pendente</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{inProgressCount}</span>
              <Badge className="ml-auto bg-yellow-500 hover:bg-yellow-600">Ativo</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolvidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{resolvedCount}</span>
              <Badge className="ml-auto bg-green-600 hover:bg-green-700">Concluído</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo</CardTitle>
          <CardDescription>
            Lista cronológica de todos os planos de ação (mais recentes primeiro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SGSOHistoryTable actionPlans={actionPlans} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SGSOHistoryPage;
