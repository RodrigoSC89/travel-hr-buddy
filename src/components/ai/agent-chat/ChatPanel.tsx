/**
 * Chat panel - messages, input, and action cards
 */
import React, { useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Send, User, Sparkles, CheckCircle2, XCircle,
  Zap, Brain, Copy, Settings, Activity,
} from "lucide-react";
import type { Agent, AgentAction, Message } from "./types";

interface ChatPanelProps {
  agent: Agent;
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onApproveAction: (action: AgentAction) => void;
  onRejectAction: (action: AgentAction) => void;
  onCopy: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  agent, messages, inputValue, isTyping,
  onInputChange, onSend, onApproveAction, onRejectAction, onCopy,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                  {agent.status === "active" ? "Ativo" : agent.status === "busy" ? "Ocupado" : "Offline"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {agent.capabilities.slice(0, 2).join(", ")}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Configurações do agente" title="Configurações">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`p-2 rounded-full h-fit ${
                msg.role === "user" ? "bg-primary"
                  : msg.role === "system" ? "bg-muted"
                  : "bg-secondary"
              }`}>
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : msg.role === "system" ? (
                  <Zap className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                <div className={`p-3 rounded-lg ${
                  msg.role === "user" ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.actions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onApprove={onApproveAction}
                        onReject={onRejectAction}
                      />
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.metadata && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{msg.metadata.latency_ms}ms</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{msg.metadata.confidence}% conf.</span>
                    </>
                  )}
                  {msg.role === "assistant" && (
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6"
                      onClick={() => onCopy(msg.content)}
                      aria-label="Copiar mensagem" title="Copiar"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="p-2 rounded-full bg-secondary h-fit">
                <Bot className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          />
          <Button onClick={onSend} disabled={!inputValue.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />GPT-4o</span>
          <span className="flex items-center gap-1"><Activity className="h-3 w-3" />Contexto: Marítimo</span>
        </div>
      </div>
    </Card>
  );
};

/** Inline action card within a message */
const ActionCard: React.FC<{
  action: AgentAction;
  onApprove: (a: AgentAction) => void;
  onReject: (a: AgentAction) => void;
}> = ({ action, onApprove, onReject }) => (
  <div className="p-3 bg-background border rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Zap className={`h-4 w-4 ${
          action.impact === "high" ? "text-destructive"
            : action.impact === "medium" ? "text-warning"
            : "text-muted-foreground"
        }`} />
        <span className="font-medium text-sm">{action.title}</span>
      </div>
      <Badge variant={
        action.status === "executed" ? "default"
          : action.status === "rejected" ? "destructive"
          : "secondary"
      }>
        {action.status === "executed" ? "Executado"
          : action.status === "rejected" ? "Rejeitado"
          : "Pendente"}
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
    {action.status === "pending" && (
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onApprove(action)}>
          <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onReject(action)}>
          <XCircle className="h-3 w-3 mr-1" />Rejeitar
        </Button>
      </div>
    )}
  </div>
);
