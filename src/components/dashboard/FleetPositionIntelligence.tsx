/**
 * Fleet Position Intelligence - Wave 20
 * Fleet positioning overview with status distribution
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Ship, Anchor, Wrench, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FleetPositionIntelligence() {
  const { data: vessels = [] } = useQuery({
    queryKey: ['fpi-vessels'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, status, flag_state, imo_number, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const statusDistribution = useMemo(() => {
    const dist = new Map<string, number>();
    vessels.forEach((v) => {
      const status = v.status || 'unknown';
      dist.set(status, (dist.get(status) || 0) + 1);
    });
    return Array.from(dist.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [vessels]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'operational': return <Ship className="h-3.5 w-3.5 text-success" />;
      case 'docked': case 'idle': return <Anchor className="h-3.5 w-3.5 text-primary" />;
      case 'maintenance': case 'drydock': return <Wrench className="h-3.5 w-3.5 text-warning" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'operational': return 'bg-success';
      case 'docked': case 'idle': return 'bg-primary';
      case 'maintenance': case 'drydock': return 'bg-warning';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Fleet Position Intelligence
          </CardTitle>
          <Badge variant="outline" className="text-xs">{vessels.length} embarcações</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status distribution bar */}
        {statusDistribution.length > 0 && (
          <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
              {statusDistribution.map((s, i) => (
                <motion.div
                  key={s.status}
                  className={`${getStatusColor(s.status)} first:rounded-l-full last:rounded-r-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / Math.max(vessels.length, 1)) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              ))}
            </div>
            <div className="flex gap-3 flex-wrap text-[10px]">
              {statusDistribution.map((s) => (
                <span key={s.status} className="flex items-center gap-1 text-muted-foreground capitalize">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(s.status)}`} />
                  {s.status} ({s.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vessel list */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {vessels.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma embarcação registrada</p>
            </div>
          ) : (
            vessels.slice(0, 15).map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {getStatusIcon(v.status || '')}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{v.name}</span>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>{v.vessel_type || 'N/A'}</span>
                    {v.flag_state && <span>🏴 {v.flag_state}</span>}
                    {v.imo_number && <span>IMO {v.imo_number}</span>}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {v.updated_at ? formatDistanceToNow(new Date(v.updated_at), { addSuffix: true, locale: ptBR }) : '-'}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
