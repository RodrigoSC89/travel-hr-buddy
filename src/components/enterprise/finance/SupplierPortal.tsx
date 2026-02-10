/**
 * Supplier Portal Component
 * Cadastro de fornecedores, avaliação de performance, comunicação
 */
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, Star, Mail, Phone, Globe, MapPin, 
  MessageSquare, FileText, TrendingUp, Award,
  Search, Plus, Filter, MoreVertical, CheckCircle2,
  Clock, AlertTriangle, Package
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  country: string;
  rating: number;
  status: "approved" | "pending" | "suspended";
  ordersCount: number;
  totalSpend: number;
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  lastOrder: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  certifications: string[];
}

const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Marine Parts Global",
    category: "Peças & Equipamentos",
    country: "Netherlands",
    rating: 4.8,
    status: "approved",
    ordersCount: 156,
    totalSpend: 2450000,
    onTimeDelivery: 96,
    qualityScore: 98,
    responseTime: 2.5,
    lastOrder: "2024-02-01",
    contact: { email: "sales@marinepartsgl.com", phone: "+31 20 1234567", website: "marinepartsgl.com" },
    certifications: ["ISO 9001", "ISO 14001", "DNV Approved"]
  },
  {
    id: "2",
    name: "Singapore Bunkers Ltd",
    category: "Combustível",
    country: "Singapore",
    rating: 4.5,
    status: "approved",
    ordersCount: 89,
    totalSpend: 8900000,
    onTimeDelivery: 94,
    qualityScore: 95,
    responseTime: 1.5,
    lastOrder: "2024-02-05",
    contact: { email: "orders@sgbunkers.com", phone: "+65 6789 0123", website: "sgbunkers.com" },
    certifications: ["ISO 8217", "MARPOL Compliant"]
  },
  {
    id: "3",
    name: "Hamburg Ship Supplies",
    category: "Suprimentos",
    country: "Germany",
    rating: 4.2,
    status: "approved",
    ordersCount: 234,
    totalSpend: 1250000,
    onTimeDelivery: 88,
    qualityScore: 92,
    responseTime: 4.0,
    lastOrder: "2024-01-28",
    contact: { email: "info@hamburgship.de", phone: "+49 40 9876543", website: "hamburgship.de" },
    certifications: ["ISO 9001", "HACCP"]
  },
  {
    id: "4",
    name: "Pacific Safety Equipment",
    category: "Segurança",
    country: "Japan",
    rating: 4.9,
    status: "approved",
    ordersCount: 67,
    totalSpend: 890000,
    onTimeDelivery: 99,
    qualityScore: 100,
    responseTime: 3.0,
    lastOrder: "2024-02-03",
    contact: { email: "sales@pacificsafety.jp", phone: "+81 3 1234 5678", website: "pacificsafety.jp" },
    certifications: ["SOLAS Approved", "ISO 9001", "JIS Certified"]
  },
  {
    id: "5",
    name: "Mediterranean Provisions",
    category: "Provisões",
    country: "Italy",
    rating: 3.8,
    status: "pending",
    ordersCount: 12,
    totalSpend: 180000,
    onTimeDelivery: 82,
    qualityScore: 88,
    responseTime: 6.0,
    lastOrder: "2024-01-15",
    contact: { email: "ordini@medprovisions.it", phone: "+39 010 123456", website: "medprovisions.it" },
    certifications: ["HACCP", "ISO 22000"]
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
    />
  ));
};

export function SupplierPortal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(suppliers[0]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSuppliers = suppliers.length;
  const approvedSuppliers = suppliers.filter(s => s.status === "approved").length;
  const avgRating = (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1);
  const totalSpend = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fornecedores</p>
                <p className="text-2xl font-bold">{totalSuppliers}</p>
                <p className="text-xs text-muted-foreground">{approvedSuppliers} aprovados</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating Médio</p>
                <p className="text-2xl font-bold">{avgRating}</p>
                <div className="flex gap-0.5 mt-1">{getRatingStars(parseFloat(avgRating))}</div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
                <p className="text-xs text-green-600">+12% vs ano anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas On-Time</p>
                <p className="text-2xl font-bold">93%</p>
                <Progress value={93} className="h-2 mt-2" />
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedores
              </CardTitle>
              <Button size="sm" onClick={() => toast.info("Cadastro de fornecedores em implantação", { description: "Utilize o módulo Procurement para cadastro completo. ETA: Q3/2026." })}>
                <Plus className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => toast.info("Utilize a busca acima para filtrar por nome. Filtros avançados (Status, Categoria, Rating) em implantação.")}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  selectedSupplier?.id === supplier.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {supplier.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{supplier.name}</p>
                      <Badge className={getStatusColor(supplier.status)} variant="secondary">
                        {supplier.status === "approved" ? "Aprovado" :
                         supplier.status === "pending" ? "Pendente" : "Suspenso"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{supplier.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">{getRatingStars(supplier.rating)}</div>
                      <span className="text-xs text-muted-foreground">({supplier.rating})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Supplier Details */}
        {selectedSupplier && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedSupplier.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedSupplier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    window.open(`mailto:${selectedSupplier.contact.email}?subject=Contato Nautilus - ${selectedSupplier.name}`, '_blank');
                  }}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Mensagem
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => toast.info(`Opções adicionais para ${selectedSupplier.name} em implantação. ETA: Q3/2026.`)}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="orders">Pedidos</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Contato</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplier.contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplier.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplier.contact.website}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSupplier.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Certificações</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">{selectedSupplier.ordersCount}</p>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedSupplier.totalSpend)}</p>
                      <p className="text-xs text-muted-foreground">Gasto Total</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{selectedSupplier.onTimeDelivery}%</p>
                      <p className="text-xs text-muted-foreground">On-Time</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{selectedSupplier.responseTime}h</p>
                      <p className="text-xs text-muted-foreground">Resp. Time</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Entrega no Prazo</span>
                        <span className="font-medium">{selectedSupplier.onTimeDelivery}%</span>
                      </div>
                      <Progress value={selectedSupplier.onTimeDelivery} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Qualidade</span>
                        <span className="font-medium">{selectedSupplier.qualityScore}%</span>
                      </div>
                      <Progress value={selectedSupplier.qualityScore} className="h-3" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium mb-3">Avaliação Geral</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{selectedSupplier.rating}</p>
                        <div className="flex gap-0.5 mt-1">{getRatingStars(selectedSupplier.rating)}</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Comunicação excelente</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Preços competitivos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Tempo de resposta pode melhorar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <div className="rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-sm font-medium">Pedido</th>
                          <th className="text-left p-3 text-sm font-medium">Data</th>
                          <th className="text-left p-3 text-sm font-medium">Valor</th>
                          <th className="text-left p-3 text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 text-sm">PO-2024-0156</td>
                          <td className="p-3 text-sm">05/02/2024</td>
                          <td className="p-3 text-sm">$45,000</td>
                          <td className="p-3"><Badge variant="default">Entregue</Badge></td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-sm">PO-2024-0142</td>
                          <td className="p-3 text-sm">28/01/2024</td>
                          <td className="p-3 text-sm">$78,500</td>
                          <td className="p-3"><Badge variant="default">Entregue</Badge></td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm">PO-2024-0128</td>
                          <td className="p-3 text-sm">15/01/2024</td>
                          <td className="p-3 text-sm">$32,000</td>
                          <td className="p-3"><Badge variant="default">Entregue</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-2">
                    {["Contrato Comercial 2024.pdf", "Certificado ISO 9001.pdf", "Seguro de Carga.pdf"].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SupplierPortal;
