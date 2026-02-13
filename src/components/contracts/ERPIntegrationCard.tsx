/**
 * ERPIntegrationCard - Integração ERP/Financeiro
 * Sincronização com sistemas de faturamento e cobrança
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Building2, DollarSign, CreditCard, FileText, RefreshCw,
  CheckCircle, XCircle, Clock, ArrowUpDown, Link, Unlink,
  Receipt, AlertTriangle, TrendingUp, Calendar, Settings
} from "lucide-react";

interface ERPConnection {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'totvs' | 'senior' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  auto_sync: boolean;
  sync_interval: number; // minutes
}

interface Invoice {
  id: string;
  number: string;
  contract_number: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issued_date: string;
  erp_status: 'synced' | 'pending' | 'error';
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'invoice' | 'payment' | 'contract';
  action: 'create' | 'update' | 'delete';
  status: 'success' | 'error';
  details: string;
  record_id: string;
}

export function ERPIntegrationCard() {
  const [connections, setConnections] = useState<ERPConnection[]>([
    {
      id: '1',
      name: 'SAP S/4HANA',
      type: 'sap',
      status: 'connected',
      last_sync: new Date(Date.now() - 300000).toISOString(),
      auto_sync: true,
      sync_interval: 15
    },
    {
      id: '2',
      name: 'TOTVS Protheus',
      type: 'totvs',
      status: 'connected',
      last_sync: new Date(Date.now() - 900000).toISOString(),
      auto_sync: true,
      sync_interval: 30
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'NF-2024-0125',
      contract_number: 'CNT-2024-001',
      amount: 125000,
      currency: 'BRL',
      status: 'paid',
      due_date: '2024-01-15',
      issued_date: '2024-01-01',
      erp_status: 'synced'
    },
    {
      id: '2',
      number: 'NF-2024-0126',
      contract_number: 'CNT-2024-001',
      amount: 125000,
      currency: 'BRL',
      status: 'pending',
      due_date: '2024-02-15',
      issued_date: '2024-02-01',
      erp_status: 'synced'
    },
    {
      id: '3',
      number: 'NF-2024-0127',
      contract_number: 'CNT-2024-002',
      amount: 85000,
      currency: 'BRL',
      status: 'overdue',
      due_date: '2024-01-10',
      issued_date: '2024-01-01',
      erp_status: 'error'
    }
  ]);

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'invoice',
      action: 'create',
      status: 'success',
      details: 'Invoice NF-2024-0127 created in SAP',
      record_id: 'NF-2024-0127'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'payment',
      action: 'update',
      status: 'success',
      details: 'Payment confirmed for NF-2024-0125',
      record_id: 'PAY-2024-0089'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'invoice',
      action: 'update',
      status: 'error',
      details: 'Failed to sync NF-2024-0127: Connection timeout',
      record_id: 'NF-2024-0127'
    }
  ]);

  const [showNewConnection, setShowNewConnection] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncNow = async (connectionId: string) => {
    setSyncing(true);
    toast.loading('Sincronizando com ERP...');
    
    try {
      setConnections(prev => prev.map(c => 
        c.id === connectionId 
          ? { ...c, last_sync: new Date().toISOString() }
          : c
      ));
      
      // Add sync log
      setSyncLogs(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'invoice',
        action: 'update',
        status: 'success',
        details: 'Full sync completed successfully',
        record_id: '-'
      }, ...prev]);
      
      toast.dismiss();
      toast.success('Sincronização concluída!');
    } finally {
      setSyncing(false);
    }
  };

  const toggleAutoSync = (connectionId: string) => {
    setConnections(prev => prev.map(c =>
      c.id === connectionId ? { ...c, auto_sync: !c.auto_sync } : c
    ));
    toast.success('Configuração atualizada');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'synced':
      case 'paid':
      case 'success':
        return <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          {status === 'connected' ? 'Conectado' : status === 'synced' ? 'Sincronizado' : status === 'paid' ? 'Pago' : 'Sucesso'}
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>;
      case 'error':
      case 'disconnected':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          {status === 'error' ? 'Erro' : 'Desconectado'}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
  const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Integração ERP/Financeiro</h2>
        </div>
        <Dialog open={showNewConnection} onOpenChange={setShowNewConnection}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Link className="h-4 w-4 mr-2" />
              Nova Conexão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Conexão ERP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Sistema ERP</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sap">SAP S/4HANA</SelectItem>
                    <SelectItem value="oracle">Oracle EBS</SelectItem>
                    <SelectItem value="totvs">TOTVS Protheus</SelectItem>
                    <SelectItem value="senior">Senior Sistemas</SelectItem>
                    <SelectItem value="custom">API Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL da API</Label>
                <Input placeholder="https://erp.company.com/api/v1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuário/Client ID</Label>
                  <Input placeholder="api_user" />
                </div>
                <div className="space-y-2">
                  <Label>Senha/Secret</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Sincronização Automática</Label>
                <Switch defaultChecked />
              </div>
              <Button className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Testar e Conectar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Recebida</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {(totalRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-yellow-500">
                  R$ {(pendingRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencido</p>
                <p className="text-2xl font-bold text-red-500">
                  R$ {(overdueRevenue / 1000).toFixed(0)}k
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                <p className="text-2xl font-bold text-blue-500">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
              <Link className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Conexões ERP</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {connections.map(conn => (
              <Card key={conn.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{conn.name}</CardTitle>
                    </div>
                    {getStatusBadge(conn.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium uppercase">{conn.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última Sincronização</p>
                      <p className="font-medium">
                        {new Date(conn.last_sync).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={conn.auto_sync} 
                        onCheckedChange={() => toggleAutoSync(conn.id)}
                      />
                      <span className="text-sm">Auto-sync a cada {conn.sync_interval}min</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => syncNow(conn.id)}
                      disabled={syncing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                      Sincronizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Nº Fatura</th>
                      <th className="text-left p-3 text-sm font-medium">Contrato</th>
                      <th className="text-left p-3 text-sm font-medium">Valor</th>
                      <th className="text-left p-3 text-sm font-medium">Vencimento</th>
                      <th className="text-left p-3 text-sm font-medium">Status</th>
                      <th className="text-left p-3 text-sm font-medium">ERP</th>
                      <th className="text-left p-3 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invoice.number}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{invoice.contract_number}</td>
                        <td className="p-3 font-medium">
                          R$ {invoice.amount.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3">{getStatusBadge(invoice.status)}</td>
                        <td className="p-3">{getStatusBadge(invoice.erp_status)}</td>
                        <td className="p-3">
                          <Button size="sm" variant="ghost">
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {syncLogs.map(log => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-lg border ${
                        log.status === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium text-sm">
                            {log.action.toUpperCase()} {log.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.record_id}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
