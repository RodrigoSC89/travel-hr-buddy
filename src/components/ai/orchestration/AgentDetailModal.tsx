import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { OrchAgent, autonomyLabels } from "./orchestration-data";

interface AgentDetailModalProps {
  agent: OrchAgent;
  onClose: () => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose }) => {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background p-6 rounded-xl max-w-lg w-full mx-4 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{agent.name}</h2>
            <p className="text-sm text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-medium">{agent.model}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Autonomia</p>
            <p className={`font-medium ${autonomyLabels[agent.autonomyLevel].color}`}>
              {autonomyLabels[agent.autonomyLevel].label}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Tasks Completadas</p>
            <p className="font-medium">{agent.tasksCompleted}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
            <p className="font-medium">{agent.avgResponseMs}ms</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Última Ação</p>
          <p className="text-sm">{agent.lastAction}</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="flex-1" onClick={() => toast.success(`Histórico do ${agent.name} carregado`)}>
            Ver Histórico
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => { toast.success(`Agente ${agent.name} reiniciado`); onClose(); }}>
            Reiniciar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
