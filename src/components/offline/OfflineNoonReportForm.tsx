/**
 * Offline-First Noon Report Form
 * Works offline with IndexedDB queue, syncs when online
 * Touch-optimized for maritime use
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { queueAction, getPendingActions } from "@/lib/offline/sync-queue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ship, Navigation, Fuel, Wind, Save, WifiOff, Wifi,
  CloudUpload, MapPin, Clock, Thermometer
} from "lucide-react";
import { format } from "date-fns";

interface NoonReportData {
  vessel_id: string;
  report_date: string;
  position_lat: string;
  position_lon: string;
  course: string;
  speed: string;
  distance_sailed: string;
  fuel_consumed_mt: string;
  fuel_rob: string;
  wind_direction: string;
  wind_force: string;
  sea_state: string;
  weather_desc: string;
  remarks: string;
}

const defaultReport: NoonReportData = {
  vessel_id: '',
  report_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  position_lat: '', position_lon: '',
  course: '', speed: '', distance_sailed: '',
  fuel_consumed_mt: '', fuel_rob: '',
  wind_direction: '', wind_force: '', sea_state: '',
  weather_desc: '', remarks: '',
};

export function OfflineNoonReportForm() {
  const [report, setReport] = useState<NoonReportData>(defaultReport);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();

  // Track online status
  useState(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  });

  // Get pending sync count
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['offline-pending-count'],
    queryFn: async () => {
      const actions = await getPendingActions();
      return actions.filter(a => a.type === 'noon_report').length;
    },
    refetchInterval: 5000,
  });

  // Get vessels for dropdown
  const { data: vessels = [] } = useQuery({
    queryKey: ['vessels-dropdown'],
    queryFn: async () => {
      const { data } = await fromUntyped('vessels')
        .select('id, name')
        .order('name')
        .limit(50);
      return (data || []) as Array<{ id: string; name: string }>;
    },
    staleTime: 1000 * 60 * 30,
  });

  const update = useCallback((field: keyof NoonReportData, value: string) => {
    setReport(prev => ({ ...prev, [field]: value }));
  }, []);

  // Submit — works online or offline
  const submitReport = useMutation({
    mutationFn: async () => {
      const payload = {
        vessel_id: report.vessel_id || null,
        report_date: report.report_date,
        latitude: parseFloat(report.position_lat) || null,
        longitude: parseFloat(report.position_lon) || null,
        course: parseFloat(report.course) || null,
        speed: parseFloat(report.speed) || null,
        distance_sailed: parseFloat(report.distance_sailed) || null,
        fuel_consumed: parseFloat(report.fuel_consumed_mt) || null,
        fuel_rob: parseFloat(report.fuel_rob) || null,
        wind_direction: report.wind_direction || null,
        wind_force: parseInt(report.wind_force) || null,
        sea_state: report.sea_state || null,
        weather: report.weather_desc || null,
        remarks: report.remarks || null,
      };

      if (isOnline) {
        // Direct submit
        const { error } = await fromUntyped('noon_reports').insert(payload);
        if (error) throw error;
        return 'online';
      } else {
        // Queue for later sync
        await queueAction('noon_report', payload);
        return 'queued';
      }
    },
    onSuccess: (mode) => {
      if (mode === 'online') {
        toast.success('Noon Report enviado com sucesso');
      } else {
        toast.info('Noon Report salvo offline — será sincronizado quando online', {
          icon: <WifiOff className="h-4 w-4" />,
        });
      }
      setReport(defaultReport);
      queryClient.invalidateQueries({ queryKey: ['offline-pending-count'] });
    },
    onError: () => toast.error('Erro ao enviar Noon Report'),
  });

  // Auto-fill position from browser geolocation
  const autoFillPosition = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não disponível');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReport(prev => ({
          ...prev,
          position_lat: pos.coords.latitude.toFixed(6),
          position_lon: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Posição capturada');
      },
      () => toast.error('Não foi possível obter posição'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            Noon Report — Formulário Offline-First
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <CloudUpload className="h-3 w-3 mr-1" /> {pendingCount} pendente(s)
              </Badge>
            )}
            <Badge variant={isOnline ? 'outline' : 'destructive'} className="text-[10px]">
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vessel & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Embarcação</Label>
            <Select value={report.vessel_id} onValueChange={v => update('vessel_id', v)}>
              <SelectTrigger className="h-11 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Data/Hora</Label>
            <Input type="datetime-local" className="h-11" value={report.report_date} onChange={e => update('report_date', e.target.value)} />
          </div>
        </div>

        {/* Position */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> Posição</Label>
            <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={autoFillPosition}>
              <Navigation className="h-3 w-3 mr-1" /> GPS
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Latitude" className="h-11" value={report.position_lat} onChange={e => update('position_lat', e.target.value)} />
            <Input placeholder="Longitude" className="h-11" value={report.position_lon} onChange={e => update('position_lon', e.target.value)} />
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Curso (°)</Label>
            <Input type="number" className="h-11" placeholder="0-360" value={report.course} onChange={e => update('course', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Velocidade (kn)</Label>
            <Input type="number" step="0.1" className="h-11" value={report.speed} onChange={e => update('speed', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Dist. (NM)</Label>
            <Input type="number" step="0.1" className="h-11" value={report.distance_sailed} onChange={e => update('distance_sailed', e.target.value)} />
          </div>
        </div>

        {/* Fuel */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Fuel className="h-3 w-3" /> Consumo (MT)</Label>
            <Input type="number" step="0.1" className="h-11" value={report.fuel_consumed_mt} onChange={e => update('fuel_consumed_mt', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ROB (MT)</Label>
            <Input type="number" step="0.1" className="h-11" value={report.fuel_rob} onChange={e => update('fuel_rob', e.target.value)} />
          </div>
        </div>

        {/* Weather */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Wind className="h-3 w-3" /> Vento Dir.</Label>
            <Select value={report.wind_direction} onValueChange={v => update('wind_direction', v)}>
              <SelectTrigger className="h-11 text-sm"><SelectValue placeholder="..." /></SelectTrigger>
              <SelectContent>
                {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Força (Bf)</Label>
            <Input type="number" min="0" max="12" className="h-11" value={report.wind_force} onChange={e => update('wind_force', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Thermometer className="h-3 w-3" /> Mar</Label>
            <Select value={report.sea_state} onValueChange={v => update('sea_state', v)}>
              <SelectTrigger className="h-11 text-sm"><SelectValue placeholder="..." /></SelectTrigger>
              <SelectContent>
                {['Calm', 'Smooth', 'Slight', 'Moderate', 'Rough', 'Very Rough', 'High'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-1">
          <Label className="text-xs">Observações</Label>
          <Textarea className="min-h-[60px] text-sm" placeholder="Eventos, operações especiais..." value={report.remarks} onChange={e => update('remarks', e.target.value)} />
        </div>

        {/* Submit */}
        <Button
          className="w-full h-12 text-sm font-medium"
          onClick={() => submitReport.mutate()}
          disabled={submitReport.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {isOnline ? 'Enviar Noon Report' : 'Salvar Offline'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default OfflineNoonReportForm;
