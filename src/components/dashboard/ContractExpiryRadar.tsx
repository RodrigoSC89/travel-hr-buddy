/**
 * Wave 41: Contract Expiry Radar
 * Correct schema: time_charters (redelivery_date), insurance_policies (end_date), certificates (expiry_date, certificate_type)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, FileText, Shield, AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function ContractExpiryRadar() {
  const { data: charters = [], isLoading: chartersLoading } = useQuery({
    queryKey: ['contract-expiry-charters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_charters')
        .select('id, charter_id, counterparty, redelivery_date, status')
        .order('redelivery_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ['contract-expiry-insurance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('id, type, end_date, status, vessel_id')
        .order('end_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['contract-expiry-certs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('id, certificate_type, expiry_date, status')
        .order('expiry_date', { ascending: true })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const today = new Date();

  const expiryItems = useMemo(() => {
    const items: Array<{ id: string; name: string; type: string; daysLeft: number }> = [];

    charters.forEach(c => {
      if (c.redelivery_date) {
        items.push({
          id: c.id, name: c.counterparty || c.charter_id, type: 'Charter',
          daysLeft: differenceInDays(parseISO(c.redelivery_date), today),
        });
      }
    });

    insurances.forEach(i => {
      if (i.end_date) {
        items.push({
          id: i.id, name: i.type || 'Insurance', type: 'Insurance',
          daysLeft: differenceInDays(parseISO(i.end_date), today),
        });
      }
    });

    certificates.forEach(c => {
      if (c.expiry_date) {
        items.push({
          id: c.id, name: c.certificate_type || 'Certificate', type: 'Certificate',
          daysLeft: differenceInDays(parseISO(c.expiry_date), today),
        });
      }
    });

    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [charters, insurances, certificates, today]);

  const metrics = useMemo(() => {
    const expired = expiryItems.filter(i => i.daysLeft < 0);
    const critical = expiryItems.filter(i => i.daysLeft >= 0 && i.daysLeft <= 30);
    const warning = expiryItems.filter(i => i.daysLeft > 30 && i.daysLeft <= 90);
    return { total: expiryItems.length, expired: expired.length, critical: critical.length, warning: warning.length };
  }, [expiryItems]);

  if (chartersLoading) return <Skeleton className="h-80" />;

  const urgencyBadge = (days: number) => {
    if (days < 0) return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>;
    if (days <= 30) return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{days}d</Badge>;
    if (days <= 90) return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">{days}d</Badge>;
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20">{days}d</Badge>;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Contract Expiry Radar
          </CardTitle>
          {metrics.critical > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {metrics.critical} critical
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: metrics.total, color: 'text-foreground' },
            { label: 'Expired', value: metrics.expired, color: 'text-destructive' },
            { label: '≤30 days', value: metrics.critical, color: 'text-warning' },
            { label: '≤90 days', value: metrics.warning, color: 'text-info' },
          ].map(s => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {expiryItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum contrato/certificado registrado.</p>
          ) : (
            expiryItems.slice(0, 8).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/30">
                <div className="flex items-center gap-2 min-w-0">
                  {item.type === 'Charter' && <FileText className="h-3.5 w-3.5 text-primary shrink-0" />}
                  {item.type === 'Insurance' && <Shield className="h-3.5 w-3.5 text-info shrink-0" />}
                  {item.type === 'Certificate' && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                {urgencyBadge(item.daysLeft)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
