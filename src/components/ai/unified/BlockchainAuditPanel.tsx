/**
 * Blockchain Audit Trail Panel
 * Immutable record of all autonomous decisions
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  Shield,
  CheckCircle2,
  Search,
  FileText,
  User,
  Bot,
  Clock,
  Hash,
  ChevronRight,
  Lock,
  Eye,
  Download,
  Verified
} from "lucide-react";

interface AuditEntry {
  id: string;
  entryType: "ai_decision" | "human_override" | "compliance_check" | "system_action";
  timestamp: Date;
  actor: {
    type: "ai_agent" | "human" | "system";
    name: string;
    role: string;
  };
  action: {
    type: string;
    description: string;
    module: string;
  };
  context: {
    reason: string;
    confidence?: number;
    vesselName?: string;
  };
  hash: string;
  blockId: string;
  verified: boolean;
}

interface AuditBlock {
  id: string;
  number: number;
  timestamp: Date;
  entriesCount: number;
  previousHash: string;
  hash: string;
  verified: boolean;
}

export function BlockchainAuditPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Sample blocks
    const sampleBlocks: AuditBlock[] = [
      {
        id: "block-042",
        number: 42,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        entriesCount: 15,
        previousHash: "00a8f3e5c2b1d4a6e8f0c2b4d6a8e0f2c4b6d8a0e2f4c6b8d0a2e4f6c8b0d2",
        hash: "00c4e6a8f0b2d4c6e8a0f2b4d6c8e0a2f4b6d8c0e2a4f6b8c0d2e4f6a8b0c2",
        verified: true
      },
      {
        id: "block-041",
        number: 41,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        entriesCount: 22,
        previousHash: "00f2b4d6a8e0c2f4b6d8a0e2c4f6b8d0a2e4c6a8f0b2d4e6c8a0f2b4d6e8",
        hash: "00a8f3e5c2b1d4a6e8f0c2b4d6a8e0f2c4b6d8a0e2f4c6b8d0a2e4f6c8b0d2",
        verified: true
      },
      {
        id: "block-040",
        number: 40,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        entriesCount: 18,
        previousHash: "00d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0",
        hash: "00f2b4d6a8e0c2f4b6d8a0e2c4f6b8d0a2e4c6a8f0b2d4e6c8a0f2b4d6e8",
        verified: true
      }
    ];
    setBlocks(sampleBlocks);

    // Sample entries
    const sampleEntries: AuditEntry[] = [
      {
        id: "entry-001",
        entryType: "ai_decision",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        actor: { type: "ai_agent", name: "ARIA Navigator", role: "Route Optimization" },
        action: {
          type: "route_adjustment",
          description: "Rota ajustada para evitar tempestade no Atlântico Norte",
          module: "route-optimizer"
        },
        context: {
          reason: "Previsão meteorológica indica ondas de 5m+ na rota original",
          confidence: 0.94,
          vesselName: "MV Nautilus Star"
        },
        hash: "a8f3e5c2b1d4a6e8f0c2b4d6a8e0f2c4",
        blockId: "block-042",
        verified: true
      },
      {
        id: "entry-002",
        entryType: "ai_decision",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        actor: { type: "ai_agent", name: "ARIA Engineer", role: "Predictive Maintenance" },
        action: {
          type: "maintenance_schedule",
          description: "Manutenção preventiva agendada para bomba hidráulica #3",
          module: "predictive-maintenance"
        },
        context: {
          reason: "Modelo ONNX detectou aumento de vibração 40% acima do baseline",
          confidence: 0.91,
          vesselName: "MV Ocean Pride"
        },
        hash: "b4d6a8e0f2c4b6d8a0e2f4c6b8d0a2e4",
        blockId: "block-042",
        verified: true
      },
      {
        id: "entry-003",
        entryType: "human_override",
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        actor: { type: "human", name: "Carlos Silva", role: "Fleet Manager" },
        action: {
          type: "decision_override",
          description: "Override da decisão de bunker - preferência por Rotterdam",
          module: "bunker-optimization"
        },
        context: {
          reason: "Contrato pré-existente com fornecedor local oferece melhor preço"
        },
        hash: "c6b8d0a2e4f6a8b0c2d4e6f8a0b2c4d6",
        blockId: "block-041",
        verified: true
      },
      {
        id: "entry-004",
        entryType: "compliance_check",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        actor: { type: "system", name: "Compliance Engine", role: "MLC 2006 Auditor" },
        action: {
          type: "audit_completed",
          description: "Auditoria MLC 2006 concluída - Score: 98%",
          module: "compliance-audit"
        },
        context: {
          reason: "Verificação programada de conformidade trabalhista marítima",
          vesselName: "All Fleet"
        },
        hash: "d8a0e2f4c6b8d0a2e4f6a8b0c2d4e6f8",
        blockId: "block-041",
        verified: true
      },
      {
        id: "entry-005",
        entryType: "ai_decision",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        actor: { type: "ai_agent", name: "ARIA Safety", role: "Risk Assessment" },
        action: {
          type: "alert_generated",
          description: "Alerta de fadiga emitido para tripulação do turno noturno",
          module: "wellness-nlp"
        },
        context: {
          reason: "Análise NLP de comunicações indica stress elevado na equipe",
          confidence: 0.87,
          vesselName: "MV Atlantic Voyager"
        },
        hash: "e0f2c4b6d8a0e2f4c6b8d0a2e4f6a8b0",
        blockId: "block-040",
        verified: true
      }
    ];
    setEntries(sampleEntries);
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "ai_decision":
        return <Bot className="h-4 w-4 text-blue-500" />;
      case "human_override":
        return <User className="h-4 w-4 text-orange-500" />;
      case "compliance_check":
        return <Shield className="h-4 w-4 text-green-500" />;
      case "system_action":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case "ai_decision":
        return <Badge className="bg-blue-500/20 text-blue-400">Decisão AI</Badge>;
      case "human_override":
        return <Badge className="bg-orange-500/20 text-orange-400">Override Humano</Badge>;
      case "compliance_check":
        return <Badge className="bg-green-500/20 text-green-400">Compliance</Badge>;
      case "system_action":
        return <Badge className="bg-purple-500/20 text-purple-400">Sistema</Badge>;
      default:
        return <Badge variant="secondary">Outro</Badge>;
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.context.vesselName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalEntries: entries.length,
    aiDecisions: entries.filter(e => e.entryType === "ai_decision").length,
    humanOverrides: entries.filter(e => e.entryType === "human_override").length,
    complianceChecks: entries.filter(e => e.entryType === "compliance_check").length,
    chainIntegrity: blocks.every(b => b.verified)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{blocks.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Blocos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{stats.totalEntries}</span>
            </div>
            <p className="text-xs text-muted-foreground">Registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.aiDecisions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Decisões AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{stats.humanOverrides}</span>
            </div>
            <p className="text-xs text-muted-foreground">Overrides</p>
          </CardContent>
        </Card>

        <Card className={stats.chainIntegrity ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {stats.chainIntegrity ? (
                <Verified className="h-4 w-4 text-green-500" />
              ) : (
                <Shield className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-bold">
                {stats.chainIntegrity ? "Íntegra" : "Comprometida"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Cadeia de Blocos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Blocos Recentes
            </CardTitle>
            <CardDescription>
              Cadeia imutável de registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <Card key={block.id} className="bg-muted/30">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary font-mono text-sm">
                          #{block.number}
                        </div>
                        <div>
                          <p className="font-medium text-sm">Bloco {block.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {block.entriesCount} registros
                          </p>
                        </div>
                      </div>
                      {block.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="mt-2 p-2 rounded bg-background/50 font-mono text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span className="truncate">{block.hash.slice(0, 24)}...</span>
                      </div>
                    </div>

                    {idx < blocks.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Registros de Auditoria
            </CardTitle>
            <CardDescription>
              Todas as ações registradas na blockchain
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar registros..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className={`bg-muted/30 cursor-pointer transition-colors hover:border-primary/50 ${
                      selectedEntry?.id === entry.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedEntry(entry.id === selectedEntry?.id ? null : entry)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getEntryTypeIcon(entry.entryType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {getEntryTypeBadge(entry.entryType)}
                            {entry.context.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(entry.context.confidence * 100)}% confiança
                              </Badge>
                            )}
                            {entry.verified && (
                              <Verified className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          
                          <p className="font-medium text-sm">{entry.action.description}</p>
                          
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{entry.actor.name}</span>
                            <span>•</span>
                            <span>{entry.context.vesselName || entry.action.module}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{entry.timestamp.toLocaleString()}</span>
                          </div>

                          {selectedEntry?.id === entry.id && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <div className="text-xs">
                                <span className="text-muted-foreground">Motivo: </span>
                                <span>{entry.context.reason}</span>
                              </div>
                              <div className="p-2 rounded bg-background/50 font-mono text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Lock className="h-3 w-3" />
                                  <span>Hash: {entry.hash}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                  <Link2 className="h-3 w-3" />
                                  <span>Block: {entry.blockId}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Verificar
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Download className="h-3 w-3 mr-1" />
                                  Exportar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BlockchainAuditPanel;
