/**
 * ForumKnowledgePage - Real data from ai_chat_conversations + ai_document_templates
 */
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MessageSquare, BookOpen, Users, ThumbsUp, Pin, Clock, Plus, Ship, Wrench, Shield, Fuel, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LucideIcon } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  lastReply: string;
  pinned: boolean;
  solved: boolean;
}

interface KBDoc {
  id: string;
  title: string;
  category: string;
  updated: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  Maintenance: Wrench,
  Compliance: Shield,
  Performance: Fuel,
  Crew: Users,
  Bunker: Fuel,
};

const categoryColors: Record<string, string> = {
  Maintenance: "bg-blue-500/20 text-blue-400",
  Compliance: "bg-purple-500/20 text-purple-400",
  Performance: "bg-green-500/20 text-green-400",
  Crew: "bg-orange-500/20 text-orange-400",
  Bunker: "bg-red-500/20 text-red-400",
  General: "bg-muted text-muted-foreground",
};

export default function ForumKnowledgePage() {
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ["forum-topics"],
    queryFn: async (): Promise<Topic[]> => {
      const { data } = await supabase
        .from("ai_chat_conversations")
        .select("id, title, module_context, created_at, updated_at, metadata")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (!data || data.length === 0) return [];

      return data.map((conv) => {
        const meta = (conv.metadata || {}) as Record<string, unknown>;
        return {
          id: conv.id,
          title: conv.title || "Tópico sem título",
          category: inferCategory(conv.module_context || ""),
          author: String(meta.author || "Usuário"),
          replies: Number(meta.reply_count || 0),
          views: Number(meta.view_count || 0),
          lastReply: formatTimeAgo(conv.updated_at),
          pinned: Boolean(meta.pinned),
          solved: Boolean(meta.solved),
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: kbDocs = [], isLoading: loadingKB } = useQuery({
    queryKey: ["forum-kb"],
    queryFn: async (): Promise<KBDoc[]> => {
      const { data } = await supabase
        .from("ai_document_templates")
        .select("id, title, template_type, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (!data || data.length === 0) return [];

      return data.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: inferCategory(doc.template_type),
        updated: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString("pt-BR") : "N/A",
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const solvedCount = useMemo(() => topics.filter(t => t.solved).length, [topics]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Forum & Knowledge Share
          </h1>
          <p className="text-muted-foreground">Compartilhamento de conhecimento entre frota e escritório</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Tópico</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><MessageSquare className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Tópicos Ativos</p><p className="text-2xl font-bold">{loadingTopics ? "..." : topics.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Participantes</p><p className="text-2xl font-bold">{loadingTopics ? "..." : new Set(topics.map(t => t.author)).size}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Knowledge Base</p><p className="text-2xl font-bold">{loadingKB ? "..." : `${kbDocs.length} docs`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ThumbsUp className="h-8 w-8 text-yellow-400" /><div><p className="text-sm text-muted-foreground">Resolvidos</p><p className="text-2xl font-bold">{loadingTopics ? "..." : solvedCount}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="forum">
        <TabsList>
          <TabsTrigger value="forum">Fórum</TabsTrigger>
          <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="space-y-3">
          <div className="flex gap-4">
            <Input placeholder="Buscar tópicos..." className="max-w-sm" />
          </div>
          {loadingTopics ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum tópico encontrado. Inicie conversas no AI Chat para gerar tópicos automaticamente.</p>
          ) : (
            topics.map(topic => {
              const CatIcon = categoryIcons[topic.category] || MessageSquare;
              return (
                <Card key={topic.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="mt-1">
                        <AvatarFallback>{topic.author.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {topic.pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                          <h3 className="font-medium truncate">{topic.title}</h3>
                          {topic.solved && <Badge className="bg-green-500/20 text-green-400 shrink-0">Resolvido</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span>{topic.author}</span>
                          <Badge className={(categoryColors[topic.category] || categoryColors.General) + " text-xs"}>
                            <CatIcon className="h-3 w-3 mr-1" />{topic.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm shrink-0">
                        <p>{topic.replies} respostas</p>
                        <p className="text-xs text-muted-foreground">{topic.views} views</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-3 w-3" /> {topic.lastReply}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="kb">
          {loadingKB ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : kbDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento na Knowledge Base. Crie templates no módulo de documentos IA.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kbDocs.map((doc) => (
                <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <BookOpen className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge className={categoryColors[doc.category] || categoryColors.General}>{doc.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Atualizado: {doc.updated}</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">Download</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function inferCategory(context: string): string {
  const lower = (context || "").toLowerCase();
  if (lower.includes("maintenance") || lower.includes("pms")) return "Maintenance";
  if (lower.includes("compliance") || lower.includes("ism") || lower.includes("mlc")) return "Compliance";
  if (lower.includes("crew") || lower.includes("hr")) return "Crew";
  if (lower.includes("bunker") || lower.includes("fuel")) return "Bunker";
  if (lower.includes("perf") || lower.includes("voyage")) return "Performance";
  return "General";
}

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}
