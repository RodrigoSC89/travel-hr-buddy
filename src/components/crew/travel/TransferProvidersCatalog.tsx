/**
 * Transfer Providers Catalog — Empresas de transfer terrestre
 * Rotas pré-definidas com preços fixos por porto/cidade
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransferProviders, useCreateTransferProvider } from "@/hooks/useTravelLogisticsEngine";
import { Bus, Plus, Search, Phone, Mail, MapPin, DollarSign, Shield, Car } from "lucide-react";

export function TransferProvidersCatalog() {
  const [cityFilter, setCityFilter] = useState("");
  const { data: providers = [], isLoading } = useTransferProviders(cityFilter || undefined);
  const createProvider = useCreateTransferProvider();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company_name: "", city: "", country: "", port_name: "", contact_name: "",
    phone: "", email: "", vehicle_types: "", base_rate_usd: "",
    airport_to_port_rate_usd: "", hotel_to_port_rate_usd: "",
  });

  const handleCreate = () => {
    createProvider.mutate({
      company_name: form.company_name, city: form.city, country: form.country,
      port_name: form.port_name || null, contact_name: form.contact_name || null,
      phone: form.phone || null, email: form.email || null,
      vehicle_types: form.vehicle_types ? form.vehicle_types.split(",").map(s => s.trim()) : [],
      base_rate_usd: Number(form.base_rate_usd) || null,
      airport_to_port_rate_usd: Number(form.airport_to_port_rate_usd) || null,
      hotel_to_port_rate_usd: Number(form.hotel_to_port_rate_usd) || null,
      is_active: true, internal_rating: 0, total_trips: 0,
    } as any, {
      onSuccess: () => {
        setOpen(false);
        setForm({ company_name: "", city: "", country: "", port_name: "", contact_name: "", phone: "", email: "", vehicle_types: "", base_rate_usd: "", airport_to_port_rate_usd: "", hotel_to_port_rate_usd: "" });
      },
    });
  };

  const vehicleIcon: Record<string, string> = { sedan: "🚗", van: "🚐", minibus: "🚌", bus: "🚍" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" /> Empresas de Transfer
          </h3>
          <p className="text-sm text-muted-foreground">Rede de transporte terrestre por porto com tarifas fixas</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nova Empresa</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filtrar por cidade..." value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : providers.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Bus className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma empresa cadastrada. Adicione fornecedores de transfer por porto.</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map(prov => (
            <Card key={prov.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-primary" />{prov.company_name}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{prov.city}, {prov.country}
                    </p>
                  </div>
                  {prov.internal_rating > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      <Shield className="h-3 w-3 mr-0.5 text-success" />{prov.internal_rating}/10
                    </Badge>
                  )}
                </div>

                {prov.port_name && <p className="text-xs text-muted-foreground mb-2">Porto: {prov.port_name}</p>}

                <div className="flex flex-wrap gap-1 mb-2">
                  {prov.vehicle_types.map(v => (
                    <Badge key={v} variant="secondary" className="text-[10px]">{vehicleIcon[v] || "🚗"} {v}</Badge>
                  ))}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {prov.airport_to_port_rate_usd && (
                    <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Aeroporto → Porto: <strong className="text-foreground">${prov.airport_to_port_rate_usd}</strong></div>
                  )}
                  {prov.hotel_to_port_rate_usd && (
                    <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Hotel → Porto: <strong className="text-foreground">${prov.hotel_to_port_rate_usd}</strong></div>
                  )}
                </div>

                {(prov.phone || prov.email) && (
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    {prov.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{prov.phone}</span>}
                    {prov.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{prov.email}</span>}
                  </div>
                )}

                {prov.total_trips > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-2">{prov.total_trips} viagens realizadas</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Empresa de Transfer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome da Empresa</Label><Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Santos Transfer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Santos" /></div>
              <div><Label>País</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Brasil" /></div>
            </div>
            <div><Label>Porto</Label><Input value={form.port_name} onChange={e => setForm(p => ({ ...p, port_name: e.target.value }))} placeholder="Porto de Santos" /></div>
            <div><Label>Veículos (vírgula)</Label><Input value={form.vehicle_types} onChange={e => setForm(p => ({ ...p, vehicle_types: e.target.value }))} placeholder="sedan, van, minibus" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Aeroporto→Porto ($)</Label><Input type="number" value={form.airport_to_port_rate_usd} onChange={e => setForm(p => ({ ...p, airport_to_port_rate_usd: e.target.value }))} /></div>
              <div><Label>Hotel→Porto ($)</Label><Input type="number" value={form.hotel_to_port_rate_usd} onChange={e => setForm(p => ({ ...p, hotel_to_port_rate_usd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contato</Label><Input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <Button onClick={handleCreate} disabled={!form.company_name || !form.city || !form.country || createProvider.isPending} className="w-full">
              {createProvider.isPending ? "Salvando..." : "Cadastrar Empresa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
