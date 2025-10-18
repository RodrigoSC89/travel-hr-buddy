import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SGSOActionPlan {
  id: string;
  incident_id: string;
  vessel_id: string;
  correction_action: string | null;
  prevention_action: string | null;
  recommendation_action: string | null;
  status: "aberto" | "em_andamento" | "resolvido";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  incident: {
    id: string;
    title: string | null;
    incident_date: string;
    severity: string;
    sgso_category: string | null;
    sgso_risk_level: string | null;
    description: string | null;
  };
}

export interface SGSOHistoryResponse {
  success: boolean;
  data?: SGSOActionPlan[];
  error?: string;
}

/**
 * GET /api/sgso/history/[vesselId]
 * 
 * Retrieves complete action plan history for a specific vessel
 * Returns chronologically ordered results (newest first)
 * Includes incident details joined with action plans
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SGSOHistoryResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { vesselId } = req.query;

    // Validate vessel ID parameter
    if (!vesselId || typeof vesselId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing vessel ID parameter",
      });
    }

    // Trim and validate vessel ID is not empty
    const cleanVesselId = vesselId.trim();
    if (cleanVesselId.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Vessel ID cannot be empty",
      });
    }

    // Perform optimized single-query join between action plans and incidents
    const { data, error } = await supabase
      .from("sgso_action_plans")
      .select(
        `
        id,
        incident_id,
        vessel_id,
        correction_action,
        prevention_action,
        recommendation_action,
        status,
        approved_by,
        approved_at,
        created_at,
        updated_at,
        incident:dp_incidents!incident_id (
          id,
          title,
          incident_date,
          severity,
          sgso_category,
          sgso_risk_level,
          description
        )
      `
      )
      .eq("vessel_id", cleanVesselId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching SGSO history:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch action plan history",
      });
    }

    // Transform data to match expected format (flatten incident object)
    const transformedData: SGSOActionPlan[] = (data || []).map((item: any) => ({
      id: item.id,
      incident_id: item.incident_id,
      vessel_id: item.vessel_id,
      correction_action: item.correction_action,
      prevention_action: item.prevention_action,
      recommendation_action: item.recommendation_action,
      status: item.status,
      approved_by: item.approved_by,
      approved_at: item.approved_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      incident: Array.isArray(item.incident) ? item.incident[0] : item.incident,
    }));

    return res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Unexpected error in SGSO history endpoint:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
