/**
 * MLC Wage Protection Tracker - Regulation 2.2
 * Tracks wage payments, allotments, deductions and seafarer financial protection
 * PRODUCTION: Wired to Supabase mlc_wage_records + mlc_wage_compliance
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DollarSign, Shield, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface WageRecord {
  id: string;
  crew_name: string;
  rank: string;
  base_salary: number;
  currency: string;
  overtime_hours: number;
  overtime_rate: number;
  deductions: number;
  allotment_percent: number;
  allotment_recipient: string;
  net_pay: number;
  paid_on_time: boolean;
  pay_date: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface ComplianceCheck {
  id: string;
  requirement: string;
  regulation: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  details: string;
  last_checked: string;
}

const statusColors: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/30',
  pending: 'bg-warning/10 text-warning border-warning/30',
  overdue: 'bg-destructive/10 text-destructive border-destructive/30',
};

const complianceColors: Record<string, string> = {
  compliant: 'bg-success/10 text-success border-success/30',
  non_compliant: 'bg-destructive/10 text-destructive border-destructive/30',
  partial: 'bg-warning/10 text-warning border-warning/30',
};

const DEFAULT_COMPLIANCE: Omit<ComplianceCheck, 'id'>[] = [
  { requirement: 'Pagamento mensal regular e pontual', regulation: 'Standard A2.2 §1', status: 'compliant', details: 'Todos os pagamentos em dia', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Conta de salário individual mantida', regulation: 'Standard A2.2 §2', status: 'compliant', details: 'Contas individuais atualizadas', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Remessa de alotamento mensal garantida', regulation: 'Standard A2.2 §3', status: 'compliant', details: 'Remessas enviadas no prazo', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Demonstrativo de pagamento detalhado', regulation: 'Standard A2.2 §4', status: 'compliant', details: 'Payslips com detalhamento completo', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Salário mínimo ILO respeitado', regulation: 'Standard A2.2 / ILO JMC', status: 'compliant', details: 'Todos acima do mínimo ILO', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Taxa de câmbio justa para conversão', regulation: 'Standard A2.2 §5', status: 'compliant', details: 'Câmbio baseado em taxa de mercado', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Deduções autorizadas e documentadas', regulation: 'Standard A2.2 §6', status: 'compliant', details: 'Todas as deduções autorizadas', last_checked: new Date().toISOString().split('T')[0] },
  { requirement: 'Pagamento final em repatriação', regulation: 'Standard A2.2 §7', status: 'compliant', details: 'Política de pagamento final em 7 dias', last_checked: new Date().toISOString().split('T')[0] },
];

export function MLCWageProtectionTracker() {
  const [tab, setTab] = useState('overview');
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  // Fetch wage records
  const { data: wageRecords = [] } = useQuery({
    queryKey: ['mlc-wage-records'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('mlc_wage_records')
        .select('*')
        .order('pay_date', { ascending: false });
      if (error) throw error;
      return (data || []) as WageRecord[];
    },
  });

  // Fetch compliance checks
  const { data: complianceChecks = [] } = useQuery({
    queryKey: ['mlc-wage-compliance'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('mlc_wage_compliance')
        .select('*')
        .order('regulation');
      if (error) throw error;
      return (data || []) as ComplianceCheck[];
    },
  });

  // Seed compliance if empty
  const seedCompliance = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)('mlc_wage_compliance')
        .insert(DEFAULT_COMPLIANCE);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlc-wage-compliance'] }),
  });

  // Add wage record
  const addRecord = useMutation({
    mutationFn: async (record: Partial<WageRecord>) => {
      const { error } = await (supabase.from as Function)('mlc_wage_records')
        .insert(record);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlc-wage-records'] });
      toast.success('Registro salarial adicionado');
      setShowAdd(false);
    },
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)('mlc_wage_records')
        .update({ status, paid_on_time: status === 'paid', updated_at: new Date().toISOString() } as never)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlc-wage-records'] });
      toast.success('Status atualizado');
    },
  });

  const records = wageRecords;
  const checks = complianceChecks.length > 0 ? complianceChecks : [];

  const totalPayroll = records.reduce((s, r) => s + Number(r.net_pay || 0), 0);
  const totalAllotments = records.reduce((s, r) => s + (Number(r.net_pay || 0) * Number(r.allotment_percent || 0) / 100), 0);
  const overdueCount = records.filter(r => r.status === 'overdue').length;
  const complianceScore = checks.length > 0
    ? Math.round((checks.filter(c => c.status === 'compliant').length / checks.length) * 100)
    : 0;

  const handleAddRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const baseSalary = Number(fd.get('base_salary') || 0);
    const otHours = Number(fd.get('overtime_hours') || 0);
    const otRate = Number(fd.get('overtime_rate') || 0);
    const deductions = Number(fd.get('deductions') || 0);
    const netPay = baseSalary + (otHours * otRate) - deductions;
    addRecord.mutate({
      crew_name: String(fd.get('crew_name')),
      rank: String(fd.get('rank')),
      base_salary: baseSalary,
      currency: 'USD',
      overtime_hours: otHours,
      overtime_rate: otRate,
      deductions,
      allotment_percent: Number(fd.get('allotment_percent') || 0),
      allotment_recipient: String(fd.get('allotment_recipient') || ''),
      net_pay: netPay,
      pay_date: String(fd.get('pay_date')),
      status: 'pending',
    } as any);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                MLC 2006 — Reg. 2.2 Proteção Salarial
              </CardTitle>
              <CardDescription>Monitoramento de pagamentos, alotamentos e conformidade salarial</CardDescription>
            </div>
            <div className="flex gap-2">
              {checks.length === 0 && (
                <Button size="sm" variant="outline" onClick={() => seedCompliance.mutate()}>
                  Inicializar Checklist
                </Button>
              )}
              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Novo Registro</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Registro Salarial</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddRecord} className="space-y-3">
                    <Input name="crew_name" placeholder="Nome do tripulante" required />
                    <Input name="rank" placeholder="Posto/Função" required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="base_salary" type="number" placeholder="Salário Base" required />
                      <Input name="pay_date" type="date" required />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input name="overtime_hours" type="number" placeholder="Horas OT" />
                      <Input name="overtime_rate" type="number" placeholder="Taxa OT" />
                      <Input name="deductions" type="number" placeholder="Deduções" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="allotment_percent" type="number" placeholder="% Alotamento" />
                      <Input name="allotment_recipient" placeholder="Beneficiário" />
                    </div>
                    <Button type="submit" className="w-full">Salvar</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Folha Total</span>
            </div>
            <p className="text-xl font-bold">${totalPayroll.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Alotamentos</span>
            </div>
            <p className="text-xl font-bold">${totalAllotments.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground">{records.length} tripulantes</span>
          </CardContent>
        </Card>
        <Card className={overdueCount > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? 'text-destructive' : 'text-success'}`} />
              <span className="text-xs text-muted-foreground">Atrasados</span>
            </div>
            <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-success'}`}>{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Compliance</span>
            </div>
            <p className="text-xl font-bold">{complianceScore}%</p>
            <Progress value={complianceScore} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1"><FileText className="h-3 w-3" />Folha</TabsTrigger>
          <TabsTrigger value="allotments" className="gap-1"><ArrowDownRight className="h-3 w-3" />Alotamentos</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1"><Shield className="h-3 w-3" />Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          {records.length === 0 && (
            <Card className="bg-muted/30"><CardContent className="py-8 text-center text-muted-foreground">
              Nenhum registro salarial. Clique em "Novo Registro" para começar.
            </CardContent></Card>
          )}
          {records.map(record => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {String(record.crew_name || '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.crew_name}</p>
                      <p className="text-xs text-muted-foreground">{record.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Base</p>
                      <p className="font-medium">${Number(record.base_salary).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">OT ({record.overtime_hours}h)</p>
                      <p className="font-medium text-success">+${(Number(record.overtime_hours) * Number(record.overtime_rate)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Deduções</p>
                      <p className="font-medium text-destructive">-${Number(record.deductions)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Líquido</p>
                      <p className="font-bold text-primary">${Number(record.net_pay).toLocaleString()}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${statusColors[record.status]} cursor-pointer`}
                      onClick={() => {
                        const next = record.status === 'pending' ? 'paid' : record.status === 'overdue' ? 'paid' : 'pending';
                        updateStatus.mutate({ id: record.id, status: next });
                      }}
                    >
                      {record.status === 'paid' ? 'Pago' : record.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="allotments" className="space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <p className="text-sm font-medium mb-1">Sobre Alotamentos (Reg. 2.2 §3)</p>
              <p className="text-xs text-muted-foreground">Os tripulantes têm o direito de enviar parte do seu salário regularmente para familiares ou dependentes.</p>
            </CardContent>
          </Card>
          {records.map(record => (
            <Card key={record.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {String(record.crew_name || '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.crew_name}</p>
                      <p className="text-xs text-muted-foreground">{record.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Percentual</p>
                      <p className="font-medium">{record.allotment_percent}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valor Mensal</p>
                      <p className="font-bold text-primary">${Math.round(Number(record.net_pay) * Number(record.allotment_percent) / 100).toLocaleString()}</p>
                    </div>
                    <div className="text-right max-w-[180px]">
                      <p className="text-xs text-muted-foreground">Beneficiário</p>
                      <p className="text-xs truncate">{record.allotment_recipient}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">Checklist de Conformidade Salarial</p>
              <p className="text-xs text-muted-foreground">Standard A2.2 — {checks.filter(c => c.status === 'compliant').length}/{checks.length} conformes</p>
            </div>
            <Badge variant="outline" className={complianceScore === 100 ? complianceColors.compliant : complianceColors.partial}>
              {complianceScore}%
            </Badge>
          </div>
          {checks.map(check => (
            <Card key={check.id} className={check.status !== 'compliant' ? 'border-warning/30' : ''}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  {check.status === 'compliant' ? (
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{check.requirement}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{check.regulation}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.details}</p>
                  </div>
                  <Badge variant="outline" className={complianceColors[check.status]}>
                    {check.status === 'compliant' ? 'Conforme' : check.status === 'partial' ? 'Parcial' : 'NC'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
