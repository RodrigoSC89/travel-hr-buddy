import React, { useState, useEffect } from 'react';
import { PeoDpAuditManager } from '@/components/peo-dp/PeoDpAuditManager';
import ModuleActionButton from '@/components/ui/module-action-button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { 
  Ship,
  Activity,
  Shield,
  TrendingUp,
  Plus,
  BarChart3,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

const PeoDp = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-cyan-500/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 text-white mb-8
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse-glow">
                <Ship className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  PEO-DP - Posicionamento Dinâmico
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Sistema de Auditoria Petrobras para Dynamic Positioning
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Plataforma especializada para auditorias PEO-DP com análise de capability plots, 
              gestão de propulsores e conformidade total com os padrões Petrobras.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <Activity className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Capability Plots</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Classes DP1/DP2/DP3</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <Settings className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Gestão de Propulsores</span>
              </div>
            </div>
          </div>
        </div>

        {/* PEO-DP Manager */}
        <PeoDpAuditManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peo-dp"
        moduleName="PEO-DP"
        moduleIcon={<Ship className="h-4 w-4" />}
        actions={[
          {
            id: 'new-audit',
            label: 'Nova Auditoria',
            icon: <Plus className="h-4 w-4" />,
            action: () => console.log('Nova auditoria PEO-DP'),
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
            id: 'capability',
            label: 'Capability Plots',
            icon: <TrendingUp className="h-4 w-4" />,
            action: () => console.log('Capability Plots'),
            variant: 'outline'
          },
          {
            id: 'systems',
            label: 'Sistemas DP',
            icon: <Settings className="h-4 w-4" />,
            action: () => console.log('Sistemas DP'),
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

export default PeoDp;
