import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  UserCheck,
  Settings,
  Upload,
  Activity,
} from "lucide-react";

/**
 * PATCH 631: Event Timeline Component
 * Visual representation of system events in chronological order
 */

export interface TimelineEvent {
  id: string;
  event_type: string;
  event_category: string;
  severity: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

const eventIcons = {
  login: UserCheck,
  logout: UserCheck,
  admin_action: Settings,
  deploy: Upload,
  failure: XCircle,
  system: Activity,
  default: Info,
};

const severityConfig = {
  info: {
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    badge: "default" as const,
  },
  success: {
    color: "text-green-500",
    bgColor: "bg-green-50",
    badge: "default" as const,
  },
  warning: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    badge: "outline" as const,
  },
  error: {
    color: "text-red-500",
    bgColor: "bg-red-50",
    badge: "destructive" as const,
  },
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No events to display
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const IconComponent = eventIcons[event.event_type as keyof typeof eventIcons] || eventIcons.default;
        const config = severityConfig[event.severity] || severityConfig.info;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
            )}

            {/* Event icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center z-10`}>
              <IconComponent className={`h-5 w-5 ${config.color}`} />
            </div>

            {/* Event content */}
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={config.badge} className="text-xs">
                        {event.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {event.event_category}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{format(new Date(event.created_at), "PPp")}</span>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <span className="text-xs">
                          {Object.entries(event.metadata).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
