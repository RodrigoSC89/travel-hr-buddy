import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Shield, FileText, CheckCircle, AlertTriangle, XCircle, 
  Plus, Download, Filter, Brain, Clock, Target, BarChart3,
  Users, Ship, Scale, MessageSquare, Settings, ClipboardCheck
} from "lucide-react";
import { MLC_CATEGORIES, getTotalMLCItems, getCriticalItems } from "@/data/mlc-checklist";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistAnswer {
  answer: "compliant" | "non-compliant" | "na" | null;
  observation: string;
  evidence: string[];
}

export const MLCInspectionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [inspectionStarted, setInspectionStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({});
  const [aiMessages, setAiMessages] = useState<{role: "user" | "assistant"; content: string}[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalItems = getTotalMLCItems();
  const criticalItems = getCriticalItems().length;
  const answeredItems = Object.values(answers).filter(a => a.answer !== null).length;
  const compliantItems = Object.values(answers).filter(a => a.answer === "compliant").length;
  const nonCompliantItems = Object.values(answers).filter(a => a.answer === "non-compliant").length;
  const progressPercent = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
  const complianceScore = answeredItems > 0 ? Math.round((compliantItems / answeredItems) * 100) : 0;

  const handleAnswerChange = (itemId: string, answer: "compliant" | "non-compliant" | "na") => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], answer, observation: prev[itemId]?.observation || "", evidence: prev[itemId]?.evidence || [] }
    }));
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMessage = { role: "user" as const, content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mlc-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...aiMessages, userMessage] }),
      };

      if (!response.ok) throw new Error("AI request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setAiMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                    }
                    return [...prev, { role: "assistant", content: assistantContent }];
  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast.error("Erro ao conectar com assistente IA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">MLC 2006 Inspection Dashboard</h2>
          <p className="text-muted-foreground">Convenção do Trabalho Marítimo - ILO</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Filtros aplicados"}><Filter className="w-4 h-4 mr-2" />Filtros</Button>
          <Button onClick={() => { setInspectionStarted(true); setActiveTab("checklist"); toast.success("Inspeção iniciada"); }}>
            <Plus className="w-4 h-4 mr-2" />Nova Inspeção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={handleSetActiveTab}>
          <CardContent className="pt-4"><p className="text-sm text-muted-foreground">Score</p><p className="text-2xl font-bold">{complianceScore}%</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Conforme</p><p className="text-2xl font-bold text-green-500">{compliantItems}</p></CardContent></Card>
        <Card className="cursor-pointer hover:border-red-500/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Não Conforme</p><p className="text-2xl font-bold text-red-500">{nonCompliantItems}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Críticos</p><p className="text-2xl font-bold text-orange-500">{criticalItems}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Itens</p><p className="text-2xl font-bold">{totalItems}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Progresso</p><p className="text-2xl font-bold text-blue-500">{progressPercent}%</p></CardContent></Card>
      </div>

      {inspectionStarted && <Card><CardContent className="pt-4"><div className="flex justify-between text-sm mb-2"><span>Progresso</span><span>{answeredItems}/{totalItems}</span></div><Progress value={progressPercent} /></CardContent></Card>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" />Visão Geral</TabsTrigger>
          <TabsTrigger value="checklist"><ClipboardCheck className="w-4 h-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="ncs"><AlertTriangle className="w-4 h-4 mr-1" />NCs</TabsTrigger>
          <TabsTrigger value="ai"><Brain className="w-4 h-4 mr-1" />Assistente IA</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle><Scale className="w-5 h-5 inline mr-2" />Sobre a MLC 2006</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">A Convenção do Trabalho Marítimo (MLC) 2006 é um tratado internacional da OIT que estabelece direitos e condições mínimas de trabalho para marítimos, garantindo trabalho digno e concorrência justa entre armadores.</p>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Idade mínima e certificação médica</li><li>Contratos de trabalho (SEA)</li><li>Horas de trabalho e descanso</li><li>Acomodações e alimentação</li><li>Saúde e segurança</li>
                </ul></CardContent></Card>
            <Card><CardHeader><CardTitle><FileText className="w-5 h-5 inline mr-2" />Estrutura MLC</CardTitle></CardHeader>
              <CardContent><ScrollArea className="h-[250px]">{MLC_CATEGORIES.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-2 rounded bg-muted/50 mb-2"><div className="flex items-center gap-2"><Badge variant="outline">{cat.regulation}</Badge><span className="text-sm font-medium">{cat.title}</span></div><Badge variant="secondary">{cat.items.length}</Badge></div>
              ))}</ScrollArea></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <ScrollArea className="h-[600px]">{MLC_CATEGORIES.map(cat => (
            <Card key={cat.id} className="mb-4"><CardHeader><CardTitle className="text-lg">{cat.regulation} - {cat.title}</CardTitle><CardDescription>{cat.description}</CardDescription></CardHeader>
              <CardContent className="space-y-3">{cat.items.map(item => (
                <div key={item.id} className="p-3 rounded-lg border"><div className="flex justify-between items-start mb-2"><div><span className="font-medium">{item.id} - {item.title}</span>{item.critical && <Badge variant="destructive" className="ml-2">Crítico</Badge>}</div>
                  <div className="flex gap-1">{["compliant","non-compliant","na"].map(a => <Button key={a} size="sm" variant={answers[item.id]?.answer === a ? (a === "compliant" ? "default" : a === "non-compliant" ? "destructive" : "secondary") : "outline"} onClick={() => handlehandleAnswerChange}>{a === "compliant" ? <CheckCircle className="w-4 h-4" /> : a === "non-compliant" ? <XCircle className="w-4 h-4" /> : "N/A"}</Button>)}</div>
                </div><p className="text-sm text-muted-foreground">{item.description}</p></div>
              ))}</CardContent></Card>
          ))}</ScrollArea>
        </TabsContent>

        <TabsContent value="ncs">
          <Card><CardHeader><CardTitle>Não Conformidades</CardTitle></CardHeader>
            <CardContent>{nonCompliantItems === 0 ? <p className="text-center text-muted-foreground py-8">Nenhuma não conformidade registrada</p> : 
              <div className="space-y-2">{Object.entries(answers).filter(([,a]) => a.answer === "non-compliant").map(([id]) => {
                const item = MLC_CATEGORIES.flatMap(c => c.items).find(i => i.id === id);
                return item ? <div key={id} className="p-3 rounded border border-destructive/30"><span className="font-medium text-destructive">{item.id} - {item.title}</span><p className="text-sm text-muted-foreground">{item.description}</p></div> : null;
              })}</div>}</CardContent></Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card><CardHeader><CardTitle><Brain className="w-5 h-5 inline mr-2" />Assistente IA MLC 2006</CardTitle></CardHeader>
            <CardContent><ScrollArea className="h-[300px] mb-4 p-4 border rounded">{aiMessages.length === 0 ? <p className="text-muted-foreground text-center">Pergunte sobre MLC 2006, requisitos, conformidade...</p> : 
              aiMessages.map((m, i) => <div key={i} className={`mb-3 p-2 rounded ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}><p className="text-sm whitespace-pre-wrap">{m.content}</p></div>)}</ScrollArea>
            <div className="flex gap-2"><Textarea value={aiInput} onChange={e => setAiInput(e.target.value} placeholder="Ex: Quais são os requisitos de horas de descanso?" className="flex-1" onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAiMessage()} />
              <Button onClick={sendAiMessage} disabled={isLoading}><MessageSquare className="w-4 h-4" /></Button></div></CardContent></Card>
        </TabsContent>

        <TabsContent value="settings"><Card><CardHeader><CardTitle>Configurações</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configurações do módulo MLC Inspection em desenvolvimento.</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
};

export default MLCInspectionDashboard;
