/**
 * Circuit Breaker Monitoring Dashboard
 * 
 * Real-time visualization of all circuit breaker states.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAllCircuitBreakers } from '@/hooks/use-circuit-breaker';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stateConfig = {
  CLOSED: {
    icon: ShieldCheck,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    label: 'Fechado',
    description: 'Operando normalmente',
  },
  OPEN: {
    icon: ShieldAlert,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    label: 'Aberto',
    description: 'Falhas detectadas, bloqueando requisições',
  },
  HALF_OPEN: {
    icon: ShieldQuestion,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    label: 'Semi-Aberto',
    description: 'Testando recuperação',
  },
};

interface CircuitCardProps {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  totalRequests: number;
  totalFailures: number;
  lastFailure: Date | null;
}

const CircuitCard: React.FC<CircuitCardProps> = ({
  name,
  state,
  failures,
  totalRequests,
  totalFailures,
  lastFailure,
}) => {
  const config = stateConfig[state];
  const Icon = config.icon;
  const successRate = totalRequests > 0 
    ? Math.round(((totalRequests - totalFailures) / totalRequests) * 100) 
    : 100;

  return (
    <Card className={cn('transition-all', config.bgColor, config.borderColor)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className={cn('h-4 w-4', config.color)} />
            {name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(config.color, config.borderColor)}
          >
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Taxa de Sucesso</span>
          <span className={cn(
            successRate >= 95 ? 'text-success' : 
            successRate >= 80 ? 'text-warning' : 'text-destructive'
          )}>
            {successRate}%
          </span>
        </div>
        <Progress 
          value={successRate} 
          className={cn('h-1.5', successRate < 80 && 'bg-destructive/20')}
        />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Requisições:</span>
            <span>{totalRequests}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Falhas:</span>
            <span className={failures > 0 ? 'text-red-500' : ''}>
              {failures}/{totalFailures}
            </span>
          </div>
        </div>

        {lastFailure && (
          <div className="text-xs text-muted-foreground">
            Última falha: {new Date(lastFailure).toLocaleTimeString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CircuitBreakerDashboard: React.FC = () => {
  const { circuits, resetAll, hasOpenCircuits } = useAllCircuitBreakers();

  const tierGroups = {
    'Tier 1 - Críticas': ['supabase', 'lovable-ai', 'gemini', 'gpt'],
    'Tier 2 - Importantes': ['stripe', 'docusign', 'marine-traffic', 'stormglass'],
    'Tier 3 - Auxiliares': ['elevenlabs', 'mapbox', 'twilio'],
  };

  const getCircuitsByTier = (tier: string[]) => {
    return circuits.filter(c => tier.includes(c.name));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Circuit Breakers
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de resiliência das APIs externas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasOpenCircuits && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Circuitos Abertos
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar Todos
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {circuits.filter(c => c.metrics.state === 'CLOSED').length}
                </p>
                <p className="text-xs text-muted-foreground">Fechados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {circuits.filter(c => c.metrics.state === 'HALF_OPEN').length}
                </p>
                <p className="text-xs text-muted-foreground">Semi-Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {circuits.filter(c => c.metrics.state === 'OPEN').length}
                </p>
                <p className="text-xs text-muted-foreground">Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Groups */}
      {Object.entries(tierGroups).map(([tierName, tierServices]) => {
        const tierCircuits = getCircuitsByTier(tierServices);
        if (tierCircuits.length === 0) return null;

        return (
          <div key={tierName}>
            <h3 className="text-lg font-semibold mb-3">{tierName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tierCircuits.map(circuit => (
                <CircuitCard
                  key={circuit.name}
                  name={circuit.name}
                  state={circuit.metrics.state}
                  failures={circuit.metrics.failures}
                  successes={circuit.metrics.successes}
                  totalRequests={circuit.metrics.totalRequests}
                  totalFailures={circuit.metrics.totalFailures}
                  lastFailure={circuit.metrics.lastFailure}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CircuitBreakerDashboard;
