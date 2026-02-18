/**
 * Wave 46 - Payroll Intelligence
 * Schema: crew_payroll (crew_member_id, gross_pay, net_pay, currency, payroll_period_start, payroll_period_end, payment_status, overtime_hours, overtime_amount, deductions, allowances)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Users, TrendingUp, Banknote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PayrollIntelligence() {
  const { data: payrollData = [], isLoading } = useQuery({
    queryKey: ['payroll-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_payroll')
        .select('id, crew_member_id, gross_pay, net_pay, currency, payroll_period_start, payroll_period_end, payment_status, overtime_hours, overtime_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    if (payrollData.length === 0) return null;

    const totalGross = payrollData.reduce((s, r) => s + (r.gross_pay || 0), 0);
    const totalNet = payrollData.reduce((s, r) => s + (r.net_pay || 0), 0);
    const totalOvertime = payrollData.reduce((s, r) => s + (r.overtime_amount || 0), 0);
    const totalOTHours = payrollData.reduce((s, r) => s + (r.overtime_hours || 0), 0);
    const avgGross = totalGross / payrollData.length;

    const statuses: Record<string, number> = {};
    payrollData.forEach(r => {
      const s = r.payment_status || 'unknown';
      statuses[s] = (statuses[s] || 0) + 1;
    });

    const currencies: Record<string, number> = {};
    payrollData.forEach(r => {
      const c = r.currency || 'USD';
      currencies[c] = (currencies[c] || 0) + (r.gross_pay || 0);
    });

    const uniqueCrew = new Set(payrollData.map(r => r.crew_member_id).filter(Boolean)).size;
    const deductionRate = totalGross > 0 ? ((totalGross - totalNet) / totalGross) * 100 : 0;

    return {
      totalGross: Math.round(totalGross),
      totalNet: Math.round(totalNet),
      totalOvertime: Math.round(totalOvertime),
      totalOTHours: Math.round(totalOTHours),
      avgGross: Math.round(avgGross),
      deductionRate: Math.round(deductionRate * 10) / 10,
      statuses,
      currencies,
      uniqueCrew,
      totalRecords: payrollData.length,
    };
  }, [payrollData]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Payroll Intelligence</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {metrics?.uniqueCrew || 0} tripulantes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado de folha de pagamento.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Banknote className="h-4 w-4 mx-auto text-success mb-1" />
                <p className="text-lg font-bold">${(metrics.totalGross / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-muted-foreground">Bruto Total</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">${(metrics.totalNet / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-muted-foreground">Líquido Total</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-warning mb-1" />
                <p className="text-lg font-bold">${(metrics.totalOvertime / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-muted-foreground">Horas Extra</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">${metrics.avgGross.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Média/Pessoa</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Taxa de Descontos</p>
                <p className="text-lg font-bold">{metrics.deductionRate}%</p>
              </div>
              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Horas Extra Total</p>
                <p className="text-lg font-bold">{metrics.totalOTHours.toLocaleString()}h</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Status dos Pagamentos</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics.statuses).map(([status, count]) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`text-[10px] ${
                      status === 'paid' || status === 'processed' ? 'border-success/40 text-success' :
                      status === 'pending' ? 'border-warning/40 text-warning' :
                      'border-muted-foreground/40'
                    }`}
                  >
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Distribuição por Moeda</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(metrics.currencies).map(([currency, amount]) => (
                  <Badge key={currency} variant="secondary" className="text-[10px]">
                    {currency}: ${(amount / 1000).toFixed(0)}k
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
