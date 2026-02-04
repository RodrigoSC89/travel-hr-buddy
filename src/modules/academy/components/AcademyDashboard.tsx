/**
 * Maritime Academy Dashboard - Centro de Treinamento Premium
 * Plataforma de e-learning e gestão de capacitação marítima
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  GraduationCap,
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Target,
  Calendar,
  Video,
  FileText,
  BarChart3,
  Sparkles,
  Star,
  Bookmark,
  Download
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  title: string;
  category: string;
  type: 'mandatory' | 'optional' | 'certification';
  duration: number; // hours
  modules: number;
  enrolled: number;
  completionRate: number;
  rating: number;
  instructor: string;
  thumbnail?: string;
  isFeatured?: boolean;
}

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  crewMember: string;
  crewMemberAvatar?: string;
  rank: string;
  vessel: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  startDate?: string;
  completedDate?: string;
  expiryDate?: string;
  score?: number;
}

interface Certificate {
  id: string;
  name: string;
  crewMember: string;
  course: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  certificateNumber: string;
}

// Mock data
const mockCourses: Course[] = [
  { id: '1', title: 'STCW Basic Safety Training', category: 'Safety', type: 'mandatory', duration: 40, modules: 8, enrolled: 45, completionRate: 78, rating: 4.8, instructor: 'Cap. João Silva', isFeatured: true },
  { id: '2', title: 'Fire Prevention & Fighting', category: 'Safety', type: 'mandatory', duration: 24, modules: 5, enrolled: 38, completionRate: 82, rating: 4.6, instructor: 'Of. Pedro Costa' },
  { id: '3', title: 'MLC 2006 Compliance', category: 'Compliance', type: 'certification', duration: 16, modules: 4, enrolled: 52, completionRate: 65, rating: 4.5, instructor: 'Adv. Maria Santos' },
  { id: '4', title: 'Bridge Resource Management', category: 'Navigation', type: 'mandatory', duration: 32, modules: 6, enrolled: 28, completionRate: 70, rating: 4.9, instructor: 'Cap. Carlos Lima', isFeatured: true },
  { id: '5', title: 'Environmental Awareness', category: 'Environment', type: 'optional', duration: 8, modules: 3, enrolled: 62, completionRate: 88, rating: 4.4, instructor: 'Eng. Ana Rocha' },
  { id: '6', title: 'Leadership at Sea', category: 'Soft Skills', type: 'optional', duration: 12, modules: 4, enrolled: 35, completionRate: 72, rating: 4.7, instructor: 'Cap. Ricardo Mendes' }
];

const mockEnrollments: Enrollment[] = [
  { id: '1', courseId: '1', courseTitle: 'STCW Basic Safety Training', crewMember: 'João Silva', rank: '2nd Officer', vessel: 'MV Atlantic Pioneer', progress: 75, status: 'in-progress', startDate: '2024-05-01', expiryDate: '2024-07-01' },
  { id: '2', courseId: '2', courseTitle: 'Fire Prevention & Fighting', crewMember: 'Maria Santos', rank: 'Chief Engineer', vessel: 'MV Pacific Star', progress: 100, status: 'completed', completedDate: '2024-06-10', score: 92 },
  { id: '3', courseId: '3', courseTitle: 'MLC 2006 Compliance', crewMember: 'Pedro Costa', rank: 'Master', vessel: 'MV Ocean Voyager', progress: 30, status: 'in-progress', startDate: '2024-06-01' },
  { id: '4', courseId: '4', courseTitle: 'Bridge Resource Management', crewMember: 'Ana Rocha', rank: '3rd Officer', vessel: 'MV Atlantic Pioneer', progress: 0, status: 'not-started', expiryDate: '2024-08-15' },
  { id: '5', courseId: '1', courseTitle: 'STCW Basic Safety Training', crewMember: 'Carlos Lima', rank: 'AB Seaman', vessel: 'MV Pacific Star', progress: 45, status: 'expired', expiryDate: '2024-06-01' }
];

const mockCertificates: Certificate[] = [
  { id: '1', name: 'STCW Certificate', crewMember: 'Maria Santos', course: 'STCW Basic Safety', issueDate: '2024-06-10', expiryDate: '2029-06-10', status: 'valid', certificateNumber: 'STCW-2024-0892' },
  { id: '2', name: 'Fire Fighting Certificate', crewMember: 'João Silva', course: 'Fire Prevention', issueDate: '2023-08-15', expiryDate: '2024-08-15', status: 'expiring', certificateNumber: 'FFP-2023-1456' },
  { id: '3', name: 'MLC Compliance', crewMember: 'Pedro Costa', course: 'MLC 2006', issueDate: '2023-01-20', expiryDate: '2024-01-20', status: 'expired', certificateNumber: 'MLC-2023-0234' }
];

const statusConfig = {
  'not-started': { label: 'Não Iniciado', color: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'Em Progresso', color: 'bg-primary/20 text-primary' },
  'completed': { label: 'Concluído', color: 'bg-success/20 text-success' },
  'expired': { label: 'Expirado', color: 'bg-destructive/20 text-destructive' }
};

const certStatusConfig = {
  valid: { label: 'Válido', color: 'bg-success/10 text-success border-success' },
  expiring: { label: 'Expirando', color: 'bg-warning/10 text-warning border-warning' },
  expired: { label: 'Expirado', color: 'bg-destructive/10 text-destructive border-destructive' }
};

export function AcademyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalEnrollments = mockEnrollments.length;
    const completed = mockEnrollments.filter(e => e.status === 'completed').length;
    const inProgress = mockEnrollments.filter(e => e.status === 'in-progress').length;
    const expired = mockEnrollments.filter(e => e.status === 'expired').length;
    const avgProgress = mockEnrollments.reduce((acc, e) => acc + e.progress, 0) / totalEnrollments;
    const avgScore = mockEnrollments.filter(e => e.score).reduce((acc, e) => acc + (e.score || 0), 0) / mockEnrollments.filter(e => e.score).length;

    return {
      totalCourses: mockCourses.length,
      totalEnrollments,
      completed,
      inProgress,
      expired,
      avgProgress: Math.round(avgProgress),
      avgScore: Math.round(avgScore),
      validCertificates: mockCertificates.filter(c => c.status === 'valid').length,
      expiringCertificates: mockCertificates.filter(c => c.status === 'expiring').length
    };
  }, []);

  const filteredCourses = mockCourses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{kpis.totalCourses}</p>
              </div>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Matrículas</p>
                <p className="text-2xl font-bold">{kpis.totalEnrollments}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-primary">{kpis.inProgress}</p>
              </div>
              <Play className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-success">{kpis.completed}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.expired > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{kpis.expired}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Nota Média</p>
                <p className="text-2xl font-bold">{kpis.avgScore}%</p>
              </div>
              <Trophy className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2">
              <Users className="h-4 w-4" />
              Matrículas
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award className="h-4 w-4" />
              Certificados
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              IA Learning
            </TabsTrigger>
          </TabsList>

          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Courses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  Cursos em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCourses.filter(c => c.isFeatured).map(course => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={course.type === 'mandatory' ? 'default' : 'secondary'}>
                          {course.type === 'mandatory' ? 'Obrigatório' : course.type === 'certification' ? 'Certificação' : 'Opcional'}
                        </Badge>
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}h
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.modules} módulos
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled}
                        </span>
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Curso
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progresso da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-4xl font-bold text-primary">{kpis.avgProgress}%</p>
                    <p className="text-sm text-muted-foreground">Progresso Médio</p>
                  </div>

                  <div className="space-y-3">
                    {mockEnrollments.filter(e => e.status === 'in-progress').slice(0, 4).map(enrollment => (
                      <div key={enrollment.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate max-w-[150px]">{enrollment.crewMember}</span>
                          <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground truncate">{enrollment.courseTitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant={course.type === 'mandatory' ? 'default' : 'secondary'}>
                        {course.type === 'mandatory' ? 'Obrigatório' : course.type === 'certification' ? 'Certificação' : 'Opcional'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.instructor}</p>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{course.duration}h</p>
                        <p className="text-xs text-muted-foreground">Duração</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{course.modules}</p>
                        <p className="text-xs text-muted-foreground">Módulos</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-lg font-bold">{course.enrolled}</p>
                        <p className="text-xs text-muted-foreground">Inscritos</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de Conclusão</span>
                        <span className="font-medium">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-medium">Tripulante</th>
                      <th className="text-left p-4 font-medium">Curso</th>
                      <th className="text-left p-4 font-medium">Embarcação</th>
                      <th className="text-left p-4 font-medium">Progresso</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEnrollments.map(enrollment => (
                      <motion.tr
                        key={enrollment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{enrollment.crewMember.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.crewMember}</p>
                              <p className="text-xs text-muted-foreground">{enrollment.rank}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{enrollment.courseTitle}</p>
                        </td>
                        <td className="p-4 text-sm">{enrollment.vessel}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progress} className="w-20 h-2" />
                            <span className="text-sm font-medium">{enrollment.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={statusConfig[enrollment.status].color}>
                            {statusConfig[enrollment.status].label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost">
                            {enrollment.status === 'completed' ? (
                              <Award className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCertificates.map(cert => {
              const config = certStatusConfig[cert.status];
              const daysUntil = differenceInDays(new Date(cert.expiryDate), new Date());

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`border-2 ${config.color}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>

                      <h3 className="font-bold text-lg">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.crewMember}</p>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Curso:</span>
                          <span>{cert.course}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Emissão:</span>
                          <span>{format(new Date(cert.issueDate), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Validade:</span>
                          <span>{format(new Date(cert.expiryDate), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Número:</span>
                          <span className="font-mono text-xs">{cert.certificateNumber}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className={`text-sm font-medium ${daysUntil < 0 ? 'text-destructive' : daysUntil < 90 ? 'text-warning' : 'text-success'}`}>
                          {daysUntil < 0 ? `Vencido há ${Math.abs(daysUntil)} dias` : `${daysUntil} dias restantes`}
                        </span>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Learning Tab */}
        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recomendações Personalizadas
                </CardTitle>
                <CardDescription>Baseado no perfil e gaps de competência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { course: 'Advanced Fire Fighting', reason: 'Certificado expirando em 60 dias', priority: 'high', match: 95 },
                    { course: 'Bridge Team Management', reason: 'Próxima promoção a Chief Officer', priority: 'medium', match: 88 },
                    { course: 'Crisis Management', reason: 'Complemento ao perfil de liderança', priority: 'low', match: 75 }
                  ].map((rec, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{rec.course}</h4>
                          <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.match}% match
                        </Badge>
                      </div>
                      <Button size="sm" className="mt-2">Matricular</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Análise de Gaps de Competência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { skill: 'Combate a Incêndio', current: 65, required: 80 },
                    { skill: 'Primeiros Socorros', current: 78, required: 85 },
                    { skill: 'Navegação Eletrônica', current: 90, required: 85 },
                    { skill: 'Gestão de Crise', current: 45, required: 70 }
                  ].map((skill, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <span className={`text-sm font-medium ${skill.current >= skill.required ? 'text-success' : 'text-warning'}`}>
                          {skill.current}% / {skill.required}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={skill.current} className="h-3" />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-destructive"
                          style={{ left: `${skill.required}%` }}
                        />
                      </div>
                      {skill.current < skill.required && (
                        <p className="text-xs text-muted-foreground">
                          Gap de {skill.required - skill.current}% - Treinamento recomendado
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AcademyDashboard;
