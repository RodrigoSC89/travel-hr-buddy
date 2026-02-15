/**
 * MLC Health & Safety Tracker - Regulation 4.3
 * Occupational safety management, incident tracking, risk assessments, PPE compliance
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck, AlertTriangle, CheckCircle, HardHat, Flame,
  Eye, ClipboardCheck, TrendingDown, Activity, FileText
} from 'lucide-react';

interface SafetyIndicator {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface RiskAssessment {
  id: string;
  activity: string;
  hazard: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  controls: string[];
  residualRisk: 'low' | 'medium' | 'high';
  lastReview: string;
  nextReview: string;
  responsible: string;
}

interface PPEItem {
  id: string;
  item: string;
  area: string;
  required: number;
  available: number;
  inspected: boolean;
  expiryDate: string;
  status: 'ok' | 'low_stock' | 'expired';
}

interface SafetyDrill {
  id: string;
  type: string;
  scheduledDate: string;
  completedDate: string | null;
  participants: number;
  totalCrew: number;
  result: 'satisfactory' | 'unsatisfactory' | 'pending';
  findings: string;
}

const SAFETY_INDICATORS: SafetyIndicator[] = [
  { id: '1', name: 'LTIR (Lost Time Injury Rate)', value: 0.0, target: 0.0, unit: 'per 1M hrs', trend: 'stable', status: 'good' },
  { id: '2', name: 'TRIR (Total Recordable)', value: 0.42, target: 0.5, unit: 'per 1M hrs', trend: 'down', status: 'good' },
  { id: '3', name: 'Near Misses Reportados', value: 12, target: 10, unit: '/mês', trend: 'up', status: 'good' },
  { id: '4', name: 'Toolbox Talks', value: 28, target: 30, unit: '/mês', trend: 'stable', status: 'warning' },
  { id: '5', name: 'Inspeções de Segurança', value: 8, target: 8, unit: '/mês', trend: 'stable', status: 'good' },
  { id: '6', name: 'Dias sem Acidentes', value: 342, target: 365, unit: 'dias', trend: 'up', status: 'good' },
];

const RISK_ASSESSMENTS: RiskAssessment[] = [
  { id: '1', activity: 'Operações de Guincho', hazard: 'Queda de carga, esmagamento', riskLevel: 'high', controls: ['Zona exclusão 3m', 'Sinaleiro dedicado', 'Checklist pré-operação'], residualRisk: 'medium', lastReview: '2026-01-15', nextReview: '2026-04-15', responsible: 'Imediato' },
  { id: '2', activity: 'Trabalho em Altura', hazard: 'Queda, impacto', riskLevel: 'extreme', controls: ['Cinto tipo paraquedista', 'Ponto de ancoragem inspecionado', 'PTW obrigatória', 'Buddy system'], residualRisk: 'medium', lastReview: '2026-01-20', nextReview: '2026-04-20', responsible: 'Oficial de Segurança' },
  { id: '3', activity: 'Espaço Confinado', hazard: 'Atmosfera tóxica, asfixia', riskLevel: 'extreme', controls: ['Teste atmosférico contínuo', 'Vigia permanente', 'PTW + LOTO', 'Equipe resgate stand-by'], residualRisk: 'high', lastReview: '2026-02-01', nextReview: '2026-05-01', responsible: 'Chief Engineer' },
  { id: '4', activity: 'Abastecimento (Bunkering)', hazard: 'Derramamento, incêndio', riskLevel: 'high', controls: ['Checklist SOPEP', 'Barreiras de contenção', 'Comunicação VHF contínua'], residualRisk: 'low', lastReview: '2026-01-28', nextReview: '2026-04-28', responsible: 'Chief Officer' },
  { id: '5', activity: 'Manuseio de Químicos', hazard: 'Exposição, queimadura', riskLevel: 'medium', controls: ['MSDS disponível', 'PPE específico', 'Chuveiro de emergência'], residualRisk: 'low', lastReview: '2026-02-05', nextReview: '2026-05-05', responsible: 'Oficial de Segurança' },
];

const PPE_INVENTORY: PPEItem[] = [
  { id: '1', item: 'Capacetes de Segurança', area: 'Convés', required: 30, available: 28, inspected: true, expiryDate: '2027-06-15', status: 'ok' },
  { id: '2', item: 'Luvas Nitrílicas', area: 'Praça de Máquinas', required: 50, available: 45, inspected: true, expiryDate: '2026-08-20', status: 'ok' },
  { id: '3', item: 'Óculos de Proteção', area: 'Oficina', required: 20, available: 18, inspected: true, expiryDate: '2027-03-10', status: 'ok' },
  { id: '4', item: 'Protetores Auriculares', area: 'Praça de Máquinas', required: 40, available: 12, inspected: true, expiryDate: '2026-12-01', status: 'low_stock' },
  { id: '5', item: 'Cintos Paraquedista', area: 'Convés', required: 10, available: 10, inspected: true, expiryDate: '2026-09-30', status: 'ok' },
  { id: '6', item: 'Respiradores PFF2', area: 'Pintura', required: 25, available: 8, inspected: false, expiryDate: '2026-03-01', status: 'low_stock' },
  { id: '7', item: 'Botas de Segurança', area: 'Geral', required: 35, available: 35, inspected: true, expiryDate: '2027-01-15', status: 'ok' },
];

const SAFETY_DRILLS: SafetyDrill[] = [
  { id: '1', type: 'Abandono de Embarcação', scheduledDate: '2026-02-10', completedDate: '2026-02-10', participants: 22, totalCrew: 24, result: 'satisfactory', findings: 'Muster time: 4min 12seg. Meta: 5min. Aprovado.' },
  { id: '2', type: 'Combate a Incêndio', scheduledDate: '2026-02-05', completedDate: '2026-02-05', participants: 24, totalCrew: 24, result: 'satisfactory', findings: 'Equipe atuou conforme SOPEP. Mangueiras em bom estado.' },
  { id: '3', type: 'Homem ao Mar (MOB)', scheduledDate: '2026-01-28', completedDate: '2026-01-28', participants: 20, totalCrew: 24, result: 'unsatisfactory', findings: 'Tempo de resposta: 8min. Meta: 5min. Ação corretiva: retreino equipe de resgate.' },
  { id: '4', type: 'Derramamento de Óleo (SOPEP)', scheduledDate: '2026-02-20', completedDate: null, participants: 0, totalCrew: 24, result: 'pending', findings: '' },
  { id: '5', type: 'Evacuação Médica (MEDEVAC)', scheduledDate: '2026-02-25', completedDate: null, participants: 0, totalCrew: 24, result: 'pending', findings: '' },
];

const riskColors: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  extreme: 'bg-destructive/10 text-destructive border-destructive/30',
};

const ppeStatusColors: Record<string, string> = {
  ok: 'bg-success/10 text-success border-success/30',
  low_stock: 'bg-warning/10 text-warning border-warning/30',
  expired: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function MLCHealthSafetyTracker() {
  const [tab, setTab] = useState('kpis');

  const overallCompliance = Math.round((SAFETY_INDICATORS.filter(i => i.status === 'good').length / SAFETY_INDICATORS.length) * 100);
  const ppeCompliance = Math.round((PPE_INVENTORY.filter(p => p.status === 'ok').length / PPE_INVENTORY.length) * 100);
  const drillsCompleted = SAFETY_DRILLS.filter(d => d.completedDate).length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            MLC 2006 — Reg. 4.3 Saúde e Segurança no Trabalho
          </CardTitle>
          <CardDescription>Gestão de segurança ocupacional, análise de riscos, EPIs e exercícios</CardDescription>
        </CardHeader>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Dias sem Acidentes</p>
            <p className="text-3xl font-bold text-success">342</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">KPI Compliance</p>
            <p className="text-2xl font-bold">{overallCompliance}%</p>
            <Progress value={overallCompliance} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">EPIs Conforme</p>
            <p className="text-2xl font-bold">{ppeCompliance}%</p>
            <Progress value={ppeCompliance} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Exercícios</p>
            <p className="text-2xl font-bold">{drillsCompleted}/{SAFETY_DRILLS.length}</p>
            <Progress value={(drillsCompleted / SAFETY_DRILLS.length) * 100} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="kpis" className="gap-1"><Activity className="h-3 w-3" />KPIs</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1"><AlertTriangle className="h-3 w-3" />Riscos</TabsTrigger>
          <TabsTrigger value="ppe" className="gap-1"><HardHat className="h-3 w-3" />EPIs</TabsTrigger>
          <TabsTrigger value="drills" className="gap-1"><Flame className="h-3 w-3" />Exercícios</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-3">
          {SAFETY_INDICATORS.map(ind => (
            <Card key={ind.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ind.status === 'good' ? <CheckCircle className="h-4 w-4 text-success shrink-0" /> : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{ind.name}</p>
                      <p className="text-xs text-muted-foreground">Meta: {ind.target} {ind.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">{ind.value}</p>
                      <p className="text-xs text-muted-foreground">{ind.unit}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className={`h-3 w-3 ${ind.trend === 'down' ? 'text-success' : ind.trend === 'up' ? (ind.name.includes('Near') ? 'text-success' : 'text-warning') : 'text-muted-foreground'}`} />
                      <span className="text-xs text-muted-foreground">{ind.trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-3">
          {RISK_ASSESSMENTS.map(ra => (
            <Card key={ra.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{ra.activity}</p>
                      <Badge variant="outline" className={riskColors[ra.riskLevel]}>{ra.riskLevel.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Perigo: {ra.hazard}</p>
                    <div className="flex flex-wrap gap-1">
                      {ra.controls.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Risco Residual: <Badge variant="outline" className={`text-[10px] ml-1 ${riskColors[ra.residualRisk]}`}>{ra.residualRisk}</Badge></span>
                      <span>Responsável: {ra.responsible}</span>
                      <span>Revisão: {new Date(ra.nextReview).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ppe" className="space-y-3">
          {PPE_INVENTORY.map(ppe => (
            <Card key={ppe.id} className={ppe.status !== 'ok' ? 'border-warning/30' : ''}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HardHat className={`h-4 w-4 ${ppe.status === 'ok' ? 'text-success' : 'text-warning'} shrink-0`} />
                    <div>
                      <p className="font-medium text-sm">{ppe.item}</p>
                      <p className="text-xs text-muted-foreground">{ppe.area} • Validade: {new Date(ppe.expiryDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{ppe.available}/{ppe.required}</p>
                      <Progress value={(ppe.available / ppe.required) * 100} className="h-1 w-16 mt-0.5" />
                    </div>
                    <Badge variant="outline" className={ppeStatusColors[ppe.status]}>
                      {ppe.status === 'ok' ? 'OK' : ppe.status === 'low_stock' ? 'Baixo' : 'Vencido'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="drills" className="space-y-3">
          {SAFETY_DRILLS.map(drill => (
            <Card key={drill.id} className={drill.result === 'unsatisfactory' ? 'border-destructive/30' : ''}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Flame className={`h-4 w-4 mt-0.5 shrink-0 ${drill.result === 'satisfactory' ? 'text-success' : drill.result === 'unsatisfactory' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-sm">{drill.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Programado: {new Date(drill.scheduledDate).toLocaleDateString('pt-BR')}
                        {drill.completedDate && ` • Realizado: ${new Date(drill.completedDate).toLocaleDateString('pt-BR')}`}
                      </p>
                      {drill.findings && <p className="text-xs mt-1 text-muted-foreground">{drill.findings}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {drill.completedDate && <span className="text-xs text-muted-foreground">{drill.participants}/{drill.totalCrew}</span>}
                    <Badge variant="outline" className={
                      drill.result === 'satisfactory' ? 'bg-success/10 text-success border-success/30' :
                      drill.result === 'unsatisfactory' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                      'bg-muted text-muted-foreground'
                    }>
                      {drill.result === 'satisfactory' ? 'Aprovado' : drill.result === 'unsatisfactory' ? 'Reprovado' : 'Pendente'}
                    </Badge>
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
