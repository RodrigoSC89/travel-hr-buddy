import React, { useState, useEffect } from 'react';
import { IntelligentChecklistManager } from '@/components/checklists/intelligent-checklist-manager';
import ModuleActionButton from '@/components/ui/module-action-button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  CheckCircle,
  Settings,
  BarChart3,
  Plus,
  FileText,
  RefreshCw,
  Download
} from 'lucide-react';

const ChecklistsInteligentes = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: ClipboardCheck, label: "Checklists Ativos", value: "24", color: "primary" },
    { icon: CheckCircle, label: "Completados Hoje", value: "18", color: "success" },
    { icon: Settings, label: "Em Andamento", value: "6", color: "warning" },
    { icon: BarChart3, label: "Taxa de Sucesso", value: "96%", color: "info" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary-glow p-8 text-primary-foreground 
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-success/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm animate-pulse-glow">
                <ClipboardCheck className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  Checklists Inteligentes
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Sistema avançado para operações marítimas
                  <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Plataforma revolucionária de checklists com IA preditiva, automação completa 
              e experiência extraordinária para operadores de bordo (DP, Máquinas, Náutica).
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA Preditiva</span>
              </div>
              <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Segurança Total</span>
              </div>
              <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-warning shadow-lg border border-warning/30">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Automação Completa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
              bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Checklist Manager */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <span className="text-gradient">Gerenciador Inteligente de Checklists</span>
                <Star className="w-6 h-6 text-warning animate-pulse" />
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2">
                Sistema avançado com IA para operações de bordo
                <div className="flex gap-1">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    DP Operacional
                  </Badge>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                    Máquinas
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    Náutica
                  </Badge>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntelligentChecklistManager />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="checklists"
        moduleName="Checklists"
        moduleIcon={<ClipboardCheck className="h-4 w-4" />}
        actions={[
          {
            id: 'new-checklist',
            label: 'Novo Checklist',
            icon: <Plus className="h-4 w-4" />,
            action: () => console.log('Novo checklist'),
            variant: 'default'
          },
          {
            id: 'templates',
            label: 'Templates',
            icon: <FileText className="h-4 w-4" />,
            action: () => console.log('Templates'),
            variant: 'outline'
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => console.log('Relatórios'),
            variant: 'outline'
          },
          {
            id: 'ai-assist',
            label: 'IA Assistente',
            icon: <Brain className="h-4 w-4" />,
            action: () => console.log('IA Assistente'),
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

export default ChecklistsInteligentes;