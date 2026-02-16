/**
 * PEOTRAM Voice Button Component
 * Floating voice assistant for operational procedures
 * Positioned to avoid overlap with GlobalAIAssistant and FloatingActionButton
 */
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePEOTRAMVoice } from '@/hooks/use-peotram-voice';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function PEOTRAMVoiceButton() {
  const { t } = useTranslation();
  const { 
    isListening, 
    isProcessing, 
    isSpeaking,
    transcript,
    response,
    startListening, 
    stopListening,
    stopSpeaking,
    reset
  } = usePEOTRAMVoice();
  
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else if (!isProcessing) {
      startListening();
    }
  };
  
  return (
    <div className="fixed bottom-24 right-20 z-50 md:bottom-6 flex flex-col items-end gap-2">
      {/* Transcript/Response Bubble */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="max-w-xs bg-card border border-border rounded-xl p-3 shadow-xl"
          >
            {transcript && (
              <div className="mb-2">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">
                  {t('peotram.youSaid', '🎤 Você disse:')}
                </p>
                <p className="text-xs text-foreground">{transcript}</p>
              </div>
            )}
            {response && (
              <div>
                <p className="text-[10px] text-primary font-medium mb-0.5">
                  {t('peotram.aiResponse', '🧠 PEOTRAM AI:')}
                </p>
                <p className="text-xs text-foreground leading-relaxed">{response}</p>
              </div>
            )}
            {(transcript || response) && (
              <button
                onClick={reset}
                className="text-[10px] text-muted-foreground hover:text-foreground mt-1.5 underline"
              >
                Limpar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Voice Button */}
      <div className="flex flex-col items-center gap-1">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleClick}
            size="lg"
            aria-label={
              isListening ? 'Parar de ouvir' : 
              isSpeaking ? 'Parar fala' : 
              'Comando de voz'
            }
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
              isListening && "bg-destructive hover:bg-destructive/90 animate-pulse",
              isSpeaking && "bg-success hover:bg-success/90",
              isProcessing && "bg-warning hover:bg-warning/90",
              !isListening && !isSpeaking && !isProcessing && "bg-accent hover:bg-accent/90"
            )}
            disabled={isProcessing}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
        
        {/* Status Text - only show when active */}
        {(isListening || isProcessing || isSpeaking) && (
          <p className="text-[10px] text-muted-foreground text-center whitespace-nowrap">
            {isListening && '🎤 Ouvindo...'}
            {isProcessing && '🤔 Processando...'}
            {isSpeaking && '🔊 Falando...'}
          </p>
        )}
      </div>
    </div>
  );
}
