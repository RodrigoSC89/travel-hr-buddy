/**
 * Approved Hotels Catalog — Rede de hotéis homologados
 * Substitui API do Booking.com com dados próprios + scoring inteligente
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovedHotels, useCreateApprovedHotel } from "@/hooks/useTravelLogisticsEngine";
import { Hotel, Plus, Search, Star, MapPin, DollarSign, Coffee, Bus, Shield } from "lucide-react";

export function ApprovedHotelsCatalog() {
  const [cityFilter, setCityFilter] = useState("");
  const { data: hotels = [], isLoading } = useApprovedHotels(cityFilter || undefined);
  const createHotel = useCreateApprovedHotel();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    hotel_name: "", city: "", country: "", port_name: "", address: "",
    phone: "", email: "", star_rating: "3", daily_rate_usd: "",
    max_daily_rate_usd: "", breakfast_included: false, airport_shuttle: false,
    port_distance_km: "", airport_distance_km: "", contract_valid_until: "",
  });

  const handleCreate = () => {
    createHotel.mutate({
      hotel_name: form.hotel_name, city: form.city, country: form.country,
      port_name: form.port_name || null, address: form.address || null,
      phone: form.phone || null, email: form.email || null,
      star_rating: Number(form.star_rating) || 3,
      daily_rate_usd: Number(form.daily_rate_usd) || null,
      max_daily_rate_usd: Number(form.max_daily_rate_usd) || null,
      breakfast_included: form.breakfast_included,
      airport_shuttle: form.airport_shuttle,
      port_distance_km: Number(form.port_distance_km) || null,
      airport_distance_km: Number(form.airport_distance_km) || null,
      contract_valid_until: form.contract_valid_until || null,
      is_active: true, internal_rating: 0, total_reviews: 0, rank_policy: {},
    }, {
      onSuccess: () => {
        setOpen(false);
        setForm({ hotel_name: "", city: "", country: "", port_name: "", address: "", phone: "", email: "", star_rating: "3", daily_rate_usd: "", max_daily_rate_usd: "", breakfast_included: false, airport_shuttle: false, port_distance_km: "", airport_distance_km: "", contract_valid_until: "" });
      },
    });
  };

  const renderStars = (n: number) => Array.from({ length: n }, (_, i) => (
    <Star key={i} className="h-3 w-3 fill-warning text-warning" />
  ));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Hotel className="h-5 w-5 text-primary" /> Hotéis Homologados
          </h3>
          <p className="text-sm text-muted-foreground">Rede própria com tarifas negociadas — sem Booking.com</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Hotel</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filtrar por cidade..." value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36" />)}</div>
      ) : hotels.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum hotel encontrado. Cadastre hotéis homologados por cidade/porto.</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hotels.map(hotel => {
            const contractValid = hotel.contract_valid_until ? new Date(hotel.contract_valid_until) > new Date() : true;
            return (
              <Card key={hotel.id} className={`hover:border-primary/30 transition-colors ${!contractValid ? 'opacity-70 border-warning/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{hotel.hotel_name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{hotel.city}, {hotel.country}
                      </p>
                    </div>
                    <div className="flex">{renderStars(hotel.star_rating || 0)}</div>
                  </div>
                  
                  {hotel.port_name && (
                    <p className="text-xs text-muted-foreground mb-2">Porto: {hotel.port_name}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-2">
                    {hotel.daily_rate_usd && (
                      <Badge variant="outline" className="text-[10px]">
                        <DollarSign className="h-3 w-3 mr-0.5" />${hotel.daily_rate_usd}/noite
                      </Badge>
                    )}
                    {hotel.breakfast_included && (
                      <Badge variant="secondary" className="text-[10px]"><Coffee className="h-3 w-3 mr-0.5" />Café</Badge>
                    )}
                    {hotel.airport_shuttle && (
                      <Badge variant="secondary" className="text-[10px]"><Bus className="h-3 w-3 mr-0.5" />Shuttle</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {hotel.port_distance_km && <span>Porto: {hotel.port_distance_km}km</span>}
                    {hotel.airport_distance_km && <span>Aeroporto: {hotel.airport_distance_km}km</span>}
                  </div>

                  {hotel.internal_rating > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Shield className="h-3 w-3 text-success" />
                      <span className="text-success font-medium">{hotel.internal_rating}/10</span>
                      <span className="text-muted-foreground">({hotel.total_reviews} avaliações)</span>
                    </div>
                  )}

                  {!contractValid && (
                    <Badge variant="outline" className="mt-2 text-[10px] text-warning border-warning/30">Contrato expirado</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Hotel Homologado</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome do Hotel</Label><Input value={form.hotel_name} onChange={e => setForm(p => ({ ...p, hotel_name: e.target.value }))} placeholder="Ibis Santos Dumont" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Santos" /></div>
              <div><Label>País</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Brasil" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Porto Próximo</Label><Input value={form.port_name} onChange={e => setForm(p => ({ ...p, port_name: e.target.value }))} placeholder="Porto de Santos" /></div>
              <div><Label>Estrelas</Label><Input type="number" min="1" max="5" value={form.star_rating} onChange={e => setForm(p => ({ ...p, star_rating: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Diária (USD)</Label><Input type="number" value={form.daily_rate_usd} onChange={e => setForm(p => ({ ...p, daily_rate_usd: e.target.value }))} /></div>
              <div><Label>Teto (USD)</Label><Input type="number" value={form.max_daily_rate_usd} onChange={e => setForm(p => ({ ...p, max_daily_rate_usd: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Dist. Porto (km)</Label><Input type="number" value={form.port_distance_km} onChange={e => setForm(p => ({ ...p, port_distance_km: e.target.value }))} /></div>
              <div><Label>Dist. Aerop. (km)</Label><Input type="number" value={form.airport_distance_km} onChange={e => setForm(p => ({ ...p, airport_distance_km: e.target.value }))} /></div>
            </div>
            <div><Label>Contato</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+55 13 9999-0000" /></div>
            <div><Label>Contrato válido até</Label><Input type="date" value={form.contract_valid_until} onChange={e => setForm(p => ({ ...p, contract_valid_until: e.target.value }))} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.breakfast_included} onChange={e => setForm(p => ({ ...p, breakfast_included: e.target.checked }))} />Café da manhã</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.airport_shuttle} onChange={e => setForm(p => ({ ...p, airport_shuttle: e.target.checked }))} />Shuttle</label>
            </div>
            <Button onClick={handleCreate} disabled={!form.hotel_name || !form.city || !form.country || createHotel.isPending} className="w-full">
              {createHotel.isPending ? "Salvando..." : "Cadastrar Hotel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
