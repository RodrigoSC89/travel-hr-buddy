/**
 * Manning Agent Portal — Wave 5 Crew Enhancement
 * External manning agency management with candidate pipeline
 * BEATS: Adonis WMS (Manning Agent Portal)
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Building2, Plus, Users, Star, Globe, Shield } from 'lucide-react';

export function ManningAgentPortal() {
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['manning-agents'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('manning_agents')
        .select('*')
        .order('agent_name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['manning-candidates', selectedAgent],
    queryFn: async () => {
      if (!selectedAgent) return [];
      const { data, error } = await fromUntyped('manning_agent_candidates')
        .select('*')
        .eq('agent_id', selectedAgent)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedAgent,
  });

  const createAgentMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await fromUntyped('manning_agents').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manning-agents'] });
      toast.success('Manning agent cadastrado');
      setAddAgentOpen(false);
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await fromUntyped('manning_agent_candidates').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manning-candidates'] });
      toast.success('Candidato adicionado');
      setAddCandidateOpen(false);
    },
  });

  const mlcCompliant = agents.filter((a: Record<string, unknown>) => a.mlc_compliant).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Manning Agent Portal
          </h3>
          <p className="text-sm text-muted-foreground">
            {agents.length} agências • {mlcCompliant} MLC compliant
          </p>
        </div>
        <Dialog open={addAgentOpen} onOpenChange={setAddAgentOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Novo Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Manning Agent</DialogTitle></DialogHeader>
            <CreateAgentForm onSubmit={(f) => createAgentMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Agências ({agents.length})</TabsTrigger>
          <TabsTrigger value="candidates">Candidatos ({candidates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-2">
          {agents.map((agent: Record<string, unknown>) => (
            <Card
              key={agent.id as string}
              className={`cursor-pointer transition-colors ${selectedAgent === agent.id ? 'border-primary' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedAgent(agent.id as string)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {agent.agent_name as string}
                      {(agent.mlc_compliant as boolean) && <Shield className="h-3 w-3 text-green-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 inline mr-1" />{String(agent.country || 'N/A')} •
                      {String(agent.contact_person || '')} • {String(agent.email || '')}
                    </p>
                    {((agent.flag_state_approved as string[]) || []).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {((agent.flag_state_approved as string[]) || []).slice(0, 5).map((f, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(agent.rating as number) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm font-medium">{String(agent.rating)}/5</span>
                      </div>
                    )}
                    <Badge variant={agent.status === 'active' ? 'default' : 'destructive'}>
                      {agent.status as string}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-2">
          <div className="flex justify-end">
            {selectedAgent && (
              <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Novo Candidato</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Adicionar Candidato</DialogTitle></DialogHeader>
                  <CreateCandidateForm agentId={selectedAgent} onSubmit={(f) => createCandidateMutation.mutate(f)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          {!selectedAgent ? (
            <p className="text-sm text-muted-foreground text-center py-6">Selecione uma agência</p>
          ) : candidates.map((c: Record<string, unknown>) => (
            <Card key={c.id as string}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{c.candidate_name as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.rank as string} • {c.nationality as string} • {c.experience_years as number}y exp
                    </p>
                  </div>
                  <Badge variant="outline">{c.status as string}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateAgentForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    agent_name: '', country: '', contact_person: '', email: '', phone: '', license_number: '', mlc_compliant: false,
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome da Agência</Label><Input value={form.agent_name} onChange={e => setForm(f => ({ ...f, agent_name: e.target.value }))} /></div>
        <div><Label>País</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
        <div><Label>Contato</Label><Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
        <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.mlc_compliant} onChange={e => setForm(f => ({ ...f, mlc_compliant: e.target.checked }))} />
        <Label>MLC 2006 Compliant</Label>
      </div>
      <Button className="w-full" onClick={() => onSubmit({ ...form, status: 'active' })}>Cadastrar Agent</Button>
    </div>
  );
}

function CreateCandidateForm({ agentId, onSubmit }: { agentId: string; onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    candidate_name: '', rank: '', nationality: '', experience_years: '',
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome</Label><Input value={form.candidate_name} onChange={e => setForm(f => ({ ...f, candidate_name: e.target.value }))} /></div>
        <div><Label>Posto</Label><Input value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} /></div>
        <div><Label>Nacionalidade</Label><Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} /></div>
        <div><Label>Exp. (anos)</Label><Input type="number" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} /></div>
      </div>
      <Button className="w-full" onClick={() => onSubmit({
        agent_id: agentId,
        candidate_name: form.candidate_name,
        rank: form.rank,
        nationality: form.nationality,
        experience_years: Number(form.experience_years) || 0,
        status: 'available',
      })}>Adicionar Candidato</Button>
    </div>
  );
}
