import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Play, Pause, Zap, MapPin, Battery, Wifi } from "lucide-react";
import { IntegrationGuard } from "@/components/ui/IntegrationGuard";

interface Drone { id: string; name: string; model: string; status: 'idle' | 'mission' | 'charging'; battery: number; location: string; signal: number; }

export default function UnderwaterDrone() {
  const [drones, setDrones] = useState<Drone[]>([
    { id: '1', name: 'ROV Neptune-01', model: 'BlueROV2', status: 'mission', battery: 78, location: 'Porto Santos', signal: 92 },
    { id: '2', name: 'AUV Triton-02', model: 'REMUS 100', status: 'idle', battery: 100, location: 'Base', signal: 100 },
  ]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Drone | null>(null);
  const [form, setForm] = useState({ name: '', model: '', location: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setDrones(p => p.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast.success('Drone atualizado');
    } else {
      setDrones(p => [{ id: Date.now().toString(), ...form, status: 'idle', battery: 100, signal: 100 }, ...p]);
      toast.success('Drone adicionado');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Excluir?')) { setDrones(p => p.filter(d => d.id !== id)); toast.success('Excluído'); } };
  const handleStart = (id: string) => { setDrones(p => p.map(d => d.id === id ? { ...d, status: 'mission' } : d)); toast.success('Missão iniciada'); };
  const handleStop = (id: string) => { setDrones(p => p.map(d => d.id === id ? { ...d, status: 'idle' } : d)); toast.info('Retornando'); };

  const filtered = drones.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const statusColors = { idle: 'bg-gray-500', mission: 'bg-green-500', charging: 'bg-yellow-500' };

  return (
    <div className="p-6 space-y-6">
      <IntegrationGuard
        moduleName="Underwater Drone Control"
        integrationRequired="API de controle ROV/AUV (BlueROV2, REMUS) + telemetria submarina"
        description="Interface de controle em modo demonstração. Requer conexão com hardware real para operação."
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Zap className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">Underwater Drone Control</h1></div>
          <Button onClick={() => { setEditing(null); setForm({ name: '', model: '', location: '' }); setIsOpen(true); }}><Plus className="h-4 w-4 mr-2" />Adicionar Drone</Button>
        </div>
        <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <Card key={d.id}>
              <CardHeader className="pb-2"><div className="flex justify-between items-start"><div><CardTitle className="text-lg">{d.name}</CardTitle><p className="text-sm text-muted-foreground">{d.model}</p></div><Badge className={statusColors[d.status]}>{d.status}</Badge></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2"><Battery className="h-4 w-4" /><Progress value={d.battery} className="h-2 flex-1" /><span className="text-sm">{d.battery}%</span></div>
                  <div className="flex items-center gap-2"><Wifi className="h-4 w-4" /><Progress value={d.signal} className="h-2 flex-1" /><span className="text-sm">{d.signal}%</span></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{d.location}</div>
                <div className="flex gap-2">
                  {d.status === 'idle' && <Button size="sm" className="flex-1" onClick={() => handleStart(d.id)}><Play className="h-4 w-4 mr-1" />Iniciar</Button>}
                  {d.status === 'mission' && <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStop(d.id)}><Pause className="h-4 w-4 mr-1" />Recall</Button>}
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(d); setForm({ name: d.name, model: d.model, location: d.location }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar' : 'Adicionar'} Drone</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Modelo" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required />
            <Input placeholder="Localização" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button></div>
          </form>
        </DialogContent></Dialog>
      </IntegrationGuard>
    </div>
  );
}
