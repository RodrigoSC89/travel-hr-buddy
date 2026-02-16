/**
 * Enhanced Audit Agents Hub - Central de Agentes de Auditoria com UX Premium
 * Refactored: orchestrator only, sub-components handle UI
 */
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuditStats } from "@/hooks/use-audit-stats";
import {
  Brain, FileCheck, AlertTriangle, Search, Activity,
  Sparkles, Zap, TrendingUp, RefreshCw
} from "lucide-react";

import type { AuditAgent, ChatMessage } from "./audit-agents/types";
import { ENHANCED_AUDIT_AGENTS, EDGE_FUNCTION_MAP, generateAgentResponse } from "./audit-agents/enhanced-agent-data";
import { EnhancedStatCard } from "./audit-agents/EnhancedStatCard";
import { AgentGrid } from "./audit-agents/AgentGrid";
import { AgentChatPanel } from "./audit-agents/AgentChatPanel";

export function EnhancedAuditAgentsHub() {
  const [selectedAgent, setSelectedAgent] = useState<AuditAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAuditStats();

  const filteredAgents = ENHANCED_AUDIT_AGENTS.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.compliance.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectAgent = (agent: AuditAgent) => {
    setSelectedAgent(agent);
    toast.success(`Conectado ao ${agent.shortName}`, {
      description: "Pronto para responder suas perguntas",
      icon: <agent.icon className="h-4 w-4" />
    });
    setMessages([{
      id: `welcome-${agent.id}`,
      role: "assistant",
      content: `👋 Olá! Sou o **${agent.name}**, seu assistente especializado em ${agent.description}.\n\n## Como posso ajudar?\n${agent.capabilities.map(c => `✅ ${c}`).join('\n')}\n\n## Normas de referência:\n${agent.compliance.map(c => `\`${c}\``).join(' • ')}\n\nFaça sua pergunta sobre compliance, auditoria ou regulamentações!`,
      timestamp: new Date(),
      agentId: agent.id
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`, role: "user", content: input, timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const functionName = EDGE_FUNCTION_MAP[selectedAgent.id] || "nauti-brain";
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { message: currentInput, context: selectedAgent.id, agentType: selectedAgent.id.toUpperCase() }
      });

      const responseContent = error
        ? generateAgentResponse(selectedAgent, currentInput)
        : data?.response || data?.message || data?.answer || generateAgentResponse(selectedAgent, currentInput);

      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`, role: "assistant", content: responseContent,
        timestamp: new Date(), agentId: selectedAgent.id
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`, role: "assistant",
        content: generateAgentResponse(selectedAgent, currentInput),
        timestamp: new Date(), agentId: selectedAgent.id
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-xl rounded-full" />
            <div className="relative p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/20">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Central de Agentes de Auditoria
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              10 agentes especializados em compliance marítimo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Badge variant="outline" className="gap-1 px-3 py-1.5">
            <Activity className="h-3 w-3 text-success animate-pulse" />
            {ENHANCED_AUDIT_AGENTS.filter(a => a.status === "active").length} ativos
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <EnhancedStatCard icon={TrendingUp} value={`${stats?.complianceRate?.toFixed(1) || "98.5"}%`} label="Taxa de Conformidade" color="from-success to-success/70" loading={statsLoading} />
        <EnhancedStatCard icon={FileCheck} value={stats?.totalAudits || 0} label="Auditorias" color="from-primary to-info" loading={statsLoading} />
        <EnhancedStatCard icon={AlertTriangle} value={stats?.openNCs || 0} label="NCs Abertas" color="from-warning to-warning/70" loading={statsLoading} />
        <EnhancedStatCard icon={Brain} value={stats?.activeAgents || 10} label="Agentes Ativos" color="from-accent to-accent/70" loading={statsLoading} />
        <EnhancedStatCard icon={Zap} value="24/7" label="Disponibilidade" color="from-info to-primary" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar agente por nome, descrição ou norma (PEOTRAM, MLC, SGSO...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AgentGrid agents={filteredAgents} selectedAgent={selectedAgent} onSelectAgent={handleSelectAgent} />
        </div>
        <div>
          <AgentChatPanel
            selectedAgent={selectedAgent}
            messages={messages}
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSend={handleSendMessage}
            messagesEndRef={messagesEndRef}
            enhanced
          />
        </div>
      </div>
    </div>
  );
}

export default EnhancedAuditAgentsHub;
