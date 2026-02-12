/**
 * Waste Intelligence Panel - World-Class Component
 * MARPOL-compliant waste management: tanks, discharge records, AI classification
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trash2, Droplets, AlertTriangle, ShieldCheck, Search,
  FileText, Sparkles, RefreshCw, Recycle, Ship
} from 'lucide-react';
import { toast } from 'sonner';
import { useWasteIntelligenceData, type WasteCategory, type DischargeRecord } from '@/hooks/useWasteIntelligenceData';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';

export function WasteIntelligencePanel() {
  const { data, isLoading, refetch } = useWasteIntelligenceData();
  const { classifyWaste, checkCompliance, isLoading: aiLoading } = useESGWasteAI();
  const [classifyInput, setClassifyInput] = useState('');
  const [classifyResult, setClassifyResult] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const wasteCategories = data?.wasteCategories || [];
  const dischargeRecords = data?.dischargeRecords || [];

  const criticalCount = wasteCategories.filter(c => c.status === 'critical').length;
  const warningCount = wasteCategories.filter(c => c.status === 'warning').length;

  const filteredRecords = dischargeRecords.filter(r =>
    !searchTerm || 
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassify = async () => {
    if (!classifyInput.trim()) return;
    const result = await classifyWaste(classifyInput);
    if (result) {
      setClassifyResult(result);
      toast.success('Classificação MARPOL realizada');
    }
  };

  const handleComplianceCheck = async () => {
    const result = await checkCompliance({
      tanks: wasteCategories.length,
      criticalTanks: criticalCount,
      discharges: dischargeRecords.length,
      categories: wasteCategories.map(c => c.name),
    });
    if (result) {
      toast.success('Verificação de compliance concluída');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={`waste-intel-skeleton-${i}`} className="animate-pulse">
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
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <Recycle className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Waste Intelligence</h2>
            <p className="text-sm text-muted-foreground">Gestão MARPOL de resíduos com IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleComplianceCheck} disabled={aiLoading}>
            <ShieldCheck className="h-4 w-4 mr-1" /> Checar Compliance
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                {criticalCount} tanque(s) em nível crítico!
              </p>
              <p className="text-xs text-muted-foreground">
                Descarte imediato necessário para conformidade MARPOL
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tanks">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="tanks">Tanques</TabsTrigger>
          <TabsTrigger value="records">Registros</TabsTrigger>
          <TabsTrigger value="classify">IA Classificação</TabsTrigger>
        </TabsList>

        {/* Tanks Tab */}
        <TabsContent value="tanks" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wasteCategories.length > 0 ? wasteCategories.map(tank => (
              <TankCard key={tank.id} tank={tank} />
            )) : (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Droplets className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum tanque de resíduos cadastrado. Cadastre os tanques na tabela waste_tanks.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar registros de descarte..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-semibold">Data</th>
                      <th className="text-left p-3 font-semibold">Embarcação</th>
                      <th className="text-left p-3 font-semibold">Categoria</th>
                      <th className="text-right p-3 font-semibold">Volume</th>
                      <th className="text-left p-3 font-semibold">Método</th>
                      <th className="text-left p-3 font-semibold">Local</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? filteredRecords.map(record => (
                      <tr key={record.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-3 font-mono text-xs">{record.date}</td>
                        <td className="p-3 flex items-center gap-1.5">
                          <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.vessel}
                        </td>
                        <td className="p-3">{record.category}</td>
                        <td className="p-3 text-right font-mono">{record.volume} {record.unit}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {record.method === 'shore' ? 'Em Terra' : record.method === 'sea' ? 'No Mar' : 'Incinerado'}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs">{record.location}</td>
                        <td className="p-3 text-center">
                          {record.verified ? (
                            <Badge className="text-xs bg-emerald-500/10 text-emerald-600">
                              <ShieldCheck className="h-3 w-3 mr-1" /> Verificado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pendente</Badge>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Nenhum registro de descarte encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Classification Tab */}
        <TabsContent value="classify" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Classificação MARPOL com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Descreva o resíduo e a IA classificará conforme MARPOL Annexes I-VI
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Óleo lubrificante usado do motor principal..."
                  value={classifyInput}
                  onChange={e => setClassifyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleClassify()}
                />
                <Button onClick={handleClassify} disabled={aiLoading || !classifyInput.trim()}>
                  <Sparkles className="h-4 w-4 mr-1" /> Classificar
                </Button>
              </div>
              {classifyResult && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-xs">
                      {classifyResult}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tank Card ──────────────────────────────────────────────────
function TankCard({ tank }: { tank: WasteCategory }) {
  const fillPct = tank.capacity > 0 ? (tank.currentVolume / tank.capacity) * 100 : 0;
  const statusConfig = {
    ok: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Normal' },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Atenção' },
    critical: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'Crítico' },
  };
  const cfg = statusConfig[tank.status];

  return (
    <Card className={`border ${cfg.border}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className={`h-4 w-4 ${cfg.color}`} />
            <span className="font-semibold text-sm">{tank.name}</span>
          </div>
          <Badge className={`${cfg.bg} ${cfg.color} text-xs border-0`}>{cfg.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{tank.code}</Badge>
          <span className="text-xs text-muted-foreground">MARPOL</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{tank.currentVolume.toLocaleString()} / {tank.capacity.toLocaleString()} {tank.unit}</span>
            <span className="font-bold">{fillPct.toFixed(0)}%</span>
          </div>
          <Progress value={Math.min(fillPct, 100)} className="h-2" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Último descarte: {tank.lastDischarge || 'N/A'}</span>
          <span>{tank.method}</span>
        </div>
      </CardContent>
    </Card>
  );
}
