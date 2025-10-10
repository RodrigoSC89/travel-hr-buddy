import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Palette,
  Upload,
  Globe,
  Settings,
  Grid,
  Save,
  Eye,
  RefreshCw
} from "lucide-react";

interface BusinessRules {
  max_reservations?: string;
  min_advance_hours?: string;
  custom_alert_types?: string;
  integration_settings?: string;
  [key: string]: unknown;
}

export const OrganizationCustomization: React.FC = () => {
  const { currentOrganization, currentBranding, updateBranding, checkPermission } = useOrganization();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // Formulário de personalização
  const [customization, setCustomization] = useState({
    company_name: "",
    logo_url: "",
    primary_color: "#1e40af",
    secondary_color: "#3b82f6",
    accent_color: "#06b6d4",
    theme_mode: "light",
    default_language: "pt-BR",
    default_currency: "BRL",
    timezone: "America/Sao_Paulo",
    custom_fields: {},
    business_rules: {} as BusinessRules,
    enabled_modules: ["fleet", "crew", "certificates", "analytics"],
    module_settings: {}
  });

  useEffect(() => {
    if (currentBranding) {
      setCustomization({
        company_name: currentBranding.company_name || "",
        logo_url: currentBranding.logo_url || "",
        primary_color: currentBranding.primary_color || "#1e40af",
        secondary_color: currentBranding.secondary_color || "#3b82f6",
        accent_color: currentBranding.accent_color || "#06b6d4",
        theme_mode: currentBranding.theme_mode || "light",
        default_language: currentBranding.default_language || "pt-BR",
        default_currency: currentBranding.default_currency || "BRL",
        timezone: currentBranding.timezone || "America/Sao_Paulo",
        custom_fields: currentBranding.custom_fields || {},
        business_rules: currentBranding.business_rules || {},
        enabled_modules: Array.isArray(currentBranding.enabled_modules) 
          ? currentBranding.enabled_modules 
          : ["fleet", "crew", "certificates", "analytics"],
        module_settings: currentBranding.module_settings || {}
      });
    }
  }, [currentBranding]);

  const handleSave = async () => {
    if (!checkPermission("manage_settings")) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para alterar as configurações",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateBranding({
        ...customization,
        enabled_modules: customization.enabled_modules as Record<string, boolean>,
        business_rules: customization.business_rules as Record<string, unknown>
      });
      
      toast({
        title: "Sucesso",
        description: "Personalização salva com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar personalização",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableModules = [
    { id: "fleet", name: "Gestão de Frota", description: "Gerenciar embarcações e frotas" },
    { id: "crew", name: "Gestão de Tripulação", description: "Gerenciar tripulantes e escalas" },
    { id: "certificates", name: "Certificações", description: "Gerenciar certificados e documentos" },
    { id: "analytics", name: "Analytics", description: "Relatórios e métricas" },
    { id: "travel", name: "Viagens", description: "Planejamento de viagens" },
    { id: "price_alerts", name: "Alertas de Preço", description: "Monitoramento de preços" },
    { id: "communication", name: "Comunicação", description: "Chat e mensagens" },
    { id: "documents", name: "Documentos", description: "Gestão documental" }
  ];

  const languages = [
    { code: "pt-BR", name: "Português (Brasil)" },
    { code: "en-US", name: "English (United States)" },
    { code: "es-ES", name: "Español (España)" },
    { code: "fr-FR", name: "Français (France)" }
  ];

  const currencies = [
    { code: "BRL", name: "Real (R$)", symbol: "R$" },
    { code: "USD", name: "Dólar (US$)", symbol: "$" },
    { code: "EUR", name: "Euro (€)", symbol: "€" },
    { code: "GBP", name: "Libra (£)", symbol: "£" }
  ];

  const timezones = [
    { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
    { value: "America/New_York", label: "Nova York (UTC-5)" },
    { value: "Europe/London", label: "Londres (UTC+0)" },
    { value: "Europe/Paris", label: "Paris (UTC+1)" },
    { value: "Asia/Tokyo", label: "Tóquio (UTC+9)" }
  ];

  if (!currentOrganization) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Nenhuma organização selecionada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalização White Label</h1>
          <p className="text-muted-foreground">
            Configure a aparência e comportamento para {currentOrganization.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="w-4 h-4 mr-2" />
            {preview ? "Sair da Pré-visualização" : "Pré-visualizar"}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Preview Banner */}
      {preview && (
        <Card className="border-dashed border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Modo Pré-visualização Ativo</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              As alterações abaixo são aplicadas em tempo real para pré-visualização
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Visual & Marca
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Localização
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Regras de Negócio
          </TabsTrigger>
        </TabsList>

        {/* Visual & Marca */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>
                  Configure nome, logo e cores da marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={customization.company_name}
                    onChange={(e) => setCustomization({...customization, company_name: e.target.value})}
                    placeholder="Nome que aparecerá na interface"
                  />
                </div>

                <div>
                  <Label>URL do Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customization.logo_url}
                      onChange={(e) => setCustomization({...customization, logo_url: e.target.value})}
                      placeholder="https://exemplo.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {customization.logo_url && (
                    <div className="mt-2">
                      <img src={customization.logo_url} alt="Preview" className="h-12 w-auto" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.primary_color}
                        onChange={(e) => setCustomization({...customization, primary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customization.primary_color}
                        onChange={(e) => setCustomization({...customization, primary_color: e.target.value})}
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.secondary_color}
                        onChange={(e) => setCustomization({...customization, secondary_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customization.secondary_color}
                        onChange={(e) => setCustomization({...customization, secondary_color: e.target.value})}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customization.accent_color}
                        onChange={(e) => setCustomization({...customization, accent_color: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customization.accent_color}
                        onChange={(e) => setCustomization({...customization, accent_color: e.target.value})}
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Tema Padrão</Label>
                  <Select value={customization.theme_mode} onValueChange={(value) => setCustomization({...customization, theme_mode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático (sistema)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>
                  Veja como ficará a interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 space-y-4"
                  style={{
                    "--primary": customization.primary_color,
                    "--secondary": customization.secondary_color,
                    "--accent": customization.accent_color
                  } as React.CSSProperties}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: customization.primary_color + "10" }}>
                    {customization.logo_url ? (
                      <img src={customization.logo_url} alt="Logo" className="h-8 w-auto" />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-azure-50 font-bold"
                        style={{ backgroundColor: customization.primary_color }}
                      >
                        {customization.company_name.charAt(0) || "N"}
                      </div>
                    )}
                    <span className="font-semibold">{customization.company_name || "Nautilus One"}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      className="h-3 rounded"
                      style={{ backgroundColor: customization.primary_color }}
                    ></div>
                    <div 
                      className="h-3 rounded w-3/4"
                      style={{ backgroundColor: customization.secondary_color }}
                    ></div>
                    <div 
                      className="h-3 rounded w-1/2"
                      style={{ backgroundColor: customization.accent_color }}
                    ></div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Tema: {customization.theme_mode === "light" ? "Claro" : customization.theme_mode === "dark" ? "Escuro" : "Automático"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Localização */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Regionais</CardTitle>
              <CardDescription>
                Defina idioma, moeda e fuso horário padrão
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Idioma Padrão</Label>
                <Select value={customization.default_language} onValueChange={(value) => setCustomization({...customization, default_language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Moeda Padrão</Label>
                <Select value={customization.default_currency} onValueChange={(value) => setCustomization({...customization, default_currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(curr => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fuso Horário</Label>
                <Select value={customization.timezone} onValueChange={(value) => setCustomization({...customization, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Módulos */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Módulos Habilitados</CardTitle>
              <CardDescription>
                Escolha quais funcionalidades estarão disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableModules.map(module => (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{module.name}</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Switch
                      checked={Array.isArray(customization.enabled_modules) && customization.enabled_modules.includes(module.id)}
                      onCheckedChange={(checked) => {
                        const currentModules = Array.isArray(customization.enabled_modules) 
                          ? customization.enabled_modules 
                          : [];
                        
                        if (checked) {
                          setCustomization({
                            ...customization,
                            enabled_modules: [...currentModules, module.id]
                          });
                        } else {
                          setCustomization({
                            ...customization,
                            enabled_modules: currentModules.filter(m => m !== module.id)
                          });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regras de Negócio */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Negócio Personalizadas</CardTitle>
              <CardDescription>
                Configure comportamentos específicos da organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Limite de Reservas por Usuário</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 5"
                    value={(customization.business_rules as BusinessRules)?.max_reservations || ""}
                    onChange={(e) => setCustomization({
                      ...customization,
                      business_rules: {
                        ...(customization.business_rules as BusinessRules || {}),
                        max_reservations: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <Label>Antecedência Mínima para Reservas (horas)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 24"
                    value={(customization.business_rules as BusinessRules)?.min_advance_hours || ""}
                    onChange={(e) => setCustomization({
                      ...customization,
                      business_rules: {
                        ...(customization.business_rules as BusinessRules || {}),
                        min_advance_hours: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Tipos de Alerta Personalizados</Label>
                <Textarea
                  placeholder="Ex: Alerta de Manutenção Programada, Inspeção de Segurança..."
                  value={(customization.business_rules as BusinessRules)?.custom_alert_types || ""}
                  onChange={(e) => setCustomization({
                    ...customization,
                    business_rules: {
                      ...(customization.business_rules as BusinessRules || {}),
                      custom_alert_types: e.target.value
                    }
                  })}
                />
              </div>

              <div>
                <Label>Configurações de Integração Específicas</Label>
                <Textarea
                  placeholder="APIs específicas, webhooks, integrações com sistemas legados..."
                  value={(customization.business_rules as BusinessRules)?.integration_settings || ""}
                  onChange={(e) => setCustomization({
                    ...customization,
                    business_rules: {
                      ...(customization.business_rules as BusinessRules || {}),
                      integration_settings: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};