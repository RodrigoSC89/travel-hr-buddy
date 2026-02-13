/**
 * ConversationalInput Component
 * Natural language command input with AI processing
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseIntent, getSuggestedActions } from './AIIntentParser';
import { stripHtml } from '@/lib/validation/sanitize';
import type { ParsedIntent, VoiceState } from './types';

interface ConversationalInputProps {
  onSubmit: (query: string, intent: ParsedIntent) => void;
  onNavigate?: (route: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
}

export function ConversationalInput({ 
  onSubmit, 
  onNavigate,
  isProcessing = false,
  placeholder = "Digite um comando ou pergunta..."
}: ConversationalInputProps) {
  const [query, setQuery] = useState('');
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SpeechRecognition API not typed
  const recognitionRef = useRef<any>(null);

  // Parse intent as user types
  useEffect(() => {
    if (query.length > 2) {
      const parsed = parseIntent(query);
      setIntent(parsed);
    } else {
      setIntent(null);
    }
  }, [query]);

  // Initialize speech recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API not in standard TS types
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setVoiceState(s => ({ ...s, transcript }));
        setQuery(transcript);
      };

      recognitionRef.current.onend = () => {
        setVoiceState(s => ({ ...s, isListening: false }));
      };

      recognitionRef.current.onerror = (event: Event) => {
      };
    }
  }, []);

  const toggleVoice = () => {
    if (voiceState.isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setVoiceState(s => ({ ...s, isListening: true, transcript: '' }));
    }
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Sanitize and validate input
    const sanitizedQuery = stripHtml(query.trim());
    if (!sanitizedQuery || sanitizedQuery.length < 1 || sanitizedQuery.length > 500 || isProcessing) {
      return;
    }

    const finalIntent = parseIntent(sanitizedQuery);
    onSubmit(sanitizedQuery, finalIntent);

    // Auto-navigate if high confidence
    if (finalIntent.suggestedRoute && finalIntent.confidence > 0.8 && onNavigate) {
      onNavigate(finalIntent.suggestedRoute);
    }

    setQuery('');
    setIntent(null);
  }, [query, isProcessing, onSubmit, onNavigate]);

  const suggestions = intent ? getSuggestedActions(intent) : [];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        {/* Main input */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-4 py-6 bg-background/60 backdrop-blur-md border-border/50 focus:border-primary/50"
              disabled={isProcessing}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => { setQuery(''); setIntent(null); }}
                aria-label="Limpar busca" title="Limpar"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Voice button */}
          <Button
            type="button"
            variant={voiceState.isListening ? 'default' : 'outline'}
            size="icon"
            className="shrink-0"
            onClick={toggleVoice}
            disabled={!recognitionRef.current}
            aria-label={voiceState.isListening ? "Parar gravação" : "Iniciar gravação de voz"} title="Voz"
          >
            {voiceState.isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          
          {/* Submit button */}
          <Button 
            type="submit" 
            size="icon"
            className="shrink-0"
            disabled={!query.trim() || isProcessing}
            aria-label="Enviar comando" title="Enviar"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Intent preview */}
        <AnimatePresence>
          {intent && intent.type !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 z-10"
            >
              <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>Intenção detectada:</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {intent.type}
                  </span>
                  <span className="ml-auto">
                    {Math.round(intent.confidence * 100)}% confiança
                  </span>
                </div>
                
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if (action.type === 'navigate' && onNavigate) {
                            onNavigate(action.target);
                            setQuery('');
                            setIntent(null);
                          }
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Voice indicator */}
      <AnimatePresence>
        {voiceState.isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-2 flex items-center gap-2 text-sm text-primary"
          >
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            Ouvindo... {voiceState.transcript && `"${voiceState.transcript}"`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
