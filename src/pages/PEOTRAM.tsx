import React, { useState, useEffect } from 'react';
import { PeotramAuditManager } from '@/components/peotram/peotram-audit-manager';
import ModernFabShortcuts from '@/components/ui/modern-fab-shortcuts';
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
  Clock
} from 'lucide-react';

const PEOTRAM = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: FileCheck, label: "Auditorias Ativas", value: "5", color: "primary" },
    { icon: CheckCircle, label: "Conformidades", value: "98%", color: "success" },
    { icon: AlertTriangle, label: "Não Conformidades", value: "2", color: "warning" },
    { icon: Award, label: "Certificação Petrobras", value: "Ativa", color: "info" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-warning/5 to-info/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-warning/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-info/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-warning via-warning/90 to-warning-glow p-8 text-warning-foreground 
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
                  PEOTRAM - Auditoria Petrobras
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Sistema de auditoria anual inteligente
                  <Crown className="inline-block w-6 h-6 ml-2 text-primary animate-bounce" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Plataforma revolucionária para auditorias PEOTRAM com IA preditiva, automação completa 
              e conformidade total com os padrões da Petrobras.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA Preditiva</span>
              </div>
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Conformidade Petrobras</span>
              </div>
              <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Padrão Internacional</span>
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

        {/* Enhanced PEOTRAM Manager */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                  <FileCheck className="w-6 h-6 text-warning" />
                </div>
                <span className="text-gradient">Sistema PEOTRAM Inteligente</span>
                <Star className="w-6 h-6 text-warning animate-pulse" />
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2">
                Auditoria anual Petrobras com tecnologia avançada
                <div className="flex gap-1">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Petrobras Certified
                  </Badge>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                    ISO Compliant
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    Real-time Audit
                  </Badge>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PeotramAuditManager />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced FAB */}
      <ModernFabShortcuts />
    </div>
  );
};

export default PEOTRAM;