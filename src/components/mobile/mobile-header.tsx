import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showNotifications = true,
  notificationCount = 0,
  onNotificationClick,
  onSearchClick,
  onProfileClick,
  className
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border",
      "px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {onSearchClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="h-9 w-9 p-0"
            >
              <Search size={18} />
            </Button>
          )}
          
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="h-9 w-9 p-0 relative"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="h-9 w-9 p-0"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                U
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
};