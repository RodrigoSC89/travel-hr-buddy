import React, { useState, useEffect } from 'react';
import { PeotramAuditManager } from '@/components/peotram/peotram-audit-manager';
import ModuleActionButton from '@/components/ui/module-action-button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Award,
  Globe,
  Clock,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react';

const PEOTRAM = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-warning/5 to-info/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-warning/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-info/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-warning via-warning/90 to-warning-glow p-8 text-warning-foreground mb-8
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-info/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-warning/20 backdrop-blur-sm animate-pulse-glow">
                <FileCheck className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  PEOTRAM - Gestão Ambiental
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Programa de Excelência Operacional em Trabalho Ambiental Marítimo
                  <Crown className="inline-block w-6 h-6 ml-2 text-primary animate-bounce" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Sistema de gestão ambiental para operações marítimas com foco em conformidade 
              ambiental, gerenciamento de resíduos e proteção dos ecossistemas marinhos.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Gestão Ambiental</span>
              </div>
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Conformidade Ambiental</span>
              </div>
              <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Proteção Marinha</span>
              </div>
            </div>
          </div>
        </div>

        {/* PEOTRAM Manager */}
        <PeotramAuditManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peotram"
        moduleName="PEOTRAM"
        moduleIcon={<FileCheck className="h-4 w-4" />}
        actions={[
          {
            id: 'new-audit',
            label: 'Nova Auditoria',
            icon: <Plus className="h-4 w-4" />,
            action: () => console.log('Nova auditoria'),
            variant: 'default'
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => console.log('Relatórios'),
            variant: 'outline'
          },
          {
            id: 'compliance',
            label: 'Conformidade',
            icon: <Shield className="h-4 w-4" />,
            action: () => console.log('Conformidade'),
            variant: 'outline'
          },
          {
            id: 'ai-analysis',
            label: 'Análise IA',
            icon: <Brain className="h-4 w-4" />,
            action: () => console.log('Análise IA'),
            variant: 'outline'
          }
        ]}
        quickActions={[
          {
            id: 'refresh',
            label: 'Atualizar',
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: 'F5'
          },
          {
            id: 'export',
            label: 'Exportar',
            icon: <Download className="h-3 w-3" />,
            action: () => console.log('Exportar')
          }
        ]}
      />
    </div>
  );
};

export default PEOTRAM;