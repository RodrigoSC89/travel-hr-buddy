/**
 * Flight Route Catalog — Catálogo interno de rotas aéreas
 * Substitui API do Skyscanner com dados próprios
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlightRoutes, useCreateFlightRoute } from "@/hooks/useTravelLogisticsEngine";
import { Plane, Plus, Search, Clock, DollarSign, Star, ArrowRight } from "lucide-react";

export function FlightRouteCatalog() {
  const { data: routes = [], isLoading } = useFlightRoutes();
  const createRoute = useCreateFlightRoute();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    origin_city: "", origin_iata: "", destination_city: "", destination_iata: "",
    preferred_airlines: "", avg_price_usd: "", min_price_usd: "", max_price_usd: "",
    avg_duration_hours: "", frequency: "daily", notes: "",
  });

  const filtered = routes.filter(r =>
    !search || r.origin_city.toLowerCase().includes(search.toLowerCase()) ||
    r.destination_city.toLowerCase().includes(search.toLowerCase()) ||
    (r.origin_iata || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.destination_iata || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    createRoute.mutate({
      origin_city: form.origin_city,
      origin_iata: form.origin_iata || null,
      destination_city: form.destination_city,
      destination_iata: form.destination_iata || null,
      preferred_airlines: form.preferred_airlines ? form.preferred_airlines.split(",").map(s => s.trim()) : [],
      avg_price_usd: Number(form.avg_price_usd) || null,
      min_price_usd: Number(form.min_price_usd) || null,
      max_price_usd: Number(form.max_price_usd) || null,
      avg_duration_hours: Number(form.avg_duration_hours) || null,
      frequency: form.frequency,
      notes: form.notes || null,
      is_active: true,
    } as any, {
      onSuccess: () => {
        setOpen(false);
        setForm({ origin_city: "", origin_iata: "", destination_city: "", destination_iata: "", preferred_airlines: "", avg_price_usd: "", min_price_usd: "", max_price_usd: "", avg_duration_hours: "", frequency: "daily", notes: "" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" /> Catálogo de Rotas Aéreas
          </h3>
          <p className="text-sm text-muted-foreground">Rotas frequentes com preços de referência — sem API externa</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nova Rota</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar cidade ou IATA..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{routes.length === 0 ? "Nenhuma rota cadastrada. Adicione rotas frequentes para começar." : "Nenhuma rota encontrada"}</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(route => (
            <Card key={route.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Badge variant="outline" className="font-mono">{route.origin_iata || route.origin_city.substring(0, 3).toUpperCase()}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="font-mono">{route.destination_iata || route.destination_city.substring(0, 3).toUpperCase()}</Badge>
                  </div>
                  <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-0">{route.frequency}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{route.origin_city} → {route.destination_city}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {route.avg_price_usd && (
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />~${route.avg_price_usd}</span>
                  )}
                  {route.min_price_usd && route.max_price_usd && (
                    <span>(${route.min_price_usd}–${route.max_price_usd})</span>
                  )}
                  {route.avg_duration_hours && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{route.avg_duration_hours}h</span>
                  )}
                </div>
                {route.preferred_airlines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {route.preferred_airlines.map(a => (
                      <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Rota Aérea</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cidade Origem</Label><Input value={form.origin_city} onChange={e => setForm(p => ({ ...p, origin_city: e.target.value }))} placeholder="São Paulo" /></div>
              <div><Label>IATA</Label><Input value={form.origin_iata} onChange={e => setForm(p => ({ ...p, origin_iata: e.target.value }))} placeholder="GRU" maxLength={3} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cidade Destino</Label><Input value={form.destination_city} onChange={e => setForm(p => ({ ...p, destination_city: e.target.value }))} placeholder="Singapore" /></div>
              <div><Label>IATA</Label><Input value={form.destination_iata} onChange={e => setForm(p => ({ ...p, destination_iata: e.target.value }))} placeholder="SIN" maxLength={3} /></div>
            </div>
            <div><Label>Cias Aéreas (vírgula)</Label><Input value={form.preferred_airlines} onChange={e => setForm(p => ({ ...p, preferred_airlines: e.target.value }))} placeholder="LATAM, Emirates, Singapore Airlines" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Preço Mín ($)</Label><Input type="number" value={form.min_price_usd} onChange={e => setForm(p => ({ ...p, min_price_usd: e.target.value }))} /></div>
              <div><Label>Preço Méd ($)</Label><Input type="number" value={form.avg_price_usd} onChange={e => setForm(p => ({ ...p, avg_price_usd: e.target.value }))} /></div>
              <div><Label>Preço Máx ($)</Label><Input type="number" value={form.max_price_usd} onChange={e => setForm(p => ({ ...p, max_price_usd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Duração (h)</Label><Input type="number" value={form.avg_duration_hours} onChange={e => setForm(p => ({ ...p, avg_duration_hours: e.target.value }))} placeholder="14" /></div>
              <div><Label>Frequência</Label><Input value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} placeholder="daily" /></div>
            </div>
            <div><Label>Notas</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Conexão em Dubai" /></div>
            <Button onClick={handleCreate} disabled={!form.origin_city || !form.destination_city || createRoute.isPending} className="w-full">
              {createRoute.isPending ? "Salvando..." : "Cadastrar Rota"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
