import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Heart,
  Stethoscope,
  GraduationCap,
  Anchor,
  Ship,
  Map,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  BarChart3,
  Zap,
  Globe,
  Award,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CrewScheduleVisualizer } from './crew-schedule-visualizer';

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  vessel?: string;
  status: 'onboard' | 'on_leave' | 'available' | 'training' | 'medical_leave';
  contract: {
    start_date: string;
    end_date: string;
    duration_months: number;
  };
  certifications: Certification[];
  medical: {
    last_checkup: string;
    next_due: string;
    status: 'valid' | 'expiring' | 'expired';
  };
  contact: {
    email: string;
    phone: string;
    emergency_contact: string;
  };
  performance: {
    rating: number;
    last_evaluation: string;
    areas_improvement: string[];
  };
  sea_service: {
    total_months: number;
    vessels_served: string[];
    last_voyage_end: string;
  };
}

interface Certification {
  id: string;
  name: string;
  type: 'stcw' | 'mlc' | 'ism' | 'security' | 'medical' | 'technical';
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  certificate_number: string;
  status: 'valid' | 'expiring' | 'expired';
  renewal_required: boolean;
}

interface WellnessMetric {
  crew_id: string;
  date: string;
  stress_level: number;
  sleep_quality: number;
  physical_health: number;
  mental_health: number;
  fatigue_level: number;
  social_connection: number;
}

interface TrainingProgram {
  id: string;
  name: string;
  type: 'safety' | 'technical' | 'leadership' | 'compliance' | 'wellness';
  duration_hours: number;
  participants: string[];
  completion_rate: number;
  next_session: string;
  instructor: string;
  virtual_reality: boolean;
}

export const MaritimeHRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessMetric[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockCrew: CrewMember[] = [
      {
        id: '1',
        name: 'Capitão João Silva',
        rank: 'Master',
        nationality: 'Brazilian',
        vessel: 'MV Nautilus Pioneer',
        status: 'onboard',
        contract: {
          start_date: '2023-06-01',
          end_date: '2024-02-01',
          duration_months: 8
        },
        certifications: [
          {
            id: 'c1',
            name: 'Certificate of Competency - Master',
            type: 'stcw',
            issue_date: '2020-03-15',
            expiry_date: '2025-03-15',
            issuing_authority: 'Brazilian Maritime Authority',
            certificate_number: 'BMA-2020-M-001',
            status: 'valid',
            renewal_required: false
          }
        ],
        medical: {
          last_checkup: '2023-11-15',
          next_due: '2024-05-15',
          status: 'valid'
        },
        contact: {
          email: 'joao.silva@nautilus.com',
          phone: '+55 11 99999-0001',
          emergency_contact: '+55 11 88888-0001'
        },
        performance: {
          rating: 9.2,
          last_evaluation: '2023-12-01',
          areas_improvement: ['Bridge Team Management', 'Digital Navigation']
        },
        sea_service: {
          total_months: 180,
          vessels_served: ['MV Atlantic Explorer', 'MV Pacific Star', 'MV Nautilus Pioneer'],
          last_voyage_end: '2023-05-30'
        }
      },
      {
        id: '2',
        name: 'Oficial Maria Santos',
        rank: 'Chief Officer',
        nationality: 'Brazilian',
        vessel: 'MV Atlantic Explorer',
        status: 'on_leave',
        contract: {
          start_date: '2023-08-01',
          end_date: '2024-04-01',
          duration_months: 8
        },
        certifications: [
          {
            id: 'c2',
            name: 'Certificate of Competency - Chief Officer',
            type: 'stcw',
            issue_date: '2019-06-20',
            expiry_date: '2024-06-20',
            issuing_authority: 'Brazilian Maritime Authority',
            certificate_number: 'BMA-2019-CO-002',
            status: 'expiring',
            renewal_required: true
          }
        ],
        medical: {
          last_checkup: '2023-10-20',
          next_due: '2024-04-20',
          status: 'valid'
        },
        contact: {
          email: 'maria.santos@nautilus.com',
          phone: '+55 11 99999-0002',
          emergency_contact: '+55 11 88888-0002'
        },
        performance: {
          rating: 8.8,
          last_evaluation: '2023-11-15',
          areas_improvement: ['ECDIS Advanced', 'Cargo Operations']
        },
        sea_service: {
          total_months: 96,
          vessels_served: ['MV Coastal Runner', 'MV Atlantic Explorer'],
          last_voyage_end: '2023-07-15'
        }
      }
    ];

    const mockTraining: TrainingProgram[] = [
      {
        id: '1',
        name: 'Advanced Bridge Resource Management',
        type: 'safety',
        duration_hours: 40,
        participants: ['1', '2'],
        completion_rate: 85,
        next_session: '2024-02-15T09:00:00Z',
        instructor: 'Capt. Roberto Lima',
        virtual_reality: true
      },
      {
        id: '2',
        name: 'Mental Health and Wellness at Sea',
        type: 'wellness',
        duration_hours: 16,
        participants: ['1', '2'],
        completion_rate: 92,
        next_session: '2024-02-20T14:00:00Z',
        instructor: 'Dr. Ana Carvalho',
        virtual_reality: false
      }
    ];

    const mockWellness: WellnessMetric[] = [
      {
        crew_id: '1',
        date: '2024-01-15',
        stress_level: 3,
        sleep_quality: 8,
        physical_health: 9,
        mental_health: 8,
        fatigue_level: 4,
        social_connection: 7
      }
    ];

    setCrewMembers(mockCrew);
    setTrainingPrograms(mockTraining);
    setWellnessData(mockWellness);
    setSelectedCrew(mockCrew[0]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onboard': return 'text-blue-600 bg-blue-100';
      case 'on_leave': return 'text-green-600 bg-green-100';
      case 'available': return 'text-gray-600 bg-gray-100';
      case 'training': return 'text-purple-600 bg-purple-100';
      case 'medical_leave': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'onboard': return 'A Bordo';
      case 'on_leave': return 'De Folga';
      case 'available': return 'Disponível';
      case 'training': return 'Treinamento';
      case 'medical_leave': return 'Licença Médica';
      default: return 'Desconhecido';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expiring': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleWellnessAlert = () => {
    toast({
      title: "Alerta de Bem-estar",
      description: "IA detectou sinais de estresse elevado em 2 tripulantes. Consulta com psicólogo recomendada.",
      variant: "destructive"
    });
  };

  const handleTelemedicine = () => {
    toast({
      title: "Telemedicina Ativada",
      description: "Conectando com Dr. Anderson - Especialista em Medicina Marítima",
    });
  };

  const handleComplianceCheck = () => {
    toast({
      title: "Verificação de Compliance",
      description: "Sistema detectou 3 certificações vencendo nos próximos 30 dias. Renovação automática iniciada.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 p-8 text-azure-50">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-azure-100/20 rounded-2xl">
              <Users className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                RH Marítimo Inteligente
              </h1>
              <p className="text-xl opacity-90">
                Gestão Avançada de Recursos Humanos para Operações Marítimas
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                <span>Tripulantes Ativos</span>
              </div>
              <div className="text-3xl font-bold">{crewMembers.length}</div>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-1">🧭 Navegação</h3>
              <p className="text-lg font-bold">Ativa</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
              </div>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-1">🌊 Condições Marítimas</h3>
              <p className="text-lg font-bold">Favoráveis</p>
              <p className="text-xs opacity-70">Vento: 15 nós</p>
            </div>
            <div className="bg-azure-100/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5" />
                <span>Wellness Score</span>
              </div>
              <div className="text-3xl font-bold">8.4/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Escalas
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Certificações
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Bem-estar
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Treinamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crew Status Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Status da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crewMembers.map((crew) => (
                    <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{crew.name}</h3>
                          <p className="text-sm text-muted-foreground">{crew.rank}</p>
                          <p className="text-xs text-muted-foreground">{crew.vessel || 'Sem embarcação'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(crew.status)}>
                          {getStatusLabel(crew.status)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Performance: {crew.performance.rating}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ações Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={handleWellnessAlert} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Verificar Bem-estar
                  </Button>
                  <Button 
                    onClick={handleTelemedicine} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Telemedicina
                  </Button>
                  <Button 
                    onClick={handleComplianceCheck} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verificar Compliance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planejar Rotação
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Alertas IA</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <span className="font-medium">Certificação:</span> 3 expirando em 30 dias
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <span className="font-medium">Rotação:</span> Otimização sugerida para Santos
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <span className="font-medium">Wellness:</span> Índice geral em alta
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance STCW</p>
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wellness Médio</p>
                    <p className="text-2xl font-bold text-blue-600">8.4/10</p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Treinamentos</p>
                    <p className="text-2xl font-bold text-purple-600">{trainingPrograms.length}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Economia IA</p>
                    <p className="text-2xl font-bold text-orange-600">R$ 45k</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crew List */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Tripulante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {crewMembers.map((crew) => (
                    <div 
                      key={crew.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCrew?.id === crew.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCrew(crew)}
                    >
                      <h3 className="font-semibold">{crew.name}</h3>
                      <p className="text-sm text-muted-foreground">{crew.rank}</p>
                      <Badge className={getStatusColor(crew.status)} variant="outline">
                        {getStatusLabel(crew.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Adicionar Tripulante
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Crew Details */}
            {selectedCrew && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedCrew.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Informações Pessoais</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Posto:</span>
                            <span className="font-medium">{selectedCrew.rank}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nacionalidade:</span>
                            <span className="font-medium">{selectedCrew.nationality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Embarcação:</span>
                            <span className="font-medium">{selectedCrew.vessel || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={getStatusColor(selectedCrew.status)} variant="outline">
                              {getStatusLabel(selectedCrew.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Contrato Atual</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Início:</span>
                            <span className="font-medium">
                              {new Date(selectedCrew.contract.start_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fim:</span>
                            <span className="font-medium">
                              {new Date(selectedCrew.contract.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duração:</span>
                            <span className="font-medium">{selectedCrew.contract.duration_months} meses</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Performance</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Avaliação:</span>
                            <span className="font-medium">{selectedCrew.performance.rating}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${selectedCrew.performance.rating * 10}%` }}
                            ></div>
                          </div>
                          <div className="mt-2">
                            <span className="text-muted-foreground">Áreas de Melhoria:</span>
                            <ul className="list-disc list-inside mt-1 text-xs">
                              {selectedCrew.performance.areas_improvement.map((area, index) => (
                                <li key={index}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Status Médico</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Último Exame:</span>
                            <span className="font-medium">
                              {new Date(selectedCrew.medical.last_checkup).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Próximo Exame:</span>
                            <span className="font-medium">
                              {new Date(selectedCrew.medical.next_due).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant="outline" className="text-green-600">
                              Válido
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Contato</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span className="font-medium">{selectedCrew.contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span className="font-medium">{selectedCrew.contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">{selectedCrew.contact.emergency_contact}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Serviço no Mar</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total de Meses:</span>
                            <span className="font-medium">{selectedCrew.sea_service.total_months}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Embarcações Servidas:</span>
                            <span className="font-medium">{selectedCrew.sea_service.vessels_served.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Última Viagem:</span>
                            <span className="font-medium">
                              {new Date(selectedCrew.sea_service.last_voyage_end).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Documentos
                    </Button>
                    <Button variant="outline">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Consulta Médica
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Rotação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestão de Certificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sistema de Certificações</h3>
                <p className="text-muted-foreground">
                  Módulo de gestão de certificações STCW, MLC e ISM em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Programa de Bem-estar Marítimo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wellness Inteligente</h3>
                <p className="text-muted-foreground">
                  Sistema de monitoramento de bem-estar e telemedicina em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Programas de Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {trainingPrograms.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {program.duration_hours}h • {program.participants.length} participantes
                        </p>
                        {program.virtual_reality && (
                          <Badge variant="outline" className="mt-1">
                            🥽 Realidade Virtual
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{program.completion_rate}%</div>
                      <p className="text-sm text-muted-foreground">
                        Próxima sessão: {new Date(program.next_session).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <CrewScheduleVisualizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};