import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Sparkles, FileText, CheckCircle, AlertTriangle, Brain } from "lucide-react";
import { useChecklists } from "../hooks/useChecklists";
import { ChecklistCard } from "../components/ChecklistCard";
import { supabase } from "@/integrations/supabase/client";

export function ChecklistsPage() {
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get user ID
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || "");
    });
  }, []);

  const {
    checklists,
    loading,
    statistics,
    createChecklist,
    createChecklistWithAI,
    analyzeChecklist
  } = useChecklists(userId);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateManual = async () => {
    if (!title) return;
    await createChecklist(title);
    setTitle("");
  };

  const handleCreateWithAI = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      await createChecklistWithAI(title);
      setTitle("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async (checklistId: string) => {
    await analyzeChecklist(checklistId);
  };

  if (loading) {
    return <div className="p-6">Loading checklists...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">✅ Checklists Inteligentes</h1>
          <p className="text-muted-foreground">
            Gestão técnica e operacional com IA
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex gap-4 items-center flex-wrap">
        <Input
          placeholder="Descreva seu checklist..."
          className="min-w-[250px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleCreateManual} disabled={!title}>
          <PlusCircle className="w-4 h-4 mr-1" /> Criar Manual
        </Button>
        <Button 
          onClick={handleCreateWithAI} 
          disabled={!title || isGenerating}
          variant="secondary"
        >
          <Sparkles className="w-4 h-4 mr-1" /> 
          {isGenerating ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{statistics.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{statistics.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{statistics.avgComplianceScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklists List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="active">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onAnalyze={handleAnalyze}
            />
          ))}
          
          {checklists.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum checklist criado ainda</p>
              <p className="text-sm">Crie seu primeiro checklist acima</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          {checklists
            .filter(c => c.status === "in_progress" || c.status === "draft")
            .map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onAnalyze={handleAnalyze}
              />
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {checklists
            .filter(c => c.status === "completed" || c.status === "approved")
            .map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onAnalyze={handleAnalyze}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
