/**
 * PEOTRAM Voice Button Component v2
 * Floating voice assistant with text fallback
 * Works even when Web Speech API is unavailable (e.g., iframes)
 */
import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Send, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePEOTRAMVoice } from '@/hooks/use-peotram-voice';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PEOTRAMVoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const { 
    isListening, 
    isProcessing, 
    isSpeaking,
    transcript,
    response,
    error,
    speechSupported,
    startListening, 
    stopListening,
    stopSpeaking,
    processText,
    reset
  } = usePEOTRAMVoice();

  const handleToggle = () => {
    if (isOpen) {
      reset();
      setTextInput('');
    }
    setIsOpen(prev => !prev);
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else if (!isProcessing) {
      startListening();
    }
  };

  const handleTextSubmit = () => {
    const text = textInput.trim();
    if (!text || isProcessing) return;
    processText(text);
    setTextInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTextSubmit();
  };

  const isActive = isListening || isProcessing || isSpeaking;

  return (
    <div className="fixed bottom-24 right-20 z-50 md:bottom-6 flex flex-col items-end gap-2">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border/50">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Nauti Voice Assistant
              </span>
              <button onClick={handleToggle} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {/* Status Messages */}
              {isListening && (
                <div className="flex items-center gap-2 text-xs text-destructive animate-pulse">
                  <MicOff className="h-3.5 w-3.5" />
                  🎤 Ouvindo... fale agora
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processando sua pergunta...
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Volume2 className="h-3.5 w-3.5" />
                  🔊 Reproduzindo resposta...
                  <button onClick={stopSpeaking} className="ml-auto text-muted-foreground hover:text-foreground">
                    <VolumeX className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Você disse:</p>
                  <p className="text-xs text-foreground">{transcript}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-2">
                  <p className="text-[10px] text-primary font-medium mb-0.5">🧠 Nauti AI:</p>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{response}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Empty state */}
              {!isActive && !transcript && !response && !error && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {speechSupported 
                    ? 'Clique no 🎤 para falar ou digite sua pergunta abaixo'
                    : 'Digite sua pergunta abaixo para o assistente Nauti AI'
                  }
                </p>
              )}
            </div>

            {/* Input Area */}
            <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-2">
              {/* Text input */}
              <div className="flex gap-1.5">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua pergunta..."
                  disabled={isProcessing}
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Voice + Reset buttons */}
              <div className="flex gap-1.5">
                {speechSupported && (
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={handleVoiceClick}
                    disabled={isProcessing}
                    className="h-7 text-[10px] flex-1"
                  >
                    {isListening ? (
                      <><MicOff className="h-3 w-3 mr-1" /> Parar</>
                    ) : (
                      <><Mic className="h-3 w-3 mr-1" /> Falar</>
                    )}
                  </Button>
                )}
                {(transcript || response) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { reset(); setTextInput(''); }}
                    className="h-7 text-[10px]"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleToggle}
          size="lg"
          aria-label="Assistente de voz Nauti"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
            isOpen && "bg-destructive hover:bg-destructive/90",
            isActive && !isOpen && "bg-primary hover:bg-primary/90 animate-pulse",
            !isOpen && !isActive && "bg-accent hover:bg-accent/90"
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : isActive ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
