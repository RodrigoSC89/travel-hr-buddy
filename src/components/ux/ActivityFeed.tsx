/**
 * Activity Feed - PATCH 837
 * ✅ P0-002: Real data from access_logs table
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Settings, Bell, Ship, Plane, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string; type: 'user' | 'document' | 'system' | 'travel' | 'fleet' | 'notification';
  action: string; description: string; timestamp: Date;
  user?: { name: string }; status?: 'success' | 'warning' | 'error' | 'info';
}

const typeIcons = { user: User, document: FileText, system: Settings, travel: Plane, fleet: Ship, notification: Bell };
const statusColors = { success: 'text-green-500 bg-green-500/10', warning: 'text-yellow-500 bg-yellow-500/10', error: 'text-red-500 bg-red-500/10', info: 'text-blue-500 bg-blue-500/10' };
const statusIcons = { success: CheckCircle, warning: AlertCircle, error: AlertCircle, info: Info };

interface ActivityFeedProps { activities?: Activity[]; maxItems?: number; className?: string; showTimestamp?: boolean; compact?: boolean; }

export function ActivityFeed({ activities, maxItems = 10, className, showTimestamp = true, compact = false }: ActivityFeedProps) {
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    if (activities) { setItems(activities.slice(0, maxItems)); return; }
    async function fetch() {
      const { data } = await supabase.from("access_logs").select("*").order("timestamp", { ascending: false }).limit(maxItems);
      const mapped: Activity[] = (data || []).map((d: any) => ({
        id: d.id,
        type: d.module_accessed?.includes("fleet") ? "fleet" as const : d.module_accessed?.includes("doc") ? "document" as const : "system" as const,
        action: d.action || "Ação",
        description: (d.details as any)?.description || d.action || "",
        timestamp: new Date(d.timestamp),
        status: d.result === "success" ? "success" as const : d.severity === "high" ? "error" as const : "info" as const,
      }));
      setItems(mapped);
    }
    fetch();
  }, [activities, maxItems]);

  if (items.length === 0) return <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}><p className="text-sm">Nenhuma atividade recente</p></div>;

  return (
    <ScrollArea className={cn('h-[400px]', className)}>
      <div className="space-y-1 pr-4">
        {items.map((activity, index) => {
          const Icon = typeIcons[activity.type];
          const StatusIcon = activity.status ? statusIcons[activity.status] : null;
          return (
            <div key={activity.id} className={cn('group relative flex gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50', compact && 'p-2')} style={{ animationDelay: `${index * 50}ms` }}>
              <div className={cn('shrink-0 p-2 rounded-lg', activity.status ? statusColors[activity.status] : 'bg-muted text-muted-foreground')}>
                {StatusIcon ? <StatusIcon className={cn('h-4 w-4', compact && 'h-3.5 w-3.5')} /> : <Icon className={cn('h-4 w-4', compact && 'h-3.5 w-3.5')} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2"><p className={cn('font-medium text-sm', compact && 'text-xs')}>{activity.action}</p>{showTimestamp && <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}</span>}</div>
                <p className={cn('text-muted-foreground mt-0.5', compact ? 'text-xs' : 'text-sm')}>{activity.description}</p>
                {activity.user && !compact && <p className="text-xs text-muted-foreground mt-1">por {activity.user.name}</p>}
              </div>
              {index < items.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function MiniActivityFeed({ className }: { className?: string }) {
  return <ActivityFeed maxItems={5} showTimestamp={false} compact className={className} />;
}

export default ActivityFeed;
