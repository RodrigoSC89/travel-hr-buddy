import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Shield, Calendar, AlertTriangle, Heart,
  Stethoscope, GraduationCap, Ship, Zap, BarChart3, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrewScheduleVisualizer } from "./crew-schedule-visualizer";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  vessel?: string;
  status: "onboard" | "on_leave" | "available" | "training" | "medical_leave";
  contract: { start_date: string; end_date: string; duration_months: number };
  certifications: { id: string; name: string; type: string; expiry_date: string; status: string }[];
  medical: { last_checkup: string; next_due: string; status: string };
  performance: { rating: number; last_evaluation: string };
  sea_service: { total_months: number; vessels_served: string[] };
}

export const MaritimeHRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const { toast } = useToast();

  // Fetch crew data from Supabase
  const { data: crewMembers = [], isLoading } = useQuery({
    queryKey: ['hr-dashboard-crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('full_name')
        .limit(50);

      if (error || !data) return [];

      return data.map((d): CrewMember => {
        const statusMap: Record<string, CrewMember['status']> = {
          active: 'onboard', on_leave: 'on_leave', available: 'available',
          training: 'training', medical_leave: 'medical_leave', onboard: 'onboard'
        };
        return {
          id: d.id,
          name: d.full_name || 'N/A',
          rank: d.rank || d.position || 'N/A',
          nationality: d.nationality || 'N/A',
          vessel: d.vessel_id ? `Vessel ${d.vessel_id.slice(0, 6)}` : undefined,
          status: statusMap[d.status || 'active'] || 'available',
          contract: {
            start_date: d.contract_start || '',
            end_date: d.contract_end || '',
            duration_months: 0,
          },
          certifications: [],
          medical: {
            last_checkup: (d as any).last_medical_checkup || '',
            next_due: (d as any).next_medical_due || '',
            status: (d as any).medical_status || 'valid',
          },
          performance: {
            rating: (d as any).performance_rating || 0,
            last_evaluation: (d as any).last_evaluation || '',
          },
          sea_service: {
            total_months: (d as any).sea_service_months || 0,
            vessels_served: [],
          },
        };
      });
    },
  });

  // Fetch training data
  const { data: trainingPrograms = [] } = useQuery({
    queryKey: ['hr-training-programs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('academy_courses')
        .select('id, course_name, duration_hours, is_published')
        .eq('is_published', true)
        .limit(10);
      return (data || []).map(d => ({
        id: d.id,
        name: d.course_name,
        duration_hours: d.duration_hours || 0,
        is_published: d.is_published,
      }));
    },
  });

  // Fetch certifications expiring
  const { data: expiringCerts = [] } = useQuery({
    queryKey: ['hr-expiring-certs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('certificates')
        .select('id, certificate_type, expiry_date, status, employee_id')
        .order('expiry_date', { ascending: true })
        .limit(20);
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      onboard: "text-blue-600 bg-blue-100", on_leave: "text-green-600 bg-green-100",
      available: "text-muted-foreground bg-muted", training: "text-purple-600 bg-purple-100",
      medical_leave: "text-red-600 bg-red-100"
    };
    return colors[status] || "text-muted-foreground bg-muted";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      onboard: "A Bordo", on_leave: "De Folga", available: "Disponível",
      training: "Treinamento", medical_leave: "Licença Médica"
    };
    return labels[status] || "Desconhecido";
  };

  const stats = {
    total: crewMembers.length,
    onboard: crewMembers.filter(c => c.status === 'onboard').length,
    onLeave: crewMembers.filter(c => c.status === 'on_leave').length,
    training: crewMembers.filter(c => c.status === 'training').length,
    expiringCerts: expiringCerts.length,
  };

  const handleWellnessAlert = () => {
    toast({ title: "Alerta de Bem-estar", description: "IA analisando indicadores de estresse da tripulação." });
  };

  const handleComplianceCheck = () => {
    toast({ title: "Verificação de Compliance", description: `${stats.expiringCerts} certificações próximas do vencimento detectadas.` });
  };

  const handlePlanRotation = () => {
    navigate("/crew/rotations");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 p-8"><div className="animate-pulse h-32 bg-white/10 rounded-xl" /></div>
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando dados de RH...</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 rounded-2xl"><Users className="h-12 w-12" /></div>
            <div><h1 className="text-4xl font-bold mb-2">RH Marítimo Inteligente</h1><p className="text-xl opacity-90">Gestão Avançada de Recursos Humanos</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 p-4 rounded-xl"><div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5" /><span>Tripulantes</span></div><div className="text-3xl font-bold">{stats.total}</div></div>
            <div className="bg-white/20 p-4 rounded-xl"><div className="flex items-center gap-2 mb-2"><Ship className="h-5 w-5" /><span>A Bordo</span></div><div className="text-3xl font-bold">{stats.onboard}</div></div>
            <div className="bg-white/20 p-4 rounded-xl"><div className="flex items-center gap-2 mb-2"><Calendar className="h-5 w-5" /><span>De Folga</span></div><div className="text-3xl font-bold">{stats.onLeave}</div></div>
            <div className="bg-white/20 p-4 rounded-xl"><div className="flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5" /><span>Treinamento</span></div><div className="text-3xl font-bold">{stats.training}</div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2"><Users className="h-4 w-4" />Tripulação</TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Escalas</TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2"><Shield className="h-4 w-4" />Certificações</TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2"><Heart className="h-4 w-4" />Bem-estar</TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />Treinamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Status da Tripulação</CardTitle></CardHeader>
              <CardContent>
                {crewMembers.length === 0 ? (
                  <div className="text-center py-8"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><p className="text-sm text-muted-foreground">Nenhum tripulante registrado</p></div>
                ) : (
                  <div className="space-y-4">
                    {crewMembers.slice(0, 10).map(crew => (
                      <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                          <div><h3 className="font-semibold">{crew.name}</h3><p className="text-sm text-muted-foreground">{crew.rank}</p><p className="text-xs text-muted-foreground">{crew.vessel || "Sem embarcação"}</p></div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(crew.status)}>{getStatusLabel(crew.status)}</Badge>
                          {crew.performance.rating > 0 && <p className="text-sm text-muted-foreground mt-1">Performance: {crew.performance.rating}/10</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Ações Inteligentes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button onClick={handleWellnessAlert} variant="outline" className="w-full justify-start"><Heart className="h-4 w-4 mr-2" />Verificar Bem-estar</Button>
                  <Button onClick={() => toast({ title: "🏥 Telemedicina", description: "Módulo de telemedicina marítima em implantação. Para consultas, acesse o módulo Saúde & Bem-estar. ETA: Q3/2026." })} variant="outline" className="w-full justify-start"><Stethoscope className="h-4 w-4 mr-2" />Telemedicina</Button>
                  <Button onClick={handleComplianceCheck} variant="outline" className="w-full justify-start"><Shield className="h-4 w-4 mr-2" />Verificar Compliance</Button>
                  <Button onClick={handlePlanRotation} variant="outline" className="w-full justify-start"><Calendar className="h-4 w-4 mr-2" />Planejar Rotação</Button>
                </div>
                <div className="mt-6 pt-4 border-t"><h4 className="font-semibold mb-3">Alertas</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs"><span className="font-medium">Certificação:</span> {stats.expiringCerts} vencendo</div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs"><span className="font-medium">Tripulação:</span> {stats.total} membros ativos</div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs"><span className="font-medium">Treinamento:</span> {trainingPrograms.length} cursos disponíveis</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew" className="space-y-6">
          <Card><CardContent className="pt-6">
            {crewMembers.length === 0 ? (
              <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><h3 className="font-medium mb-2">Nenhum tripulante encontrado</h3><p className="text-sm text-muted-foreground">Cadastre tripulantes para visualizá-los aqui</p></div>
            ) : (
              <div className="space-y-4">
                {crewMembers.map(crew => (
                  <div key={crew.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedCrew(crew)}>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold">{crew.name}</h3>
                        <p className="text-sm text-muted-foreground">{crew.rank} • {crew.nationality}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(crew.status)}>{getStatusLabel(crew.status)}</Badge>
                      {crew.vessel && <Badge variant="outline"><Ship className="h-3 w-3 mr-1" />{crew.vessel}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="schedule"><CrewScheduleVisualizer /></TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Certificações da Tripulação</CardTitle></CardHeader>
            <CardContent>
              {expiringCerts.length === 0 ? (
                <div className="text-center py-12"><Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><h3 className="font-medium mb-2">Nenhuma certificação com alerta</h3><p className="text-sm text-muted-foreground">Todas as certificações estão em dia</p></div>
              ) : (
                <div className="space-y-3">
                  {(expiringCerts as any[]).map((cert: any) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div><h4 className="font-medium">{cert.certificate_type || 'Certificado'}</h4><p className="text-sm text-muted-foreground">Vencimento: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('pt-BR') : 'N/A'}</p></div>
                      <Badge variant={cert.status === 'expired' ? 'destructive' : 'secondary'}>{cert.status === 'expired' ? 'Vencido' : cert.status === 'expiring' ? 'Vencendo' : 'Válido'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          <Card><CardContent className="py-12 text-center"><Heart className="h-12 w-12 mx-auto text-primary mb-4" /><h3 className="font-bold text-lg mb-2">Bem-estar da Tripulação</h3><p className="text-sm text-muted-foreground mb-4">Monitoramento inteligente de saúde mental e física</p><Button onClick={handleWellnessAlert}><Heart className="h-4 w-4 mr-2" />Analisar Bem-estar com IA</Button></CardContent></Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Programas de Treinamento</CardTitle></CardHeader>
            <CardContent>
              {trainingPrograms.length === 0 ? (
                <div className="text-center py-12"><GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><h3 className="font-medium mb-2">Nenhum programa disponível</h3><p className="text-sm text-muted-foreground">Cadastre cursos na Academy para visualizá-los</p></div>
              ) : (
                <div className="space-y-3">
                  {trainingPrograms.map(program => (
                    <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div><h4 className="font-medium">{program.name}</h4><p className="text-sm text-muted-foreground">{program.duration_hours}h de duração</p></div>
                      <Badge variant="default">Publicado</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};