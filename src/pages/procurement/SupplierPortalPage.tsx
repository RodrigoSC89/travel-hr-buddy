import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Star, Package, FileText, Send, CheckCircle2, Clock, AlertTriangle, Globe, Plus, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useState } from "react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  country: string;
  rating: number;
  delivery_rate: number;
  response_time_hours: number;
  status: string;
  certifications: string[];
  total_spend: number;
}

interface RFQ {
  id: string;
  title: string;
  vessel_name: string;
  responses_count: number;
  deadline: string;
  status: string;
  estimated_value: number;
}

export default function SupplierPortalPage() {
  const [search, setSearch] = useState("");

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers-portal"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("suppliers")
        .select("id, name, category, country, rating, delivery_rate, response_time_hours, status, certifications, total_spend")
        .order("rating", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as Supplier[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: rfqs = [], isLoading: loadingRFQs } = useQuery({
    queryKey: ["rfqs-portal"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("purchase_requisitions")
        .select("id, title, vessel_id, status, created_at, required_date, estimated_cost")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        id: String(r.id || "").slice(0, 8),
        title: String(r.title || "Requisição"),
        vessel_name: "Frota",
        responses_count: 0,
        deadline: String(r.required_date || r.created_at || ""),
        status: String(r.status || "open"),
        estimated_value: Number(r.estimated_cost || 0),
      })) as RFQ[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: orderCount = 0 } = useQuery({
    queryKey: ["active-orders-count"],
    queryFn: async () => {
      const { count, error } = await fromUntyped("procurement_orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "approved", "ordered"]);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 10,
  });

  const approvedSuppliers = suppliers.filter(s => s.status === "approved");
  const avgRating = suppliers.length > 0
    ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)
    : "—";
  const openRFQs = rfqs.filter(r => r.status !== "closed" && r.status !== "completed").length;

  const filteredSuppliers = search
    ? suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    : suppliers;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Supplier Portal
          </h1>
          <p className="text-muted-foreground">Gestão de fornecedores, qualificação e portal de cotações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Send className="h-4 w-4" /> Enviar RFQ</Button>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Fornecedor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Fornecedores Ativos</p><p className="text-2xl font-bold">{approvedSuppliers.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Star className="h-8 w-8 text-warning" /><div><p className="text-sm text-muted-foreground">Rating Médio</p><p className="text-2xl font-bold">{avgRating} ★</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Pedidos Ativos</p><p className="text-2xl font-bold">{orderCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-success" /><div><p className="text-sm text-muted-foreground">RFQs Abertas</p><p className="text-2xl font-bold">{openRFQs}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs</TabsTrigger>
          <TabsTrigger value="qualification">Qualificação</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Diretório de Fornecedores</CardTitle>
              <Input placeholder="Buscar fornecedor..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </CardHeader>
            <CardContent>
              {loadingSuppliers ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Nenhum fornecedor cadastrado. Clique em "Novo Fornecedor" para começar.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>On-time Delivery</TableHead>
                      <TableHead>Resp. Time</TableHead>
                      <TableHead>Spend Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{(s.certifications || []).join(" • ") || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{s.category || "—"}</TableCell>
                        <TableCell>{s.country || "—"}</TableCell>
                        <TableCell><span className="text-warning">★ {(s.rating || 0).toFixed(1)}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={s.delivery_rate || 0} className="w-16 h-2" />
                            <span className="text-sm">{s.delivery_rate || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{s.response_time_hours ? `${s.response_time_hours}h` : "—"}</TableCell>
                        <TableCell>${((s.total_spend || 0) / 1000).toFixed(0)}K</TableCell>
                        <TableCell>
                          <Badge className={s.status === "approved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                            {s.status === "approved" ? "Aprovado" : "Em Análise"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfqs">
          <div className="space-y-4">
            {loadingRFQs ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : rfqs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhuma RFQ encontrada.</div>
            ) : (
              rfqs.map(rfq => (
                <Card key={rfq.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rfq.title}</h3>
                          <Badge variant="outline">{rfq.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Embarcação: {rfq.vessel_name} • Valor estimado: ${rfq.estimated_value.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm">{rfq.responses_count} respostas</p>
                          <p className="text-xs text-muted-foreground">Deadline: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString("pt-BR") : "—"}</p>
                        </div>
                        <Badge className={
                          rfq.status === "open" || rfq.status === "pending" ? "bg-success/20 text-success" :
                          rfq.status === "closing_soon" ? "bg-warning/20 text-warning" :
                          "bg-muted text-muted-foreground"
                        }>
                          {rfq.status === "closing_soon" ? "Fechando" : rfq.status === "open" || rfq.status === "pending" ? "Aberta" : rfq.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="qualification">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold">Supplier Qualification Matrix</h3>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Avaliação contínua de fornecedores baseada em KPIs: qualidade, prazo de entrega,
                  preço competitivo, certificações e compliance ambiental.
                </p>
                {suppliers.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-6 max-w-3xl mx-auto text-sm">
                    {[
                      { label: "Qualidade", val: Math.round(suppliers.reduce((s, x) => s + (x.rating || 0), 0) / suppliers.length * 20) },
                      { label: "Prazo", val: Math.round(suppliers.reduce((s, x) => s + (x.delivery_rate || 0), 0) / suppliers.length) },
                      { label: "Preço", val: 85 },
                      { label: "Certificações", val: Math.round(suppliers.filter(s => (s.certifications || []).length > 0).length / suppliers.length * 100) },
                      { label: "ESG", val: 78 },
                    ].map((kpi) => (
                      <div key={kpi.label} className="bg-muted/30 rounded p-3">
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        <p className="text-lg font-bold">{kpi.val}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
