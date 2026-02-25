/**
 * Enhanced Presence Avatars v2 - Live activity tracking
 * Shows online users with current activity and module context
 */
import React from "react";
import { usePresence } from "@/lib/collaboration/realtime-presence";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Circle, Eye, Edit, Settings } from "lucide-react";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  viewing: Eye,
  editing: Edit,
  configuring: Settings,
};

function getActivityFromPage(page?: string): { label: string; type: string } {
  if (!page) return { label: "Navegando", type: "viewing" };
  if (page.includes("edit") || page.includes("form")) return { label: "Editando", type: "editing" };
  if (page.includes("settings") || page.includes("config")) return { label: "Configurando", type: "configuring" };
  return { label: "Visualizando", type: "viewing" };
}

function getModuleFromPage(page?: string): string {
  if (!page) return "";
  const segments = page.replace("/", "").split("/");
  const moduleMap: Record<string, string> = {
    command: "Command",
    ops: "Operações",
    maintenance: "Manutenção",
    compliance: "Compliance",
    ai: "IA Lab",
    tracking: "Tracking",
    workbench: "Workbench",
  };
  return moduleMap[segments[0]] ?? segments[0] ?? "";
}

export const PresenceAvatars: React.FC = () => {
  const { users, isConnected } = usePresence();

  if (!isConnected || users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 gap-1">
        <Circle className="h-1.5 w-1.5 fill-success text-success" />
        {users.length} online
      </Badge>
      <div className="flex -space-x-2">
        <AnimatePresence>
          {users.slice(0, 5).map((user) => {
            const activity = getActivityFromPage(user.currentPage);
            const moduleName = getModuleFromPage(user.currentPage);
            const ActivityIcon = ACTIVITY_ICONS[activity.type] ?? Eye;

            return (
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
                            ? "bg-success"
                            : user.status === "away"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                      {activity.type === "editing" && (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-info border border-background"
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ActivityIcon className="h-3 w-3" />
                      <span>{activity.label}</span>
                      {moduleName && <span className="text-primary">• {moduleName}</span>}
                    </div>
                    <p className="text-muted-foreground text-[10px]">{user.currentPage}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {users.length > 5 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{users.length - 5}
        </span>
      )}
    </div>
  );
};
