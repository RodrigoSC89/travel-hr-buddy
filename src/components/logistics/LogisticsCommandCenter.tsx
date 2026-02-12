/**
 * Logistics Command Center Component
 * Real-time logistics operations with actionable workflows
 * PATCH: Full Interactivity Mandate
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Truck, Package, Ship, MapPin, Clock, AlertTriangle,
  Plus, CheckCircle, XCircle, Play, Pause, RefreshCw,
  FileText, Download, Filter, Search, TrendingUp, 
  DollarSign, Users, Calendar, ArrowRight
} from 'lucide-react';

interface ShipmentOrder {
  id: string;
  orderId: string;
  type: 'inbound' | 'outbound' | 'transfer';
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  origin: string;
  destination: string;
  cargo: string;
  weight: number;
  carrier?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  cost: number;
  tracking?: string;
  notes?: string;
  createdAt: string;
}

interface PurchaseRequest {
  id: string;
  prNumber: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'ordered' | 'received';
  requester: string;
  department: string;
  items: Array<{ name: string; quantity: number; unit: string; estimatedCost: number }>;
  totalValue: number;
  urgency: 'normal' | 'urgent' | 'critical';
  justification: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
}

const initialOrders: ShipmentOrder[] = [
  {
    id: '1',
    orderId: 'SHP-2024-001',
    type: 'inbound',
    status: 'in_transit',
    priority: 'high',
    origin: 'Shanghai, China',
    destination: 'Santos, Brazil',
    cargo: 'Spare parts - Engine components',
    weight: 2500,
    carrier: 'MSC Shipping',
    estimatedDelivery: '2024-02-15',
    cost: 45000,
    tracking: 'MSCU1234567',
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    orderId: 'SHP-2024-002',
    type: 'outbound',
    status: 'processing',
    priority: 'medium',
    origin: 'Rio de Janeiro, Brazil',
    destination: 'Rotterdam, Netherlands',
    cargo: 'Equipment returns - Diving gear',
    weight: 800,
    estimatedDelivery: '2024-02-20',
    cost: 12000,
    createdAt: '2024-01-25'
  },
  {
    id: '3',
    orderId: 'SHP-2024-003',
    type: 'transfer',
    status: 'pending',
    priority: 'urgent',
    origin: 'MV Atlantic Pioneer',
    destination: 'MV Cold Stream',
    cargo: 'Emergency safety equipment',
    weight: 150,
    estimatedDelivery: '2024-02-05',
    cost: 3500,
    notes: 'Critical transfer - safety compliance',
    createdAt: '2024-02-01'
  }
];

const initialPurchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    prNumber: 'PR-2024-001',
    status: 'submitted',
    requester: 'Carlos Silva',
    department: 'Manutenção',
    items: [
      { name: 'Filtro de óleo', quantity: 20, unit: 'un', estimatedCost: 150 },
      { name: 'Correias', quantity: 10, unit: 'un', estimatedCost: 80 }
    ],
    totalValue: 3800,
    urgency: 'normal',
    justification: 'Reposição de estoque preventivo',
    createdAt: '2024-02-01'
  },
  {
    id: '2',
    prNumber: 'PR-2024-002',
    status: 'approved',
    requester: 'Ana Santos',
    department: 'Operações',
    items: [
      { name: 'Cabo de aço 12mm', quantity: 500, unit: 'm', estimatedCost: 25 }
    ],
    totalValue: 12500,
    urgency: 'urgent',
    justification: 'Substituição urgente para operação de ancoragem',
    approver: 'João Oliveira',
    approvedAt: '2024-02-02',
    createdAt: '2024-01-30'
  }
];

export function LogisticsCommandCenter() {
  const [orders, setOrders] = useState<ShipmentOrder[]>(initialOrders);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [activeTab, setActiveTab] = useState('shipments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isPRFormOpen, setIsPRFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ShipmentOrder | null>(null);

  // Metrics
  const metrics = {
    activeShipments: orders.filter(o => ['processing', 'in_transit'].includes(o.status)).length,
    pendingPRs: purchaseRequests.filter(pr => pr.status === 'submitted').length,
    totalCost: orders.reduce((sum, o) => sum + o.cost, 0),
    urgentItems: orders.filter(o => o.priority === 'urgent').length + 
                 purchaseRequests.filter(pr => pr.urgency === 'critical').length
  };

  const handleOrderStatusChange = useCallback((order: ShipmentOrder, newStatus: ShipmentOrder['status']) => {
    setOrders(prev => prev.map(o => 
      o.id === order.id 
        ? { 
            ...o, 
            status: newStatus,
            actualDelivery: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : o.actualDelivery
          }
        : o
    ));
    toast.success(`Pedido ${order.orderId} atualizado para ${newStatus}`);
  }, []);

  const handlePRAction = useCallback((pr: PurchaseRequest, action: 'approve' | 'reject' | 'order' | 'receive') => {
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      order: 'ordered',
      receive: 'received'
    };
    
    setPurchaseRequests(prev => prev.map(p => 
      p.id === pr.id 
        ? { 
            ...p, 
            status: statusMap[action] as PurchaseRequest['status'],
            approver: action === 'approve' ? 'Usuário Atual' : p.approver,
            approvedAt: action === 'approve' ? new Date().toISOString() : p.approvedAt
          }
        : p
    ));
    
    const messages = {
      approve: `Requisição ${pr.prNumber} aprovada`,
      reject: `Requisição ${pr.prNumber} rejeitada`,
      order: `Pedido de compra criado para ${pr.prNumber}`,
      receive: `Materiais de ${pr.prNumber} recebidos`
    };
    toast.success(messages[action]);
  }, []);

  const createNewOrder = useCallback(() => {
    const newOrder: ShipmentOrder = {
      id: crypto.randomUUID(),
      orderId: `SHP-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      type: 'inbound',
      status: 'pending',
      priority: 'medium',
      origin: 'A definir',
      destination: 'A definir',
      cargo: 'Nova carga',
      weight: 0,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cost: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    setEditingOrder(newOrder);
    setIsOrderFormOpen(true);
    toast.success(`Pedido ${newOrder.orderId} criado`);
  }, [orders.length]);

  const createNewPR = useCallback(() => {
    const newPR: PurchaseRequest = {
      id: crypto.randomUUID(),
      prNumber: `PR-${new Date().getFullYear()}-${String(purchaseRequests.length + 1).padStart(3, '0')}`,
      status: 'draft',
      requester: 'Usuário Atual',
      department: 'A definir',
      items: [],
      totalValue: 0,
      urgency: 'normal',
      justification: '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPurchaseRequests(prev => [newPR, ...prev]);
    toast.success(`Requisição ${newPR.prNumber} criada como rascunho`);
  }, [purchaseRequests.length]);

  const submitPR = useCallback((pr: PurchaseRequest) => {
    setPurchaseRequests(prev => prev.map(p => 
      p.id === pr.id ? { ...p, status: 'submitted' } : p
    ));
    toast.success(`Requisição ${pr.prNumber} submetida para aprovação`);
  }, []);

  const getStatusBadge = (status: string, type: 'order' | 'pr') => {
    if (type === 'order') {
      const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        pending: { label: 'Pendente', variant: 'secondary' },
        processing: { label: 'Processando', variant: 'default' },
        in_transit: { label: 'Em Trânsito', variant: 'default' },
        delivered: { label: 'Entregue', variant: 'outline' },
        cancelled: { label: 'Cancelado', variant: 'destructive' }
      };
      const { label, variant } = config[status] || { label: status, variant: 'secondary' as const };
      return <Badge variant={variant}>{label}</Badge>;
    } else {
      const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        draft: { label: 'Rascunho', variant: 'secondary' },
        submitted: { label: 'Aguardando', variant: 'default' },
        approved: { label: 'Aprovada', variant: 'default' },
        rejected: { label: 'Rejeitada', variant: 'destructive' },
        ordered: { label: 'Pedido Feito', variant: 'outline' },
        received: { label: 'Recebido', variant: 'outline' }
      };
      const { label, variant } = config[status] || { label: status, variant: 'secondary' as const };
      return <Badge variant={variant}>{label}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      low: { label: 'Baixa', className: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Média', className: 'bg-blue-100 text-blue-800' },
      high: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-800' },
      normal: { label: 'Normal', className: 'bg-gray-100 text-gray-800' },
      critical: { label: 'Crítica', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[priority] || { label: priority, className: '' };
    return <Badge className={className}>{label}</Badge>;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPRs = purchaseRequests.filter(pr => {
    const matchesSearch = pr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.requester.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Centro de Comando Logístico
          </h2>
          <p className="text-muted-foreground">
            Gestão integrada de embarques e requisições
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.activeShipments}</p>
                <p className="text-sm text-muted-foreground">Embarques Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.pendingPRs}</p>
                <p className="text-sm text-muted-foreground">RCs Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">USD {(metrics.totalCost / 1000).toFixed(0)}k</p>
                <p className="text-sm text-muted-foreground">Custo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.urgentItems}</p>
                <p className="text-sm text-muted-foreground">Itens Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="shipments">
              <Ship className="h-4 w-4 mr-2" />
              Embarques ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="purchase">
              <FileText className="h-4 w-4 mr-2" />
              Requisições ({purchaseRequests.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === 'shipments' ? (
              <Button onClick={createNewOrder}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Embarque
              </Button>
            ) : (
              <Button onClick={createNewPR}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Requisição
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {activeTab === 'shipments' ? (
                    <>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="in_transit">Em Trânsito</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="submitted">Aguardando</SelectItem>
                      <SelectItem value="approved">Aprovada</SelectItem>
                      <SelectItem value="ordered">Pedido Feito</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="mt-4">
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono font-bold">{order.orderId}</span>
                        {getStatusBadge(order.status, 'order')}
                        {getPriorityBadge(order.priority)}
                        <Badge variant="outline">
                          {order.type === 'inbound' ? '📥 Entrada' : order.type === 'outbound' ? '📤 Saída' : '🔄 Transferência'}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{order.cargo}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {order.origin} <ArrowRight className="h-3 w-3" /> {order.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.weight.toLocaleString()} kg
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ETA: {order.estimatedDelivery}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          USD {order.cost.toLocaleString()}
                        </span>
                      </div>
                      {order.tracking && (
                        <p className="text-sm mt-2">
                          🔗 Tracking: <code className="bg-muted px-1 rounded">{order.tracking}</code>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button size="sm" onClick={() => handleOrderStatusChange(order, 'processing')}>
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" onClick={() => handleOrderStatusChange(order, 'in_transit')}>
                          <Ship className="h-4 w-4 mr-1" />
                          Em Trânsito
                        </Button>
                      )}
                      {order.status === 'in_transit' && (
                        <Button size="sm" onClick={() => handleOrderStatusChange(order, 'delivered')}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Entregue
                        </Button>
                      )}
                      {['pending', 'processing'].includes(order.status) && (
                        <Button size="sm" variant="destructive" onClick={() => handleOrderStatusChange(order, 'cancelled')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Purchase Requests Tab */}
        <TabsContent value="purchase" className="mt-4">
          <div className="grid gap-4">
            {filteredPRs.map(pr => (
              <Card key={pr.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono font-bold">{pr.prNumber}</span>
                        {getStatusBadge(pr.status, 'pr')}
                        {getPriorityBadge(pr.urgency)}
                      </div>
                      <div className="flex gap-4 text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {pr.requester} • {pr.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          USD {pr.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-muted p-2 rounded text-sm mb-2">
                        <p className="font-medium mb-1">Itens ({pr.items.length}):</p>
                        {pr.items.map((item) => (
                          <p key={item.name}>• {item.name}: {item.quantity} {item.unit}</p>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{pr.justification}"
                      </p>
                      {pr.approver && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Aprovado por {pr.approver}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {pr.status === 'draft' && (
                        <Button size="sm" onClick={() => submitPR(pr)}>
                          Submeter
                        </Button>
                      )}
                      {pr.status === 'submitted' && (
                        <>
                          <Button size="sm" onClick={() => handlePRAction(pr, 'approve')}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handlePRAction(pr, 'reject')}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {pr.status === 'approved' && (
                        <Button size="sm" onClick={() => handlePRAction(pr, 'order')}>
                          <FileText className="h-4 w-4 mr-1" />
                          Criar Pedido
                        </Button>
                      )}
                      {pr.status === 'ordered' && (
                        <Button size="sm" onClick={() => handlePRAction(pr, 'receive')}>
                          <Package className="h-4 w-4 mr-1" />
                          Receber
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LogisticsCommandCenter;
