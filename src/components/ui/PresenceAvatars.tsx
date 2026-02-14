/**
 * Real-time Presence Avatars - Shows online users
 * Deep Ocean Command Center design
 */
import React from "react";
import { usePresence } from "@/lib/collaboration/realtime-presence";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

export const PresenceAvatars: React.FC = () => {
  const { users, isConnected } = usePresence();

  if (!isConnected || users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        <AnimatePresence>
          {users.slice(0, 5).map((user) => (
            <motion.div
              key={user.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-7 w-7 border-2 border-background ring-2 ring-primary/20">
                      <AvatarFallback
                        className="text-[10px] font-bold text-white"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                        user.status === "online"
                          ? "bg-green-500"
                          : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground">{user.currentPage}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {users.length > 5 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{users.length - 5}
        </span>
      )}
      <div className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
    </div>
  );
};
