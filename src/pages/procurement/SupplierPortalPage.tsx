import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Star, Package, FileText, Send, CheckCircle2, Clock, AlertTriangle, Globe, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MOCK_SUPPLIERS = [
  { id: "SUP-001", name: "Maritime Solutions Ltd", category: "Spare Parts", country: "Singapore", rating: 4.8, deliveryRate: 96, responseTime: "2.3h", activeOrders: 12, totalSpend: "$245,000", status: "approved", certifications: ["ISO 9001", "ISO 14001"] },
  { id: "SUP-002", name: "Nordic Marine Supply", category: "Provisions", country: "Norway", rating: 4.5, deliveryRate: 92, responseTime: "4.1h", activeOrders: 8, totalSpend: "$128,000", status: "approved", certifications: ["ISO 9001"] },
  { id: "SUP-003", name: "Global Ship Stores", category: "Safety Equipment", country: "Netherlands", rating: 4.2, deliveryRate: 88, responseTime: "6.5h", activeOrders: 5, totalSpend: "$89,000", status: "approved", certifications: ["ISO 9001", "OHSAS 18001"] },
  { id: "SUP-004", name: "Asia Pacific Marine", category: "Chemicals", country: "South Korea", rating: 3.9, deliveryRate: 85, responseTime: "8.2h", activeOrders: 3, totalSpend: "$67,000", status: "under_review", certifications: ["ISO 9001"] },
  { id: "SUP-005", name: "Mediterranean Trading", category: "Lubricants", country: "Greece", rating: 4.6, deliveryRate: 94, responseTime: "3.0h", activeOrders: 15, totalSpend: "$312,000", status: "approved", certifications: ["ISO 9001", "ISO 14001", "MARPOL"] },
];

const MOCK_RFQS = [
  { id: "RFQ-2026-0045", title: "Main Engine Spare Parts Kit", vessel: "MV Atlantic Star", responses: 4, deadline: "2026-02-28", status: "open", value: "$45,000" },
  { id: "RFQ-2026-0044", title: "Safety Equipment Annual Supply", vessel: "Fleet-wide", responses: 6, deadline: "2026-03-05", status: "open", value: "$78,000" },
  { id: "RFQ-2026-0043", title: "Provisions Q2 2026", vessel: "MV Pacific Voyager", responses: 3, deadline: "2026-02-25", status: "closing_soon", value: "$32,000" },
];

export default function SupplierPortalPage() {
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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Fornecedores Ativos</p><p className="text-2xl font-bold">{MOCK_SUPPLIERS.filter(s => s.status === "approved").length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Star className="h-8 w-8 text-yellow-400" /><div><p className="text-sm text-muted-foreground">Rating Médio</p><p className="text-2xl font-bold">4.4 ★</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Pedidos Ativos</p><p className="text-2xl font-bold">43</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileText className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">RFQs Abertas</p><p className="text-2xl font-bold">{MOCK_RFQS.filter(r => r.status !== "closed").length}</p></div></div></CardContent></Card>
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
              <Input placeholder="Buscar fornecedor..." className="max-w-xs" />
            </CardHeader>
            <CardContent>
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
                  {MOCK_SUPPLIERS.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.certifications.join(" • ")}</p>
                        </div>
                      </TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell>{s.country}</TableCell>
                      <TableCell><span className="text-yellow-400">★ {s.rating}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.deliveryRate} className="w-16 h-2" />
                          <span className="text-sm">{s.deliveryRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.responseTime}</TableCell>
                      <TableCell>{s.totalSpend}</TableCell>
                      <TableCell>
                        <Badge className={s.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}>
                          {s.status === "approved" ? "Aprovado" : "Em Análise"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfqs">
          <div className="space-y-4">
            {MOCK_RFQS.map(rfq => (
              <Card key={rfq.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rfq.title}</h3>
                        <Badge variant="outline">{rfq.id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Embarcação: {rfq.vessel} • Valor estimado: {rfq.value}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm">{rfq.responses} respostas</p>
                        <p className="text-xs text-muted-foreground">Deadline: {rfq.deadline}</p>
                      </div>
                      <Badge className={
                        rfq.status === "open" ? "bg-green-500/20 text-green-400" :
                        rfq.status === "closing_soon" ? "bg-orange-500/20 text-orange-400" :
                        "bg-muted text-muted-foreground"
                      }>
                        {rfq.status === "closing_soon" ? "Fechando" : "Aberta"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <div className="grid grid-cols-5 gap-3 mt-6 max-w-3xl mx-auto text-sm">
                  {["Qualidade", "Prazo", "Preço", "Certificações", "ESG"].map((kpi, i) => (
                    <div key={i} className="bg-muted/30 rounded p-3">
                      <p className="text-xs text-muted-foreground">{kpi}</p>
                      <p className="text-lg font-bold">{[92, 88, 85, 95, 78][i]}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
