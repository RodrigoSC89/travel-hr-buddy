import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  FileText, 
  CheckCircle2, 
  Users, 
  Video, 
  MessageSquare,
  AlertTriangle,
  Clock,
  Upload,
  Edit,
  Bell,
  Anchor,
  Ship,
  Wrench,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WorkspaceActivity {
  id: string;
  type: "document" | "task" | "user" | "meeting" | "message" | "alert" | "system" | "maintenance";
  action: string;
  description: string;
  user: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
  relatedItem?: string;
}

interface WorkspaceActivitiesProps {
  activities: WorkspaceActivity[];
  onActivityClick?: (activity: WorkspaceActivity) => void;
}

const getActivityIcon = (type: WorkspaceActivity["type"]) => {
  switch (type) {
    case "document": return <FileText className="h-4 w-4" />;
    case "task": return <CheckCircle2 className="h-4 w-4" />;
    case "user": return <Users className="h-4 w-4" />;
    case "meeting": return <Video className="h-4 w-4" />;
    case "message": return <MessageSquare className="h-4 w-4" />;
    case "alert": return <AlertTriangle className="h-4 w-4" />;
    case "maintenance": return <Wrench className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: WorkspaceActivity["type"]) => {
  switch (type) {
    case "document": return "bg-blue-500/10 text-blue-500";
    case "task": return "bg-green-500/10 text-green-500";
    case "user": return "bg-purple-500/10 text-purple-500";
    case "meeting": return "bg-orange-500/10 text-orange-500";
    case "message": return "bg-cyan-500/10 text-cyan-500";
    case "alert": return "bg-red-500/10 text-red-500";
    case "maintenance": return "bg-yellow-500/10 text-yellow-500";
    default: return "bg-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority?: WorkspaceActivity["priority"]) => {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "secondary";
    default: return "outline";
  }
};

export const WorkspaceActivities: React.FC<WorkspaceActivitiesProps> = ({
  activities,
  onActivityClick,
}) => {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      
      if (minutes < 1) return "Agora";
      if (minutes < 60) return `${minutes} min atrás`;
      if (hours < 24) return `${hours}h atrás`;
      return date.toLocaleDateString("pt-BR");
    } catch {
      return timestamp;
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString("pt-BR");
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, WorkspaceActivity[]>);

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividades Recentes
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Todas</DropdownMenuItem>
              <DropdownMenuItem>Documentos</DropdownMenuItem>
              <DropdownMenuItem>Tarefas</DropdownMenuItem>
              <DropdownMenuItem>Reuniões</DropdownMenuItem>
              <DropdownMenuItem>Alertas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
          <div className="p-3">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -mx-3 px-3">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                <div className="space-y-3">
                  {dayActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="group flex gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
                      onClick={() => onActivityClick?.(activity)}
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          {activity.priority && activity.priority !== "low" && (
                            <Badge 
                              variant={getPriorityColor(activity.priority) as any}
                              className="text-xs flex-shrink-0"
                            >
                              {activity.priority === "high" ? "Alta" : "Média"}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">{activity.user}</span>
                          <span>•</span>
                          <span>{formatTime(activity.timestamp)}</span>
                          {activity.relatedItem && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{activity.relatedItem}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkspaceActivities;
