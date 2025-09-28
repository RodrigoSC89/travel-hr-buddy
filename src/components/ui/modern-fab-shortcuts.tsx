import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Search, 
  Settings, 
  Bot, 
  Phone, 
  MessageSquare, 
  Navigation,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemActions } from '@/hooks/use-system-actions';
import { useSidebarActions } from '@/hooks/use-sidebar-actions';
import { useVoiceNavigation } from '@/hooks/use-voice-navigation';

interface ModernFabShortcutsProps {
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onActivateVoice?: () => void;
  onOpenAIChat?: () => void;
}

// Declaração de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ModernFabShortcuts: React.FC<ModernFabShortcutsProps> = ({
  onOpenSearch,
  onOpenSettings,
  onActivateVoice,
  onOpenAIChat
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis] = useState(window.speechSynthesis);
  const { toast } = useToast();
  const { handleGlobalSearch, handleNavigateToSettings } = useSystemActions();
  const { handleModuleAccess } = useSidebarActions();
  const { processVoiceCommand } = useVoiceNavigation();

  // Configurar reconhecimento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "🎤 Escutando...",
          description: "Fale agora seu comando para o Nautilus One"
        });
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        toast({
          title: "❌ Erro no reconhecimento",
          description: "Tente novamente ou verifique as permissões do microfone",
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceCommand = async (transcript: string) => {
    try {
      const result = processVoiceCommand(transcript);
      
      if (result.success) {
        // Feedback por voz
        const response = `Navegando para ${result.intent?.module || 'módulo solicitado'}`;
        speak(response);
        
        toast({
          title: "✅ Comando executado",
          description: `"${transcript}" - ${response}`
        });
      } else {
        speak("Comando não reconhecido. Tente novamente.");
        toast({
          title: "⚠️ Comando não reconhecido", 
          description: "Tente comandos como: 'abrir viagens', 'ir para dashboard', 'mostrar relatórios'",
          variant: "destructive"
        });
      }
    } catch (error) {
      speak("Erro ao processar comando");
      toast({
        title: "❌ Erro",
        description: "Falha ao processar comando de voz",
        variant: "destructive"
      });
    }
  };

  const speak = (text: string) => {
    if (synthesis) {
      synthesis.cancel(); // Cancelar qualquer fala anterior
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesis.speak(utterance);
    }
  };

  const startVoiceRecognition = () => {
    if (recognition) {
      recognition.start();
      onActivateVoice?.();
    } else {
      toast({
        title: "❌ Não suportado",
        description: "Reconhecimento de voz não disponível neste navegador",
        variant: "destructive"
      });
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const shortcuts = [
    {
      id: 'voice',
      icon: isListening ? MicOff : Mic,
      label: isListening ? 'Parar escuta' : 'Comando de voz',
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      action: isListening ? () => recognition?.stop() : startVoiceRecognition,
      pulse: isListening,
      ariaLabel: 'Ativar comando de voz'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Busca avançada',
      color: 'bg-gradient-to-r from-azure-500 to-azure-600 hover:from-azure-600 hover:to-azure-700',
      action: () => {
        handleGlobalSearch();
        onOpenSearch?.();
      },
      ariaLabel: 'Abrir busca global'
    },
    {
      id: 'ai-chat',
      icon: MessageSquare,
      label: 'Chat IA',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      action: () => {
        handleModuleAccess('ai-insights');
        onOpenAIChat?.();
      },
      ariaLabel: 'Abrir assistente de IA'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Configurações',
      color: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
      action: () => {
        handleNavigateToSettings();
        onOpenSettings?.();
      },
      ariaLabel: 'Abrir configurações do sistema'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-auto">
      {/* Status de voz */}
      {(isListening || isSpeaking) && (
        <Card className="mb-4 shadow-xl border-azure-200 animate-slide-in-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isListening && (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Escutando...</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => recognition?.stop()}
                    className="ml-2"
                  >
                    <MicOff className="w-3 h-3" />
                  </Button>
                </>
              )}
              {isSpeaking && (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Falando...</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopSpeaking}
                    className="ml-2"
                  >
                    <VolumeX className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões expandidos */}
      {isExpanded && (
        <div className="mb-4 space-y-3 animate-slide-in-up">
          {shortcuts.map((shortcut, index) => (
            <Button
              key={shortcut.id}
              onClick={() => {
                shortcut.action();
                setIsExpanded(false);
              }}
              className={`
                w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform
                ${shortcut.color}
                ${shortcut.pulse ? 'animate-pulse' : 'hover:scale-110'}
                focus:ring-4 focus:ring-azure-500/50 focus:outline-none
                flex items-center justify-center group
              `}
              style={{ 
                animationDelay: `${index * 100}ms`,
                transform: `translateY(${isExpanded ? 0 : 20}px)`
              }}
              aria-label={shortcut.ariaLabel}
              title={shortcut.label}
            >
              <shortcut.icon className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
              
              {/* Tooltip */}
              <div className="absolute right-16 px-3 py-1 bg-black/80 text-white text-xs rounded-md 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                              pointer-events-none whitespace-nowrap">
                {shortcut.label}
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Botão principal */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-16 h-16 rounded-full shadow-xl transition-all duration-300 transform
          bg-gradient-to-r from-azure-600 to-azure-700 hover:from-azure-700 hover:to-azure-800
          ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110'}
          focus:ring-4 focus:ring-azure-500/50 focus:outline-none
          flex items-center justify-center group
        `}
        aria-label={isExpanded ? 'Fechar atalhos' : 'Abrir atalhos rápidos'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <Minimize2 className="w-8 h-8 text-white transition-transform" />
        ) : (
          <Navigation className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
        )}
      </Button>

      {/* Indicador de status */}
      <div className="absolute -top-2 -right-2">
        {(isListening || isSpeaking) && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernFabShortcuts;