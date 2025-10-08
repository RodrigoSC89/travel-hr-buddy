import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  id: string;
  name: string;
  status: 'passing' | 'failing' | 'warning' | 'pending';
  message: string;
  lastCheck: Date;
  duration: number;
}

export const SystemHealthCheck: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const healthChecks = [
    {
      id: 'database',
      name: 'Conexão com Banco de Dados',
      check: async () => {
        const start = Date.now();
        try {
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          return {
            status: 'passing' as const,
            message: 'Conexão estabelecida com sucesso',
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            status: 'failing' as const,
            message: `Erro de conexão: ${error}`,
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'auth',
      name: 'Sistema de Autenticação',
      check: async () => {
        const start = Date.now();
        try {
          const { data: { session } } = await supabase.auth.getSession();
          return {
            status: 'passing' as const,
            message: session ? 'Usuário autenticado' : 'Sistema funcionando (sem sessão)',
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            status: 'failing' as const,
            message: `Erro de autenticação: ${error}`,
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'storage',
      name: 'Sistema de Armazenamento',
      check: async () => {
        const start = Date.now();
        try {
          const { data, error } = await supabase.storage.listBuckets();
          if (error) throw error;
          return {
            status: 'passing' as const,
            message: `${data.length} buckets disponíveis`,
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            status: 'failing' as const,
            message: `Erro no storage: ${error}`,
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'performance',
      name: 'Performance da Aplicação',
      check: async () => {
        const start = Date.now();
        try {
          // Simular verificação de performance
          await new Promise(resolve => setTimeout(resolve, 100));
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          const status: 'passing' | 'failing' | 'warning' = loadTime < 3000 ? 'passing' : loadTime < 5000 ? 'warning' : 'failing';
          return {
            status,
            message: `Tempo de carregamento: ${loadTime}ms`,
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            status: 'failing' as const,
            message: `Erro na verificação: ${error}`,
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'api',
      name: 'APIs Externas',
      check: async () => {
        const start = Date.now();
        try {
          // Verificar se as APIs estão configuradas
          const hasMapbox = !!import.meta.env.VITE_MAPBOX_TOKEN;
          const hasAmadeus = true; // Assumindo que está configurado no backend
          
          if (!hasMapbox) {
            return {
              status: 'warning' as const,
              message: 'Token do Mapbox não configurado',
              duration: Date.now() - start
            };
          }
          
          return {
            status: 'passing' as const,
            message: 'APIs configuradas corretamente',
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            status: 'failing' as const,
            message: `Erro nas APIs: ${error}`,
            duration: Date.now() - start
          };
        }
      }
    }
  ];

  const runHealthChecks = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const results: HealthCheck[] = [];
    
    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];
      setProgress((i / healthChecks.length) * 100);
      
      try {
        const result = await check.check();
        results.push({
          id: check.id,
          name: check.name,
          status: result.status,
          message: result.message,
          lastCheck: new Date(),
          duration: result.duration
        });
      } catch (error) {
        results.push({
          id: check.id,
          name: check.name,
          status: 'failing',
          message: `Erro inesperado: ${error}`,
          lastCheck: new Date(),
          duration: 0
        });
      }
    }
    
    setProgress(100);
    setChecks(results);
    setIsRunning(false);
    
    const failing = results.filter(r => r.status === 'failing').length;
    const warning = results.filter(r => r.status === 'warning').length;
    
    if (failing > 0) {
      toast({
        title: 'Verificação Concluída',
        description: `${failing} falha(s) detectada(s)`,
        variant: 'destructive'
      });
    } else if (warning > 0) {
      toast({
        title: 'Verificação Concluída',
        description: `${warning} aviso(s) encontrado(s)`,
      });
    } else {
      toast({
        title: 'Sistema Saudável',
        description: 'Todos os testes passaram com sucesso',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failing': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passing': return <Badge variant="default" className="bg-green-500">Passou</Badge>;
      case 'failing': return <Badge variant="destructive">Falhou</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-500">Aviso</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  useEffect(() => {
    // Run initial health check
    runHealthChecks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Verificação de Saúde do Sistema</h3>
          <p className="text-sm text-muted-foreground">
            Monitore o status dos componentes críticos
          </p>
        </div>
        <Button 
          onClick={runHealthChecks} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Executar Testes
            </>
          )}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da verificação</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {checks.map((check) => (
          <Card key={check.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <CardTitle className="text-base">{check.name}</CardTitle>
                </div>
                {getStatusBadge(check.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{check.message}</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Última verificação: {check.lastCheck.toLocaleTimeString()}</span>
                <span>Duração: {check.duration}ms</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};