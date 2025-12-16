/**
 * Activity Feed Component
 * Displays recent system activities
 */

import React, { memo } from 'react';
import { formatRelativeTime } from '@/utils/format-utils';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock,
  User,
  FileText,
  Settings,
  Bell
} from 'lucide-react';

type ActivityType = 'success' | 'warning' | 'info' | 'pending';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: string;
  category?: 'user' | 'document' | 'system' | 'notification';
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
  showCategory?: boolean;
}

const typeIcons: Record<ActivityType, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
  pending: Clock
};

const typeColors: Record<ActivityType, string> = {
  success: 'text-green-500 bg-green-500/10',
  warning: 'text-yellow-500 bg-yellow-500/10',
  info: 'text-blue-500 bg-blue-500/10',
  pending: 'text-muted-foreground bg-muted/50'
};

const categoryIcons: Record<string, typeof User> = {
  user: User,
  document: FileText,
  system: Settings,
  notification: Bell
};

export const ActivityFeed = memo(function ActivityFeed({
  activities,
  maxItems = 10,
  className,
  showCategory = false
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center py-8 text-muted-foreground text-sm",
        className
      )}>
        Nenhuma atividade recente
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {displayActivities.map((activity, index) => {
        const TypeIcon = typeIcons[activity.type];
        const CategoryIcon = activity.category ? categoryIcons[activity.category] : null;

        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
              index === 0 && "bg-muted/30"
            )}
          >
            <div className={cn(
              "flex-shrink-0 p-1.5 rounded-full",
              typeColors[activity.type]
            )}>
              <TypeIcon className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                {showCategory && CategoryIcon && (
                  <CategoryIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {activity.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatRelativeTime(activity.timestamp)}</span>
                {activity.user && (
                  <>
                    <span>•</span>
                    <span>{activity.user}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ActivityFeed;
