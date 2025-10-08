import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Mail, 
  FileText, 
  CheckCircle, 
  Star,
  MessageSquare,
  TrendingUp,
  Target,
  BookOpen,
  Video,
  Download,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface UserGroup {
  id: string;
  name: string;
  description: string;
  userCount: number;
  status: 'active' | 'invited' | 'pending';
  completedTraining: number;
}

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive';
  duration: string;
  completed: boolean;
}

interface Feedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  module: string;
  date: string;
}

const UserOnboardingCenter: React.FC = () => {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([
    {
      id: '1',
      name: 'Equipe Técnica Petrobras',
      description: 'Engenheiros e técnicos especialistas',
      userCount: 15,
      status: 'active',
      completedTraining: 12
    },
    {
      id: '2',
      name: 'Gestores Marítimos',
      description: 'Gerentes e supervisores de operações',
      userCount: 8,
      status: 'invited',
      completedTraining: 3
    },
    {
      id: '3',
      name: 'Operadores de Campo',
      description: 'Equipe operacional e tripulação',
      userCount: 25,
      status: 'pending',
      completedTraining: 0
    }
  ]);

  const [trainingMaterials] = useState<TrainingMaterial[]>([
    {
      id: '1',
      title: 'Introdução ao Nautilus One',
      type: 'video',
      duration: '15 min',
      completed: true
    },
    {
      id: '2',
      title: 'Navegação e Interface',
      type: 'interactive',
      duration: '20 min',
      completed: true
    },
    {
      id: '3',
      title: 'Gestão de Viagens e Reservas',
      type: 'video',
      duration: '25 min',
      completed: false
    },
    {
      id: '4',
      title: 'Sistema Marítimo e PEOTRAM',
      type: 'document',
      duration: '30 min',
      completed: false
    },
    {
      id: '5',
      title: 'Relatórios e Analytics',
      type: 'interactive',
      duration: '18 min',
      completed: false
    }
  ]);

  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      user: 'João Silva',
      rating: 5,
      comment: 'Interface muito intuitiva e funcional. O sistema atende perfeitamente nossas necessidades.',
      module: 'Dashboard',
      date: '2024-01-15'
    },
    {
      id: '2',
      user: 'Maria Santos',
      rating: 4,
      comment: 'Excelente para gestão de viagens. Poderia ter mais opções de filtros nos relatórios.',
      module: 'Viagens',
      date: '2024-01-14'
    },
    {
      id: '3',
      user: 'Carlos Lima',
      rating: 5,
      comment: 'O assistente IA é impressionante. Economiza muito tempo nas operações diárias.',
      module: 'IA Assistant',
      date: '2024-01-13'
    }
  ]);

  const [newInvite, setNewInvite] = useState({
    email: '',
    name: '',
    role: '',
    message: ''
  });

  const handleSendInvite = () => {
    if (!newInvite.email || !newInvite.name) {
      toast.error('Preencha email e nome para enviar convite');
      return;
    }

    toast.success(`Convite enviado para ${newInvite.name}`);
    setNewInvite({ email: '', name: '', role: '', message: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'invited':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'invited': return 'Convidado';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;

  const totalUsers = userGroups.reduce((sum, group) => sum + group.userCount, 0);
  const activeUsers = userGroups.filter(g => g.status === 'active').reduce((sum, group) => sum + group.userCount, 0);
  const completedTraining = userGroups.reduce((sum, group) => sum + group.completedTraining, 0);

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Treinamentos Concluídos</p>
                <p className="text-2xl font-bold">{completedTraining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Gestão de Usuários</TabsTrigger>
          <TabsTrigger value="training">Material de Treinamento</TabsTrigger>
          <TabsTrigger value="feedback">Feedback e Avaliações</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding Automático</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Grupos de Usuários */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Grupos de Usuários</CardTitle>
                  <CardDescription>
                    Gestão de usuários por perfil e departamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userGroups.map((group) => (
                      <div key={group.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          </div>
                          <Badge className={getStatusColor(group.status)}>
                            {getStatusText(group.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Usuários</p>
                            <p className="font-medium">{group.userCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Treinados</p>
                            <p className="font-medium">{group.completedTraining}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Progresso</p>
                            <div className="mt-1">
                              <Progress 
                                value={(group.completedTraining / group.userCount) * 100} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Convite */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Convidar Novo Usuário</CardTitle>
                  <CardDescription>
                    Envie convites para novos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={newInvite.name}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Perfil/Cargo</Label>
                    <Input
                      id="role"
                      placeholder="Engenheiro Senior"
                      value={newInvite.role}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem Personalizada</Label>
                    <Textarea
                      id="message"
                      placeholder="Bem-vindo ao Nautilus One..."
                      value={newInvite.message}
                      onChange={(e) => setNewInvite(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSendInvite} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Convite
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material de Treinamento</CardTitle>
              <CardDescription>
                Conteúdo educacional para onboarding de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingMaterials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        <span className="text-xs text-muted-foreground uppercase">
                          {material.type}
                        </span>
                      </div>
                      {material.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-1">{material.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{material.duration}</p>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" className="flex-1">
                        Visualizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback dos Usuários</CardTitle>
              <CardDescription>
                Avaliações e sugestões da comunidade de usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{feedback.user}</h4>
                        <p className="text-sm text-muted-foreground">{feedback.module}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2">{feedback.comment}</p>
                    <p className="text-xs text-muted-foreground">{feedback.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Automático</CardTitle>
              <CardDescription>
                Processo automatizado de integração de novos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Fluxo de Onboarding</h4>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: 'Envio de Convite', description: 'Email automático com credenciais', completed: true },
                      { step: 2, title: 'Primeiro Acesso', description: 'Tutorial interativo', completed: true },
                      { step: 3, title: 'Configuração de Perfil', description: 'Personalização inicial', completed: true },
                      { step: 4, title: 'Treinamento Básico', description: 'Módulos essenciais', completed: false },
                      { step: 5, title: 'Certificação', description: 'Avaliação de conhecimento', completed: false }
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.completed ? <CheckCircle className="w-4 h-4" /> : item.step}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Estatísticas de Onboarding</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Taxa de Conclusão</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Tempo Médio</span>
                        <span className="text-sm text-muted-foreground">45 min</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Satisfação</span>
                        <span className="text-sm text-muted-foreground">4.6/5</span>
                      </div>
                      <Progress value={92} className="h-2" />
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

export default UserOnboardingCenter;