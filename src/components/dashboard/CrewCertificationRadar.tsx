/**
 * Crew Certification Radar
 * Visual coverage of STCW/MLC certifications across the fleet
 * Uses crew_certifications for real cert data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CertRow {
  id: string;
  certification_name: string;
  certification_type: string | null;
  expiry_date: string | null;
  status: string | null;
}

export function CrewCertificationRadar() {
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['crew-cert-radar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .select('id, certification_name, certification_type, expiry_date, status')
        .limit(500);
      if (error) throw error;
      return (data || []) as CertRow[];
    },
    staleTime: 60000,
  });

  const now = Date.now();
  const d30 = 30 * 86400000;
  const d90 = 90 * 86400000;

  const stats = {
    total: certs.length,
    valid: certs.filter(c => {
      if (!c.expiry_date) return c.status === 'active' || c.status === 'valid';
      return new Date(c.expiry_date).getTime() > now + d90;
    }).length,
    expiring30: certs.filter(c => {
      if (!c.expiry_date) return false;
      const t = new Date(c.expiry_date).getTime();
      return t > now && t <= now + d30;
    }).length,
    expiring90: certs.filter(c => {
      if (!c.expiry_date) return false;
      const t = new Date(c.expiry_date).getTime();
      return t > now + d30 && t <= now + d90;
    }).length,
    expired: certs.filter(c => {
      if (!c.expiry_date) return c.status === 'expired';
      return new Date(c.expiry_date).getTime() <= now;
    }).length,
  };

  // Group by certification type
  const typeGroups = certs.reduce<Record<string, { total: number; valid: number; expiring: number; expired: number }>>((acc, c) => {
    const type = c.certification_type || 'Other';
    if (!acc[type]) acc[type] = { total: 0, valid: 0, expiring: 0, expired: 0 };
    acc[type].total++;
    if (c.expiry_date) {
      const t = new Date(c.expiry_date).getTime();
      if (t <= now) acc[type].expired++;
      else if (t <= now + d90) acc[type].expiring++;
      else acc[type].valid++;
    } else {
      if (c.status === 'expired') acc[type].expired++;
      else acc[type].valid++;
    }
    return acc;
  }, {});

  const coverageRate = stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0;

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" />
            Crew Certification Coverage
          </CardTitle>
          <Badge variant={coverageRate >= 90 ? 'default' : coverageRate >= 70 ? 'secondary' : 'destructive'} className="text-xs">
            {coverageRate}% coverage
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Valid', value: stats.valid, icon: CheckCircle, color: 'text-success' },
            { label: '<30d', value: stats.expiring30, icon: AlertTriangle, color: 'text-destructive' },
            { label: '30-90d', value: stats.expiring90, icon: Clock, color: 'text-warning' },
            { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: 'text-destructive' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center p-2 rounded-lg bg-muted/50">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Coverage by Type */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">By Type</h4>
          {Object.entries(typeGroups)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 8)
            .map(([type, data]) => {
              const validPct = Math.round((data.valid / Math.max(data.total, 1)) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[60%]">{type}</span>
                    <span className="text-muted-foreground">
                      {data.valid}/{data.total} valid
                      {data.expired > 0 && <span className="text-destructive ml-1">({data.expired} exp)</span>}
                    </span>
                  </div>
                  <Progress value={validPct} className="h-1.5" />
                </div>
              );
            })}
        </div>

        {stats.total === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma certificação registrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CrewCertificationRadar;
