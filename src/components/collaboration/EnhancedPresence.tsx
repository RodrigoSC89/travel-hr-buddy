/**
 * Enhanced Real-time Collaboration Panel
 * Shows live users, their current pages, and activity status
 */
import React, { useState } from "react";
import { usePresence } from "@/lib/collaboration/realtime-presence";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, Edit3, Clock, Wifi, WifiOff } from "lucide-react";

const activityIcons: Record<string, React.ReactNode> = {
  viewing: <Eye className="h-3 w-3" />,
  editing: <Edit3 className="h-3 w-3" />,
  idle: <Clock className="h-3 w-3" />,
};

export const EnhancedPresence: React.FC = () => {
  const { users, isConnected } = usePresence();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Colaboração em Tempo Real</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "secondary" : "destructive"} className="gap-1 text-xs">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {users.length} online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {users.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Nenhum outro usuário online
                    </p>
                  ) : (
                    users.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback
                              className="text-xs font-bold text-white"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.name?.slice(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                            user.status === "online" ? "bg-green-500" : "bg-yellow-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {activityIcons[user.status === "away" ? "idle" : "viewing"]}
                            {user.currentPage || "Dashboard"}
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {user.status === "busy" ? "Editando" : user.status === "away" ? "Inativo" : "Visualizando"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Última atividade: agora</p>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
