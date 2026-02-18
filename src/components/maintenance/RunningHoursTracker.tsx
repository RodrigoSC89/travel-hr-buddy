/**
 * Running Hours Tracker - Equipment Runtime Monitor
 * BEATS: AMOS/TM Master (PMS Running Hours Triggers, Counter-Based Maintenance)
 * Features: Equipment counters, PMS triggers, overdue alerts, trend charts
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateSensorReading } from '@/hooks/useModuleHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Clock, Gauge, AlertTriangle, CheckCircle, Plus,
  TrendingUp, Wrench, BarChart3, RefreshCw, Activity
} from 'lucide-react';

interface EquipmentCounter {
  id: string;
  equipment_name: string;
  equipment_type: string;
  current_hours: number;
  last_service_hours: number;
  service_interval: number;
  next_service_due: number;
  hours_remaining: number;
  pct_used: number;
  status: 'ok' | 'warning' | 'overdue';
  vessel_name: string;
  last_updated: string;
}

const EQUIPMENT_TYPES = ['Motor Principal', 'Motor Auxiliar', 'Gerador', 'Compressor', 'Bomba', 'Guindaste', 'Propulsor', 'Purificador', 'Separador', 'HVAC'];

export function RunningHoursTracker() {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [newReading, setNewReading] = useState('');

  const { data: vessels = [] } = useQuery({
    queryKey: ['rh-vessels'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name').order('name');
      return data || [];
    },
  });

  // Use iot_sensors table for equipment running hours
  const { data: counters = [], isLoading } = useQuery({
    queryKey: ['running-hours'],
    queryFn: async () => {
      const { data } = await supabase
        .from('iot_sensors')
        .select('*, vessels:vessel_id(name)')
        .eq('sensor_type', 'running_hours')
        .order('sensor_name');
      
      return (data || []).map((sensor: Record<string, unknown>) => {
        const currentHours = (sensor.current_value as number) || 0;
        const config = (sensor.calibration_data as Record<string, unknown>) || {};
        const lastServiceHours = (config.last_service_hours as number) || 0;
        const serviceInterval = (config.service_interval as number) || 4000;
        const nextServiceDue = lastServiceHours + serviceInterval;
        const hoursRemaining = nextServiceDue - currentHours;
        const pctUsed = Math.min(((currentHours - lastServiceHours) / serviceInterval) * 100, 100);
        
        return {
          id: sensor.id as string,
          equipment_name: sensor.sensor_name as string,
          equipment_type: (sensor.unit as string) || 'Motor',
          current_hours: currentHours,
          last_service_hours: lastServiceHours,
          service_interval: serviceInterval,
          next_service_due: nextServiceDue,
          hours_remaining: hoursRemaining,
          pct_used: pctUsed,
          status: hoursRemaining <= 0 ? 'overdue' : hoursRemaining <= serviceInterval * 0.1 ? 'warning' : 'ok',
          vessel_name: ((sensor.vessels as Record<string, unknown>)?.name as string) || 'N/A',
          last_updated: (sensor.last_reading_at as string) || (sensor.updated_at as string) || '',
        } as EquipmentCounter;
      });
    },
  });

  const updateReadingMutation = useUpdateSensorReading();
  const updateReading = {
    mutate: () => updateReadingMutation.mutate(
      { sensorId: selectedId, value: parseFloat(newReading) },
      { onSuccess: () => setUpdateOpen(false) }
    ),
    isPending: updateReadingMutation.isPending,
  };

  const overdueCount = counters.filter(c => c.status === 'overdue').length;
  const warningCount = counters.filter(c => c.status === 'warning').length;
  const totalEquipment = counters.length;
  const avgUtilization = counters.length > 0 ? counters.reduce((s, c) => s + c.pct_used, 0) / counters.length : 0;

  const statusConfig = {
    ok: { label: 'OK', color: 'bg-success/20 text-success', icon: CheckCircle },
    warning: { label: 'Atenção', color: 'bg-warning/20 text-warning', icon: AlertTriangle },
    overdue: { label: 'Vencido', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle },
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Equipamentos', value: totalEquipment, icon: Gauge, color: 'text-primary' },
          { label: 'Vencidos', value: overdueCount, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Atenção', value: warningCount, icon: Clock, color: 'text-warning' },
          { label: 'Utilização Média', value: `${avgUtilization.toFixed(0)}%`, icon: Activity, color: 'text-primary' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contadores de Horas de Operação</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-rh-${i}`} className="h-20 w-full" />)}</div>
      ) : counters.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Gauge className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum contador de horas registrado nos sensores IoT</p>
          <p className="text-xs mt-1">Configure sensores do tipo "running_hours" para ativar</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {counters.map(counter => {
            const cfg = statusConfig[counter.status];
            return (
              <Card key={counter.id} className={`hover:border-primary/30 transition-colors ${counter.status === 'overdue' ? 'border-destructive/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{counter.equipment_name}</span>
                        <Badge variant="outline">{counter.equipment_type}</Badge>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                        <span className="text-xs text-muted-foreground">{counter.vessel_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Última manutenção: {counter.last_service_hours.toLocaleString()}h</span>
                            <span>Próxima: {counter.next_service_due.toLocaleString()}h</span>
                          </div>
                          <Progress 
                            value={Math.min(counter.pct_used, 100)} 
                            className={`h-2 ${counter.status === 'overdue' ? '[&>div]:bg-destructive' : counter.status === 'warning' ? '[&>div]:bg-warning' : ''}`}
                          />
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-lg font-bold font-mono">{counter.current_hours.toLocaleString()}h</p>
                          <p className={`text-xs ${counter.hours_remaining <= 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                            {counter.hours_remaining <= 0 ? `${Math.abs(counter.hours_remaining).toLocaleString()}h vencido` : `${counter.hours_remaining.toLocaleString()}h restantes`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" size="sm" className="ml-3"
                      onClick={() => { setSelectedId(counter.id); setNewReading(String(counter.current_hours)); setUpdateOpen(true); }}
                      aria-label={`Atualizar leitura de ${counter.equipment_name}`}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Atualizar Leitura</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nova Leitura (horas)</Label><Input type="number" value={newReading} onChange={e => setNewReading(e.target.value)} /></div>
            <Button onClick={() => updateReading.mutate()} disabled={updateReading.isPending} className="w-full" aria-label="Salvar leitura">
              {updateReading.isPending ? 'Salvando...' : 'Salvar Leitura'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
