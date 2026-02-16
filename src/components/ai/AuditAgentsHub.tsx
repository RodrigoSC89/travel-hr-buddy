/**
 * Audit Agents Hub - Central de Agentes de Auditoria
 * Refactored: extracted agent data, chat panel, and response generator
 */
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Bot, Activity, Search, CheckCircle2, FileCheck, AlertTriangle, Clock } from "lucide-react";
import { AUDIT_AGENTS, EDGE_FUNCTION_MAP, generateAgentResponse } from "./audit-agents/agent-data";
import { AgentChatPanel } from "./audit-agents/AgentChatPanel";
import type { AuditAgent, ChatMessage } from "./audit-agents/types";

export function AuditAgentsHub() {
  const [selectedAgent, setSelectedAgent] = useState<AuditAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const filteredAgents = AUDIT_AGENTS.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.compliance.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAgent = (agent: AuditAgent) => {
    setSelectedAgent(agent);
    setMessages([{
      id: `welcome-${agent.id}`, role: "assistant", timestamp: new Date(), agentId: agent.id,
      content: `👋 Olá! Sou o **${agent.name}**, seu assistente especializado em ${agent.description}.\n\n## Posso ajudar com:\n${agent.capabilities.map(c => `- ${c}`).join('\n')}\n\n## Normas de referência:\n${agent.compliance.map(c => `\`${c}\``).join(' • ')}\n\nComo posso ajudar hoje?`
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    try {
      const functionName = EDGE_FUNCTION_MAP[selectedAgent.id] || "nauti-brain";
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { message: currentInput, context: selectedAgent.id, agentType: selectedAgent.id.toUpperCase() }
      });
      const responseContent = error ? generateAgentResponse(selectedAgent, currentInput) :
        (data?.response || data?.message || data?.answer || generateAgentResponse(selectedAgent, currentInput));
      setMessages(prev => [...prev, { id: `agent-${Date.now()}`, role: "assistant", content: responseContent, timestamp: new Date(), agentId: selectedAgent.id }]);
    } catch {
      setMessages(prev => [...prev, { id: `agent-${Date.now()}`, role: "assistant", content: generateAgentResponse(selectedAgent, currentInput), timestamp: new Date(), agentId: selectedAgent.id }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl"><Brain className="h-8 w-8 text-primary" /></div>
          <div><h1 className="text-2xl font-bold">Central de Agentes de Auditoria</h1><p className="text-muted-foreground">10 agentes especializados em compliance marítimo</p></div>
        </div>
        <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3 text-green-500" />{AUDIT_AGENTS.filter(a => a.status === "active").length} ativos</Badge>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar agente por nome, descrição ou norma..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Agentes Disponíveis ({filteredAgents.length})</CardTitle><CardDescription>Clique em um agente para interagir</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <motion.div key={agent.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAgent?.id === agent.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/50 hover:bg-muted/50"}`}
                      onClick={() => handleSelectAgent(agent)}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.bgColor || "from-primary/20 to-primary/5"} text-white`}><Icon className="h-5 w-5" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between"><h4 className="font-medium truncate">{agent.name}</h4><div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-success" : agent.status === "processing" ? "bg-info animate-pulse" : "bg-muted-foreground"}`} /></div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{agent.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">{agent.compliance.slice(0, 2).map((c) => (<Badge key={c} variant="secondary" className="text-xs">{c}</Badge>))}{agent.compliance.length > 2 && (<Badge variant="outline" className="text-xs">+{agent.compliance.length - 2}</Badge>)}</div>
                          {agent.lastActivity && (<p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3" />{agent.lastActivity}</p>)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div><AgentChatPanel selectedAgent={selectedAgent} messages={messages} input={input} isLoading={isLoading} onInputChange={setInput} onSend={handleSendMessage} messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>} /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">98.5%</p><p className="text-xs text-muted-foreground">Taxa de Conformidade</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileCheck className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">1,234</p><p className="text-xs text-muted-foreground">Auditorias</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">12</p><p className="text-xs text-muted-foreground">NCs Abertas</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Brain className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">10</p><p className="text-xs text-muted-foreground">Agentes Ativos</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-cyan-500" /><div><p className="text-2xl font-bold">24/7</p><p className="text-xs text-muted-foreground">Disponibilidade</p></div></div></CardContent></Card>
      </div>
    </div>
  );
}

export default AuditAgentsHub;
