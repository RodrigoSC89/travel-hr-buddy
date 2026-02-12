/**
 * ESG Dashboard Panel - World-Class Component
 * Unified ESG overview: KPIs, compliance scores, carbon tracking, waste summary
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, Factory, Droplets, TrendingDown, BarChart3, 
  ShieldCheck, AlertTriangle, RefreshCw, Download, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { esgIntelligence, type ESGDashboardData } from '@/services/esg';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';

export function ESGDashboardPanel() {
  const [data, setData] = useState<ESGDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { generateReport, isLoading: aiLoading } = useESGWasteAI();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await esgIntelligence.getDashboardData();
      setData(result);
    } catch (err) {
      logger.error('ESG Dashboard error:', err);
      toast.error('Erro ao carregar dados ESG');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateReport = async () => {
    if (!data) return;
    const report = await generateReport('esg_quarterly', {
      kpis: data.kpis,
      compliance: data.complianceStatuses,
      emissions: data.emissions.length,
    });
    if (report) toast.success('Relatório ESG gerado com sucesso');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { kpis, complianceStatuses, carbonFootprint } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-success/10 rounded-xl">
            <Leaf className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">ESG Intelligence Dashboard</h2>
            <p className="text-sm text-muted-foreground">Monitoramento ambiental, social e governança</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleGenerateReport} disabled={aiLoading}>
            <Sparkles className="h-4 w-4 mr-1" /> Relatório IA
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          icon={<Factory className="h-4 w-4" />}
          label="CO₂ Total"
          value={`${kpis.totalCO2.toLocaleString()} t`}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <KPICard
          icon={<BarChart3 className="h-4 w-4" />}
          label="CII Médio"
          value={kpis.avgCII}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <KPICard
          icon={<Droplets className="h-4 w-4" />}
          label="Resíduos Reciclados"
          value={`${kpis.wasteRecycledPct}%`}
          color="text-info"
          bgColor="bg-info/10"
        />
        <KPICard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Compliance Score"
          value={`${kpis.complianceScore}%`}
          color="text-success"
          bgColor="bg-success/10"
        />
        <KPICard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Efic. Combustível"
          value={`${kpis.fuelEfficiency} NM/t`}
          color="text-accent-foreground"
          bgColor="bg-accent/10"
        />
        <KPICard
          icon={<Leaf className="h-4 w-4" />}
          label="Green Port Calls"
          value={String(kpis.greenPortCalls)}
          color="text-success"
          bgColor="bg-success/10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="carbon">Carbono</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Emitters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Factory className="h-4 w-4 text-warning" />
                  Maiores Emissores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {carbonFootprint.topEmitters.length > 0 ? carbonFootprint.topEmitters.map((e, eIdx) => (
                  <div key={e.vessel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{eIdx + 1}</span>
                      <span className="text-sm font-medium">{e.vessel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{e.co2.toLocaleString()} t</span>
                      <Badge variant={e.cii <= 'B' ? 'default' : e.cii <= 'C' ? 'secondary' : 'destructive'} className="text-xs">
                        CII {e.cii}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados de emissões disponíveis</p>
                )}
              </CardContent>
            </Card>

            {/* IMO Targets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  Metas IMO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IMOTargetBar label="IMO 2030 (-40%)" current={kpis.totalCO2} target={carbonFootprint.imo2030Target} />
                <IMOTargetBar label="IMO 2050 (-70%)" current={kpis.totalCO2} target={carbonFootprint.imo2050Target} />
                <IMOTargetBar label="EU FuelEU Maritime" current={85} target={100} isPercent />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              {complianceStatuses.map((cs) => (
                <div key={cs.regulation} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    {cs.status === 'compliant' ? (
                      <ShieldCheck className="h-5 w-5 text-success" />
                    ) : cs.status === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{cs.regulation}</p>
                      <p className="text-xs text-muted-foreground">Próximo deadline: {cs.nextDeadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold">{cs.score}%</p>
                    </div>
                    <Badge
                      variant={cs.status === 'compliant' ? 'default' : cs.status === 'warning' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {cs.status === 'compliant' ? 'Conforme' : cs.status === 'warning' ? 'Atenção' : 'Não Conforme'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Tendência Mensal CO₂</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {carbonFootprint.monthlyTrend.map((m) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-8">{m.month}</span>
                    <div className="flex-1">
                      <Progress value={Math.min((m.co2 / Math.max(m.target * 1.5, 1)) * 100, 100)} className="h-2" />
                    </div>
                    <span className="text-xs font-mono w-16 text-right">{m.co2} t</span>
                    <Badge variant={m.co2 <= m.target ? 'default' : 'destructive'} className="text-xs w-16 justify-center">
                      {m.co2 <= m.target ? '✓ Meta' : '✗ Acima'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Resumo de Carbono</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-3xl font-bold text-foreground">{kpis.totalCO2.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Toneladas CO₂ equivalente</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
                    <p className="text-lg font-bold text-success">{carbonFootprint.ciiAverage}</p>
                    <p className="text-xs text-muted-foreground">CII Médio</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <p className="text-lg font-bold text-primary">{carbonFootprint.reductionPct}%</p>
                    <p className="text-xs text-muted-foreground">Redução vs Meta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────
function KPICard({ icon, label, value, color, bgColor }: { 
  icon: React.ReactNode; label: string; value: string; color: string; bgColor: string 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function IMOTargetBar({ label, current, target, isPercent }: { 
  label: string; current: number; target: number; isPercent?: boolean 
}) {
  const pct = isPercent ? current : Math.min((current / Math.max(target, 1)) * 100, 150);
  const onTrack = isPercent ? current >= target : current <= target;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={onTrack ? 'text-success' : 'text-warning'}>
          {onTrack ? '✓ No alvo' : '⚠ Acima'}
        </span>
      </div>
      <Progress value={Math.min(pct, 100)} className="h-2" />
    </div>
  );
}
