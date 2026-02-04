/**
 * Timeline Activity - Linha do tempo de atividades
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, CheckCircle, AlertTriangle, Info, 
  User, Settings, FileText, type LucideIcon
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info" | "default";
  icon?: LucideIcon;
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: string;
  metadata?: Record<string, string>;
}

interface TimelineActivityProps {
  title?: string;
  activities: ActivityItem[];
  maxHeight?: string;
  showUser?: boolean;
  loading?: boolean;
}

const typeIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  default: Clock,
};

const typeColors = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  default: "bg-muted-foreground",
};

export function TimelineActivity({
  title = "Atividades Recentes",
  activities,
  maxHeight = "400px",
  showUser = true,
  loading = false
}: TimelineActivityProps) {
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Carregando...
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon || typeIcons[activity.type];
                  const dotColor = typeColors[activity.type];

                  return (
                    <div key={activity.id} className="relative flex gap-4 pl-8">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 w-6 h-6 rounded-full ${dotColor} flex items-center justify-center ring-4 ring-background`}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>

                        {showUser && activity.user && (
                          <div className="flex items-center gap-1 mt-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {activity.user}
                            </span>
                          </div>
                        )}

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-[10px] h-5">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
