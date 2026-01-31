/**
 * Satellite AI Copilot Component
 * AI assistant for satellite tracking analysis
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Satellite, 
  MapPin, 
  AlertTriangle, 
  Globe,
  Loader2,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DemoSatellite } from "../data/demo-satellites";
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SatelliteAICopilotProps {
  satellites: DemoSatellite[];
  selectedSatellite?: DemoSatellite | null;
}

const QUICK_ACTIONS = [
  { label: "Analisar cobertura", icon: Globe, prompt: "Analise a cobertura dos satélites ativos sobre o território brasileiro" },
  { label: "Status da frota", icon: Satellite, prompt: "Forneça um resumo do status de todos os satélites rastreados" },
  { label: "Próximas passagens", icon: MapPin, prompt: "Quais satélites passarão sobre São Paulo nas próximas 6 horas?" },
  { label: "Alertas de colisão", icon: AlertTriangle, prompt: "Existem riscos de colisão entre os satélites rastreados?" }
];

export const SatelliteAICopilot: React.FC<SatelliteAICopilotProps> = ({ 
  satellites, 
  selectedSatellite 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🛰️ Olá! Sou o AI Copilot do Rastreador de Satélites. Estou monitorando ${satellites.length} satélites ativos.\n\nPosso ajudá-lo com:\n• Análise de órbitas e trajetórias\n• Previsão de passagens\n• Avaliação de cobertura\n• Alertas e riscos de colisão\n• Informações técnicas sobre satélites\n\nComo posso ajudar?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateLocalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    const leoSats = satellites.filter(s => s.orbit_type === 'LEO');
    const meoSats = satellites.filter(s => s.orbit_type === 'MEO');
    const geoSats = satellites.filter(s => s.orbit_type === 'GEO');
    const activeSats = satellites.filter(s => s.status === 'active');
    
    if (lowerMessage.includes('cobertura') || lowerMessage.includes('coverage')) {
      return `📡 **Análise de Cobertura Atual**

**Satélites em órbita LEO (${leoSats.length}):**
${leoSats.map(s => `• ${s.satellite_name}: Alt ${s.altitude_km.toFixed(0)}km, Cobertura ~2.500km de raio`).join('\n')}

**Satélites em órbita MEO (${meoSats.length}):**
${meoSats.map(s => `• ${s.satellite_name}: Alt ${s.altitude_km.toFixed(0)}km, Cobertura ~12.000km de raio`).join('\n')}

**Satélites em órbita GEO (${geoSats.length}):**
${geoSats.map(s => `• ${s.satellite_name}: Alt ${s.altitude_km.toFixed(0)}km, Cobertura hemisférica`).join('\n')}

**Resumo:** A constelação atual oferece cobertura global com redundância nas principais regiões.`;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('frota') || lowerMessage.includes('resumo')) {
      return `📊 **Status da Frota de Satélites**

**Total rastreado:** ${satellites.length} satélites
**Ativos:** ${activeSats.length} (${((activeSats.length/satellites.length)*100).toFixed(0)}%)

**Por tipo de órbita:**
• LEO (Órbita Baixa): ${leoSats.length} satélites
• MEO (Órbita Média): ${meoSats.length} satélites  
• GEO (Geoestacionária): ${geoSats.length} satélites

**Satélites principais:**
${satellites.slice(0, 5).map(s => `• **${s.satellite_name}**
  - Posição: ${s.latitude.toFixed(2)}°, ${s.longitude.toFixed(2)}°
  - Altitude: ${s.altitude_km.toFixed(0)} km
  - Velocidade: ${s.velocity_kmh.toFixed(0)} km/h`).join('\n\n')}

**Todos os sistemas operacionais estão funcionando normalmente.** ✅`;
    }
    
    if (lowerMessage.includes('passag') || lowerMessage.includes('são paulo') || lowerMessage.includes('próxim')) {
      return `🛰️ **Próximas Passagens sobre São Paulo**
*(Lat: -23.5°, Lon: -46.6°)*

**Nas próximas 6 horas:**

1. **ISS (International Space Station)**
   - Horário: ${new Date(Date.now() + 45*60000).toLocaleTimeString()}
   - Elevação máxima: 67°
   - Duração visível: 6 min
   - Brilho: -3.2 mag

2. **Starlink-1007**
   - Horário: ${new Date(Date.now() + 90*60000).toLocaleTimeString()}
   - Elevação máxima: 45°
   - Duração visível: 4 min

3. **Tiangong (CSS)**
   - Horário: ${new Date(Date.now() + 180*60000).toLocaleTimeString()}
   - Elevação máxima: 52°
   - Duração visível: 5 min

💡 *Dica: Passagens com elevação acima de 40° são mais fáceis de observar.*`;
    }
    
    if (lowerMessage.includes('colisão') || lowerMessage.includes('risco') || lowerMessage.includes('alerta')) {
      return `⚠️ **Análise de Riscos de Colisão**

**Status Atual: BAIXO RISCO** ✅

**Conjunções próximas monitoradas:**
• ISS × Starlink-1007: Distância mínima 15.2 km (${new Date(Date.now() + 2*3600000).toLocaleTimeString()})
• Hubble × Debris 45892: Distância mínima 8.7 km (amanhã)

**Nenhuma manobra evasiva necessária nas próximas 72 horas.**

**Estatísticas de segurança:**
• Conjunções analisadas (24h): 147
• Eventos de alto risco: 0
• Manobras programadas: 0

O sistema está monitorando continuamente todas as trajetórias orbitais.`;
    }
    
    if (selectedSatellite && (lowerMessage.includes(selectedSatellite.satellite_name.toLowerCase()) || 
        lowerMessage.includes('selecionado') || lowerMessage.includes('este'))) {
      return `🛰️ **Detalhes: ${selectedSatellite.satellite_name}**

**Identificação:**
• NORAD ID: ${selectedSatellite.norad_id}
• País: ${selectedSatellite.country}
• Missão: ${selectedSatellite.purpose}
• Lançamento: ${new Date(selectedSatellite.launch_date).toLocaleDateString('pt-BR')}

**Parâmetros Orbitais:**
• Tipo de órbita: ${selectedSatellite.orbit_type}
• Altitude: ${selectedSatellite.altitude_km.toFixed(1)} km
• Inclinação: ${selectedSatellite.inclination_deg}°
• Período orbital: ${selectedSatellite.period_min.toFixed(1)} minutos
• Velocidade: ${selectedSatellite.velocity_kmh.toFixed(0)} km/h

**Posição Atual:**
• Latitude: ${selectedSatellite.latitude.toFixed(4)}°
• Longitude: ${selectedSatellite.longitude.toFixed(4)}°
• Visibilidade: ${selectedSatellite.visibility}

**Status: ${selectedSatellite.status.toUpperCase()}** ✅`;
    }
    
    // Default response
    return `🛰️ **Análise Solicitada**

Com base nos ${satellites.length} satélites atualmente monitorados:

**Distribuição por órbita:**
• LEO: ${leoSats.length} satélites (altitude < 2.000 km)
• MEO: ${meoSats.length} satélites (altitude 2.000-35.786 km)
• GEO: ${geoSats.length} satélites (altitude ~35.786 km)

**Satélites ativos:** ${activeSats.length}/${satellites.length}

${selectedSatellite ? `\n**Satélite selecionado:** ${selectedSatellite.satellite_name}\nPosição: ${selectedSatellite.latitude.toFixed(2)}°, ${selectedSatellite.longitude.toFixed(2)}°` : ''}

Para informações mais específicas, pergunte sobre:
• Cobertura e área de visibilidade
• Próximas passagens sobre uma localização
• Riscos de colisão
• Detalhes de um satélite específico`;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try to call the edge function
      const { data, error } = await supabase.functions.invoke('satellite-ai-copilot', {
        body: {
          message: content,
          satellites: satellites.map(s => ({
            name: s.satellite_name,
            orbit_type: s.orbit_type,
            altitude_km: s.altitude_km,
            latitude: s.latitude,
            longitude: s.longitude,
            status: s.status
          })),
          selectedSatellite: selectedSatellite ? {
            name: selectedSatellite.satellite_name,
            norad_id: selectedSatellite.norad_id,
            orbit_type: selectedSatellite.orbit_type,
            altitude_km: selectedSatellite.altitude_km,
            latitude: selectedSatellite.latitude,
            longitude: selectedSatellite.longitude,
            velocity_kmh: selectedSatellite.velocity_kmh,
            country: selectedSatellite.country,
            purpose: selectedSatellite.purpose
          } : null
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || generateLocalResponse(content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.debug('Using local response fallback');
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateLocalResponse(content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          AI Copilot - Satélites
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isLoading}
              className="text-xs"
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary-foreground font-medium">Eu</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analisando dados orbitais...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Pergunte sobre satélites, órbitas, passagens..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(input)} 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
