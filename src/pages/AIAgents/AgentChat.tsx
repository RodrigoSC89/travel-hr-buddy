/**
 * 🤖 AgentChat - Chat interface for maritime AI agents
 * Supports streaming responses via Lovable AI Gateway.
 */
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAgent } from "@/hooks/useAgent";
import { AGENT_CONTEXTS } from "@/lib/ai/agentContexts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Send, RotateCcw, User, Bot, ArrowLeft,
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Users, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

/** Map agent icon string to Lucide component */
const ICON_MAP: Record<string, React.ElementType> = {
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Users, Radio,
};

/** Map agent color string to Tailwind classes */
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-500",    border: "border-blue-500/20",    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  orange:  { bg: "bg-orange-500/10",  text: "text-orange-500",  border: "border-orange-500/20",  badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  red:     { bg: "bg-red-500/10",     text: "text-red-500",     border: "border-red-500/20",     badge: "bg-red-500/15 text-red-700 dark:text-red-300" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-500",    border: "border-pink-500/20",    badge: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  green:   { bg: "bg-green-500/10",   text: "text-green-500",   border: "border-green-500/20",   badge: "bg-green-500/15 text-green-700 dark:text-green-300" },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-500",    border: "border-cyan-500/20",    badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-500",  border: "border-purple-500/20",  badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-500",  border: "border-indigo-500/20",  badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  teal:    { bg: "bg-teal-500/10",    text: "text-teal-500",    border: "border-teal-500/20",    badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
};

function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const agentCtx = agentId ? AGENT_CONTEXTS[agentId] : undefined;
  const {
    sendMessage,
    resetConversation,
    conversationHistory,
    isLoading,
    error,
    streamingContent,
  } = useAgent(agentId || "");

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory, streamingContent]);

  if (!agentCtx) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Agente não encontrado</CardTitle>
            <CardDescription>
              O agente &quot;{agentId}&quot; não existe no registro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/ai">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para AI Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colors = COLOR_MAP[agentCtx.color] || COLOR_MAP.blue;
  const IconComponent = ICON_MAP[agentCtx.icon] || Bot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    try {
      await sendMessage(message);
    } catch {
      // Error handled by hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Merge committed history + live streaming content
  const displayMessages = [...conversationHistory];
  const isStreaming = isLoading && streamingContent;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto p-4 gap-4">
      {/* Header */}
      <Card className={cn("shrink-0 border", colors.border)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", colors.bg)}>
                <IconComponent className={cn("h-6 w-6", colors.text)} />
              </div>
              <div>
                <CardTitle className="text-lg">{agentCtx.name}</CardTitle>
                <CardDescription>{agentCtx.role}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/ai">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
                disabled={conversationHistory.length === 0 && !isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {agentCtx.expertise.map((skill) => (
              <Badge key={skill} variant="secondary" className={cn("text-xs", colors.badge)}>
                {skill}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {displayMessages.length === 0 && !isStreaming ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                <div className={cn("p-4 rounded-full", colors.bg)}>
                  <IconComponent className={cn("h-10 w-10", colors.text)} />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Inicie uma conversa com {agentCtx.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Posso ajudar com {agentCtx.expertise[0]?.toLowerCase()},{" "}
                    {agentCtx.expertise[1]?.toLowerCase()}, e mais.
                  </p>
                </div>
                <div className="text-left max-w-md">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Sugestões:
                  </p>
                  <ul className="space-y-1.5">
                    {agentCtx.responsibilities.slice(0, 3).map((resp) => (
                      <li
                        key={resp}
                        className="text-sm text-muted-foreground flex items-start gap-2 cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setInput(resp)}
                      >
                        <span className="text-primary mt-0.5">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-4">
                {displayMessages.map((msg, idx) => (
                  <div
                    key={`msg-${idx}-${msg.role}`}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className={cn("shrink-0 mt-1 p-1.5 rounded-lg h-fit", colors.bg)}>
                        <IconComponent className={cn("h-4 w-4", colors.text)} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 max-w-[85%] text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="shrink-0 mt-1 p-1.5 rounded-lg h-fit bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming response */}
                {isStreaming && (
                  <div className="flex gap-3 justify-start">
                    <div className={cn("shrink-0 mt-1 p-1.5 rounded-lg h-fit", colors.bg)}>
                      <IconComponent className={cn("h-4 w-4", colors.text)} />
                    </div>
                    <div className="rounded-lg px-4 py-3 max-w-[85%] text-sm bg-muted text-foreground">
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator (no streaming content yet) */}
                {isLoading && !streamingContent && (
                  <div className="flex gap-3 justify-start">
                    <div className={cn("shrink-0 mt-1 p-1.5 rounded-lg h-fit", colors.bg)}>
                      <IconComponent className={cn("h-4 w-4", colors.text)} />
                    </div>
                    <div className="rounded-lg px-4 py-3 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pergunte ao ${agentCtx.name}...`}
                className="min-h-[56px] max-h-[160px] resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0 h-[56px] w-[56px]"
                aria-label="Enviar mensagem ao agente"
                title="Enviar"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            {error && (
              <p className="text-sm text-destructive mt-2">Erro: {error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AgentChat;
