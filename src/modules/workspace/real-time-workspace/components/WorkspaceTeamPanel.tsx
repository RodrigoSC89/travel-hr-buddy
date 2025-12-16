import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, MessageSquare, Phone, Video, MoreVertical, Circle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "busy" | "offline";
  avatar?: string;
  lastSeen?: string;
  currentActivity?: string;
}

interface WorkspaceTeamPanelProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  onStartChat?: (member: TeamMember) => void;
  onStartCall?: (member: TeamMember) => void;
  onStartVideo?: (member: TeamMember) => void;
}

const getStatusColor = (status: TeamMember["status"]) => {
  switch (status) {
    case "online": return "bg-green-500";
    case "away": return "bg-yellow-500";
    case "busy": return "bg-red-500";
    default: return "bg-muted-foreground/50";
  }
};

const getStatusLabel = (status: TeamMember["status"]) => {
  switch (status) {
    case "online": return "Online";
    case "away": return "Ausente";
    case "busy": return "Ocupado";
    default: return "Offline";
  }
};

export const WorkspaceTeamPanel: React.FC<WorkspaceTeamPanelProps> = ({
  members,
  onMemberClick,
  onStartChat,
  onStartCall,
  onStartVideo,
}) => {
  const onlineCount = members.filter(m => m.status === "online" || m.status === "away").length;
  
  const sortedMembers = [...members].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipe
          </CardTitle>
          <Badge variant="secondary" className="font-medium">
            {onlineCount}/{members.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
          <div className="p-3 space-y-1">
            {sortedMembers.map((member) => (
              <TooltipProvider key={member.id}>
                <div
                  className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
                  onClick={() => onMemberClick?.(member)}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span 
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {getStatusLabel(member.status)}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {member.status !== "offline" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); onStartChat?.(member); }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); onStartCall?.(member); }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStartVideo?.(member)}>
                          <Video className="h-4 w-4 mr-2" />
                          Videochamada
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Enviar arquivo</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {member.status === "offline" && member.lastSeen && (
                    <span className="text-xs text-muted-foreground">{member.lastSeen}</span>
                  )}
                </div>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkspaceTeamPanel;
