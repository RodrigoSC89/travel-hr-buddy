import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceSettings from '@/components/voice/VoiceSettings';
import VoiceHistory from '@/components/voice/VoiceHistory';
import VoiceAnalytics from '@/components/voice/VoiceAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Settings, 
  History, 
  BarChart3,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoiceInterface from '@/components/voice/VoiceInterface';

export default function Voice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const handleNavigate = (module: string) => {
    const routes: { [key: string]: string } = {
      'dashboard': '/',
      'analytics': '/analytics',
      'reports': '/reports',
      'settings': '/settings',
      'travel': '/travel',
      'maritime': '/maritime',
      'communication': '/communication',
      'admin': '/admin'
    };
    
    const route = routes[module.toLowerCase()];
    if (route) {
      navigate(route);
    }
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                Assistente de Voz
              </h1>
              <p className="text-muted-foreground mt-2">
                Controle o sistema usando comandos de voz inteligentes
              </p>
            </div>
          </div>

          {/* Voice Status Card */}
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Status do Assistente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isSpeaking ? 'text-destructive' : 'text-success'}`}>
                    {isSpeaking ? 'ATIVO' : 'STANDBY'}
                  </div>
                  <div className="text-sm text-muted-foreground">Status Atual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">97.3%</div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">1.2s</div>
                  <div className="text-sm text-muted-foreground">Tempo Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">247</div>
                  <div className="text-sm text-muted-foreground">Comandos Hoje</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Interface */}
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <div className="grid gap-6">
                <VoiceSettings 
                  isOpen={true}
                  onClose={() => {}}
                />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <VoiceHistory />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-6">
                <VoiceAnalytics 
                  isConnected={!isSpeaking}
                  totalMessages={messages.length}
                  sessionDuration={247}
                  responseTime={1200}
                  connectionQuality="excellent"
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        <VoiceInterface 
          onSpeakingChange={setIsSpeaking}
          onNavigate={handleNavigate}
        />
      </div>
    </SidebarProvider>
  );
}