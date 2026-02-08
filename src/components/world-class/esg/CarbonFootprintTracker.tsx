/**
 * Carbon Footprint Tracker - World-Class Component
 * IMO 2030/2050 targets, CII tracking, vessel-level emissions breakdown
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Factory, TrendingDown, TrendingUp, Leaf, Gauge,
  Ship, Sparkles, RefreshCw, Target, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { esgIntelligence, type EmissionsData, type CarbonFootprint } from '@/services/esg';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';
import { logger } from '@/lib/logger';

export function CarbonFootprintTracker() {
  const [emissions, setEmissions] = useState<EmissionsData[]>([]);
  const [carbonFP, setCarbonFP] = useState<CarbonFootprint | null>(null);
  const [loading, setLoading] = useState(true);
  const { analyzeEmissions, predictiveAnalysis, isLoading: aiLoading } = useESGWasteAI();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await esgIntelligence.getDashboardData();
      setEmissions(data.emissions);
      setCarbonFP(data.carbonFootprint);
    } catch (err) {
      logger.error('Carbon tracker error', err as Error);
      toast.error('Erro ao carregar dados de carbono');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAnalyzeEmissions = async () => {
    const result = await analyzeEmissions({
      totalCO2: carbonFP?.totalCO2 || 0,
      vessels: emissions.length,
      avgCII: carbonFP?.ciiAverage || 'C',
      topEmitters: carbonFP?.topEmitters || [],
    });
    if (result) toast.success('Análise de emissões gerada');
  };

  const handlePredictive = async () => {
    const result = await predictiveAnalysis({
      monthlyTrend: carbonFP?.monthlyTrend || [],
      totalCO2: carbonFP?.totalCO2 || 0,
      vessels: emissions.length,
    });
    if (result) toast.success('Análise preditiva gerada');
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

  if (!carbonFP) return null;

  const ciiColorMap: Record<string, string> = {
    A: 'text-emerald-500 bg-emerald-500/10',
    B: 'text-green-500 bg-green-500/10',
    C: 'text-amber-500 bg-amber-500/10',
    D: 'text-orange-500 bg-orange-500/10',
    E: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-xl">
            <Leaf className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Carbon Footprint Tracker</h2>
            <p className="text-sm text-muted-foreground">Rastreamento de emissões e metas IMO</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePredictive} disabled={aiLoading}>
            <TrendingUp className="h-4 w-4 mr-1" /> Previsão
          </Button>
          <Button size="sm" onClick={handleAnalyzeEmissions} disabled={aiLoading}>
            <Sparkles className="h-4 w-4 mr-1" /> Analisar
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/20">
          <CardContent className="p-6 text-center">
            <Factory className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{carbonFP.totalCO2.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Toneladas CO₂ (Total)</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardContent className="p-6 text-center">
            <Gauge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-2xl font-bold ${ciiColorMap[carbonFP.ciiAverage] || ciiColorMap.C}`}>
              {carbonFP.ciiAverage}
            </div>
            <p className="text-xs text-muted-foreground mt-2">CII Rating Médio da Frota</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{carbonFP.reductionPct}%</p>
            <p className="text-xs text-muted-foreground mt-1">Progresso vs Meta 2030</p>
          </CardContent>
        </Card>
      </div>

      {/* IMO Targets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            Metas de Descarbonização IMO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <TargetRow
            label="IMO 2030 – Redução de 40%"
            current={carbonFP.totalCO2}
            target={carbonFP.imo2030Target}
            deadline="2030"
          />
          <TargetRow
            label="IMO 2050 – Redução de 70%"
            current={carbonFP.totalCO2}
            target={carbonFP.imo2050Target}
            deadline="2050"
          />
          <TargetRow
            label="EU FuelEU Maritime 2025"
            current={85}
            target={100}
            deadline="2025"
            isPercent
          />
        </CardContent>
      </Card>

      {/* Vessel Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Ship className="h-4 w-4 text-blue-500" />
            Emissões por Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emissions.length > 0 ? (
            <div className="space-y-3">
              {emissions.slice(0, 8).map((e, i) => {
                const maxCO2 = Math.max(...emissions.map(x => x.co2Tons), 1);
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{e.vesselName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono">{e.co2Tons.toLocaleString()} t CO₂</span>
                          <Badge className={`text-xs ${ciiColorMap[e.ciiRating] || ''} border-0`}>
                            CII {e.ciiRating}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(e.co2Tons / maxCO2) * 100} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flame className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Sem dados de emissões. Cadastre na tabela vessel_emissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Target Row ─────────────────────────────────────────────────
function TargetRow({ label, current, target, deadline, isPercent }: {
  label: string; current: number; target: number; deadline: string; isPercent?: boolean;
}) {
  const pct = isPercent ? current : (target > 0 ? Math.min((current / target) * 100, 150) : 0);
  const onTrack = isPercent ? current >= target : current <= target;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <Badge variant={onTrack ? 'default' : 'destructive'} className="text-xs">
            {onTrack ? '✓ No alvo' : '✗ Acima da meta'}
          </Badge>
          <span className="text-xs text-muted-foreground">até {deadline}</span>
        </div>
      </div>
      <Progress value={Math.min(pct, 100)} className="h-3" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Atual: {isPercent ? `${current}%` : `${current.toLocaleString()} t`}</span>
        <span>Meta: {isPercent ? `${target}%` : `${target.toLocaleString()} t`}</span>
      </div>
    </div>
  );
}
