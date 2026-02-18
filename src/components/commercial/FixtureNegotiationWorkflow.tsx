/**
 * Fixture Negotiation Workflow — Wave 5 Commercial Enhancement
 * Workflow completo: Inquiry → Offer → Counter-Offer → Subjects → Fixed
 * BEATS: Shipfix (fixture negotiations)
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, ArrowRight, CheckCircle, XCircle, Clock, FileText, Ship, DollarSign, Anchor } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  inquiry: { label: 'Inquiry', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  offer: { label: 'Offer', color: 'bg-yellow-500/20 text-yellow-400', icon: DollarSign },
  counter_offer: { label: 'Counter Offer', color: 'bg-orange-500/20 text-orange-400', icon: ArrowRight },
  subjects: { label: 'On Subjects', color: 'bg-purple-500/20 text-purple-400', icon: Clock },
  fixed: { label: 'Fixed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

export function FixtureNegotiationWorkflow() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedNeg, setSelectedNeg] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: negotiations = [], isLoading } = useQuery({
    queryKey: ['fixture-negotiations'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('fixture_negotiations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['fixture-offers', selectedNeg],
    queryFn: async () => {
      if (!selectedNeg) return [];
      const { data, error } = await (supabase.from as Function)('fixture_offers')
        .select('*')
        .eq('negotiation_id', selectedNeg)
        .order('round_number', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedNeg,
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await (supabase.from as Function)('fixture_negotiations').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixture-negotiations'] });
      toast.success('Negociação criada');
      setCreateOpen(false);
    },
  });

  const addOfferMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await (supabase.from as Function)('fixture_offers').insert(form);
      if (error) throw error;
      // Update negotiation status
      const nextStatus = form.offer_type === 'acceptance' ? 'fixed' : form.offer_type === 'rejection' ? 'failed' : 'counter_offer';
      await (supabase.from as Function)('fixture_negotiations')
        .update({ status: nextStatus, current_round: (form.round_number as number) })
        .eq('id', form.negotiation_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixture-negotiations'] });
      queryClient.invalidateQueries({ queryKey: ['fixture-offers'] });
      toast.success('Oferta registrada');
      setOfferOpen(false);
    },
  });

  const activeCount = negotiations.filter((n: Record<string, unknown>) => !['fixed', 'failed', 'withdrawn'].includes(n.status as string)).length;
  const fixedCount = negotiations.filter((n: Record<string, unknown>) => n.status === 'fixed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Anchor className="h-5 w-5 text-primary" />
            Fixture Negotiation Workflow
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} ativas • {fixedCount} fixadas
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Nova Negociação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Fixture Negotiation</DialogTitle></DialogHeader>
            <CreateNegotiationForm onSubmit={(f) => createMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = negotiations.filter((n: Record<string, unknown>) => n.status === key).length;
          return (
            <Card key={key} className="text-center">
              <CardContent className="p-3">
                <cfg.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <p className="text-xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Negotiations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Negociações</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {negotiations.map((neg: Record<string, unknown>) => {
              const cfg = STATUS_CONFIG[neg.status as string] || STATUS_CONFIG.inquiry;
              return (
                <div
                  key={neg.id as string}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedNeg === neg.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedNeg(neg.id as string)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{(neg.charterer_name as string) || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {neg.load_port as string} → {neg.discharge_port as string}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {neg.cargo_quantity_mt as number} MT • USD {neg.freight_rate as number}/MT
                      </p>
                    </div>
                    <Badge className={cfg.color}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })}
            {negotiations.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma negociação</p>
            )}
          </CardContent>
        </Card>

        {/* Offer History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Histórico de Ofertas</CardTitle>
            {selectedNeg && (
              <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-3 w-3" /> Adicionar Oferta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Oferta/Counter</DialogTitle></DialogHeader>
                  <AddOfferForm negotiationId={selectedNeg} round={(offers.length || 0) + 1} onSubmit={(f) => addOfferMutation.mutate(f)} />
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {!selectedNeg ? (
              <p className="text-sm text-muted-foreground text-center py-6">Selecione uma negociação</p>
            ) : offers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem ofertas ainda</p>
            ) : (
              offers.map((o: Record<string, unknown>, i: number) => (
                <div key={o.id as string} className="p-3 rounded-lg border-l-4 border-l-primary/50 bg-muted/30">
                  <div className="flex justify-between">
                    <Badge variant="outline">Round {o.round_number as number}</Badge>
                    <Badge variant="secondary">{(o.offer_type as string).replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">By:</span> {o.offered_by as string} •
                    <span className="text-muted-foreground"> Rate:</span> USD {o.freight_rate as number}
                  </p>
                  {(o.notes as string) && <p className="text-xs text-muted-foreground mt-1">{o.notes as string}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateNegotiationForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    charterer_name: '', cargo_type: '', cargo_quantity_mt: '',
    load_port: '', discharge_port: '', freight_rate: '', demurrage_rate: '',
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Afretador</Label><Input value={form.charterer_name} onChange={e => setForm(f => ({ ...f, charterer_name: e.target.value }))} /></div>
        <div><Label>Carga</Label><Input value={form.cargo_type} onChange={e => setForm(f => ({ ...f, cargo_type: e.target.value }))} /></div>
        <div><Label>Quantidade (MT)</Label><Input type="number" value={form.cargo_quantity_mt} onChange={e => setForm(f => ({ ...f, cargo_quantity_mt: e.target.value }))} /></div>
        <div><Label>Frete (USD/MT)</Label><Input type="number" value={form.freight_rate} onChange={e => setForm(f => ({ ...f, freight_rate: e.target.value }))} /></div>
        <div><Label>Porto Carga</Label><Input value={form.load_port} onChange={e => setForm(f => ({ ...f, load_port: e.target.value }))} /></div>
        <div><Label>Porto Descarga</Label><Input value={form.discharge_port} onChange={e => setForm(f => ({ ...f, discharge_port: e.target.value }))} /></div>
      </div>
      <Button className="w-full" onClick={() => onSubmit({
        ...form,
        cargo_quantity_mt: Number(form.cargo_quantity_mt) || 0,
        freight_rate: Number(form.freight_rate) || 0,
        demurrage_rate: Number(form.demurrage_rate) || 0,
        status: 'inquiry',
      })}>Criar Negociação</Button>
    </div>
  );
}

function AddOfferForm({ negotiationId, round, onSubmit }: { negotiationId: string; round: number; onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ offer_type: 'offer', offered_by: 'owner', freight_rate: '', notes: '' });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo</Label>
          <Select value={form.offer_type} onValueChange={v => setForm(f => ({ ...f, offer_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="counter_offer">Counter Offer</SelectItem>
              <SelectItem value="final">Final Offer</SelectItem>
              <SelectItem value="acceptance">Acceptance</SelectItem>
              <SelectItem value="rejection">Rejection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ofertante</Label>
          <Select value={form.offered_by} onValueChange={v => setForm(f => ({ ...f, offered_by: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="charterer">Charterer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Frete (USD/MT)</Label><Input type="number" value={form.freight_rate} onChange={e => setForm(f => ({ ...f, freight_rate: e.target.value }))} /></div>
      <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      <Button className="w-full" onClick={() => onSubmit({
        negotiation_id: negotiationId,
        round_number: round,
        offer_type: form.offer_type,
        offered_by: form.offered_by,
        freight_rate: Number(form.freight_rate) || 0,
        notes: form.notes,
      })}>Registrar Oferta</Button>
    </div>
  );
}
