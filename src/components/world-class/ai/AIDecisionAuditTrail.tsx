/**
 * AI Decision Audit Trail - World-Class Component
 * Blockchain-style audit trail of all AI decisions with explainability
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, Brain, Link2, Hash, Clock, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw, Sparkles, FileText,
  Eye, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { aiControlTower, type DecisionRecord, type BlockchainBlock } from '@/services/ai/ai-control-tower.service';

export function AIDecisionAuditTrail() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await aiControlTower.getControlTowerData();
      setDecisions(data.decisions);
      setBlocks(data.blockchainBlocks);
    } catch (err) {
      logger.error('Decision audit error:', err);
      toast.error('Erro ao carregar auditoria de decisões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const result = await aiControlTower.generateGovernanceReport();
      if (result) {
        setReport(result);
        toast.success('Relatório de governança gerado');
      }
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setReportLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'executed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Decision Audit Trail</h2>
            <p className="text-sm text-muted-foreground">Rastreabilidade e explicabilidade de decisões IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleGenerateReport} disabled={reportLoading}>
            {reportLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Relatório Governança
          </Button>
        </div>
      </div>

      {/* Governance Report */}
      {report && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Relatório de Governança de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-xs">
                {report}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="decisions">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="decisions">Decisões ({decisions.length})</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain ({blocks.length})</TabsTrigger>
        </TabsList>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="mt-4 space-y-3">
          {decisions.length > 0 ? decisions.map(d => (
            <Card
              key={d.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {statusIcon(d.status)}
                    <div>
                      <p className="font-semibold text-sm">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{d.type}</Badge>
                    <Badge className={`text-xs ${
                      d.confidence >= 0.9 ? 'bg-emerald-500/10 text-emerald-600' :
                      d.confidence >= 0.7 ? 'bg-amber-500/10 text-amber-600' :
                      'bg-destructive/10 text-destructive'
                    } border-0`}>
                      {(d.confidence * 100).toFixed(0)}% confiança
                    </Badge>
                    {expandedId === d.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {expandedId === d.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-primary mb-1">Raciocínio da IA</p>
                          <p className="text-xs text-muted-foreground">{d.reasoning}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/20">
                        <span className="text-muted-foreground">Impacto:</span>
                        <span className="font-medium ml-1">{d.impact}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20">
                        <span className="text-muted-foreground">Criado:</span>
                        <span className="font-mono ml-1">{d.createdAt?.split('T')[0]}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20">
                        <span className="text-muted-foreground">Feedback:</span>
                        <span className="ml-1">{d.feedbackCorrect === true ? '✓ Correto' : d.feedbackCorrect === false ? '✗ Incorreto' : 'Pendente'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma decisão de IA registrada. As decisões são registradas automaticamente.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="mt-4 space-y-2">
          {blocks.length > 0 ? blocks.map((block, i) => (
            <Card key={block.id} className="border-blue-500/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Link2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        Block #{block.blockNumber}
                      </Badge>
                      <span className="text-xs font-semibold">{block.agentName}</span>
                      <Badge variant="secondary" className="text-xs">{block.module}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{block.actionDescription}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground truncate">{block.hash.slice(0, 16)}...</span>
                      {block.humanOverride && (
                        <Badge variant="destructive" className="text-xs">Override Humano</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {block.confidence != null && (
                      <p className="text-xs font-bold">{(block.confidence * 100).toFixed(0)}%</p>
                    )}
                    <p className="text-xs text-muted-foreground">{block.timestamp?.split('T')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Link2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum bloco de auditoria. Os blocos são criados a cada ação autônoma da IA.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
