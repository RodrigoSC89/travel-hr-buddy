/**
 * AI Module Card - Reusable component for AI engine status display
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Settings,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIModuleCardProps {
  id: string;
  name: string;
  description: string;
  type: 'ML' | 'NLP' | 'Optimization' | 'Prediction' | 'Agent' | 'Computer Vision' | 'Streaming';
  status: 'active' | 'beta' | 'idle' | 'error';
  confidence?: number;
  lastRun?: Date;
  decisionsCount?: number;
  avgResponseTime?: number;
  onRun?: () => void;
  onConfigure?: () => void;
  isRunning?: boolean;
  className?: string;
}

const TYPE_STYLES: Record<string, string> = {
  ML: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  NLP: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Optimization: "bg-green-500/10 text-green-500 border-green-500/20",
  Prediction: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Agent: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "Computer Vision": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Streaming: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  active: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
  beta: { color: "bg-yellow-500", icon: <AlertTriangle className="h-3 w-3" /> },
  idle: { color: "bg-gray-400", icon: <Activity className="h-3 w-3" /> },
  error: { color: "bg-red-500", icon: <AlertTriangle className="h-3 w-3" /> },
};

export function AIModuleCard({
  id,
  name,
  description,
  type,
  status,
  confidence,
  lastRun,
  decisionsCount,
  avgResponseTime,
  onRun,
  onConfigure,
  isRunning,
  className
}: AIModuleCardProps) {
  const statusStyle = STATUS_STYLES[status];

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", statusStyle.color)} />
            <CardTitle className="text-sm font-medium">{name}</CardTitle>
          </div>
          <Badge variant="outline" className={cn("text-xs", TYPE_STYLES[type])}>
            {type}
          </Badge>
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {confidence !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Confiança:</span>
              <span className="font-medium">{confidence}%</span>
            </div>
          )}
          {avgResponseTime !== undefined && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Tempo:</span>
              <span className="font-medium">{avgResponseTime}ms</span>
            </div>
          )}
        </div>

        {/* Confidence bar */}
        {confidence !== undefined && (
          <div className="space-y-1">
            <Progress value={confidence} className="h-1.5" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {onRun && (
            <Button 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={onRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <Activity className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {isRunning ? 'Executando...' : 'Executar'}
            </Button>
          )}
          {onConfigure && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 w-7 p-0"
              onClick={onConfigure}
            >
              <Settings className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Last run */}
        {lastRun && (
          <p className="text-[10px] text-muted-foreground">
            Última execução: {lastRun.toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default AIModuleCard;
