/**
 * Agent Grid for Enhanced Audit Agents Hub
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Clock, ChevronRight } from "lucide-react";
import type { AuditAgent } from "./types";

interface AgentGridProps {
  agents: AuditAgent[];
  selectedAgent: AuditAgent | null;
  onSelectAgent: (agent: AuditAgent) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, selectedAgent, onSelectAgent }) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        Agentes Disponíveis ({agents.length})
      </CardTitle>
      <CardDescription>
        Clique em um agente para iniciar uma conversa interativa
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 border rounded-xl cursor-pointer transition-all overflow-hidden ${
                  selectedAgent?.id === agent.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg"
                    : "hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
                }`}
                onClick={() => onSelectAgent(agent)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.bgColor} opacity-30`} />
                <div className="relative flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${agent.bgColor} border border-white/10`}>
                    <Icon className={`h-6 w-6 ${agent.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold truncate">{agent.name}</h4>
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        agent.status === "active" ? "bg-success animate-pulse" :
                        agent.status === "processing" ? "bg-primary animate-ping" :
                        "bg-muted-foreground"
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {agent.compliance.slice(0, 2).map((c, i) => (
                        <Badge key={`compliance-${c}-${i}`} variant="secondary" className="text-xs font-medium">
                          {c}
                        </Badge>
                      ))}
                      {agent.compliance.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.compliance.length - 2}
                        </Badge>
                      )}
                    </div>
                    {agent.lastActivity && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {agent.lastActivity}
                      </p>
                    )}
                  </div>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                    selectedAgent?.id === agent.id ? "rotate-90" : ""
                  }`} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </CardContent>
  </Card>
);
