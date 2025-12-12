import { useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  User,
  Calendar,
  Link2,
} from "lucide-react";

interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  linkedJobId?: string;
  linkedJobTitle?: string;
  equipment: string;
  equipmentCode: string;
  requestedParts: { name: string; quantity: number; available: boolean }[];
  assignedTo?: string;
  createdAt: string;
  dueDate?: string;
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: "1",
    number: "OS-24819",
    title: "Troca de selo de vedação",
    description: "Substituição do selo de vedação da bomba hidráulica devido a vazamento detectado",
    status: "pending",
    priority: "high",
    linkedJobId: "job-1",
    linkedJobTitle: "Reparo vazamento bomba STBD",
    equipment: "Bomba Hidráulica STBD",
    equipmentCode: "603.0004.02",
    requestedParts: [
      { name: "Selo vedação P/N X123", quantity: 2, available: true },
      { name: "O-ring 45mm", quantity: 4, available: true },
    ],
    assignedTo: "João Silva",
    createdAt: "2024-01-15",
    dueDate: "2024-01-18",
  },
  {
    id: "2",
    number: "OS-24820",
    title: "Manutenção preventiva gerador",
    description: "Troca de filtros e verificação de sistemas do gerador principal",
    status: "in_progress",
    priority: "medium",
    equipment: "Gerador Principal BB",
    equipmentCode: "602.0001.01",
    requestedParts: [
      { name: "Filtro óleo GEN-F01", quantity: 1, available: true },
      { name: "Filtro combustível GEN-F02", quantity: 1, available: false },
    ],
    assignedTo: "Carlos Mendes",
    createdAt: "2024-01-14",
    dueDate: "2024-01-20",
  },
  {
    id: "3",
    number: "OS-24821",
    title: "Inspeção compressor ar",
    description: "Verificação de pressão e vedação do sistema de ar comprimido",
    status: "approved",
    priority: "low",
    equipment: "Compressor Ar Principal",
    equipmentCode: "605.0002.01",
    requestedParts: [],
    createdAt: "2024-01-16",
  },
];

export default function WorkOrderManager() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newOS, setNewOS] = useState({
    title: "",
    description: "",
    equipment: "",
    priority: "medium" as const,
  });

  const getStatusBadge = (status: WorkOrder["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "default" as const, icon: CheckCircle2 },
      in_progress: { label: "Em Execução", variant: "default" as const, icon: AlertCircle },
      completed: { label: "Concluída", variant: "outline" as const, icon: CheckCircle2 },
      cancelled: { label: "Cancelada", variant: "destructive" as const, icon: AlertCircle },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: WorkOrder["priority"]) => {
    const config = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-warning/20 text-warning-foreground" },
      high: { label: "Alta", className: "bg-orange-500/20 text-orange-700" },
      critical: { label: "Crítica", className: "bg-destructive/20 text-destructive" },
    };
    const { label, className } = config[priority];
    return <Badge className={className}>{label}</Badge>;
  };

  const handleCreateOS = () => {
    if (!newOS.title || !newOS.equipment) {
      toast({
        title: "Erro",
        description: "Preencha título e equipamento",
        variant: "destructive",
      });
      return;
    }

    const newOrder: WorkOrder = {
      id: Date.now().toString(),
      number: `OS-${24822 + workOrders.length}`,
      title: newOS.title,
      description: newOS.description,
      status: "pending",
      priority: newOS.priority,
      equipment: newOS.equipment,
      equipmentCode: "XXX.XXXX.XX",
      requestedParts: [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    setWorkOrders((prev) => [newOrder, ...prev]);
    setIsCreating(false);
    setNewOS({ title: "", description: "", equipment: "", priority: "medium" });

    toast({
      title: "OS Criada",
      description: `${newOrder.number} criada com sucesso`,
    });
  };

  const handleApprove = (id: string) => {
    setWorkOrders((prev) =>
      prev.map((os) => (os.id === id ? { ...os, status: "approved" as const } : os))
    );
    toast({ title: "OS Aprovada", description: "Ordem de serviço aprovada com sucesso" });
  };

  const filteredOrders = workOrders.filter((os) => {
    if (filter === "all") return true;
    return os.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestão de Ordens de Serviço</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Título da OS"
                value={newOS.title}
                onChange={(e) => setNewOS((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Descrição detalhada"
                value={newOS.description}
                onChange={(e) => setNewOS((prev) => ({ ...prev, description: e.target.value }))}
              />
              <Input
                placeholder="Equipamento"
                value={newOS.equipment}
                onChange={(e) => setNewOS((prev) => ({ ...prev, equipment: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOS}>Criar OS</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "in_progress", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "Todas" : 
              status === "pending" ? "Pendentes" :
                status === "approved" ? "Aprovadas" :
                  status === "in_progress" ? "Em Execução" : "Concluídas"}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredOrders.map((os) => (
          <Card key={os.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {os.number}
                  </CardTitle>
                  <p className="text-sm font-medium mt-1">{os.title}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {getStatusBadge(os.status)}
                  {getPriorityBadge(os.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{os.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {os.equipment}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {os.dueDate || "Sem prazo"}
                </div>
                {os.assignedTo && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    {os.assignedTo}
                  </div>
                )}
                {os.linkedJobTitle && (
                  <div className="flex items-center gap-1 text-primary">
                    <Link2 className="h-3 w-3" />
                    {os.linkedJobTitle}
                  </div>
                )}
              </div>

              {os.requestedParts.length > 0 && (
                <div className="bg-muted/50 p-2 rounded text-xs">
                  <p className="font-medium mb-1">Peças solicitadas:</p>
                  {os.requestedParts.map((part, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{part.name} (x{part.quantity})</span>
                      <Badge variant={part.available ? "outline" : "destructive"} className="text-xs">
                        {part.available ? "Em estoque" : "Indisponível"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {os.status === "pending" && (
                <Button size="sm" className="w-full" onClick={() => handleApprove(os.id)}>
                  Aprovar OS
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
