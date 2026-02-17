/**
 * Fatigue Risk Predictor - Refactored
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle2, Brain, FileText, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CREW_DATA, MLC_VIOLATIONS } from './fatigue/types';
import { FatigueTabs } from './fatigue/FatigueTabs';

export default function FatigueRiskPage() {
  const [crew] = useState(CREW_DATA);
  const [violations] = useState(MLC_VIOLATIONS);

  const stats = {
    avgFatigue: crew.reduce((acc, c) => acc + c.fatigueScore, 0) / crew.length,
    highRisk: crew.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length,
    mlcViolations: violations.filter(v => v.severity === 'violation').length,
    compliant: crew.filter(c => c.mlcCompliant).length,
  };

  return (
    <>
      <Helmet>
        <title>Fatigue Risk Predictor | Nauti One</title>
        <meta name="description" content="Predição de fadiga da tripulação com ML + MLC 2006" />
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Fatigue Risk Predictor
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500"><Brain className="h-3 w-3 mr-1" />ML + MLC 2006</Badge>
              </h1>
              <p className="text-muted-foreground">Monitoramento em tempo real e predição de fadiga da tripulação</p>
            </div>
          </div>
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className={cn("text-3xl font-bold", stats.avgFatigue > 60 ? 'text-destructive' : stats.avgFatigue > 40 ? 'text-warning' : 'text-success')}>{stats.avgFatigue.toFixed(0)}%</p><p className="text-xs text-muted-foreground">Fadiga Média</p></div><div className="p-2 rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-destructive">{stats.highRisk}</p><p className="text-xs text-muted-foreground">Alto Risco</p></div><div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-warning">{stats.mlcViolations}</p><p className="text-xs text-muted-foreground">Violações MLC</p></div><div className="p-2 rounded-lg bg-warning/10"><FileText className="h-5 w-5 text-warning" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-success">{stats.compliant}/{crew.length}</p><p className="text-xs text-muted-foreground">Conformes MLC</p></div><div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div></div></CardContent></Card>
        </div>

        <FatigueTabs crew={crew} violations={violations} />
      </div>
    </>
  );
}
