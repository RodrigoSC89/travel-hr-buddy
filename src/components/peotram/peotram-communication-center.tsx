import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Radio, 
  Phone, 
  Mail, 
  MessageSquare, 
  Bell, 
  Users,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Antenna,
  Satellite,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Megaphone,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  type: 'radio' | 'email' | 'sms' | 'announcement' | 'emergency';
  sender: string;
  recipient: string | 'all' | 'bridge' | 'engine-room' | 'deck-crew';
  subject?: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  channel?: string;
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'radio' | 'intercom' | 'satellite' | 'cellular';
  frequency?: string;
  status: 'active' | 'inactive' | 'maintenance';
  participants: string[];
  lastActivity: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  status: 'available' | 'busy' | 'offline' | 'emergency';
  radioChannel?: string;
  phoneExtension?: string;
  emergencyContact: boolean;
}

export const PeotramCommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getDemoMessages());
  const [channels, setChannels] = useState<CommunicationChannel[]>(getDemoChannels());
  const [contacts, setContacts] = useState<Contact[]>(getDemoContacts());
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('CH001');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  function getDemoMessages(): Message[] {
    return [
      {
        id: 'MSG001',
        type: 'radio',
        sender: 'Ponte de Comando',
        recipient: 'Praça de Máquinas',
        content: 'Confirmação para redução de velocidade para 12 nós',
        priority: 'normal',
        status: 'delivered',
        timestamp: '2024-01-22T10:30:00Z',
        channel: 'CH001'
      },
      {
        id: 'MSG002',
        type: 'emergency',
        sender: 'Deck Crew',
        recipient: 'all',
        content: 'EMERGÊNCIA: Princípio de incêndio no convés principal',
        priority: 'urgent',
        status: 'sent',
        timestamp: '2024-01-22T09:15:00Z',
        channel: 'EMERGENCY'
      },
      {
        id: 'MSG003',
        type: 'email',
        sender: 'Capitão Silva',
        recipient: 'bridge',
        subject: 'Briefing da Manhã',
        content: 'Reunião de briefing às 08:00 na ponte de comando',
        priority: 'normal',
        status: 'read',
        timestamp: '2024-01-22T07:45:00Z'
      }
    ];
  }

  function getDemoChannels(): CommunicationChannel[] {
    return [
      {
        id: 'CH001',
        name: 'Ponte - Máquinas',
        type: 'radio',
        frequency: '156.800 MHz',
        status: 'active',
        participants: ['Capitão Silva', 'Chefe de Máquinas'],
        lastActivity: '2024-01-22T10:30:00Z'
      },
      {
        id: 'CH002',
        name: 'Comunicação Geral',
        type: 'radio',
        frequency: '157.000 MHz',
        status: 'active',
        participants: ['Toda Tripulação'],
        lastActivity: '2024-01-22T09:45:00Z'
      },
      {
        id: 'EMERGENCY',
        name: 'Canal de Emergência',
        type: 'radio',
        frequency: '156.525 MHz',
        status: 'active',
        participants: ['Equipe de Emergência'],
        lastActivity: '2024-01-22T09:15:00Z'
      }
    ];
  }

  function getDemoContacts(): Contact[] {
    return [
      {
        id: 'CONT001',
        name: 'Capitão Roberto Silva',
        role: 'Comandante',
        department: 'Ponte',
        location: 'Ponte de Comando',
        status: 'available',
        radioChannel: 'CH001',
        phoneExtension: '100',
        emergencyContact: true
      },
      {
        id: 'CONT002',
        name: 'João Santos',
        role: 'Chefe de Máquinas',
        department: 'Máquinas',
        location: 'Praça de Máquinas',
        status: 'busy',
        radioChannel: 'CH001',
        phoneExtension: '200',
        emergencyContact: true
      },
      {
        id: 'CONT003',
        name: 'Maria Costa',
        role: 'Enfermeira',
        department: 'Saúde',
        location: 'Enfermaria',
        status: 'available',
        radioChannel: 'EMERGENCY',
        phoneExtension: '300',
        emergencyContact: true
      }
    ];
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/20 text-warning border-warning/30';
      case 'normal': return 'bg-info/20 text-info border-info/30';
      case 'low': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/20 text-success border-success/30';
      case 'busy': return 'bg-warning/20 text-warning border-warning/30';
      case 'offline': return 'bg-muted/20 text-muted-foreground border-muted/30';
      case 'emergency': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio': return <Radio className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const selectedChannelData = channels.find(ch => ch.id === selectedChannel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central de Comunicações</h2>
          <p className="text-muted-foreground">
            Coordenação de comunicações e mensagens da embarcação
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergência
          </Button>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Nova Mensagem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="message-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de mensagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radio">Rádio</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="announcement">Anúncio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-priority">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-recipient">Destinatário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar destinatário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toda Tripulação</SelectItem>
                      <SelectItem value="bridge">Ponte de Comando</SelectItem>
                      <SelectItem value="engine-room">Praça de Máquinas</SelectItem>
                      <SelectItem value="deck-crew">Tripulação de Convés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-subject">Assunto</Label>
                  <Input id="message-subject" placeholder="Assunto da mensagem" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-content">Conteúdo</Label>
                  <Textarea id="message-content" placeholder="Digite sua mensagem" rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewMessageOpen(false)}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="radio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="radio">Rádio</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="radio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5" />
                      {selectedChannelData?.name}
                    </CardTitle>
                    <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                      {selectedChannelData?.frequency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-64 w-full border rounded-lg p-4">
                    <div className="space-y-3">
                      {messages.filter(m => m.channel === selectedChannel).map((message) => (
                        <div key={message.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMicMuted(!isMicMuted)}
                      className={isMicMuted ? 'bg-destructive/20' : ''}
                    >
                      {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                      className={isSpeakerMuted ? 'bg-destructive/20' : ''}
                    >
                      {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Input placeholder="Digite sua mensagem..." className="flex-1" />
                    <Button>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Canais Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {channels.map((channel) => (
                      <Button
                        key={channel.id}
                        variant={selectedChannel === channel.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedChannel(channel.id)}
                      >
                        <Radio className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{channel.name}</p>
                          <p className="text-xs text-muted-foreground">{channel.frequency}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(message.type)}
                      <div>
                        <CardTitle className="text-lg">
                          {message.subject || `${message.type.toUpperCase()} - ${message.sender}`}
                        </CardTitle>
                        <CardDescription>
                          De: {message.sender} Para: {message.recipient}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                      <Badge variant="outline" className={
                        message.status === 'read' ? 'bg-success/20 text-success border-success/30' :
                        message.status === 'delivered' ? 'bg-info/20 text-info border-info/30' :
                        message.status === 'failed' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                        'bg-muted/20 text-muted-foreground border-muted/30'
                      }>
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{message.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                    {message.channel && (
                      <>
                        <Radio className="w-3 h-3 ml-2" />
                        <span>{message.channel}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                  <CardDescription>{contact.role} - {contact.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Localização:</p>
                    <p>{contact.location}</p>
                  </div>
                  
                  {contact.radioChannel && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Canal de Rádio:</p>
                      <p>{contact.radioChannel}</p>
                    </div>
                  )}
                  
                  {contact.phoneExtension && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Ramal:</p>
                      <p>{contact.phoneExtension}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Radio className="w-3 h-3 mr-1" />
                      Rádio
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Ligar
                    </Button>
                  </div>
                  
                  {contact.emergencyContact && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Contato de Emergência
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="space-y-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel.type === 'radio' ? <Radio className="w-5 h-5" /> :
                       channel.type === 'satellite' ? <Satellite className="w-5 h-5" /> :
                       <Antenna className="w-5 h-5" />}
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={
                      channel.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                      channel.status === 'maintenance' ? 'bg-warning/20 text-warning border-warning/30' :
                      'bg-muted/20 text-muted-foreground border-muted/30'
                    }>
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo:</p>
                      <p>{channel.type}</p>
                    </div>
                    {channel.frequency && (
                      <div>
                        <p className="text-muted-foreground">Frequência:</p>
                        <p>{channel.frequency}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Participantes:</p>
                    <div className="flex flex-wrap gap-1">
                      {channel.participants.map((participant, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-muted-foreground">Última atividade:</p>
                    <p>{new Date(channel.lastActivity).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="text-center p-8">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configurações de Comunicação</h3>
            <p className="text-muted-foreground mb-4">
              Configure canais, frequências e preferências de comunicação
            </p>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configurar Sistema
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};