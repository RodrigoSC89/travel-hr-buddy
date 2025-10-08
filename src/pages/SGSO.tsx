import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import ModuleActionButton from '@/components/ui/module-action-button';
import { SgsoDashboard } from '@/components/sgso/SgsoDashboard';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  Bell,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react';

const SGSO = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-red-500/5 to-orange-500/10 relative overflow-hidden">
      <BackToDashboard />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-orange-600 p-12 text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
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
                  Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Sistema completo para gestão de segurança operacional marítima, incluindo 17 práticas 
              obrigatórias ANP, matriz de riscos 5x5, gestão de incidentes, auditorias e compliance regulatório.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/90 text-red-600 px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-white/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">17 Práticas ANP</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-orange-400/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Matriz Riscos 5x5</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-blue-400/30">
                <FileCheck className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Gestão Incidentes</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-green-400/30">
                <TrendingUp className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Compliance 84%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SGSO Dashboard */}
        <SgsoDashboard />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="sgso"
        moduleName="SGSO"
        actions={[
          {
            id: 'practices',
            label: '17 Práticas ANP',
            icon: <Shield className="h-3 w-3" />,
            action: () => console.log('17 Práticas ANP')
          },
          {
            id: 'risks',
            label: 'Matriz de Riscos',
            icon: <AlertTriangle className="h-3 w-3" />,
            action: () => console.log('Matriz de Riscos')
          },
          {
            id: 'incidents',
            label: 'Gestão Incidentes',
            icon: <Bell className="h-3 w-3" />,
            action: () => console.log('Gestão Incidentes')
          },
          {
            id: 'audits',
            label: 'Auditorias',
            icon: <FileCheck className="h-3 w-3" />,
            action: () => console.log('Auditorias')
          },
          {
            id: 'training',
            label: 'Treinamentos',
            icon: <Users className="h-3 w-3" />,
            action: () => console.log('Treinamentos')
          },
          {
            id: 'reports',
            label: 'Relatórios ANP',
            icon: <BookOpen className="h-3 w-3" />,
            action: () => console.log('Relatórios ANP')
          }
        ]}
        quickActions={[
          {
            id: 'new-incident',
            label: 'Novo Incidente',
            icon: <Plus className="h-3 w-3" />,
            action: () => console.log('Novo Incidente')
          },
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

export default SGSO;
