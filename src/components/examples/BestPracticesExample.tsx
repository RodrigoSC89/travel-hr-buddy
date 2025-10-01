/**
 * 🎯 Exemplo de Componente com Todas as Melhores Práticas
 * 
 * Este componente demonstra o uso correto de todos os utilitários
 * e hooks implementados para resolver os problemas críticos do sistema.
 * 
 * Use este arquivo como referência ao criar novos componentes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, LoadingOverlay, ProgressBar } from '@/components/ui/loading-states';
import { useEventListener, useInterval } from '@/hooks/use-event-listener';
import { logError, logWarning } from '@/utils/errorLogger';
import { withRetry, supabaseWithRetry } from '@/utils/apiRetry';
import { showSuccess, showError, showWarning, toastManager } from '@/utils/toastManager';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Save } from 'lucide-react';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

/**
 * ✅ BOAS PRÁTICAS IMPLEMENTADAS:
 * 
 * 1. Error Logging ao invés de console.error
 * 2. Toast notifications para feedback
 * 3. Loading states claros
 * 4. Retry automático em operações críticas
 * 5. Event listeners com cleanup
 * 6. useCallback para funções
 * 7. Tratamento robusto de erros
 */
export const BestPracticesExample: React.FC = () => {
  // ✅ Estado local
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inputValue, setInputValue] = useState('');

  // ✅ Carregamento inicial de dados
  useEffect(() => {
    loadData();
  }, []);

  // ✅ Auto-refresh a cada 30 segundos usando hook seguro
  useInterval(() => {
    if (!isLoading) {
      refreshData();
    }
  }, 30000);

  // ✅ Event listener para teclas com cleanup automático
  useEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  });

  /**
   * ✅ Função de carregamento com todas as boas práticas
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // ✅ Uso de retry automático para operações críticas
      const { data: fetchedData, error } = await supabaseWithRetry(
        () => supabase
          .from('example_table')
          .select('*')
          .limit(10),
        {
          maxRetries: 3,
          delayMs: 1000,
          onRetry: (attempt) => {
            logWarning(`Tentativa ${attempt} de carregar dados`, 'BestPracticesExample');
          }
        }
      );

      if (error) {
        throw error;
      }

      if (fetchedData) {
        setData(fetchedData as DataItem[]);
        // ✅ Toast de sucesso para feedback
        showSuccess('Dados carregados com sucesso');
      }
    } catch (error) {
      // ✅ Log de erro ao invés de console.error
      logError('Erro ao carregar dados', error, 'BestPracticesExample');
      
      // ✅ Toast de erro com ação de retry
      showError('Erro ao carregar dados', {
        description: 'Clique para tentar novamente',
        action: {
          label: 'Retry',
          onClick: loadData
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ Refresh silencioso (sem loading overlay)
   */
  const refreshData = useCallback(async () => {
    try {
      const { data: fetchedData, error } = await supabase
        .from('example_table')
        .select('*')
        .limit(10);

      if (error) throw error;

      if (fetchedData) {
        setData(fetchedData as DataItem[]);
        logWarning('Dados atualizados automaticamente', 'BestPracticesExample');
      }
    } catch (error) {
      // Erro silencioso, apenas log
      logError('Erro no refresh automático', error, 'BestPracticesExample');
    }
  }, []);

  /**
   * ✅ Salvamento com toast promise
   */
  const handleSave = useCallback(async () => {
    if (!inputValue.trim()) {
      showWarning('Preencha o campo antes de salvar');
      return;
    }

    setIsSaving(true);

    // ✅ Toast promise para operações assíncronas
    await toastManager.promise(
      saveData(),
      {
        loading: 'Salvando dados...',
        success: 'Dados salvos com sucesso!',
        error: 'Erro ao salvar dados'
      }
    );

    setIsSaving(false);
  }, [inputValue]);

  /**
   * ✅ Função de salvamento com retry
   */
  const saveData = async () => {
    try {
      const newItem = {
        name: inputValue,
        value: Math.random() * 100,
      };

      const { error } = await withRetry(
        () => supabase
          .from('example_table')
          .insert([newItem]),
        { maxRetries: 2 }
      );

      if (error) throw error;

      // Limpar input após salvar
      setInputValue('');
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      logError('Erro ao salvar dados', error, 'BestPracticesExample');
      throw error; // Re-throw para o toast promise pegar
    }
  };

  /**
   * ✅ Upload simulado com progresso
   */
  const handleUpload = useCallback(async () => {
    const toastId = showWarning('Iniciando upload...');
    setUploadProgress(0);

    try {
      // Simular upload com progresso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      toastManager.updateToSuccess(toastId, 'Upload concluído!');
    } catch (error) {
      logError('Erro no upload', error, 'BestPracticesExample');
      toastManager.updateToError(toastId, 'Erro no upload');
    } finally {
      setUploadProgress(0);
    }
  }, []);

  // ✅ Loading overlay durante carregamento inicial
  if (isLoading && data.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <LoadingSpinner size="lg" text="Carregando dados..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo de Boas Práticas</CardTitle>
      </CardHeader>
      
      {/* ✅ Loading overlay sobre conteúdo existente */}
      <LoadingOverlay isLoading={isLoading && data.length > 0} text="Atualizando...">
        <CardContent className="space-y-4">
          {/* Input com salvamento */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite algo..."
              disabled={isSaving}
            />
            <Button
              onClick={handleSave}
              disabled={isSaving || !inputValue.trim()}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar (Ctrl+S)
                </>
              )}
            </Button>
          </div>

          {/* Barra de progresso de upload */}
          {uploadProgress > 0 && (
            <ProgressBar progress={uploadProgress} showPercentage />
          )}

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleUpload} variant="outline">
              Upload Simulado
            </Button>
          </div>

          {/* Lista de dados */}
          <div className="space-y-2">
            <h3 className="font-semibold">Dados ({data.length} itens):</h3>
            {data.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-muted rounded-lg flex justify-between"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">
                  {item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Informações sobre auto-refresh */}
          <div className="text-sm text-muted-foreground">
            <p>✅ Auto-refresh ativo (a cada 30 segundos)</p>
            <p>✅ Atalho Ctrl+S para salvar</p>
            <p>✅ Retry automático em falhas</p>
          </div>
        </CardContent>
      </LoadingOverlay>
    </Card>
  );
};
