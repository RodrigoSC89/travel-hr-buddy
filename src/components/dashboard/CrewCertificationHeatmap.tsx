/**
 * Wave 42: Crew Certification Heatmap
 * Certification status by crew member with expiry heat indicators
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export default function CrewCertificationHeatmap() {
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['crew-cert-heatmap'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .select('id, crew_member_id, certification_name, certification_type, expiry_date, status')
        .order('expiry_date', { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ['crew-cert-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .eq('status', 'active')
        .order('full_name')
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const today = new Date();

  const metrics = useMemo(() => {
    const expired = certifications.filter(c => c.expiry_date && differenceInDays(parseISO(c.expiry_date), today) < 0);
    const expiring30 = certifications.filter(c => {
      if (!c.expiry_date) return false;
      const days = differenceInDays(parseISO(c.expiry_date), today);
      return days >= 0 && days <= 30;
    });
    const valid = certifications.filter(c => c.status === 'valid' || c.status === 'active');
    const certTypes = new Set(certifications.map(c => c.certification_type).filter(Boolean));

    // Per-crew compliance
    const crewCompliance = crewMembers.map(cm => {
      const certs = certifications.filter(c => c.crew_member_id === cm.id);
      const validCerts = certs.filter(c => {
        if (!c.expiry_date) return c.status === 'valid' || c.status === 'active';
        return differenceInDays(parseISO(c.expiry_date), today) > 0;
      });
      return {
        ...cm,
        totalCerts: certs.length,
        validCerts: validCerts.length,
        compliance: certs.length > 0 ? Math.round((validCerts.length / certs.length) * 100) : 100,
      };
    }).sort((a, b) => a.compliance - b.compliance);

    return {
      totalCerts: certifications.length,
      expired: expired.length,
      expiring30: expiring30.length,
      validRate: certifications.length > 0 ? Math.round((valid.length / certifications.length) * 100) : 100,
      certTypes: certTypes.size,
      crewCompliance,
    };
  }, [certifications, crewMembers, today]);

  if (isLoading) return <Skeleton className="h-80" />;

  const complianceColor = (pct: number) => {
    if (pct >= 90) return 'text-success';
    if (pct >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Crew Certification Heatmap
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {metrics.totalCerts} certs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Valid Rate', value: `${metrics.validRate}%`, icon: CheckCircle, color: 'text-success' },
            { label: 'Expired', value: metrics.expired, icon: AlertTriangle, color: 'text-destructive' },
            { label: 'Expiring 30d', value: metrics.expiring30, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Types', value: metrics.certTypes, icon: Award, color: 'text-info' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Crew Compliance List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {metrics.crewCompliance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum tripulante ativo com certificações registradas.
            </p>
          ) : (
            metrics.crewCompliance.slice(0, 8).map(crew => (
              <div key={crew.id} className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/30">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{crew.full_name}</p>
                    <span className={`text-xs font-bold ${complianceColor(crew.compliance)}`}>
                      {crew.compliance}%
                    </span>
                  </div>
                  <Progress value={crew.compliance} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {crew.rank || 'N/A'} • {crew.validCerts}/{crew.totalCerts} válidas
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
