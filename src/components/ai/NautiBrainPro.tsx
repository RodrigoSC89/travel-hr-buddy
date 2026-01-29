/**
 * Nauti Brain Pro - Chat Avançado com Streaming
 * Interface de IA com renderização token-by-token
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Trash2, Bot, User, Sparkles, Mic, Volume2 } from 'lucide-react';
import { useNautiBrainStream } from '@/hooks/use-nauti-brain-stream';
import { useVoiceAssistantPro } from '@/hooks/use-voice-assistant-pro';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export function NautiBrainPro() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    cancelStream, 
    clearMessages 
  } = useNautiBrainStream({
    onError: (err) => console.error('[NautiBrainPro] Error:', err),
  });

  const {
    speak,
    stop,
    isSpeaking,
    isLoading: isSpeakingLoading,
  } = useVoiceAssistantPro({
    voiceType: 'professional',
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Nauti Brain Pro
                <Sparkles className="w-4 h-4 text-amber-500" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Gemini 3 Flash • Streaming
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {messages.length} mensagens
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea 
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          className="flex-1 px-4"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Olá! Sou o Nauti Brain</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Seu assistente especializado em operações marítimas. 
                Pergunte sobre tripulação, manutenção, compliance, segurança e muito mais.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {[
                  'Status da frota',
                  'Certificados vencendo',
                  'Próximas manutenções',
                  'Compliance MLC',
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {message.role === 'assistant' ? (
                      <>
                        <AvatarImage src="/nauti-brain-avatar.png" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {/* TTS Button for assistant messages */}
                    {message.role === 'assistant' && message.content && !message.isStreaming && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 mt-2"
                        onClick={() => handleSpeak(message.content)}
                        disabled={isSpeakingLoading}
                      >
                        {isSpeaking ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled
              title="Voice input (em breve)"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre operações marítimas..."
              disabled={isLoading}
              className="flex-1"
            />
            {isLoading ? (
              <Button type="button" variant="destructive" onClick={cancelStream}>
                Cancelar
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default NautiBrainPro;
