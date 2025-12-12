import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Wrench, 
  Plus, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaintenanceItem {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  type: string;
  description?: string;
  scheduled_date: string;
  status: string;
  priority?: string;
  estimated_cost?: number;
}

interface MaintenancePanelProps {
  maintenance: MaintenanceItem[];
  vessels: unknown[];
  onRefresh: () => void;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-red-500", label: "Crítica" },
  high: { color: "bg-orange-500", label: "Alta" },
  medium: { color: "bg-yellow-500", label: "Média" },
  low: { color: "bg-green-500", label: "Baixa" },
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "destructive", label: "Pendente" },
  in_progress: { variant: "default", label: "Em Andamento" },
  completed: { variant: "secondary", label: "Concluída" },
  scheduled: { variant: "outline", label: "Agendada" },
};

export const MaintenancePanel: React.FC<MaintenancePanelProps> = ({
  maintenance,
  vessels,
  onRefresh
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    vessel_id: "",
    type: "",
    description: "",
    scheduled_date: "",
    priority: "medium",
};

  const filteredMaintenance = maintenance.filter(item => {
    const matchesSearch = item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMaintenance = async () => {
    if (!newMaintenance.vessel_id || !newMaintenance.type || !newMaintenance.scheduled_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("maintenance_schedules" as unknown)
        .insert([{
          vessel_id: newMaintenance.vessel_id,
          maintenance_type: newMaintenance.type,
          description: newMaintenance.description,
          scheduled_date: newMaintenance.scheduled_date,
          priority: newMaintenance.priority,
          status: "scheduled"
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Manutenção agendada com sucesso!"
      });

      setShowAddDialog(false);
      setNewMaintenance({
        vessel_id: "",
        type: "",
        description: "",
        scheduled_date: "",
        priority: "medium",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao agendar manutenção",
        variant: "destructive"
      });
    }
  };

  const pendingCount = maintenance.filter(m => m.status === "pending").length;
  const scheduledCount = maintenance.filter(m => m.status === "scheduled").length;
  const inProgressCount = maintenance.filter(m => m.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{scheduledCount}</p>
                <p className="text-sm text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{maintenance.filter(m => m.status === "completed").length}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Agenda de Manutenção
            </CardTitle>
            <CardDescription>Gerencie e acompanhe todas as manutenções da frota</CardDescription>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Manutenção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Manutenção</DialogTitle>
                <DialogDescription>Adicione uma nova tarefa de manutenção</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Embarcação *</Label>
                  <Select
                    value={newMaintenance.vessel_id}
                    onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, vessel_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a embarcação" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map(vessel => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          {vessel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Manutenção *</Label>
                  <Select
                    value={newMaintenance.type}
                    onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventiva</SelectItem>
                      <SelectItem value="corrective">Corretiva</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                      <SelectItem value="overhaul">Revisão Geral</SelectItem>
                      <SelectItem value="emergency">Emergencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Agendada *</Label>
                  <Input
                    type="date"
                    value={newMaintenance.scheduled_date}
                    onChange={handleChange}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newMaintenance.priority}
                    onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newMaintenance.description}
                    onChange={handleChange}))}
                    placeholder="Descreva a manutenção..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleSetShowAddDialog}>Cancelar</Button>
                <Button onClick={handleAddMaintenance}>Agendar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar manutenção..."
                value={searchTerm}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance List */}
          {filteredMaintenance.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma manutenção encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaintenance.map((item, index) => {
                const priority = priorityConfig[item.priority || "medium"];
                const status = statusConfig[item.status] || statusConfig.pending;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${priority.color}`} />
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.vessel_name || "Embarcação"} • {item.scheduled_date ? format(new Date(item.scheduled_date), "dd MMM yyyy", { locale: ptBR }) : "Data não definida"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Button variant="ghost" size="sm">Detalhes</Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
