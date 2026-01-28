/**
 * Fraud Detection Dashboard
 * Real-time monitoring of financial anomalies and suspicious activities
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFraudDetection } from "@/hooks/ai/useFraudDetection";
import type { Transaction, FraudAlert } from "@/lib/ai/engines/fraud-detection";
import { 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  Users,
  FileWarning,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

// Mock transactions for demo
const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    vendorId: "vendor-maritime-supplies",
    vendor: "Maritime Supplies Co.",
    amount: 15000,
    currency: "USD",
    category: "supplies",
    type: "expense",
    date: new Date(),
    description: "Equipment purchase",
    approvedBy: "John Smith",
    requestedBy: "Jane Doe",
    department: "Operations",
    vesselId: null,
    location: "Singapore",
    paymentMethod: "wire",
    attachments: [],
    metadata: {}
  },
  {
    id: "txn-002",
    vendorId: "vendor-fuel-global",
    vendor: "Global Fuel Ltd.",
    amount: 85000,
    currency: "USD",
    category: "fuel",
    type: "purchase_order",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: "Bunker fuel Singapore",
    approvedBy: "Jane Doe",
    requestedBy: "Mike Wilson",
    department: "Fleet",
    vesselId: "vessel-001",
    location: "Singapore",
    paymentMethod: "wire",
    attachments: [],
    metadata: {}
  },
  {
    id: "txn-003",
    vendorId: "vendor-new-xyz",
    vendor: "XYZ Services",
    amount: 9999,
    currency: "USD",
    category: "services",
    type: "expense",
    date: new Date(),
    description: "Consulting services",
    approvedBy: "Mike Johnson",
    requestedBy: "Mike Johnson", // Self-approval
    department: "Admin",
    vesselId: null,
    location: "Houston",
    paymentMethod: "check",
    attachments: [],
    metadata: {}
  },
  {
    id: "txn-004",
    vendorId: "vendor-port-services",
    vendor: "Port Services Inc.",
    amount: 45000,
    currency: "USD",
    category: "port",
    type: "invoice",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: "Port handling fees",
    approvedBy: "Sarah Wilson",
    requestedBy: "Tom Brown",
    department: "Operations",
    vesselId: "vessel-002",
    location: "Rotterdam",
    paymentMethod: "wire",
    attachments: [],
    metadata: {}
  }
];

export function FraudDetectionDashboard() {
  const { 
    isLoading, 
    alerts,
    analyzeBatch,
    getHighRiskAlerts,
    clearAlerts 
  } = useFraudDetection();
  
  const [activeTab, setActiveTab] = useState("alerts");

  const handleAnalyze = async () => {
    await analyzeBatch(mockTransactions);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "duplicate_payment":
        return <FileWarning className="h-4 w-4" />;
      case "unusual_amount":
        return <DollarSign className="h-4 w-4" />;
      case "vendor_anomaly":
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const criticalAlerts = getHighRiskAlerts();
  const totalRiskScore = alerts.reduce((acc, a) => acc + a.riskScore, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Detecção de Fraudes</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de anomalias financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearAlerts}
            disabled={alerts.length === 0}
          >
            Limpar
          </Button>
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Analisar Transações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Requerem análise</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">Ação imediata</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Risco</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.length > 0 ? Math.round(totalRiskScore / alerts.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Média identificada</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.autoBlocked).length}</div>
            <p className="text-xs text-muted-foreground">Auto-bloqueados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Clique em "Analisar Transações" para detectar anomalias
                </p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert: FraudAlert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAlertTypeIcon(alert.alertType)}
                      <CardTitle className="text-lg">{alert.description}</CardTitle>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    Transação: {alert.transactionId} | Ação: {alert.recommendedAction}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score de Risco</span>
                      <span>{alert.riskScore}%</span>
                    </div>
                    <Progress value={alert.riskScore} className="h-2" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Indicadores:</p>
                    <div className="flex flex-wrap gap-2">
                      {alert.indicators.map((indicator, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {indicator.indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive">
                      <XCircle className="mr-1 h-4 w-4" />
                      Bloquear
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Aprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Detecção</CardTitle>
              <CardDescription>
                Resumo das análises realizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{mockTransactions.length}</p>
                  <p className="text-sm text-muted-foreground">Transações Analisadas</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{alerts.length}</p>
                  <p className="text-sm text-muted-foreground">Sinalizadas</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{alerts.filter(a => a.autoBlocked).length}</p>
                  <p className="text-sm text-muted-foreground">Bloqueadas</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Tipos de Alerta:</p>
                <div className="space-y-2">
                  {Array.from(new Set(alerts.map(a => a.alertType))).map((type, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                      <Badge variant="outline">
                        {alerts.filter(a => a.alertType === type).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
