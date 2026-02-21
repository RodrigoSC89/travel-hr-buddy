/**
 * Medical Infirmary Data Hook - Full Backend Integration
 * PATCH MEDICAL-3.0 - Real Supabase tables: medical_consultations, medical_supplies, medication_dispensations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";

export interface MedicalConsultation {
  id: string;
  patient_id: string | null;
  patient_name: string;
  reason: string;
  diagnosis: string | null;
  treatment: string | null;
  doctor_name: string | null;
  consultation_date: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  name: string;
  active_ingredient: string | null;
  quantity: number;
  min_stock: number;
  unit: string;
  batch_number: string | null;
  expiry_date: string | null;
  status: "ok" | "low" | "critical" | "expired";
  location: string | null;
  created_at: string;
}

export interface MedicalExam {
  id: string;
  crew_member_id: string | null;
  crew_member_name: string;
  exam_type: string;
  scheduled_date: string;
  status: "scheduled" | "completed" | "cancelled";
  result: string | null;
  vessel_name: string | null;
  notes: string | null;
  created_at: string;
}

export function useMedicalInfirmaryData() {
  const queryClient = useQueryClient();

  // Fetch crew health status
  const { data: crewHealth = [], isLoading: crewHealthLoading } = useQuery({
    queryKey: ["medical-crew-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, status")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch certificates for medical tracking
  const { data: medicalCertificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["medical-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .ilike("certificate_type", "%medical%")
        .order("expiry_date", { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch real consultations from medical_consultations table
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery({
    queryKey: ["medical-consultations"],
    queryFn: async (): Promise<MedicalConsultation[]> => {
      const { data, error } = await supabase
        .from("medical_consultations")
        .select("id, crew_member_id, crew_member_name, consultation_type, chief_complaint, diagnosis, treatment, attending_officer, status, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((c): MedicalConsultation => ({
        id: c.id,
        patient_id: c.crew_member_id,
        patient_name: c.crew_member_name || "Paciente",
        reason: c.chief_complaint || c.consultation_type || "Consulta",
        diagnosis: c.diagnosis,
        treatment: c.treatment,
        doctor_name: c.attending_officer,
        consultation_date: c.created_at || new Date().toISOString(),
        status: c.status === "completed" ? "completed" : c.status === "cancelled" ? "cancelled" : c.status === "in_progress" ? "in_progress" : "scheduled",
        notes: c.notes,
        created_at: c.created_at || new Date().toISOString(),
      }));
    },
    staleTime: 15000,
  });

  // Fetch real medications from medical_supplies table
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["medical-medications"],
    queryFn: async (): Promise<Medication[]> => {
      const { data, error } = await supabase
        .from("medical_supplies")
        .select("id, name, category, quantity, min_stock, unit, expiry_date, batch_number, location, status, created_at")
        .order("name", { ascending: true })
        .limit(200);

      if (error) throw error;

      return (data || []).map((m): Medication => {
        const qty = m.quantity ?? 0;
        // Determine status based on stock levels and expiry
        let computedStatus: Medication["status"] = "ok";
        if (m.expiry_date && new Date(m.expiry_date) < new Date()) {
          computedStatus = "expired";
        } else if (qty <= 0) {
          computedStatus = "critical";
        } else if (m.min_stock && qty <= m.min_stock) {
          computedStatus = qty <= m.min_stock * 0.5 ? "critical" : "low";
        }

        return {
          id: m.id,
          name: m.name,
          active_ingredient: m.category,
          quantity: qty,
          min_stock: m.min_stock || 10,
          unit: m.unit || "un",
          batch_number: m.batch_number,
          expiry_date: m.expiry_date,
          status: (m.status as Medication["status"]) || computedStatus,
          location: m.location,
          created_at: m.created_at || new Date().toISOString(),
        };
      });
    },
    staleTime: 15000,
  });

  // Fetch exams from crew_certifications with medical types
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["medical-exams"],
    queryFn: async (): Promise<MedicalExam[]> => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, expiry_date, status, notes, created_at")
        .or("certification_type.ilike.%medical%,certification_type.ilike.%exam%,certification_type.ilike.%health%,certification_name.ilike.%medical%,certification_name.ilike.%saúde%")
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (error) throw error;

      // Get crew member names
      const crewIds = [...new Set((data || []).map(d => d.crew_member_id).filter(Boolean))];
      let crewMap: Record<string, { full_name: string; vessel_id: string | null }> = {};

      if (crewIds.length > 0) {
        const { data: crewData } = await supabase
          .from("crew_members")
          .select("id, full_name, vessel_id")
          .in("id", crewIds);

        (crewData || []).forEach((c) => {
          crewMap[c.id] = { full_name: c.full_name, vessel_id: c.vessel_id };
        });
      }

      // Get vessel names
      const vesselIds = [...new Set(Object.values(crewMap).map(c => c.vessel_id).filter(Boolean))];
      let vesselMap: Record<string, string> = {};

      if (vesselIds.length > 0) {
        const { data: vessels } = await supabase
          .from("vessels")
          .select("id, name")
          .in("id", vesselIds as string[]);

        (vessels || []).forEach((v) => {
          vesselMap[v.id] = v.name;
        });
      }

      return (data || []).map((e) => {
        const crew = crewMap[e.crew_member_id];
        return {
          id: e.id,
          crew_member_id: e.crew_member_id,
          crew_member_name: crew?.full_name || "Tripulante",
          exam_type: e.certification_name || e.certification_type || "Exame Médico",
          scheduled_date: e.expiry_date || e.created_at,
          status: e.status === "valid" || e.status === "active" ? "completed" : e.status === "expired" ? "cancelled" : "scheduled",
          result: e.status === "valid" ? "Apto" : null,
          vessel_name: crew?.vessel_id ? vesselMap[crew.vessel_id] || null : null,
          notes: e.notes,
          created_at: e.created_at,
        };
      });
    },
    staleTime: 15000,
  });

  // Create consultation (real Supabase insert)
  const createConsultation = useMutation({
    mutationFn: async (data: Partial<MedicalConsultation>) => {
      const { data: result, error } = await supabase
        .from("medical_consultations")
        .insert({
          crew_member_name: data.patient_name || "Paciente",
          consultation_type: "general",
          chief_complaint: data.reason || "",
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          attending_officer: data.doctor_name,
          status: data.status || "scheduled",
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-consultations"] });
      toast.success("Consulta registrada com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar consulta: ${error.message}`);
    },
  });

  // Dispense medication (real insert into medication_dispensations)
  const dispenseMedication = useMutation({
    mutationFn: async ({ medicationId, quantity, patientName }: { 
      medicationId: string; 
      quantity: number; 
      patientName: string;
    }) => {
      // Find medication info
      const med = medications.find(m => m.id === medicationId);

      const { error: dispenseError } = await supabase
        .from("medication_dispensations")
        .insert({
          supply_id: medicationId,
          medication_name: med?.name || "Medicamento",
          quantity_dispensed: quantity,
          unit: med?.unit || "un",
          batch_number: med?.batch_number,
          reason: `Dispensado para ${patientName}`,
          dispensed_by_name: "Oficial Médico",
        });

      if (dispenseError) throw dispenseError;

      // Update stock quantity in medical_supplies
      if (med) {
        const newQty = Math.max(0, med.quantity - quantity);
        const { error: updateError } = await supabase
          .from("medical_supplies")
          .update({ quantity: newQty })
          .eq("id", medicationId);

        if (updateError) throw updateError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-medications"] });
      toast.success("Medicamento dispensado com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao dispensar medicamento: ${error.message}`);
    },
  });

  // Schedule exam (create crew_certification entry)
  const scheduleExam = useMutation({
    mutationFn: async (data: Partial<MedicalExam>) => {
      const insertData: Record<string, unknown> = {
        certification_name: data.exam_type || "Exame Médico",
        certification_type: "medical_exam",
        expiry_date: data.scheduled_date,
        status: "pending",
        notes: data.notes,
      };
      if (data.crew_member_id) {
        insertData.crew_member_id = data.crew_member_id;
      }
      const { data: result, error } = await fromUntyped("crew_certifications")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-exams"] });
      toast.success("Exame agendado com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao agendar exame: ${error.message}`);
    },
  });

  // Calculate health metrics
  const healthMetrics = {
    totalCrew: crewHealth.length,
    fitForService: crewHealth.filter((c) => c.status === "active").length,
    consultationsThisMonth: consultations.length,
    pendingExams: exams.filter((e) => e.status === "scheduled").length,
    criticalMedications: medications.filter((m) => m.status === "critical").length,
    lowStockMedications: medications.filter((m) => m.status === "low").length,
    fitnessRate: crewHealth.length > 0 
      ? Math.round((crewHealth.filter((c) => c.status === "active").length / crewHealth.length) * 100)
      : 0,
    totalMedications: medications.length,
    expiringCertificates: medicalCertificates.filter((c) => {
      if (!c.expiry_date) return false;
      const expiry = new Date(c.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry <= thirtyDaysFromNow;
    }).length,
  };

  return {
    // Data
    consultations,
    medications,
    exams,
    crewHealth,
    medicalCertificates,
    metrics: healthMetrics,
    
    // Loading states
    isLoading: crewHealthLoading || certificatesLoading,
    consultationsLoading,
    medicationsLoading,
    examsLoading,
    crewHealthLoading,
    certificatesLoading,
    
    // Mutations
    createConsultation,
    dispenseMedication,
    scheduleExam,
  };
}

export default useMedicalInfirmaryData;
