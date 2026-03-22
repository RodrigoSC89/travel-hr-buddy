/**
 * SGSO IBAMA Requirements Service
 * Service for handling IBAMA SGSO requirements operations
 */

import { createClient } from "@supabase/supabase-js";
import type { SGSOIbamaRequirement, SGSOIbamaRequirementWithCompliance } from "@/types/sgso-ibama";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all IBAMA SGSO requirements
 * @returns Array of all 17 IBAMA requirements
 */
export async function getAllIbamaRequirements(): Promise<SGSOIbamaRequirement[]> {
  const { data, error } = await supabase
    .from("sgso_ibama_requirements")
    .select("*")
    .order("requirement_number");

  if (error) {
    console.error("Error fetching IBAMA requirements:", error);
    throw new Error(`Failed to fetch IBAMA requirements: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific IBAMA requirement by number
 * @param requirementNumber - Requirement number (1-17)
 * @returns Single IBAMA requirement
 */
export async function getIbamaRequirementByNumber(
  requirementNumber: number
): Promise<SGSOIbamaRequirement | null> {
  if (requirementNumber < 1 || requirementNumber > 17) {
    throw new Error("Requirement number must be between 1 and 17");
  }

  const { data, error } = await supabase
    .from("sgso_ibama_requirements")
    .select("*")
    .eq("requirement_number", requirementNumber)
    .single();

  if (error) {
    console.error(`Error fetching IBAMA requirement ${requirementNumber}:`, error);
    return null;
  }

  return data;
}

/**
 * Get a specific IBAMA requirement by ID
 * @param requirementId - Requirement UUID
 * @returns Single IBAMA requirement
 */
export async function getIbamaRequirementById(
  requirementId: string
): Promise<SGSOIbamaRequirement | null> {
  const { data, error } = await supabase
    .from("sgso_ibama_requirements")
    .select("*")
    .eq("id", requirementId)
    .single();

  if (error) {
    console.error(`Error fetching IBAMA requirement ${requirementId}:`, error);
    return null;
  }

  return data;
}

/**
 * Search IBAMA requirements by keyword
 * @param keyword - Search keyword
 * @returns Array of matching requirements
 */
export async function searchIbamaRequirements(
  keyword: string
): Promise<SGSOIbamaRequirement[]> {
  const { data, error } = await supabase
    .from("sgso_ibama_requirements")
    .select("*")
    .or(`requirement_title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order("requirement_number");

  if (error) {
    console.error("Error searching IBAMA requirements:", error);
    throw new Error(`Failed to search IBAMA requirements: ${error.message}`);
  }

  return data || [];
}

/**
 * Get IBAMA requirements with compliance status for a specific organization/vessel
 * @param organizationId - Organization UUID
 * @param vesselId - Optional vessel UUID
 * @returns Array of requirements with compliance info
 */
export async function getIbamaRequirementsWithCompliance(
  organizationId: string,
  vesselId?: string
): Promise<SGSOIbamaRequirementWithCompliance[]> {
  // First, get all requirements
  const requirements = await getAllIbamaRequirements();

  // Then, get compliance data for this organization/vessel
  // Note: This assumes a compliance tracking table exists or will be created
  // For now, we'll just return the requirements without compliance data
  // This can be extended when the compliance tracking table is implemented

  return requirements.map(req => ({
    ...req,
    compliance: undefined // Will be populated when compliance tracking is implemented
  }));
}

/**
 * Export IBAMA requirements as JSON for external systems or AI processing
 * @returns JSON string of all requirements
 */
export async function exportIbamaRequirementsAsJSON(): Promise<string> {
  const requirements = await getAllIbamaRequirements();
  return JSON.stringify(requirements, null, 2);
}

/**
 * Get IBAMA requirements summary statistics
 * @returns Summary stats about requirements
 */
export async function getIbamaRequirementsSummary() {
  const requirements = await getAllIbamaRequirements();
  
  return {
    total_requirements: requirements.length,
    requirement_numbers: requirements.map(r => r.requirement_number),
    categories: {
      management: [1, 11, 15, 16, 17], // Management & Leadership
      risk_safety: [5, 7, 9, 12, 13, 14], // Risk & Safety
      operations: [2, 6, 8], // Operations
      training_communication: [3, 4], // Training & Communication
      auditing: [10] // Auditing
    }
  };
}

export default {
  getAllIbamaRequirements,
  getIbamaRequirementByNumber,
  getIbamaRequirementById,
  searchIbamaRequirements,
  getIbamaRequirementsWithCompliance,
  exportIbamaRequirementsAsJSON,
  getIbamaRequirementsSummary
};
