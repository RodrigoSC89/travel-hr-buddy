/**
 * Global AI Button - Floating AI Access
 * Botão flutuante para acesso rápido a qualquer IA
 * PATCH AI-TRAINING v2.0
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Sparkles, 
  ChevronUp,
  MessageSquare,
  Mic,
  MicOff,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AI_MODULES, type AIModuleKey } from '@/lib/ai-prompts';
import { unifiedAI } from '@/lib/ai/unified-ai-service';
import { UniversalAIChat } from './UniversalAIChat';
import type { SpeechRecognition as SpeechRecognitionType, SpeechRecognitionEvent } from "@/types/speech-recognition";

interface GlobalAIButtonProps {
  className?: string;
  defaultModule?: AIModuleKey;
}

// Semantic color mapping using CSS variables
const getModuleColorClass = (color: string) => {
  const semanticMap: Record<string, string> = {
    emerald: 'bg-success',
    green: 'bg-success',
    blue: 'bg-primary',
    purple: 'bg-accent',
    pink: 'bg-accent',
    orange: 'bg-warning',
    red: 'bg-destructive',
    indigo: 'bg-primary',
    cyan: 'bg-info',
    teal: 'bg-info',
    sky: 'bg-info',
    amber: 'bg-warning',
    lime: 'bg-success',
    violet: 'bg-accent',
    slate: 'bg-muted-foreground',
    rose: 'bg-destructive'
  };
  return semanticMap[color] || 'bg-primary';
};

export function GlobalAIButton({ className, defaultModule = 'command' }: GlobalAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AIModuleKey>(defaultModule);
  const [chatOpen, setChatOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  // Voice recognition handler
  const handleVoiceInput = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.lang = 'pt-BR';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("🎤 Ouvindo... Fale sua pergunta");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuickInput(transcript);
      toast.success(`Capturado: "${transcript}"`);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error("Erro no reconhecimento de voz");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, [isListening]);

  const modules = Object.entries(AI_MODULES).slice(0, 8).map(([key, config]) => ({
    key: key as AIModuleKey,
    ...config
  }));

  const handleQuickSubmit = useCallback(async () => {
    if (!quickInput.trim()) return;
    
    const bestModule = await unifiedAI.findBestModule(quickInput);
    setSelectedModule(bestModule);
    setChatOpen(true);
    setIsOpen(false);
  }, [quickInput]);

  const handleModuleSelect = (module: AIModuleKey) => {
    setSelectedModule(module);
    setChatOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            className={cn(
              'w-14 h-14 rounded-full',
              'bg-gradient-to-r from-purple-600 to-blue-600',
              'flex items-center justify-center shadow-lg',
              'hover:shadow-xl hover:scale-105 transition-all',
              className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="bot"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  className="relative"
                >
                  <Bot className="h-6 w-6 text-white" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </PopoverTrigger>

        <PopoverContent 
          side="top" 
          align="end" 
          className="w-80 p-0 mb-2"
          sideOffset={8}
        >
          <div className="p-4 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Nautilus AI Hub</span>
            </div>
            
            {/* Quick Input */}
            <div className="relative">
              <Input
                placeholder="Pergunte qualquer coisa..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickSubmit()}
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <Button 
                  size="icon" 
                  variant={isListening ? "destructive" : "ghost"} 
                  className={`h-7 w-7 ${isListening ? 'animate-pulse' : ''}`}
                  onClick={handleVoiceInput}
                  title={isListening ? "Parar gravação" : "Falar"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={handleQuickSubmit}
                  disabled={!quickInput.trim()}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Access Modules */}
          <ScrollArea className="h-[280px]">
            <div className="p-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                IAs Especializadas
              </div>
              {modules.map((module) => (
                <motion.button
                  key={module.key}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg',
                    'hover:bg-muted transition-colors text-left'
                  )}
                  onClick={() => handleModuleSelect(module.key)}
                  whileHover={{ x: 4 }}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white',
                    getModuleColorClass(module.color)
                  )}>
                    <span className="text-sm">{module.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{module.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {module.description}
                    </div>
                  </div>
                </motion.button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/ai-hub';
                }}
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Ver todas as {Object.keys(AI_MODULES).length} IAs
              </Button>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-3xl h-[80vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{AI_MODULES[selectedModule].name}</DialogTitle>
          </DialogHeader>
          <UniversalAIChat
            module={selectedModule}
            welcomeMessage={`Olá! Sou o **${AI_MODULES[selectedModule].name}** - ${AI_MODULES[selectedModule].description}.\n\n${quickInput ? `Você perguntou: "${quickInput}"\n\nDeixe-me processar sua solicitação...` : 'Como posso ajudar você hoje?'}`}
            className="h-full border-0 rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalAIButton;
