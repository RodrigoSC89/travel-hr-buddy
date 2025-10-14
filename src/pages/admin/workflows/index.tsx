"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Workflow, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

interface SmartWorkflow {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  created_by?: string
  category?: string
  tags?: string[]
}

export default function SmartWorkflowPage() {
  const [workflows, setWorkflows] = useState<SmartWorkflow[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  async function fetchWorkflows() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("smart_workflows")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fluxos de trabalho",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkflow() {
    if (!newTitle.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para o fluxo de trabalho",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("smart_workflows")
        .insert({ 
          title: newTitle,
          created_by: user?.id 
        });
      
      if (error) throw error;
      
      setNewTitle("");
      toast({
        title: "Sucesso",
        description: "Fluxo de trabalho criado com sucesso!"
      });
      fetchWorkflows();
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o fluxo de trabalho",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      createWorkflow();
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Workflow}
          title="🧠 Smart Workflows"
          description="Gerencie fluxos de trabalho inteligentes e automatizados"
          gradient="blue"
          badges={[
            { icon: Workflow, label: "Automação" },
            { icon: Calendar, label: "Planejamento" },
            { icon: User, label: "Colaboração" }
          ]}
        />

        <div className="space-y-6">
          {/* Create New Workflow */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Criar Novo Fluxo de Trabalho</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Título do fluxo de trabalho..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
              <Button 
                onClick={createWorkflow}
                disabled={isCreating}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </div>
          </Card>

          {/* Workflows List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando fluxos de trabalho...</p>
            </div>
          ) : workflows.length === 0 ? (
            <Card className="p-12 text-center">
              <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum fluxo de trabalho criado</h3>
              <p className="text-muted-foreground">
                Crie seu primeiro fluxo de trabalho para começar a gerenciar tarefas
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((wf) => (
                <Card key={wf.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{wf.title}</h3>
                      {wf.description && (
                        <p className="text-sm text-muted-foreground">{wf.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      wf.status === "ativo" ? "bg-green-100 text-green-800" :
                        wf.status === "pausado" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                    }`}>
                      {wf.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(wf.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link to={`/admin/workflows/${wf.id}`}>
                        Ver etapas
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
