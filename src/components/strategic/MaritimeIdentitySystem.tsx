import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Anchor, 
  Ship, 
  Compass, 
  Waves, 
  Navigation,
  Palette,
  Eye,
  Download,
  Upload,
  Settings,
  Zap,
  Crown,
  Sparkles,
  Globe,
  Star,
  Heart,
  Flag,
  Shield
} from 'lucide-react';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: string;
  maritime: boolean;
}

interface CustomizationSettings {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: string;
  maritimeElements: boolean;
  navigationStyle: 'classic' | 'modern' | 'compact';
  terminology: 'standard' | 'maritime' | 'corporate';
}

const MaritimeIdentitySystem: React.FC = () => {
  const [settings, setSettings] = useState<CustomizationSettings>({
    companyName: 'Nautilus One',
    logo: '',
    primaryColor: '#2563eb',
    secondaryColor: '#f59e0b',
    accentColor: '#059669',
    theme: 'nautical-professional',
    maritimeElements: true,
    navigationStyle: 'modern',
    terminology: 'maritime'
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSection, setActiveSection] = useState<'branding' | 'colors' | 'layout' | 'terminology'>('branding');
  const { toast } = useToast();

  const themePresets: ThemePreset[] = [
    {
      id: 'nautical-professional',
      name: 'Nautical Professional',
      description: 'Azul oceânico com elementos dourados portuários',
      colors: {
        primary: '#2563eb',
        secondary: '#f59e0b', 
        accent: '#059669'
      },
      preview: 'bg-gradient-to-br from-blue-500 to-blue-600',
      maritime: true
    },
    {
      id: 'deep-ocean',
      name: 'Deep Ocean',
      description: 'Tons profundos do oceano com ciano',
      colors: {
        primary: '#1e3a8a',
        secondary: '#0891b2',
        accent: '#06b6d4'
      },
      preview: 'bg-gradient-to-br from-blue-900 to-cyan-600',
      maritime: true
    },
    {
      id: 'harbor-sunset',
      name: 'Harbor Sunset',
      description: 'Cores quentes do pôr do sol portuário',
      colors: {
        primary: '#dc2626',
        secondary: '#ea580c',
        accent: '#fbbf24'
      },
      preview: 'bg-gradient-to-br from-red-600 to-yellow-400',
      maritime: true
    },
    {
      id: 'arctic-navigation',
      name: 'Arctic Navigation',
      description: 'Tons frios e limpos do ártico',
      colors: {
        primary: '#0f766e',
        secondary: '#0d9488',
        accent: '#14b8a6'
      },
      preview: 'bg-gradient-to-br from-teal-700 to-teal-400',
      maritime: true
    },
    {
      id: 'corporate-classic',
      name: 'Corporate Classic',
      description: 'Estilo corporativo tradicional',
      colors: {
        primary: '#374151',
        secondary: '#6b7280',
        accent: '#3b82f6'
      },
      preview: 'bg-gradient-to-br from-gray-700 to-blue-500',
      maritime: false
    }
  ];

  const navigationStyles = [
    {
      id: 'classic',
      name: 'Clássico',
      description: 'Navegação tradicional com estrutura hierárquica',
      icon: Flag
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Interface contemporânea com elementos fluidos',
      icon: Sparkles
    },
    {
      id: 'compact',
      name: 'Compacto',
      description: 'Maximiza espaço útil com navegação condensada',
      icon: Zap
    }
  ];

  const terminologyOptions = [
    {
      id: 'maritime',
      name: 'Marítimo',
      description: 'Terminologia específica do setor naval',
      examples: ['Tripulação', 'Embarcação', 'Porto', 'Escala'],
      icon: Anchor
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      description: 'Linguagem empresarial padrão',
      examples: ['Equipe', 'Sistema', 'Local', 'Agenda'],
      icon: Crown
    },
    {
      id: 'standard',
      name: 'Padrão',
      description: 'Terminologia mista e adaptável',
      examples: ['Pessoas', 'Recursos', 'Destino', 'Cronograma'],
      icon: Globe
    }
  ];

  const handleColorChange = (colorType: keyof Pick<CustomizationSettings, 'primaryColor' | 'secondaryColor' | 'accentColor'>, value: string) => {
    setSettings(prev => ({
      ...prev,
      [colorType]: value
    }));
    
    // Aplicar mudança em tempo real
    if (previewMode) {
      applyThemePreview();
    }
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
      theme: preset.id,
      maritimeElements: preset.maritime
    }));

    toast({
      title: "Tema Aplicado",
      description: `${preset.name} foi selecionado com sucesso`,
    });
  };

  const applyThemePreview = () => {
    const root = document.documentElement;
    
    // Converter hex para HSL e aplicar
    root.style.setProperty('--primary', hexToHsl(settings.primaryColor));
    root.style.setProperty('--secondary', hexToHsl(settings.secondaryColor));
    root.style.setProperty('--accent', hexToHsl(settings.accentColor));
    
    toast({
      title: "Preview Aplicado",
      description: "Visualização em tempo real ativada",
    });
  };

  const hexToHsl = (hex: string): string => {
    // Simplified conversion - in production would use proper color conversion
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const saveConfiguration = () => {
    localStorage.setItem('nautilus-customization', JSON.stringify(settings));
    toast({
      title: "Configuração Salva",
      description: "Personalização aplicada permanentemente",
    });
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nautilus-theme-config.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header com Preview Toggle */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-nautical/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-nautical/20">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <span className="font-display">Sistema de Identidade Marítima</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Personalize completamente a aparência e comportamento do sistema
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={previewMode ? 'default' : 'outline'}
                onClick={() => {
                  setPreviewMode(!previewMode);
                  if (!previewMode) applyThemePreview();
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Preview Ativo' : 'Ativar Preview'}
              </Button>
              <Button onClick={saveConfiguration} className="bg-green-600 hover:bg-green-700">
                <Shield className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navegação entre seções */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
        {[
          { id: 'branding', label: 'Marca', icon: Flag },
          { id: 'colors', label: 'Cores', icon: Palette },
          { id: 'layout', label: 'Layout', icon: Navigation },
          { id: 'terminology', label: 'Terminologia', icon: Globe }
        ].map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'ghost'}
              onClick={() => setActiveSection(section.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Principal */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {activeSection === 'branding' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary" />
                    Identidade da Marca
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Nome da Empresa</Label>
                        <Input
                          id="companyName"
                          value={settings.companyName}
                          onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Nome da sua empresa"
                        />
                      </div>
                      
                      <div>
                        <Label>Upload do Logo</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Arraste ou clique para fazer upload do logo
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Selecionar Arquivo
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-muted/20">
                        <h4 className="font-medium mb-2">Preview da Marca</h4>
                        <div className="bg-gradient-to-br from-primary/10 to-nautical/10 p-6 rounded-lg text-center">
                          <div className="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
                            <Anchor className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-bold">{settings.companyName || 'Sua Empresa'}</h3>
                          <p className="text-sm text-muted-foreground">Sistema Marítimo Integrado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'colors' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Esquema de Cores
                  </h3>

                  {/* Presets de Temas */}
                  <div>
                    <h4 className="font-medium mb-4">Temas Predefinidos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {themePresets.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-105 ${
                            settings.theme === preset.id ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full ${preset.preview}`} />
                            <div>
                              <h5 className="font-medium">{preset.name}</h5>
                              {preset.maritime && (
                                <Badge variant="secondary" className="text-xs">
                                  <Anchor className="w-3 h-3 mr-1" />
                                  Marítimo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cores Personalizadas */}
                  <div>
                    <h4 className="font-medium mb-4">Cores Personalizadas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Cor Primária</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.primaryColor}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                            placeholder="#2563eb"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondaryColor">Cor Secundária</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.secondaryColor}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                            placeholder="#f59e0b"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accentColor">Cor de Destaque</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="accentColor"
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.accentColor}
                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                            placeholder="#059669"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'layout' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    Estilo de Navegação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {navigationStyles.map((style) => {
                      const Icon = style.icon;
                      return (
                        <div
                          key={style.id}
                          onClick={() => setSettings(prev => ({ ...prev, navigationStyle: style.id as any }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-105 ${
                            settings.navigationStyle === style.id ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-medium">{style.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSection === 'terminology' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Terminologia do Sistema
                  </h3>
                  
                  <div className="space-y-4">
                    {terminologyOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSettings(prev => ({ ...prev, terminology: option.id as any }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                            settings.terminology === option.id ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{option.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                              <div className="flex gap-2 flex-wrap">
                                {option.examples.map((example, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar de Ações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={exportConfiguration} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar Config
              </Button>
              
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Importar Config
              </Button>
              
              <Button onClick={saveConfiguration} className="w-full bg-green-600 hover:bg-green-700">
                <Shield className="w-4 h-4 mr-2" />
                Aplicar Mudanças
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Preview Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="p-4 rounded-lg min-h-[200px] bg-gradient-to-br"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}20, ${settings.secondaryColor}20, ${settings.accentColor}20)`
                }}
              >
                <div className="text-center">
                  <div 
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${settings.primaryColor}20` }}
                  >
                    <Ship className="w-6 h-6" style={{ color: settings.primaryColor }} />
                  </div>
                  <h3 className="font-bold">{settings.companyName}</h3>
                  <p className="text-sm opacity-75 mb-4">Maritime System</p>
                  
                  <div className="space-y-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <div 
                      className="h-2 rounded-full w-3/4 mx-auto"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                    <div 
                      className="h-2 rounded-full w-1/2 mx-auto"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaritimeIdentitySystem;