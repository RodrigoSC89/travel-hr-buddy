/**
 * Status Timeline - Event/activity timeline component
 * Features: real-time updates, filtering, grouping, actions
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Loader2,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  User,
  Calendar,
  MapPin,
  ExternalLink,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type TimelineEventStatus = 
  | "completed" 
  | "in_progress" 
  | "pending" 
  | "warning" 
  | "error" 
  | "info";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  status: TimelineEventStatus;
  category?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  location?: string;
  metadata?: Record<string, unknown>;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  }[];
  link?: string;
  icon?: React.ReactNode;
}

export interface StatusTimelineProps {
  events: TimelineEvent[];
  title?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showGrouping?: boolean;
  maxHeight?: string;
  variant?: "default" | "compact" | "detailed";
  groupBy?: "day" | "category" | "status" | "none";
  onRefresh?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const statusConfig: Record<TimelineEventStatus, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-success",
    bgColor: "bg-success",
    borderColor: "border-success",
    label: "Concluído",
  },
  in_progress: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-info",
    bgColor: "bg-info",
    borderColor: "border-info",
    label: "Em Andamento",
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-warning",
    bgColor: "bg-warning",
    borderColor: "border-warning",
    label: "Pendente",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-warning",
    bgColor: "bg-warning",
    borderColor: "border-warning",
    label: "Atenção",
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color: "text-destructive",
    bgColor: "bg-destructive",
    borderColor: "border-destructive",
    label: "Erro",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground",
    borderColor: "border-muted-foreground",
    label: "Info",
  },
};

function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(d)) {
    return `Hoje às ${format(d, "HH:mm")}`;
  }
  
  if (isYesterday(d)) {
    return `Ontem às ${format(d, "HH:mm")}`;
  }
  
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function getDateGroup(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  
  return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export function StatusTimeline({
  events,
  title = "Timeline",
  showSearch = true,
  showFilter = true,
  showGrouping = true,
  maxHeight = "600px",
  variant = "default",
  groupBy = "day",
  onRefresh,
  isLoading = false,
  emptyMessage = "Nenhum evento encontrado",
  className,
}: StatusTimelineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentGroupBy, setCurrentGroupBy] = useState(groupBy);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Group events
  const groupedEvents = useMemo(() => {
    if (currentGroupBy === "none") {
      return { "Todos os Eventos": filteredEvents };
    }

    return filteredEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
      let groupKey: string;
      
      switch (currentGroupBy) {
        case "day":
          groupKey = getDateGroup(event.timestamp);
          break;
        case "category":
          groupKey = event.category || "Sem Categoria";
          break;
        case "status":
          groupKey = statusConfig[event.status].label;
          break;
        default:
          groupKey = "Outros";
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
      
      return groups;
    }, {});
  }, [filteredEvents, currentGroupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const renderEvent = (event: TimelineEvent) => {
    const config = statusConfig[event.status];
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="relative pl-8 pb-4"
      >
        {/* Timeline line */}
        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-border" />
        
        {/* Status dot */}
        <div
          className={cn(
            "absolute left-1.5 top-1.5 w-4 h-4 rounded-full flex items-center justify-center",
            config.bgColor
          )}
        >
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>

        <Card className={cn(
          "transition-all hover:shadow-md",
          variant === "compact" && "shadow-none border-0 bg-transparent"
        )}>
          <CardContent className={cn("p-3", variant === "compact" && "p-0 pl-2")}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                {event.icon && (
                  <span className={config.color}>{event.icon}</span>
                )}
                <span className="font-medium text-sm">{event.title}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", config.color)}
                >
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </div>
              {event.actions && event.actions.length > 0 && (
                <div className="flex gap-1">
                  {event.actions.slice(0, 2).map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant || "ghost"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && variant !== "compact" && (
              <p className="text-sm text-muted-foreground mb-2">
                {event.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatEventDate(event.timestamp)}
              </span>
              {event.user && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {event.user.name}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              {event.category && (
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              )}
              {event.link && (
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver mais
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            {title}
            <Badge variant="secondary" className="ml-2">
              {filteredEvents.length}
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {showSearch && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          )}
          
          {showFilter && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showGrouping && (
            <Select value={currentGroupBy} onValueChange={(v) => setCurrentGroupBy(v as typeof currentGroupBy)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Agrupar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Agrupamento</SelectItem>
                <SelectItem value="day">Por Dia</SelectItem>
                <SelectItem value="category">Por Categoria</SelectItem>
                <SelectItem value="status">Por Status</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ maxHeight }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(groupedEvents).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Clock className="h-10 w-10 mb-2 opacity-30" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([groupKey, groupEvents]) => (
                <div key={groupKey}>
                  {currentGroupBy !== "none" && (
                    <button
                      className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => toggleGroup(groupKey)}
                    >
                      {expandedGroups.has(groupKey) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {groupKey}
                      <Badge variant="secondary" className="text-xs">
                        {groupEvents.length}
                      </Badge>
                    </button>
                  )}
                  
                  <AnimatePresence>
                    {(currentGroupBy === "none" || !expandedGroups.has(groupKey)) && (
                      <div className="space-y-0">
                        {groupEvents.map(renderEvent)}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default StatusTimeline;
