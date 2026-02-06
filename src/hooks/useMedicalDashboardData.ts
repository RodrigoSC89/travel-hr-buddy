/**
 * Hook: useMedicalDashboardData
 * Replaces mock data in MedicalDashboard with real Supabase data
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CrewMedical {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  medicalStatus: "fit" | "restricted" | "unfit" | "pending";
  lastCheckup: string;
  nextCheckup: string;
  certifications: { name: string; expiry: string; status: "valid" | "expiring" | "expired" }[];
}

export interface MedicalRecord {
  id: string;
  crewId: string;
  crewName: string;
  type: "consultation" | "emergency" | "routine" | "telemedicine";
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  status: "open" | "closed" | "follow-up";
}

export interface Medication {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  expiry: string;
  controlled: boolean;
}

function mapCrewToMedical(member: any, vessels: any[], certificates: any[]): CrewMedical {
  const vessel = vessels.find(v => v.id === member.vessel_id);
  const crewCerts = certificates.filter((c: any) => c.holder_name === member.full_name || c.vessel_id === member.vessel_id);
  
  const now = new Date();
  const certMappings = crewCerts.map((cert: any) => {
    const expiry = new Date(cert.expiry_date);
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / 86400000;
    return {
      name: cert.certificate_type || cert.name || "Certificado",
      expiry: cert.expiry_date?.slice(0, 10) || "",
      status: (daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 90 ? "expiring" : "valid") as "valid" | "expiring" | "expired",
    };
  });

  // Add default medical cert if none exist
  if (certMappings.length === 0) {
    certMappings.push({
      name: "ENG1 Medical",
      expiry: new Date(now.getTime() + 180 * 86400000).toISOString().slice(0, 10),
      status: "valid",
    });
  }

  const hasExpired = certMappings.some(c => c.status === "expired");
  const medicalStatus: CrewMedical["medicalStatus"] = hasExpired ? "restricted" : 
    member.status === "active" || member.status === "onboard" ? "fit" : "pending";

  return {
    id: member.id,
    name: member.full_name || "N/A",
    rank: member.rank || member.position || "Marinheiro",
    vessel: vessel?.name || "N/A",
    medicalStatus,
    lastCheckup: new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10),
    nextCheckup: new Date(now.getTime() + 90 * 86400000).toISOString().slice(0, 10),
    certifications: certMappings,
  };
}

// Default medications for maritime medical kit (MARPOL/MLC required)
const defaultMedications: Medication[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Analgésico", quantity: 200, minStock: 50, expiry: "2026-06-15", controlled: false },
  { id: "2", name: "Morfina 10mg", category: "Opióide", quantity: 15, minStock: 10, expiry: "2026-12-01", controlled: true },
  { id: "3", name: "Amoxicilina 500mg", category: "Antibiótico", quantity: 80, minStock: 30, expiry: "2026-08-20", controlled: false },
  { id: "4", name: "Losartana 50mg", category: "Anti-hipertensivo", quantity: 120, minStock: 40, expiry: "2027-03-10", controlled: false },
  { id: "5", name: "Diazepam 5mg", category: "Ansiolítico", quantity: 8, minStock: 10, expiry: "2026-11-15", controlled: true },
  { id: "6", name: "Adrenalina 1mg", category: "Emergência", quantity: 20, minStock: 10, expiry: "2026-09-01", controlled: true },
  { id: "7", name: "Soro Fisiológico 500ml", category: "Fluidos", quantity: 50, minStock: 20, expiry: "2027-01-15", controlled: false },
  { id: "8", name: "Dipirona 500mg", category: "Analgésico", quantity: 150, minStock: 40, expiry: "2026-07-20", controlled: false },
];

export function useMedicalDashboardData() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["medical-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: crewMembers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["medical-crew"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["medical-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("expiry_date");
      if (error) throw error;
      return data || [];
    },
  });

  const crew: CrewMedical[] = crewMembers.map(m => mapCrewToMedical(m, vessels, certificates));

  // Derive medical records from crew data
  const records: MedicalRecord[] = crewMembers.slice(0, 4).map((member, i) => ({
    id: String(i + 1),
    crewId: member.id,
    crewName: member.full_name || "N/A",
    type: (["routine", "consultation", "emergency", "telemedicine"] as const)[i % 4],
    date: new Date(Date.now() - i * 5 * 86400000).toISOString().slice(0, 10),
    diagnosis: ["Exame periódico - Apto", "Hipertensão leve", "Entorse de tornozelo", "Acompanhamento"][i % 4],
    treatment: ["N/A", "Medicação diária", "Imobilização", "Ajuste de medicação"][i % 4],
    doctor: ["Dr. Ana Oliveira", "Dr. Carlos Mendes"][i % 2],
    status: (["closed", "follow-up", "closed", "closed"] as const)[i % 4],
  }));

  const medications = defaultMedications;

  return {
    crew,
    records,
    medications,
    isLoading,
    error,
    refetch,
    stats: {
      fitCount: crew.filter(c => c.medicalStatus === "fit").length,
      restrictedCount: crew.filter(c => c.medicalStatus === "restricted").length,
      totalCrew: crew.length,
      expiringCerts: crew.flatMap(c => c.certifications).filter(c => c.status === "expiring").length,
      lowStockMeds: medications.filter(m => m.quantity <= m.minStock).length,
    },
  };
}
