/**
 * People Dashboard - KPIs e Visão Geral de RH
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Target,
  Award,
  Clock,
  AlertTriangle,
  Calendar,
  Briefcase,
  GraduationCap,
  DollarSign,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const PeopleDashboard: React.FC = () => {
  // KPIs Mock Data
  const kpis = {
    totalColaboradores: 1247,
    novasContratacoes: 23,
    desligamentos: 5,
    turnover: 4.2,
    climaScore: 87,
    engajamento: 82,
    metasConcluidas: 76,
    treinamentosAtivos: 34,
    vagasAbertas: 12,
    candidatosPipeline: 156
  };

  const alertas = [
    { tipo: "warning", texto: "8 certificados vencem em 30 dias", prioridade: "alta" },
    { tipo: "info", texto: "12 avaliações pendentes de revisão", prioridade: "media" },
    { tipo: "danger", texto: "3 colaboradores em risco de turnover", prioridade: "critica" },
    { tipo: "success", texto: "5 promoções aguardando aprovação", prioridade: "media" }
  ];

  const aniversariantes = [
    { nome: "Carlos Silva", data: "Hoje", departamento: "Operações" },
    { nome: "Ana Martins", data: "Amanhã", departamento: "Engenharia" },
    { nome: "Pedro Santos", data: "10/12", departamento: "TI" }
  ];

  const topPerformers = [
    { nome: "Maria Oliveira", score: 98, departamento: "Vendas" },
    { nome: "João Costa", score: 96, departamento: "Operações" },
    { nome: "Laura Mendes", score: 94, departamento: "RH" }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-500" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                  +2.3%
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpis.totalColaboradores}</p>
                <p className="text-sm text-muted-foreground">Total Colaboradores</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <UserPlus className="w-8 h-8 text-green-500" />
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpis.novasContratacoes}</p>
                <p className="text-sm text-muted-foreground">Novas Contratações</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <UserMinus className="w-8 h-8 text-red-500" />
                <span className="text-xs text-muted-foreground">{kpis.turnover}%</span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpis.desligamentos}</p>
                <p className="text-sm text-muted-foreground">Turnover Mensal</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Heart className="w-8 h-8 text-purple-500" />
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">
                  Excelente
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpis.climaScore}%</p>
                <p className="text-sm text-muted-foreground">Score de Clima</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Briefcase className="w-8 h-8 text-orange-500" />
                <span className="text-xs text-muted-foreground">{kpis.candidatosPipeline} candidatos</span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpis.vagasAbertas}</p>
                <p className="text-sm text-muted-foreground">Vagas Abertas</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Inteligentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alertas Inteligentes
            </CardTitle>
            <CardDescription>Insights e ações recomendadas pela IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.map((alerta, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  alerta.tipo === "danger" 
                    ? "bg-red-500/10 border-red-500/30" 
                    : alerta.tipo === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : alerta.tipo === "success"
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <span className="text-sm">{alerta.texto}</span>
                <Badge variant={
                  alerta.prioridade === "critica" ? "destructive" 
                    : alerta.prioridade === "alta" ? "default" 
                      : "secondary"
                }>
                  {alerta.prioridade}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Aniversariantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Aniversariantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aniversariantes.map((pessoa, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{pessoa.nome}</p>
                  <p className="text-xs text-muted-foreground">{pessoa.departamento}</p>
                </div>
                <Badge variant={pessoa.data === "Hoje" ? "default" : "secondary"}>
                  {pessoa.data}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Engajamento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{kpis.engajamento}%</div>
            <Progress value={kpis.engajamento} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">+5% vs mês anterior</p>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              Metas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{kpis.metasConcluidas}%</div>
            <Progress value={kpis.metasConcluidas} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Q4 2025</p>
          </CardContent>
        </Card>

        {/* Treinamentos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Treinamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{kpis.treinamentosAtivos}</div>
            <p className="text-xs text-muted-foreground mt-2">187 participantes</p>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.map((pessoa, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="truncate">{pessoa.nome}</span>
                <Badge variant="outline">{pessoa.score}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Workforce Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Workforce Analytics
          </CardTitle>
          <CardDescription>Distribuição e métricas da força de trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">45%</p>
              <p className="text-sm text-muted-foreground">Operações</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">25%</p>
              <p className="text-sm text-muted-foreground">Administrativo</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">20%</p>
              <p className="text-sm text-muted-foreground">Técnico</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">10%</p>
              <p className="text-sm text-muted-foreground">Gestão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeopleDashboard;
