import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Ship, 
  Award, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank: string;
  status: string;
  experience_years: number;
}

interface CrewCertification {
  id: string;
  certification_name: string;
  status: string;
  expiry_date: string;
  issuing_authority: string;
}

interface CrewEmbarkation {
  id: string;
  vessel_name: string;
  embark_date: string;
  disembark_date: string;
  function_role: string;
  hours_worked: number;
}

export const EmployeeDossierSummary: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crewMember, setCrewMember] = useState<CrewMember | null>(null);
  const [certifications, setCertifications] = useState<CrewCertification[]>([]);
  const [embarkations, setEmbarkations] = useState<CrewEmbarkation[]>([]);

  useEffect(() => {
    fetchDossierData();
  }, [user]);

  const fetchDossierData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados do tripulante
      const { data: memberData, error: memberError } = await supabase
        .from('crew_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Erro ao buscar dados do tripulante:', memberError);
        return;
      }

      if (!memberData) {
        // Criar registro de tripulante se não existir
        const { data: newMember, error: createError } = await supabase
          .from('crew_members')
          .insert({
            user_id: user.id,
            employee_id: user.email?.split('@')[0] || 'temp_id',
            full_name: user.email?.split('@')[0] || 'Usuário',
            position: 'Marinheiro',
            rank: 'Ordinary Seaman',
            nationality: 'Brasil',
            email: user.email,
            status: 'available'
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar tripulante:', createError);
          return;
        }

        setCrewMember(newMember);
      } else {
        setCrewMember(memberData);
      }

      // Buscar certificações
      if (memberData) {
        const { data: certData, error: certError } = await supabase
          .from('crew_certifications')
          .select('*')
          .eq('crew_member_id', memberData.id)
          .order('expiry_date', { ascending: true })
          .limit(5);

        if (certError) {
          console.error('Erro ao buscar certificações:', certError);
        } else {
          setCertifications(certData || []);
        }

        // Buscar embarques
        const { data: embarkData, error: embarkError } = await supabase
          .from('crew_embarkations')
          .select('*')
          .eq('crew_member_id', memberData.id)
          .order('embark_date', { ascending: false })
          .limit(3);

        if (embarkError) {
          console.error('Erro ao buscar embarques:', embarkError);
        } else {
          setEmbarkations(embarkData || []);
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dossiê",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'expiring_soon':
      case 'expiring':
        return <Clock className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateComplianceScore = () => {
    if (certifications.length === 0) return 0;
    const validCerts = certifications.filter(cert => cert.status === 'valid').length;
    return Math.round((validCerts / certifications.length) * 100);
  };

  const getTotalSeaTime = () => {
    return embarkations.reduce((total, embark) => total + (embark.hours_worked || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dossiê...</p>
        </div>
      </div>
    );
  }

  if (!crewMember) {
    return (
      <div className="text-center py-8">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Dossiê não encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Seu perfil de tripulante ainda não foi criado
        </p>
        <Button onClick={fetchDossierData}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const complianceScore = calculateComplianceScore();
  const totalSeaTime = getTotalSeaTime();

  return (
    <div className="space-y-6">
      {/* Resumo do Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{crewMember.full_name}</div>
                <div className="text-sm text-muted-foreground">{crewMember.position}</div>
                <Badge variant="outline" className="mt-1">
                  {crewMember.rank}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{complianceScore}%</div>
                <div className="text-sm text-muted-foreground">Compliance</div>
                <Progress value={complianceScore} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Ship className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(totalSeaTime / 24)}</div>
                <div className="text-sm text-muted-foreground">Dias de Mar</div>
                <div className="text-xs text-muted-foreground">{totalSeaTime}h total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificações Próximas do Vencimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificações
          </CardTitle>
          <CardDescription>
            Status das suas principais certificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma certificação registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(cert.status)}
                    <div>
                      <div className="font-medium">{cert.certification_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cert.issuing_authority}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(cert.status)}>
                      {cert.status === 'valid' ? 'Válido' :
                       cert.status === 'expiring_soon' ? 'Vencendo' : 'Expirado'}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(cert.expiry_date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Últimos Embarques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Histórico de Embarques
          </CardTitle>
          <CardDescription>
            Seus embarques mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {embarkations.length === 0 ? (
            <div className="text-center py-4">
              <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum embarque registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {embarkations.map((embark) => (
                <div key={embark.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{embark.vessel_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {embark.function_role}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {format(new Date(embark.embark_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {embark.hours_worked || 0}h trabalhadas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button 
          onClick={() => window.open('/crew-dossier', '_blank')} 
          className="flex-1"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Dossiê Completo
        </Button>
        <Button 
          variant="outline" 
          onClick={fetchDossierData}
        >
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};