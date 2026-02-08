import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Brain, Radio, Zap, Activity, Settings } from "lucide-react";
import { IntegrationGuard } from "@/components/ui/IntegrationGuard";

interface Enhancement { id: string; name: string; type: 'noise_reduction' | 'detection' | 'classification'; status: 'active' | 'training' | 'paused'; accuracy: number; isEnabled: boolean; description: string; }

export default function SonarAI() {
  const [items, setItems] = useState<Enhancement[]>([
    { id: '1', name: 'Filtro Adaptativo de Ruído', type: 'noise_reduction', status: 'active', accuracy: 94.5, isEnabled: true, description: 'Algoritmo ML para redução de ruído' },
    { id: '2', name: 'Detector de Objetos', type: 'detection', status: 'active', accuracy: 89.2, isEnabled: true, description: 'Rede neural para identificação' },
    { id: '3', name: 'Classificador Fauna', type: 'classification', status: 'training', accuracy: 76.8, isEnabled: false, description: 'Modelo em treinamento' },
  ]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Enhancement | null>(null);
  const [form, setForm] = useState({ name: '', type: 'noise_reduction' as Enhancement['type'], description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setItems(p => p.map(i => i.id === editing.id ? { ...i, ...form } : i));
      toast.success('Modelo atualizado');
    } else {
      setItems(p => [{ id: Date.now().toString(), ...form, status: 'paused', accuracy: 0, isEnabled: false }, ...p]);
      toast.success('Modelo criado');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Excluir?')) { setItems(p => p.filter(i => i.id !== id)); toast.success('Excluído'); } };
  const toggleEnable = (id: string) => { setItems(p => p.map(i => i.id === id ? { ...i, isEnabled: !i.isEnabled, status: !i.isEnabled ? 'active' : 'paused' } : i)); toast.success('Status atualizado'); };
  const handleTrain = (id: string) => { 
    setItems(p => p.map(i => i.id === id ? { ...i, status: 'training' } : i)); 
    toast.info('Treinamento iniciado...'); 
    setTimeout(() => { 
      setItems(p => p.map(i => i.id === id ? { ...i, status: 'active', accuracy: Math.min(i.accuracy + 2.5, 99) } : i)); 
      toast.success('Treinamento concluído'); 
    }, 3000); 
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const statusColors = { active: 'bg-green-500', training: 'bg-yellow-500', paused: 'bg-gray-500' };
  const typeLabels = { noise_reduction: 'Redução de Ruído', detection: 'Detecção', classification: 'Classificação' };

  return (
    <div className="p-6 space-y-6">
      <IntegrationGuard
        moduleName="Sonar AI Enhancement"
        integrationRequired="Pipeline de dados acústicos + GPU para treinamento de modelos ML"
        description="Modelos de IA para processamento de sonar em modo demonstração."
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Radio className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">Sonar AI Enhancement</h1></div>
          <Button onClick={() => { setEditing(null); setForm({ name: '', type: 'noise_reduction', description: '' }); setIsOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Modelo</Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg"><Zap className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{items.filter(i => i.status === 'active').length}</p><p className="text-sm text-muted-foreground">Ativos</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg"><Brain className="h-5 w-5 text-purple-500" /></div><div><p className="text-2xl font-bold">{items.length > 0 ? Math.round(items.reduce((a, i) => a + i.accuracy, 0) / items.length) : 0}%</p><p className="text-sm text-muted-foreground">Precisão Média</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-lg"><Activity className="h-5 w-5 text-yellow-500" /></div><div><p className="text-2xl font-bold">{items.filter(i => i.status === 'training').length}</p><p className="text-sm text-muted-foreground">Treinando</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-primary/20 rounded-lg"><Radio className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{items.length}</p><p className="text-sm text-muted-foreground">Total</p></div></CardContent></Card>
        </div>
        <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar modelos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Modelos IA ({filtered.length})</CardTitle></CardHeader><CardContent><div className="space-y-4">
          {filtered.map(i => (
            <div key={i.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{i.name}</h3><Badge className={statusColors[i.status]}>{i.status}</Badge><Badge variant="outline">{typeLabels[i.type]}</Badge></div>
                <p className="text-sm text-muted-foreground mb-2">{i.description}</p>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Precisão:</span><Progress value={i.accuracy} className="h-2 w-32" /><span className="text-sm font-medium">{i.accuracy.toFixed(1)}%</span></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1"><Switch checked={i.isEnabled} onCheckedChange={() => toggleEnable(i.id)} /><span className="text-xs text-muted-foreground">{i.isEnabled ? 'Ativo' : 'Inativo'}</span></div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleTrain(i.id)}><Brain className="h-4 w-4 mr-1" />Treinar</Button>
                  <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditing(i); setForm({ name: i.name, type: i.type, description: i.description }); setIsOpen(true); }}><Settings className="h-4 w-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              </div>
            </div>
          ))}
        </div></CardContent></Card>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Modelo IA</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Enhancement['type'] })} className="w-full h-10 px-3 border rounded-md bg-background"><option value="noise_reduction">Redução de Ruído</option><option value="detection">Detecção</option><option value="classification">Classificação</option></select>
            <Input placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button></div>
          </form>
        </DialogContent></Dialog>
      </IntegrationGuard>
    </div>
  );
}
