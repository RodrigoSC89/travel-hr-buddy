/**
 * AI Mega-Hub - Inteligência Artificial Unificada
 * Rota canônica: /ai
 * 
 * Consolida: AI Control Tower + Enterprise Intelligence + AI Modules + Voice
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Bot, Zap, Mic, BarChart3, Eye, FileText, Cpu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load sub-components
const AIControlTowerHub = lazy(() => import('@/pages/AIControlTowerHubEnhanced'));
const AICommandCenter = lazy(() => import('@/pages/AICommandCenter'));
const AutonomousCommandCenter = lazy(() => import('@/pages/AutonomousCommandCenter'));
const WorkflowCommandCenter = lazy(() => import('@/pages/WorkflowCommandCenter'));
const VoiceAssistant = lazy(() => import('@/pages/VoiceAssistant'));
const AIModulesHubPage = lazy(() => import('@/pages/ai/AIModulesHubPage'));
const RAGAssistantPage = lazy(() => import('@/pages/enterprise/RAGAssistantPage'));
const OCRCenterPage = lazy(() => import('@/pages/enterprise/OCRCenterPage'));
const AIAnalyticsDashboard = lazy(() => import('@/pages/AIAnalyticsDashboard'));
const AIObservabilityDashboard = lazy(() => import('@/pages/AIObservabilityDashboard'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabConfig = [
  { id: 'hub', label: 'AI Hub', icon: Brain },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: Zap },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'modules', label: '11 Modules', icon: Cpu },
  { id: 'rag', label: 'RAG', icon: FileText },
  { id: 'ocr', label: 'OCR', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'observability', label: 'Observability', icon: Eye },
];

export default function AIMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hub';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Hub</h1>
                <p className="text-sm text-muted-foreground">Inteligência Artificial Unificada</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              MEGA-HUB D
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="hub" className="mt-0">
              <AIControlTowerHub />
            </TabsContent>
            
            <TabsContent value="chat" className="mt-0">
              <AICommandCenter />
            </TabsContent>
            
            <TabsContent value="agents" className="mt-0">
              <AutonomousCommandCenter />
            </TabsContent>
            
            <TabsContent value="workflows" className="mt-0">
              <WorkflowCommandCenter />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-0">
              <VoiceAssistant />
            </TabsContent>
            
            <TabsContent value="modules" className="mt-0">
              <AIModulesHubPage />
            </TabsContent>
            
            <TabsContent value="rag" className="mt-0">
              <RAGAssistantPage />
            </TabsContent>
            
            <TabsContent value="ocr" className="mt-0">
              <OCRCenterPage />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <AIAnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="observability" className="mt-0">
              <AIObservabilityDashboard />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
