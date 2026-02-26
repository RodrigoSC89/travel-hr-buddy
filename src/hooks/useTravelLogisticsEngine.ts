/**
 * NAUTI ONE — Internal Travel Logistics Engine Hook
 * Catálogo de rotas, hotéis homologados, transfers e motor de cotação
 * 100% independente de APIs externas
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";

// ═══ TYPES ═══

export interface FlightRoute {
  id: string;
  origin_city: string;
  origin_iata: string | null;
  destination_city: string;
  destination_iata: string | null;
  preferred_airlines: string[];
  avg_price_usd: number | null;
  min_price_usd: number | null;
  max_price_usd: number | null;
  avg_duration_hours: number | null;
  frequency: string;
  notes: string | null;
  is_active: boolean;
}

export interface ApprovedHotel {
  id: string;
  hotel_name: string;
  city: string;
  country: string;
  port_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  star_rating: number | null;
  daily_rate_usd: number | null;
  max_daily_rate_usd: number | null;
  breakfast_included: boolean;
  airport_shuttle: boolean;
  port_distance_km: number | null;
  airport_distance_km: number | null;
  internal_rating: number;
  total_reviews: number;
  contract_valid_until: string | null;
  is_active: boolean;
  rank_policy: Record<string, number>;
}

export interface TransferProvider {
  id: string;
  company_name: string;
  city: string;
  country: string;
  port_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  vehicle_types: string[];
  base_rate_usd: number | null;
  rate_per_km_usd: number | null;
  airport_to_port_rate_usd: number | null;
  hotel_to_port_rate_usd: number | null;
  internal_rating: number;
  total_trips: number;
  is_active: boolean;
}

export interface TransferRoute {
  id: string;
  provider_id: string;
  route_name: string;
  origin_type: string;
  origin_name: string;
  destination_type: string;
  destination_name: string;
  fixed_price_usd: number | null;
  estimated_duration_min: number | null;
  distance_km: number | null;
  is_active: boolean;
}

export interface QuotationRequest {
  id: string;
  request_number: string;
  request_type: string;
  crew_member_id: string | null;
  crew_member_name: string | null;
  vessel_id: string | null;
  origin_city: string | null;
  destination_city: string | null;
  departure_date: string | null;
  return_date: string | null;
  is_one_way: boolean;
  passengers: number;
  cabin_class: string;
  hotel_city: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  rooms_needed: number;
  transfer_city: string | null;
  transfer_date: string | null;
  transfer_origin: string | null;
  transfer_destination: string | null;
  max_budget_usd: number | null;
  urgency: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface QuotationResponse {
  id: string;
  request_id: string;
  supplier_name: string;
  price_usd: number;
  description: string | null;
  airline: string | null;
  hotel_name: string | null;
  transfer_company: string | null;
  ai_score: number | null;
  price_score: number | null;
  convenience_score: number | null;
  reliability_score: number | null;
  is_recommended: boolean;
  is_selected: boolean;
  valid_until: string | null;
  created_at: string;
}

// ═══ SCORING ALGORITHM ═══

export function calculateQuotationScore(
  response: Partial<QuotationResponse>,
  request: Partial<QuotationRequest>,
  supplierRating: number = 5
): { total: number; price: number; convenience: number; reliability: number } {
  const budget = request.max_budget_usd || 5000;
  const price = response.price_usd || 0;

  // Price score: 100 if at/under budget, scales down linearly
  const priceScore = price <= budget
    ? Math.min(100, 100 - ((price / budget) * 30)) // cheaper = better, but floor at 70
    : Math.max(0, 100 - ((price - budget) / budget) * 200); // over budget penalized hard

  // Convenience score: based on duration, direct flights, breakfast, shuttle
  let convScore = 50; // base
  if (response.airline) convScore += 15; // has specific airline info
  if (response.description?.toLowerCase().includes('direto') || response.description?.toLowerCase().includes('direct')) convScore += 20;
  if (response.description?.toLowerCase().includes('café') || response.description?.toLowerCase().includes('breakfast')) convScore += 10;
  convScore = Math.min(100, convScore);

  // Reliability score: based on supplier track record
  const reliabilityScore = Math.min(100, (supplierRating / 10) * 100);

  // Weighted total
  const total = Math.round(priceScore * 0.45 + convScore * 0.25 + reliabilityScore * 0.30);

  return {
    total: Math.min(100, Math.max(0, total)),
    price: Math.round(priceScore),
    convenience: Math.round(convScore),
    reliability: Math.round(reliabilityScore),
  };
}

// ═══ HOOKS ═══

export function useFlightRoutes() {
  return useQuery({
    queryKey: ["travel-flight-routes"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("travel_flight_routes")
        .select("*").eq("is_active", true).order("origin_city");
      if (error) throw error;
      return (data || []) as FlightRoute[];
    },
  });
}

export function useApprovedHotels(city?: string) {
  return useQuery({
    queryKey: ["travel-approved-hotels", city],
    queryFn: async () => {
      let q = fromUntyped("travel_approved_hotels")
        .select("*").eq("is_active", true).order("internal_rating", { ascending: false });
      if (city) q = q.ilike("city", `%${city}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ApprovedHotel[];
    },
  });
}

export function useTransferProviders(city?: string) {
  return useQuery({
    queryKey: ["travel-transfer-providers", city],
    queryFn: async () => {
      let q = fromUntyped("travel_transfer_providers")
        .select("*").eq("is_active", true).order("internal_rating", { ascending: false });
      if (city) q = q.ilike("city", `%${city}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as TransferProvider[];
    },
  });
}

export function useTransferRoutes(providerId?: string) {
  return useQuery({
    queryKey: ["travel-transfer-routes", providerId],
    queryFn: async () => {
      let q = fromUntyped("travel_transfer_routes")
        .select("*").eq("is_active", true);
      if (providerId) q = q.eq("provider_id", providerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as TransferRoute[];
    },
    enabled: !providerId || providerId.length > 0,
  });
}

export function useQuotationRequests() {
  return useQuery({
    queryKey: ["travel-quotation-requests"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("travel_quotation_requests")
        .select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data || []) as QuotationRequest[];
    },
  });
}

export function useQuotationResponses(requestId?: string) {
  return useQuery({
    queryKey: ["travel-quotation-responses", requestId],
    queryFn: async () => {
      let q = fromUntyped("travel_quotation_responses")
        .select("*").order("ai_score", { ascending: false });
      if (requestId) q = q.eq("request_id", requestId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as QuotationResponse[];
    },
    enabled: !!requestId,
  });
}

export function useTravelBookings() {
  return useQuery<Array<Record<string, unknown>>>({
    queryKey: ["travel-bookings"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("travel_bookings")
        .select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data || []) as Array<Record<string, unknown>>;
    },
  });
}

// ═══ MUTATIONS ═══

export function useCreateFlightRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (route: Partial<FlightRoute>) => {
      const { error } = await fromUntyped("travel_flight_routes").insert(route);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Rota aérea cadastrada"); qc.invalidateQueries({ queryKey: ["travel-flight-routes"] }); },
    onError: () => toast.error("Erro ao cadastrar rota"),
  });
}

export function useCreateApprovedHotel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hotel: Partial<ApprovedHotel>) => {
      const { error } = await fromUntyped("travel_approved_hotels").insert(hotel);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Hotel homologado cadastrado"); qc.invalidateQueries({ queryKey: ["travel-approved-hotels"] }); },
    onError: () => toast.error("Erro ao cadastrar hotel"),
  });
}

export function useCreateTransferProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider: Partial<TransferProvider>) => {
      const { error } = await fromUntyped("travel_transfer_providers").insert(provider);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Empresa de transfer cadastrada"); qc.invalidateQueries({ queryKey: ["travel-transfer-providers"] }); },
    onError: () => toast.error("Erro ao cadastrar transfer"),
  });
}

export function useCreateQuotationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: Partial<QuotationRequest>) => {
      const { data, error } = await fromUntyped("travel_quotation_requests")
        .insert({ ...req, request_number: 'TRQ-AUTO' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Solicitação de cotação criada"); qc.invalidateQueries({ queryKey: ["travel-quotation-requests"] }); },
    onError: () => toast.error("Erro ao criar solicitação"),
  });
}

export function useSubmitQuotationResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (resp: Partial<QuotationResponse> & { request?: Partial<QuotationRequest> }) => {
      const { request, ...responseData } = resp;
      // Auto-calculate score
      const scores = calculateQuotationScore(responseData, request || {});
      const { error } = await fromUntyped("travel_quotation_responses").insert({
        ...responseData,
        ai_score: scores.total,
        price_score: scores.price,
        convenience_score: scores.convenience,
        reliability_score: scores.reliability,
        is_recommended: scores.total >= 75,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Cotação registrada com scoring automático"); qc.invalidateQueries({ queryKey: ["travel-quotation-responses"] }); },
    onError: () => toast.error("Erro ao registrar cotação"),
  });
}

export function useSelectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ responseId, requestId }: { responseId: string; requestId: string }) => {
      // Mark response as selected
      const { error: e1 } = await fromUntyped("travel_quotation_responses")
        .update({ is_selected: true, selected_at: new Date().toISOString() }).eq("id", responseId);
      if (e1) throw e1;
      // Update request status
      const { error: e2 } = await fromUntyped("travel_quotation_requests")
        .update({ status: "approved" }).eq("id", requestId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Cotação aprovada!");
      qc.invalidateQueries({ queryKey: ["travel-quotation-requests"] });
      qc.invalidateQueries({ queryKey: ["travel-quotation-responses"] });
    },
    onError: () => toast.error("Erro ao aprovar cotação"),
  });
}
