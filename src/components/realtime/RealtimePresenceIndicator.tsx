/**
 * Realtime Presence Indicator - Mostra usuários online
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimePresence } from '@/hooks/use-realtime-presence';
import { cn } from '@/lib/utils';
import { Users, Circle } from 'lucide-react';

interface RealtimePresenceIndicatorProps {
  className?: string;
  showCount?: boolean;
  maxAvatars?: number;
}

export function RealtimePresenceIndicator({
  className,
  showCount = true,
  maxAvatars = 5,
}: RealtimePresenceIndicatorProps) {
  const { otherUsers, totalOnline, isConnected } = useRealtimePresence();

  const displayUsers = otherUsers.slice(0, maxAvatars);
  const remainingCount = Math.max(0, otherUsers.length - maxAvatars);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  if (!isConnected) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        {showCount && (
          <Badge variant="secondary" className="gap-1">
            <Circle className={cn('w-2 h-2', isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500')} />
            <Users className="w-3 h-3" />
            {totalOnline}
          </Badge>
        )}

        <div className="flex -space-x-2">
          {displayUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-background">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name || user.email} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span 
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                      getStatusColor(user.status)
                    )} 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div>
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-muted-foreground">{user.currentPage}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{remainingCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Mais {remainingCount} usuário(s) online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default RealtimePresenceIndicator;
