import React, { useState } from 'react';
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
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const FloatingActionButtons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simular reconhecimento de voz
      toast({
        title: "🎤 Comando de Voz Ativado",
        description: "Diga um comando: 'Abrir PEOTRAM', 'Mostrar relatórios', 'Status da frota'...",
      });
      
      // Simular processamento após 3 segundos
      setTimeout(() => {
        setIsListening(false);
        toast({
          title: "✅ Comando Processado",
          description: "Navegando para o módulo solicitado...",
        });
      }, 3000);
    } else {
      toast({
        title: "🔇 Comando de Voz Desativado",
        description: "Reconhecimento de voz interrompido",
      });
    }
  };

  const handleAIAssistant = () => {
    toast({
      title: "🚀 IA Nautilus Ativada",
      description: "Assistente inteligente pronto para ajudar com análises e insights",
    });
    navigate('/ai-assistant');
  };

  const handleQuickAction = (action: string, path?: string) => {
    switch (action) {
      case 'search':
        toast({
          title: "🔍 Busca Global",
          description: "Ativando busca inteligente no sistema",
        });
        break;
      case 'emergency':
        toast({
          title: "🚨 Emergência",
          description: "Protocolo de emergência ativado",
          variant: "destructive"
        });
        navigate('/emergency-alerts');
        break;
      case 'reports':
        toast({
          title: "📊 Relatórios",
          description: "Acessando centro de relatórios",
        });
        navigate('/reports');
        break;
      case 'scan':
        toast({
          title: "📱 Scanner IA",
          description: "Ativando scanner inteligente de documentos",
        });
        navigate('/advanced-documents');
        break;
      case 'navigation':
        toast({
          title: "🧭 Navegação",
          description: "Abrindo sistema de navegação marítima",
        });
        navigate('/maritime');
        break;
      default:
        if (path) navigate(path);
    }
  };

  const quickActions = [
    { icon: Search, label: 'Busca Global', action: 'search', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: AlertTriangle, label: 'Emergência', action: 'emergency', color: 'bg-red-500 hover:bg-red-600' },
    { icon: BarChart3, label: 'Relatórios', action: 'reports', color: 'bg-green-500 hover:bg-green-600' },
    { icon: Camera, label: 'Scanner IA', action: 'scan', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: Compass, label: 'Navegação', action: 'navigation', color: 'bg-cyan-500 hover:bg-cyan-600' },
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Quick Actions Menu */}
        {isExpanded && (
          <div className="absolute bottom-20 right-0 space-y-3 animate-fade-in">
            {quickActions.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    className={`${item.color} text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full w-14 h-14 animate-slide-in-right`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleQuickAction(item.action)}
                  >
                    <item.icon className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-black text-white">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-4">
          {/* Voice Command Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className={`${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                } text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full w-16 h-16`}
                onClick={handleVoiceCommand}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black text-white">
              <p>{isListening ? 'Parar Comando de Voz' : 'Comando de Voz'}</p>
            </TooltipContent>
          </Tooltip>

          {/* AI Assistant Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full w-16 h-16"
                onClick={handleAIAssistant}
              >
                <Brain className="w-8 h-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black text-white">
              <p>IA Nautilus Assistant</p>
            </TooltipContent>
          </Tooltip>

          {/* Quick Actions Menu Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className={`${
                  isExpanded
                    ? 'bg-orange-500 hover:bg-orange-600 rotate-45'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                } text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full w-16 h-16`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Plus className="w-8 h-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black text-white">
              <p>{isExpanded ? 'Fechar Menu' : 'Ações Rápidas'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Voice Status Indicator */}
        {isListening && (
          <div className="absolute -top-16 right-0 animate-bounce-in">
            <Card className="bg-red-500 text-white border-red-400">
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Ouvindo...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FloatingActionButtons;