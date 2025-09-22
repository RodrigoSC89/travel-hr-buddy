import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MessageCircle, 
  Send, 
  Settings, 
  Calendar,
  Plane,
  Building,
  Users,
  Clock,
  Check,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'whatsapp';
  trigger: 'flight_booked' | 'hotel_booked' | 'checkin_reminder' | 'checkout_reminder';
  subject?: string;
  message: string;
  enabled: boolean;
  timing: number; // horas antes do evento
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: string[];
  templates: string[];
  lastTriggered?: string;
  totalSent: number;
}

export const CommunicationModule: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [isConfiguring, setIsConfiguring] = useState(false);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Confirmação de Voo',
      type: 'email',
      trigger: 'flight_booked',
      subject: 'Confirmação de Reserva - Voo {{flight_number}}',
      message: 'Olá {{passenger_name}},\n\nSua reserva de voo foi confirmada!\n\n✈️ Voo: {{flight_number}}\n📅 Data: {{flight_date}}\n🕐 Horário: {{flight_time}}\n🛫 Origem: {{origin}}\n🛬 Destino: {{destination}}\n\nObrigado por escolher nossos serviços!',
      enabled: true,
      timing: 0
    },
    {
      id: '2',
      name: 'WhatsApp Voo Confirmado',
      type: 'whatsapp',
      trigger: 'flight_booked',
      message: '✈️ *VOO CONFIRMADO* ✈️\n\nOlá {{passenger_name}}!\n\n✅ Seu voo foi confirmado\n🎫 Código: {{flight_number}}\n📍 {{origin}} → {{destination}}\n📅 {{flight_date}} às {{flight_time}}\n\nBoa viagem!',
      enabled: true,
      timing: 0
    },
    {
      id: '3',
      name: 'Confirmação Hotel',
      type: 'email',
      trigger: 'hotel_booked',
      subject: 'Reserva Confirmada - {{hotel_name}}',
      message: 'Prezado(a) {{guest_name}},\n\nSua reserva de hotel foi confirmada!\n\n🏨 Hotel: {{hotel_name}}\n📍 Endereço: {{hotel_address}}\n📅 Check-in: {{checkin_date}}\n📅 Check-out: {{checkout_date}}\n👥 Hóspedes: {{guest_count}}\n\nAguardamos sua chegada!',
      enabled: true,
      timing: 0
    },
    {
      id: '4',
      name: 'Lembrete Check-in Hotel',
      type: 'whatsapp',
      trigger: 'checkin_reminder',
      message: '🏨 *LEMBRETE CHECK-IN* 🏨\n\nOlá {{guest_name}}!\n\n⏰ Seu check-in é amanhã!\n🏨 {{hotel_name}}\n📍 {{hotel_address}}\n🕐 Check-in: {{checkin_time}}\n\nTem alguma dúvida? Estamos aqui para ajudar!',
      enabled: true,
      timing: 24
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Confirmações Automáticas',
      enabled: true,
      conditions: ['Reserva confirmada', 'Pagamento aprovado'],
      templates: ['1', '2', '3'],
      lastTriggered: '2024-01-15 14:30',
      totalSent: 1247
    },
    {
      id: '2',
      name: 'Lembretes de Viagem',
      enabled: true,
      conditions: ['24h antes do check-in', '2h antes do voo'],
      templates: ['4'],
      lastTriggered: '2024-01-15 10:15',
      totalSent: 543
    }
  ]);

  const [settings, setSettings] = useState({
    emailProvider: 'resend',
    whatsappProvider: 'twilio',
    emailApiKey: '',
    whatsappApiKey: '',
    whatsappNumber: '',
    testMode: true
  });

  const [stats] = useState({
    emailsSent: 2847,
    whatsappSent: 1923,
    successRate: 98.5,
    avgDeliveryTime: '2.3s'
  });

  const handleSaveTemplate = (template: NotificationTemplate) => {
    setTemplates(prev => 
      prev.map(t => t.id === template.id ? template : t)
    );
    toast({
      title: "Template salvo",
      description: `Template "${template.name}" foi atualizado com sucesso`,
    });
  };

  const handleTestMessage = async (template: NotificationTemplate) => {
    setIsConfiguring(true);
    
    // Simular envio de teste
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Teste enviado",
      description: `Mensagem de teste enviada via ${template.type}`,
    });
    
    setIsConfiguring(false);
  };

  const handleSaveSettings = () => {
    if (!settings.emailApiKey || !settings.whatsappApiKey) {
      toast({
        title: "Erro",
        description: "Preencha todas as chaves de API obrigatórias",
        variant: "destructive"
      });
      return;
    }

    // Simular salvamento das configurações
    toast({
      title: "Configurações salvas",
      description: "Configurações de API atualizadas com sucesso",
    });
  };

  const getTriggerLabel = (trigger: string) => {
    const labels = {
      flight_booked: 'Voo Reservado',
      hotel_booked: 'Hotel Reservado',
      checkin_reminder: 'Lembrete Check-in',
      checkout_reminder: 'Lembrete Check-out'
    };
    return labels[trigger as keyof typeof labels] || trigger;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Comunicação Automática
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Envio automático de emails e WhatsApp para reservas
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto hover-scale"
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurar APIs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-scale transition-all">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold font-display">{stats.emailsSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Emails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-lg font-bold font-display">{stats.whatsappSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">WhatsApp Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-lg font-bold font-display">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-lg font-bold font-display">{stats.avgDeliveryTime}</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
          <TabsTrigger value="automations" className="text-xs sm:text-sm">Automações</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Templates de Mensagem</h2>
            <Button 
              size="sm" 
              className="hover-scale"
              onClick={() => {
                toast({
                  title: "Em desenvolvimento",
                  description: "Funcionalidade de criação de template será implementada em breve",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover-scale transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        template.type === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {template.type === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {getTriggerLabel(template.trigger)} • {template.type.toUpperCase()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={template.enabled} />
                      <Badge variant={template.enabled ? 'default' : 'secondary'}>
                        {template.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.subject && (
                    <div>
                      <label className="text-sm font-medium">Assunto:</label>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium">Mensagem:</label>
                    <div className="bg-muted/50 p-3 rounded-lg mt-1">
                      <p className="text-sm whitespace-pre-wrap">{template.message}</p>
                    </div>
                  </div>

                  {template.timing > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Enviar {template.timing}h antes do evento</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover-scale"
                      onClick={() => {
                        toast({
                          title: "Em desenvolvimento",
                          description: "Funcionalidade de edição será implementada em breve",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTestMessage(template)}
                      disabled={isConfiguring}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {isConfiguring ? 'Enviando...' : 'Testar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Regras de Automação</h2>
            <Button 
              size="sm" 
              className="hover-scale"
              onClick={() => {
                toast({
                  title: "Em desenvolvimento",
                  description: "Funcionalidade de criação de regra será implementada em breve",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="hover-scale transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>
                        {rule.totalSent.toLocaleString()} mensagens enviadas
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={rule.enabled} />
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Condições:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {rule.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Templates Vinculados:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {rule.templates.map((templateId, index) => {
                        const template = templates.find(t => t.id === templateId);
                        return template ? (
                          <Badge key={index} variant="secondary">
                            {template.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="text-sm text-muted-foreground">
                      Última execução: {rule.lastTriggered}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover-scale"
                      onClick={() => {
                        toast({
                          title: "Em desenvolvimento",
                          description: "Funcionalidade de edição será implementada em breve",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover-scale"
                      onClick={() => {
                        toast({
                          title: "Regra executada",
                          description: `Executando regra "${rule.name}"...`,
                        });
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Executar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de API</CardTitle>
              <CardDescription>
                Configure as integrações com provedores de email e WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Configurações de Email
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provedor</label>
                    <select 
                      className="w-full p-2 border rounded-lg bg-background"
                      value={settings.emailProvider}
                      onChange={(e) => setSettings({...settings, emailProvider: e.target.value})}
                    >
                      <option value="resend">Resend</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="Sua API key..."
                      value={settings.emailApiKey}
                      onChange={(e) => setSettings({...settings, emailApiKey: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Configurações do WhatsApp
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provedor</label>
                    <select 
                      className="w-full p-2 border rounded-lg bg-background"
                      value={settings.whatsappProvider}
                      onChange={(e) => setSettings({...settings, whatsappProvider: e.target.value})}
                    >
                      <option value="twilio">Twilio</option>
                      <option value="whatsapp-business">WhatsApp Business API</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="Sua API key..."
                      value={settings.whatsappApiKey}
                      onChange={(e) => setSettings({...settings, whatsappApiKey: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Número WhatsApp Business</label>
                  <Input
                    placeholder="+5511999999999"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações Gerais</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Modo de Teste</label>
                    <p className="text-sm text-muted-foreground">
                      Ativar para enviar mensagens apenas para números/emails de teste
                    </p>
                  </div>
                  <Switch 
                    checked={settings.testMode}
                    onCheckedChange={(checked) => setSettings({...settings, testMode: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full hover-scale">
                <Settings className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};