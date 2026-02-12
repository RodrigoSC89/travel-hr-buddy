/**
 * Quick Actions Hub - Premium Component
 * Central de ações rápidas com busca inteligente e atalhos
 */

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, Plus, FileText, Users, Ship, Wrench,
  AlertTriangle, Calendar, Clock, DollarSign, Shield,
  Stethoscope, Recycle, Plane, Activity, Settings, Database,
  BarChart3, Brain, Sparkles, Zap, ArrowRight, Keyboard
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string;
  action: () => void;
  keywords: string[];
}

interface QuickActionsHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customActions?: QuickAction[];
}

export function QuickActionsHub({ open, onOpenChange, customActions = [] }: QuickActionsHubProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const defaultActions: QuickAction[] = [
    // Navegação Rápida
    { id: "nav-dashboard", title: "Ir para Dashboard", description: "Central de Comando", icon: Activity, category: "Navegação", shortcut: "g d", action: () => navigate("/"), keywords: ["home", "inicio", "central"] },
    { id: "nav-operations", title: "Operations Command", description: "Gestão de operações", icon: Ship, category: "Navegação", shortcut: "g o", action: () => navigate("/ops"), keywords: ["operacoes", "navios", "frota"] },
    { id: "nav-maintenance", title: "Manutenção", description: "Planejamento de manutenção", icon: Wrench, category: "Navegação", shortcut: "g m", action: () => navigate("/maintenance-command"), keywords: ["reparos", "equipamentos"] },
    { id: "nav-finance", title: "Finance Command", description: "Gestão financeira", icon: DollarSign, category: "Navegação", shortcut: "g f", action: () => navigate("/finance-command"), keywords: ["dinheiro", "custos", "receitas"] },
    { id: "nav-compliance", title: "Compliance & Audits", description: "Conformidade e auditorias", icon: Shield, category: "Navegação", shortcut: "g c", action: () => navigate("/compliance"), keywords: ["ism", "isps", "certificados"] },
    { id: "nav-people", title: "People Hub", description: "Gestão de pessoas", icon: Users, category: "Navegação", shortcut: "g p", action: () => navigate("/workbench?section=people"), keywords: ["tripulacao", "rh", "funcionarios"] },
    { id: "nav-documents", title: "Document Center", description: "Central de documentos", icon: FileText, category: "Navegação", shortcut: "g docs", action: () => navigate("/workbench?section=docs"), keywords: ["arquivos", "templates"] },
    { id: "nav-tracking", title: "Tracking & Telemetry", description: "Rastreamento e telemetria", icon: Activity, category: "Navegação", action: () => navigate("/tracking"), keywords: ["ais", "gps", "posicao"] },
    { id: "nav-medical", title: "Enfermaria Digital", description: "Gestão médica", icon: Stethoscope, category: "Navegação", action: () => navigate("/medical-infirmary"), keywords: ["saude", "medico", "atendimento"] },
    { id: "nav-waste", title: "Gestão de Resíduos", description: "MARPOL e meio ambiente", icon: Recycle, category: "Navegação", action: () => navigate("/waste-management"), keywords: ["marpol", "tanques", "descarte"] },
    { id: "nav-travel", title: "Travel Command", description: "Gestão de viagens", icon: Plane, category: "Navegação", action: () => navigate("/travel-command"), keywords: ["voos", "mobilizacao"] },
    { id: "nav-ai", title: "AI Control Tower", description: "Centro de IA", icon: Brain, category: "Navegação", shortcut: "g a", action: () => navigate("/ai"), keywords: ["inteligencia", "machine learning"] },
    
    // Ações Rápidas
    { id: "action-new-task", title: "Nova Tarefa", description: "Criar tarefa de manutenção", icon: Plus, category: "Ações", shortcut: "n t", action: () => { toast.info("Abrindo nova tarefa..."); }, keywords: ["criar", "adicionar", "task"] },
    { id: "action-new-document", title: "Novo Documento", description: "Upload ou criar documento", icon: FileText, category: "Ações", shortcut: "n d", action: () => { toast.info("Abrindo uploader..."); }, keywords: ["criar", "upload", "arquivo"] },
    { id: "action-schedule-audit", title: "Agendar Auditoria", description: "Programar nova auditoria", icon: Calendar, category: "Ações", action: () => { toast.info("Abrindo agendamento..."); }, keywords: ["auditar", "inspecao"] },
    { id: "action-new-crew", title: "Adicionar Tripulante", description: "Cadastrar novo tripulante", icon: Users, category: "Ações", shortcut: "n c", action: () => { toast.info("Abrindo cadastro..."); }, keywords: ["funcionario", "marinheiro"] },
    { id: "action-report", title: "Gerar Relatório", description: "Criar relatório executivo", icon: BarChart3, category: "Ações", shortcut: "n r", action: () => { toast.info("Selecionando tipo de relatório..."); }, keywords: ["exportar", "pdf", "excel"] },
    { id: "action-alert", title: "Registrar Alerta", description: "Criar alerta de segurança", icon: AlertTriangle, category: "Ações", action: () => { toast.info("Abrindo formulário de alerta..."); }, keywords: ["emergencia", "incidente", "seguranca"] },
    
    // IA
    { id: "ai-analyze", title: "Análise IA", description: "Solicitar análise inteligente", icon: Sparkles, category: "Inteligência Artificial", shortcut: "a i", action: () => { toast.info("Iniciando análise IA..."); }, keywords: ["gpt", "machine learning", "predicao"] },
    { id: "ai-predict", title: "Previsão de Manutenção", description: "Predição de falhas", icon: Brain, category: "Inteligência Artificial", action: () => { toast.info("Gerando previsões..."); }, keywords: ["manutencao preditiva"] },
    { id: "ai-optimize", title: "Otimizar Rotas", description: "Sugestões de economia", icon: Zap, category: "Inteligência Artificial", action: () => { toast.info("Calculando rotas otimizadas..."); }, keywords: ["combustivel", "economia"] },
    
    // Sistema
    { id: "sys-settings", title: "Configurações", description: "Ajustes do sistema", icon: Settings, category: "Sistema", shortcut: "g s", action: () => navigate("/settings"), keywords: ["preferencias", "conta"] },
    { id: "sys-database", title: "Status do Sistema", description: "Monitoramento e saúde", icon: Database, category: "Sistema", action: () => navigate("/command?tab=monitoring"), keywords: ["health", "monitoramento"] },
  ];

  const allActions = useMemo(() => {
    return [...defaultActions, ...customActions];
  }, [customActions]);

  const filteredActions = useMemo(() => {
    if (!search) return allActions;
    
    const searchLower = search.toLowerCase();
    return allActions.filter(action => 
      action.title.toLowerCase().includes(searchLower) ||
      action.description.toLowerCase().includes(searchLower) ||
      action.keywords.some(k => k.includes(searchLower)) ||
      action.category.toLowerCase().includes(searchLower)
    );
  }, [search, allActions]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, QuickAction[]> = {};
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
        e.preventDefault();
        filteredActions[selectedIndex].action();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredActions, selectedIndex, onOpenChange]);

  // Reset when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleActionClick = (action: QuickAction) => {
    action.action();
    onOpenChange(false);
    setSearch("");
  };

  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Ações Rápidas</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar ações, navegação, comandos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-20 h-12 text-base border-0 border-b rounded-none focus-visible:ring-0"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Command className="h-3 w-3" />K
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            <AnimatePresence mode="wait">
              {Object.entries(groupedActions).map(([category, actions]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {actions.map((action) => {
                      const currentIndex = flatIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      const Icon = action.icon;
                      
                      return (
                        <motion.button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isSelected 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted/50"
                          }`}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                            <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{action.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                          </div>
                          {action.shortcut && (
                            <div className="flex items-center gap-1">
                              {action.shortcut.split(" ").map((key) => (
                                <kbd
                                  key={key}
                                  className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                          <ArrowRight className={`h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"} transition-opacity`} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredActions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma ação encontrada</p>
                <p className="text-sm">Tente outro termo de busca</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Keyboard className="h-3 w-3" />
              Navegar: ↑↓
            </span>
            <span className="flex items-center gap-1">
              Enter para selecionar
            </span>
          </div>
          <span>Esc para fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuickActionsHub;
