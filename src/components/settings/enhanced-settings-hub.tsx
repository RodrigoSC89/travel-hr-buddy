import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  Clock
} from 'lucide-react';

// Import category components
import { GeneralSettingsTab } from './tabs/general-settings-tab';
import { SecurityAccessTab } from './tabs/security-access-tab';
import { UsersProfilesTab } from './tabs/users-profiles-tab';
import { NotificationsAlertsTab } from './tabs/notifications-alerts-tab';
import { IntegrationsTab } from './tabs/integrations-tab';
import { DocumentationLogsTab } from './tabs/documentation-logs-tab';

interface SettingsData {
  general: {
    companyName: string;
    defaultLanguage: string;
    timezone: string;
    systemTheme: string;
    dateTimeFormat: string;
  };
  security: {
    passwordRules: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
    };
    sessionExpiry: number;
    twoFactorRequired: boolean;
    maxLoginAttempts: number;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    systemAlerts: boolean;
    scheduleStart: string;
    scheduleEnd: string;
    moduleSettings: Record<string, boolean>;
  };
  integrations: {
    apiKeys: Record<string, string>;
    webhooks: Array<{ id: string; name: string; url: string; active: boolean }>;
    externalServices: Record<string, any>;
  };
}

export const EnhancedSettingsHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      companyName: 'Nautilus One',
      defaultLanguage: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      systemTheme: 'system',
      dateTimeFormat: 'DD/MM/YYYY HH:mm'
    },
    security: {
      passwordRules: {
        minLength: 8,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true
      },
      sessionExpiry: 30,
      twoFactorRequired: false,
      maxLoginAttempts: 3
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      systemAlerts: true,
      scheduleStart: '08:00',
      scheduleEnd: '18:00',
      moduleSettings: {
        communication: true,
        crew: true,
        vessels: true,
        certificates: true
      }
    },
    integrations: {
      apiKeys: {},
      webhooks: [],
      externalServices: {}
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [testMode, setTestMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateSettings = (category: keyof SettingsData, updates: Partial<SettingsData[keyof SettingsData]>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the action for audit trail
      await logSettingsChange('save', settings);
      
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

  const resetToDefaults = async () => {
    const defaultSettings: SettingsData = {
      general: {
        companyName: 'Nautilus One',
        defaultLanguage: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        systemTheme: 'system',
        dateTimeFormat: 'DD/MM/YYYY HH:mm'
      },
      security: {
        passwordRules: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: true,
          requireUppercase: true
        },
        sessionExpiry: 30,
        twoFactorRequired: false,
        maxLoginAttempts: 3
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        systemAlerts: true,
        scheduleStart: '08:00',
        scheduleEnd: '18:00',
        moduleSettings: {
          communication: true,
          crew: true,
          vessels: true,
          certificates: true
        }
      },
      integrations: {
        apiKeys: {},
        webhooks: [],
        externalServices: {}
      }
    };

    setSettings(defaultSettings);
    setHasChanges(true);
    
    await logSettingsChange('reset', defaultSettings);
    
    toast({
      title: "🔄 Configurações Restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nautilus-settings-${new Date().toISOString().split('T')[0]}.json`;
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
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasChanges(true);
        
        toast({
          title: "📤 Configurações Importadas",
          description: "Configurações carregadas do arquivo. Clique em 'Salvar' para aplicar.",
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
      toast({
        title: "✨ Recomendações da IA",
        description: "3 sugestões de otimização encontradas. Verifique a aba 'Documentação'.",
      });
    }, 2000);
  };

  const logSettingsChange = async (action: string, data: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: user?.email || 'sistema',
      action,
      module: 'settings',
      details: data,
      ipAddress: 'auto-detect' // In real app, get actual IP
    };
    
    console.log('Settings audit log:', logEntry);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Centro de Configurações</h1>
                <p className="text-muted-foreground">
                  Controle completo e personalizado da plataforma Nautilus One
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                {testMode && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <TestTube className="w-3 h-3 mr-1" />
                    Modo Teste
                  </Badge>
                )}
                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Alterações Pendentes
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
              <Button variant="outline" size="sm" onClick={toggleTestMode}>
                <TestTube className="w-4 h-4 mr-2" />
                {testMode ? 'Sair do Teste' : 'Modo Teste'}
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
                  className="absolute inset-0 opacity-0 cursor-pointer"
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
                className="min-w-[120px]"
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
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="general" className="flex flex-col items-center gap-2 py-3">
              <Building2 className="w-5 h-5" />
              <span className="text-xs">Configurações Gerais</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col items-center gap-2 py-3">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Segurança e Acesso</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col items-center gap-2 py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs">Perfis e Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center gap-2 py-3">
              <Bell className="w-5 h-5" />
              <span className="text-xs">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex flex-col items-center gap-2 py-3">
              <Link2 className="w-5 h-5" />
              <span className="text-xs">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex flex-col items-center gap-2 py-3">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Documentação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <GeneralSettingsTab 
              settings={settings.general}
              onUpdate={(updates) => updateSettings('general', updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityAccessTab 
              settings={settings.security}
              onUpdate={(updates) => updateSettings('security', updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersProfilesTab testMode={testMode} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsAlertsTab 
              settings={settings.notifications}
              onUpdate={(updates) => updateSettings('notifications', updates)}
              testMode={testMode}
            />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab 
              settings={settings.integrations}
              onUpdate={(updates) => updateSettings('integrations', updates)}
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