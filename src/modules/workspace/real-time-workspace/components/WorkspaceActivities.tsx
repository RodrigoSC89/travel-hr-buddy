import { useMemo, useState, useCallback } from "react";;
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Activity, 
  FileText, 
  CheckCircle2, 
  Users, 
  Video, 
  MessageSquare,
  AlertTriangle,
  Clock,
  Wrench,
  Filter,
  X,
  Calendar,
  SlidersHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

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

type ActivityType = WorkspaceActivity["type"];
type PriorityType = "low" | "medium" | "high";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "document", label: "Documentos" },
  { value: "task", label: "Tarefas" },
  { value: "user", label: "Usuários" },
  { value: "meeting", label: "Reuniões" },
  { value: "message", label: "Mensagens" },
  { value: "alert", label: "Alertas" },
  { value: "maintenance", label: "Manutenção" },
  { value: "system", label: "Sistema" },
];

const PRIORITY_OPTIONS: { value: PriorityType; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

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
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<PriorityType>>(new Set());
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("all");
  const { toast } = useToast();

  const hasActiveFilters = selectedTypes.size > 0 || selectedPriorities.size > 0 || dateRange !== "all";

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Filter by type
      if (selectedTypes.size > 0 && !selectedTypes.has(activity.type)) {
        return false;
      }
      
      // Filter by priority
      if (selectedPriorities.size > 0) {
        const priority = activity.priority || "low";
        if (!selectedPriorities.has(priority)) {
          return false;
        }
      }
      
      // Filter by date range
      if (dateRange !== "all") {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const diffTime = now.getTime() - activityDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        switch (dateRange) {
        case "today":
          if (diffDays > 1) return false;
          break;
        case "week":
          if (diffDays > 7) return false;
          break;
        case "month":
          if (diffDays > 30) return false;
          break;
        }
      }
      
      return true;
    });
  }, [activities, selectedTypes, selectedPriorities, dateRange]);

  const toggleType = (type: ActivityType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  });

  const togglePriority = (priority: PriorityType) => {
    const newPriorities = new Set(selectedPriorities);
    if (newPriorities.has(priority)) {
      newPriorities.delete(priority);
    } else {
      newPriorities.add(priority);
    }
    setSelectedPriorities(newPriorities);
  });

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedPriorities(new Set());
    setDateRange("all");
    toast({
      title: "Filtros limpos",
      description: "Mostrando todas as atividades",
    });
  });

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
  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((groups, activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("pt-BR");
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, WorkspaceActivity[]>);
  }, [filteredActivities]);

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividades Recentes
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {filteredActivities.length} de {activities.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={hasActiveFilters ? "secondary" : "outline"} 
                  size="sm" 
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                  {hasActiveFilters && (
                    <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                      {selectedTypes.size + selectedPriorities.size + (dateRange !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background border" align="end">
                <div className="space-y-4">
                  {/* Date Range Filter */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "today", label: "Hoje" },
                        { value: "week", label: "Esta semana" },
                        { value: "month", label: "Este mês" },
                        { value: "all", label: "Todos" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={dateRange === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={handleSetDateRange}
                          className="w-full"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Tipo de atividade
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIVITY_TYPES.map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            selectedTypes.has(type.value) 
                              ? "bg-primary/10 border border-primary/30" 
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={selectedTypes.has(type.value)}
                            onCheckedChange={() => toggleType(type.value}
                          />
                          <span className="text-xs">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Prioridade
                    </h4>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map((priority) => (
                        <label
                          key={priority.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors flex-1 ${
                            selectedPriorities.has(priority.value) 
                              ? "bg-primary/10 border border-primary/30" 
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={selectedPriorities.has(priority.value)}
                            onCheckedChange={() => togglePriority(priority.value}
                          />
                          <span className="text-xs">{priority.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
          <div className="p-3">
            {Object.entries(groupedActivities).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
                {hasActiveFilters && (
                  <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -mx-3 px-3">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  <div className="space-y-3">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="group flex gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200"
                        onClick={() => {
                          onActivityClick?.(activity);
                          toast({
                            title: activity.action,
                            description: activity.description,
                          });
                        }}
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
                                variant={getPriorityColor(activity.priority) as unknown}
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
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkspaceActivities;
