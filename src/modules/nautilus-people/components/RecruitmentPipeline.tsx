/**
 * Recruitment Pipeline - Pipeline de Recrutamento com IA
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  Users,
  Clock,
  Calendar,
  Star,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GripVertical,
  ChevronRight,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  experiencia: string;
  matchScore: number;
  etapa: 'triagem' | 'entrevista_rh' | 'entrevista_tecnica' | 'proposta' | 'contratado' | 'reprovado';
  dataAplicacao: string;
  origem: string;
  skills: string[];
  aiInsights?: string;
}

interface Vaga {
  id: string;
  titulo: string;
  departamento: string;
  tipo: string;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  candidatos: number;
  status: 'aberta' | 'pausada' | 'fechada';
  dataAbertura: string;
}

const RecruitmentPipeline: React.FC = () => {
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [isNewVagaOpen, setIsNewVagaOpen] = useState(false);

  const vagas: Vaga[] = [
    {
      id: '1',
      titulo: 'Engenheiro de Produção Sênior',
      departamento: 'Operações',
      tipo: 'CLT',
      urgencia: 'alta',
      candidatos: 23,
      status: 'aberta',
      dataAbertura: '2025-11-15'
    },
    {
      id: '2',
      titulo: 'Analista de Dados Pleno',
      departamento: 'TI',
      tipo: 'CLT',
      urgencia: 'media',
      candidatos: 45,
      status: 'aberta',
      dataAbertura: '2025-11-20'
    },
    {
      id: '3',
      titulo: 'Técnico de Segurança do Trabalho',
      departamento: 'QSMS',
      tipo: 'CLT',
      urgencia: 'critica',
      candidatos: 12,
      status: 'aberta',
      dataAbertura: '2025-11-10'
    }
  ];

  const candidatos: Candidato[] = [
    {
      id: '1',
      nome: 'Lucas Ferreira',
      email: 'lucas.ferreira@email.com',
      telefone: '+55 11 99999-1111',
      cargo: 'Engenheiro de Produção',
      experiencia: '8 anos',
      matchScore: 95,
      etapa: 'entrevista_tecnica',
      dataAplicacao: '2025-11-18',
      origem: 'LinkedIn',
      skills: ['Gestão de Processos', 'Lean Manufacturing', 'Six Sigma'],
      aiInsights: 'Candidato com excelente fit cultural. Experiência prévia no setor offshore.'
    },
    {
      id: '2',
      nome: 'Mariana Costa',
      email: 'mariana.costa@email.com',
      telefone: '+55 11 99999-2222',
      cargo: 'Engenheira de Produção',
      experiencia: '5 anos',
      matchScore: 88,
      etapa: 'entrevista_rh',
      dataAplicacao: '2025-11-19',
      origem: 'Indeed',
      skills: ['Automação', 'Python', 'Power BI'],
      aiInsights: 'Perfil técnico forte, recomendo avaliar soft skills na entrevista.'
    },
    {
      id: '3',
      nome: 'Pedro Almeida',
      email: 'pedro.almeida@email.com',
      telefone: '+55 11 99999-3333',
      cargo: 'Engenheiro de Produção',
      experiencia: '10 anos',
      matchScore: 92,
      etapa: 'proposta',
      dataAplicacao: '2025-11-15',
      origem: 'Indicação',
      skills: ['Gestão de Equipes', 'Planejamento', 'SAP'],
      aiInsights: 'Excelente candidato. Pretensão salarial alinhada.'
    },
    {
      id: '4',
      nome: 'Ana Beatriz Silva',
      email: 'ana.silva@email.com',
      telefone: '+55 11 99999-4444',
      cargo: 'Engenheira de Produção Júnior',
      experiencia: '2 anos',
      matchScore: 75,
      etapa: 'triagem',
      dataAplicacao: '2025-11-22',
      origem: 'Catho',
      skills: ['Excel Avançado', 'AutoCAD', 'Inglês Fluente']
    },
    {
      id: '5',
      nome: 'Rafael Santos',
      email: 'rafael.santos@email.com',
      telefone: '+55 11 99999-5555',
      cargo: 'Engenheiro de Produção',
      experiencia: '6 anos',
      matchScore: 82,
      etapa: 'entrevista_rh',
      dataAplicacao: '2025-11-20',
      origem: 'LinkedIn',
      skills: ['Gestão de Projetos', 'MS Project', 'Scrum']
    }
  ];

  const etapas = [
    { id: 'triagem', label: 'Triagem IA', color: 'bg-blue-500' },
    { id: 'entrevista_rh', label: 'Entrevista RH', color: 'bg-purple-500' },
    { id: 'entrevista_tecnica', label: 'Entrevista Técnica', color: 'bg-orange-500' },
    { id: 'proposta', label: 'Proposta', color: 'bg-green-500' },
    { id: 'contratado', label: 'Contratado', color: 'bg-emerald-500' }
  ];

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'critica': return 'bg-red-500 text-white';
      case 'alta': return 'bg-orange-500 text-white';
      case 'media': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getCandidatosByEtapa = (etapa: string) => {
    return candidatos.filter(c => c.etapa === etapa);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar vaga ou candidato..." className="pl-9" />
          </div>
          <Select defaultValue="todas">
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Vagas</SelectItem>
              <SelectItem value="abertas">Abertas</SelectItem>
              <SelectItem value="pausadas">Pausadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Triagem com IA
          </Button>
          <Dialog open={isNewVagaOpen} onOpenChange={setIsNewVagaOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Vaga</DialogTitle>
                <DialogDescription>Preencha as informações da vaga</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título da Vaga</Label>
                  <Input placeholder="Ex: Engenheiro de Produção Sênior" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operacoes">Operações</SelectItem>
                        <SelectItem value="ti">TI</SelectItem>
                        <SelectItem value="rh">RH</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Urgência</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição da Vaga</Label>
                  <Textarea placeholder="Descreva as responsabilidades e requisitos..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos (separados por vírgula)</Label>
                  <Input placeholder="Python, SQL, 3+ anos experiência" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewVagaOpen(false)}>Cancelar</Button>
                <Button>Criar Vaga</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vagas Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vagas.map((vaga) => (
          <motion.div
            key={vaga.id}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setSelectedVaga(vaga)}
          >
            <Card className={`transition-all ${selectedVaga?.id === vaga.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{vaga.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{vaga.departamento}</p>
                  </div>
                  <Badge className={getUrgenciaColor(vaga.urgencia)}>{vaga.urgencia}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {vaga.candidatos} candidatos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.ceil((new Date().getTime() - new Date(vaga.dataAbertura).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pipeline de Recrutamento
            {selectedVaga && <Badge variant="outline" className="ml-2">{selectedVaga.titulo}</Badge>}
          </CardTitle>
          <CardDescription>Arraste os candidatos entre as etapas do processo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {etapas.map((etapa) => (
              <div key={etapa.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${etapa.color}`} />
                  <span className="font-medium text-sm">{etapa.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getCandidatosByEtapa(etapa.id).length}
                  </Badge>
                </div>
                <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg border border-dashed">
                  {getCandidatosByEtapa(etapa.id).map((candidato) => (
                    <motion.div
                      key={candidato.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-card rounded-lg border shadow-sm cursor-grab hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {candidato.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{candidato.nome}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Match Score</span>
                          <span className="text-xs font-medium text-primary">{candidato.matchScore}%</span>
                        </div>
                        <Progress value={candidato.matchScore} className="h-1" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidato.skills.slice(0, 2).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {candidato.aiInsights && (
                        <div className="mt-2 p-2 bg-primary/5 rounded text-xs flex items-start gap-1">
                          <Brain className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{candidato.aiInsights}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Insights de Recrutamento (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-medium">Tempo Médio de Contratação</span>
              </div>
              <p className="text-2xl font-bold">18 dias</p>
              <p className="text-xs text-muted-foreground">-3 dias vs mês anterior</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Taxa de Conversão</span>
              </div>
              <p className="text-2xl font-bold">12%</p>
              <p className="text-xs text-muted-foreground">Triagem → Contratação</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Candidatos Recomendados</span>
              </div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Score acima de 90%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentPipeline;
