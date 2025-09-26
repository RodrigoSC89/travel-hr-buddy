import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Ship, 
  Bell, 
  Settings, 
  Clock, 
  MapPin, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  productName: string;
  route: string;
  vessel: string;
  currentPrice: number;
  targetPrice: number;
  thresholdType: 'below' | 'above' | 'change';
  changePercentage?: number;
  isActive: boolean;
  lastTriggered?: Date;
  triggeredCount: number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  customRules: {
    timeOfDay?: string;
    dayOfWeek?: string[];
    season?: string;
  };
}

interface AlertGroup {
  id: string;
  name: string;
  route: string;
  vessel: string;
  alerts: string[];
  avgSavings: number;
  status: 'active' | 'paused';
}

interface AlertHistory {
  id: string;
  alertId: string;
  triggeredAt: Date;
  previousPrice: number;
  newPrice: number;
  actionTaken: 'purchased' | 'ignored' | 'snoozed';
  savings?: number;
  notes?: string;
}

const mockAlerts: PriceAlert[] = [
  {
    id: '1',
    productName: 'Combustível Marítimo - MGO',
    route: 'Santos - Rio de Janeiro',
    vessel: 'MV Nautilus Pioneer',
    currentPrice: 850,
    targetPrice: 800,
    thresholdType: 'below',
    isActive: true,
    triggeredCount: 3,
    lastTriggered: new Date(2024, 0, 15),
    notifications: { email: true, push: true, sms: false },
    customRules: { timeOfDay: '09:00', dayOfWeek: ['segunda', 'terça'] }
  },
  {
    id: '2',
    productName: 'Lubrificantes - Óleo Motor',
    route: 'Salvador - Fortaleza',
    vessel: 'MV Atlantic Explorer',
    currentPrice: 120,
    targetPrice: 100,
    thresholdType: 'change',
    changePercentage: -10,
    isActive: true,
    triggeredCount: 1,
    notifications: { email: true, push: false, sms: true },
    customRules: { season: 'baixa' }
  },
];

const mockGroups: AlertGroup[] = [
  {
    id: '1',
    name: 'Rota Santos-RJ',
    route: 'Santos - Rio de Janeiro',
    vessel: 'MV Nautilus Pioneer',
    alerts: ['1'],
    avgSavings: 15.5,
    status: 'active'
  },
  {
    id: '2',
    name: 'Rota Nordeste',
    route: 'Salvador - Fortaleza',
    vessel: 'MV Atlantic Explorer',
    alerts: ['2'],
    avgSavings: 22.3,
    status: 'active'
  },
];

const mockHistory: AlertHistory[] = [
  {
    id: '1',
    alertId: '1',
    triggeredAt: new Date(2024, 0, 15, 9, 30),
    previousPrice: 870,
    newPrice: 795,
    actionTaken: 'purchased',
    savings: 1200,
    notes: 'Compra aprovada pelo gestor'
  },
  {
    id: '2',
    alertId: '2',
    triggeredAt: new Date(2024, 0, 12, 14, 15),
    previousPrice: 120,
    newPrice: 108,
    actionTaken: 'ignored',
    notes: 'Estoque ainda suficiente'
  },
];

export const EnhancedAlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockAlerts);
  const [groups] = useState<AlertGroup[]>(mockGroups);
  const [history] = useState<AlertHistory[]>(mockHistory);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const { toast } = useToast();

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
    
    toast({
      title: "Alerta Atualizado",
      description: "Configuração do alerta foi modificada com sucesso.",
    });
  };

  const createAlertGroup = () => {
    toast({
      title: "Grupo Criado",
      description: "Novo grupo de alertas criado. Configure as regras personalizadas.",
    });
  };

  const getThresholdLabel = (alert: PriceAlert) => {
    switch (alert.thresholdType) {
      case 'below':
        return `Abaixo de R$ ${alert.targetPrice}`;
      case 'above':
        return `Acima de R$ ${alert.targetPrice}`;
      case 'change':
        return `Variação ${alert.changePercentage}%`;
      default:
        return 'N/A';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'purchased': return 'bg-success text-white';
      case 'ignored': return 'bg-muted text-muted-foreground';
      case 'snoozed': return 'bg-warning text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Gestão Avançada de Alertas
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={createAlertGroup}>
                <Target className="w-4 h-4 mr-2" />
                Novo Grupo
              </Button>
              <Button>
                <Bell className="w-4 h-4 mr-2" />
                Criar Alerta
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alertas Individuais</TabsTrigger>
          <TabsTrigger value="groups">Grupos por Rota</TabsTrigger>
          <TabsTrigger value="rules">Regras Customizadas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Individual Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{alert.productName}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {alert.route}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Ship className="w-3 h-3" />
                        {alert.vessel}
                      </div>
                    </div>
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Preço Atual:</span>
                      <span className="font-medium">R$ {alert.currentPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Meta:</span>
                      <span className="font-medium">{getThresholdLabel(alert)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(alert.isActive)}>
                      {alert.isActive ? 'Ativo' : 'Pausado'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {alert.triggeredCount} disparos
                    </div>
                  </div>

                  {alert.lastTriggered && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Último: {alert.lastTriggered.toLocaleDateString('pt-BR')}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-1">
                      {alert.notifications.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                      {alert.notifications.push && <Badge variant="outline" className="text-xs">Push</Badge>}
                      {alert.notifications.sms && <Badge variant="outline" className="text-xs">SMS</Badge>}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups by Route */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge className={group.status === 'active' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}>
                      {group.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {group.route}
                    </div>
                    <div className="flex items-center gap-1">
                      <Ship className="w-3 h-3" />
                      {group.vessel}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{group.alerts.length}</div>
                      <div className="text-xs text-muted-foreground">Alertas Ativos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{group.avgSavings}%</div>
                      <div className="text-xs text-muted-foreground">Economia Média</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Grupo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Rules */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Notificação Customizadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Horário Preferido</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Manhã (08:00 - 12:00)</SelectItem>
                        <SelectItem value="afternoon">Tarde (12:00 - 18:00)</SelectItem>
                        <SelectItem value="evening">Noite (18:00 - 22:00)</SelectItem>
                        <SelectItem value="anytime">Qualquer horário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Frequência Máxima</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Imediato</SelectItem>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Limiar de Urgência (%)</Label>
                    <Input type="number" placeholder="Ex: 20" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notificações por Canal</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Push Notification</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS (Urgente)</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(item.actionTaken)}>
                            {item.actionTaken === 'purchased' ? 'Comprado' : 
                             item.actionTaken === 'ignored' ? 'Ignorado' : 'Adiado'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.triggeredAt.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Preço:</span> 
                            R$ {item.previousPrice} → R$ {item.newPrice}
                            <span className={`ml-2 ${item.newPrice < item.previousPrice ? 'text-success' : 'text-destructive'}`}>
                              ({item.newPrice < item.previousPrice ? '-' : '+'}
                              {Math.abs(((item.newPrice - item.previousPrice) / item.previousPrice) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          
                          {item.savings && (
                            <div className="text-sm text-success">
                              <span className="font-medium">Economia:</span> R$ {item.savings}
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Notas:</span> {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.actionTaken === 'purchased' ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};