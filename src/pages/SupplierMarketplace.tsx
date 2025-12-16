import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, Search, Star, MapPin, Phone, Mail, Globe, 
  Plus, Filter, FileText, Send, Clock, CheckCircle2,
  TrendingUp, Users, Package, Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Supplier {
  id: string;
  company_name: string;
  trading_name: string;
  category: string[];
  services: string[];
  ports_served: string[];
  countries: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  country: string;
  rating: number;
  total_orders: number;
  total_value: number;
  payment_terms: string;
  lead_time_days: number;
  certifications: string[];
  is_approved: boolean;
  is_active: boolean;
}

interface RFQRequest {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  delivery_port: string;
  status: string;
  deadline: string;
  budget_estimate: number;
  currency: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  quoted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  awarded: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-muted",
};

const categoryLabels: Record<string, string> = {
  spare_parts: "Peças Sobressalentes",
  provisions: "Provisões",
  deck_supplies: "Suprimentos de Convés",
  engine_supplies: "Suprimentos de Máquinas",
  safety_equipment: "Equipamentos de Segurança",
  navigation: "Navegação",
  lubricants: "Lubrificantes",
  chemicals: "Químicos",
  services: "Serviços",
};

export default function SupplierMarketplace() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const { data: rfqRequests = [], isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RFQRequest[];
    },
  });

  const approvedSuppliers = suppliers.filter(s => s.is_approved);
  const pendingRFQs = rfqRequests.filter(r => r.status === "sent" || r.status === "quoted");
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.total_value || 0), 0);

  const filteredSuppliers = suppliers.filter(s => 
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={cn(
              "h-3.5 w-3.5",
              star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating?.toFixed(1) || "N/A"})</span>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Supplier Marketplace | Nautilus One</title>
        <meta name="description" content="Marketplace de fornecedores marítimos com RFQ, cotações e gestão de compras" />
      </Helmet>

      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              Supplier Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Fornecedores, cotações e gestão de compras
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Fornecedor
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Nova RFQ
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedores Aprovados</p>
                  <p className="text-3xl font-bold text-foreground">{approvedSuppliers.length}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">RFQs Pendentes</p>
                  <p className="text-3xl font-bold text-foreground">{pendingRFQs.length}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Send className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Compras</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(totalSpend / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portos Atendidos</p>
                  <p className="text-3xl font-bold text-foreground">
                    {new Set(suppliers.flatMap(s => s.ports_served || [])).size}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="rfq">RFQ / Cotações</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar fornecedores por nome, cidade ou país..." 
                  className="pl-10 bg-muted/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliersLoading ? (
                <p className="col-span-full text-center py-8 text-muted-foreground">Carregando...</p>
              ) : filteredSuppliers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Store className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
                  <Button variant="link" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Fornecedor
                  </Button>
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{supplier.company_name}</h3>
                          {supplier.trading_name && (
                            <p className="text-sm text-muted-foreground">{supplier.trading_name}</p>
                          )}
                        </div>
                        {supplier.is_approved && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aprovado
                          </Badge>
                        )}
                      </div>

                      {renderStars(supplier.rating)}

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {supplier.city}, {supplier.country}
                        </div>
                        {supplier.contact_email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {supplier.contact_email}
                          </div>
                        )}
                        {supplier.lead_time_days && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            Lead time: {supplier.lead_time_days} dias
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(supplier.category || []).slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {categoryLabels[cat] || cat}
                          </Badge>
                        ))}
                        {(supplier.category || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{supplier.category.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {supplier.total_orders || 0} pedidos
                        </span>
                        <span className="font-medium text-foreground">
                          ${(supplier.total_value || 0).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="rfq" className="space-y-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Solicitações de Cotação (RFQ)</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova RFQ
                </Button>
              </CardHeader>
              <CardContent>
                {rfqLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Carregando...</p>
                ) : rfqRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma RFQ criada</p>
                    <Button variant="link" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Primeira RFQ
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-3 text-muted-foreground font-medium">Nº RFQ</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Título</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Categoria</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Porto</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqRequests.map((rfq) => (
                          <tr key={rfq.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="p-3 font-mono text-sm text-foreground">{rfq.rfq_number}</td>
                            <td className="p-3 text-foreground">{rfq.title}</td>
                            <td className="p-3 text-muted-foreground">{categoryLabels[rfq.category] || rfq.category}</td>
                            <td className="p-3 text-muted-foreground">{rfq.delivery_port}</td>
                            <td className="p-3">
                              <Badge className={cn("border", statusColors[rfq.status])}>
                                {rfq.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-foreground">
                              {rfq.currency} {rfq.budget_estimate?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Pedidos de Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Gestão de pedidos em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Tracking de entregas, recebimentos e gestão de estoque
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Analytics de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Dashboard analítico com IA</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Insights de gastos, fornecedores top e oportunidades de economia
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
