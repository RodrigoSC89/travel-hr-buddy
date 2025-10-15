/**
 * MMI Copilot Component - Example Implementation
 * 
 * This is a complete React component demonstrating how to use the
 * MMI Copilot with Resolved Actions API.
 * 
 * Features demonstrated:
 * - Real-time streaming recommendations
 * - Historical actions display
 * - Action recording after maintenance
 * - Error handling
 * - Loading states
 */

import React, { useState, useEffect } from 'react';
import {
  getCopilotRecommendationStreaming,
  getHistoricalActions,
  addResolvedAction,
  type HistoricalAction,
} from '@/services/mmi/copilotApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, CheckCircle, AlertCircle } from 'lucide-react';

export const MMICopilotComponent = () => {
  // State for user input
  const [componente, setComponente] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // State for AI response
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for historical actions
  const [historicalActions, setHistoricalActions] = useState<HistoricalAction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // State for recording action
  const [actionRecorded, setActionRecorded] = useState(false);
  const [recordingAction, setRecordingAction] = useState(false);
  
  // State for errors
  const [error, setError] = useState<string | null>(null);

  // Load historical actions when component changes
  useEffect(() => {
    if (componente) {
      loadHistoricalActions();
    } else {
      setHistoricalActions([]);
    }
  }, [componente]);

  const loadHistoricalActions = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const actions = await getHistoricalActions(componente, 5);
      setHistoricalActions(actions);
    } catch (err) {
      console.error('Error loading historical actions:', err);
      setError('Erro ao carregar histórico de ações');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!prompt.trim()) {
      setError('Por favor, descreva o problema');
      return;
    }

    setIsLoading(true);
    setResponse('');
    setError(null);
    setActionRecorded(false);
    
    try {
      await getCopilotRecommendationStreaming(
        { 
          prompt: prompt.trim(), 
          componente: componente.trim() || undefined 
        },
        (chunk) => {
          setResponse(prev => prev + chunk);
        }
      );
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Erro ao obter recomendação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAction = async () => {
    if (!response) {
      setError('Não há recomendação para registrar');
      return;
    }

    setRecordingAction(true);
    setError(null);
    
    try {
      await addResolvedAction({
        os_id: `OS-${Date.now()}`,
        componente: componente || 'Não especificado',
        descricao_tecnica: prompt,
        acao_realizada: response.substring(0, 500), // Limit length
        efetiva: true, // Assuming successful if being recorded
        resolvido_em: new Date().toISOString(),
      });
      
      setActionRecorded(true);
      
      // Reload historical actions to show the new one
      if (componente) {
        setTimeout(() => loadHistoricalActions(), 1000);
      }
    } catch (err) {
      console.error('Error recording action:', err);
      setError('Erro ao registrar ação. Por favor, tente novamente.');
    } finally {
      setRecordingAction(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError(null);
    setActionRecorded(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">MMI Copilot com Ações Resolvidas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Input */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Análise de Manutenção</CardTitle>
              <CardDescription>
                Descreva o problema e obtenha recomendações baseadas em histórico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="componente">Componente (opcional)</Label>
                <Input
                  id="componente"
                  value={componente}
                  onChange={(e) => setComponente(e.target.value)}
                  placeholder="Ex: Sistema Hidráulico Principal"
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Especificar o componente permite consultar histórico específico
                </p>
              </div>
              
              <div>
                <Label htmlFor="prompt">Descrição do Problema</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva o problema de manutenção em detalhes..."
                  rows={6}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleGetRecommendation}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Obter Recomendação AI'
                  )}
                </Button>
                
                <Button 
                  onClick={handleClear}
                  variant="outline"
                  disabled={isLoading}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Card */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendação AI</CardTitle>
                <CardDescription>
                  Baseada em {historicalActions.length} ações históricas efetivas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
                
                {actionRecorded ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Ação registrada com sucesso! O sistema aprenderá com esta resolução.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button 
                    onClick={handleRecordAction}
                    disabled={recordingAction}
                    variant="secondary"
                    className="w-full"
                  >
                    {recordingAction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Registrar Ação Resolvida
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Historical Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico
              </CardTitle>
              <CardDescription>
                Ações efetivas anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!componente ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Especifique um componente para ver o histórico
                </p>
              ) : loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : historicalActions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma ação histórica encontrada para este componente
                </p>
              ) : (
                <div className="space-y-3">
                  {historicalActions.map((action, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-3 space-y-2 text-sm"
                    >
                      {action.acao_realizada && (
                        <p className="font-medium">
                          {action.acao_realizada}
                        </p>
                      )}
                      
                      {action.causa_confirmada && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Causa:</span> {action.causa_confirmada}
                        </p>
                      )}
                      
                      <div className="flex gap-2 flex-wrap">
                        {action.duracao_execucao && (
                          <Badge variant="secondary">
                            {action.duracao_execucao}
                          </Badge>
                        )}
                        {action.efetiva && (
                          <Badge variant="default" className="bg-green-500">
                            Efetiva
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MMICopilotComponent;
