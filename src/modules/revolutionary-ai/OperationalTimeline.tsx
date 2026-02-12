/**
 * Operational Timeline
 * ✅ P0-002: Real data from access_logs + maintenance_records
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Ship, Wrench, Users, AlertTriangle, FileCheck, Package, Fuel, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string; type: 'maintenance' | 'crew' | 'incident' | 'certificate' | 'supply' | 'fuel';
  title: string; description: string; timestamp: Date; vessel: string;
  severity?: 'info' | 'warning' | 'critical'; details?: Record<string, string | number>; user?: string;
}

export function OperationalTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    async function fetch() {
      const [{ data: logs }, { data: maint }] = await Promise.all([
        supabase.from("access_logs").select("*").order("timestamp", { ascending: false }).limit(20),
        supabase.from("maintenance_records").select("*, vessels(name)").order("created_at", { ascending: false }).limit(20),
      ]);

      const evts: TimelineEvent[] = [
        ...(maint || []).map((m) => ({
          id: m.id, type: 'maintenance' as const, title: m.description || "Manutenção",
          description: m.description || "", timestamp: new Date(m.completed_date || m.created_at),
          vessel: m.vessels?.name || "N/A", severity: 'info' as const,
          details: m.actual_cost ? { Custo: `R$ ${m.actual_cost}` } : undefined,
        })),
        ...(logs || []).map((l) => ({
          id: l.id, type: 'crew' as const, title: l.action || "Atividade",
          description: String((l.details as Record<string, unknown>)?.description || l.action || ""),
          timestamp: new Date(l.timestamp), vessel: String(l.module_accessed || "Sistema"),
          severity: l.severity === "high" ? 'critical' as const : 'info' as const,
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setEvents(evts);
      setLoading(false);
    }
    fetch();
  }, []);

  const vessels = [...new Set(events.map(e => e.vessel))];
  const eventTypes = ['maintenance', 'crew', 'incident', 'certificate', 'supply', 'fuel'];
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVessel = !selectedVessel || event.vessel === selectedVessel;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.type);
    return matchesSearch && matchesVessel && matchesType;
  });

  const getEventIcon = (type: string) => { switch (type) { case 'maintenance': return <Wrench className="h-4 w-4" />; case 'crew': return <Users className="h-4 w-4" />; case 'incident': return <AlertTriangle className="h-4 w-4" />; case 'certificate': return <FileCheck className="h-4 w-4" />; case 'supply': return <Package className="h-4 w-4" />; case 'fuel': return <Fuel className="h-4 w-4" />; default: return <Clock className="h-4 w-4" />; } };
  const getEventColor = (type: string, severity?: string) => { if (severity === 'critical') return 'border-destructive bg-destructive/10'; if (severity === 'warning') return 'border-warning bg-warning/10'; switch (type) { case 'maintenance': return 'border-primary bg-primary/10'; case 'crew': return 'border-success bg-success/10'; default: return 'border-muted bg-muted/10'; } };
  const formatTimeAgo = (date: Date) => { const diff = Date.now() - date.getTime(); const hours = Math.floor(diff / 3600000); const days = Math.floor(hours / 24); if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`; if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`; return 'Agora'; };
  const toggleType = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={`timeline-skel-${i}`} className="h-24 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <Card><CardContent className="pt-6"><div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar eventos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div></div>
        <div className="flex gap-2 flex-wrap">{vessels.map(vessel => <Button key={vessel} variant={selectedVessel === vessel ? "default" : "outline"} size="sm" onClick={() => setSelectedVessel(selectedVessel === vessel ? null : vessel)}><Ship className="h-3 w-3 mr-1" />{vessel}</Button>)}</div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap"><Filter className="h-4 w-4 text-muted-foreground mt-1" />{eventTypes.map(type => <Badge key={type} variant={selectedTypes.includes(type) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleType(type)}>{getEventIcon(type)}<span className="ml-1 capitalize">{type}</span></Badge>)}</div>
      </CardContent></Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Timeline Operacional<Badge variant="secondary">{filteredEvents.length} eventos</Badge></CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative"><div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} className="relative pl-10">
                      <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 ${getEventColor(event.type, event.severity)} flex items-center justify-center`}><div className="w-2 h-2 rounded-full bg-current" /></div>
                      <div className={`p-4 rounded-lg border ${getEventColor(event.type, event.severity)} cursor-pointer transition-all hover:shadow-md`} onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3"><div className="p-2 rounded-full bg-background">{getEventIcon(event.type)}</div><div><h4 className="font-medium">{event.title}</h4><p className="text-sm text-muted-foreground">{event.description}</p><div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><Ship className="h-3 w-3" /><span>{event.vessel}</span><span>•</span><Clock className="h-3 w-3" /><span>{formatTimeAgo(event.timestamp)}</span>{event.user && <><span>•</span><span>por {event.user}</span></>}</div></div></div>
                          <Button variant="ghost" size="sm">{expandedEvent === event.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
                        </div>
                        <AnimatePresence>{expandedEvent === event.id && event.details && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Object.entries(event.details).map(([key, value]) => <div key={key}><p className="text-xs text-muted-foreground">{key}</p><p className="font-medium">{value}</p></div>)}</div></motion.div>}</AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
