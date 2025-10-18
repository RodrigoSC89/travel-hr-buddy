import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings,
  Building2,
  Shield,
  Users,
  Bell,
  Link2,
  FileText,
  Save,
  RotateCcw,
  Download,
  Upload,
  TestTube,
  Sparkles,
  History,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Search,
  Filter,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Bookmark,
  Share2,
  PenTool,
  Layers,
  Globe2,
  Cpu,
  Database,
  Server
} from "lucide-react";

// Import category components
import { GeneralSettingsTab } from "./tabs/general-settings-tab";
import { SecurityAccessTab } from "./tabs/security-access-tab";
import { UsersProfilesTab } from "./tabs/users-profiles-tab";
import { NotificationsAlertsTab } from "./tabs/notifications-alerts-tab";
import { IntegrationsTab } from "./tabs/integrations-tab";
import { DocumentationLogsTab } from "./tabs/documentation-logs-tab";
import { AdvancedFeaturesTab } from "./tabs/advanced-features-tab";
import { SystemMonitoringTab } from "./tabs/system-monitoring-tab";

interface SettingsData {
  general: {
    companyName: string;
    defaultLanguage: string;
    timezone: string;
    systemTheme: string;
    dateTimeFormat: string;
    companyLogo?: string;
    brandColors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  security: {
    passwordRules: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
      enablePasswordHistory: boolean;
      passwordExpirationDays: number;
    };
    sessionExpiry: number;
    twoFactorRequired: boolean;
    maxLoginAttempts: number;
    enableAuditLogging: boolean;
    enableIpWhitelist: boolean;
    allowedIps: string[];
    enableSingleSignOn: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    systemAlerts: boolean;
    scheduleStart: string;
    scheduleEnd: string;
    moduleSettings: Record<string, boolean>;
    escalationMatrix: Array<{
      level: number;
      timeoutMinutes: number;
      recipients: string[];
    }>;
    customTemplates: Record<string, string>;
  };
  integrations: {
    apiKeys: Record<string, string>;
    webhooks: Array<{ id: string; name: string; url: string; active: boolean; events: string[] }>;
    externalServices: Record<string, any>;
    rateLimits: Record<string, number>;
    enableApiVersioning: boolean;
  };
  advanced: {
    enableFeatureFlags: boolean;
    debugMode: boolean;
    performanceMonitoring: boolean;
    errorTracking: boolean;
    customFields: Record<string, any>;
    workflowAutomation: boolean;
    enableBetaFeatures: boolean;
  };
  monitoring: {
    enableMetrics: boolean;
    alertThresholds: Record<string, number>;
    retentionDays: number;
    enableHealthChecks: boolean;
  };
}

export const EnhancedSettingsHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      companyName: "Nautilus One",
      defaultLanguage: "pt-BR",
      timezone: "America/Sao_Paulo",
      systemTheme: "system",
      dateTimeFormat: "DD/MM/YYYY HH:mm",
      companyLogo: "",
      brandColors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#f59e0b"
      }
    },
    security: {
      passwordRules: {
        minLength: 8,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        enablePasswordHistory: false,
        passwordExpirationDays: 90
      },
      sessionExpiry: 30,
      twoFactorRequired: false,
      maxLoginAttempts: 3,
      enableAuditLogging: true,
      enableIpWhitelist: false,
      allowedIps: [],
      enableSingleSignOn: false
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      systemAlerts: true,
      scheduleStart: "08:00",
      scheduleEnd: "18:00",
      moduleSettings: {
        communication: true,
        crew: true,
        vessels: true,
        certificates: true
      },
      escalationMatrix: [],
      customTemplates: {}
    },
    integrations: {
      apiKeys: {},
      webhooks: [],
      externalServices: {},
      rateLimits: {},
      enableApiVersioning: true
    },
    advanced: {
      enableFeatureFlags: false,
      debugMode: false,
      performanceMonitoring: true,
      errorTracking: true,
      customFields: {},
      workflowAutomation: false,
      enableBetaFeatures: false
    },
    monitoring: {
      enableMetrics: true,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        responseTime: 2000
      },
      retentionDays: 90,
      enableHealthChecks: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [testMode, setTestMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsHealth, setSettingsHealth] = useState(85);
  const [autoSave, setAutoSave] = useState(false);
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: Date;
    action: string;
    user: string;
    details: string;
  }>>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges) {
      const timer = setTimeout(() => {
        saveSettings();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, autoSave]);

  // Calculate settings health score
  useEffect(() => {
    const calculateHealth = () => {
      let score = 100;
      
      // Security checks
      if (!settings.security.twoFactorRequired) score -= 10;
      if (settings.security.sessionExpiry > 60) score -= 5;
      if (!settings.security.enableAuditLogging) score -= 8;
      
      // General checks
      if (!settings.general.companyName) score -= 5;
      if (!settings.general.companyLogo) score -= 3;
      
      // Integration checks
      if (Object.keys(settings.integrations.apiKeys).length === 0) score -= 10;
      
      // Monitoring checks
      if (!settings.monitoring.enableMetrics) score -= 5;
      if (!settings.monitoring.enableHealthChecks) score -= 5;
      
      setSettingsHealth(Math.max(score, 0));
    };

    calculateHealth();
  }, [settings]);

  const updateSettings = (category: keyof SettingsData, updates: Record<string, unknown>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates
      }
    }));
    setHasChanges(true);
    
    // Add to change history
    setChangeHistory(prev => [{
      timestamp: new Date(),
      action: `Updated ${category}`,
      user: user?.email || "sistema",
      details: `Modified ${Object.keys(updates).join(", ")}`
    }, ...prev.slice(0, 49)]); // Keep last 50 changes
  };

  const saveSettings = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Validate settings before saving
      const validationErrors = validateSettings(settings);
      if (validationErrors.length > 0) {
        toast({
          title: "❌ Erro de Validação",
          description: `Corrija os seguintes erros: ${validationErrors.join(", ")}`,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the action for audit trail
      await logSettingsChange("save", settings);
      
      setHasChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "✅ Configurações Salvas",
        description: "Todas as alterações foram aplicadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateSettings = (settings: SettingsData): string[] => {
    const errors: string[] = [];
    
    if (!settings.general.companyName.trim()) {
      errors.push("Nome da empresa é obrigatório");
    }
    
    if (settings.security.passwordRules.minLength < 6) {
      errors.push("Comprimento mínimo da senha deve ser pelo menos 6");
    }
    
    if (settings.security.sessionExpiry < 5) {
      errors.push("Tempo de expiração da sessão deve ser pelo menos 5 minutos");
    }
    
    return errors;
  };

  const resetToDefaults = async () => {
    const defaultSettings: SettingsData = {
      general: {
        companyName: "Nautilus One",
        defaultLanguage: "pt-BR",
        timezone: "America/Sao_Paulo",
        systemTheme: "system",
        dateTimeFormat: "DD/MM/YYYY HH:mm",
        companyLogo: "",
        brandColors: {
          primary: "#2563eb",
          secondary: "#64748b",
          accent: "#f59e0b"
        }
      },
      security: {
        passwordRules: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: true,
          requireUppercase: true,
          enablePasswordHistory: false,
          passwordExpirationDays: 90
        },
        sessionExpiry: 30,
        twoFactorRequired: false,
        maxLoginAttempts: 3,
        enableAuditLogging: true,
        enableIpWhitelist: false,
        allowedIps: [],
        enableSingleSignOn: false
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        systemAlerts: true,
        scheduleStart: "08:00",
        scheduleEnd: "18:00",
        moduleSettings: {
          communication: true,
          crew: true,
          vessels: true,
          certificates: true
        },
        escalationMatrix: [],
        customTemplates: {}
      },
      integrations: {
        apiKeys: {},
        webhooks: [],
        externalServices: {},
        rateLimits: {},
        enableApiVersioning: true
      },
      advanced: {
        enableFeatureFlags: false,
        debugMode: false,
        performanceMonitoring: true,
        errorTracking: true,
        customFields: {},
        workflowAutomation: false,
        enableBetaFeatures: false
      },
      monitoring: {
        enableMetrics: true,
        alertThresholds: {
          cpu: 80,
          memory: 85,
          disk: 90,
          responseTime: 2000
        },
        retentionDays: 90,
        enableHealthChecks: true
      }
    };

    setSettings(defaultSettings);
    setHasChanges(true);
    
    await logSettingsChange("reset", defaultSettings);
    
    toast({
      title: "🔄 Configurações Restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  const exportSettings = () => {
    const exportData = {
      settings,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email,
        version: "2.1.4",
        health: settingsHealth
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nautilus-settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    
    toast({
      title: "📥 Configurações Exportadas",
      description: "Arquivo de backup baixado com sucesso.",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data structure
        if (!importedData.settings || !importedData.metadata) {
          throw new Error("Formato de arquivo inválido");
        }
        
        setSettings(importedData.settings);
        setHasChanges(true);
        
        toast({
          title: "📤 Configurações Importadas",
          description: `Configurações de ${importedData.metadata.exportedBy || "usuário desconhecido"} carregadas. Clique em 'Salvar' para aplicar.`,
        });
      } catch (error) {
        toast({
          title: "❌ Erro na Importação",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const generateAIRecommendations = async () => {
    toast({
      title: "🧠 Analisando Configurações",
      description: "IA está gerando recomendações baseadas no uso do sistema...",
    });

    // Simulate AI analysis
    setTimeout(() => {
      const recommendations = [];
      
      if (!settings.security.twoFactorRequired) {
        recommendations.push("Ativar 2FA obrigatório para maior segurança");
      }
      
      if (settings.security.sessionExpiry > 60) {
        recommendations.push("Reduzir tempo de expiração de sessão");
      }
      
      if (Object.keys(settings.integrations.webhooks).length === 0) {
        recommendations.push("Configurar webhooks para automação");
      }
      
      if (!settings.monitoring.enableMetrics) {
        recommendations.push("Ativar monitoramento de métricas");
      }
      
      toast({
        title: "✨ Recomendações da IA",
        description: `${recommendations.length} sugestões de otimização encontradas. Verifique a aba 'Recursos Avançados'.`,
      });
    }, 2000);
  };

  const toggleFavorite = (tabId: string) => {
    setFavorites(prev => 
      prev.includes(tabId) 
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const shareSettings = async () => {
    try {
      const shareData = {
        title: "Configurações Nautilus One",
        text: "Compartilhando configurações do sistema",
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "📋 Link Copiado",
          description: "Link das configurações copiado para área de transferência."
        });
      }
    } catch (error) {
    }
  };

  const logSettingsChange = async (action: string, data: Record<string, unknown>) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: user?.email || "sistema",
      action,
      module: "settings",
      details: data,
      ipAddress: "auto-detect" // In real app, get actual IP
    };
    
    // In real app, save to audit_logs table
  };

  const toggleTestMode = () => {
    setTestMode(!testMode);
    toast({
      title: testMode ? "🔧 Modo Produção" : "🧪 Modo Teste",
      description: testMode 
        ? "Voltando ao modo produção. Alterações afetarão o sistema."
        : "Modo teste ativado. Alterações não afetarão outros usuários.",
    });
  };

  const togglePreviewMode = () => {
    const newPreviewMode = !previewMode;
    setPreviewMode(newPreviewMode);
    toast({
      title: newPreviewMode ? "👁️ Modo Prévia" : "💾 Modo Normal",
      description: newPreviewMode
        ? "Modo prévia ativado. Veja como as alterações afetarão o sistema."
        : "Voltando ao modo normal.",
    });
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 90) return { text: "Excelente", className: "bg-green-100 text-green-800" };
    if (score >= 70) return { text: "Bom", className: "bg-yellow-100 text-yellow-800" };
    return { text: "Precisa Atenção", className: "bg-red-100 text-red-800" };
  };

  const tabsData = [
    { id: "general", label: "Geral", icon: Building2, description: "Configurações básicas" },
    { id: "security", label: "Segurança", icon: Shield, description: "Políticas de segurança" },
    { id: "users", label: "Usuários", icon: Users, description: "Gestão de usuários" },
    { id: "notifications", label: "Notificações", icon: Bell, description: "Alertas e notificações" },
    { id: "integrations", label: "Integrações", icon: Link2, description: "APIs e webhooks" },
    { id: "advanced", label: "Avançado", icon: Zap, description: "Recursos avançados" },
    { id: "monitoring", label: "Monitoramento", icon: Activity, description: "Métricas e logs" },
    { id: "documentation", label: "Docs", icon: FileText, description: "Documentação" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header with Analytics */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Centro de Configurações
                </h1>
                <p className="text-muted-foreground">
                  Controle completo e personalizado da plataforma Nautilus One
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Saúde: <span className={getHealthColor(settingsHealth)}>{settingsHealth}%</span>
                    </span>
                    <Badge className={getHealthBadge(settingsHealth).className}>
                      {getHealthBadge(settingsHealth).text}
                    </Badge>
                  </div>
                  <Progress value={settingsHealth} className="w-32 h-2" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar configurações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg bg-background/80 backdrop-blur-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                {collaborationEnabled && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    Colaborativo
                  </Badge>
                )}
                {previewMode && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Eye className="w-3 h-3 mr-1" />
                    Prévia
                  </Badge>
                )}
                {testMode && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <TestTube className="w-3 h-3 mr-1" />
                    Teste
                  </Badge>
                )}
                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    {autoSave ? "Auto-salvando..." : "Alterações Pendentes"}
                  </Badge>
                )}
                {lastSaved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Salvo {lastSaved.toLocaleTimeString()}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAutoSave(!autoSave)}>
                  <Zap className={`w-4 h-4 mr-2 ${autoSave ? "text-yellow-500" : ""}`} />
                  {autoSave ? "Auto-Save ON" : "Auto-Save OFF"}
                </Button>
                
                <Button variant="outline" size="sm" onClick={togglePreviewMode}>
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? "Sair Prévia" : "Prévia"}
                </Button>
                
                <Button variant="outline" size="sm" onClick={toggleTestMode}>
                  <TestTube className="w-4 h-4 mr-2" />
                  {testMode ? "Sair Teste" : "Modo Teste"}
                </Button>
                
                <Button variant="outline" size="sm" onClick={shareSettings}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                
                <Button variant="outline" size="sm" onClick={generateAIRecommendations}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  IA Sugestões
                </Button>
                
                <Button variant="outline" size="sm" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar
                </Button>
                
                <Button 
                  onClick={saveSettings} 
                  disabled={!hasChanges || isSaving}
                  className="min-w-[140px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Tudo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Additional Info Bar */}
          {(changeHistory.length > 0 || hasChanges) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  {changeHistory.length > 0 && (
                    <span className="text-blue-700 dark:text-blue-300">
                      <History className="w-4 h-4 inline mr-1" />
                      Última alteração: {changeHistory[0]?.action} por {changeHistory[0]?.user}
                    </span>
                  )}
                  {hasChanges && (
                    <span className="text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      {Object.keys(settings).filter(key => 
                        JSON.stringify((settings as unknown)[key]) !== JSON.stringify(settings[key as keyof SettingsData])
                      ).length} seções com alterações pendentes
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Sistema operacional • Versão 2.1.4
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Enhanced Tab Navigation */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-2">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-transparent">
              {tabsData.map((tab) => {
                const Icon = tab.icon;
                const isFavorite = favorites.includes(tab.id);
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex flex-col items-center gap-2 py-4 px-2 relative group data-[state=active]:bg-primary/10 data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tab.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Bookmark 
                          className={`w-3 h-3 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
                        />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground hidden lg:block">{tab.description}</span>
                    {hasChanges && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Smart Contextual Alerts */}
          {activeTab === "security" && settingsHealth < 80 && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Atenção:</strong> Sua configuração de segurança precisa de melhorias. 
                Considere ativar 2FA e revisar políticas de senha.
              </AlertDescription>
            </Alert>
          )}

          {autoSave && hasChanges && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Auto-save ativo:</strong> Suas alterações serão salvas automaticamente em alguns segundos.
              </AlertDescription>
            </Alert>
          )}

          {/* Tab Content with Enhanced Features */}
          <TabsContent value="general" className="space-y-6">
            <GeneralSettingsTab 
              settings={settings.general}
              onUpdate={(updates) => updateSettings("general", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityAccessTab 
              settings={settings.security}
              onUpdate={(updates) => updateSettings("security", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersProfilesTab testMode={testMode} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsAlertsTab 
              settings={settings.notifications}
              onUpdate={(updates) => updateSettings("notifications", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab 
              settings={settings.integrations}
              onUpdate={(updates) => updateSettings("integrations", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedFeaturesTab 
              settings={settings.advanced}
              onUpdate={(updates) => updateSettings("advanced", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <SystemMonitoringTab 
              settings={settings.monitoring}
              onUpdate={(updates) => updateSettings("monitoring", updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <DocumentationLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedSettingsHub;