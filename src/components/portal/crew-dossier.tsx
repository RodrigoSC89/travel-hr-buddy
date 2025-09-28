import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Ship,
  Award,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Download,
  Search,
  Filter,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Brain,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CrewSelection } from './crew-selection';

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  employee_id: string;
  nationality: string;
  email: string;
  phone: string;
}

interface CrewDossier {
  id: string;
  internal_registration: string;
  cat_number: string;
  cir_number: string;
  cir_expiry_date: string;
  crew_member: CrewMember;
}

interface Embarkation {
  id: string;
  vessel_name: string;
  vessel_type: string;
  vessel_class: string;
  dp_operation_type: string;
  equipment_operated: string[];
  embark_date: string;
  disembark_date: string;
  embark_location: string;
  disembark_location: string;
  hours_worked: number;
  function_role: string;
  observations: string;
}

interface Certification {
  id: string;
  certification_name: string;
  certification_type: string;
  issue_date: string;
  expiry_date: string | null;
  issuing_authority: string;
  certificate_number: string | null;
  status: string;
  grade: number | null;
  notes: string | null;
}

interface Evaluation {
  id: string;
  evaluation_period: string;
  technical_score: number;
  behavioral_score: number;
  overall_score: number;
  positive_feedback: string;
  improvement_areas: string;
  incidents: string;
  evaluator_name: string;
  evaluation_date: string;
}

export const CrewDossier: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<CrewDossier | null>(null);
  const [embarkations, setEmbarkations] = useState<Embarkation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVesselType, setFilterVesselType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    loadCrewDossier();
  }, [selectedCrewId]);

  const loadCrewDossier = async () => {
    if (!selectedCrewId) return;
    
    setLoading(true);
    try {
      // Carregar dossiê
      const { data: dossierData, error: dossierError } = await supabase
        .from('crew_dossier')
        .select(`
          *,
          crew_member:crew_members(*)
        `)
        .eq('crew_member_id', selectedCrewId)
        .single();

      if (dossierError) throw dossierError;
      setDossier(dossierData);

      // Carregar embarques
      const { data: embarkationsData, error: embarkationsError } = await supabase
        .from('crew_embarkations')
        .select('*')
        .eq('crew_member_id', selectedCrewId)
        .order('embark_date', { ascending: false });

      if (embarkationsError) throw embarkationsError;
      setEmbarkations(embarkationsData || []);

      // Carregar certificações
      const { data: certificationsData, error: certificationsError } = await supabase
        .from('crew_certifications')
        .select('*')
        .eq('crew_member_id', selectedCrewId)
        .order('issue_date', { ascending: false });

      if (certificationsError) throw certificationsError;
      setCertifications(certificationsData || []);

      // Carregar avaliações
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from('crew_evaluations')
        .select('*')
        .eq('crew_member_id', selectedCrewId)
        .order('evaluation_date', { ascending: false });

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dossiê",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-success text-success-foreground">Válido</Badge>;
      case 'expired':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateTotalHours = () => {
    return embarkations.reduce((total, embarkation) => total + (embarkation.hours_worked || 0), 0);
  };

  const getMostFrequentVessel = () => {
    const vesselCount = embarkations.reduce((acc, embarkation) => {
      acc[embarkation.vessel_name] = (acc[embarkation.vessel_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(vesselCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  };

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overall_score, 0);
    return (totalScore / evaluations.length).toFixed(1);
  };

  const getExpiringCertifications = () => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    return certifications.filter(cert => {
      if (!cert.expiry_date) return false;
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= threeMonthsFromNow && expiryDate >= today;
    });
  };

  const filteredEmbarkations = embarkations.filter(embarkation => {
    const matchesSearch = embarkation.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         embarkation.vessel_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVesselType = filterVesselType === 'all' || embarkation.vessel_type === filterVesselType;
    return matchesSearch && matchesVesselType;
  });

  if (!selectedCrewId) {
    return <CrewSelection onSelect={setSelectedCrewId} />;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dossiê...</p>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-warning" />
          <h2 className="text-2xl font-bold mb-2">Dossiê não encontrado</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar o dossiê do tripulante selecionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Botão Voltar */}
      <Button 
        variant="outline" 
        onClick={() => setSelectedCrewId(null)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar à Seleção
      </Button>
      {/* Header com informações do tripulante */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">
              {dossier.crew_member.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{dossier.crew_member.full_name}</h1>
            <p className="text-lg text-muted-foreground">{dossier.crew_member.position}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Matrícula</p>
                <p className="font-medium">{dossier.internal_registration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">C.A.T.</p>
                <p className="font-medium">{dossier.cat_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CIR</p>
                <p className="font-medium">{dossier.cir_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CIR Validade</p>
                <p className="font-medium">
                  {dossier.cir_expiry_date ? 
                    format(new Date(dossier.cir_expiry_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard resumido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Embarques</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{embarkations.length}</div>
            <p className="text-xs text-muted-foreground">
              Embarcação mais frequente: {getMostFrequentVessel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Embarcado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalHours().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageScore()}</div>
            <Progress value={Number(getAverageScore()) * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificações</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certifications.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {getExpiringCertifications().length} vencendo em breve
                    </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas IA */}
      {getExpiringCertifications().length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Alertas Inteligentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{getExpiringCertifications().length} certificação(ões)</strong> vencendo nos próximos 3 meses:
              </p>
              <ul className="text-sm space-y-1">
                {getExpiringCertifications().slice(0, 3).map((cert) => (
                  <li key={cert.id} className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    {cert.certification_name} - Vence em {format(new Date(cert.expiry_date), 'dd/MM/yyyy')}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="embarkations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="embarkations">Histórico de Embarques</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="embarkations" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por embarcação ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterVesselType} onValueChange={setFilterVesselType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="PSV">PSV</SelectItem>
                <SelectItem value="AHTS">AHTS</SelectItem>
                <SelectItem value="OSRV">OSRV</SelectItem>
                <SelectItem value="OSV">OSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredEmbarkations.map((embarkation) => (
              <Card key={embarkation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{embarkation.vessel_name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{embarkation.vessel_type}</span>
                        {embarkation.vessel_class && <span>• {embarkation.vessel_class}</span>}
                        <span>• {embarkation.function_role}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {embarkation.hours_worked || 0}h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Embarque</p>
                      <p className="font-medium">
                        {format(new Date(embarkation.embark_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">{embarkation.embark_location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Desembarque</p>
                      <p className="font-medium">
                        {embarkation.disembark_date ? 
                          format(new Date(embarkation.disembark_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                          'Em andamento'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">{embarkation.disembark_location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Operação DP</p>
                      <p className="font-medium">{embarkation.dp_operation_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equipamentos</p>
                      <p className="font-medium">
                        {embarkation.equipment_operated?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                  
                  {embarkation.equipment_operated && embarkation.equipment_operated.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Equipamentos operados:</p>
                      <div className="flex flex-wrap gap-1">
                        {embarkation.equipment_operated.map((equipment, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {embarkation.observations && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                      <p className="text-sm">{embarkation.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredEmbarkations.length === 0 && (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum embarque encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id} className={cert.status === 'expired' ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cert.certification_name}</CardTitle>
                    {getStatusBadge(cert.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.certification_type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Emissão</p>
                      <p className="font-medium">
                        {format(new Date(cert.issue_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Validade</p>
                      <p className="font-medium">
                        {cert.expiry_date ? 
                          format(new Date(cert.expiry_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                          'Permanente'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Órgão Emissor</p>
                    <p className="text-sm font-medium">{cert.issuing_authority}</p>
                  </div>
                  
                  {cert.certificate_number && (
                    <div>
                      <p className="text-muted-foreground text-sm">Número</p>
                      <p className="text-sm font-medium">{cert.certificate_number}</p>
                    </div>
                  )}
                  
                  {cert.grade && (
                    <div>
                      <p className="text-muted-foreground text-sm">Nota</p>
                      <div className="flex items-center gap-2">
                        <Progress value={cert.grade * 10} className="flex-1" />
                        <span className="text-sm font-medium">{cert.grade.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  
                  {cert.notes && (
                    <div>
                      <p className="text-muted-foreground text-sm">Observações</p>
                      <p className="text-sm">{cert.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {certifications.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma certificação registrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Avaliação - {evaluation.evaluation_period}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Avaliador: {evaluation.evaluator_name} • {format(new Date(evaluation.evaluation_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3">
                      {evaluation.overall_score.toFixed(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Técnica</p>
                      <div className="flex items-center gap-2">
                        <Progress value={evaluation.technical_score * 10} className="flex-1" />
                        <span className="text-sm font-medium">{evaluation.technical_score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Comportamental</p>
                      <div className="flex items-center gap-2">
                        <Progress value={evaluation.behavioral_score * 10} className="flex-1" />
                        <span className="text-sm font-medium">{evaluation.behavioral_score.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Geral</p>
                      <div className="flex items-center gap-2">
                        <Progress value={evaluation.overall_score * 10} className="flex-1" />
                        <span className="text-sm font-medium">{evaluation.overall_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {evaluation.positive_feedback && (
                    <div>
                      <p className="text-sm font-medium text-success mb-1">Pontos Positivos</p>
                      <p className="text-sm bg-success/10 p-3 rounded-lg">{evaluation.positive_feedback}</p>
                    </div>
                  )}
                  
                  {evaluation.improvement_areas && (
                    <div>
                      <p className="text-sm font-medium text-warning mb-1">Áreas de Melhoria</p>
                      <p className="text-sm bg-warning/10 p-3 rounded-lg">{evaluation.improvement_areas}</p>
                    </div>
                  )}
                  
                  {evaluation.incidents && (
                    <div>
                      <p className="text-sm font-medium text-destructive mb-1">Ocorrências</p>
                      <p className="text-sm bg-destructive/10 p-3 rounded-lg">{evaluation.incidents}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {evaluations.length === 0 && (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma avaliação registrada</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sistema de documentos em desenvolvimento</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Documento
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};