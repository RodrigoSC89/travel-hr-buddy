import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Play, Waves, MapPin, Radio, Target } from "lucide-react";

interface Scan { id: string; name: string; status: 'queued' | 'scanning' | 'completed'; frequency: number; range: number; location: string; progress: number; detections: number; }

export default function OceanSonar() {
  const [scans, setScans] = useState<Scan[]>([
    { id: '1', name: 'Varredura Porto Santos', status: 'scanning', frequency: 200, range: 500, location: 'Canal Principal', progress: 67, detections: 3 },
    { id: '2', name: 'Inspeção Pipeline', status: 'completed', frequency: 400, range: 200, location: 'Campo Marlim', progress: 100, detections: 12 },
  ]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Scan | null>(null);
  const [form, setForm] = useState({ name: '', frequency: 200, range: 500, location: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setScans(p => p.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success('Varredura atualizada');
    } else {
      setScans(p => [{ id: Date.now().toString(), ...form, status: 'queued', progress: 0, detections: 0 }, ...p]);
      toast.success('Varredura criada');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Excluir?')) { setScans(p => p.filter(s => s.id !== id)); toast.success('Excluído'); } };
  const handleStart = (id: string) => { 
    setScans(p => p.map(s => s.id === id ? { ...s, status: 'scanning', progress: 0 } : s)); 
    toast.success('Varredura iniciada');
    const interval = setInterval(() => {
      setScans(p => p.map(s => {
        if (s.id === id && s.status === 'scanning') {
          const np = Math.min(s.progress + 20, 100);
          if (np === 100) { clearInterval(interval); return { ...s, progress: 100, status: 'completed', detections: Math.floor(Math.random() * 15) }; }
          return { ...s, progress: np };
        }
        return s;
      }));
    }, 800);
  };

  const filtered = scans.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const statusColors = { queued: 'bg-gray-500', scanning: 'bg-blue-500', completed: 'bg-green-500' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Waves className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">Ocean Sonar AI</h1></div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', frequency: 200, range: 500, location: '' }); setIsOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Varredura</Button>
      </div>
      <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Varreduras ({filtered.length})</CardTitle></CardHeader><CardContent><div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{s.name}</h3><Badge className={statusColors[s.status]}>{s.status}</Badge></div>
              <div className="flex gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span><span className="flex items-center gap-1"><Radio className="h-3 w-3" />{s.frequency}kHz</span><span className="flex items-center gap-1"><Target className="h-3 w-3" />{s.detections} detecções</span></div></div>
              <div className="flex gap-2">
                {s.status === 'queued' && <Button size="sm" onClick={() => handleStart(s.id)}><Play className="h-4 w-4" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setForm({ name: s.name, frequency: s.frequency, range: s.range, location: s.location }); setIsOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            {s.status === 'scanning' && <div className="flex items-center gap-3"><Progress value={s.progress} className="flex-1" /><span className="text-sm font-medium">{s.progress}%</span></div>}
          </div>
        ))}
      </div></CardContent></Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} Varredura</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4"><Input type="number" placeholder="Frequência (kHz)" value={form.frequency} onChange={e => setForm({ ...form, frequency: Number(e.target.value) })} /><Input type="number" placeholder="Range (m)" value={form.range} onChange={e => setForm({ ...form, range: Number(e.target.value) })} /></div>
          <Input placeholder="Localização" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit">{editing ? 'Salvar' : 'Criar'}</Button></div>
        </form>
      </DialogContent></Dialog>
    </div>
  );
}
