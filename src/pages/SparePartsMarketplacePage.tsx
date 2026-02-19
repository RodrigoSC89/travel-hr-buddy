/**
 * Spare Parts P2P Marketplace — World-Class Feature
 * Companies buy/sell IMPA-coded maritime parts across the ecosystem
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import {
  Package, Search, ShoppingCart, Star, Globe, TrendingUp,
  Filter, Plus, Ship, DollarSign, ArrowUpDown, CheckCircle2
} from "lucide-react";

interface SparePartListing {
  id: string;
  impa_code: string;
  name: string;
  category: string;
  condition: "new" | "refurbished" | "used";
  price_usd: number;
  quantity: number;
  seller_company: string;
  seller_rating: number;
  location: string;
  lead_time_days: number;
  compatible_vessels: string[];
}

const CATEGORIES = [
  "Engine Parts", "Deck Equipment", "Navigation", "Safety Equipment",
  "Electrical", "HVAC", "Pumps & Valves", "Hull & Structure",
  "Communication", "Mooring Equipment",
];

// Deterministic demo listings
function generateListings(): SparePartListing[] {
  const parts = [
    { impa: "370101", name: "Turbocharger Cartridge ABB VTR-304", cat: "Engine Parts", price: 12500 },
    { impa: "370245", name: "Fuel Injection Pump MAN B&W", cat: "Engine Parts", price: 8200 },
    { impa: "450310", name: "EPIRB Jotron Tron 60GPS", cat: "Safety Equipment", price: 1850 },
    { impa: "530120", name: "Gyrocompass Sperry MK-37", cat: "Navigation", price: 45000 },
    { impa: "330215", name: "Centrifugal Pump Alfa Laval ALDEC", cat: "Pumps & Valves", price: 6700 },
    { impa: "270580", name: "Mooring Winch Hydraulic 30T", cat: "Mooring Equipment", price: 32000 },
    { impa: "410340", name: "Main Switchboard Panel 440V", cat: "Electrical", price: 15800 },
    { impa: "350120", name: "Air Conditioning Compressor Carrier", cat: "HVAC", price: 4200 },
    { impa: "490215", name: "GMDSS Radio Station Furuno FS-1575", cat: "Communication", price: 7500 },
    { impa: "230415", name: "Anchor Chain Grade 3 Stud Link", cat: "Deck Equipment", price: 9800 },
    { impa: "370310", name: "Cylinder Liner Wärtsilä 6L46", cat: "Engine Parts", price: 18500 },
    { impa: "450520", name: "Life Raft Viking 25-Person", cat: "Safety Equipment", price: 3200 },
  ];
  
  const sellers = [
    { name: "MarineSpares Rotterdam", rating: 4.8, loc: "Rotterdam, NL" },
    { name: "Singapore Ship Supply", rating: 4.6, loc: "Singapore, SG" },
    { name: "Gulf Marine Trading", rating: 4.3, loc: "Dubai, UAE" },
    { name: "Nordic Parts AS", rating: 4.9, loc: "Bergen, NO" },
    { name: "Piraeus Maritime Co", rating: 4.5, loc: "Piraeus, GR" },
    { name: "Shanghai Marine Tech", rating: 4.2, loc: "Shanghai, CN" },
  ];

  const conditions: ("new" | "refurbished" | "used")[] = ["new", "refurbished", "used", "new", "new", "refurbished"];
  const vessels = ["AHTS", "PSV", "Tanker", "Bulk Carrier", "Container", "FPSO"];

  return parts.map((p, i) => ({
    id: `sp-${i}`,
    impa_code: p.impa,
    name: p.name,
    category: p.cat,
    condition: conditions[i % conditions.length],
    price_usd: p.price,
    quantity: (i % 5) + 1,
    seller_company: sellers[i % sellers.length].name,
    seller_rating: sellers[i % sellers.length].rating,
    location: sellers[i % sellers.length].loc,
    lead_time_days: [3, 5, 7, 10, 14, 21][i % 6],
    compatible_vessels: vessels.slice(0, (i % 3) + 2),
  }));
}

const conditionColors: Record<string, string> = {
  new: "bg-success/10 text-success border-success/30",
  refurbished: "bg-warning/10 text-warning border-warning/30",
  used: "bg-muted text-muted-foreground border-border",
};

export default function SparePartsMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "lead_time">("price");

  const listings = generateListings();

  const { data: realPartsCount } = useQuery({
    queryKey: ["spare-parts-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("impa_spare_parts")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    staleTime: 60000,
  });

  const filtered = listings
    .filter((l) => {
      if (searchTerm && !l.name.toLowerCase().includes(searchTerm.toLowerCase()) && !l.impa_code.includes(searchTerm)) return false;
      if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
      if (conditionFilter !== "all" && l.condition !== conditionFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price_usd - b.price_usd;
      if (sortBy === "rating") return b.seller_rating - a.seller_rating;
      return a.lead_time_days - b.lead_time_days;
    });

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Package className="h-7 w-7 text-primary" />
              Spare Parts Marketplace
              <Badge variant="outline" className="text-[10px] ml-2">P2P</Badge>
            </CardTitle>
            <CardDescription>
              Compre e venda peças marítimas codificadas IMPA entre empresas do ecossistema.
              {realPartsCount ? ` ${realPartsCount.toLocaleString()} peças catalogadas no sistema.` : ""}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Fornecedores", value: "48", icon: Globe, color: "text-primary" },
          { label: "Peças Listadas", value: "2.4K", icon: Package, color: "text-success" },
          { label: "Economia Média", value: "23%", icon: TrendingUp, color: "text-warning" },
          { label: "Lead Time Médio", value: "7 dias", icon: Ship, color: "text-accent-foreground" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Buscar Peças</TabsTrigger>
          <TabsTrigger value="my-listings">Minhas Ofertas</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código IMPA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Condição" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="new">Nova</SelectItem>
                <SelectItem value="refurbished">Recondicionada</SelectItem>
                <SelectItem value="used">Usada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "price" | "rating" | "lead_time")}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Menor Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliação</SelectItem>
                <SelectItem value="lead_time">Menor Lead Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <p className="text-sm text-muted-foreground">{filtered.length} resultados</p>
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <Card key={item.id} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">IMPA {item.impa_code}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${conditionColors[item.condition]}`}>
                        {item.condition === "new" ? "Nova" : item.condition === "refurbished" ? "Recond." : "Usada"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${item.price_usd.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{item.seller_company}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          {item.seller_rating}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{item.location}</span>
                        <span>Lead: {item.lead_time_days}d</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.compatible_vessels.map((v) => (
                        <Badge key={v} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {v}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => toast.success(`Cotação solicitada para ${item.name}`)}>
                        <ShoppingCart className="h-3 w-3 mr-1" /> Solicitar Cotação
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info("Detalhes do fornecedor")}>
                        <Filter className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="my-listings" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <Plus className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Publique peças excedentes para venda no marketplace</p>
              <Button onClick={() => toast.info("Formulário de publicação em breve")}>
                <Plus className="h-4 w-4 mr-2" /> Publicar Peça
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum pedido encontrado. Comece buscando peças no marketplace!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
