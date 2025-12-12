/**
 * Presence Avatars - PATCH 837
 * Show online users with real-time presence
 */

import React from "react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePresence } from "@/lib/collaboration/realtime-presence";

interface PresenceAvatarsProps {
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const overlapClasses = {
  sm: "-ml-2",
  md: "-ml-3",
  lg: "-ml-4",
};

export const PresenceAvatars = memo(function({
  maxVisible = 5,
  size = "md",
  className,
  showCount = true,
}: PresenceAvatarsProps) {
  const { users, isConnected } = usePresence();
  
  if (!isConnected || users.length === 0) {
    return null;
  }
  
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  });
  
  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  });
  
  return (
    <TooltipProvider>
      <div className={cn("flex items-center", className)}>
        <div className="flex items-center">
          {visibleUsers.map((user, index) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative",
                    index > 0 && overlapClasses[size]
                  )}
                  style={{ zIndex: visibleUsers.length - index }}
                >
                  <Avatar
                    className={cn(
                      sizeClasses[size],
                      "ring-2 ring-background cursor-pointer transition-transform hover:scale-110"
                    )}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback
                      style={{ backgroundColor: user.color }}
                      className="text-white font-medium"
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
                      statusColors[user.status],
                      size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.currentPage === window.location.pathname
                    ? "Nesta página"
                    : `Em ${user.currentPage}`}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Remaining count */}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("relative", overlapClasses[size])}>
                  <Avatar
                    className={cn(
                      sizeClasses[size],
                      "ring-2 ring-background bg-muted cursor-pointer"
                    )}
                  >
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>+{remainingCount} outros usuários online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Total count */}
        {showCount && (
          <div className="ml-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{users.length} online</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Compact presence indicator
 */
export const PresenceIndicator = memo(function({ className }: { className?: string }) {
  const { users, isConnected } = usePresence();
  
  if (!isConnected) {
    return (
      <div className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
        <span className="h-2 w-2 rounded-full bg-muted animate-pulse" />
        <span className="text-xs">Conectando...</span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-xs text-muted-foreground">
        {users.length > 0 ? `${users.length + 1} online` : "Online"}
      </span>
    </div>
  );
}

export default PresenceAvatars;
