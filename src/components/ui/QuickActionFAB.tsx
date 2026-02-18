/**
 * CommandScore - Quick action floating button com ações contextuais
 * Benchmark: Linear (⌘.), Notion slash commands
 * Enhanced: Context-aware per hub + keyboard shortcut hint
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus, FileText, Users, Ship, Wrench,
  AlertTriangle, ClipboardCheck, X, Shield,
  Brain, Satellite, Briefcase, Compass,
  Keyboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  color?: string;
}

const globalActions: QuickAction[] = [
  { id: "vessel", label: "Nova Embarcação", icon: <Ship className="h-4 w-4" />, path: "/ops?action=new-vessel" },
  { id: "crew", label: "Novo Tripulante", icon: <Users className="h-4 w-4" />, path: "/people?action=new-crew" },
  { id: "wo", label: "Work Order", icon: <Wrench className="h-4 w-4" />, path: "/maintenance?action=new-wo" },
  { id: "incident", label: "Reportar Incidente", icon: <AlertTriangle className="h-4 w-4" />, path: "/compliance?action=new-incident", color: "destructive" },
  { id: "checklist", label: "Nova Checklist", icon: <ClipboardCheck className="h-4 w-4" />, path: "/compliance?action=new-checklist" },
  { id: "document", label: "Novo Documento", icon: <FileText className="h-4 w-4" />, path: "/documents?action=new" },
];

// Context-aware actions per hub
const hubActions: Record<string, QuickAction[]> = {
  "/command": [
    { id: "alerts", label: "Ver Alertas", icon: <AlertTriangle className="h-4 w-4" />, path: "/command?tab=alerts" },
    { id: "noc", label: "Abrir NOC", icon: <Compass className="h-4 w-4" />, path: "/command?tab=noc" },
    { id: "ceo", label: "CEO Dashboard", icon: <Briefcase className="h-4 w-4" />, path: "/command?tab=ceo" },
  ],
  "/ops": [
    { id: "voyage", label: "Nova Viagem", icon: <Ship className="h-4 w-4" />, path: "/ops?tab=voyage" },
    { id: "contract", label: "Novo Contrato", icon: <FileText className="h-4 w-4" />, path: "/ops?tab=contracts" },
    { id: "fleet", label: "Ver Frota", icon: <Compass className="h-4 w-4" />, path: "/ops?tab=fleet" },
  ],
  "/maintenance": [
    { id: "new-wo", label: "Nova OS", icon: <Wrench className="h-4 w-4" />, path: "/maintenance?tab=overview" },
    { id: "surveys", label: "Vistorias de Classe", icon: <Shield className="h-4 w-4" />, path: "/maintenance?tab=surveys" },
    { id: "predictive", label: "Manutenção Preditiva", icon: <Brain className="h-4 w-4" />, path: "/maintenance?tab=predictive" },
  ],
  "/compliance": [
    { id: "audit", label: "Nova Auditoria", icon: <Shield className="h-4 w-4" />, path: "/compliance?tab=audits" },
    { id: "ism", label: "ISM Code", icon: <ClipboardCheck className="h-4 w-4" />, path: "/ism-code" },
    { id: "evidence", label: "Evidence Pack", icon: <FileText className="h-4 w-4" />, path: "/smart-evidence" },
  ],
  "/tracking": [
    { id: "ais", label: "AIS Tracker", icon: <Satellite className="h-4 w-4" />, path: "/tracking?tab=ais" },
    { id: "weather", label: "Meteorologia", icon: <Compass className="h-4 w-4" />, path: "/weather-routing" },
  ],
};

export const QuickActionFAB = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const actions = useMemo(() => {
    const contextActions = hubActions[location.pathname];
    if (contextActions) {
      return [...contextActions, ...globalActions.filter(a => !contextActions.some(c => c.id === a.id))];
    }
    return globalActions;
  }, [location.pathname]);

  const handleAction = useCallback((action: QuickAction) => {
    setIsOpen(false);
    if (action.path) navigate(action.path);
    else if (action.action) action.action();
  }, [navigate]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB + Actions */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Context label */}
              {hubActions[location.pathname] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 py-1"
                >
                  Ações contextuais
                </motion.div>
              )}
              {actions.map((action, i) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ delay: i * 0.03, type: "spring", damping: 22 }}
                >
                  <button
                    onClick={() => handleAction(action)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg",
                      "bg-card border border-border text-foreground",
                      "hover:bg-accent transition-colors text-sm font-medium",
                      "whitespace-nowrap",
                      i < (hubActions[location.pathname]?.length || 0) && "border-primary/20 bg-primary/5"
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                </motion.div>
              ))}

              {/* Keyboard hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 px-3 py-1"
              >
                <Keyboard className="h-3 w-3" />
                Pressione <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">?</kbd> para ver todos os atalhos
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.92 }}>
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-2xl shadow-2xl transition-all",
              isOpen 
                ? "bg-muted text-muted-foreground rotate-45" 
                : "bg-primary text-primary-foreground hover:shadow-primary/30 hover:shadow-xl"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar ações rápidas" : "Ações rápidas"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </motion.div>
      </div>
    </>
  );
});

QuickActionFAB.displayName = "QuickActionFAB";
