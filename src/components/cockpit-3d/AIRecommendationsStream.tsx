/**
 * AIRecommendationsStream Component
 * Real-time AI recommendations feed with priority indicators
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Lightbulb, Zap, ChevronRight, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { AIRecommendation3D } from './types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIRecommendationsStreamProps {
  recommendations: AIRecommendation3D[];
  onActionClick?: (recommendation: AIRecommendation3D) => void;
  maxHeight?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  action: Zap,
  insight: Lightbulb,
  warning: AlertTriangle,
};

const priorityColors: Record<string, string> = {
  critical: 'border-l-destructive bg-destructive/5',
  high: 'border-l-warning bg-warning/5',
  medium: 'border-l-accent bg-accent/5',
  low: 'border-l-success bg-success/5',
};

const priorityBadgeColors: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-warning/20 text-warning',
  medium: 'bg-accent/20 text-accent-foreground',
  low: 'bg-success/20 text-success',
};

export function AIRecommendationsStream({ 
  recommendations, 
  onActionClick,
  maxHeight = "400px"
}: AIRecommendationsStreamProps) {
  return (
    <div className="bg-background/60 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Recomendações IA</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {recommendations.length} ativas
        </span>
      </div>
      
      {/* Stream */}
      <ScrollArea className="p-2" style={{ maxHeight }}>
        <AnimatePresence mode="popLayout">
          {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma recomendação ativa</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recommendations.map((rec, index) => {
                const Icon = typeIcons[rec.type] || Lightbulb;
                
                return (
                  <motion.div
                    key={rec.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative border-l-2 rounded-r-lg p-3
                      ${priorityColors[rec.priority]}
                      hover:bg-muted/30 transition-colors cursor-pointer
                    `}
                    onClick={() => onActionClick?.(rec)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-md bg-background/50">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{rec.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityBadgeColors[rec.priority]}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(rec.timestamp, { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
