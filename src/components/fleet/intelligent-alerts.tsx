/**
 * Intelligent Alerts Component
 * PATCH 903 - Mock Zero compliance - Uses real data from Supabase
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Bell,
  CheckCircle,
  Clock,
  Fuel,
  Shield,
  Thermometer,
  Activity,
  MapPin,
  Users,
  Wrench,
  FileText,
  Mail,
  Phone,
  Settings,
  Eye,
  X,
  BrainCircuit,
  TrendingUp,
  Zap,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIntelligentAlertsData, IntelligentAlert } from "@/hooks/useIntelligentAlertsData";
import { EmptyState } from "@/components/ui/EmptyState";

const IntelligentAlerts: React.FC = () => {
  const { 
    alerts, 
    isLoading, 
    error, 
    refetch, 
    acknowledgeAlert: acknowledgeAlertMutation,
    resolveAlert: resolveAlertMutation,
    isAcknowledging,
    isResolving
  } = useIntelligentAlertsData();
  
  const [selectedAlert, setSelectedAlert] = useState<IntelligentAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const { toast } = useToast();

  const acknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation({ alertId, acknowledgedBy: "Usuário Atual" });
    toast({
      title: "Alerta Reconhecido",
      description: "O alerta foi marcado como reconhecido",
    });
  };

  const resolveAlert = (alertId: string, notes: string) => {
    resolveAlertMutation({ alertId, notes });
    setResolutionNotes("");
    setShowDetailsDialog(false);
    toast({
      title: "Alerta Resolvido",
      description: "O alerta foi marcado como resolvido",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info": return "bg-info text-info-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      case "critical": return "bg-destructive text-destructive-foreground";
      case "emergency": return "bg-destructive text-destructive-foreground animate-pulse";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "info": return "Informativo";
      case "warning": return "Atenção";
      case "critical": return "Crítico";
      case "emergency": return "Emergência";
      default: return "Desconhecido";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "safety": return <Shield className="h-4 w-4" />;
      case "maintenance": return <Wrench className="h-4 w-4" />;
      case "operational": return <Activity className="h-4 w-4" />;
      case "weather": return <Thermometer className="h-4 w-4" />;
      case "fuel": return <Fuel className="h-4 w-4" />;
      case "crew": return <Users className="h-4 w-4" />;
      case "cargo": return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-warning";
    return "text-destructive";
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === "open").length,
    critical: alerts.filter(a => a.severity === "critical" || a.severity === "emergency").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
    avgConfidence: alerts.length > 0 ? Math.round(alerts.reduce((sum, a) => sum + a.ai_confidence, 0) / alerts.length) : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Erro ao Carregar Alertas"
        description={error}
        actionLabel="Tentar Novamente"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alertas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold text-warning">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <Zap className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisão IA</p>
                <p className="text-2xl font-bold text-primary">{stats.avgConfidence}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Alertas Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Sistema de IA para detecção preditiva de anomalias
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Badge variant="outline" className="text-success">
            <Activity className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Abertos</option>
              <option value="acknowledged">Reconhecidos</option>
              <option value="resolved">Resolvidos</option>
            </select>
            
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas Severidades</option>
              <option value="emergency">Emergência</option>
              <option value="critical">Crítico</option>
              <option value="warning">Atenção</option>
              <option value="info">Informativo</option>
            </select>
            
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="safety">Segurança</option>
              <option value="maintenance">Manutenção</option>
              <option value="operational">Operacional</option>
              <option value="weather">Meteorológico</option>
              <option value="fuel">Combustível</option>
              <option value="crew">Tripulação</option>
            </select>
            
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhum Alerta Encontrado"
          description={
            alerts.length === 0
              ? "Não há alertas inteligentes registrados no momento. Os alertas aparecerão aqui quando o sistema de IA detectar anomalias."
              : "Nenhum alerta corresponde aos filtros selecionados. Ajuste os filtros para ver mais resultados."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(alert.type)}
                      <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{alert.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.vessel_name}
                        </span>
                        {alert.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.created_at).toLocaleString("pt-BR")}
                        </span>
                        {alert.ai_confidence > 0 && (
                          <span className={`flex items-center gap-1 ${getConfidenceColor(alert.ai_confidence)}`}>
                            <BrainCircuit className="h-3 w-3" />
                            {alert.ai_confidence}% confiança
                          </span>
                        )}
                      </div>
                      
                      {alert.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md">
                          <p className="text-xs font-medium mb-1">Recomendações IA:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {alert.recommendations.slice(0, 3).map((rec) => (
                              <li key={rec}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {alert.status === "open" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                        disabled={isAcknowledging}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Reconhecer
                      </Button>
                    )}
                    {(alert.status === "open" || alert.status === "acknowledged") && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="default">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolver Alerta</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label>Notas de Resolução</Label>
                              <Textarea
                                placeholder="Descreva a resolução do problema..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <Button 
                              onClick={() => resolveAlert(alert.id, resolutionNotes)}
                              disabled={isResolving}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Resolução
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {alert.status === "resolved" && (
                      <Badge variant="outline" className="text-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolvido
                      </Badge>
                    )}
                    {alert.status === "acknowledged" && (
                      <Badge variant="outline" className="text-warning">
                        <Eye className="h-3 w-3 mr-1" />
                        Reconhecido
                      </Badge>
                    )}
                  </div>
                </div>
                
                {alert.resolution_notes && (
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md">
                    <p className="text-xs font-medium text-success">Resolução:</p>
                    <p className="text-sm text-muted-foreground">{alert.resolution_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntelligentAlerts;
