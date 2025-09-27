import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Mic, 
  MicOff, 
  Zap, 
  MessageSquare, 
  Search, 
  Phone, 
  Settings,
  Plus,
  FileText,
  BarChart3,
  Users,
  AlertTriangle,
  Camera,
  Upload,
  Download,
  Brain,
  Compass,
  Navigation,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { FloatingActionButton } from '@/components/ui/reusable-floating-action-button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecording, useTextToSpeech, useAIChat } from '@/hooks/use-voice-conversation';

const FloatingActionButtons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  
  // Voice hooks
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();
  const { isSpeaking, speak, stopSpeaking } = useTextToSpeech();
  const { isThinking, sendMessage } = useAIChat();

  const handleVoiceCommand = async () => {
    try {
      console.log('Floating Action: Voice Command clicked');
      if (isRecording) {
        // Stop recording and process
        toast({
          title: "🎙️ Processando comando...",
          description: "Analisando seu comando de voz",
        });

        const transcribedText = await stopRecording();
        
        if (transcribedText) {
          toast({
            title: "✅ Comando reconhecido",
            description: `"${transcribedText}"`,
          });

          // Process voice command
          await processVoiceCommand(transcribedText);
        } else {
          toast({
            title: "❌ Erro",
            description: "Não foi possível processar o áudio",
            variant: "destructive"
          });
        }
      } else {
        // Start recording
        await startRecording();
        toast({
          title: "🎤 Comando de Voz Ativado",
          description: "Fale agora... Diga 'Abrir PEOTRAM', 'Mostrar relatórios', etc.",
        });
      }
    } catch (error) {
      console.error('Voice command error:', error);
      toast({
        title: "❌ Erro no comando de voz",
        description: error instanceof Error ? error.message : "Verifique as permissões do microfone",
        variant: "destructive"
      });
    }
  };

  const processVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('peotram') || lowerCommand.includes('auditoria')) {
      navigate('/peotram');
      await speak('Abrindo módulo PEOTRAM de auditorias marítimas');
    } else if (lowerCommand.includes('frota') || lowerCommand.includes('embarcaç')) {
      navigate('/fleet-dashboard');
      await speak('Abrindo painel de gestão da frota');
    } else if (lowerCommand.includes('relatório') || lowerCommand.includes('analytics')) {
      navigate('/advanced-analytics');
      await speak('Abrindo centro de relatórios e analytics');
    } else if (lowerCommand.includes('documento') || lowerCommand.includes('scanner')) {
      navigate('/advanced-documents');
      await speak('Abrindo scanner inteligente de documentos');
    } else if (lowerCommand.includes('marítim') || lowerCommand.includes('navegação')) {
      navigate('/maritime');
      await speak('Abrindo centro de operações marítimas');
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('painel')) {
      navigate('/');
      await speak('Voltando ao dashboard principal');
    } else {
      // If no specific navigation, use AI to respond
      const context = 'Sistema Nautilus One - Dashboard principal com módulos PEOTRAM, frota, analytics, documentos e operações marítimas';
      const aiResponse = await sendMessage(command, context);
      await speak(aiResponse);
    }
  };

  const handleAIAssistant = async () => {
    try {
      console.log('Floating Action: AI Assistant clicked');
      if (conversationMode) {
        // Turn off conversation mode
        setConversationMode(false);
        if (isSpeaking) stopSpeaking();
        
        toast({
          title: "🤖 Modo Conversa Desativado",
          description: "Assistente IA em modo texto",
        });
      } else {
        // Turn on conversation mode
        setConversationMode(true);
        
        toast({
          title: "🚀 IA Nautilus Ativada",
          description: "Modo conversa ativado - Use o microfone para falar comigo",
        });

        // Welcome message
        await speak('Olá! Sou o Nautilus IA, seu assistente marítimo inteligente. Como posso ajudá-lo hoje?');
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao ativar assistente IA",
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = (action: string, path?: string) => {
    console.log('🎯 Quick action triggered:', action);
    switch (action) {
      case 'search':
        toast({
          title: "🔍 Busca Global",
          description: "Ativando busca inteligente no sistema",
        });
        // Focus on search input if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          // Try to find and focus any search element
          const searchBox = document.querySelector('[data-search], .search-input, #search-box') as HTMLInputElement;
          if (searchBox) searchBox.focus();
        }
        break;
      case 'emergency':
        toast({
          title: "🚨 Protocolo de Emergência",
          description: "Ativando protocolos de segurança marítima",
          variant: "destructive"
        });
        // Navigate to emergency or create emergency alert
        navigate('/emergency-alerts');
        break;
      case 'reports':
        toast({
          title: "📊 Centro de Relatórios",
          description: "Acessando analytics e Business Intelligence",
        });
        navigate('/advanced-analytics');
        break;
      case 'scan':
        toast({
          title: "📱 Scanner IA Ativado",
          description: "Pronto para análise inteligente de documentos",
        });
        navigate('/advanced-documents');
        break;
      case 'navigation':
        toast({
          title: "🧭 Centro de Navegação",
          description: "Abrindo sistema de navegação marítima",
        });
        navigate('/maritime');
        break;
      default:
        if (path) {
          navigate(path);
        } else {
          toast({
            title: "ℹ️ Ação não implementada",
            description: `A ação "${action}" será implementada em breve`,
          });
        }
    }
  };

  const quickActions = [
    { icon: Search, label: 'Busca Global', action: 'search', color: 'bg-azure-700 hover:bg-azure-800' },
    { icon: AlertTriangle, label: 'Emergência', action: 'emergency', color: 'bg-azure-700 hover:bg-azure-800' },
    { icon: BarChart3, label: 'Relatórios', action: 'reports', color: 'bg-azure-700 hover:bg-azure-800' },
    { icon: Camera, label: 'Scanner IA', action: 'scan', color: 'bg-azure-700 hover:bg-azure-800' },
    { icon: Compass, label: 'Navegação', action: 'navigation', color: 'bg-azure-700 hover:bg-azure-800' },
  ];

  // Auto-handle conversation mode
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (conversationMode && !isRecording && !isProcessing && !isSpeaking && !isThinking) {
      // Auto-start listening after 2 seconds in conversation mode
      timeout = setTimeout(() => {
        handleVoiceCommand();
      }, 2000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [conversationMode, isRecording, isProcessing, isSpeaking, isThinking]);

  const getVoiceButtonStatus = () => {
    if (isProcessing) return { icon: Loader2, color: 'bg-yellow-500', label: 'Processando...', spinning: true };
    if (isRecording) return { icon: MicOff, color: 'bg-red-500 animate-pulse', label: 'Gravando - Clique para parar', spinning: false };
    return { icon: Mic, color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700', label: 'Comando de Voz', spinning: false };
  };

  const getAIButtonStatus = () => {
    if (isThinking) return { icon: Loader2, color: 'bg-yellow-500', label: 'Pensando...', spinning: true };
    if (isSpeaking) return { icon: VolumeX, color: 'bg-orange-500 hover:bg-orange-600', label: 'Falando - Clique para parar', spinning: false };
    if (conversationMode) return { icon: MessageSquare, color: 'bg-green-500 hover:bg-green-600', label: 'Modo Conversa Ativo', spinning: false };
    return { icon: Brain, color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700', label: 'IA Nautilus Assistant', spinning: false };
  };

  const voiceStatus = getVoiceButtonStatus();
  const aiStatus = getAIButtonStatus();

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
        {/* Quick Actions Menu */}
        {isExpanded && (
          <div className="absolute bottom-20 right-0 space-y-3 animate-fade-in">
            {quickActions.map((item, index) => (
              <FloatingActionButton
                key={index}
                icon={item.icon}
                onClick={() => handleQuickAction(item.action)}
                label={item.label}
                bgColor={`${item.color}`}
                iconColor="text-azure-50"
                size="md"
                className="w-14 h-14 animate-slide-in-right pointer-events-auto"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-4">
          {/* Voice Command Button */}
          <FloatingActionButton
            icon={voiceStatus.icon}
            onClick={handleVoiceCommand}
            label={voiceStatus.label}
            bgColor={`${voiceStatus.color}`}
            iconColor="text-azure-50"
            size="lg"
            ariaLabel={voiceStatus.label}
            spinning={voiceStatus.spinning}
            disabled={isProcessing}
            className="w-16 h-16 pointer-events-auto"
          />

          {/* AI Assistant Button */}
          <FloatingActionButton
            icon={aiStatus.icon}
            onClick={isSpeaking ? stopSpeaking : handleAIAssistant}
            label={aiStatus.label}
            bgColor={`${aiStatus.color}`}
            iconColor="text-azure-50"
            size="lg"
            ariaLabel={aiStatus.label}
            spinning={aiStatus.spinning}
            disabled={isThinking}
            className="w-16 h-16 pointer-events-auto"
          />

          {/* Quick Actions Menu Toggle */}
          <FloatingActionButton
            icon={Plus}
            onClick={() => setIsExpanded(!isExpanded)}
            label={isExpanded ? 'Fechar Menu' : 'Ações Rápidas'}
            bgColor={isExpanded ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'}
            iconColor="text-azure-50"
            size="lg"
            ariaLabel={isExpanded ? 'Fechar Menu' : 'Ações Rápidas'}
            className={isExpanded ? 'w-16 h-16 rotate-45' : 'w-16 h-16'}
          />
        </div>

        {/* Status Indicators */}
        {(isRecording || isProcessing || isSpeaking || isThinking || conversationMode) && (
          <div className="absolute -top-20 right-0 z-[9999] animate-bounce-in">
            <Card className={`${
              isRecording ? 'bg-red-500' :
              isProcessing ? 'bg-yellow-500' :
              isSpeaking ? 'bg-green-500' :
              isThinking ? 'bg-purple-500' :
              'bg-blue-500'
            } text-azure-50 border-0`}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-azure-100 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {isRecording ? 'Ouvindo...' :
                   isProcessing ? 'Processando...' :
                   isSpeaking ? 'Falando...' :
                   isThinking ? 'Pensando...' :
                   'Modo Conversa'}
                </span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FloatingActionButtons;