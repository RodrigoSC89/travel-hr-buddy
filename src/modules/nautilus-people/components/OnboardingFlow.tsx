/**
 * Onboarding Flow - Fluxo de Integração Digital
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  FileText,
  GraduationCap,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  Mail,
  Video,
  BookOpen,
  Shield,
  Key,
  Laptop,
  MessageSquare,
  ChevronRight,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

interface OnboardingEmployee {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  progresso: number;
  etapaAtual: number;
  gestor: string;
  buddy: string;
}

interface OnboardingStep {
  id: number;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  tarefas: { id: string; titulo: string; concluida: boolean }[];
}

const OnboardingFlow: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);

  const onboardingEmployees: OnboardingEmployee[] = [
    {
      id: "1",
      nome: "Felipe Rodrigues",
      cargo: "Analista de Dados",
      departamento: "TI",
      dataAdmissao: "2025-12-02",
      progresso: 75,
      etapaAtual: 4,
      gestor: "Carlos Silva",
      buddy: "Ana Paula"
    },
    {
      id: "2",
      nome: "Juliana Mendes",
      cargo: "Engenheira de Processos",
      departamento: "Operações",
      dataAdmissao: "2025-12-05",
      progresso: 45,
      etapaAtual: 2,
      gestor: "Roberto Santos",
      buddy: "Pedro Lima"
    },
    {
      id: "3",
      nome: "Lucas Oliveira",
      cargo: "Técnico de Manutenção",
      departamento: "Manutenção",
      dataAdmissao: "2025-12-09",
      progresso: 15,
      etapaAtual: 1,
      gestor: "Maria Costa",
      buddy: "João Silva"
    }
  ];

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      titulo: "Boas-vindas",
      descricao: "Documentação inicial e acesso aos sistemas",
      icon: UserPlus,
      tarefas: [
        { id: "1.1", titulo: "Preencher formulário de admissão", concluida: true },
        { id: "1.2", titulo: "Enviar documentos pessoais", concluida: true },
        { id: "1.3", titulo: "Assinar contrato digital", concluida: true },
        { id: "1.4", titulo: "Foto para crachá", concluida: true }
      ]
    },
    {
      id: 2,
      titulo: "Acesso e Equipamentos",
      descricao: "Configuração de acessos e entrega de equipamentos",
      icon: Laptop,
      tarefas: [
        { id: "2.1", titulo: "Receber credenciais de acesso", concluida: true },
        { id: "2.2", titulo: "Configurar e-mail corporativo", concluida: true },
        { id: "2.3", titulo: "Receber notebook/equipamentos", concluida: false },
        { id: "2.4", titulo: "Acesso a sistemas (ERP, RH, etc)", concluida: false }
      ]
    },
    {
      id: 3,
      titulo: "Treinamentos Obrigatórios",
      descricao: "Cursos e certificações iniciais",
      icon: GraduationCap,
      tarefas: [
        { id: "3.1", titulo: "Integração Institucional", concluida: false },
        { id: "3.2", titulo: "Segurança do Trabalho", concluida: false },
        { id: "3.3", titulo: "Compliance e Ética", concluida: false },
        { id: "3.4", titulo: "LGPD e Segurança da Informação", concluida: false }
      ]
    },
    {
      id: 4,
      titulo: "Conhecendo a Equipe",
      descricao: "Integração com colegas e liderança",
      icon: Users,
      tarefas: [
        { id: "4.1", titulo: "Reunião com gestor direto", concluida: true },
        { id: "4.2", titulo: "Conhecer o buddy/mentor", concluida: true },
        { id: "4.3", titulo: "Tour virtual/presencial", concluida: false },
        { id: "4.4", titulo: "Almoço de boas-vindas", concluida: false }
      ]
    },
    {
      id: 5,
      titulo: "Início das Atividades",
      descricao: "Primeiras tarefas e objetivos",
      icon: Play,
      tarefas: [
        { id: "5.1", titulo: "Definir objetivos dos primeiros 30 dias", concluida: false },
        { id: "5.2", titulo: "Primeiro projeto/atividade", concluida: false },
        { id: "5.3", titulo: "Feedback da primeira semana", concluida: false },
        { id: "5.4", titulo: "Avaliação de 30 dias", concluida: false }
      ]
    }
  ];

  const getProgressColor = (progresso: number) => {
    if (progresso >= 75) return "text-green-500";
    if (progresso >= 50) return "text-blue-500";
    if (progresso >= 25) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Em Onboarding</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Concluídos (mês)</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">5 dias</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores em Integração</CardTitle>
            <CardDescription>Acompanhe o progresso de cada novo colaborador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {onboardingEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                  selectedEmployee?.id === employee.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{employee.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">{employee.cargo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className={`font-medium ${getProgressColor(employee.progresso)}`}>
                      {employee.progresso}%
                    </span>
                  </div>
                  <Progress value={employee.progresso} className="h-2" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(employee.dataAdmissao).toLocaleDateString("pt-BR")}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Etapa {employee.etapaAtual}/5
                  </Badge>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Onboarding Flow */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Integração</CardTitle>
            <CardDescription>
              {selectedEmployee 
                ? `Acompanhamento de ${selectedEmployee.nome}` 
                : "Selecione um colaborador para ver o progresso"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <div className="space-y-4">
                {/* Employee Info */}
                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {selectedEmployee.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedEmployee.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEmployee.cargo} • {selectedEmployee.departamento}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Gestor: {selectedEmployee.gestor}</p>
                    <p className="text-sm text-muted-foreground">Buddy: {selectedEmployee.buddy}</p>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-4">
                  {onboardingSteps.map((step, stepIndex) => {
                    const isCompleted = stepIndex + 1 < selectedEmployee.etapaAtual;
                    const isCurrent = stepIndex + 1 === selectedEmployee.etapaAtual;
                    const tarefasConcluidas = step.tarefas.filter(t => t.concluida).length;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stepIndex * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          isCompleted ? "bg-green-500/5 border-green-500/30" :
                            isCurrent ? "bg-blue-500/5 border-blue-500/30" :
                              "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-green-500 text-white" :
                              isCurrent ? "bg-blue-500 text-white" :
                                "bg-muted"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.titulo}</h4>
                              <Badge variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}>
                                {tarefasConcluidas}/{step.tarefas.length}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.descricao}</p>
                          </div>
                        </div>

                        {(isCompleted || isCurrent) && (
                          <div className="ml-13 space-y-2">
                            {step.tarefas.map((tarefa) => (
                              <div key={tarefa.id} className="flex items-center gap-2">
                                <Checkbox checked={tarefa.concluida} disabled />
                                <span className={`text-sm ${tarefa.concluida ? "line-through text-muted-foreground" : ""}`}>
                                  {tarefa.titulo}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Lembrete
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Agendar Reunião
                  </Button>
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UserPlus className="w-16 h-16 mb-4 opacity-50" />
                <p>Selecione um colaborador para ver os detalhes do onboarding</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
