/**
 * NAUTI ONE — Event Activity Feed
 * Shows real-time cross-module events for any entity
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, Anchor, Wrench, Shield, DollarSign, Users,
  AlertTriangle, FileText, Bot, Settings, MapPin, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  voyage: <Anchor className="h-3.5 w-3.5" />,
  maintenance: <Wrench className="h-3.5 w-3.5" />,
  compliance: <Shield className="h-3.5 w-3.5" />,
  finance: <DollarSign className="h-3.5 w-3.5" />,
  people: <Users className="h-3.5 w-3.5" />,
  tracking: <MapPin className="h-3.5 w-3.5" />,
  ai: <Bot className="h-3.5 w-3.5" />,
  system: <Settings className="h-3.5 w-3.5" />,
  document: <FileText className="h-3.5 w-3.5" />,
  vessel: <Anchor className="h-3.5 w-3.5" />,
};

const DOMAIN_COLORS: Record<string, string> = {
  voyage: 'text-blue-400',
  maintenance: 'text-orange-400',
  compliance: 'text-purple-400',
  finance: 'text-green-400',
  people: 'text-cyan-400',
  tracking: 'text-yellow-400',
  ai: 'text-pink-400',
  system: 'text-muted-foreground',
  document: 'text-indigo-400',
  vessel: 'text-blue-400',
};

function getDomain(eventType: string): string {
  return eventType.split('.')[0] ?? 'system';
}

function formatEventType(eventType: string): string {
  const parts = eventType.split('.');
  const labels: Record<string, string> = {
    created: 'criado',
    updated: 'atualizado',
    completed: 'concluído',
    approved: 'aprovado',
    rejected: 'rejeitado',
    expiring: 'expirando',
    expired: 'expirado',
    logged: 'registrado',
    accepted: 'aceito',
    published: 'publicado',
    closed: 'fechado',
    linked: 'vinculado',
  };
  const action = labels[parts[parts.length - 1]] ?? parts[parts.length - 1];
  const entity = parts.length > 2 ? parts[1] : parts[0];
  return `${entity} ${action}`;
}

interface EventActivityFeedProps {
  entityType?: string;
  entityId?: string;
  vesselId?: string;
  limit?: number;
  className?: string;
  title?: string;
}

export function EventActivityFeed({
  entityType,
  entityId,
  vesselId,
  limit = 20,
  className,
  title = "Atividade Recente"
}: EventActivityFeedProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['event-feed', entityType, entityId, vesselId, limit],
    queryFn: async () => {
      // Query audit_events table for activity
      let query = fromUntyped('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType && entityId) {
        query = query
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          {title}
          {events?.length ? (
            <Badge variant="outline" className="ml-auto text-xs">
              {events.length}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !events?.length ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Nenhuma atividade registrada
          </div>
        ) : (
          <ScrollArea className="max-h-[350px]">
            <div className="divide-y divide-border/30">
              {events.map((event: any) => {
                const domain = getDomain(event.action ?? '');
                const icon = DOMAIN_ICONS[domain] ?? <Activity className="h-3.5 w-3.5" />;
                const color = DOMAIN_COLORS[domain] ?? 'text-muted-foreground';
                const label = formatEventType(event.action ?? 'unknown');
                const timeAgo = event.created_at
                  ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })
                  : '';

                return (
                  <div key={event.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className={`mt-0.5 ${color}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm capitalize">{label}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo}
                        {event.entity_type && (
                          <Badge variant="outline" className="ml-2 text-[9px] h-4">
                            {event.entity_type}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
