/**
 * API Card Component
 * PATCH 659: Display individual API status and controls
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Cloud, Wind, CloudRain, Ship, Plane, Shield, Lock, 
  MessageSquare, Brain, Cpu, Activity, CheckCircle, 
  XCircle, AlertTriangle, Loader2, ExternalLink
} from 'lucide-react';
import { API_REGISTRY, type ApiIntegration, type ApiQuota } from '../types';
import { cn } from '@/lib/utils';

interface ApiCardProps {
  api: ApiIntegration;
  quota?: ApiQuota;
  onTest: (apiName: string) => Promise<boolean>;
  onToggle: (apiName: string, enabled: boolean) => Promise<void>;
  onClick: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud, Wind, CloudRain, Ship, Plane, Shield, Lock,
  MessageSquare, Brain, Cpu
};

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Operacional' },
  inactive: { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Inativo' },
  error: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Erro' },
  testing: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/10', label: 'Testando' }
};

const categoryColors: Record<string, string> = {
  weather: 'bg-primary/10 text-primary',
  maritime: 'bg-primary/10 text-primary',
  security: 'bg-destructive/10 text-destructive',
  communication: 'bg-secondary/10 text-secondary',
  ai: 'bg-warning/10 text-warning',
  logistics: 'bg-success/10 text-success'
};

export function ApiCard({ api, quota, onTest, onToggle, onClick }: ApiCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const registry = API_REGISTRY[api.api_name];
  const IconComponent = registry ? iconMap[registry.icon] || Activity : Activity;
  const status = statusConfig[api.status] || statusConfig.inactive;
  const StatusIcon = status.icon;

  const quotaPercent = quota && quota.quota_limit 
    ? Math.round((quota.quota_used / quota.quota_limit) * 100)
    : null;

  const handleTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTesting(true);
    await onTest(api.api_name);
    setIsTesting(false);
  };

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    await onToggle(api.api_name, checked);
    setIsToggling(false);
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        status.bg
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", categoryColors[api.api_category] || 'bg-muted')}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                {registry?.name || api.api_name}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {registry?.description || 'Integração externa'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", status.color, isTesting && "animate-spin")} />
            <Switch
              checked={api.status === 'active'}
              onCheckedChange={handleToggle}
              disabled={isToggling || isTesting}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", categoryColors[api.api_category])}>
              {api.api_category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {status.label}
            </Badge>
          </div>

          {quotaPercent !== null && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    quotaPercent > 80 ? "bg-destructive" : quotaPercent > 50 ? "bg-amber-500" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {quotaPercent}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || isToggling}
            className="flex-1"
          >
            {isTesting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Activity className="h-3 w-3 mr-1" />
            )}
            Testar
          </Button>
          
          {registry?.docsUrl && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                window.open(registry.docsUrl, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>

        {api.last_checked && (
          <p className="text-xs text-muted-foreground mt-2">
            Última verificação: {new Date(api.last_checked).toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
