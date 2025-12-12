
import { useState, useCallback } from "react";;;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function SGSOManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planContent, setPlanContent] = useState("");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["sgso-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sgso_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sgso_plans")
        .insert({
          plan_name: planName,
          content: { description: planContent },
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sgso-plans"] });
      toast({
        title: "Plano SGSO criado",
        description: "O plano foi criado com sucesso.",
      });
      setIsDialogOpen(false);
      setPlanName("");
      setPlanContent("");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "outline",
      active: "default",
      completed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">SGSO Management</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão de Segurança Operacional
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano SGSO
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Plano SGSO</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Plano</label>
                <Input
                  value={planName}
                  onChange={handleChange}
                  placeholder="Ex: Plano de Segurança Q1 2025"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={planContent}
                  onChange={handleChange}
                  placeholder="Descreva os objetivos e escopo do plano..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() => createPlanMutation.mutate()}
                disabled={!planName || createPlanMutation.isPending}
                className="w-full"
              >
                {createPlanMutation.isPending ? "Criando..." : "Criar Plano"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando planos...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary" />
                {getStatusBadge(plan.status)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{plan.plan_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Versão {(plan.plan_version as unknown) || "1.0"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
                {plan.status === "draft" && (
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Ativar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
