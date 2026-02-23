import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, BookOpen, Users, ThumbsUp, Pin, Clock, Plus, Search, Ship, Wrench, Shield, Fuel } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_TOPICS = [
  { id: 1, title: "Best practices for ME turbocharger maintenance during voyage", category: "Maintenance", author: "Chief Eng. Carlos M.", vessel: "MV Atlantic Star", replies: 12, views: 245, lastReply: "2h ago", pinned: true, solved: true },
  { id: 2, title: "EEXI compliance - experience with shaft power limitation?", category: "Compliance", author: "Supt. Anna K.", vessel: "Shore Office", replies: 8, views: 189, lastReply: "5h ago", pinned: false, solved: false },
  { id: 3, title: "Hull fouling after 6 months - cleaning vs waiting for drydock?", category: "Performance", author: "2nd Eng. João P.", vessel: "MV Pacific Voyager", replies: 15, views: 312, lastReply: "1d ago", pinned: false, solved: true },
  { id: 4, title: "MLC rest hours - how to handle emergency drill overlap?", category: "Crew", author: "Master Robert T.", vessel: "MV Nordic Spirit", replies: 6, views: 156, lastReply: "3d ago", pinned: false, solved: true },
  { id: 5, title: "VLSFO compatibility issues - sludge formation in settling tank", category: "Bunker", author: "Chief Eng. Park S.", vessel: "MV Ocean Pride", replies: 22, views: 487, lastReply: "6h ago", pinned: true, solved: false },
  { id: 6, title: "PSC inspection Santos - new focus areas noticed", category: "Compliance", author: "DPA Maria L.", vessel: "Shore Office", replies: 9, views: 201, lastReply: "12h ago", pinned: false, solved: false },
];

const MOCK_KB = [
  { title: "Turbocharger Maintenance Manual - MAN B&W", category: "Maintenance", downloads: 145, updated: "2026-01-15" },
  { title: "EEXI Technical File Template", category: "Compliance", downloads: 89, updated: "2025-12-20" },
  { title: "Hull Cleaning Decision Matrix", category: "Performance", downloads: 67, updated: "2026-02-01" },
  { title: "MLC 2006 Work/Rest Hours Guide", category: "Crew", downloads: 234, updated: "2025-11-30" },
  { title: "Fuel Compatibility Testing Protocol", category: "Bunker", downloads: 112, updated: "2026-01-25" },
];

const categoryIcons: Record<string, any> = {
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
};

export default function ForumKnowledgePage() {
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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><MessageSquare className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Tópicos Ativos</p><p className="text-2xl font-bold">{MOCK_TOPICS.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Participantes</p><p className="text-2xl font-bold">48</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Knowledge Base</p><p className="text-2xl font-bold">{MOCK_KB.length} docs</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ThumbsUp className="h-8 w-8 text-yellow-400" /><div><p className="text-sm text-muted-foreground">Resolvidos</p><p className="text-2xl font-bold">{MOCK_TOPICS.filter(t => t.solved).length}</p></div></div></CardContent></Card>
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
          {MOCK_TOPICS.map(topic => {
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
                        <span className="flex items-center gap-1"><Ship className="h-3 w-3" /> {topic.vessel}</span>
                        <Badge className={categoryColors[topic.category] + " text-xs"}><CatIcon className="h-3 w-3 mr-1" />{topic.category}</Badge>
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
          })}
        </TabsContent>

        <TabsContent value="kb">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_KB.map((doc, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <BookOpen className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-medium">{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <Badge className={categoryColors[doc.category]}>{doc.category}</Badge>
                    <span>{doc.downloads} downloads</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Atualizado: {doc.updated}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">Download</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
