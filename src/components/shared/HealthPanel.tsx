/**
 * NAUTI ONE — System Health Panel
 * Real health checks for Supabase services
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, Server, HardDrive, Radio,
  RefreshCw, CheckCircle, XCircle, Clock, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'checking' | 'unknown';
  latency?: number;
  lastChecked?: Date;
  error?: string;
}

export function HealthPanel() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database (PostgreSQL)', status: 'unknown' },
    { name: 'Edge Functions', status: 'unknown' },
    { name: 'Storage', status: 'unknown' },
    { name: 'Authentication', status: 'unknown' },
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const updatedServices: ServiceStatus[] = [];

    // 1. Database check
    try {
      const start = performance.now();
      const { error } = await supabase.from('vessels').select('id').limit(1);
      const latency = Math.round(performance.now() - start);
      updatedServices.push({
        name: 'Database (PostgreSQL)',
        status: error ? 'degraded' : 'healthy',
        latency,
        lastChecked: new Date(),
        error: error?.message,
      });
    } catch (err) {
      updatedServices.push({
        name: 'Database (PostgreSQL)',
        status: 'down',
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : 'Connection failed',
      });
    }

    // 2. Edge Functions check
    try {
      const start = performance.now();
      const { error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt: 'health-check', module: 'system' },
      });
      const latency = Math.round(performance.now() - start);
      updatedServices.push({
        name: 'Edge Functions',
        status: error ? 'degraded' : 'healthy',
        latency,
        lastChecked: new Date(),
        error: error?.message,
      });
    } catch {
      updatedServices.push({
        name: 'Edge Functions',
        status: 'degraded',
        lastChecked: new Date(),
        error: 'Edge function unavailable (may not be deployed)',
      });
    }

    // 3. Storage check
    try {
      const start = performance.now();
      const { error } = await supabase.storage.listBuckets();
      const latency = Math.round(performance.now() - start);
      updatedServices.push({
        name: 'Storage',
        status: error ? 'degraded' : 'healthy',
        latency,
        lastChecked: new Date(),
        error: error?.message,
      });
    } catch (err) {
      updatedServices.push({
        name: 'Storage',
        status: 'down',
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : 'Storage unavailable',
      });
    }

    // 4. Auth check
    try {
      const start = performance.now();
      const { data } = await supabase.auth.getSession();
      const latency = Math.round(performance.now() - start);
      updatedServices.push({
        name: 'Authentication',
        status: data.session ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date(),
        error: data.session ? undefined : 'No active session',
      });
    } catch (err) {
      updatedServices.push({
        name: 'Authentication',
        status: 'down',
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : 'Auth unavailable',
      });
    }

    setServices(updatedServices);
    setIsChecking(false);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'degraded': return <Clock className="h-5 w-5 text-accent-foreground" />;
      case 'down': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'checking': return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-primary/10 text-primary border-primary/20">Healthy</Badge>;
      case 'degraded': return <Badge className="bg-accent text-accent-foreground border-accent/50">Degraded</Badge>;
      case 'down': return <Badge variant="destructive">Down</Badge>;
      case 'checking': return <Badge variant="outline">Checking...</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Database')) return <Database className="h-5 w-5 text-muted-foreground" />;
    if (name.includes('Edge')) return <Server className="h-5 w-5 text-muted-foreground" />;
    if (name.includes('Storage')) return <HardDrive className="h-5 w-5 text-muted-foreground" />;
    if (name.includes('Auth')) return <Radio className="h-5 w-5 text-muted-foreground" />;
    return <Server className="h-5 w-5 text-muted-foreground" />;
  };

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const overallStatus = healthyCount === services.length ? 'healthy' : 
                        healthyCount > 0 ? 'degraded' : 'down';

  return (
    <Card data-testid="health-panel">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Health Panel</CardTitle>
          {services[0]?.status !== 'unknown' && getStatusBadge(overallStatus)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isChecking}
          data-testid="btn-health-check"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Testar Conexão'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {getServiceIcon(service.name)}
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  {service.error && (
                    <p className="text-xs text-muted-foreground">{service.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {service.latency !== undefined && (
                  <span className="text-xs text-muted-foreground">{service.latency}ms</span>
                )}
                {getStatusIcon(service.status)}
              </div>
            </div>
          ))}
        </div>
        {services[0]?.lastChecked && (
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Última verificação: {services[0].lastChecked.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
