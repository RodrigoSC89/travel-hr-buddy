/**
 * 🧠 AgentMemoryPanel - View and manage agent conversation history
 * Checkpoint 3.2: Agent Memory System UI
 */
import { useState } from "react";
import { useConversations, useConversationMessages, useSaveConversation } from "@/hooks/useAgentMemory";
import { AGENT_CONTEXTS } from "@/lib/ai/agentContexts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, MessageSquare, Trash2, ChevronRight, Clock, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function AgentMemoryPanel() {
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const agentFilter = selectedAgent === "all" ? undefined : selectedAgent;
  const { data: conversations = [], isLoading: loadingConvos } = useConversations(agentFilter);
  const { data: messages = [], isLoading: loadingMsgs } = useConversationMessages(selectedConversation);
  const { deleteConversation } = useSaveConversation();

  const agents = Object.values(AGENT_CONTEXTS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Memória dos Agentes</h2>
            <p className="text-sm text-muted-foreground">
              Histórico de conversas persistido • {conversations.length} conversas
            </p>
          </div>
        </div>

        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os agentes</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {loadingConvos ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhuma conversa salva.
                  <br />
                  Converse com um agente para começar.
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((convo) => {
                    const agent = convo.module_context ? AGENT_CONTEXTS[convo.module_context] : null;
                    return (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo.id)}
                        className={cn(
                          "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-start gap-3",
                          selectedConversation === convo.id && "bg-muted"
                        )}
                      >
                        <Bot className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {convo.title || "Conversa sem título"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {agent && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {agent.name}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(convo.updated_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                {selectedConversation ? "Mensagens" : "Selecione uma conversa"}
              </CardTitle>
              {selectedConversation && (
                <CardDescription className="text-xs">
                  {messages.length} mensagens
                </CardDescription>
              )}
            </div>
            {selectedConversation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={async () => {
                  await deleteConversation(selectedConversation);
                  setSelectedConversation(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-4">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : !selectedConversation ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-12">
                  <Brain className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Selecione uma conversa para ver as mensagens</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Nenhuma mensagem nesta conversa.
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="shrink-0 mt-1 p-1.5 rounded-lg h-fit bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
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
                          <div className="prose prose-sm dark:prose-invert max-w-none">
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
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
