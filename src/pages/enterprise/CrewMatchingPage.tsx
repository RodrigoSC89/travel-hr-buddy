/**
 * Crew Matching AI - Enterprise Intelligence Suite
 * Sistema de matching inteligente para tripulação
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Star,
  Search,
  Filter,
  RefreshCw,
  Ship,
  MapPin,
  Calendar,
  FileText,
  Brain,
  Percent,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Position {
  id: string;
  title: string;
  vessel: string;
  vesselType: string;
  location: string;
  startDate: string;
  duration: string;
  requirements: string[];
  status: 'open' | 'interviewing' | 'filled';
}

interface Candidate {
  id: string;
  name: string;
  rank: string;
  experience: number;
  certifications: string[];
  avatar?: string;
  matchScore: number;
  compatibility: {
    skills: number;
    experience: number;
    availability: number;
    certifications: number;
  };
  risks: string[];
  strengths: string[];
  available: string;
}

const OPEN_POSITIONS: Position[] = [
  {
    id: '1',
    title: 'Chefe de Máquinas',
    vessel: 'OSV Petrobras III',
    vesselType: 'Platform Supply Vessel',
    location: 'Bacia de Santos',
    startDate: '15/02/2025',
    duration: '28 dias',
    requirements: ['STCW', 'CoC Unlimited', 'DP Awareness', '5+ anos experiência'],
    status: 'open',
  },
  {
    id: '2',
    title: '1º Oficial de Náutica',
    vessel: 'AHTS Titan',
    vesselType: 'Anchor Handling Tug Supply',
    location: 'Bacia de Campos',
    startDate: '01/03/2025',
    duration: '35 dias',
    requirements: ['STCW', 'CoC Class 2', 'DP Advanced', 'BOSIET'],
    status: 'interviewing',
  },
];

const CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Ricardo Mendes',
    rank: 'Chefe de Máquinas',
    experience: 12,
    certifications: ['STCW', 'CoC Unlimited', 'DP Awareness', 'BOSIET', 'HUET'],
    matchScore: 95,
    compatibility: { skills: 98, experience: 95, availability: 100, certifications: 92 },
    risks: [],
    strengths: ['12 anos em PSVs', 'Fluente em inglês', 'Histórico impecável'],
    available: 'Imediato',
  },
  {
    id: '2',
    name: 'Marcos Almeida',
    rank: 'Chefe de Máquinas',
    experience: 8,
    certifications: ['STCW', 'CoC Unlimited', 'DP Awareness'],
    matchScore: 82,
    compatibility: { skills: 85, experience: 78, availability: 100, certifications: 75 },
    risks: ['BOSIET expira em 60 dias'],
    strengths: ['8 anos de experiência', 'Conhecimento em motores MAN'],
    available: 'Imediato',
  },
  {
    id: '3',
    name: 'Fernando Costa',
    rank: '2º Maquinista',
    experience: 5,
    certifications: ['STCW', 'CoC Class 2', 'DP Awareness', 'BOSIET'],
    matchScore: 68,
    compatibility: { skills: 70, experience: 55, availability: 100, certifications: 85 },
    risks: ['Experiência abaixo do ideal', 'Sem certificação Unlimited'],
    strengths: ['Disponível imediato', 'Certificações em dia', 'Boas referências'],
    available: 'Imediato',
  },
];

export default function CrewMatchingPage() {
  const [positions] = useState<Position[]>(OPEN_POSITIONS);
  const [candidates] = useState<Candidate[]>(CANDIDATES);
  const [selectedPosition, setSelectedPosition] = useState<string>(positions[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getMatchBadge = (score: number) => {
    if (score >= 90) return { label: 'Excelente', class: 'bg-success' };
    if (score >= 70) return { label: 'Bom', class: 'bg-warning' };
    return { label: 'Parcial', class: 'bg-destructive' };
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Crew Matching AI | Nautilus One</title>
        <meta name="description" content="Sistema de matching inteligente para tripulação" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Crew Matching AI
                <Badge className="bg-gradient-to-r from-primary to-primary/70">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Talent Intelligence
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Matching inteligente baseado em competências, experiência e disponibilidade
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{positions.filter(p => p.status === 'open').length}</p>
                  <p className="text-xs text-muted-foreground">Vagas Abertas</p>
                </div>
                 <div className="p-2 rounded-lg bg-primary/10">
                   <Ship className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{candidates.length}</p>
                  <p className="text-xs text-muted-foreground">Candidatos Pool</p>
                </div>
                 <div className="p-2 rounded-lg bg-accent/10">
                   <Users className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-3xl font-bold text-success">
                     {candidates.filter(c => c.matchScore >= 90).length}
                   </p>
                   <p className="text-xs text-muted-foreground">Match Excelente</p>
                 </div>
                 <div className="p-2 rounded-lg bg-success/10">
                   <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">87%</p>
                  <p className="text-xs text-muted-foreground">Precisão IA</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Positions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Vagas Abertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all",
                        selectedPosition === position.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedPosition(position.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{position.title}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                             position.status === 'open' && "bg-success/10 text-success",
                             position.status === 'interviewing' && "bg-primary/10 text-primary"
                          )}
                        >
                          {position.status === 'open' ? 'Aberta' : 'Entrevistas'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{position.vessel}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {position.startDate} • {position.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Candidates */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidatos Recomendados
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button variant="outline" size="icon" aria-label="Filtrar candidatos" title="Filtrar">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Ranking baseado em compatibilidade com a vaga selecionada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredCandidates.map((candidate, idx) => {
                    const matchBadge = getMatchBadge(candidate.matchScore);
                    
                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="border">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <Avatar className="h-14 w-14">
                                  <AvatarImage src={candidate.avatar} />
                                  <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                  matchBadge.class
                                )}>
                                  #{idx + 1}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{candidate.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {candidate.rank} • {candidate.experience} anos exp.
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className={cn(
                                      "text-3xl font-bold",
                                      getMatchColor(candidate.matchScore)
                                    )}>
                                      {candidate.matchScore}%
                                    </div>
                                    <Badge className={matchBadge.class}>
                                      {matchBadge.label}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Compatibility Breakdown */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                  {Object.entries(candidate.compatibility).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                      <Progress value={value} className="h-1.5 mb-1" />
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {key === 'skills' ? 'Habilidades' :
                                         key === 'experience' ? 'Experiência' :
                                         key === 'availability' ? 'Disponib.' : 'Certif.'}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Certifications */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {candidate.certifications.slice(0, 5).map((cert) => (
                                    <Badge key={cert} variant="outline" className="text-xs">
                                      {cert}
                                    </Badge>
                                  ))}
                                  {candidate.certifications.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{candidate.certifications.length - 5}
                                    </Badge>
                                  )}
                                </div>

                                {/* Strengths & Risks */}
                                <div className="grid grid-cols-2 gap-2">
                                  {candidate.strengths.length > 0 && (
                                     <div className="p-2 bg-success/5 rounded text-xs">
                                       <div className="flex items-center gap-1 text-success font-medium mb-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Pontos Fortes
                                      </div>
                                      <ul className="space-y-0.5 text-muted-foreground">
                                         {candidate.strengths.slice(0, 2).map((s) => (
                                           <li key={s}>• {s}</li>
                                         ))}
                                      </ul>
                                    </div>
                                  )}
                                  {candidate.risks.length > 0 && (
                                    <div className="p-2 bg-amber-500/5 rounded text-xs">
                                      <div className="flex items-center gap-1 text-amber-600 font-medium mb-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Atenção
                                      </div>
                                      <ul className="space-y-0.5 text-muted-foreground">
                                         {candidate.risks.map((r) => (
                                           <li key={r}>• {r}</li>
                                         ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                  <span className="text-xs text-muted-foreground">
                                    Disponível: {candidate.available}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Perfil
                                    </Button>
                                    <Button size="sm">
                                      <ChevronRight className="h-3 w-3 mr-1" />
                                      Selecionar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
