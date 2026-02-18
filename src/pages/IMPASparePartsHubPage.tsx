/**
 * IMPA Spare Parts Hub - Sprint 9
 * IMPA/ISSA coded spare parts catalog with stock management
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { SmartKPIGrid } from '@/components/ui/premium-module-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, AlertTriangle, TrendingDown, ArrowUpDown, Plus, Download, BarChart3, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const IMPA_CATEGORIES = [
  'Deck Equipment', 'Engine Room', 'Electrical', 'Safety Equipment',
  'Navigation', 'Mooring', 'Painting', 'Cleaning', 'Galley',
  'Medical', 'Stationery', 'Tools', 'Lubricants', 'Chemicals'
];

const criticalityColors: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-secondary text-secondary-foreground',
};

export default function IMPASparePartsHubPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['impa-spare-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impa_spare_parts')
        .select('*')
        .order('impa_code', { ascending: true })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['spare-parts-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spare_parts_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = parts.filter(p => {
    const matchSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.impa_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.part_number?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const criticalCount = parts.filter(p => p.criticality === 'critical').length;
  const lowStockCount = parts.filter(p => (p.min_stock || 0) > 0 && p.min_stock! <= (p.reorder_point || 2)).length;
  const totalValue = parts.reduce((sum, p) => sum + (p.standard_unit_cost || 0) * (p.min_stock || 0), 0);
  const hazmatCount = parts.filter(p => p.is_hazardous).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">IMPA Spare Parts Catalog</h1>
        <p className="text-muted-foreground">IMPA/ISSA coded inventory with criticality tracking and reorder automation</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartKPIGrid kpis={[
          { id: 'total-parts', title: 'Total Parts', value: parts.length.toString(), icon: Package, trend: 0 },
          { id: 'critical-items', title: 'Critical Items', value: criticalCount.toString(), icon: AlertTriangle, trend: criticalCount > 5 ? -criticalCount : criticalCount },
          { id: 'low-stock', title: 'Low Stock Alerts', value: lowStockCount.toString(), icon: TrendingDown, trend: -lowStockCount },
          { id: 'inv-value', title: 'Inventory Value', value: `$${(totalValue / 1000).toFixed(0)}K`, icon: BarChart3, trend: 0 },
        ]} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search IMPA code, name, part number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Part</Button>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge variant={!selectedCategory ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(null)}>All</Badge>
              {IMPA_CATEGORIES.map(cat => (
                <Badge key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedCategory(cat)}>{cat}</Badge>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading catalog...</div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No spare parts found</p>
                <p className="text-sm">Add IMPA-coded parts to build your catalog</p>
              </CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">IMPA Code</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Criticality</th>
                      <th className="text-right p-3 font-medium">Unit Cost</th>
                      <th className="text-right p-3 font-medium">Min Stock</th>
                      <th className="text-right p-3 font-medium">Lead Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.slice(0, 50).map(part => (
                      <tr key={part.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-medium">{part.impa_code}</td>
                        <td className="p-3">
                          <div>{part.name}</div>
                          {part.part_number && <div className="text-xs text-muted-foreground">P/N: {part.part_number}</div>}
                        </td>
                        <td className="p-3"><Badge variant="outline">{part.category}</Badge></td>
                        <td className="p-3">
                          <Badge className={criticalityColors[part.criticality || 'normal']}>{part.criticality}</Badge>
                        </td>
                        <td className="p-3 text-right">${(part.standard_unit_cost || 0).toFixed(2)}</td>
                        <td className="p-3 text-right">{part.min_stock} {part.unit}</td>
                        <td className="p-3 text-right">{part.lead_time_days}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            {movements.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No stock movements recorded yet</p>
              </CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-left p-3 font-medium">Reference</th>
                      <th className="text-left p-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movements.map(m => (
                      <tr key={m.id} className="hover:bg-muted/30">
                        <td className="p-3">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-3"><Badge variant="outline">{m.movement_type}</Badge></td>
                        <td className="p-3 text-right font-mono">{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                        <td className="p-3">{m.reference_number || '-'}</td>
                        <td className="p-3 text-muted-foreground">{m.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reorder" className="space-y-4">
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <ArrowUpDown className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Reorder Point Monitoring</p>
              <p className="text-sm">Parts below reorder point will trigger automatic purchase requisitions</p>
              <p className="text-sm mt-2">{lowStockCount} items currently at or below reorder point</p>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
