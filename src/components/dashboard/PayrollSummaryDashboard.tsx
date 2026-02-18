/**
 * Payroll Summary Dashboard
 * Overview of crew payroll with spend breakdown
 * Uses crew_payroll for real data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PayrollSummaryDashboard() {
  const { data: payroll = [], isLoading } = useQuery({
    queryKey: ['payroll-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_payroll')
        .select('id, base_salary, gross_pay, net_pay, overtime_amount, overtime_hours, tax_amount, pension_contribution, payment_status, currency, days_onboard, payroll_period_start')
        .order('payroll_period_start', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  let totalGross = 0;
  let totalNet = 0;
  let totalOT = 0;
  let totalTax = 0;
  let totalPension = 0;
  let totalDays = 0;
  const byStatus: Record<string, number> = {};

  payroll.forEach(p => {
    totalGross += p.gross_pay || 0;
    totalNet += p.net_pay || 0;
    totalOT += p.overtime_amount || 0;
    totalTax += p.tax_amount || 0;
    totalPension += p.pension_contribution || 0;
    totalDays += p.days_onboard || 0;
    const s = p.payment_status || 'pending';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  const avgSalary = payroll.length > 0 ? Math.round(totalGross / payroll.length) : 0;

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toFixed(0)}`;

  const deductionPct = totalGross > 0 ? Math.round(((totalGross - totalNet) / totalGross) * 100) : 0;

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-success" />
            Payroll Summary
          </CardTitle>
          <Badge variant="outline" className="text-xs">{payroll.length} records</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-success" />
            <div className="text-lg font-bold">{fmt(totalGross)}</div>
            <div className="text-[10px] text-muted-foreground">Total Gross</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{fmt(avgSalary)}</div>
            <div className="text-[10px] text-muted-foreground">Avg Salary</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 mx-auto mb-1 text-warning" />
            <div className="text-lg font-bold">{fmt(totalOT)}</div>
            <div className="text-[10px] text-muted-foreground">Overtime</div>
          </div>
        </div>

        {/* Pay breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Breakdown</h4>
          {[
            { label: 'Net Pay', value: totalNet, pct: totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0 },
            { label: 'Tax', value: totalTax, pct: totalGross > 0 ? Math.round((totalTax / totalGross) * 100) : 0 },
            { label: 'Pension', value: totalPension, pct: totalGross > 0 ? Math.round((totalPension / totalGross) * 100) : 0 },
            { label: 'Overtime', value: totalOT, pct: totalGross > 0 ? Math.round((totalOT / totalGross) * 100) : 0 },
          ].map(({ label, value, pct }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{label}</span>
                <span className="font-semibold">{fmt(value)} ({pct}%)</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Payment status */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Status</h4>
          <div className="flex gap-2">
            {[
              { key: 'paid', label: 'Paid', icon: CheckCircle, cls: 'text-success' },
              { key: 'pending', label: 'Pending', icon: Clock, cls: 'text-warning' },
              { key: 'overdue', label: 'Overdue', icon: AlertTriangle, cls: 'text-destructive' },
            ].map(({ key, label, icon: Icon, cls }) => (
              <div key={key} className="flex-1 text-center p-2 rounded-lg bg-muted/30">
                <Icon className={`h-3.5 w-3.5 mx-auto mb-1 ${cls}`} />
                <div className="text-lg font-bold">{byStatus[key] || 0}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {payroll.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum registro de folha de pagamento
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PayrollSummaryDashboard;
