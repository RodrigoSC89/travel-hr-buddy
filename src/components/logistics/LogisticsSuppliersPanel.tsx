/**
 * Logistics Suppliers Panel - Full CRUD for Supplier Management
 * Replaces mock list with interactive supplier management
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Star, CheckCircle, XCircle, Phone, Mail, Globe, Download, RefreshCw, Building2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  status: "active" | "pending" | "suspended" | "inactive";
  rating: number;
  contracts: number;
  email: string;
  phone: string;
  website?: string;
  address: string;
  notes?: string;
  createdAt: Date;
  lastOrderDate?: Date;
  totalOrders: number;
  totalValue: number;
}

const CATEGORIES = [
  "Combustível",
  "Manutenção",
  "Peças e Equipamentos",
  "Provisões",
  "Serviços Portuários",
  "Transporte",
  "Outros"
];

const initialSuppliers: Supplier[] = [
  {
    id: "1",
    name: "MaritimeSupply Co.",
    category: "Peças e Equipamentos",
    status: "active",
    rating: 4.8,
    contracts: 12,
    email: "contato@maritimesupply.com",
    phone: "+55 11 9999-1234",
    website: "https://maritimesupply.com",
    address: "Av. Santos, 1234 - Santos/SP",
    notes: "Fornecedor premium de peças náuticas",
    createdAt: new Date("2023-01-15"),
    lastOrderDate: new Date("2024-01-20"),
    totalOrders: 45,
    totalValue: 850000
  },
  {
    id: "2",
    name: "Global Bunker Ltd.",
    category: "Combustível",
    status: "active",
    rating: 4.5,
    contracts: 8,
    email: "sales@globalbunker.com",
    phone: "+55 13 8888-5678",
    address: "Porto de Santos - Terminal A",
    createdAt: new Date("2022-06-01"),
    lastOrderDate: new Date("2024-01-18"),
    totalOrders: 120,
    totalValue: 2500000
  },
  {
    id: "3",
    name: "Port Services Inc.",
    category: "Serviços Portuários",
    status: "pending",
    rating: 4.2,
    contracts: 5,
    email: "info@portservices.com.br",
    phone: "+55 21 7777-9012",
    address: "Praça Mauá, 789 - Rio de Janeiro/RJ",
    notes: "Em processo de renovação contratual",
    createdAt: new Date("2023-03-20"),
    totalOrders: 22,
    totalValue: 180000
  }
];

export function LogisticsSuppliersPanel() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    category: "",
    status: "pending",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    rating: 0,
    contracts: 0
  });

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    toast({ title: "Dados atualizados", description: "Lista de fornecedores atualizada" });
  }, [toast]);

  const handleAddSupplier = useCallback(() => {
    if (!formData.name || !formData.category || !formData.email) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name: formData.name!,
      category: formData.category!,
      status: formData.status as Supplier["status"] || "pending",
      rating: formData.rating || 0,
      contracts: 0,
      email: formData.email!,
      phone: formData.phone || "",
      website: formData.website,
      address: formData.address || "",
      notes: formData.notes,
      createdAt: new Date(),
      totalOrders: 0,
      totalValue: 0
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    setShowAddDialog(false);
    setFormData({});
    toast({ title: "Fornecedor adicionado", description: `${newSupplier.name} cadastrado com sucesso` });
  }, [formData, toast]);

  const handleEditSupplier = useCallback(() => {
    if (!selectedSupplier) return;

    setSuppliers(prev => prev.map(s => 
      s.id === selectedSupplier.id 
        ? { ...s, ...formData, rating: formData.rating || s.rating }
        : s
    ));
    setShowEditDialog(false);
    setSelectedSupplier(null);
    setFormData({});
    toast({ title: "Fornecedor atualizado", description: "Dados salvos com sucesso" });
  }, [selectedSupplier, formData, toast]);

  const handleDeleteSupplier = useCallback(() => {
    if (!selectedSupplier) return;

    setSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id));
    setShowDeleteDialog(false);
    setSelectedSupplier(null);
    toast({ title: "Fornecedor removido", description: `${selectedSupplier.name} foi removido` });
  }, [selectedSupplier, toast]);

  const handleApprove = useCallback((supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplier.id ? { ...s, status: "active" } : s
    ));
    toast({ title: "Fornecedor aprovado", description: `${supplier.name} agora está ativo` });
  }, [toast]);

  const handleSuspend = useCallback((supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplier.id ? { ...s, status: "suspended" } : s
    ));
    toast({ title: "Fornecedor suspenso", description: `${supplier.name} foi suspenso` });
  }, [toast]);

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      category: supplier.category,
      status: supplier.status,
      email: supplier.email,
      phone: supplier.phone,
      website: supplier.website,
      address: supplier.address,
      notes: supplier.notes,
      rating: supplier.rating
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  const handleExportCSV = () => {
    const headers = ["Nome", "Categoria", "Status", "Rating", "Contratos", "Email", "Total Pedidos", "Valor Total"];
    const rows = filteredSuppliers.map(s => [
      s.name, s.category, s.status, s.rating, s.contracts, s.email, s.totalOrders, s.totalValue
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fornecedores_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportação concluída", description: `${filteredSuppliers.length} fornecedores exportados` });
  };

  const getStatusBadge = (status: Supplier["status"]) => {
    const config = {
      active: { variant: "default" as const, label: "Ativo", className: "bg-green-500/10 text-green-500 border-green-500/30" },
      pending: { variant: "secondary" as const, label: "Pendente", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
      suspended: { variant: "destructive" as const, label: "Suspenso", className: "bg-red-500/10 text-red-500 border-red-500/30" },
      inactive: { variant: "outline" as const, label: "Inativo", className: "bg-gray-500/10 text-gray-500 border-gray-500/30" }
    };
    return config[status] || config.inactive;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestão de Fornecedores
            </CardTitle>
            <CardDescription>Gerencie seus fornecedores e contratos</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-green-500">{suppliers.filter(s => s.status === "active").length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-500">{suppliers.filter(s => s.status === "pending").length}</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Rating Médio</p>
            <p className="text-2xl font-bold">{(suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)}</p>
          </Card>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Contratos</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map(supplier => {
                  const statusConfig = getStatusBadge(supplier.status);
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderRating(supplier.rating)}</TableCell>
                      <TableCell>{supplier.contracts}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a href={`mailto:${supplier.email}`} className="text-muted-foreground hover:text-primary">
                            <Mail className="h-4 w-4" />
                          </a>
                          <a href={`tel:${supplier.phone}`} className="text-muted-foreground hover:text-primary">
                            <Phone className="h-4 w-4" />
                          </a>
                          {supplier.website && (
                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {supplier.status === "pending" && (
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(supplier)} title="Aprovar">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {supplier.status === "active" && (
                            <Button variant="ghost" size="icon" onClick={() => handleSuspend(supplier)} title="Suspender">
                              <XCircle className="h-4 w-4 text-yellow-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(supplier)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
            <DialogDescription>Cadastre um novo fornecedor no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input 
                value={formData.name || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={formData.category || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={formData.email || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  value={formData.phone || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input 
                value={formData.website || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea 
                value={formData.address || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea 
                value={formData.notes || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddSupplier}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
            <DialogDescription>Altere os dados do fornecedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input 
                value={formData.name || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formData.category || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as Supplier["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formData.email || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  value={formData.phone || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea 
                value={formData.notes || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleEditSupplier}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o fornecedor "{selectedSupplier?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
