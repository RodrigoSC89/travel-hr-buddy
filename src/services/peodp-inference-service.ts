/**
 * PEO-DP Inference Service
 * AI-powered inference engine for PEO-DP (Procedure for Equipment Operation - Dynamic Positioning)
 * Provides recommendations based on vessel performance, crew data, and operational context
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface VesselPerformanceData {
  vessel_id: string;
  dp_class: string;
  operational_hours: number;
  incidents_count: number;
  avg_positioning_accuracy: number;
  fuel_efficiency: number;
  maintenance_status: string;
}

interface CrewCompetencyData {
  vessel_id: string;
  dp_certified_crew: number;
  total_crew: number;
  avg_experience_years: number;
  recent_training_completion: number;
  certification_expiry_soon: number;
}

interface OperationalContext {
  weather_conditions: "favorable" | "moderate" | "challenging" | "severe";
  sea_state: number; // 0-9 Douglas scale
  operation_type: "drilling" | "construction" | "dive_support" | "transfer" | "other";
  critical_operation: boolean;
  proximity_to_structures: "close" | "medium" | "far";
}

interface InferenceResult {
  recommendation_type: "training" | "maintenance" | "operational" | "crew" | "safety";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  suggested_actions: string[];
  risk_level: "critical" | "high" | "medium" | "low";
  estimated_impact: string;
}

interface PEODPPlan {
  vessel_id: string;
  dp_class: string;
  operation_type: string;
  crew_composition: any;
  training_requirements: any;
  maintenance_schedule: any;
  emergency_procedures: any;
  status: "draft" | "active" | "under_review" | "archived";
}

export class PEODPInferenceService {
  /**
   * Analyze vessel and crew data to generate PEO-DP recommendations
   */
  static async generateRecommendations(
    vesselId: string,
    context?: OperationalContext
  ): Promise<InferenceResult[]> {
    try {
      // Fetch vessel performance data
      const performanceData = await this.fetchVesselPerformance(vesselId);
      
      // Fetch crew competency data
      const crewData = await this.fetchCrewCompetency(vesselId);
      
      // Fetch existing PEO-DP plan
      const peodpPlan = await this.fetchPEODPPlan(vesselId);
      
      // Generate recommendations based on all data
      const recommendations: InferenceResult[] = [];
      
      // Analyze crew competency
      recommendations.push(...this.analyzeCrewCompetency(crewData, context));
      
      // Analyze maintenance needs
      recommendations.push(...this.analyzeMaintenanceNeeds(performanceData, context));
      
      // Analyze training requirements
      recommendations.push(...this.analyzeTrainingNeeds(crewData, performanceData));
      
      // Analyze operational readiness
      recommendations.push(...this.analyzeOperationalReadiness(
        performanceData,
        crewData,
        peodpPlan,
        context
      ));
      
      // Sort by priority and confidence
      const sortedRecommendations = recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.confidence - a.confidence;
      });
      
      // Log inference for audit trail
      await this.logInference(vesselId, sortedRecommendations);
      
      return sortedRecommendations;
    } catch (error) {
      logger.error("Error generating recommendations", error as Error, { vesselId });
      throw new Error("Failed to generate PEO-DP recommendations");
    }
  }

  /**
   * Fetch vessel performance metrics
   */
  private static async fetchVesselPerformance(vesselId: string): Promise<VesselPerformanceData> {
    const { data: vessel, error: vesselError } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vesselId)
      .single();

    if (vesselError) throw vesselError;

    // Fetch performance metrics
    const { data: metrics } = await supabase
      .from("vessel_performance_metrics" as any)
      .select("*")
      .eq("vessel_id", vesselId)
      .order("recorded_at", { ascending: false })
      .limit(30);

    // Fetch incident history
    const { data: incidents } = await supabase
      .from("incidents" as any)
      .select("id")
      .eq("vessel_id", vesselId)
      .gte("occurred_at", new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const avgAccuracy = metrics && metrics.length > 0
      ? metrics.reduce((sum: number, m: any) => sum + (m.positioning_accuracy || 0), 0) / metrics.length
      : 95;

    const avgFuelEfficiency = metrics && metrics.length > 0
      ? metrics.reduce((sum: number, m: any) => sum + (m.fuel_efficiency || 0), 0) / metrics.length
      : 85;

    return {
      vessel_id: vesselId,
      dp_class: (vessel as any)?.dp_class || "DP2",
      operational_hours: vessel?.operational_hours || 0,
      incidents_count: incidents?.length || 0,
      avg_positioning_accuracy: avgAccuracy,
      fuel_efficiency: avgFuelEfficiency,
      maintenance_status: (vessel as any)?.maintenance_status || "good"
    });
  }

  /**
   * Fetch crew competency data
   */
  private static async fetchCrewCompetency(vesselId: string): Promise<CrewCompetencyData> {
    const { data: assignments } = await supabase
      .from("crew_assignments")
      .select(`
        *,
        crew:profiles(*)
      `)
      .eq("vessel_id", vesselId)
      .eq("assignment_status", "active");

    const totalCrew = assignments?.length || 0;
    const dpCertified = assignments?.filter((a: any) => 
      a.crew?.certifications?.includes("DP")
    ).length || 0;

    const avgExperience = assignments && assignments.length > 0
      ? assignments.reduce((sum: number, a: any) => 
        sum + (a.crew?.years_experience || 0), 0
      ) / assignments.length
      : 0;

    // Check for expiring certifications
    const expiringCerts = assignments?.filter((a: any) => {
      const expiryDate = new Date(a.crew?.cert_expiry_date || "");
      const threeMonthsFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      return expiryDate < threeMonthsFromNow;
    }).length || 0;

    return {
      vessel_id: vesselId,
      dp_certified_crew: dpCertified,
      total_crew: totalCrew,
      avg_experience_years: avgExperience,
      recent_training_completion: 0, // Would need training records table
      certification_expiry_soon: expiringCerts
    });
  }

  /**
   * Fetch existing PEO-DP plan
   */
  private static async fetchPEODPPlan(vesselId: string): Promise<PEODPPlan | null> {
    const { data, error } = await supabase
      .from("peodp_plans" as any)
      .select("*")
      .eq("vessel_id", vesselId)
      .eq("status", "active")
      .single();

    if (error || !data) return null;
    return data as any as PEODPPlan;
  }

  /**
   * Analyze crew competency and generate recommendations
   */
  private static analyzeCrewCompetency(
    crewData: CrewCompetencyData,
    context?: OperationalContext
  ): InferenceResult[] {
    const recommendations: InferenceResult[] = [];

    // Check DP certification ratio
    const certificationRatio = crewData.total_crew > 0
      ? crewData.dp_certified_crew / crewData.total_crew
      : 0;

    if (certificationRatio < 0.5) {
      recommendations.push({
        recommendation_type: "crew",
        priority: "high",
        title: "Insufficient DP-Certified Crew",
        description: `Only ${(certificationRatio * 100).toFixed(0)}% of crew are DP-certified. Minimum recommended: 50%`,
        reasoning: "Adequate DP-certified personnel are essential for safe operations and redundancy during critical tasks.",
        confidence: 90,
        suggested_actions: [
          "Schedule DP training for additional crew members",
          "Consider hiring DP-certified personnel",
          "Review crew rotation to ensure certified coverage"
        ],
        risk_level: "high",
        estimated_impact: "Improved operational safety and compliance with IMCA guidelines"
      });
    }

    // Check for expiring certifications
    if (crewData.certification_expiry_soon > 0) {
      recommendations.push({
        recommendation_type: "training",
        priority: crewData.certification_expiry_soon >= crewData.dp_certified_crew * 0.3 ? "critical" : "medium",
        title: "Certifications Expiring Soon",
        description: `${crewData.certification_expiry_soon} crew member(s) have certifications expiring within 90 days`,
        reasoning: "Expired certifications can lead to operational disruptions and non-compliance issues.",
        confidence: 100,
        suggested_actions: [
          "Schedule refresher training immediately",
          "Plan crew rotation to maintain certification coverage",
          "Set up automated certification tracking"
        ],
        risk_level: crewData.certification_expiry_soon >= crewData.dp_certified_crew * 0.3 ? "critical" : "medium",
        estimated_impact: "Maintained operational capability and regulatory compliance"
      });
    }

    // Check experience level
    if (crewData.avg_experience_years < 3 && context?.critical_operation) {
      recommendations.push({
        recommendation_type: "crew",
        priority: "high",
        title: "Low Average Crew Experience for Critical Operation",
        description: `Average crew experience is ${crewData.avg_experience_years.toFixed(1)} years. Recommended minimum for critical ops: 3 years`,
        reasoning: "Critical operations require experienced crew to handle unexpected situations effectively.",
        confidence: 85,
        suggested_actions: [
          "Add senior DP operators to the crew complement",
          "Conduct additional briefings and simulations",
          "Consider delaying non-urgent critical operations"
        ],
        risk_level: "high",
        estimated_impact: "Reduced operational risk during critical tasks"
      });
    }

    return recommendations;
  }

  /**
   * Analyze maintenance needs
   */
  private static analyzeMaintenanceNeeds(
    performanceData: VesselPerformanceData,
    context?: OperationalContext
  ): InferenceResult[] {
    const recommendations: InferenceResult[] = [];

    // Check positioning accuracy
    if (performanceData.avg_positioning_accuracy < 90) {
      recommendations.push({
        recommendation_type: "maintenance",
        priority: performanceData.avg_positioning_accuracy < 80 ? "critical" : "high",
        title: "Degraded Positioning Accuracy",
        description: `Average positioning accuracy is ${performanceData.avg_positioning_accuracy.toFixed(1)}%. Target: >95%`,
        reasoning: "Poor positioning accuracy may indicate sensor drift, GNSS issues, or thruster degradation.",
        confidence: 88,
        suggested_actions: [
          "Calibrate position reference systems",
          "Check GNSS antenna and cabling",
          "Inspect thruster performance and response",
          "Review and update FMEA scenarios"
        ],
        risk_level: performanceData.avg_positioning_accuracy < 80 ? "critical" : "high",
        estimated_impact: "Restored positioning accuracy to safe operational levels"
      });
    }

    // Check maintenance status
    if (performanceData.maintenance_status === "overdue" || performanceData.maintenance_status === "critical") {
      recommendations.push({
        recommendation_type: "maintenance",
        priority: "critical",
        title: "Overdue Maintenance Items",
        description: "Critical maintenance tasks are overdue and require immediate attention",
        reasoning: "Overdue maintenance increases failure risk and may compromise DP system reliability.",
        confidence: 95,
        suggested_actions: [
          "Schedule immediate maintenance window",
          "Review and prioritize critical components",
          "Restrict operations until maintenance is completed",
          "Update preventive maintenance schedule"
        ],
        risk_level: "critical",
        estimated_impact: "Prevention of equipment failure and operational downtime"
      });
    }

    return recommendations;
  }

  /**
   * Analyze training needs
   */
  private static analyzeTrainingNeeds(
    crewData: CrewCompetencyData,
    performanceData: VesselPerformanceData
  ): InferenceResult[] {
    const recommendations: InferenceResult[] = [];

    // Check for incidents
    if (performanceData.incidents_count > 5) {
      recommendations.push({
        recommendation_type: "training",
        priority: "high",
        title: "High Incident Rate Indicates Training Need",
        description: `${performanceData.incidents_count} incidents recorded in the past year`,
        reasoning: "Elevated incident rates often indicate gaps in crew training or procedural compliance.",
        confidence: 82,
        suggested_actions: [
          "Conduct incident analysis to identify common factors",
          "Schedule additional simulator training",
          "Review and update emergency response procedures",
          "Implement more frequent drills and exercises"
        ],
        risk_level: "high",
        estimated_impact: "Reduced incident frequency and improved emergency response"
      });
    }

    return recommendations;
  }

  /**
   * Analyze overall operational readiness
   */
  private static analyzeOperationalReadiness(
    performanceData: VesselPerformanceData,
    crewData: CrewCompetencyData,
    peodpPlan: PEODPPlan | null,
    context?: OperationalContext
  ): InferenceResult[] {
    const recommendations: InferenceResult[] = [];

    // Check if PEO-DP plan exists
    if (!peodpPlan) {
      recommendations.push({
        recommendation_type: "operational",
        priority: "critical",
        title: "No Active PEO-DP Plan",
        description: "Vessel does not have an active PEO-DP plan",
        reasoning: "PEO-DP plan is mandatory for DP operations per IMCA guidelines.",
        confidence: 100,
        suggested_actions: [
          "Create PEO-DP plan using the wizard",
          "Conduct FMEA and ASOG analysis",
          "Define emergency procedures and contingency plans",
          "Submit plan for approval"
        ],
        risk_level: "critical",
        estimated_impact: "Full compliance with DP operational requirements"
      });
    }

    // Weather-based recommendations
    if (context?.weather_conditions === "severe" || (context?.sea_state || 0) >= 7) {
      recommendations.push({
        recommendation_type: "operational",
        priority: "critical",
        title: "Severe Weather Conditions Detected",
        description: `Current conditions: ${context?.weather_conditions || "unknown"}, Sea State: ${context?.sea_state || "unknown"}`,
        reasoning: "Severe weather significantly increases DP operation risks and may exceed vessel capabilities.",
        confidence: 95,
        suggested_actions: [
          "Consider postponing non-critical operations",
          "Increase watch-keeping vigilance",
          "Review drift-off procedures",
          "Ensure all emergency systems are ready",
          "Maintain constant communication with shore"
        ],
        risk_level: "critical",
        estimated_impact: "Prevention of position loss or equipment damage"
      });
    }

    return recommendations;
  }

  /**
   * Log inference results for audit trail
   */
  private static async logInference(
    vesselId: string,
    recommendations: InferenceResult[]
  ): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      await supabase
        .from("dp_inference_logs" as any)
        .insert({
          plan_id: null,
          inference_type: "peodp_recommendations",
          input_data: { vesselId } as any,
          output_data: { recommendations_count: recommendations.length } as any,
          confidence_score: null,
          processing_time_ms: null,
          model_version: "1.0.0"
        } as any);
    } catch (error) {
      logger.error("Failed to log inference", error as Error, { vesselId });
    }
  }

  /**
   * Get inference history for a vessel
   */
  static async getInferenceHistory(
    vesselId: string,
    limit: number = 20
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from("dp_inference_logs" as any)
      .select("*")
      .eq("vessel_id", vesselId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Failed to fetch inference history", error as Error, { vesselId, limit });
      return [];
    }

    return data || [];
  }

  /**
   * Create or update PEO-DP plan
   */
  static async savePEODPPlan(plan: Partial<PEODPPlan>): Promise<PEODPPlan> {
    const { data, error } = await supabase
      .from("peodp_plans" as any)
      .upsert({
        ...(plan as any)
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save PEO-DP plan: ${error.message}`);
    }

    return data as any as PEODPPlan;
  }
}
