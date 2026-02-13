/**
 * PremiumTimeline - Timeline Visual World-Class
 * 
 * Features:
 * - Timeline interativa
 * - Suporte a status e ações
 * - Animações fluidas
 * - Filtros por tipo
 * 
 * Benchmark: Linear, Jira, Monday.com
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  User,
  Settings,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Edit,
  Trash2,
  Archive,
  Ship,
  Anchor,
  Wrench,
  Shield,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type EventType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'comment' 
  | 'status-change' 
  | 'assignment'
  | 'approval'
  | 'rejection'
  | 'upload'
  | 'milestone'
  | 'alert'
  | 'maintenance'
  | 'voyage'
  | 'compliance'
  | 'system'
  // Additional simple types for backwards compatibility
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

type EventStatus = 'completed' | 'pending' | 'in-progress' | 'cancelled' | 'warning';

export interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  timestamp: Date | string; // Accept both Date and string
  user?: string | {
    name: string;
    avatar?: string;
    role?: string;
  };
  status?: EventStatus;
  metadata?: Record<string, unknown>;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  link?: {
    label: string;
    url: string;
  };
}

interface PremiumTimelineProps {
  events: TimelineEvent[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
  maxVisible?: number;
  className?: string;
  onAddEvent?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

const eventIcons: Record<EventType, React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  'status-change': <ArrowRight className="h-4 w-4" />,
  assignment: <User className="h-4 w-4" />,
  approval: <CheckCircle2 className="h-4 w-4" />,
  rejection: <AlertCircle className="h-4 w-4" />,
  upload: <FileText className="h-4 w-4" />,
  milestone: <Calendar className="h-4 w-4" />,
  alert: <AlertCircle className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  voyage: <Ship className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  // Simple types
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const eventColors: Record<EventType, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  comment: 'bg-yellow-500',
  'status-change': 'bg-purple-500',
  assignment: 'bg-cyan-500',
  approval: 'bg-emerald-500',
  rejection: 'bg-rose-500',
  upload: 'bg-amber-500',
  milestone: 'bg-indigo-500',
  alert: 'bg-orange-500',
  maintenance: 'bg-orange-500',
  voyage: 'bg-blue-500',
  compliance: 'bg-violet-500',
  system: 'bg-gray-500',
  // Simple types
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const statusColors: Record<EventStatus, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const statusLabels: Record<EventStatus, string> = {
  completed: 'Concluído',
  pending: 'Pendente',
  'in-progress': 'Em andamento',
  cancelled: 'Cancelado',
  warning: 'Atenção',
};

// Helper to convert timestamp to Date
const toDate = (timestamp: Date | string): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Helper to normalize user
const normalizeUser = (user?: string | { name: string; avatar?: string; role?: string }) => {
  if (!user) return undefined;
  if (typeof user === 'string') {
    return { name: user, avatar: undefined, role: undefined };
  }
  return user;
};

export function PremiumTimeline({
  events,
  title = 'Histórico de Atividades',
  showFilters = true,
  maxItems,
  maxVisible = 5,
  className,
  onAddEvent,
  loading = false,
  emptyMessage = 'Nenhuma atividade registrada',
}: PremiumTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Use maxItems if provided, otherwise maxVisible
  const effectiveMaxVisible = maxItems ?? maxVisible;

  const filteredEvents = selectedTypes.length > 0
    ? events.filter(e => selectedTypes.includes(e.type))
    : events;

  const visibleEvents = expanded ? filteredEvents : filteredEvents.slice(0, effectiveMaxVisible);
  const hasMore = filteredEvents.length > effectiveMaxVisible;

  const toggleFilter = (type: EventType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 animate-pulse" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={`timeline-skel-${i}`} className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {title}
            <Badge variant="secondary" className="ml-2">
              {events.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn(selectedTypes.length > 0 && 'text-primary')}
              >
                <Filter className="h-4 w-4" />
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            )}
            
            {onAddEvent && (
              <Button variant="ghost" size="sm" onClick={onAddEvent}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilterMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 pt-3"
            >
              {(['success', 'warning', 'error', 'info', 'maintenance', 'voyage', 'compliance'] as EventType[]).map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleFilter(type)}
                >
                  {eventIcons[type]}
                  <span className="ml-1 text-xs capitalize">{type}</span>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            {/* Events */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {visibleEvents.map((event, idx) => {
                  const normalizedUser = normalizeUser(event.user);
                  const eventDate = toDate(event.timestamp);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative flex gap-4 pl-2"
                    >
                      {/* Event icon */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white relative z-10',
                              eventColors[event.type] || 'bg-gray-500'
                            )}>
                              {eventIcons[event.type] || <Info className="h-4 w-4" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="capitalize">{event.type.replace('-', ' ')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Event content */}
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{event.title}</p>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          
                          {event.status && (
                            <Badge className={cn('text-xs shrink-0', statusColors[event.status])}>
                              {statusLabels[event.status]}
                            </Badge>
                          )}
                        </div>

                        {/* User and timestamp */}
                        <div className="flex items-center gap-2 mt-2">
                          {normalizedUser && (
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={normalizedUser.avatar} />
                                <AvatarFallback className="text-[10px]">
                                  {normalizedUser.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {normalizedUser.name}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(eventDate, { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        {event.actions && event.actions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {event.actions.map((action, actionIdx) => (
                              <Button
                                key={actionIdx}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={action.onClick}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Show more/less */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Ver mais {filteredEvents.length - effectiveMaxVisible} atividades
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PremiumTimeline;
