/**
 * SuppliersPanel - CRUD completo para gestão de fornecedores
 * Substitui placeholder "Em desenvolvimento"
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Plus, Search, Star, Edit, Trash2, 
  CheckCircle, XCircle, RefreshCw, Download, Loader2, 
  Phone, Mail, Globe, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  company_name: string;
  trading_name: string;
  category: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  country: string;
  rating: number;
  total_orders: number;
  total_value: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

export default function SuppliersPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: "",
    trading_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    city: "",
    country: "Brasil",
    category: "spare_parts"
  });

  // Fetch suppliers
  const { data: suppliers = [], isLoading, refetch } = useQuery({
    queryKey: ["suppliers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("company_name");
      
      if (error) throw error;
      return (data || []) as Supplier[];
    }
  });

  // Create supplier mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("suppliers").insert({
        company_name: data.company_name,
        trading_name: data.trading_name || data.company_name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        website: data.website,
        city: data.city,
        country: data.country,
        category: [data.category],
        services: [],
        ports_served: [],
        countries: [data.country],
        rating: 0,
        total_orders: 0,
        total_value: 0,
        is_approved: false,
        is_active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
      toast({ title: "✅ Fornecedor cadastrado", description: "Aguardando aprovação" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao cadastrar", description: String(error), variant: "destructive" });
    }
  });

  // Update supplier mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase.from("suppliers")
        .update({
          company_name: data.company_name,
          trading_name: data.trading_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          website: data.website,
          city: data.city,
          country: data.country
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
      toast({ title: "✅ Fornecedor atualizado" });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: String(error), variant: "destructive" });
    }
  });

  // Delete supplier mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
      toast({ title: "🗑️ Fornecedor removido" });
    }
  });

  // Toggle approval mutation
  const toggleApprovalMutation = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase.from("suppliers")
        .update({ is_approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
      toast({ title: "✅ Status atualizado" });
    }
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      trading_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      city: "",
      country: "Brasil",
      category: "spare_parts"
    });
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      company_name: supplier.company_name,
      trading_name: supplier.trading_name || "",
      contact_name: supplier.contact_name || "",
      contact_email: supplier.contact_email || "",
      contact_phone: supplier.contact_phone || "",
      website: supplier.website || "",
      city: supplier.city || "",
      country: supplier.country || "Brasil",
      category: supplier.category?.[0] || "spare_parts"
    });
    setShowEditDialog(true);
  };

  const handleExport = useCallback(() => {
    const csv = suppliers.map(s => 
      `${s.company_name},${s.contact_email},${s.city},${s.country},${s.rating},${s.is_approved ? "Aprovado" : "Pendente"}`
    ).join("\n");
    const blob = new Blob([`Empresa,Email,Cidade,País,Rating,Status\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fornecedores-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast({ title: "📥 Exportado", description: `${suppliers.length} fornecedores exportados` });
  }, [suppliers, toast]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating?.toFixed(1) || "N/A"})</span>
    </div>
  );

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || supplier.category?.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const approvedCount = suppliers.filter(s => s.is_approved).length;
  const pendingCount = suppliers.filter(s => !s.is_approved).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestão de Fornecedores
            <Badge variant="secondary">{suppliers.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Fornecedor
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <p className="text-sm text-green-600">Aprovados</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <p className="text-sm text-yellow-600">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="spare_parts">Peças</SelectItem>
              <SelectItem value="provisions">Provisões</SelectItem>
              <SelectItem value="lubricants">Lubrificantes</SelectItem>
              <SelectItem value="safety">Segurança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre fornecedores para gerenciar suas compras
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Fornecedor
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{supplier.company_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {supplier.city}, {supplier.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStars(supplier.rating || 0)}
                    <Badge className={supplier.is_approved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                      {supplier.is_approved ? "Aprovado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{supplier.contact_email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{supplier.contact_phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pedidos: </span>
                    <span className="font-medium">{supplier.total_orders || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Total: </span>
                    <span className="font-medium">R$ {(supplier.total_value || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {!supplier.is_approved && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600"
                      onClick={() => toggleApprovalMutation.mutate({ id: supplier.id, is_approved: true })}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  {supplier.is_approved && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-yellow-600"
                      onClick={() => toggleApprovalMutation.mutate({ id: supplier.id, is_approved: false })}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Suspender
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(supplier)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Razão Social *</Label>
                <Input 
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label>Nome Fantasia</Label>
                <Input 
                  value={formData.trading_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, trading_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contato</Label>
                <Input 
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input 
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input 
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.empresa.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>País</Label>
                <Input 
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spare_parts">Peças</SelectItem>
                    <SelectItem value="provisions">Provisões</SelectItem>
                    <SelectItem value="lubricants">Lubrificantes</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.company_name || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Razão Social</Label>
              <Input 
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input 
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => selectedSupplier && updateMutation.mutate({ id: selectedSupplier.id, ...formData })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
