/**
 * Adaptive Interface
 * Interface modular adaptativa por perfil de uso
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Settings, Layout, Palette, Eye,
  Sliders, Grid3X3, List, Zap, Moon, Sun,
  Monitor, Smartphone, Check, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  icon: string;
  description: string;
  modules: string[];
  shortcuts: string[];
  theme: string;
}

const profiles: UserProfile[] = [
  {
    id: 'engineer',
    name: 'Engenheiro Embarcado',
    role: 'engineer',
    icon: '🔧',
    description: 'Foco em manutenção, estoque a bordo e relatórios técnicos',
    modules: ['Manutenção', 'Estoque', 'Checklists', 'Incidentes'],
    shortcuts: ['Nova OS', 'Baixa de Material', 'Relatório Diário'],
    theme: 'technical'
  },
  {
    id: 'buyer',
    name: 'Comprador',
    role: 'buyer',
    icon: '🛒',
    description: 'Gestão de fornecedores, cotações e pedidos de compra',
    modules: ['Compras', 'Fornecedores', 'Cotações', 'Contratos'],
    shortcuts: ['Nova Cotação', 'Aprovar Pedido', 'Consultar Preços'],
    theme: 'commercial'
  },
  {
    id: 'fleet-manager',
    name: 'Gestor de Frota',
    role: 'manager',
    icon: '🚢',
    description: 'Visão estratégica da frota, KPIs e decisões operacionais',
    modules: ['Dashboard', 'Frota', 'Relatórios', 'Análises'],
    shortcuts: ['Cockpit 360°', 'Relatório Executivo', 'Alertas'],
    theme: 'executive'
  },
  {
    id: 'auditor',
    name: 'Auditor',
    role: 'auditor',
    icon: '📋',
    description: 'Compliance, certificações e documentação regulatória',
    modules: ['Compliance', 'Certificados', 'Auditorias', 'Documentos'],
    shortcuts: ['Gerar Dossiê', 'Verificar Vencimentos', 'Relatório ANTAQ'],
    theme: 'compliance'
  },
  {
    id: 'hr',
    name: 'RH / Tripulação',
    role: 'hr',
    icon: '👥',
    description: 'Gestão de pessoal, escalas e treinamentos',
    modules: ['Tripulação', 'Escalas', 'Treinamentos', 'Documentos'],
    shortcuts: ['Nova Escala', 'Embarque', 'Certificados Vencendo'],
    theme: 'people'
  }
];

interface InterfaceSettings {
  compactMode: boolean;
  darkMode: boolean;
  animations: boolean;
  viewMode: 'grid' | 'list';
  density: 'comfortable' | 'compact' | 'spacious';
}

export function AdaptiveInterface() {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<InterfaceSettings>({
    compactMode: false,
    darkMode: true,
    animations: true,
    viewMode: 'grid',
    density: 'comfortable'
  });
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyProfile = async (profile: UserProfile) => {
    setIsApplying(true);
    setSelectedProfile(profile);
    
    // Apply profile preferences
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    
    setIsApplying(false);
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'technical': return 'from-primary to-info';
      case 'commercial': return 'from-success to-success/80';
      case 'executive': return 'from-secondary to-accent';
      case 'compliance': return 'from-warning to-warning/80';
      case 'people': return 'from-destructive/80 to-destructive';
      default: return 'from-muted to-muted-foreground/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            Interface Adaptativa
          </h2>
          <p className="text-muted-foreground">Personalize a interface de acordo com seu perfil</p>
        </div>
        {selectedProfile && (
          <Badge variant="outline" className="gap-2 text-lg py-2 px-4">
            <span>{selectedProfile.icon}</span>
            {selectedProfile.name}
          </Badge>
        )}
      </div>

      {/* Profile Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Selecione seu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedProfile?.id === profile.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleApplyProfile(profile)}
                >
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getThemeColors(profile.theme)} text-3xl mb-3`}>
                        {profile.icon}
                      </div>
                      <h3 className="font-semibold">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Módulos Principais</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.modules.slice(0, 3).map(mod => (
                            <Badge key={mod} variant="secondary" className="text-xs">
                              {mod}
                            </Badge>
                          ))}
                          {profile.modules.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.modules.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Atalhos Rápidos</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.shortcuts.slice(0, 2).map(shortcut => (
                            <Badge key={shortcut} variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {shortcut}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedProfile?.id === profile.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="p-1 rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
                </div>
              </div>
              <Switch 
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, darkMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="font-medium">Animações</p>
                  <p className="text-sm text-muted-foreground">Efeitos visuais e transições</p>
                </div>
              </div>
              <Switch 
                checked={settings.animations}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, animations: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5" />
                <div>
                  <p className="font-medium">Modo Compacto</p>
                  <p className="text-sm text-muted-foreground">Interface mais densa</p>
                </div>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, compactMode: checked }))}
              />
            </div>

            <div>
              <p className="font-medium mb-3">Visualização</p>
              <div className="flex gap-2">
                <Button
                  variant={settings.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings(s => ({ ...s, viewMode: 'grid' }))}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grade
                </Button>
                <Button
                  variant={settings.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings(s => ({ ...s, viewMode: 'list' }))}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista
                </Button>
              </div>
            </div>

            <div>
              <p className="font-medium mb-3">Densidade</p>
              <div className="flex gap-2">
                {['compact', 'comfortable', 'spacious'].map(density => (
                  <Button
                    key={density}
                    variant={settings.density === density ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(s => ({ ...s, density: density as InterfaceSettings['density'] }))}
                  >
                    {density === 'compact' && 'Compacto'}
                    {density === 'comfortable' && 'Confortável'}
                    {density === 'spacious' && 'Espaçoso'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg border ${settings.darkMode ? 'bg-slate-900' : 'bg-card'} transition-colors`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded ${settings.darkMode ? 'bg-slate-800' : 'bg-muted'}`}>
                  <Monitor className="h-4 w-4" />
                </div>
                <div className={`p-2 rounded ${settings.darkMode ? 'bg-slate-800' : 'bg-muted'}`}>
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>

              <div className={`grid ${settings.viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={`adaptive-card-${i}`}
                    animate={settings.animations ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`rounded ${settings.darkMode ? 'bg-slate-800' : 'bg-muted'} ${
                      settings.density === 'compact' ? 'p-2' : 
                      settings.density === 'spacious' ? 'p-6' : 'p-4'
                    }`}
                  >
                    <div className={`h-2 rounded ${settings.darkMode ? 'bg-slate-700' : 'bg-muted-foreground/20'} mb-2 w-3/4`} />
                    <div className={`h-2 rounded ${settings.darkMode ? 'bg-slate-700' : 'bg-muted-foreground/20'} w-1/2`} />
                  </motion.div>
                ))}
              </div>
            </div>

            {isApplying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  <p className="text-sm">Aplicando perfil...</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
