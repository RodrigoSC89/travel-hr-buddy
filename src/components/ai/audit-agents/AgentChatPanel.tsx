import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditAgent, ChatMessage } from "./types";

interface AgentChatPanelProps {
  selectedAgent: AuditAgent | null;
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  enhanced?: boolean;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  selectedAgent, messages, input, isLoading, onInputChange, onSend, messagesEndRef, enhanced
}) => (
  <Card className={`${enhanced ? "h-[680px]" : "h-[600px]"} flex flex-col`}>
    <CardHeader className={`pb-3 ${enhanced ? "border-b" : ""}`}>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedAgent ? (
            <>
              {enhanced && selectedAgent.bgColor ? (
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${selectedAgent.bgColor}`}>
                  <selectedAgent.icon className={`h-4 w-4 ${selectedAgent.color}`} />
                </div>
              ) : (
                <selectedAgent.icon className="h-5 w-5" />
              )}
              <span>{selectedAgent.shortName}</span>
              {enhanced && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-2 w-2 mr-1" /> IA
                </Badge>
              )}
            </>
          ) : (
            <>
              <MessageSquare className="h-5 w-5" />
              Chat
            </>
          )}
        </div>
        {enhanced && selectedAgent && (
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className={`flex-1 flex flex-col min-h-0 ${enhanced ? "p-4" : ""}`}>
      {selectedAgent ? (
        <>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] p-${enhanced ? "4" : "3"} ${enhanced ? "rounded-2xl" : "rounded-lg"} ${
                        msg.role === "user"
                          ? `bg-primary text-primary-foreground ${enhanced ? "rounded-br-md" : ""}`
                          : `bg-muted ${enhanced ? "rounded-bl-md" : ""}`
                      }`}
                    >
                      {msg.role === "assistant" && selectedAgent && (
                        <div className={`flex items-center gap-2 mb-2 ${enhanced ? "pb-2 border-b border-border/50" : ""}`}>
                          <selectedAgent.icon className={`h-4 w-4 ${selectedAgent.color || ""}`} />
                          <span className="text-xs font-medium">{selectedAgent.shortName}</span>
                          {!enhanced && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-2 w-2 mr-1" /> IA
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className={`text-sm whitespace-pre-wrap ${enhanced ? "leading-relaxed" : ""}`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className={`bg-muted p-${enhanced ? "4" : "3"} ${enhanced ? "rounded-2xl rounded-bl-md" : "rounded-lg"}`}>
                    <div className="flex items-center gap-2">
                      {enhanced ? (
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : (
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      )}
                      <span className="text-sm">Analisando...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t mt-4">
            <Input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
              placeholder={`Pergunte ao ${selectedAgent.shortName}...`}
              disabled={isLoading}
              className={enhanced ? "h-12" : ""}
            />
            <Button onClick={onSend} disabled={!input.trim() || isLoading} size={enhanced ? "lg" : "default"} className={enhanced ? "px-6" : ""}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center text-center ${enhanced ? "p-6" : ""}`}>
          {enhanced ? (
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Bot className="h-20 w-20 text-muted-foreground/20 mb-6" />
            </motion.div>
          ) : (
            <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
          )}
          <h3 className={`font-${enhanced ? "semibold" : "medium"} ${enhanced ? "text-lg" : ""} mb-2`}>Selecione um Agente</h3>
          <p className={`text-sm text-muted-foreground ${enhanced ? "max-w-[250px]" : ""}`}>
            {enhanced
              ? "Escolha um dos 10 agentes de auditoria especializados para iniciar uma conversa sobre compliance marítimo"
              : "Escolha um agente de auditoria para iniciar uma conversa"}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
