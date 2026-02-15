/**
 * MLC Wage Protection Tracker - Regulation 2.2
 * Tracks wage payments, allotments, deductions and seafarer financial protection
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, Shield, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface WageRecord {
  id: string;
  crewName: string;
  rank: string;
  baseSalary: number;
  currency: string;
  overtimeHours: number;
  overtimeRate: number;
  deductions: number;
  allotmentPercent: number;
  allotmentRecipient: string;
  netPay: number;
  paidOnTime: boolean;
  payDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface ComplianceCheck {
  id: string;
  requirement: string;
  regulation: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  details: string;
  lastChecked: string;
}

const MOCK_WAGE_RECORDS: WageRecord[] = [
  { id: '1', crewName: 'Carlos Silva', rank: 'Master', baseSalary: 12500, currency: 'USD', overtimeHours: 18, overtimeRate: 45, deductions: 380, allotmentPercent: 40, allotmentRecipient: 'Maria Silva (Esposa)', netPay: 12930, paidOnTime: true, payDate: '2026-01-31', status: 'paid' },
  { id: '2', crewName: 'João Santos', rank: 'Chief Officer', baseSalary: 9800, currency: 'USD', overtimeHours: 22, overtimeRate: 38, deductions: 290, allotmentPercent: 35, allotmentRecipient: 'Ana Santos (Esposa)', netPay: 10346, paidOnTime: true, payDate: '2026-01-31', status: 'paid' },
  { id: '3', crewName: 'Pedro Oliveira', rank: 'Chief Engineer', baseSalary: 11200, currency: 'USD', overtimeHours: 15, overtimeRate: 42, deductions: 340, allotmentPercent: 45, allotmentRecipient: 'Lucia Oliveira (Mãe)', netPay: 11490, paidOnTime: false, payDate: '2026-02-05', status: 'overdue' },
  { id: '4', crewName: 'André Costa', rank: 'AB Seaman', baseSalary: 3200, currency: 'USD', overtimeHours: 30, overtimeRate: 18, deductions: 120, allotmentPercent: 50, allotmentRecipient: 'Fernanda Costa (Esposa)', netPay: 3620, paidOnTime: true, payDate: '2026-01-31', status: 'paid' },
  { id: '5', crewName: 'Ricardo Mendes', rank: '2nd Engineer', baseSalary: 7500, currency: 'USD', overtimeHours: 20, overtimeRate: 32, deductions: 210, allotmentPercent: 30, allotmentRecipient: 'Clara Mendes (Esposa)', netPay: 7930, paidOnTime: true, payDate: '2026-02-01', status: 'pending' },
];

const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { id: '1', requirement: 'Pagamento mensal regular e pontual', regulation: 'Standard A2.2 §1', status: 'partial', details: '1 tripulante com pagamento atrasado (Pedro Oliveira - 5 dias)', lastChecked: '2026-02-10' },
  { id: '2', requirement: 'Conta de salário individual mantida', regulation: 'Standard A2.2 §2', status: 'compliant', details: 'Todas as contas individuais atualizadas e disponíveis', lastChecked: '2026-02-10' },
  { id: '3', requirement: 'Remessa de alotamento mensal garantida', regulation: 'Standard A2.2 §3', status: 'compliant', details: 'Todas as remessas enviadas dentro do prazo', lastChecked: '2026-02-10' },
  { id: '4', requirement: 'Demonstrativo de pagamento detalhado', regulation: 'Standard A2.2 §4', status: 'compliant', details: 'Payslips emitidos com detalhamento completo (base, OT, deduções)', lastChecked: '2026-02-10' },
  { id: '5', requirement: 'Salário mínimo ILO respeitado', regulation: 'Standard A2.2 / ILO JMC', status: 'compliant', details: 'Todos acima do mínimo ILO de $658/mês para AB', lastChecked: '2026-02-10' },
  { id: '6', requirement: 'Taxa de câmbio justa para conversão', regulation: 'Standard A2.2 §5', status: 'compliant', details: 'Câmbio baseado em taxa média do mercado, sem spread abusivo', lastChecked: '2026-02-10' },
  { id: '7', requirement: 'Deduções autorizadas e documentadas', regulation: 'Standard A2.2 §6', status: 'compliant', details: 'Todas as deduções com autorização escrita do tripulante', lastChecked: '2026-02-10' },
  { id: '8', requirement: 'Pagamento final em repatriação', regulation: 'Standard A2.2 §7', status: 'compliant', details: 'Política de pagamento final em até 7 dias após desembarque', lastChecked: '2026-02-10' },
];

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

export function MLCWageProtectionTracker() {
  const [tab, setTab] = useState('overview');

  const totalPayroll = MOCK_WAGE_RECORDS.reduce((s, r) => s + r.netPay, 0);
  const totalAllotments = MOCK_WAGE_RECORDS.reduce((s, r) => s + (r.netPay * r.allotmentPercent / 100), 0);
  const overdueCount = MOCK_WAGE_RECORDS.filter(r => r.status === 'overdue').length;
  const complianceScore = Math.round((COMPLIANCE_CHECKS.filter(c => c.status === 'compliant').length / COMPLIANCE_CHECKS.length) * 100);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            MLC 2006 — Reg. 2.2 Proteção Salarial
          </CardTitle>
          <CardDescription>Monitoramento de pagamentos, alotamentos e conformidade salarial</CardDescription>
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
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-xs text-success">+2.3% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Alotamentos</span>
            </div>
            <p className="text-xl font-bold">${totalAllotments.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground">{MOCK_WAGE_RECORDS.length} tripulantes</span>
          </CardContent>
        </Card>
        <Card className={overdueCount > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? 'text-destructive' : 'text-success'}`} />
              <span className="text-xs text-muted-foreground">Atrasados</span>
            </div>
            <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-success'}`}>{overdueCount}</p>
            <span className="text-xs text-muted-foreground">pagamentos pendentes</span>
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
          {MOCK_WAGE_RECORDS.map(record => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {record.crewName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.crewName}</p>
                      <p className="text-xs text-muted-foreground">{record.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Base</p>
                      <p className="font-medium">${record.baseSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">OT ({record.overtimeHours}h)</p>
                      <p className="font-medium text-success">+${(record.overtimeHours * record.overtimeRate).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Deduções</p>
                      <p className="font-medium text-destructive">-${record.deductions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Líquido</p>
                      <p className="font-bold text-primary">${record.netPay.toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={statusColors[record.status]}>
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
              <p className="text-xs text-muted-foreground">Os tripulantes têm o direito de enviar parte do seu salário regularmente para familiares ou dependentes. O armador deve garantir a remessa pontual e sem custos excessivos.</p>
            </CardContent>
          </Card>
          {MOCK_WAGE_RECORDS.map(record => (
            <Card key={record.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {record.crewName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.crewName}</p>
                      <p className="text-xs text-muted-foreground">{record.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Percentual</p>
                      <p className="font-medium">{record.allotmentPercent}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Valor Mensal</p>
                      <p className="font-bold text-primary">${Math.round(record.netPay * record.allotmentPercent / 100).toLocaleString()}</p>
                    </div>
                    <div className="text-right max-w-[180px]">
                      <p className="text-xs text-muted-foreground">Beneficiário</p>
                      <p className="text-xs truncate">{record.allotmentRecipient}</p>
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
              <p className="text-xs text-muted-foreground">Standard A2.2 — {COMPLIANCE_CHECKS.filter(c => c.status === 'compliant').length}/{COMPLIANCE_CHECKS.length} conformes</p>
            </div>
            <Badge variant="outline" className={complianceScore === 100 ? complianceColors.compliant : complianceColors.partial}>
              {complianceScore}%
            </Badge>
          </div>
          {COMPLIANCE_CHECKS.map(check => (
            <Card key={check.id} className={check.status !== 'compliant' ? 'border-warning/30' : ''}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  {check.status === 'compliant' ? (
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  ) : check.status === 'partial' ? (
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
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
