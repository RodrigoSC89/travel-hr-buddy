import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Building2,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  FileText,
  Package,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle2,
  Globe,
  User,
  Calendar,
  BarChart3,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useSuppliers, useSuppliersStats, type Supplier } from "@/hooks/useSuppliersRealData";

const performanceHistory = [
  { month: "Jul", onTime: 92, quality: 88 },
  { month: "Ago", onTime: 95, quality: 90 },
  { month: "Set", onTime: 93, quality: 92 },
  { month: "Out", onTime: 97, quality: 94 },
  { month: "Nov", onTime: 96, quality: 93 },
  { month: "Dez", onTime: 98, quality: 95 },
];

interface SuppliersSectionProps {
  searchQuery: string;
}

export default function SuppliersSection({ searchQuery }: SuppliersSectionProps) {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const { total, preferred: preferredCount, active: activeCount, avgRating } = useSuppliersStats();
  
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = [...new Set(suppliers.flatMap(s => s.category))];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchQuery === "" ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.cnpj.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || supplier.status === filterStatus;
    const matchesCategory = filterCategory === "all" || supplier.category.includes(filterCategory);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fornecedores</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preferenciais</p>
                <p className="text-2xl font-bold text-warning">{preferredCount}</p>
              </div>
              <Award className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-success">{activeCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-info/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating Médio</p>
                <p className="text-2xl font-bold text-info flex items-center gap-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  {avgRating}
                </p>
              </div>
              <Target className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="preferred">Preferencial</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowAddSupplier(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card 
            key={supplier.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              supplier.status === "suspended" ? "opacity-60" : ""
            } ${supplier.status === "preferred" ? "border-amber-500/50" : ""}`}
            onClick={() => {
              setSelectedSupplier(supplier);
              setShowDetails(true);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    supplier.status === "preferred" ? "bg-warning/10" :
                    supplier.status === "active" ? "bg-success/10" :
                    supplier.status === "suspended" ? "bg-destructive/10" : "bg-muted"
                  }`}>
                    <Building2 className={`h-5 w-5 ${
                      supplier.status === "preferred" ? "text-warning" :
                      supplier.status === "active" ? "text-success" :
                      supplier.status === "suspended" ? "text-destructive" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{supplier.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{supplier.cnpj}</p>
                  </div>
                </div>
                <Badge variant={
                  supplier.status === "preferred" ? "default" :
                  supplier.status === "active" ? "secondary" :
                  supplier.status === "suspended" ? "destructive" : "outline"
                }>
                  {supplier.status === "preferred" && <Star className="h-3 w-3 mr-1 fill-current" />}
                  {supplier.status === "preferred" ? "Preferencial" :
                   supplier.status === "active" ? "Ativo" :
                   supplier.status === "suspended" ? "Suspenso" : "Pendente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {supplier.category.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold">{supplier.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.avgLeadTime}d</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.totalOrders} pedidos</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    supplier.deliveryRate >= 95 ? "text-success" :
                    supplier.deliveryRate >= 90 ? "text-warning" : "text-destructive"
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                    <span>{supplier.deliveryRate}% on-time</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor total:</span>
                    <span className="font-semibold">R$ {(supplier.totalValue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supplier Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Fornecedor</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedSupplier.name}</h2>
                    <p className="text-muted-foreground">{selectedSupplier.cnpj}</p>
                  </div>
                  <Badge variant={
                    selectedSupplier.status === "preferred" ? "default" :
                    selectedSupplier.status === "active" ? "secondary" : "destructive"
                  } className="ml-auto">
                    {selectedSupplier.status === "preferred" ? "⭐ Preferencial" :
                     selectedSupplier.status === "active" ? "Ativo" : "Suspenso"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="text-2xl font-bold">{selectedSupplier.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Rating Geral</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-success">{selectedSupplier.deliveryRate}%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-info">{selectedSupplier.avgLeadTime}d</p>
                      <p className="text-sm text-muted-foreground">Lead Time Médio</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplier.contact.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplier.contact.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplier.contact.phone}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Localização</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplier.address.city}, {selectedSupplier.address.state}
                      </p>
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {selectedSupplier.address.country}
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Pagamento: {selectedSupplier.paymentTerms}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Score de Qualidade</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedSupplier.qualityScore} className="h-3" />
                      <span className="font-semibold">{selectedSupplier.qualityScore}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Competitividade de Preço</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedSupplier.priceCompetitiveness} className="h-3" />
                      <span className="font-semibold">{selectedSupplier.priceCompetitiveness}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceHistory}>
                        <defs>
                          <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" domain={[80, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--popover))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="onTime" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorOnTime)"
                          name="% On-Time"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="quality" 
                          stroke="hsl(var(--chart-2))" 
                          fillOpacity={1} 
                          fill="url(#colorQuality)"
                          name="% Qualidade"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold">{selectedSupplier.totalOrders} pedidos realizados</p>
                    <p className="text-sm text-muted-foreground">
                      Valor total: R$ {selectedSupplier.totalValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Último pedido: {selectedSupplier.lastOrderDate}
                    </p>
                    <Button className="mt-4" variant="outline">
                      Ver todos os pedidos
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold">Documentos do Fornecedor</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contratos, certidões e documentos fiscais
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload de Documento
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Razão Social</Label>
              <Input placeholder="Nome da empresa" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="consumiveis">Consumíveis</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                  <SelectItem value="dp-system">DP System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nome do Contato</Label>
              <Input placeholder="Nome" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Condições de Pagamento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="45">45 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="avista">À vista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre o fornecedor..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success("Fornecedor adicionado com sucesso!");
              setShowAddSupplier(false);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
