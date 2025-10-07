import React, { useState, useEffect } from 'react';
import { SgsoAuditManager } from '@/components/sgso/SgsoAuditManager';
import ModuleActionButton from '@/components/ui/module-action-button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { 
  Shield,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Plus,
  BarChart3,
  RefreshCw,
  Download,
  FileText,
  BookOpen
} from 'lucide-react';

const Sgso = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-500/5 to-green-500/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-600 p-8 text-white mb-8
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse-glow">
                <Shield className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  SGSO - Sistema de Gestão de Segurança Operacional
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Conformidade com Resolução ANP nº 43/2007
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Sistema completo para gestão de segurança operacional offshore com as 17 práticas 
              obrigatórias ANP, gestão de riscos e relatórios regulamentares.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <BookOpen className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">17 Práticas ANP</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Gestão de Riscos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-300 hover:bg-white/30 shadow-lg border border-white/30">
                <FileText className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Relatórios ANP/IBAMA</span>
              </div>
            </div>
          </div>
        </div>

        {/* SGSO Manager */}
        <SgsoAuditManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="sgso"
        moduleName="SGSO"
        moduleIcon={<Shield className="h-4 w-4" />}
        actions={[
          {
            id: 'new-audit',
            label: 'Nova Auditoria',
            icon: <Plus className="h-4 w-4" />,
            action: () => console.log('Nova auditoria SGSO'),
            variant: 'default'
          },
          {
            id: 'reports',
            label: 'Relatórios ANP',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => console.log('Relatórios ANP'),
            variant: 'outline'
          },
          {
            id: 'practices',
            label: '17 Práticas',
            icon: <ClipboardCheck className="h-4 w-4" />,
            action: () => console.log('Práticas ANP'),
            variant: 'outline'
          },
          {
            id: 'risks',
            label: 'Gestão de Riscos',
            icon: <AlertTriangle className="h-4 w-4" />,
            action: () => console.log('Gestão de Riscos'),
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

export default Sgso;
