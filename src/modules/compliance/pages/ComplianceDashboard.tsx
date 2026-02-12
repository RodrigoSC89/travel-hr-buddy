/**
 * Compliance Dashboard
 * Overview of compliance status across the organization
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, AlertTriangle, FileCheck, Users, 
  TrendingUp, Clock, Brain, ChevronRight,
  CheckCircle, XCircle, AlertCircle, LayoutDashboard
} from "lucide-react";
import { useComplianceDashboardStats, useComplianceRisks, useComplianceRecommendations } from "../hooks/useComplianceData";
import { Link } from "react-router-dom";
import { UnifiedComplianceDashboard } from "@/components/compliance/UnifiedComplianceDashboard";

export default function ComplianceDashboard() {
  const { data: stats, isLoading } = useComplianceDashboardStats();
  const { data: recentRisks = [] } = useComplianceRisks();
  const { data: pendingRecommendations = [] } = useComplianceRecommendations();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/20";
    if (score >= 60) return "bg-warning/20";
    return "bg-destructive/20";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de Gestão de Compliance • ISO 37301
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/compliance?tab=reports">
              <Brain className="h-4 w-4 mr-2" />
              IA Recomendações
            </Link>
          </Button>
          <Button asChild>
            <Link to="/compliance?tab=reports">
              Gerar Relatório
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="unified" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Status Unificado
          </TabsTrigger>
          <TabsTrigger value="grc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            GRC ISO 37301
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="mt-6">
          <UnifiedComplianceDashboard />
        </TabsContent>

        <TabsContent value="grc" className="mt-6 space-y-6">

      {/* Compliance Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score de Compliance</p>
              <div className={`text-5xl font-bold ${getScoreColor(stats?.complianceScore || 0)}`}>
                {stats?.complianceScore || 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado em {stats?.totalRules || 0} regras, {stats?.totalRisks || 0} riscos e {stats?.totalEvidences || 0} evidências
              </p>
            </div>
            <div className="w-48">
              <Progress 
                value={stats?.complianceScore || 0} 
                className={`h-4 ${getScoreBg(stats?.complianceScore || 0)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Riscos Abertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openRisks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.criticalRisks || 0} críticos
            </p>
            <Link to="/risk-matrix" className="text-xs text-primary hover:underline flex items-center mt-2">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Evidências</CardTitle>
            <FileCheck className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvidences || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingEvidences || 0} pendentes, {stats?.expiredEvidences || 0} expiradas
            </p>
            <Link to="/evidences" className="text-xs text-primary hover:underline flex items-center mt-2">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Terceiros</CardTitle>
            <Users className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalThirdParties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.highRiskThirdParties || 0} alto risco, {stats?.blockedThirdParties || 0} bloqueados
            </p>
            <Link to="/due-diligence" className="text-xs text-primary hover:underline flex items-center mt-2">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdueWorkflows || 0} atrasados
            </p>
            <Link to="/nc-workflow" className="text-xs text-primary hover:underline flex items-center mt-2">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Riscos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRisks.length > 0 ? (
              <div className="space-y-3">
                {recentRisks.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">{risk.department || "Geral"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        risk.risk_level === "critical" ? "destructive" :
                        risk.risk_level === "high" ? "default" :
                        risk.risk_level === "medium" ? "secondary" : "outline"
                      }>
                        {risk.risk_score}
                      </Badge>
                      {risk.status === "open" && <AlertCircle className="h-4 w-4 text-warning" />}
                      {risk.status === "mitigated" && <CheckCircle className="h-4 w-4 text-success" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum risco cadastrado</p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/risk-matrix">Ver Matriz de Riscos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* AI Recommendations Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-foreground" />
              Recomendações da IA
              {stats?.pendingRecommendations && stats.pendingRecommendations > 0 && (
                <Badge variant="secondary">{stats.pendingRecommendations} pendentes</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRecommendations.length > 0 ? (
              <div className="space-y-3">
                {pendingRecommendations.map((rec) => (
                  <div key={rec.id} className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {rec.recommendation}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {Math.round((rec.confidence || 0) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma recomendação pendente</p>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/compliance?tab=reports">Ver Todas Recomendações</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/regulations">
                <FileCheck className="h-5 w-5" />
                <span className="text-xs">Regulamentos</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/risk-matrix">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs">Novo Risco</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/evidences">
                <FileCheck className="h-5 w-5" />
                <span className="text-xs">Upload Evidência</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/due-diligence">
                <Users className="h-5 w-5" />
                <span className="text-xs">Due Diligence</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/whistleblower">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs">Denúncias</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/compliance?tab=reports">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Relatórios</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
