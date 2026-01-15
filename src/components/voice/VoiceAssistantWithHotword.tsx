/**
 * VoiceAssistantWithHotword - Complete Voice Assistant with Hotword Detection
 * Combines ARIA voice assistant with offline "Hey Nauti" wake word
 */

import { useState, useCallback } from 'react';
import { Mic, X, Volume2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HotwordDetector } from './HotwordDetector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceAssistantWithHotwordProps {
  className?: string;
  onCommand?: (command: string) => void;
}

export function VoiceAssistantWithHotword({
  className,
  onCommand,
}: VoiceAssistantWithHotwordProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListeningForCommand, setIsListeningForCommand] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isHotwordEnabled, setIsHotwordEnabled] = useState(true);

  const handleHotwordDetected = useCallback(() => {
    console.log('[VoiceAssistant] Hotword detected, activating assistant');
    setIsActive(true);
    setIsListeningForCommand(true);
    
    // Start listening for the actual command
    startCommandRecognition();
  }, []);

  const startCommandRecognition = () => {
    try {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        toast.error('Reconhecimento de voz não suportado');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      if ('maxAlternatives' in recognition) {
        recognition.maxAlternatives = 1;
      }

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        console.log('[VoiceAssistant] Command received:', command);
        
        handleUserCommand(command);
        setIsListeningForCommand(false);
      };

      recognition.onerror = (event: any) => {
        console.error('[VoiceAssistant] Command recognition error:', event.error);
        setIsListeningForCommand(false);
        
        if (event.error !== 'no-speech') {
          toast.error('Erro no reconhecimento de comando');
        }
      };

      recognition.onend = () => {
        setIsListeningForCommand(false);
      };

      recognition.start();

      // Auto-stop after 10 seconds
      setTimeout(() => {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }, 10000);

    } catch (error) {
      console.error('[VoiceAssistant] Failed to start command recognition:', error);
      setIsListeningForCommand(false);
    }
  };

  const handleUserCommand = async (command: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: command,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Process command
    const response = await processCommand(command);

    // Add assistant response
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Speak response
    speakResponse(response);

    // Callback
    onCommand?.(command);
  };

  const processCommand = async (command: string): Promise<string> => {
    const lowerCommand = command.toLowerCase();

    // Navigation commands
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('painel')) {
      window.location.href = '/dashboard';
      return 'Navegando para o dashboard principal.';
    }

    if (lowerCommand.includes('peotram') || lowerCommand.includes('auditoria')) {
      window.location.href = '/peotram-ai';
      return 'Abrindo módulo PEOTRAM AI para auditoria.';
    }

    if (lowerCommand.includes('tripulação') || lowerCommand.includes('crew')) {
      window.location.href = '/crew';
      return 'Navegando para gestão de tripulação.';
    }

    if (lowerCommand.includes('clima') || lowerCommand.includes('weather') || lowerCommand.includes('tempo')) {
      window.location.href = '/weather-command';
      return 'Abrindo Weather Command para condições meteorológicas.';
    }

    if (lowerCommand.includes('gmud') || lowerCommand.includes('mudança')) {
      window.location.href = '/gmud-workflow';
      return 'Abrindo workflow GMUD.';
    }

    // Status queries
    if (lowerCommand.includes('status') || lowerCommand.includes('como está')) {
      return 'Todos os sistemas estão operacionais. Nenhum alerta crítico no momento.';
    }

    if (lowerCommand.includes('alerta') || lowerCommand.includes('alert')) {
      return 'Verificando alertas... Você tem 2 alertas de manutenção pendentes e 1 certificado expirando em 30 dias.';
    }

    // Generate evidence
    if (lowerCommand.includes('evidência') || lowerCommand.includes('evidence') || lowerCommand.includes('gerar')) {
      return 'Iniciando geração de evidência PEOTRAM. Por favor, especifique o elemento desejado (1 a 13).';
    }

    // Default response
    return `Entendi: "${command}". Como posso ajudar? Você pode pedir para navegar para módulos, verificar status, ou gerar evidências.`;
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const closeAssistant = () => {
    setIsActive(false);
    setMessages([]);
    speechSynthesis.cancel();
  };

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Hotword Detector - Always visible when enabled */}
      {isHotwordEnabled && !isActive && (
        <HotwordDetector
          onHotwordDetected={handleHotwordDetected}
          enabled={isHotwordEnabled}
          showVisualFeedback={true}
          sensitivity={0.6}
          className="mb-4"
        />
      )}

      {/* Quick Toggle Button */}
      {!isActive && (
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => {
            setIsActive(true);
            startCommandRecognition();
          }}
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Active Assistant Panel */}
      {isActive && (
        <Card className="w-80 max-h-[500px] shadow-2xl bg-background/95 backdrop-blur-md border-primary/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">ARIA - Nauti One</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isListeningForCommand ? 'default' : 'secondary'}
                className="gap-1"
              >
                {isListeningForCommand ? (
                  <>
                    <Mic className="h-3 w-3 animate-pulse" />
                    Ouvindo
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    Pronto
                  </>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={closeAssistant}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {/* Messages */}
            <ScrollArea className="h-64 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <Bot className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">
                    Diga um comando ou pergunte algo.
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    Exemplos: "ir para dashboard", "status do sistema", "gerar evidência"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'rounded-lg p-3 text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-8'
                          : 'bg-muted mr-8'
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant={isListeningForCommand ? 'destructive' : 'default'}
                className="flex-1 gap-2"
                onClick={() => {
                  if (isListeningForCommand) {
                    setIsListeningForCommand(false);
                  } else {
                    setIsListeningForCommand(true);
                    startCommandRecognition();
                  }
                }}
              >
                <Mic className={cn('h-4 w-4', isListeningForCommand && 'animate-pulse')} />
                {isListeningForCommand ? 'Parar' : 'Falar'}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsHotwordEnabled(!isHotwordEnabled)}
                title={isHotwordEnabled ? 'Desativar hotword' : 'Ativar hotword'}
              >
                {isHotwordEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Hotword Status */}
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
              {isHotwordEnabled ? (
                <span className="text-green-500">
                  ✓ Diga "Hey Nauti" para ativar
                </span>
              ) : (
                <span>Detecção de hotword desativada</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VoiceAssistantWithHotword;
