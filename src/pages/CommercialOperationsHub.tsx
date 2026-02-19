/**
 * Commercial Operations Hub - Wave 1 Gap Coverage
 * Integrates: Voyage P&L, Laytime/Demurrage, CII Rating, TCE Benchmark
 * Surpasses: Veson IMOS, RightShip, DNV Navigator
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign, Ship, Anchor, Leaf, BarChart3, Calculator,
  TrendingUp, Clock, RefreshCw, Timer
} from 'lucide-react';
import { DemurrageCalculatorTab } from '@/components/operations/DemurrageCalculatorTab';
import { toast } from 'sonner';

// Existing components
import { VoyagePnLManager } from '@/components/finance/VoyagePnLManager';
import LaytimeDemurrageCalculator from '@/components/operations/LaytimeDemurrageCalculator';
import { CIIRatingDashboard } from '@/components/esg/CIIRatingDashboard';
import { TCEBenchmark } from '@/components/voyage/TCEBenchmark';

// Live P&L Calculator via Edge Function
function LiveVoyagePLCalculator({ voyageId, onResult }: { voyageId: string; onResult?: (data: unknown) => void }) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const calculate = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-voyage-pl', {
        body: { voyageId },
      });
      if (error) throw error;
      setResult(data);
      onResult?.(data);
      toast.success(`P&L calculado: ${data.is_profitable ? 'Lucrativo' : 'Prejuízo'} — TCE: $${data.tce_per_day}/dia`);
    } catch (err) {
      toast.error('Erro ao calcular P&L');
    } finally {
      setIsCalculating(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Calcular P&L em Tempo Real
          <Badge variant="outline" className="text-[10px] ml-auto">Edge Function</Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Calcula automaticamente receitas, custos e TCE a partir dos dados reais de bunker, port calls e voyage accounting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={calculate} disabled={isCalculating || !voyageId} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculando...' : 'Calcular P&L Real'}
        </Button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
              <p className="text-[10px] text-success uppercase font-medium">Receita Total</p>
              <p className="text-lg font-bold text-success">{fmt(Number(result.total_revenue))}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-[10px] text-destructive uppercase font-medium">Despesas</p>
              <p className="text-lg font-bold text-destructive">{fmt(Number(result.total_expenses))}</p>
            </div>
            <div className={`p-3 rounded-lg border text-center ${Number(result.net_profit) >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
              <p className="text-[10px] uppercase font-medium text-muted-foreground">Lucro Líquido</p>
              <p className={`text-lg font-bold ${Number(result.net_profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {fmt(Number(result.net_profit))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-[10px] text-primary uppercase font-medium">TCE/dia</p>
              <p className="text-lg font-bold text-primary">{fmt(Number(result.tce_per_day))}</p>
            </div>

            {/* Breakdown */}
            <div className="col-span-full">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Bunker:</span>{' '}
                  <span className="font-medium">{fmt(Number(result.bunker_cost))}</span>
                </div>
                <div className="p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Portos:</span>{' '}
                  <span className="font-medium">{fmt(Number(result.port_costs))}</span>
                </div>
                <div className="p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Tripulação:</span>{' '}
                  <span className="font-medium">{fmt(Number(result.crew_cost))}</span>
                </div>
                <div className="p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Seguro:</span>{' '}
                  <span className="font-medium">{fmt(Number(result.insurance_cost))}</span>
                </div>
                <div className="p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Dias:</span>{' '}
                  <span className="font-medium">{String(result.days)}d</span>
                </div>
              </div>
            </div>

            <div className="col-span-full flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={Number(result.net_profit) >= 0 ? 'default' : 'destructive'} className="text-[10px]">
                Margem: {Number(result.margin_percent).toFixed(1)}%
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                ROI: {Number(result.roi_percent).toFixed(1)}%
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Breakeven: {fmt(Number(result.breakeven_freight))}
              </Badge>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommercialOperationsHub() {
  const [activeTab, setActiveTab] = useState('voyage-pnl');
  const [selectedVessel, setSelectedVessel] = useState('');
  const [selectedVoyage, setSelectedVoyage] = useState('');

  // Fetch vessels
  const { data: vessels = [] } = useQuery({
    queryKey: ['vessels-commercial'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, imo_number, status')
        .order('name');
      return data || [];
    },
  });

  // Fetch voyages for selected vessel
  const { data: voyages = [] } = useQuery({
    queryKey: ['voyages-commercial', selectedVessel],
    queryFn: async () => {
      let query = supabase
        .from('voyage_plans')
        .select('id, voyage_number, origin_port, destination_port, status')
        .order('created_at', { ascending: false })
        .limit(50);
      if (selectedVessel) query = query.eq('vessel_id', selectedVessel);
      const { data } = await query;
      return data || [];
    },
  });

  const selectedVesselData = vessels.find((v) => v.id === selectedVessel);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 p-1">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" />
            Commercial Operations Hub
          </h1>
          <p className="text-muted-foreground text-sm">
            Voyage P&L • Laytime & Demurrage • CII Rating • TCE Benchmark
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={selectedVessel} onValueChange={(v) => { setSelectedVessel(v); setSelectedVoyage(''); }}>
            <SelectTrigger className="w-[220px]">
              <Ship className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Selecionar Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Embarcações</SelectItem>
              {vessels.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} ({v.vessel_type || 'N/A'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(activeTab === 'live-pl' || activeTab === 'laytime') && (
            <Select value={selectedVoyage} onValueChange={setSelectedVoyage}>
              <SelectTrigger className="w-[220px]">
                <Anchor className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Selecionar Viagem" />
              </SelectTrigger>
              <SelectContent>
                {voyages.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.voyage_number || v.id.slice(0, 8)} — {v.origin_port || '?'} → {v.destination_port || '?'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            <TabsTrigger value="voyage-pnl" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Voyage P&L
            </TabsTrigger>
            <TabsTrigger value="live-pl" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" /> P&L Live
            </TabsTrigger>
            <TabsTrigger value="laytime" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Laytime
            </TabsTrigger>
            <TabsTrigger value="cii" className="gap-1.5">
              <Leaf className="h-3.5 w-3.5" /> CII Rating
            </TabsTrigger>
            <TabsTrigger value="tce" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> TCE Benchmark
            </TabsTrigger>
            <TabsTrigger value="demurrage-calc" className="gap-1.5">
              <Timer className="h-3.5 w-3.5" /> Demurrage Calc
            </TabsTrigger>
          </TabsList>

          {/* Voyage P&L (full manager) */}
          <TabsContent value="voyage-pnl" className="mt-4">
            <VoyagePnLManager />
          </TabsContent>

          {/* Live P&L Calculator */}
          <TabsContent value="live-pl" className="mt-4 space-y-4">
            {selectedVoyage ? (
              <LiveVoyagePLCalculator voyageId={selectedVoyage} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Selecione uma embarcação e uma viagem para calcular o P&L em tempo real</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O cálculo usa dados reais de bunker, port calls e voyage accounting via Edge Function
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Laytime & Demurrage */}
          <TabsContent value="laytime" className="mt-4">
            <LaytimeDemurrageCalculator />
          </TabsContent>

          {/* CII Rating */}
          <TabsContent value="cii" className="mt-4 space-y-4">
            {selectedVessel && selectedVessel !== 'all' ? (
              <CIIRatingDashboard vesselId={selectedVessel} vesselName={selectedVesselData?.name} />
            ) : (
              <div className="space-y-4">
                {vessels.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      CII Rating de todas as embarcações — selecione uma para detalhes
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vessels.slice(0, 6).map((v) => (
                        <div key={v.id} onClick={() => setSelectedVessel(v.id)} className="cursor-pointer">
                          <CIIRatingDashboard vesselId={v.id} vesselName={v.name} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Leaf className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Cadastre embarcações para visualizar o CII Rating</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* TCE Benchmark */}
          <TabsContent value="tce" className="mt-4 space-y-4">
            {selectedVessel && selectedVessel !== 'all' && selectedVesselData ? (
              <TCEBenchmark vesselType={selectedVesselData.vessel_type || 'General'} ourTce={15000} />
            ) : (
              <div className="space-y-4">
                {vessels.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Benchmarking TCE vs mercado — selecione uma embarcação para comparação detalhada
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vessels.slice(0, 4).map((v) => (
                        <div key={v.id} onClick={() => setSelectedVessel(v.id)} className="cursor-pointer">
                          <TCEBenchmark vesselType={v.vessel_type || 'General'} ourTce={15000} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Cadastre embarcações para visualizar o TCE Benchmark</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Demurrage Calculator */}
          <TabsContent value="demurrage-calc" className="mt-4">
            <DemurrageCalculatorTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
