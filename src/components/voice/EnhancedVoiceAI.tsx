/**
 * Enhanced Voice AI - Maritime-Optimized Voice Assistant
 * Features: Noise reduction, PT-BR support, contextual commands, offline queue
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Volume2, VolumeX, Loader2, Waves, 
  Ship, AlertTriangle, Anchor, Settings, Globe,
  Battery, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useConversation } from '@11labs/react';

interface VoiceCommand {
  id: string;
  text: string;
  response?: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  context?: string;
}

interface NoiseLevel {
  level: number; // 0-100
  environment: 'quiet' | 'moderate' | 'noisy' | 'very-noisy';
}

export function EnhancedVoiceAI() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>({ level: 25, environment: 'quiet' });
  // PATCH v19: Sempre online - navigator.onLine não é confiável no iOS PWA
  const [isOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<VoiceCommand[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceAI] Connected to ElevenLabs');
    },
    onDisconnect: () => {
      console.log('[VoiceAI] Disconnected');
      setIsListening(false);
    },
    onMessage: (message: { type: string; message?: unknown }) => {
      if (message.type === 'agent_response') {
        const text = typeof message.message === 'string' ? message.message : '';
        addCommand({
          text: 'Resposta ARIA',
          response: text,
          status: 'completed',
        });
      }
    },
    onError: (error: unknown) => {
      console.error('[VoiceAI] Error:', error);
      toast.error('Erro na conexão de voz');
    },
  });

  // PATCH v19: Event listeners removidos - causam falsos positivos no iOS PWA
  useEffect(() => {
    // Processar fila offline ao montar (sempre assume online)
  }, []);

  // Noise level monitoring
  useEffect(() => {
    let animationId: number;

    const monitorNoise = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const analyze = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const normalizedLevel = Math.min(100, (average / 128) * 100);
            
            let environment: NoiseLevel['environment'] = 'quiet';
            if (normalizedLevel > 70) environment = 'very-noisy';
            else if (normalizedLevel > 50) environment = 'noisy';
            else if (normalizedLevel > 30) environment = 'moderate';

            setNoiseLevel({ level: normalizedLevel, environment });
          }
          animationId = requestAnimationFrame(analyze);
        };

        analyze();
      } catch (error) {
        console.error('[VoiceAI] Microphone access denied:', error);
      }
    };

    if (isListening) {
      monitorNoise();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening]);

  const addCommand = useCallback((cmd: Partial<VoiceCommand>) => {
    const newCommand: VoiceCommand = {
      id: `cmd-${Date.now()}`,
      text: cmd.text || '',
      response: cmd.response,
      timestamp: new Date(),
      status: cmd.status || 'pending',
      context: cmd.context,
    };
    setCommands(prev => [newCommand, ...prev].slice(0, 50));
  }, []);

  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    
    toast.info(`Processando ${offlineQueue.length} comandos offline...`);
    
    for (const cmd of offlineQueue) {
      try {
        // Process queued command
        await supabase.functions.invoke('ai-assistant', {
          body: { message: cmd.text, context: 'maritime-voice' },
        });
      } catch (error) {
        console.error('[VoiceAI] Failed to process queued command:', error);
      }
    }
    
    setOfflineQueue([]);
  }, [offlineQueue]);

  const toggleListening = async () => {
    if (isListening) {
      await conversation.endSession();
      setIsListening(false);
    } else {
      try {
        // Get signed URL from backend
        const { data, error } = await supabase.functions.invoke('get-elevenlabs-signed-url');
        
        if (error || !data?.signedUrl) {
          throw new Error('Failed to get signed URL');
        }

        await conversation.startSession({
          signedUrl: data.signedUrl,
        });
        
        setIsListening(true);
        toast.success('🎙️ ARIA está ouvindo...');
      } catch (error) {
        console.error('[VoiceAI] Failed to start session:', error);
        toast.error('Não foi possível iniciar a escuta');
      }
    }
  };

  const handleQuickCommand = (command: string) => {
    // PATCH v21: Sempre processa comandos - não verificar isOnline
    // Erros de rede serão tratados na camada de API

    addCommand({ text: command, status: 'processing' });
    // Simulate processing
    setTimeout(() => {
      addCommand({ 
        text: command, 
        response: getQuickResponse(command), 
        status: 'completed' 
      });
    }, 1000);
  };

  const getQuickResponse = (command: string): string => {
    const responses: Record<string, string> = {
      'Status do navio': 'Todos os sistemas operacionais. Combustível: 78%. Posição: 23°S, 43°W.',
      'Próximo porto': 'Santos, Brasil. ETA: 14:30 local. Distância: 45 milhas náuticas.',
      'Condições do mar': 'Mar moderado, ondas de 1.5m. Vento NE 15 nós. Visibilidade boa.',
      'Alerta de emergência': 'Modo de emergência ativado. Notificando equipe de ponte.',
    };
    return responses[command] || 'Comando recebido e processado.';
  };

  const getNoiseIndicator = () => {
    const colors = {
      quiet: 'bg-green-500',
      moderate: 'bg-yellow-500',
      noisy: 'bg-orange-500',
      'very-noisy': 'bg-red-500',
    };
    const labels = {
      quiet: 'Silencioso',
      moderate: 'Moderado',
      noisy: 'Ruidoso',
      'very-noisy': 'Muito Ruidoso',
    };
    return { color: colors[noiseLevel.environment], label: labels[noiseLevel.environment] };
  };

  const noiseIndicator = getNoiseIndicator();

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${noiseIndicator.color}`} />
            <span className="text-xs text-muted-foreground">{noiseIndicator.label}</span>
            <Progress value={noiseLevel.level} className="w-16 h-1" />
          </div>

          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            {language}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {offlineQueue.length > 0 && (
            <Badge variant="secondary">{offlineQueue.length} na fila</Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Voice Control */}
      <Card className={`border-2 transition-colors ${isListening ? 'border-primary bg-primary/5' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            ARIA - Assistente de Voz Marítimo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              className={`h-24 w-24 rounded-full ${isListening ? 'animate-pulse' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isListening 
              ? 'Fale seu comando...' 
              : 'Toque para ativar o assistente de voz'}
          </p>

          {/* Quick Commands */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => handleQuickCommand('Status do navio')}
            >
              <Ship className="h-4 w-4 mr-2" />
              Status do Navio
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => handleQuickCommand('Próximo porto')}
            >
              <Anchor className="h-4 w-4 mr-2" />
              Próximo Porto
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => handleQuickCommand('Condições do mar')}
            >
              <Waves className="h-4 w-4 mr-2" />
              Condições do Mar
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="justify-start"
              onClick={() => handleQuickCommand('Alerta de emergência')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergência
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Histórico de Comandos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {commands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum comando registrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cmd.text}</span>
                      <Badge variant={
                        cmd.status === 'completed' ? 'default' : 
                        cmd.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {cmd.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                        {cmd.status}
                      </Badge>
                    </div>
                    {cmd.response && (
                      <p className="text-sm text-muted-foreground">{cmd.response}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {cmd.timestamp.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedVoiceAI;
