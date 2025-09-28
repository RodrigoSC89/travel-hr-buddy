import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Plane,
  Hotel,
  Car,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  X,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TravelNotification {
  id: string;
  type: 'flight' | 'hotel' | 'car' | 'general' | 'alert' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
  relatedBooking?: string;
  category: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  flightUpdates: boolean;
  hotelUpdates: boolean;
  carUpdates: boolean;
  priceAlerts: boolean;
  bookingReminders: boolean;
  travelTips: boolean;
}

export const TravelNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<TravelNotification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    flightUpdates: true,
    hotelUpdates: true,
    carUpdates: true,
    priceAlerts: true,
    bookingReminders: true,
    travelTips: false
  });

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: TravelNotification[] = [
      {
        id: '1',
        type: 'flight',
        title: 'Voo LATAM 8439 - Portão Alterado',
        message: 'Seu voo para Rio de Janeiro teve o portão alterado para B12. Check-in já disponível.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        actionRequired: true,
        relatedBooking: 'TR-2024-ABC123',
        category: 'Atualização de Voo'
      },
      {
        id: '2',
        type: 'hotel',
        title: 'Check-in Antecipado Disponível',
        message: 'O Marriott Copacabana liberou check-in antecipado para 12:00. Confirme sua chegada.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        priority: 'medium',
        relatedBooking: 'TR-2024-DEF456',
        category: 'Hotel'
      },
      {
        id: '3',
        type: 'alert',
        title: 'Alerta de Preço - Passagem em Promoção',
        message: 'O preço da passagem São Paulo → Miami caiu 25%. Aproveite a oportunidade!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        priority: 'medium',
        category: 'Alerta de Preço'
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Lembrete: Documentação de Viagem',
        message: 'Não esqueça de verificar se seu passaporte está válido para a viagem internacional.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'low',
        relatedBooking: 'TR-2024-GHI789',
        category: 'Lembrete'
      },
      {
        id: '5',
        type: 'car',
        title: 'Locadora de Veículo Confirmada',
        message: 'Sua reserva na Hertz foi confirmada. Retire na chegada do aeroporto Santos Dumont.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true,
        priority: 'low',
        relatedBooking: 'TR-2024-JKL012',
        category: 'Locação de Veículos'
      },
      {
        id: '6',
        type: 'general',
        title: 'Dica de Viagem: Clima em Destino',
        message: 'Previsão de chuva no Rio de Janeiro nos próximos 3 dias. Leve guarda-chuva!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        read: true,
        priority: 'low',
        category: 'Dicas de Viagem'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => 
    filterType === 'all' || n.type === filterType || (filterType === 'unread' && !n.read)
  );

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "Notificações marcadas como lidas",
      description: "Todas as notificações foram marcadas como lidas."
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso."
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'reminder': return <Clock className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      {/* Filter and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todas</option>
            <option value="unread">Não lidas</option>
            <option value="flight">Voos</option>
            <option value="hotel">Hotéis</option>
            <option value="car">Carros</option>
            <option value="alert">Alertas</option>
            <option value="reminder">Lembretes</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar Todas como Lidas
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${notification.type === 'alert' ? 'bg-destructive/10 text-destructive' : 
                      notification.type === 'flight' ? 'bg-blue-50 text-blue-600' :
                      notification.type === 'hotel' ? 'bg-green-50 text-green-600' :
                      notification.type === 'car' ? 'bg-purple-50 text-purple-600' :
                      'bg-muted text-muted-foreground'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {getPriorityText(notification.priority)}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Ação Necessária
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{format(notification.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        <span>{notification.category}</span>
                        {notification.relatedBooking && (
                          <span className="font-mono">{notification.relatedBooking}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channels */}
          <div>
            <h4 className="font-medium mb-4">Canais de Notificação</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="push">Notificações Push</Label>
                </div>
                <Switch 
                  id="push"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email">Notificações por Email</Label>
                </div>
                <Switch 
                  id="email"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <Switch 
                  id="sms"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Types */}
          <div>
            <h4 className="font-medium mb-4">Tipos de Conteúdo</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plane className="h-4 w-4" />
                  <Label htmlFor="flights">Atualizações de Voos</Label>
                </div>
                <Switch 
                  id="flights"
                  checked={settings.flightUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, flightUpdates: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hotel className="h-4 w-4" />
                  <Label htmlFor="hotels">Atualizações de Hotéis</Label>
                </div>
                <Switch 
                  id="hotels"
                  checked={settings.hotelUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, hotelUpdates: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4" />
                  <Label htmlFor="cars">Atualizações de Carros</Label>
                </div>
                <Switch 
                  id="cars"
                  checked={settings.carUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, carUpdates: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4" />
                  <Label htmlFor="alerts">Alertas de Preço</Label>
                </div>
                <Switch 
                  id="alerts"
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, priceAlerts: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  <Label htmlFor="reminders">Lembretes de Viagem</Label>
                </div>
                <Switch 
                  id="reminders"
                  checked={settings.bookingReminders}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, bookingReminders: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4" />
                  <Label htmlFor="tips">Dicas de Viagem</Label>
                </div>
                <Switch 
                  id="tips"
                  checked={settings.travelTips}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, travelTips: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => {
              setShowSettings(false);
              toast({
                title: "Configurações salvas",
                description: "Suas preferências de notificação foram atualizadas."
              });
            }}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">Central de Notificações</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount} não lidas
            </Badge>
          )}
        </div>
      </div>

      {showSettings ? renderSettings() : renderNotifications()}
    </div>
  );
};