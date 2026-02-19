/**
 * Quotation Engine — Motor de cotação com scoring automático
 * Agências enviam cotações, sistema rankeia e aprova
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useQuotationRequests, useQuotationResponses, useCreateQuotationRequest,
  useSubmitQuotationResponse, useSelectQuotation,
  type QuotationRequest
} from "@/hooks/useTravelLogisticsEngine";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trophy, DollarSign, Clock, Shield, CheckCircle, AlertTriangle, TrendingUp, Star } from "lucide-react";

export function QuotationEngine() {
  const { data: requests = [], isLoading } = useQuotationRequests();
  const createRequest = useCreateQuotationRequest();
  const [openNew, setOpenNew] = useState(false);
  const [selectedReq, setSelectedReq] = useState<QuotationRequest | null>(null);
  const [tab, setTab] = useState("open");

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["quotation-crew"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_members").select("id, full_name, rank").order("full_name");
      return data || [];
    },
  });

  const [form, setForm] = useState({
    request_type: "flight", crew_member_id: "", origin_city: "", destination_city: "",
    departure_date: "", return_date: "", hotel_city: "", check_in_date: "", check_out_date: "",
    transfer_city: "", transfer_origin: "", transfer_destination: "", transfer_date: "",
    max_budget_usd: "", urgency: "normal", cabin_class: "economy", notes: "",
  });

  const handleCreateRequest = () => {
    const crew = crewMembers.find(c => c.id === form.crew_member_id);
    createRequest.mutate({
      request_type: form.request_type,
      crew_member_id: form.crew_member_id || null,
      crew_member_name: crew?.full_name || null,
      origin_city: form.origin_city || null,
      destination_city: form.destination_city || null,
      departure_date: form.departure_date || null,
      return_date: form.return_date || null,
      hotel_city: form.hotel_city || null,
      check_in_date: form.check_in_date || null,
      check_out_date: form.check_out_date || null,
      transfer_city: form.transfer_city || null,
      transfer_origin: form.transfer_origin || null,
      transfer_destination: form.transfer_destination || null,
      transfer_date: form.transfer_date || null,
      max_budget_usd: Number(form.max_budget_usd) || null,
      urgency: form.urgency,
      cabin_class: form.cabin_class,
      notes: form.notes || null,
      status: "open",
    } as any, {
      onSuccess: () => {
        setOpenNew(false);
        setForm({ request_type: "flight", crew_member_id: "", origin_city: "", destination_city: "", departure_date: "", return_date: "", hotel_city: "", check_in_date: "", check_out_date: "", transfer_city: "", transfer_origin: "", transfer_destination: "", transfer_date: "", max_budget_usd: "", urgency: "normal", cabin_class: "economy", notes: "" });
      },
    });
  };

  const openReqs = requests.filter(r => r.status === "open" || r.status === "quoted");
  const closedReqs = requests.filter(r => r.status === "approved" || r.status === "booked");

  const statusColors: Record<string, string> = {
    open: "bg-info/20 text-info",
    quoted: "bg-warning/20 text-warning",
    evaluating: "bg-primary/20 text-primary",
    approved: "bg-success/20 text-success",
    booked: "bg-success/20 text-success",
    cancelled: "bg-destructive/20 text-destructive",
  };

  const urgencyColors: Record<string, string> = {
    urgent: "text-destructive",
    normal: "text-muted-foreground",
    flexible: "text-success",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Motor de Cotação
          </h3>
          <p className="text-sm text-muted-foreground">Solicite cotações, receba propostas e aprove com scoring automático</p>
        </div>
        <Button size="sm" onClick={() => setOpenNew(true)}><Plus className="h-4 w-4 mr-1" />Nova Solicitação</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Abertas", value: openReqs.filter(r => r.status === "open").length, icon: FileText, color: "text-info" },
          { label: "Com Cotação", value: openReqs.filter(r => r.status === "quoted").length, icon: TrendingUp, color: "text-warning" },
          { label: "Aprovadas", value: closedReqs.length, icon: CheckCircle, color: "text-success" },
          { label: "Total", value: requests.length, icon: Star, color: "text-primary" },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="open">Abertas ({openReqs.length})</TabsTrigger>
          <TabsTrigger value="closed">Finalizadas ({closedReqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : openReqs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma solicitação aberta. Crie uma nova para receber cotações.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {openReqs.map(req => (
                <RequestCard key={req.id} request={req} statusColors={statusColors} urgencyColors={urgencyColors} onSelect={() => setSelectedReq(req)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {closedReqs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma solicitação finalizada</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {closedReqs.map(req => (
                <RequestCard key={req.id} request={req} statusColors={statusColors} urgencyColors={urgencyColors} onSelect={() => setSelectedReq(req)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Detail Dialog */}
      {selectedReq && <ResponsesDialog request={selectedReq} onClose={() => setSelectedReq(null)} />}

      {/* Create Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Solicitação de Cotação</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.request_type} onValueChange={v => setForm(p => ({ ...p, request_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Passagem Aérea</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="package">Pacote Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tripulante</Label>
                <Select value={form.crew_member_id} onValueChange={v => setForm(p => ({ ...p, crew_member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{crewMembers.map(cm => <SelectItem key={cm.id} value={cm.id}>{cm.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {(form.request_type === "flight" || form.request_type === "package") && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Origem</Label><Input value={form.origin_city} onChange={e => setForm(p => ({ ...p, origin_city: e.target.value }))} placeholder="São Paulo" /></div>
                  <div><Label>Destino</Label><Input value={form.destination_city} onChange={e => setForm(p => ({ ...p, destination_city: e.target.value }))} placeholder="Singapore" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Ida</Label><Input type="date" value={form.departure_date} onChange={e => setForm(p => ({ ...p, departure_date: e.target.value }))} /></div>
                  <div><Label>Volta</Label><Input type="date" value={form.return_date} onChange={e => setForm(p => ({ ...p, return_date: e.target.value }))} /></div>
                </div>
              </>
            )}

            {(form.request_type === "hotel" || form.request_type === "package") && (
              <>
                <div><Label>Cidade Hotel</Label><Input value={form.hotel_city} onChange={e => setForm(p => ({ ...p, hotel_city: e.target.value }))} placeholder="Singapore" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Check-in</Label><Input type="date" value={form.check_in_date} onChange={e => setForm(p => ({ ...p, check_in_date: e.target.value }))} /></div>
                  <div><Label>Check-out</Label><Input type="date" value={form.check_out_date} onChange={e => setForm(p => ({ ...p, check_out_date: e.target.value }))} /></div>
                </div>
              </>
            )}

            {(form.request_type === "transfer" || form.request_type === "package") && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Transfer Origem</Label><Input value={form.transfer_origin} onChange={e => setForm(p => ({ ...p, transfer_origin: e.target.value }))} placeholder="Aeroporto Changi" /></div>
                <div><Label>Transfer Destino</Label><Input value={form.transfer_destination} onChange={e => setForm(p => ({ ...p, transfer_destination: e.target.value }))} placeholder="Porto de Singapore" /></div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div><Label>Budget Máx ($)</Label><Input type="number" value={form.max_budget_usd} onChange={e => setForm(p => ({ ...p, max_budget_usd: e.target.value }))} /></div>
              <div>
                <Label>Urgência</Label>
                <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="flexible">Flexível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Classe</Label>
                <Select value={form.cabin_class} onValueChange={v => setForm(p => ({ ...p, cabin_class: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div><Label>Notas</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Preferência por voo direto" /></div>

            <Button onClick={handleCreateRequest} disabled={createRequest.isPending} className="w-full">
              {createRequest.isPending ? "Criando..." : "Criar Solicitação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function RequestCard({ request, statusColors, urgencyColors, onSelect }: {
  request: QuotationRequest; statusColors: Record<string, string>; urgencyColors: Record<string, string>; onSelect: () => void;
}) {
  const typeLabels: Record<string, string> = { flight: "✈️ Passagem", hotel: "🏨 Hotel", transfer: "🚗 Transfer", package: "📦 Pacote" };
  return (
    <Card className="hover:border-primary/30 transition-colors cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-[10px]">{request.request_number}</Badge>
              <span className="text-sm">{typeLabels[request.request_type] || request.request_type}</span>
              <Badge className={statusColors[request.status] || ""}>{request.status}</Badge>
              <span className={`text-xs ${urgencyColors[request.urgency] || ""}`}>
                {request.urgency === "urgent" && "⚡"}{request.urgency}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {request.crew_member_name && `${request.crew_member_name} — `}
              {request.origin_city && request.destination_city && `${request.origin_city} → ${request.destination_city}`}
              {request.hotel_city && `Hotel: ${request.hotel_city}`}
              {request.transfer_origin && `Transfer: ${request.transfer_origin} → ${request.transfer_destination}`}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {request.departure_date && <span><Clock className="h-3 w-3 inline mr-1" />{new Date(request.departure_date).toLocaleDateString("pt-BR")}</span>}
              {request.max_budget_usd && <span><DollarSign className="h-3 w-3 inline" />Budget: ${request.max_budget_usd}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResponsesDialog({ request, onClose }: { request: QuotationRequest; onClose: () => void }) {
  const { data: responses = [], isLoading } = useQuotationResponses(request.id);
  const submitResponse = useSubmitQuotationResponse();
  const selectQuotation = useSelectQuotation();
  const [openAdd, setOpenAdd] = useState(false);
  const [respForm, setRespForm] = useState({
    supplier_name: "", price_usd: "", description: "", airline: "",
    hotel_name: "", transfer_company: "", valid_until: "",
  });

  const handleAddResponse = () => {
    submitResponse.mutate({
      request_id: request.id,
      supplier_name: respForm.supplier_name,
      price_usd: Number(respForm.price_usd) || 0,
      description: respForm.description || null,
      airline: respForm.airline || null,
      hotel_name: respForm.hotel_name || null,
      transfer_company: respForm.transfer_company || null,
      valid_until: respForm.valid_until || null,
      request: request,
    } as any, {
      onSuccess: () => {
        setOpenAdd(false);
        setRespForm({ supplier_name: "", price_usd: "", description: "", airline: "", hotel_name: "", transfer_company: "", valid_until: "" });
      },
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" /> Cotações — {request.request_number}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-3">
          {request.crew_member_name} | {request.origin_city} → {request.destination_city} | Budget: ${request.max_budget_usd || "N/A"}
        </div>

        <Button size="sm" variant="outline" onClick={() => setOpenAdd(true)} className="mb-3"><Plus className="h-4 w-4 mr-1" />Adicionar Cotação</Button>

        {isLoading ? (
          <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : responses.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma cotação recebida ainda. Adicione propostas de fornecedores.
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {responses.map((resp, idx) => (
              <Card key={resp.id} className={`${resp.is_recommended ? "border-success/50" : ""} ${resp.is_selected ? "border-primary bg-primary/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Trophy className="h-4 w-4 text-warning" />}
                      <span className="font-semibold text-sm">{resp.supplier_name}</span>
                      {resp.is_recommended && <Badge className="bg-success/20 text-success text-[10px]">Recomendado</Badge>}
                      {resp.is_selected && <Badge className="bg-primary/20 text-primary text-[10px]">Selecionado ✓</Badge>}
                    </div>
                    <span className="text-lg font-bold">${resp.price_usd}</span>
                  </div>

                  {resp.description && <p className="text-xs text-muted-foreground mb-2">{resp.description}</p>}

                  <div className="flex gap-3 mb-2">
                    {resp.ai_score != null && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 text-warning" />
                        <strong>{resp.ai_score}</strong>/100
                      </div>
                    )}
                    {resp.price_score != null && <Badge variant="outline" className="text-[10px]">Preço: {resp.price_score}</Badge>}
                    {resp.convenience_score != null && <Badge variant="outline" className="text-[10px]">Conveniência: {resp.convenience_score}</Badge>}
                    {resp.reliability_score != null && <Badge variant="outline" className="text-[10px]">Confiança: {resp.reliability_score}</Badge>}
                  </div>

                  {!resp.is_selected && request.status !== "approved" && (
                    <Button size="sm" variant="default" onClick={() => selectQuotation.mutate({ responseId: resp.id, requestId: request.id })}
                      disabled={selectQuotation.isPending}>
                      <CheckCircle className="h-4 w-4 mr-1" />Aprovar Esta
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Response Sub-Dialog */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Adicionar Cotação</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Fornecedor/Agência</Label><Input value={respForm.supplier_name} onChange={e => setRespForm(p => ({ ...p, supplier_name: e.target.value }))} placeholder="CVC Corporate" /></div>
              <div><Label>Preço Total (USD)</Label><Input type="number" value={respForm.price_usd} onChange={e => setRespForm(p => ({ ...p, price_usd: e.target.value }))} /></div>
              <div><Label>Descrição</Label><Input value={respForm.description} onChange={e => setRespForm(p => ({ ...p, description: e.target.value }))} placeholder="Voo direto GRU-SIN, LATAM LA8084" /></div>
              {request.request_type === "flight" && (
                <div><Label>Cia Aérea</Label><Input value={respForm.airline} onChange={e => setRespForm(p => ({ ...p, airline: e.target.value }))} placeholder="LATAM" /></div>
              )}
              <div><Label>Válido até</Label><Input type="date" value={respForm.valid_until} onChange={e => setRespForm(p => ({ ...p, valid_until: e.target.value }))} /></div>
              <Button onClick={handleAddResponse} disabled={!respForm.supplier_name || !respForm.price_usd || submitResponse.isPending} className="w-full">
                {submitResponse.isPending ? "Registrando..." : "Registrar Cotação (auto-score)"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
