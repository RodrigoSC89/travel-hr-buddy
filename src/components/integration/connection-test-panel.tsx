import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabaseManager } from '@/lib/supabase-manager';
import { apiManager } from '@/lib/api-manager';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Database, 
  Globe, 
  AlertCircle 
} from 'lucide-react';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

export const ConnectionTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const testSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    try {
      const isHealthy = await supabaseManager.healthCheck();
      
      const result: TestResult = {
        name: 'Supabase',
        success: isHealthy,
        message: isHealthy 
          ? 'Conexão com Supabase estabelecida com sucesso'
          : 'Falha na conexão com Supabase',
        timestamp: new Date(),
      };
      
      setResults((prev) => [result, ...prev]);
    } catch (error) {
      const result: TestResult = {
        name: 'Supabase',
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      };
      setResults((prev) => [result, ...prev]);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const testAPIConnection = async () => {
    setIsTestingAPI(true);
    try {
      const isHealthy = await apiManager.healthCheck();
      
      const result: TestResult = {
        name: 'API Externa',
        success: isHealthy,
        message: isHealthy 
          ? 'API externa respondendo normalmente'
          : 'API externa não está respondendo',
        timestamp: new Date(),
      };
      
      setResults((prev) => [result, ...prev]);
    } catch (error) {
      const result: TestResult = {
        name: 'API Externa',
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      };
      setResults((prev) => [result, ...prev]);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const testWithRetry = async () => {
    setIsTestingSupabase(true);
    try {
      await supabaseManager.executeWithRetry(async () => {
        const { data, error } = await supabaseManager
          .getClient()
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return data;
      });
      
      const result: TestResult = {
        name: 'Supabase com Retry',
        success: true,
        message: 'Operação com retry executada com sucesso',
        timestamp: new Date(),
      };
      
      setResults((prev) => [result, ...prev]);
    } catch (error) {
      const result: TestResult = {
        name: 'Supabase com Retry',
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      };
      setResults((prev) => [result, ...prev]);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexões</CardTitle>
          <CardDescription>
            Teste a conectividade com Supabase, APIs externas e retry logic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={testSupabaseConnection}
              disabled={isTestingSupabase}
              className="flex items-center gap-2"
            >
              {isTestingSupabase ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Testar Supabase
            </Button>

            <Button
              variant="outline"
              onClick={testAPIConnection}
              disabled={isTestingAPI}
              className="flex items-center gap-2"
            >
              {isTestingAPI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              Testar API
            </Button>

            <Button
              variant="outline"
              onClick={testWithRetry}
              disabled={isTestingSupabase}
              className="flex items-center gap-2"
            >
              {isTestingSupabase ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Testar com Retry
            </Button>
          </div>

          {results.length > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearResults}>
                Limpar Resultados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((result, index) => (
              <Alert
                key={index}
                variant={result.success ? 'default' : 'destructive'}
                className="flex items-start gap-3"
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{result.name}</p>
                    <Badge variant={result.success ? 'outline' : 'destructive'}>
                      {result.success ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </div>
                  <AlertDescription>{result.message}</AlertDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
