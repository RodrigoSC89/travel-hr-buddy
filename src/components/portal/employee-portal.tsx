import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Calendar, 
  FileText, 
  Award, 
  Clock, 
  Target,
  TrendingUp,
  MessageSquare,
  Bell,
  Download,
  Upload,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TimeEntry {
  date: string;
  hours: number;
  project: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  earned: boolean;
  earnedDate?: string;
  category: 'productivity' | 'quality' | 'collaboration' | 'innovation';
}

export const EmployeePortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      date: '2024-01-15',
      hours: 8,
      project: 'Nautilus One',
      description: 'Desenvolvimento de funcionalidades',
      status: 'approved'
    },
    {
      date: '2024-01-16',
      hours: 7.5,
      project: 'Maritime System',
      description: 'Testes e validação',
      status: 'pending'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Primeira Semana',
      description: 'Complete sua primeira semana no projeto',
      points: 100,
      earned: true,
      earnedDate: '2024-01-08',
      category: 'productivity'
    },
    {
      id: '2',
      title: 'Colaborador Exemplar',
      description: 'Ajude 5 colegas diferentes',
      points: 250,
      earned: true,
      earnedDate: '2024-01-12',
      category: 'collaboration'
    },
    {
      id: '3',
      title: 'Inovador',
      description: 'Sugira uma melhoria implementada',
      points: 500,
      earned: false,
      category: 'innovation'
    }
  ]);

  const [newTimeEntry, setNewTimeEntry] = useState({
    date: '',
    hours: '',
    project: '',
    description: ''
  });

  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: ''
  });

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const weeklyHours = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    })
    .reduce((sum, entry) => sum + entry.hours, 0);

  const addTimeEntry = () => {
    if (!newTimeEntry.date || !newTimeEntry.hours || !newTimeEntry.project) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const entry: TimeEntry = {
      ...newTimeEntry,
      hours: parseFloat(newTimeEntry.hours),
      status: 'pending'
    };

    setTimeEntries([...timeEntries, entry]);
    setNewTimeEntry({ date: '', hours: '', project: '', description: '' });
    
    toast({
      title: "Entrada registrada",
      description: "Suas horas foram registradas para aprovação"
    });
  };

  const submitLeaveRequest = () => {
    if (!leaveRequest.startDate || !leaveRequest.endDate) {
      toast({
        title: "Erro",
        description: "Selecione as datas de início e fim",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de licença foi enviada para aprovação"
    });
    
    setLeaveRequest({ startDate: '', endDate: '', type: 'vacation', reason: '' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portal do Funcionário</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), {user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalPoints} pts</div>
          <div className="text-sm text-muted-foreground">Total de Pontos</div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{weeklyHours}h</div>
                <div className="text-sm text-muted-foreground">Esta semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</div>
                <div className="text-sm text-muted-foreground">Conquistas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">Nível 3</div>
                <div className="text-sm text-muted-foreground">Ranking</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timesheet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="leave">Licenças</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Horas</CardTitle>
              <CardDescription>
                Registre suas horas trabalhadas por projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="date"
                  value={newTimeEntry.date}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, date: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Horas"
                  step="0.5"
                  value={newTimeEntry.hours}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, hours: e.target.value})}
                />
                <Input
                  placeholder="Projeto"
                  value={newTimeEntry.project}
                  onChange={(e) => setNewTimeEntry({...newTimeEntry, project: e.target.value})}
                />
                <Button onClick={addTimeEntry} className="w-full">
                  Adicionar
                </Button>
              </div>
              <Textarea
                placeholder="Descrição das atividades (opcional)"
                value={newTimeEntry.description}
                onChange={(e) => setNewTimeEntry({...newTimeEntry, description: e.target.value})}
              />

              <div className="space-y-2">
                {timeEntries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{entry.project}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.date} - {entry.hours}h
                      </div>
                      {entry.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {entry.description}
                        </div>
                      )}
                    </div>
                    <Badge variant={
                      entry.status === 'approved' ? 'default' : 
                      entry.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {entry.status === 'approved' ? 'Aprovado' :
                       entry.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitação de Licença</CardTitle>
              <CardDescription>
                Solicite férias, licença médica ou outros afastamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  placeholder="Data de início"
                  value={leaveRequest.startDate}
                  onChange={(e) => setLeaveRequest({...leaveRequest, startDate: e.target.value})}
                />
                <Input
                  type="date"
                  placeholder="Data de fim"
                  value={leaveRequest.endDate}
                  onChange={(e) => setLeaveRequest({...leaveRequest, endDate: e.target.value})}
                />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={leaveRequest.type}
                  onChange={(e) => setLeaveRequest({...leaveRequest, type: e.target.value})}
                >
                  <option value="vacation">Férias</option>
                  <option value="sick">Licença Médica</option>
                  <option value="personal">Licença Pessoal</option>
                  <option value="maternity">Licença Maternidade</option>
                </select>
              </div>
              <Textarea
                placeholder="Motivo (opcional para férias, obrigatório para outros tipos)"
                value={leaveRequest.reason}
                onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
              />
              <Button onClick={submitLeaveRequest} className="w-full">
                Enviar Solicitação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Conquistas</CardTitle>
              <CardDescription>
                Suas conquistas e progresso no sistema de gamificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 border rounded-lg ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {achievement.earned ? <CheckCircle className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{achievement.points} pts</Badge>
                          {achievement.earned && achievement.earnedDate && (
                            <span className="text-xs text-green-600">
                              Conquistado em {new Date(achievement.earnedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Pessoais</CardTitle>
              <CardDescription>
                Gerencie seus documentos e certificados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <Button variant="outline">Selecionar Arquivos</Button>
              </div>
              
              <div className="space-y-2">
                {[
                  { name: 'Certificado STCW.pdf', date: '2024-01-10', status: 'verified' },
                  { name: 'Carteira de Trabalho.pdf', date: '2024-01-08', status: 'pending' },
                  { name: 'Exame Médico.pdf', date: '2024-01-05', status: 'verified' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Enviado em {new Date(doc.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                        {doc.status === 'verified' ? 'Verificado' : 'Pendente'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
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
              <CardTitle>Feedback e Avaliações</CardTitle>
              <CardDescription>
                Visualize avaliações e forneça feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">8.5</div>
                    <div className="text-sm text-muted-foreground">Performance Geral</div>
                    <Progress value={85} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">9.2</div>
                    <div className="text-sm text-muted-foreground">Trabalho em Equipe</div>
                    <Progress value={92} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">7.8</div>
                    <div className="text-sm text-muted-foreground">Inovação</div>
                    <Progress value={78} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Comentário mais recente:</h3>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "Excelente desempenho no projeto Nautilus One. Demonstrou grande capacidade de resolver problemas complexos e colaborar efetivamente com a equipe."
                  </blockquote>
                  <div className="text-sm text-muted-foreground mt-2">
                    - Supervisor, 15 de Janeiro de 2024
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};