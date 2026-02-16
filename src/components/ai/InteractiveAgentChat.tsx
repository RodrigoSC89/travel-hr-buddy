/**
 * Interactive AI Agent Chat - Agentes com chat real, ações e logs
 * Refactored: logic in sub-components, this file orchestrates state only
 */

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import type { Agent, AgentAction, ExecutionLog, Message } from "./agent-chat/types";
import { fallbackAgents, fallbackLogs } from "./agent-chat/data";
import { generateAgentResponse } from "./agent-chat/response-generator";
import { AgentListPanel } from "./agent-chat/AgentListPanel";
import { ChatPanel } from "./agent-chat/ChatPanel";
import { ExecutionLogsPanel } from "./agent-chat/ExecutionLogsPanel";
import { ApprovalDialog } from "./agent-chat/ApprovalDialog";

export function InteractiveAgentChat() {
  const { toast } = useToast();
  const [agents] = useState<Agent[]>(fallbackAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(fallbackAgents[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `Olá! Sou o ${fallbackAgents[0].name}. Como posso ajudar com otimização de viagens hoje?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [logs, setLogs] = useState<ExecutionLog[]>(fallbackLogs);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<AgentAction | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  const handleAgentChange = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        id: `msg-welcome-${agent.id}`,
        role: "assistant",
        content: `Olá! Sou o ${agent.name}. ${agent.description}. Como posso ajudar?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const response = generateAgentResponse(inputValue, selectedAgent);
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);

    const newLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      agent_id: selectedAgent.id,
      action: "Chat Interaction",
      status: "success",
      message: `Respondeu: "${inputValue.substring(0, 50)}..."`,
      timestamp: new Date().toISOString(),
      duration_ms: 1500,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleApproveAction = (action: AgentAction) => {
    setPendingAction(action);
    setIsApprovalOpen(true);
  };

  const handleRejectAction = (action: AgentAction) => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((a) =>
          a.id === action.id ? { ...a, status: "rejected" as const } : a
        ),
      }))
    );
    toast({ title: "Ação rejeitada", description: action.title, variant: "destructive" });
  };

  const handleApprove = () => {
    if (!pendingAction) return;
    setIsApprovalOpen(false);

    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((a) =>
          a.id === pendingAction.id ? { ...a, status: "executed" as const } : a
        ),
      }))
    );

    const newLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      agent_id: selectedAgent.id,
      action: pendingAction.title,
      status: "success",
      message: `Ação "${pendingAction.title}" executada com sucesso`,
      timestamp: new Date().toISOString(),
      duration_ms: 750,
    };
    setLogs((prev) => [newLog, ...prev]);
    toast({ title: "Ação executada", description: pendingAction.title });

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-confirm`,
        role: "system",
        content: `✅ Ação "${pendingAction.title}" executada com sucesso.`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setPendingAction(null);
  };

  const handleReject = () => {
    if (!pendingAction) return;
    setIsApprovalOpen(false);
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((a) =>
          a.id === pendingAction.id ? { ...a, status: "rejected" as const } : a
        ),
      }))
    );
    toast({ title: "Ação rejeitada", description: pendingAction.title, variant: "destructive" });
    setPendingAction(null);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copiado!", description: "Mensagem copiada para área de transferência" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      <AgentListPanel agents={agents} selectedAgent={selectedAgent} onSelectAgent={handleAgentChange} />
      <ChatPanel
        agent={selectedAgent}
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        onInputChange={setInputValue}
        onSend={handleSend}
        onApproveAction={handleApproveAction}
        onRejectAction={handleRejectAction}
        onCopy={handleCopy}
      />
      <ExecutionLogsPanel logs={logs} />
      <ApprovalDialog
        open={isApprovalOpen}
        onOpenChange={setIsApprovalOpen}
        action={pendingAction}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
