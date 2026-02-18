/**
 * P&I Claims Hub - Sprint 11
 * Protection & Indemnity Club claims management
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { SmartKPIGrid } from '@/components/ui/premium-module-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Search, Plus, DollarSign, AlertTriangle, Clock, FileText, Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  notified: 'bg-info/20 text-info',
  under_investigation: 'bg-warning/20 text-warning',
  reserve_set: 'bg-primary/20 text-primary',
  negotiation: 'bg-accent/80 text-accent-foreground',
  settled: 'bg-success/20 text-success',
  closed: 'bg-muted text-muted-foreground',
  reopened: 'bg-destructive/20 text-destructive',
  declined: 'bg-muted text-muted-foreground line-through',
};

const priorityColors: Record<string, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-muted text-muted-foreground',
  high: 'bg-warning text-warning-foreground',
  critical: 'bg-destructive text-destructive-foreground',
};

export default function PIClaimsHubPage() {
  const [search, setSearch] = useState('');

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['pi-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pi_claims')
        .select('*')
        .order('incident_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = claims.filter(c =>
    !search ||
    c.claim_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.claimant_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalReserve = claims.reduce((s, c) => s + Number(c.reserve_amount || 0), 0);
  const totalPaid = claims.reduce((s, c) => s + Number(c.paid_amount || 0), 0);
  const totalRecovered = claims.reduce((s, c) => s + Number(c.recovered_amount || 0), 0);
  const openClaims = claims.filter(c => !['closed', 'settled', 'declined'].includes(c.status || '')).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">P&I Claims Management</h1>
        <p className="text-muted-foreground">Protection & Indemnity Club claims tracking, reserves and recovery management</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartKPIGrid kpis={[
          { id: 'open-claims', title: 'Open Claims', value: openClaims.toString(), icon: Shield, trend: -openClaims },
          { id: 'total-reserve', title: 'Total Reserves', value: `$${(totalReserve / 1000).toFixed(0)}K`, icon: DollarSign, trend: 0 },
          { id: 'total-paid', title: 'Total Paid', value: `$${(totalPaid / 1000).toFixed(0)}K`, icon: Scale, trend: -1 },
          { id: 'recovered', title: 'Recovered', value: `$${(totalRecovered / 1000).toFixed(0)}K`, icon: AlertTriangle, trend: totalRecovered > 0 ? 5 : 0 },
        ]} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="claims">
          <TabsList>
            <TabsTrigger value="claims">All Claims</TabsTrigger>
            <TabsTrigger value="analysis">Loss Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search claim number, description, claimant..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Claim</Button>
              <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Export</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading claims...</div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No P&I claims recorded</p>
                <p className="text-sm">Register a new claim to begin tracking</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {filtered.map(claim => (
                  <Card key={claim.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium font-mono">{claim.claim_number || 'Draft'}</span>
                            <Badge className={statusColors[claim.status || 'notified']}>{claim.status?.replace('_', ' ')}</Badge>
                            <Badge className={priorityColors[claim.priority || 'medium']}>{claim.priority}</Badge>
                            <Badge variant="outline">{claim.claim_type?.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{claim.description || 'No description'}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(claim.incident_date).toLocaleDateString()}</span>
                            {claim.pi_club && <span>Club: {claim.pi_club}</span>}
                            {claim.incident_location && <span>📍 {claim.incident_location}</span>}
                            {claim.claimant_name && <span>Claimant: {claim.claimant_name}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-lg font-bold">${Number(claim.reserve_amount || 0).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Reserve</div>
                          {Number(claim.paid_amount || 0) > 0 && (
                            <div className="text-xs text-destructive mt-1">Paid: ${Number(claim.paid_amount).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Loss Ratio Analysis</p>
              <p className="text-sm">Premiums vs Claims, frequency by type, and trend analysis</p>
              <p className="text-sm mt-2">Total claims: {claims.length} | Net exposure: ${(totalReserve - totalRecovered).toLocaleString()}</p>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
