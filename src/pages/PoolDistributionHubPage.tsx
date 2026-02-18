/**
 * Pool Distribution Hub - Sprint 12
 * Vessel pool revenue sharing and settlement management
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { SmartKPIGrid } from '@/components/ui/premium-module-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Anchor, Plus, FileText, DollarSign, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success',
  suspended: 'bg-warning/20 text-warning',
  exited: 'bg-muted text-muted-foreground',
  pending: 'bg-info/20 text-info',
};

const settlementStatusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  calculated: 'bg-info/20 text-info',
  approved: 'bg-success/20 text-success',
  paid: 'bg-primary/20 text-primary',
  disputed: 'bg-destructive/20 text-destructive',
};

export default function PoolDistributionHubPage() {
  const [activeTab, setActiveTab] = useState('arrangements');

  const { data: pools = [], isLoading } = useQuery({
    queryKey: ['pool-arrangements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pool_arrangements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: settlements = [] } = useQuery({
    queryKey: ['pool-settlements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pool_settlements')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const activePools = pools.filter(p => p.status === 'active').length;
  const totalRevenue = pools.reduce((s, p) => s + Number(p.gross_revenue || 0), 0);
  const totalDistribution = pools.reduce((s, p) => s + Number(p.net_distribution || 0), 0);
  const avgTCE = settlements.length > 0 ? settlements.reduce((s, st) => s + Number(st.tce_achieved || 0), 0) / settlements.length : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Pool Distribution Hub</h1>
        <p className="text-muted-foreground">Vessel pool revenue sharing, point allocation and quarterly settlement management</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartKPIGrid kpis={[
          { id: 'active-pools', title: 'Active Pools', value: activePools.toString(), icon: Anchor, trend: 0 },
          { id: 'gross-rev', title: 'Gross Revenue', value: `$${(totalRevenue / 1e6).toFixed(1)}M`, icon: DollarSign, trend: 3 },
          { id: 'net-dist', title: 'Net Distribution', value: `$${(totalDistribution / 1e6).toFixed(1)}M`, icon: TrendingUp, trend: 2 },
          { id: 'avg-tce', title: 'Avg TCE', value: avgTCE > 0 ? `$${avgTCE.toFixed(0)}/day` : 'N/A', icon: BarChart3, trend: avgTCE > 15000 ? 5 : -2 },
        ]} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="arrangements">Pool Arrangements</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="arrangements" className="space-y-4">
            <div className="flex gap-3">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add to Pool</Button>
              <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Export</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading pools...</div>
            ) : pools.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Anchor className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No pool arrangements</p>
                <p className="text-sm">Add vessel pool memberships to track revenue distribution</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {pools.map(pool => (
                  <Card key={pool.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pool.pool_name}</span>
                            <Badge className={statusColors[pool.status || 'active']}>{pool.status}</Badge>
                            <Badge variant="outline">{pool.pool_type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Manager: {pool.pool_manager || 'N/A'} • Points: {pool.pool_points}
                            {pool.vessel_class && ` • Class: ${pool.vessel_class}`}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {pool.entry_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Entry: {new Date(pool.entry_date).toLocaleDateString()}</span>}
                            {pool.eco_rating && <span>Eco: {pool.eco_rating}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-lg font-bold">${Number(pool.net_distribution || 0).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Net Distribution</div>
                          <div className="text-xs mt-1">Adj Factor: {pool.adjustment_factor}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4">
            {settlements.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No settlements recorded</p>
                <p className="text-sm">Quarterly settlements will appear here after calculation</p>
              </CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Period</th>
                      <th className="text-right p-3 font-medium">Trading Days</th>
                      <th className="text-right p-3 font-medium">Earning Days</th>
                      <th className="text-right p-3 font-medium">Gross Revenue</th>
                      <th className="text-right p-3 font-medium">Net Settlement</th>
                      <th className="text-right p-3 font-medium">TCE Achieved</th>
                      <th className="text-right p-3 font-medium">Pool Avg TCE</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {settlements.map(s => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="p-3 font-medium">{s.settlement_period || `${s.period_start} - ${s.period_end}`}</td>
                        <td className="p-3 text-right">{s.trading_days}</td>
                        <td className="p-3 text-right">{s.earning_days}</td>
                        <td className="p-3 text-right">${Number(s.gross_pool_revenue || 0).toLocaleString()}</td>
                        <td className="p-3 text-right font-medium">${Number(s.net_settlement || 0).toLocaleString()}</td>
                        <td className="p-3 text-right">${Number(s.tce_achieved || 0).toLocaleString()}/d</td>
                        <td className="p-3 text-right">${Number(s.pool_avg_tce || 0).toLocaleString()}/d</td>
                        <td className="p-3"><Badge className={settlementStatusColors[s.status || 'draft']}>{s.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
