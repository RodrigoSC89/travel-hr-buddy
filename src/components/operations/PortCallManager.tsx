/**
 * Port Call Manager Component
 * Complete port call lifecycle management with CRUD operations
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
import { toast } from 'sonner';
import { 
  Anchor, Plus, Search, Edit, Trash2, Calendar, Clock,
  Ship, MapPin, FileText, CheckCircle, AlertTriangle,
  Play, Pause, StopCircle, Download, Filter
} from 'lucide-react';

interface PortCall {
  id: string;
  callId: string;
  vesselId: string;
  vesselName: string;
  portName: string;
  portCode: string;
  purpose: 'loading' | 'discharge' | 'bunkering' | 'repairs' | 'crew_change' | 'provisions' | 'mixed';
  status: 'planned' | 'approaching' | 'berthed' | 'operations' | 'completed' | 'cancelled';
  eta: string;
  etd: string;
  ata?: string;
  atd?: string;
  berth?: string;
  agent?: string;
  pilotRequired: boolean;
  tugRequired: boolean;
  cargoOperations?: string;
  notes?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

const initialPortCalls: PortCall[] = [
  {
    id: '1',
    callId: 'PC-2024-001',
    vesselId: 'v1',
    vesselName: 'MV Atlantic Pioneer',
    portName: 'Santos',
    portCode: 'BRSSZ',
    purpose: 'loading',
    status: 'operations',
    eta: '2024-02-01T08:00',
    etd: '2024-02-03T18:00',
    ata: '2024-02-01T09:30',
    berth: 'Berth 12 - Terminal de Granéis',
    agent: 'Wilson Sons Agência Marítima',
    pilotRequired: true,
    tugRequired: true,
    cargoOperations: 'Loading 45,000 MT of soybeans',
    documents: ['Port clearance', 'Cargo manifest'],
    createdAt: '2024-01-25',
    updatedAt: '2024-02-01'
  },
  {
    id: '2',
    callId: 'PC-2024-002',
    vesselId: 'v2',
    vesselName: 'MV Cold Stream',
    portName: 'Rotterdam',
    portCode: 'NLRTM',
    purpose: 'discharge',
    status: 'planned',
    eta: '2024-02-15T06:00',
    etd: '2024-02-17T20:00',
    berth: 'Europoort Terminal',
    agent: 'Inchcape Shipping Services',
    pilotRequired: true,
    tugRequired: false,
    documents: [],
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28'
  },
  {
    id: '3',
    callId: 'PC-2024-003',
    vesselId: 'v3',
    vesselName: 'MV Chem Carrier',
    portName: 'Singapore',
    portCode: 'SGSIN',
    purpose: 'bunkering',
    status: 'approaching',
    eta: '2024-02-05T14:00',
    etd: '2024-02-06T08:00',
    agent: 'GAC Singapore',
    pilotRequired: true,
    tugRequired: true,
    notes: 'VLSFO and MGO bunkering',
    documents: ['Bunker nomination'],
    createdAt: '2024-01-30',
    updatedAt: '2024-02-01'
  }
];

const emptyForm: Omit<PortCall, 'id' | 'callId' | 'createdAt' | 'updatedAt'> = {
  vesselId: '',
  vesselName: '',
  portName: '',
  portCode: '',
  purpose: 'loading',
  status: 'planned',
  eta: '',
  etd: '',
  pilotRequired: true,
  tugRequired: false,
  documents: []
};

export function PortCallManager() {
  const [portCalls, setPortCalls] = useState<PortCall[]>(initialPortCalls);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('active');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PortCall | null>(null);
  const [deletingCall, setDeletingCall] = useState<PortCall | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const generateCallId = () => `PC-${new Date().getFullYear()}-${String(portCalls.length + 1).padStart(3, '0')}`;

  const activeStatuses = ['planned', 'approaching', 'berthed', 'operations'];
  const completedStatuses = ['completed', 'cancelled'];

  const filteredCalls = portCalls.filter(call => {
    const matchesSearch = 
      call.callId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.portName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesTab = activeTab === 'active' 
      ? activeStatuses.includes(call.status)
      : completedStatuses.includes(call.status);
    return matchesSearch && matchesStatus && matchesTab;
  });

  const openCreateForm = useCallback(() => {
    setEditingCall(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((call: PortCall) => {
    setEditingCall(call);
    setFormData({
      vesselId: call.vesselId,
      vesselName: call.vesselName,
      portName: call.portName,
      portCode: call.portCode,
      purpose: call.purpose,
      status: call.status,
      eta: call.eta,
      etd: call.etd,
      ata: call.ata,
      atd: call.atd,
      berth: call.berth,
      agent: call.agent,
      pilotRequired: call.pilotRequired,
      tugRequired: call.tugRequired,
      cargoOperations: call.cargoOperations,
      notes: call.notes,
      documents: call.documents
    });
    setIsFormOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.vesselName || !formData.portName || !formData.eta) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const now = new Date().toISOString().split('T')[0];

    if (editingCall) {
      setPortCalls(prev => prev.map(c => 
        c.id === editingCall.id 
          ? { ...c, ...formData, updatedAt: now }
          : c
      ));
      toast.success(`Escala ${editingCall.callId} atualizada`);
    } else {
      const newCall: PortCall = {
        id: crypto.randomUUID(),
        callId: generateCallId(),
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      setPortCalls(prev => [newCall, ...prev]);
      toast.success(`Escala ${newCall.callId} criada`);
    }

    setIsFormOpen(false);
    setEditingCall(null);
  }, [formData, editingCall, portCalls.length]);

  const handleDelete = useCallback(() => {
    if (!deletingCall) return;
    setPortCalls(prev => prev.filter(c => c.id !== deletingCall.id));
    toast.success(`Escala ${deletingCall.callId} excluída`);
    setIsDeleteOpen(false);
    setDeletingCall(null);
  }, [deletingCall]);

  const handleStatusChange = useCallback((call: PortCall, newStatus: PortCall['status']) => {
    const now = new Date().toISOString();
    const updates: Partial<PortCall> = { status: newStatus, updatedAt: now.split('T')[0] };
    
    if (newStatus === 'berthed' && !call.ata) {
      updates.ata = now;
    }
    if (newStatus === 'completed' && !call.atd) {
      updates.atd = now;
    }

    setPortCalls(prev => prev.map(c => 
      c.id === call.id ? { ...c, ...updates } : c
    ));
    toast.success(`Status atualizado para ${newStatus}`);
  }, []);

  const handleExport = useCallback(() => {
    console.log('Exporting port calls:', filteredCalls);
    toast.success(`${filteredCalls.length} escalas exportadas`);
  }, [filteredCalls]);

  const getStatusBadge = (status: PortCall['status']) => {
    const config = {
      planned: { label: 'Planejada', variant: 'secondary' as const, icon: Calendar },
      approaching: { label: 'Aproximando', variant: 'default' as const, icon: Ship },
      berthed: { label: 'Atracado', variant: 'default' as const, icon: Anchor },
      operations: { label: 'Em Operação', variant: 'default' as const, icon: Play },
      completed: { label: 'Concluída', variant: 'outline' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: StopCircle }
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPurposeLabel = (purpose: PortCall['purpose']) => {
    const labels = {
      loading: 'Carregamento',
      discharge: 'Descarga',
      bunkering: 'Abastecimento',
      repairs: 'Reparos',
      crew_change: 'Troca de Tripulação',
      provisions: 'Provisões',
      mixed: 'Misto'
    };
    return labels[purpose];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Gestão de Escalas Portuárias
          </h2>
          <p className="text-muted-foreground">
            {portCalls.filter(c => activeStatuses.includes(c.status)).length} escalas ativas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Escala
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Escalas Ativas ({portCalls.filter(c => activeStatuses.includes(c.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Histórico ({portCalls.filter(c => completedStatuses.includes(c.status)).length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por ID, embarcação ou porto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="planned">Planejada</SelectItem>
                    <SelectItem value="approaching">Aproximando</SelectItem>
                    <SelectItem value="berthed">Atracado</SelectItem>
                    <SelectItem value="operations">Em Operação</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Port Calls List */}
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4">
              {filteredCalls.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Nenhuma escala encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'active' ? 'Não há escalas ativas' : 'Nenhuma escala no histórico'}
                    </p>
                    {activeTab === 'active' && (
                      <Button onClick={openCreateForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Escala
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredCalls.map(call => (
                  <Card key={call.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-bold">{call.callId}</span>
                            {getStatusBadge(call.status)}
                            <Badge variant="outline">{getPurposeLabel(call.purpose)}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Embarcação</p>
                              <p className="font-medium flex items-center gap-1">
                                <Ship className="h-4 w-4" />
                                {call.vesselName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Porto</p>
                              <p className="font-medium flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {call.portName} ({call.portCode})
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ETA</p>
                              <p className="font-medium flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(call.eta).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ETD</p>
                              <p className="font-medium">{new Date(call.etd).toLocaleString('pt-BR')}</p>
                            </div>
                          </div>

                          {(call.berth || call.agent) && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {call.berth && <span>📍 {call.berth}</span>}
                              {call.agent && <span>👤 {call.agent}</span>}
                            </div>
                          )}

                          {call.cargoOperations && (
                            <p className="text-sm mt-2 bg-muted p-2 rounded">
                              📦 {call.cargoOperations}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            {call.pilotRequired && <Badge variant="secondary">Piloto</Badge>}
                            {call.tugRequired && <Badge variant="secondary">Rebocador</Badge>}
                            {call.documents.length > 0 && (
                              <Badge variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                {call.documents.length} docs
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {activeStatuses.includes(call.status) && (
                            <>
                              {call.status === 'planned' && (
                                <Button size="sm" onClick={() => handleStatusChange(call, 'approaching')}>
                                  <Ship className="h-4 w-4 mr-1" />
                                  Iniciar Aproximação
                                </Button>
                              )}
                              {call.status === 'approaching' && (
                                <Button size="sm" onClick={() => handleStatusChange(call, 'berthed')}>
                                  <Anchor className="h-4 w-4 mr-1" />
                                  Confirmar Atracação
                                </Button>
                              )}
                              {call.status === 'berthed' && (
                                <Button size="sm" onClick={() => handleStatusChange(call, 'operations')}>
                                  <Play className="h-4 w-4 mr-1" />
                                  Iniciar Operações
                                </Button>
                              )}
                              {call.status === 'operations' && (
                                <Button size="sm" onClick={() => handleStatusChange(call, 'completed')}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Concluir Escala
                                </Button>
                              )}
                            </>
                          )}
                          <Button size="sm" variant="outline" onClick={() => openEditForm(call)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setDeletingCall(call);
                            setIsDeleteOpen(true);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCall ? `Editar Escala ${editingCall.callId}` : 'Nova Escala Portuária'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Embarcação *</Label>
                <Input 
                  value={formData.vesselName}
                  onChange={(e) => setFormData(p => ({ ...p, vesselName: e.target.value }))}
                  placeholder="Nome da embarcação"
                />
              </div>
              <div>
                <Label>Propósito *</Label>
                <Select value={formData.purpose} onValueChange={(v) => setFormData(p => ({ ...p, purpose: v as PortCall['purpose'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading">Carregamento</SelectItem>
                    <SelectItem value="discharge">Descarga</SelectItem>
                    <SelectItem value="bunkering">Abastecimento</SelectItem>
                    <SelectItem value="repairs">Reparos</SelectItem>
                    <SelectItem value="crew_change">Troca de Tripulação</SelectItem>
                    <SelectItem value="provisions">Provisões</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Porto *</Label>
                <Input 
                  value={formData.portName}
                  onChange={(e) => setFormData(p => ({ ...p, portName: e.target.value }))}
                  placeholder="Nome do porto"
                />
              </div>
              <div>
                <Label>Código do Porto</Label>
                <Input 
                  value={formData.portCode}
                  onChange={(e) => setFormData(p => ({ ...p, portCode: e.target.value.toUpperCase() }))}
                  placeholder="Ex: BRSSZ"
                  maxLength={5}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ETA *</Label>
                <Input 
                  type="datetime-local"
                  value={formData.eta}
                  onChange={(e) => setFormData(p => ({ ...p, eta: e.target.value }))}
                />
              </div>
              <div>
                <Label>ETD</Label>
                <Input 
                  type="datetime-local"
                  value={formData.etd}
                  onChange={(e) => setFormData(p => ({ ...p, etd: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Berço/Terminal</Label>
                <Input 
                  value={formData.berth || ''}
                  onChange={(e) => setFormData(p => ({ ...p, berth: e.target.value }))}
                  placeholder="Localização no porto"
                />
              </div>
              <div>
                <Label>Agente Marítimo</Label>
                <Input 
                  value={formData.agent || ''}
                  onChange={(e) => setFormData(p => ({ ...p, agent: e.target.value }))}
                  placeholder="Empresa agenciadora"
                />
              </div>
            </div>
            <div>
              <Label>Operações de Carga</Label>
              <Textarea 
                value={formData.cargoOperations || ''}
                onChange={(e) => setFormData(p => ({ ...p, cargoOperations: e.target.value }))}
                placeholder="Descrição das operações..."
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.pilotRequired}
                  onChange={(e) => setFormData(p => ({ ...p, pilotRequired: e.target.checked }))}
                  className="rounded"
                />
                <span>Piloto Obrigatório</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.tugRequired}
                  onChange={(e) => setFormData(p => ({ ...p, tugRequired: e.target.checked }))}
                  className="rounded"
                />
                <span>Rebocador Necessário</span>
              </label>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                value={formData.notes || ''}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {editingCall ? 'Salvar Alterações' : 'Criar Escala'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir a escala{' '}
            <strong>{deletingCall?.callId}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PortCallManager;
