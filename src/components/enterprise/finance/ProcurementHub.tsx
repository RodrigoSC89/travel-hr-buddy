/**
 * Procurement Hub Component
 * Requisições de compra, aprovações multi-nível, histórico
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, FileText, Clock, CheckCircle2, XCircle,
  AlertCircle, Search, Plus, Filter, Send, Eye,
  User, Building2, Ship, Calendar, DollarSign, Package
} from "lucide-react";

interface PurchaseRequest {
  id: string;
  prNumber: string;
  title: string;
  description: string;
  requester: string;
  department: string;
  vessel: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "pending" | "approved" | "rejected" | "ordered" | "delivered";
  totalAmount: number;
  currency: string;
  createdAt: string;
  dueDate: string;
  approvalLevel: number;
  maxApprovalLevel: number;
  items: { name: string; quantity: number; unitPrice: number }[];
  approvers: { name: string; role: string; status: "pending" | "approved" | "rejected"; date?: string }[];
}

const purchaseRequests: PurchaseRequest[] = [
  {
    id: "1",
    prNumber: "PR-2024-0089",
    title: "Peças de reposição para motor principal",
    description: "Componentes críticos para manutenção preventiva do motor MAN B&W",
    requester: "Carlos Silva",
    department: "Engenharia",
    vessel: "MV Atlantic Star",
    category: "Peças & Equipamentos",
    priority: "high",
    status: "pending",
    totalAmount: 125000,
    currency: "USD",
    createdAt: "2024-02-01",
    dueDate: "2024-02-15",
    approvalLevel: 2,
    maxApprovalLevel: 3,
    items: [
      { name: "Pistão completo", quantity: 4, unitPrice: 18000 },
      { name: "Anéis de segmento", quantity: 8, unitPrice: 3500 },
      { name: "Kit de vedação", quantity: 2, unitPrice: 8500 }
    ],
    approvers: [
      { name: "João Santos", role: "Supervisor Técnico", status: "approved", date: "2024-02-02" },
      { name: "Maria Costa", role: "Gerente de Operações", status: "pending" },
      { name: "Pedro Lima", role: "Diretor Financeiro", status: "pending" }
    ]
  },
  {
    id: "2",
    prNumber: "PR-2024-0088",
    title: "Suprimentos de segurança",
    description: "EPIs e equipamentos de segurança para a tripulação",
    requester: "Ana Rodrigues",
    department: "Segurança",
    vessel: "MV Pacific Dream",
    category: "Segurança",
    priority: "medium",
    status: "approved",
    totalAmount: 32000,
    currency: "USD",
    createdAt: "2024-01-28",
    dueDate: "2024-02-10",
    approvalLevel: 3,
    maxApprovalLevel: 3,
    items: [
      { name: "Coletes salva-vidas", quantity: 50, unitPrice: 280 },
      { name: "Capacetes de segurança", quantity: 30, unitPrice: 85 },
      { name: "Luvas de proteção", quantity: 100, unitPrice: 45 }
    ],
    approvers: [
      { name: "João Santos", role: "Supervisor Técnico", status: "approved", date: "2024-01-29" },
      { name: "Maria Costa", role: "Gerente de Operações", status: "approved", date: "2024-01-30" },
      { name: "Pedro Lima", role: "Diretor Financeiro", status: "approved", date: "2024-01-31" }
    ]
  },
  {
    id: "3",
    prNumber: "PR-2024-0087",
    title: "Provisões para viagem",
    description: "Alimentos e suprimentos para viagem de 30 dias",
    requester: "Roberto Martins",
    department: "Hotelaria",
    vessel: "MV Nordic Wind",
    category: "Provisões",
    priority: "low",
    status: "draft",
    totalAmount: 28500,
    currency: "USD",
    createdAt: "2024-02-05",
    dueDate: "2024-02-20",
    approvalLevel: 0,
    maxApprovalLevel: 2,
    items: [
      { name: "Gêneros alimentícios", quantity: 1, unitPrice: 18000 },
      { name: "Bebidas", quantity: 1, unitPrice: 5500 },
      { name: "Produtos de limpeza", quantity: 1, unitPrice: 5000 }
    ],
    approvers: [
      { name: "João Santos", role: "Supervisor Técnico", status: "pending" },
      { name: "Maria Costa", role: "Gerente de Operações", status: "pending" }
    ]
  },
  {
    id: "4",
    prNumber: "PR-2024-0086",
    title: "Equipamento de comunicação",
    description: "Upgrade do sistema GMDSS",
    requester: "Fernando Alves",
    department: "Navegação",
    vessel: "MV Atlantic Star",
    category: "Eletrônicos",
    priority: "urgent",
    status: "ordered",
    totalAmount: 89000,
    currency: "USD",
    createdAt: "2024-01-20",
    dueDate: "2024-02-01",
    approvalLevel: 3,
    maxApprovalLevel: 3,
    items: [
      { name: "VHF DSC Radio", quantity: 2, unitPrice: 12000 },
      { name: "EPIRB", quantity: 2, unitPrice: 8500 },
      { name: "SART", quantity: 2, unitPrice: 5000 },
      { name: "Inmarsat-C", quantity: 1, unitPrice: 38000 }
    ],
    approvers: [
      { name: "João Santos", role: "Supervisor Técnico", status: "approved", date: "2024-01-21" },
      { name: "Maria Costa", role: "Gerente de Operações", status: "approved", date: "2024-01-22" },
      { name: "Pedro Lima", role: "Diretor Financeiro", status: "approved", date: "2024-01-23" }
    ]
  }
];

const formatCurrency = (value: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0
  }).format(value);
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "draft": return { color: "bg-gray-100 text-gray-800", icon: FileText, label: "Rascunho" };
    case "pending": return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pendente" };
    case "approved": return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Aprovado" };
    case "rejected": return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejeitado" };
    case "ordered": return { color: "bg-blue-100 text-blue-800", icon: ShoppingCart, label: "Pedido" };
    case "delivered": return { color: "bg-purple-100 text-purple-800", icon: Package, label: "Entregue" };
    default: return { color: "bg-gray-100 text-gray-800", icon: AlertCircle, label: status };
  }
};

export function ProcurementHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(purchaseRequests[0]);
  const [activeTab, setActiveTab] = useState("all");

  const filteredPRs = purchaseRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || pr.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: purchaseRequests.length,
    pending: purchaseRequests.filter(pr => pr.status === "pending").length,
    approved: purchaseRequests.filter(pr => pr.status === "approved" || pr.status === "ordered").length,
    totalValue: purchaseRequests.reduce((sum, pr) => sum + pr.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requisições</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Requer ação</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Pronto para pedido</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Em processamento</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PR List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requisições
              </CardTitle>
              <Button size="sm" onClick={() => toast.success("Nova Requisição", { description: "Para criar uma requisição, entre em contato com o departamento de suprimentos ou utilize o formulário no módulo Procurement." })}>
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar PR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => toast.success("Filtros disponíveis: Prioridade (Urgente, Alta, Média, Baixa), Status, Departamento")}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pendentes</TabsTrigger>
                <TabsTrigger value="approved" className="text-xs">Aprovadas</TabsTrigger>
                <TabsTrigger value="ordered" className="text-xs">Pedidas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[450px] overflow-y-auto">
            {filteredPRs.map((pr) => {
              const statusConfig = getStatusConfig(pr.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={pr.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedPR?.id === pr.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPR(pr)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{pr.prNumber}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{pr.title}</p>
                    </div>
                    <Badge className={getPriorityColor(pr.priority)} variant="secondary">
                      {pr.priority === "urgent" ? "Urgente" :
                       pr.priority === "high" ? "Alta" :
                       pr.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs">{statusConfig.label}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(pr.totalAmount)}</span>
                  </div>
                  <Progress 
                    value={(pr.approvalLevel / pr.maxApprovalLevel) * 100} 
                    className="h-1.5 mt-2" 
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* PR Details */}
        {selectedPR && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedPR.prNumber}
                    <Badge className={getPriorityColor(selectedPR.priority)} variant="secondary">
                      {selectedPR.priority === "urgent" ? "Urgente" :
                       selectedPR.priority === "high" ? "Alta" :
                       selectedPR.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPR.title}</p>
                </div>
                <div className="flex gap-2">
                  {selectedPR.status === "draft" && (
                    <Button size="sm" onClick={() => toast.success(`${selectedPR.prNumber} enviada para aprovação`, { description: `Utilize o módulo de Action Items para acompanhar o workflow de aprovação.` })}>
                      <Send className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => toast.success(`${selectedPR.prNumber} - ${selectedPR.title}`, { description: `Solicitante: ${selectedPR.requester} | Dept: ${selectedPR.department} | Navio: ${selectedPR.vessel} | Total: ${formatCurrency(selectedPR.totalAmount)}` })}>
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Solicitante</p>
                    <p className="text-sm font-medium">{selectedPR.requester}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-medium">{selectedPR.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Embarcação</p>
                    <p className="text-sm font-medium">{selectedPR.vessel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="text-sm font-medium">{new Date(selectedPR.dueDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-sm font-medium mb-3">Itens da Requisição</h4>
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium">Item</th>
                        <th className="text-center p-3 text-sm font-medium">Qtd</th>
                        <th className="text-right p-3 text-sm font-medium">Preço Unit.</th>
                        <th className="text-right p-3 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPR.items.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="p-3 text-sm">{item.name}</td>
                          <td className="p-3 text-sm text-center">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td colSpan={3} className="p-3 text-sm font-medium text-right">Total:</td>
                        <td className="p-3 text-sm font-bold text-right text-primary">
                          {formatCurrency(selectedPR.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Workflow */}
              <div>
                <h4 className="text-sm font-medium mb-3">Fluxo de Aprovação</h4>
                <div className="flex items-center justify-between">
                  {selectedPR.approvers.map((approver, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          approver.status === "approved" ? "bg-green-100 text-green-600" :
                          approver.status === "rejected" ? "bg-red-100 text-red-600" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {approver.status === "approved" ? <CheckCircle2 className="h-5 w-5" /> :
                           approver.status === "rejected" ? <XCircle className="h-5 w-5" /> :
                           <Clock className="h-5 w-5" />}
                        </div>
                        <p className="text-xs font-medium mt-2 text-center">{approver.name}</p>
                        <p className="text-xs text-muted-foreground text-center">{approver.role}</p>
                        {approver.date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(approver.date).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                      {idx < selectedPR.approvers.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${
                          approver.status === "approved" ? "bg-green-500" : "bg-gray-200"
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProcurementHub;
