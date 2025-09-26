import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { 
  Palette,
  Upload,
  Globe,
  Eye,
  Save,
  RotateCcw,
  Settings,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

export const WhiteLabelCustomizer: React.FC = () => {
  const { currentTenant, currentBranding, updateBranding } = useTenant();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    company_name: currentBranding?.company_name || '',
    logo_url: currentBranding?.logo_url || '',
    favicon_url: currentBranding?.favicon_url || '',
    primary_color: currentBranding?.primary_color || '#2563eb',
    secondary_color: currentBranding?.secondary_color || '#64748b',
    accent_color: currentBranding?.accent_color || '#7c3aed',
    background_color: currentBranding?.background_color || '#ffffff',
    text_color: currentBranding?.text_color || '#000000',
    theme_mode: currentBranding?.theme_mode || 'light',
    default_language: currentBranding?.default_language || 'pt-BR',
    default_currency: currentBranding?.default_currency || 'BRL',
    timezone: currentBranding?.timezone || 'America/Sao_Paulo',
    enabled_modules: currentBranding?.enabled_modules || {},
    business_rules: currentBranding?.business_rules || {}
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentBranding) return;

    try {
      setIsLoading(true);
      await updateBranding(formData);
      setHasChanges(false);
      toast({
        title: "Personalização salva",
        description: "As configurações de marca foram atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar personalização:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      company_name: currentBranding?.company_name || '',
      logo_url: currentBranding?.logo_url || '',
      favicon_url: currentBranding?.favicon_url || '',
      primary_color: currentBranding?.primary_color || '#2563eb',
      secondary_color: currentBranding?.secondary_color || '#64748b',
      accent_color: currentBranding?.accent_color || '#7c3aed',
      background_color: currentBranding?.background_color || '#ffffff',
      text_color: currentBranding?.text_color || '#000000',
      theme_mode: currentBranding?.theme_mode || 'light',
      default_language: currentBranding?.default_language || 'pt-BR',
      default_currency: currentBranding?.default_currency || 'BRL',
      timezone: currentBranding?.timezone || 'America/Sao_Paulo',
      enabled_modules: currentBranding?.enabled_modules || {},
      business_rules: currentBranding?.business_rules || {}
    });
    setHasChanges(false);
  };

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' }
  ];

  const currencies = [
    { value: 'BRL', label: 'Real Brasileiro (R$)' },
    { value: 'USD', label: 'Dólar Americano ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'Libra Esterlina (£)' }
  ];

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/New_York', label: 'Nova York (GMT-5)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' }
  ];

  if (!currentTenant) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Selecione uma organização para personalizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Personalização White Label
          </h2>
          <p className="text-muted-foreground">
            Configure a identidade visual e comportamento da sua organização
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Alterações não salvas
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identity">Identidade</TabsTrigger>
          <TabsTrigger value="colors">Cores & Tema</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Configure o nome, logo e elementos visuais da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Digite o nome da sua empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon_url">URL do Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon_url"
                    value={formData.favicon_url}
                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Esquema de Cores
              </CardTitle>
              <CardDescription>
                Defina as cores principais que representam sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="secondary_color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent_color">Cor de Destaque</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="accent_color"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Modo de Tema</h4>
                <Select
                  value={formData.theme_mode}
                  onValueChange={(value) => handleInputChange('theme_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Modo Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Modo Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Automático
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Regionais
              </CardTitle>
              <CardDescription>
                Configure idioma, moeda e fuso horário padrão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Idioma Padrão</Label>
                  <Select
                    value={formData.default_language}
                    onValueChange={(value) => handleInputChange('default_language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moeda Padrão</Label>
                  <Select
                    value={formData.default_currency}
                    onValueChange={(value) => handleInputChange('default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Módulos Habilitados
              </CardTitle>
              <CardDescription>
                Configure quais módulos estão disponíveis para sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  peotram: 'Sistema PEOTRAM',
                  fleet_management: 'Gestão da Frota',
                  analytics: 'Analytics Avançado',
                  hr: 'Recursos Humanos',
                  ai_analysis: 'Análise por IA',
                  document_scanner: 'Scanner de Documentos',
                  workflow_automation: 'Automação de Workflow',
                  voice_interface: 'Interface por Voz'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Habilitado para esta organização
                      </p>
                    </div>
                    <Switch
                      checked={formData.enabled_modules[key] || false}
                      onCheckedChange={(checked) => 
                        handleNestedChange('enabled_modules', key, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Prévia da Personalização
              </CardTitle>
              <CardDescription>
                Veja como ficará sua organização com as configurações atuais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 border rounded-lg bg-background">
                  <div 
                    className="p-4 rounded-lg text-white"
                    style={{ backgroundColor: formData.primary_color }}
                  >
                    <h3 className="text-lg font-bold">{formData.company_name || 'Sua Empresa'}</h3>
                    <p className="text-sm opacity-90">Plataforma Marítima Inteligente</p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                      <span className="text-sm">Cor Secundária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: formData.accent_color }}
                      />
                      <span className="text-sm">Cor de Destaque</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded">
                    <p className="text-sm">
                      <strong>Idioma:</strong> {languages.find(l => l.value === formData.default_language)?.label} |
                      <strong> Moeda:</strong> {currencies.find(c => c.value === formData.default_currency)?.label} |
                      <strong> Tema:</strong> {formData.theme_mode === 'light' ? 'Claro' : formData.theme_mode === 'dark' ? 'Escuro' : 'Automático'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Módulos Habilitados</h4>
                    <div className="space-y-1">
                      {Object.entries(formData.enabled_modules).filter(([_, enabled]) => enabled).map(([key, _]) => (
                        <Badge key={key} variant="outline" className="mr-1">
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Dispositivos Suportados</h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Monitor className="h-4 w-4" />
                        Desktop
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Smartphone className="h-4 w-4" />
                        Mobile
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};