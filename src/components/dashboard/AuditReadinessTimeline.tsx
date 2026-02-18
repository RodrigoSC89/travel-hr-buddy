/**
 * Audit Readiness Timeline - Wave 18
 * Visual timeline of upcoming audits, inspections & certificate expirations
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, FileWarning, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'audit' | 'certificate' | 'inspection';
  title: string;
  date: Date;
  daysUntil: number;
  urgency: 'critical' | 'warning' | 'ok';
  details: string;
}

export default function AuditReadinessTimeline() {
  const { data: audits = [] } = useQuery({
    queryKey: ['art-audits'],
    queryFn: async () => {
      const { data } = await supabase
        .from('internal_audits')
        .select('id, audit_number, audit_type, status, scheduled_date')
        .in('status', ['planned', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: certs = [] } = useQuery({
    queryKey: ['art-certs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('crew_certifications')
        .select('id, certification_name, expiry_date, crew_member_id')
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })
        .limit(30);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: pscInspections = [] } = useQuery({
    queryKey: ['art-psc'],
    queryFn: async () => {
      const { data } = await supabase
        .from('psc_inspections')
        .select('id, inspection_date, port_name, detention')
        .order('inspection_date', { ascending: false })
        .limit(10);
      return data || [];
    },
    staleTime: 60000,
  });

  const timeline: TimelineEvent[] = useMemo(() => {
    const now = new Date();
    const events: TimelineEvent[] = [];

    // Planned audits
    audits.forEach((a) => {
      const date = a.scheduled_date ? new Date(a.scheduled_date) : addDays(now, 30);
      const days = differenceInDays(date, now);
      events.push({
        id: `audit-${a.id}`,
        type: 'audit',
        title: `${(a.audit_type || 'Internal').toUpperCase()} Audit`,
        date,
        daysUntil: days,
        urgency: days < 7 ? 'critical' : days < 30 ? 'warning' : 'ok',
        details: a.audit_number || 'Pendente',
      });
    });

    // Expiring certificates (next 90 days)
    certs.forEach((c) => {
      if (!c.expiry_date) return;
      const date = new Date(c.expiry_date);
      const days = differenceInDays(date, now);
      if (days > 90 || days < -30) return;
      events.push({
        id: `cert-${c.id}`,
        type: 'certificate',
        title: c.certification_name || 'Certificado',
        date,
        daysUntil: days,
        urgency: days < 0 ? 'critical' : days < 30 ? 'warning' : 'ok',
        details: days < 0 ? `Expirado há ${Math.abs(days)}d` : `Expira em ${days}d`,
      });
    });

    // Recent PSC inspections as context
    pscInspections.slice(0, 3).forEach((p) => {
      if (!p.inspection_date) return;
      events.push({
        id: `psc-${p.id}`,
        type: 'inspection',
        title: `PSC ${p.port_name || ''}`.trim(),
        date: new Date(p.inspection_date),
        daysUntil: differenceInDays(new Date(p.inspection_date), now),
        urgency: p.detention ? 'critical' : 'ok',
        details: p.detention ? 'Detenção' : 'Sem detenção',
      });
    });

    return events.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [audits, certs, pscInspections]);

  const criticalCount = timeline.filter((e) => e.urgency === 'critical').length;
  const warningCount = timeline.filter((e) => e.urgency === 'warning').length;

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'audit': return <FileWarning className="h-4 w-4" />;
      case 'certificate': return <Clock className="h-4 w-4" />;
      case 'inspection': return <Anchor className="h-4 w-4" />;
    }
  };

  const getUrgencyStyles = (urgency: TimelineEvent['urgency']) => {
    switch (urgency) {
      case 'critical': return 'border-l-destructive bg-destructive/5';
      case 'warning': return 'border-l-warning bg-warning/5';
      case 'ok': return 'border-l-success bg-success/5';
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Audit Readiness Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">{criticalCount} Urgentes</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                {warningCount} Atenção
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">{timeline.length} eventos</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm">Nenhum evento crítico nos próximos 90 dias</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {timeline.slice(0, 15).map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${getUrgencyStyles(event.urgency)} transition-all hover:shadow-sm`}
              >
                <div className={`p-1.5 rounded-md ${
                  event.urgency === 'critical' ? 'bg-destructive/10 text-destructive' :
                  event.urgency === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {getIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{event.title}</span>
                    <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                      {event.type === 'audit' ? 'Auditoria' : event.type === 'certificate' ? 'Certificado' : 'Inspeção'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${
                    event.urgency === 'critical' ? 'text-destructive' :
                    event.urgency === 'warning' ? 'text-warning' : 'text-success'
                  }`}>
                    {event.daysUntil < 0 ? `${Math.abs(event.daysUntil)}d atrás` : 
                     event.daysUntil === 0 ? 'Hoje' : `${event.daysUntil}d`}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {format(event.date, 'dd/MM/yy')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
