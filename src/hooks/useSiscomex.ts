import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SiscomexTransmission {
  id: string;
  vessel_id: string;
  voyage_id?: string;
  transmission_type: "entry" | "exit" | "manifest" | "crew_list" | "cargo_declaration";
  status: "pending" | "processing" | "sent" | "acknowledged" | "error" | "cancelled";
  payload: Record<string, unknown>;
  siscomex_protocol?: string;
  siscomex_response?: Record<string, unknown>;
  error_message?: string;
  sent_at?: string;
  acknowledged_at?: string;
  created_at: string;
}

interface CreateTransmissionPayload {
  vessel_id: string;
  voyage_id?: string;
  transmission_type: SiscomexTransmission["transmission_type"];
  data: {
    imo_number?: string;
    mmsi?: string;
    vessel_name?: string;
    flag_state?: string;
    gross_tonnage?: number;
    port_code?: string;
    arrival_date?: string;
    departure_date?: string;
    crew_list?: Array<{
      name: string;
      nationality: string;
      passport_number: string;
      position: string;
    }>;
    cargo_manifest?: Array<{
      description: string;
      quantity: number;
      unit: string;
      ncm_code: string;
    }>;
  };
}

export function useSiscomex() {
  const [isLoading, setIsLoading] = useState(false);
  const [transmissions, setTransmissions] = useState<SiscomexTransmission[]>([]);

  const callSiscomexAPI = useCallback(async (operation: string, payload?: Record<string, unknown>, transmission_id?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    const response = await supabase.functions.invoke("siscomex-api", {
      body: { operation, payload, transmission_id },
    });

    if (response.error) throw new Error(response.error.message);
    if (!response.data.success) throw new Error(response.data.error);

    return response.data;
  }, []);

  const createTransmission = useCallback(async (payload: CreateTransmissionPayload) => {
    setIsLoading(true);
    try {
      const result = await callSiscomexAPI("create_transmission", payload as unknown as Record<string, unknown>);
      toast.success("Transmissão criada", {
        description: `ID: ${result.transmission_id}`,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar transmissão";
      toast.error("Erro SISCOMEX", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSiscomexAPI]);

  const sendTransmission = useCallback(async (transmissionId: string) => {
    setIsLoading(true);
    try {
      const result = await callSiscomexAPI("send_transmission", undefined, transmissionId);
      toast.success("Transmissão enviada", {
        description: `Protocolo: ${result.protocol}`,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar";
      toast.error("Erro SISCOMEX", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSiscomexAPI]);

  const checkStatus = useCallback(async (transmissionId: string) => {
    try {
      return await callSiscomexAPI("check_status", undefined, transmissionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao verificar status";
      toast.error("Erro", { description: message });
      throw error;
    }
  }, [callSiscomexAPI]);

  const listTransmissions = useCallback(async (filters?: { status?: string; vessel_id?: string; limit?: number }) => {
    setIsLoading(true);
    try {
      const result = await callSiscomexAPI("list_transmissions", filters);
      setTransmissions(result.transmissions || []);
      return result.transmissions;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSiscomexAPI]);

  const cancelTransmission = useCallback(async (transmissionId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const result = await callSiscomexAPI("cancel_transmission", { reason }, transmissionId);
      toast.success("Transmissão cancelada");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cancelar";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSiscomexAPI]);

  return {
    isLoading,
    transmissions,
    createTransmission,
    sendTransmission,
    checkStatus,
    listTransmissions,
    cancelTransmission,
  };
}
