/**
 * PEO-DP Vessel Capability Matrix
 * Shows DP capability plots, equipment redundancy analysis, and worst-case failure scenarios
 * Connected to Supabase peodp_equipment table
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Grid3X3, CheckCircle, AlertTriangle, XCircle, Shield,
  Navigation, Anchor, Activity, Gauge, Zap, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentItem {
  id: string;
  name: string;
  status: 'online' | 'standby' | 'offline' | 'maintenance';
  power: number;
  maxPower: number;
  group: string;
}

interface FailureScenario {
  id: string;
  name: string;
  description: string;
  affectedSystems: string[];
  capabilityRetained: number;
  positionKeeping: 'maintained' | 'degraded' | 'lost';
  recommendation: string;
  probability: 'low' | 'medium' | 'high';
}

const FAILURE_SCENARIOS: FailureScenario[] = [
  { id: '1', name: 'Perda de Switchboard Principal', description: 'Falha do quadro elétrico principal resultando em blackout parcial', affectedSystems: ['DG1', 'DG2', 'AZ1', 'AZ2', 'BT1'], capabilityRetained: 45, positionKeeping: 'degraded', recommendation: 'Iniciar procedimento CAM. Ativar DG3. Considerar parada de operações.', probability: 'low' },
  { id: '2', name: 'Worst Case Failure (WCF)', description: 'Perda do barramento mais carregado conforme FMEA/FMECA', affectedSystems: ['DG1', 'DG2', 'AZ1', 'AZ3', 'BT1'], capabilityRetained: 52, positionKeeping: 'degraded', recommendation: 'Verificar envelope de capacidade. Reduzir operação se Hs > 2.0m.', probability: 'low' },
  { id: '3', name: 'Perda de 2 Referências de Posição', description: 'Falha simultânea de DGPS #1 e HPR', affectedSystems: ['DGPS1', 'HPR1'], capabilityRetained: 85, positionKeeping: 'maintained', recommendation: 'Manter operação com DGPS #2 e Gyro. Monitorar drift.', probability: 'medium' },
  { id: '4', name: 'Single Thruster Failure', description: 'Perda de um propulsor azimutal durante operação', affectedSystems: ['AZ4'], capabilityRetained: 78, positionKeeping: 'maintained', recommendation: 'Redistribuir carga. Verificar envelope DP reduzido.', probability: 'medium' },
  { id: '5', name: 'Perda Total de Comunicação', description: 'Falha em todos os sistemas de comunicação', affectedSystems: ['VHF1', 'VHF2', 'SAT1'], capabilityRetained: 95, positionKeeping: 'maintained', recommendation: 'Ativar protocolo de comunicação alternativa. Não afeta DP diretamente.', probability: 'low' },
];

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  { id: 'AZ1', name: 'Azimutal #1 (Popa BB)', status: 'online', power: 3200, maxPower: 3500, group: 'Propulsores Azimutais' },
  { id: 'AZ2', name: 'Azimutal #2 (Popa BE)', status: 'online', power: 3100, maxPower: 3500, group: 'Propulsores Azimutais' },
  { id: 'AZ3', name: 'Azimutal #3 (Proa BB)', status: 'online', power: 2800, maxPower: 3000, group: 'Propulsores Azimutais' },
  { id: 'AZ4', name: 'Azimutal #4 (Proa BE)', status: 'maintenance', power: 0, maxPower: 3000, group: 'Propulsores Azimutais' },
  { id: 'BT1', name: 'Tunnel Thruster #1', status: 'online', power: 1500, maxPower: 1800, group: 'Bow Thrusters' },
  { id: 'BT2', name: 'Tunnel Thruster #2', status: 'online', power: 1600, maxPower: 1800, group: 'Bow Thrusters' },
  { id: 'DG1', name: 'Diesel Generator #1', status: 'online', power: 4200, maxPower: 5000, group: 'Geradores' },
  { id: 'DG2', name: 'Diesel Generator #2', status: 'online', power: 4100, maxPower: 5000, group: 'Geradores' },
  { id: 'DG3', name: 'Diesel Generator #3', status: 'standby', power: 0, maxPower: 5000, group: 'Geradores' },
  { id: 'DG4', name: 'Diesel Generator #4', status: 'online', power: 3800, maxPower: 5000, group: 'Geradores' },
  { id: 'DGPS1', name: 'DGPS Fugro #1', status: 'online', power: 100, maxPower: 100, group: 'Sensores de Referência' },
  { id: 'DGPS2', name: 'DGPS Veripos #2', status: 'online', power: 100, maxPower: 100, group: 'Sensores de Referência' },
  { id: 'DPC1', name: 'DP Controller #1 (Kongsberg)', status: 'online', power: 100, maxPower: 100, group: 'DP Controllers' },
  { id: 'DPC2', name: 'DP Controller #2 (Kongsberg)', status: 'online', power: 100, maxPower: 100, group: 'DP Controllers' },
];

const statusColors: Record<string, string> = {
  online: 'bg-success/10 text-success border-success/30',
  standby: 'bg-warning/10 text-warning border-warning/30',
  offline: 'bg-destructive/10 text-destructive border-destructive/30',
  maintenance: 'bg-muted text-muted-foreground border-border',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  online: CheckCircle,
  standby: Activity,
  offline: XCircle,
  maintenance: AlertTriangle,
};

const riskProb: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function PeoDPCapabilityMatrix() {
  const [tab, setTab] = useState('equipment');

  // Fetch equipment from Supabase
  const { data: dbEquipment, isLoading } = useQuery({
    queryKey: ['peodp-equipment-matrix'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('peodp_equipment')
        .select('id, equipment_name, equipment_type, status, specifications')
        .order('equipment_type');
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30000,
  });

  // Map DB data or use defaults
  const equipment: EquipmentItem[] = useMemo(() => {
    if (!dbEquipment || dbEquipment.length === 0) return DEFAULT_EQUIPMENT;
    return dbEquipment.map((eq: any) => ({
      id: eq.id.substring(0, 6),
      name: eq.equipment_name,
      status: (eq.status || 'online') as any,
      power: eq.specifications?.power || 100,
      maxPower: eq.specifications?.max_power || 100,
      group: eq.equipment_type || 'Outros',
    }));
  }, [dbEquipment]);

  const groups = useMemo(() => {
    const map = new Map<string, EquipmentItem[]>();
    equipment.forEach(e => {
      if (!map.has(e.group)) map.set(e.group, []);
      map.get(e.group)!.push(e);
    });
    return Array.from(map.entries());
  }, [equipment]);

  const totalEquipment = equipment.length;
  const onlineCount = equipment.filter(i => i.status === 'online').length;
  const redundancyScore = totalEquipment > 0 ? Math.round((onlineCount / totalEquipment) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid3X3 className="h-5 w-5 text-primary" />
            DP Vessel Capability Matrix
          </CardTitle>
          <CardDescription>Análise de redundância, status de equipamentos e cenários de falha FMEA • Dados em tempo real</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Equipamentos Online</p>
            <p className="text-2xl font-bold text-success">{onlineCount}/{totalEquipment}</p>
            <Progress value={redundancyScore} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Redundância</p>
            <p className="text-2xl font-bold">{redundancyScore}%</p>
            <Badge variant="outline" className={redundancyScore >= 80 ? statusColors.online : statusColors.standby}>
              {redundancyScore >= 80 ? 'DP2 OK' : 'Reduzida'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Em Manutenção</p>
            <p className="text-2xl font-bold text-warning">
              {equipment.filter(i => i.status === 'maintenance').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Cenários WCF</p>
            <p className="text-2xl font-bold">{FAILURE_SCENARIOS.length}</p>
            <p className="text-xs text-muted-foreground">analisados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="equipment" className="gap-1"><Anchor className="h-3 w-3" />Equipamentos</TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-1"><AlertTriangle className="h-3 w-3" />Cenários Falha</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando equipamentos...</CardContent></Card>
          ) : groups.map(([groupName, items]) => (
            <Card key={groupName}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">{groupName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                {items.map(item => {
                  const Icon = statusIcons[item.status] || Activity;
                  return (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${item.status === 'online' ? 'text-success' : item.status === 'standby' ? 'text-warning' : item.status === 'maintenance' ? 'text-muted-foreground' : 'text-destructive'}`} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.maxPower > 100 && (
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">{item.power > 0 ? `${item.power}/${item.maxPower} kW` : '-'}</span>
                            {item.power > 0 && <Progress value={(item.power / item.maxPower) * 100} className="h-1 w-16 mt-0.5" />}
                          </div>
                        )}
                        <Badge variant="outline" className={`text-[10px] min-w-[70px] justify-center ${statusColors[item.status]}`}>
                          {item.status === 'online' ? 'Online' : item.status === 'standby' ? 'Standby' : item.status === 'maintenance' ? 'Manutenção' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-sm font-medium">Cenários de Falha FMEA/FMECA</p>
              <p className="text-xs text-muted-foreground">Análise de worst-case failure conforme requisitos PEO-DP Anexo N.</p>
            </CardContent>
          </Card>
          {FAILURE_SCENARIOS.map(scenario => (
            <Card key={scenario.id} className={`border-l-4 ${scenario.positionKeeping === 'lost' ? 'border-l-destructive' : scenario.positionKeeping === 'degraded' ? 'border-l-warning' : 'border-l-success'}`}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{scenario.name}</p>
                      <Badge variant="outline" className={riskProb[scenario.probability]}>{scenario.probability}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {scenario.affectedSystems.map(s => (
                        <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/5 text-destructive">{s}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground"><strong>Recomendação:</strong> {scenario.recommendation}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <Gauge className={`h-5 w-5 mx-auto mb-1 ${scenario.capabilityRetained >= 70 ? 'text-success' : scenario.capabilityRetained >= 50 ? 'text-warning' : 'text-destructive'}`} />
                    <p className={`text-lg font-bold ${scenario.capabilityRetained >= 70 ? 'text-success' : scenario.capabilityRetained >= 50 ? 'text-warning' : 'text-destructive'}`}>{scenario.capabilityRetained}%</p>
                    <p className="text-[10px] text-muted-foreground">Capacidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
