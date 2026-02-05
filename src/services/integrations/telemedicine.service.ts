/**
 * Telemedicine Integration Service
 * Remote medical consultation and TMAS integration
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface TelemedicineConsultation {
  id: string;
  patientId: string;
  patientName: string;
  vesselId: string;
  vesselName: string;
  type: "emergency" | "routine" | "follow_up";
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: MedicalPrescription[];
  notes?: string;
  priority: "low" | "medium" | "high" | "critical";
  videoCallUrl?: string;
}

export interface MedicalPrescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface TMASAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  position: { lat: number; lon: number };
  alertType: "medical_emergency" | "evacuation_needed" | "consultation_request";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  patientInfo: {
    age: number;
    gender: string;
    symptoms: string[];
    vitalSigns?: {
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    };
  };
  createdAt: string;
  respondedAt?: string;
  status: "pending" | "acknowledged" | "in_progress" | "resolved";
}

/**
 * Request a telemedicine consultation
 */
export async function requestConsultation(
  patientId: string,
  vesselId: string,
  symptoms: string[],
  type: TelemedicineConsultation["type"] = "routine",
  priority: TelemedicineConsultation["priority"] = "medium"
): Promise<TelemedicineConsultation | null> {
  try {
    const { data, error } = await supabase.functions.invoke("telemedicine", {
      body: {
        action: "request_consultation",
        patientId,
        vesselId,
        symptoms,
        type,
        priority,
      },
    });

    if (error) throw error;
    
    logger.info("[Telemedicine] Consultation requested", { patientId, vesselId });
    return data?.consultation || null;
  } catch (err) {
    logger.error("[Telemedicine] Failed to request consultation", { error: err });
    return null;
  }
}

/**
 * Get active consultations for a vessel
 */
export async function getVesselConsultations(
  vesselId: string
): Promise<TelemedicineConsultation[]> {
  try {
    const { data, error } = await supabase
      .from("medical_consultations")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map((c): TelemedicineConsultation => {
      // Parse symptoms from chief_complaint or other fields
      const symptomsRaw = c.symptoms;
      let symptoms: string[] = [];
      if (Array.isArray(symptomsRaw)) {
        symptoms = symptomsRaw.map(String);
      } else if (typeof symptomsRaw === 'string') {
        symptoms = [symptomsRaw];
      } else if (c.chief_complaint) {
        symptoms = [c.chief_complaint];
      }

      // Map consultation type
      let type: TelemedicineConsultation["type"] = "routine";
      if (c.consultation_type === "emergency") type = "emergency";
      else if (c.consultation_type === "follow_up") type = "follow_up";

      // Map status
      let status: TelemedicineConsultation["status"] = "pending";
      if (c.status === "scheduled") status = "scheduled";
      else if (c.status === "in_progress") status = "in_progress";
      else if (c.status === "completed") status = "completed";
      else if (c.status === "cancelled") status = "cancelled";

      // Use crew_member_id from the table instead of patient_id
      const patientId = c.crew_member_id || "";
      
      return {
        id: c.id,
        patientId,
        patientName: "Paciente", // Would need to join with crew_members to get name
        vesselId: c.vessel_id || "",
        vesselName: "",
        type,
        status,
        scheduledAt: c.created_at || undefined,
        startedAt: undefined,
        completedAt: undefined,
        doctorId: c.attending_officer_id || undefined,
        doctorName: c.attending_officer || undefined,
        specialty: undefined,
        symptoms,
        diagnosis: c.diagnosis || undefined,
        prescription: undefined,
        notes: c.notes || undefined,
        priority: "medium",
        videoCallUrl: undefined,
      };
    });
  } catch (err) {
    logger.error("[Telemedicine] Failed to fetch consultations", { vesselId, error: err });
    return [];
  }
}

/**
 * Send TMAS emergency alert
 */
export async function sendTMASAlert(
  vesselId: string,
  alertType: TMASAlert["alertType"],
  description: string,
  patientInfo: TMASAlert["patientInfo"],
  position: { lat: number; lon: number }
): Promise<TMASAlert | null> {
  try {
    const { data, error } = await supabase.functions.invoke("telemedicine", {
      body: {
        action: "tmas_alert",
        vesselId,
        alertType,
        description,
        patientInfo,
        position,
      },
    });

    if (error) throw error;
    
    logger.info("[TMAS] Emergency alert sent", { vesselId, alertType });
    return data?.alert || null;
  } catch (err) {
    logger.error("[TMAS] Failed to send alert", { vesselId, error: err });
    return null;
  }
}

/**
 * Get available doctors for consultation
 */
export async function getAvailableDoctors(
  specialty?: string
): Promise<Array<{ id: string; name: string; specialty: string; available: boolean }>> {
  try {
    const { data, error } = await supabase.functions.invoke("telemedicine", {
      body: { action: "available_doctors", specialty },
    });

    if (error) throw error;
    return data?.doctors || [];
  } catch (err) {
    logger.error("[Telemedicine] Failed to fetch available doctors", { error: err });
    return [];
  }
}

/**
 * Start video call for consultation
 */
export async function startVideoCall(
  consultationId: string
): Promise<{ url: string; token: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("telemedicine", {
      body: { action: "start_video_call", consultationId },
    });

    if (error) throw error;
    return data?.videoCall || null;
  } catch (err) {
    logger.error("[Telemedicine] Failed to start video call", { consultationId, error: err });
    return null;
  }
}

/**
 * Check telemedicine service availability
 */
export async function checkTelemedicineAvailability(): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("telemedicine", {
      body: { action: "health" },
    });
    return !error;
  } catch {
    return false;
  }
}

export default {
  requestConsultation,
  getVesselConsultations,
  sendTMASAlert,
  getAvailableDoctors,
  startVideoCall,
  checkTelemedicineAvailability,
};
