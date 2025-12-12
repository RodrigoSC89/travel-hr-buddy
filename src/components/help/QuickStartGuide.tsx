/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 838: Quick Start Guide
 * Onboarding guide for new users
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
  Users,
  Ship,
  Calendar,
  FileText,
  Settings,
  Bell,
  Shield,
  Wifi,
  WifiOff,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tasks: Task[];
  tips: string[];
}

interface Task {
  id: string;
  label: string;
  action?: string;
  path?: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Nautilus One",
    description: "Sistema completo para gestão marítima e RH",
    icon: Rocket,
    tasks: [
      { id: "profile", label: "Completar seu perfil", path: "/profile" },
      { id: "theme", label: "Escolher tema claro/escuro", action: "toggle-theme" },
      { id: "notifications", label: "Configurar notificações", path: "/settings" },
    ],
    tips: [
      "Use Ctrl+K para busca rápida em qualquer tela",
      "O sistema funciona offline - seus dados são sincronizados automaticamente",
    ],
  },
  {
    id: "maritime",
    title: "Módulo Marítimo",
    description: "Gerencie embarcações, tripulação e operações",
    icon: Ship,
    tasks: [
      { id: "vessel", label: "Cadastrar primeira embarcação", path: "/fleet" },
      { id: "crew", label: "Adicionar tripulantes", path: "/crew" },
      { id: "schedule", label: "Criar escala de bordo", path: "/calendar" },
    ],
    tips: [
      "Certificados com vencimento próximo aparecem em vermelho",
      "Arraste e solte para reorganizar escalas",
    ],
  },
  {
    id: "hr",
    title: "Recursos Humanos",
    description: "Gestão completa de colaboradores",
    icon: Users,
    tasks: [
      { id: "employee", label: "Cadastrar colaborador", path: "/employees" },
      { id: "documents", label: "Upload de documentos", path: "/documents" },
      { id: "vacation", label: "Configurar férias", path: "/vacations" },
    ],
    tips: [
      "Documentos são verificados automaticamente por IA",
      "Alertas de vencimento são enviados com 30 dias de antecedência",
    ],
  },
  {
    id: "operations",
    title: "Operações Diárias",
    description: "Reservas, viagens e planejamento",
    icon: Calendar,
    tasks: [
      { id: "reservation", label: "Criar reserva", path: "/reservations" },
      { id: "travel", label: "Planejar viagem", path: "/travel" },
      { id: "alerts", label: "Configurar alertas de preço", path: "/price-alerts" },
    ],
    tips: [
      "Alertas de preço notificam automaticamente quando há oportunidades",
      "Use filtros para encontrar melhores opções de viagem",
    ],
  },
  {
    id: "advanced",
    title: "Recursos Avançados",
    description: "IA, relatórios e automações",
    icon: Settings,
    tasks: [
      { id: "ai", label: "Testar assistente IA", action: "open-ai" },
      { id: "reports", label: "Gerar primeiro relatório", path: "/reports" },
      { id: "automation", label: "Criar automação", path: "/automations" },
    ],
    tips: [
      "A IA aprende com seu uso e melhora sugestões ao longo do tempo",
      "Relatórios podem ser agendados para envio automático",
    ],
  },
];

const STORAGE_KEY = "nautilus_onboarding_progress";

export const QuickStartGuide = memo(function() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedTasks(new Set(data.completedTasks || []));
      setDismissed(data.dismissed || false);
      setCurrentStep(data.currentStep || 0);
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedTasks: Array.from(completedTasks),
        dismissed,
        currentStep,
      })
    );
  }, [completedTasks, dismissed, currentStep]);

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const totalTasks = ONBOARDING_STEPS.reduce((acc, step) => acc + step.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progress = Math.round((completedCount / totalTasks) * 100);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const stepProgress = currentStepData.tasks.filter(t => completedTasks.has(t.id)).length;

  if (dismissed && progress === 100) return null;

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && !dismissed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={handleSetIsOpen}
              size="lg"
              className="rounded-full h-14 px-6 shadow-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Início Rápido
              <Badge className="ml-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold border-0">
                {progress}%
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[80vh] overflow-hidden"
          >
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    <CardTitle>Início Rápido</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDismissed(true);
                        setIsOpen(false);
                      }}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Complete as etapas para dominar o sistema
                </CardDescription>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{completedCount} de {totalTasks} tarefas</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Step navigation */}
                <div className="flex border-b overflow-x-auto">
                  {ONBOARDING_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const stepCompleted = step.tasks.every(t => completedTasks.has(t.id));
                    
                    return (
                      <button
                        key={step.id}
                        onClick={handleSetCurrentStep}
                        className={cn(
                          "flex-1 min-w-[60px] p-3 flex flex-col items-center gap-1 transition-colors",
                          index === currentStep
                            ? "bg-primary/10 border-b-2 border-primary"
                            : "hover:bg-muted/50",
                          stepCompleted && "text-green-600"
                        )}
                      >
                        {stepCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        <span className="text-xs truncate">{index + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Current step content */}
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {React.createElement(currentStepData.icon, { className: "w-5 h-5 text-primary" })}
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStepData.description}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {stepProgress}/{currentStepData.tasks.length} concluídas
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {currentStepData.tasks.map((task) => {
                      const isCompleted = completedTasks.has(task.id);
                      
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                            isCompleted
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => handletoggleTask}
                        >
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleTask(task.id}
                          />
                          <span className={cn(
                            "flex-1 text-sm",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {task.label}
                          </span>
                          {task.path && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = task.path!;
                              }}
                            >
                              Ir <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tips */}
                  {currentStepData.tips.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                        <Lightbulb className="w-4 h-4" />
                        Dicas
                      </div>
                      {currentStepData.tips.map((tip, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground pl-6"
                        >
                          • {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between p-4 border-t bg-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetCurrentStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (currentStep === ONBOARDING_STEPS.length - 1) {
                        setIsOpen(false);
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                  >
                    {currentStep === ONBOARDING_STEPS.length - 1 ? "Concluir" : "Próximo"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Feature highlights for specific features
 */
export const FeatureHighlight = memo(function({
  feature,
  children,
  position = "bottom",
}: {
  feature: "offline" | "ai" | "notifications" | "security";
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}) {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `feature_highlight_${feature}`;
    const wasDismissed = localStorage.getItem(key);
    if (wasDismissed) {
      setDismissed(true);
    } else {
      setTimeout(() => setShown(true), 2000);
    }
  }, [feature]);

  const dismiss = () => {
    localStorage.setItem(`feature_highlight_${feature}`, "true");
    setDismissed(true);
    setShown(false);
  });

  const features = {
    offline: {
      icon: WifiOff,
      title: "Modo Offline",
      description: "O sistema funciona sem internet. Seus dados são sincronizados automaticamente.",
    },
    ai: {
      icon: Lightbulb,
      title: "Assistente IA",
      description: "Pergunte qualquer coisa! A IA entende contexto e ajuda em tarefas.",
    },
    notifications: {
      icon: Bell,
      title: "Notificações Inteligentes",
      description: "Receba alertas de certificados, deadlines e oportunidades.",
    },
    security: {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Seus dados são criptografados e protegidos com RLS.",
    },
  });

  const featureData = features[feature];

  if (dismissed || !shown) return <>{children}</>;

  return (
    <div className="relative inline-block">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "absolute z-50 w-64 p-3 bg-popover border rounded-lg shadow-lg",
          position === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
          position === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          position === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
          position === "right" && "left-full top-1/2 -translate-y-1/2 ml-2"
        )}
      >
        <div className="flex items-start gap-2">
          {React.createElement(featureData.icon, { className: "w-5 h-5 text-primary shrink-0 mt-0.5" })}
          <div className="flex-1">
            <p className="font-medium text-sm">{featureData.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {featureData.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={dismiss}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default QuickStartGuide;
