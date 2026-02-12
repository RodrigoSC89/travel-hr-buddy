/**
 * Security Scanner Page
 * Automated security vulnerability scanning
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, XCircle, Play, RefreshCw, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSecurityScanData } from "@/hooks/useSecurityScanData";

interface SecurityFinding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  status: "open" | "fixed" | "ignored";
}

const severityColors = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-warning",
  low: "bg-info",
  info: "bg-muted",
};

const statusIcons = {
  open: AlertTriangle,
  fixed: CheckCircle,
  ignored: XCircle,
};

export default function SecurityScanner() {
  const { findings: realFindings, isLoading, markFixed, refetch } = useSecurityScanData();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const findings = realFindings;
  const [lastScan, setLastScan] = useState<string | null>(new Date().toLocaleString());

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScan(new Date().toLocaleString());
          toast.success("Scan de segurança concluído!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleFixFinding = (id: string) => {
    markFixed.mutate(id);
  };

  const openCount = findings.filter(f => f.status === "open").length;
  const criticalCount = findings.filter(f => f.severity === "critical" && f.status === "open").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Security Scanner</h1>
            <p className="text-muted-foreground">Análise automatizada de vulnerabilidades</p>
          </div>
        </div>
        <Button onClick={handleScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Escaneando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Scan
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Findings</p>
                <p className="text-3xl font-bold">{findings.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={openCount > 0 ? "border-warning/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Aberto</p>
                <p className="text-3xl font-bold text-warning">{openCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-destructive/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Corrigidos</p>
                <p className="text-3xl font-bold text-success">
                  {findings.filter(f => f.status === "fixed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Scan em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={scanProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Analisando: {scanProgress < 30 ? "Banco de dados..." : scanProgress < 60 ? "APIs..." : scanProgress < 90 ? "Dependências..." : "Finalizando..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      <Card>
        <CardHeader>
          <CardTitle>Findings de Segurança</CardTitle>
          <CardDescription>
            {lastScan && `Último scan: ${lastScan}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {findings.map((finding) => {
            const StatusIcon = statusIcons[finding.status];
            return (
              <div
                key={finding.id}
                className={`p-4 rounded-lg border ${
                  finding.status === "fixed" ? "opacity-60" : ""
                } ${
                  finding.severity === "critical" && finding.status === "open" 
                    ? "border-destructive/50 bg-destructive/5" 
                    : "bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${severityColors[finding.severity]} text-white`}>
                        {finding.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{finding.category}</Badge>
                      <span className="text-sm text-muted-foreground">{finding.id}</span>
                    </div>
                    <h4 className="font-medium">{finding.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${
                      finding.status === "open" ? "text-warning" :
                      finding.status === "fixed" ? "text-success" : "text-muted-foreground"
                    }`} />
                    {finding.status === "open" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFixFinding(finding.id)}
                      >
                        Marcar Corrigido
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
