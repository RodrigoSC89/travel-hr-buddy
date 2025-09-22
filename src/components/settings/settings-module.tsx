import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette, 
  Database,
  Shield,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Gerencie suas informações pessoais',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configure suas preferências de notificação',
    icon: <Bell className="w-5 h-5" />
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de senha e autenticação',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'appearance',
    title: 'Aparência',
    description: 'Personalize a interface do sistema',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'Conecte serviços externos',
    icon: <Database className="w-5 h-5" />
  }
];

export const SettingsModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso!",
    });
    
    setIsLoading(false);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" defaultValue={user?.name || ''} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email || ''} />
          </div>
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Input id="department" placeholder="Ex: Recursos Humanos" />
          </div>
          <div>
            <Label htmlFor="role">Cargo</Label>
            <Input id="role" placeholder="Ex: Analista" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Preferências</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Idioma do Sistema</Label>
              <p className="text-sm text-muted-foreground">Português (Brasil)</p>
            </div>
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Alterar
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Fuso Horário</Label>
              <p className="text-sm text-muted-foreground">UTC-3 (Brasília)</p>
            </div>
            <Button variant="outline" size="sm">Alterar</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Canais de Notificação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">Receber notificações por email</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Ativo</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <div>
                <Label>Push Mobile</Label>
                <p className="text-sm text-muted-foreground">Notificações no aplicativo móvel</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Ativo</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-primary" />
              <div>
                <Label>Desktop</Label>
                <p className="text-sm text-muted-foreground">Notificações do navegador</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Inativo</Button>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Tipos de Notificação</h3>
        <div className="space-y-3">
          {[
            'Alertas de preços atingidos',
            'Certificados prestes a vencer',
            'Novas reservas de viagem',
            'Relatórios semanais',
            'Atualizações do sistema'
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <Label>{item}</Label>
              <Button variant="outline" size="sm">Ativo</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Alteração de Senha</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Sessões Ativas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Sessão Atual</p>
              <p className="text-sm text-muted-foreground">Chrome - São Paulo, Brasil</p>
            </div>
            <Badge variant="secondary">Ativo</Badge>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button variant="outline" onClick={logout} className="w-full md:w-auto">
          Encerrar Todas as Sessões
        </Button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Tema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent">
            <div className="flex items-center space-x-3 mb-2">
              <Sun className="w-5 h-5" />
              <span className="font-medium">Claro</span>
            </div>
            <div className="w-full h-16 bg-gradient-to-br from-white to-gray-100 rounded border"></div>
          </div>
          
          <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent">
            <div className="flex items-center space-x-3 mb-2">
              <Moon className="w-5 h-5" />
              <span className="font-medium">Escuro</span>
            </div>
            <div className="w-full h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded border"></div>
          </div>
          
          <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent border-primary bg-primary/5">
            <div className="flex items-center space-x-3 mb-2">
              <Laptop className="w-5 h-5" />
              <span className="font-medium">Sistema</span>
              <Badge variant="secondary" className="ml-auto">Ativo</Badge>
            </div>
            <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded border"></div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Layout</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Sidebar Compacta</Label>
            <Button variant="outline" size="sm">Desabilitado</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label>Animações</Label>
            <Button variant="outline" size="sm">Habilitado</Button>
          </div>
          <div className="flex items-center justify-between">
            <Label>Densidade da Interface</Label>
            <Button variant="outline" size="sm">Confortável</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">APIs Conectadas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Amadeus Travel API</p>
              <p className="text-sm text-muted-foreground">Busca de voos e hotéis</p>
            </div>
            <Badge className="bg-success text-white">Conectado</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Mapbox</p>
              <p className="text-sm text-muted-foreground">Visualização de mapas</p>
            </div>
            <Badge className="bg-success text-white">Conectado</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Supabase</p>
              <p className="text-sm text-muted-foreground">Banco de dados e autenticação</p>
            </div>
            <Badge className="bg-success text-white">Conectado</Badge>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Configurações de Backup</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Automático</Label>
              <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
            </div>
            <Button variant="outline" size="sm">Ativo</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Retenção de Dados</Label>
              <p className="text-sm text-muted-foreground">Manter por 90 dias</p>
            </div>
            <Button variant="outline" size="sm">Alterar</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Seções</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 hover:bg-accent transition-colors rounded-none first:rounded-t-lg last:rounded-b-lg ${
                      activeSection === section.id ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {section.icon}
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs opacity-80">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {settingsSections.find(s => s.id === activeSection)?.title}
              </CardTitle>
              <CardDescription>
                {settingsSections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
              
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="gradient-ocean"
                  >
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};