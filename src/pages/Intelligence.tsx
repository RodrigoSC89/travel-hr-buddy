import React from 'react';
import { IntelligentNotificationCenter } from '@/components/intelligence/IntelligentNotificationCenter';
import { AdvancedAIAssistant } from '@/components/innovation/AdvancedAIAssistant';
import PersonalizedRecommendations from '@/components/intelligence/PersonalizedRecommendations';
import DocumentProcessor from '@/components/intelligence/DocumentProcessor';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Bell, FileText, Sparkles } from 'lucide-react';

const Intelligence = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Inteligência Artificial</h1>
              <p className="text-muted-foreground">
                Central de IA com assistente avançado, notificações inteligentes e processamento automático
              </p>
            </div>
          </div>

          <Tabs defaultValue="assistant" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Assistente
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Sugestões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assistant">
              <AdvancedAIAssistant />
            </TabsContent>

            <TabsContent value="notifications">
              <IntelligentNotificationCenter />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentProcessor />
            </TabsContent>

            <TabsContent value="recommendations">
              <PersonalizedRecommendations />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Intelligence;