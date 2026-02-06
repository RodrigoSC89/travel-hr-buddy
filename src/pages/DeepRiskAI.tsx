import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Brain, Shield, Target } from "lucide-react";
import { IntegrationGuard } from "@/components/ui/IntegrationGuard";

interface Risk { id: string; title: string; severity: 'low' | 'medium' | 'high' | 'critical'; probability: number; impact: number; status: 'identified' | 'mitigated'; description: string; }

export default function DeepRiskAI() {
  const [risks, setRisks] = useState<Risk[]>([
    { id: '1', title: 'Falha Sistema DP', severity: 'critical', probability: 15, impact: 95, status: 'identified', description: 'Risco de falha no posicionamento dinâmico' },
    { id: '2', title: 'Condições Meteorológicas', severity: 'high', probability: 40, impact: 70, status: 'mitigated', description: 'Previsão de tempestade na região' },
  ]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [form, setForm] = useState({ title: '', severity: 'medium' as Risk['severity'], probability: 50, impact: 50, description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setRisks(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
      toast.success('Risco atualizado');
    } else {
      setRisks(p => [{ id: Date.now().toString(), ...form, status: 'identified' }, ...p]);
      toast.success('Risco criado');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Excluir?')) { setRisks(p => p.filter(r => r.id !== id)); toast.success('Excluído'); } };
  const handleMitigate = (id: string) => { setRisks(p => p.map(r => r.id === id ? { ...r, status: 'mitigated' } : r)); toast.success('Risco mitigado'); };
  const handleAnalyze = (id: string) => { toast.info('IA analisando...'); setTimeout(() => toast.success('Análise concluída'), 2000); };

  const filtered = risks.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  const severityColors = { low: 'bg-green-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500' };
  const getScore = (p: number, i: number) => Math.round((p * i) / 100);

  return (
    <div className="p-6 space-y-6">
      <IntegrationGuard
        moduleName="Deep Risk AI"
        integrationRequired="Motor de análise de risco ML + dados históricos de incidentes submarinos"
        description="Análise preditiva de riscos em operações submarinas. Dados simulados para demonstração."
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">Deep Risk AI</h1></div>
          <Button onClick={() => { setEditing(null); setForm({ title: '', severity: 'medium', probability: 50, impact: 50, description: '' }); setIsOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Análise</Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-500" /></div><div><p className="text-2xl font-bold">{risks.filter(r => r.severity === 'critical').length}</p><p className="text-sm text-muted-foreground">Críticos</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-lg"><Target className="h-5 w-5 text-orange-500" /></div><div><p className="text-2xl font-bold">{risks.filter(r => r.severity === 'high').length}</p><p className="text-sm text-muted-foreground">Alto Risco</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg"><Shield className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{risks.filter(r => r.status === 'mitigated').length}</p><p className="text-sm text-muted-foreground">Mitigados</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/20 rounded-lg"><Brain className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{risks.length}</p><p className="text-sm text-muted-foreground">Total</p></div></CardContent></Card>
        </div>
        <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar riscos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Análises de Risco ({filtered.length})</CardTitle></CardHeader><CardContent><div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{r.title}</h3><Badge className={severityColors[r.severity]}>{r.severity}</Badge><Badge variant={r.status === 'mitigated' ? 'default' : 'outline'}>{r.status}</Badge></div><p className="text-sm text-muted-foreground">{r.description}</p></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAnalyze(r.id)}><Brain className="h-4 w-4 mr-1" />IA</Button>
                  {r.status !== 'mitigated' && <Button size="sm" variant="outline" onClick={() => handleMitigate(r.id)}><Shield className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setForm({ title: r.title, severity: r.severity, probability: r.probability, impact: r.impact, description: r.description }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4"><div><p className="text-xs text-muted-foreground mb-1">Probabilidade</p><div className="flex items-center gap-2"><Progress value={r.probability} className="h-2 flex-1" /><span className="text-sm">{r.probability}%</span></div></div><div><p className="text-xs text-muted-foreground mb-1">Impacto</p><div className="flex items-center gap-2"><Progress value={r.impact} className="h-2 flex-1" /><span className="text-sm">{r.impact}%</span></div></div><div><p className="text-xs text-muted-foreground mb-1">Score</p><span className="text-lg font-bold">{getScore(r.probability, r.impact)}</span></div></div>
            </div>
          ))}
        </div></CardContent></Card>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Análise de Risco</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value as Risk['severity'] })} className="w-full h-10 px-3 border rounded-md bg-background"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="critical">Crítica</option></select>
            <div className="grid grid-cols-2 gap-4"><Input type="number" placeholder="Probabilidade %" value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} /><Input type="number" placeholder="Impacto %" value={form.impact} onChange={e => setForm({ ...form, impact: Number(e.target.value) })} /></div>
            <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button></div>
          </form>
        </DialogContent></Dialog>
      </IntegrationGuard>
    </div>
  );
}
