/**
 * Environmental Compliance Monitor - World-Class Component
 * Real-time regulatory compliance tracking: IMO, EU MRV, MARPOL, DCS
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck, AlertTriangle, Clock, FileSearch, Sparkles,
  RefreshCw, Scale, FileText, ExternalLink, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { esgIntelligence, type ComplianceStatus } from '@/services/esg';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';

interface Regulation {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus['status'];
  score: number;
  nextDeadline: string;
  gaps: string[];
  requirements: string[];
  lastAudit: string;
}

export function EnvironmentalComplianceMonitor() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Regulation | null>(null);
  const { checkCompliance, getRecommendations, isLoading: aiLoading } = useESGWasteAI();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await esgIntelligence.getDashboardData();
      
      const regs: Regulation[] = data.complianceStatuses.map((cs, i) => ({
        id: `reg-${i}`,
        name: cs.regulation,
        description: getRegDescription(cs.regulation),
        status: cs.status,
        score: cs.score,
        nextDeadline: cs.nextDeadline,
        gaps: cs.gaps,
        requirements: getRegRequirements(cs.regulation),
        lastAudit: new Date(Date.now() - (i * 13 + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      setRegulations(regs);
    } catch (err) {
      logger.error('Compliance monitor error:', err);
      toast.error('Erro ao carregar dados de compliance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const overallScore = regulations.length > 0
    ? Math.round(regulations.reduce((a, r) => a + r.score, 0) / regulations.length)
    : 0;
  const compliantCount = regulations.filter(r => r.status === 'compliant').length;
  const warningCount = regulations.filter(r => r.status === 'warning').length;
  const nonCompliantCount = regulations.filter(r => r.status === 'non_compliant').length;

  const handleAICheck = async (reg: Regulation) => {
    const result = await checkCompliance({
      regulation: reg.name,
      score: reg.score,
      gaps: reg.gaps,
      requirements: reg.requirements,
    });
    if (result) toast.success(`Análise de ${reg.name} concluída`);
  };

  const handleGetRecommendations = async () => {
    const result = await getRecommendations('compliance_improvement', {
      regulations: regulations.map(r => ({ name: r.name, score: r.score, status: r.status })),
      overallScore,
    });
    if (result) toast.success('Recomendações geradas');
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
            <Scale className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Environmental Compliance Monitor</h2>
            <p className="text-sm text-muted-foreground">Monitoramento regulatório ambiental em tempo real</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleGetRecommendations} disabled={aiLoading}>
            <Sparkles className="h-4 w-4 mr-1" /> Recomendações IA
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{overallScore}%</p>
            <p className="text-xs text-muted-foreground">Score Geral</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{compliantCount}</p>
            <p className="text-xs text-muted-foreground">Conformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{warningCount}</p>
            <p className="text-xs text-muted-foreground">Atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{nonCompliantCount}</p>
            <p className="text-xs text-muted-foreground">Não Conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* Regulation Cards */}
      <div className="space-y-3">
        {regulations.map(reg => (
          <Card
            key={reg.id}
            className={`border cursor-pointer hover:shadow-md transition-shadow ${
              reg.status === 'compliant' ? 'border-emerald-500/20' :
              reg.status === 'warning' ? 'border-amber-500/20' : 'border-destructive/20'
            }`}
            onClick={() => setSelectedReg(selectedReg?.id === reg.id ? null : reg)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {reg.status === 'compliant' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : reg.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{reg.name}</p>
                    <p className="text-xs text-muted-foreground">{reg.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold">{reg.score}%</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {reg.nextDeadline}
                    </div>
                  </div>
                  <Badge
                    variant={reg.status === 'compliant' ? 'default' : reg.status === 'warning' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {reg.status === 'compliant' ? 'Conforme' : reg.status === 'warning' ? 'Atenção' : 'NC'}
                  </Badge>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedReg?.id === reg.id && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">REQUISITOS</p>
                    <div className="space-y-1">
                      {reg.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {reg.gaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-500 mb-2">GAPS IDENTIFICADOS</p>
                      {reg.gaps.map((gap, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{gap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAICheck(reg); }} disabled={aiLoading}>
                      <FileSearch className="h-3 w-3 mr-1" /> Análise Detalhada
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function getRegDescription(name: string): string {
  const map: Record<string, string> = {
    'MARPOL Annex I (Óleo)': 'Prevenção da poluição por óleo de navios',
    'MARPOL Annex IV (Esgoto)': 'Descarte de esgoto sanitário de navios',
    'MARPOL Annex V (Resíduos)': 'Gestão de resíduos sólidos a bordo',
    'MARPOL Annex VI (Emissões)': 'Poluição do ar por navios (SOx, NOx, PM)',
    'EU MRV': 'Monitoramento, Reporte e Verificação de emissões (UE)',
    'IMO DCS': 'Data Collection System para consumo de combustível',
  };
  return map[name] || 'Regulamento ambiental marítimo';
}

function getRegRequirements(name: string): string[] {
  const map: Record<string, string[]> = {
    'MARPOL Annex I (Óleo)': ['Plano SOPEP atualizado', 'OWS operacional', 'Registro no Oil Record Book', 'Certificado IOPP válido'],
    'MARPOL Annex IV (Esgoto)': ['Planta de tratamento operacional', 'Registro de descartes', 'Distância mínima da costa'],
    'MARPOL Annex V (Resíduos)': ['Plano de Gestão de Resíduos', 'Garbage Record Book', 'Placards afixados', 'Separação adequada'],
    'MARPOL Annex VI (Emissões)': ['Teor de enxofre < 0.5%', 'IAPP válido', 'Registro de combustível', 'CII calculado'],
    'EU MRV': ['Plano de monitoramento aprovado', 'Relatório anual submetido', 'Verificação por terceiros'],
    'IMO DCS': ['Coleta de dados válida', 'Submissão ao Flag State', 'Declaração de conformidade'],
  };
  return map[name] || ['Documentação atualizada', 'Auditorias em dia'];
}
