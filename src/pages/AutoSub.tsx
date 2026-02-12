import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Play, Pause, Ship, MapPin, Battery } from "lucide-react";
import { IntegrationGuard } from "@/components/ui/IntegrationGuard";

interface Mission { id: string; name: string; status: 'planned' | 'active' | 'completed'; depth: number; location: string; vehicle: string; }

export default function AutoSub() {
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', name: 'Inspeção Casco MV Atlantic', status: 'active', depth: 25, location: 'Porto Santos', vehicle: 'ROV-01' },
    { id: '2', name: 'Survey Pipeline Offshore', status: 'planned', depth: 150, location: 'Campo Marlim', vehicle: 'AUV-02' },
  ]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [form, setForm] = useState({ name: '', depth: 0, location: '', vehicle: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setMissions(p => p.map(m => m.id === editing.id ? { ...m, ...form } : m));
      toast.success('Missão atualizada');
    } else {
      setMissions(p => [{ id: Date.now().toString(), ...form, status: 'planned' }, ...p]);
      toast.success('Missão criada');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Excluir?')) { setMissions(p => p.filter(m => m.id !== id)); toast.success('Excluído'); } };
  const handleStart = (id: string) => { setMissions(p => p.map(m => m.id === id ? { ...m, status: 'active' } : m)); toast.success('Iniciada'); };
  const handleStop = (id: string) => { setMissions(p => p.map(m => m.id === id ? { ...m, status: 'completed' } : m)); toast.success('Concluída'); };

  const filtered = missions.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const statusColors = { planned: 'bg-muted', active: 'bg-success', completed: 'bg-info' };

  return (
    <div className="p-6 space-y-6">
      <IntegrationGuard
        moduleName="AutoSub Mission Control"
        integrationRequired="API de AUV autônomo + sistema de navegação inercial submarino"
        description="Centro de controle de missões autônomas em modo demonstração."
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Ship className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">AutoSub Mission Control</h1></div>
          <Button onClick={() => { setEditing(null); setForm({ name: '', depth: 0, location: '', vehicle: '' }); setIsOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Missão</Button>
        </div>
        <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Missões ({filtered.length})</CardTitle></CardHeader><CardContent><div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{m.name}</h3><Badge className={statusColors[m.status]}>{m.status}</Badge></div>
                <div className="flex gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.location}</span><span className="flex items-center gap-1"><Battery className="h-3 w-3" />{m.depth}m</span><span>{m.vehicle}</span></div>
              </div>
              <div className="flex gap-2">
                {m.status === 'planned' && <Button size="sm" onClick={() => handleStart(m.id)}><Play className="h-4 w-4" /></Button>}
                {m.status === 'active' && <Button size="sm" variant="outline" onClick={() => handleStop(m.id)}><Pause className="h-4 w-4" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => { setEditing(m); setForm({ name: m.name, depth: m.depth, location: m.location, vehicle: m.vehicle }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div></CardContent></Card>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Missão</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4"><Input type="number" placeholder="Profundidade (m)" value={form.depth} onChange={e => setForm({ ...form, depth: Number(e.target.value) })} required /><Input placeholder="Veículo" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} required /></div>
            <Input placeholder="Localização" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button></div>
          </form>
        </DialogContent></Dialog>
      </IntegrationGuard>
    </div>
  );
}
