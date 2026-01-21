/**
 * PEOTRAM Voice Button Component
 * Floating voice assistant for operational procedures
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
    <div className="fixed bottom-24 right-4 z-50 md:bottom-8 flex flex-col items-end gap-3">
      {/* Transcript/Response Bubble */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="max-w-xs bg-card border border-border rounded-xl p-4 shadow-xl"
          >
            {transcript && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  {t('peotram.youSaid', 'Você disse:')}
                </p>
                <p className="text-sm text-foreground">{transcript}</p>
              </div>
            )}
            {response && (
              <div>
                <p className="text-xs text-primary font-medium mb-1">
                  {t('peotram.aiResponse', 'PEOTRAM AI:')}
                </p>
                <p className="text-sm text-foreground">{response}</p>
              </div>
            )}
            {(transcript || response) && (
              <button
                onClick={reset}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
              >
                Limpar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Voice Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleClick}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
            isListening && "bg-red-500 hover:bg-red-600 animate-pulse",
            isSpeaking && "bg-green-500 hover:bg-green-600",
            isProcessing && "bg-amber-500 hover:bg-amber-600",
            !isListening && !isSpeaking && !isProcessing && "bg-primary hover:bg-primary/90"
          )}
          disabled={isProcessing}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : isSpeaking ? (
            <VolumeX className="h-6 w-6" />
          ) : isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </motion.div>
      
      {/* Status Text */}
      <p className="text-xs text-muted-foreground text-center">
        {isListening && t('peotram.listening', '🎤 Ouvindo...')}
        {isProcessing && t('peotram.processing', '🤔 Processando...')}
        {isSpeaking && t('peotram.speaking', '🔊 Falando...')}
        {!isListening && !isProcessing && !isSpeaking && t('peotram.clickToSpeak', 'Clique para falar')}
      </p>
    </div>
  );
}
