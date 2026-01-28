/**
 * Blockchain Audit Dashboard
 * Immutable audit trail for AI decisions
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Shield, CheckCircle, Clock, Database, Hash, Lock, FileText } from "lucide-react";

interface AuditBlock {
  id: string;
  hash: string;
  prevHash: string;
  timestamp: string;
  agent: string;
  action: string;
  module: string;
  confidence: number;
  humanOverride: boolean;
}

export const BlockchainAuditDashboard: React.FC = () => {
  const blocks: AuditBlock[] = [
    { id: "1", hash: "0x7f3a9c...d4e2", prevHash: "0x4b2c8e...a1f5", timestamp: "14:32:15", agent: "NavigatorAgent", action: "Ajuste de rota aprovado", module: "route-optimization", confidence: 94, humanOverride: false },
    { id: "2", hash: "0x4b2c8e...a1f5", prevHash: "0x9e1d7a...c3b8", timestamp: "14:28:42", agent: "SafetyAgent", action: "Alerta de fadiga emitido", module: "crew-wellbeing", confidence: 87, humanOverride: false },
    { id: "3", hash: "0x9e1d7a...c3b8", prevHash: "0x2f6b4c...e9a1", timestamp: "14:15:33", agent: "EngineerAgent", action: "Manutenção preventiva agendada", module: "predictive-maintenance", confidence: 91, humanOverride: true },
    { id: "4", hash: "0x2f6b4c...e9a1", prevHash: "0x8d3e5f...b7c2", timestamp: "14:02:18", agent: "ComplianceAgent", action: "Certificação validada", module: "compliance-audit", confidence: 99, humanOverride: false },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Blocos</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Integridade</p>
                <p className="text-2xl font-bold text-green-400">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decisões Autônomas</p>
                <p className="text-2xl font-bold">892</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <FileText className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overrides Humanos</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Visualization */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Cadeia de Auditoria
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Verificar Integridade</Button>
            <Button variant="outline" size="sm">Exportar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative">
                {/* Connection line */}
                {index < blocks.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-primary/30" />
                )}
                
                <div className={`p-4 rounded-lg border transition-colors ${
                  block.humanOverride 
                    ? "bg-yellow-500/10 border-yellow-500/30" 
                    : "bg-muted/30 border-border"
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Hash className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{block.hash}</span>
                          {block.humanOverride && (
                            <Badge variant="secondary" className="text-xs">
                              Override Humano
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Prev: {block.prevHash}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {block.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-3 p-3 rounded-lg bg-background/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Agente</p>
                      <p className="font-medium text-sm">{block.agent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ação</p>
                      <p className="font-medium text-sm">{block.action}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Módulo</p>
                      <p className="font-medium text-sm">{block.module}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confiança</p>
                      <p className="font-medium text-sm text-primary">{block.confidence}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrity Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status de Integridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="font-medium">Cadeia Íntegra</p>
                    <p className="text-sm text-muted-foreground">
                      Todos os blocos verificados com sucesso
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Última Verificação</p>
                  <p className="font-medium">Há 5 minutos</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Próxima Verificação</p>
                  <p className="font-medium">Em 10 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">MLC 2006</span>
                <Badge variant="default">Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">ISM Code</span>
                <Badge variant="default">Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">GDPR</span>
                <Badge variant="default">Conforme</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">SOX Compliance</span>
                <Badge variant="default">Conforme</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
