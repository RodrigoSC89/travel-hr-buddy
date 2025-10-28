/**
 * Port Authority Service
 * PATCH 152.0 - Port API Integration
 */

import { createClient } from "@/integrations/supabase/client";
import { 
  VesselArrival, 
  PortSubmission, 
  CrewMember, 
  PortDocument,
  PortNotification,
  SyncResult 
} from "../types";

/**
 * Submit vessel arrival data to port authority
 */
export const submitArrivalData = async (
  arrival: VesselArrival,
  crew: CrewMember[],
  documents: PortDocument[]
): Promise<SyncResult> => {
  try {
    const supabase = createClient();
    
    // Create submission record
    const submission: PortSubmission = {
      id: `SUB-${Date.now()}`,
      arrivalId: arrival.id,
      vesselId: arrival.vesselId,
      portCode: arrival.portCode,
      submittedAt: new Date().toISOString(),
      status: "pending",
      crew,
      documents,
      missingDocuments: [],
      notifications: []
    };

    // Store in database
    const { error } = await supabase
      .from("port_submissions")
      .insert([submission]);

    if (error) throw error;

    // In real implementation, this would call the port authority API
    // For now, we simulate the API call
    const apiResult = await simulatePortAPICall(submission);

    return {
      success: true,
      message: "Arrival data submitted successfully",
      submissionId: submission.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error submitting arrival data:", error);
    return {
      success: false,
      message: "Failed to submit arrival data",
      errors: [error instanceof Error ? error.message : "Unknown error"],
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Update ETA in real-time
 */
export const updateETA = async (
  arrivalId: string,
  newETA: string,
  reason?: string
): Promise<SyncResult> => {
  try {
    const supabase = createClient();

    // Update arrival record
    const { error } = await supabase
      .from("vessel_arrivals")
      .update({ 
        eta: newETA, 
        updatedAt: new Date().toISOString(),
        status: "delayed"
      })
      .eq("id", arrivalId);

    if (error) throw error;

    // Notify port authority of ETA change
    await notifyPortAuthority(arrivalId, "eta_update", {
      newETA,
      reason
    });

    return {
      success: true,
      message: "ETA updated successfully",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error updating ETA:", error);
    return {
      success: false,
      message: "Failed to update ETA",
      errors: [error instanceof Error ? error.message : "Unknown error"],
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Sync crew information with port authority
 */
export const syncCrewData = async (
  submissionId: string,
  crew: CrewMember[]
): Promise<SyncResult> => {
  try {
    const supabase = createClient();

    // Update crew data in submission
    const { error } = await supabase
      .from("port_submissions")
      .update({ 
        crew,
        updatedAt: new Date().toISOString()
      })
      .eq("id", submissionId);

    if (error) throw error;

    return {
      success: true,
      message: "Crew data synchronized successfully",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error syncing crew data:", error);
    return {
      success: false,
      message: "Failed to sync crew data",
      errors: [error instanceof Error ? error.message : "Unknown error"],
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check for missing documents and notify
 */
export const checkMissingDocuments = async (
  submissionId: string
): Promise<string[]> => {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("port_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (error || !data) return [];

    // Required documents for port clearance
    const requiredDocs = [
      "Crew List",
      "Passenger List",
      "Ship Stores Declaration",
      "Maritime Declaration of Health",
      "Cargo Manifest",
      "Ship Security Plan",
      "ISPS Certificate",
      "ISM Certificate"
    ];

    const submittedDocTypes = data.documents.map((doc: PortDocument) => doc.type);
    const missing = requiredDocs.filter(req => !submittedDocTypes.includes(req));

    // Update submission with missing documents
    if (missing.length > 0) {
      await supabase
        .from("port_submissions")
        .update({ 
          missingDocuments: missing,
          status: "requires_docs"
        })
        .eq("id", submissionId);

      // Send notification
      await notifyMissingDocuments(submissionId, missing);
    }

    return missing;
  } catch (error) {
    console.error("Error checking missing documents:", error);
    return [];
  }
};

/**
 * Notify about missing documents
 */
const notifyMissingDocuments = async (
  submissionId: string,
  missingDocs: string[]
): Promise<void> => {
  const supabase = createClient();

  const notification: PortNotification = {
    id: `NOTIF-${Date.now()}`,
    type: "missing_document",
    message: `Missing documents: ${missingDocs.join(", ")}`,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };

  // Store notification
  await supabase
    .from("port_notifications")
    .insert([{
      submissionId,
      ...notification
    }]);
};

/**
 * Notify port authority of updates
 */
const notifyPortAuthority = async (
  arrivalId: string,
  type: string,
  data: any
): Promise<void> => {
  // In real implementation, this would call the port authority API
  console.log("Port authority notified:", { arrivalId, type, data });
};

/**
 * Simulate port authority API call
 */
const simulatePortAPICall = async (submission: PortSubmission): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    status: "accepted",
    referenceNumber: `PORT-${Date.now()}`,
    message: "Submission received and processed"
  };
};

/**
 * Get submission status
 */
export const getSubmissionStatus = async (submissionId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("port_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (error) {
    console.error("Error fetching submission:", error);
    return null;
  }

  return data;
};

/**
 * List all arrivals
 */
export const listArrivals = async (filters?: {
  portCode?: string;
  status?: string;
}) => {
  const supabase = createClient();

  let query = supabase
    .from("vessel_arrivals")
    .select("*")
    .order("eta", { ascending: true });

  if (filters?.portCode) {
    query = query.eq("portCode", filters.portCode);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing arrivals:", error);
    return [];
  }

  return data || [];
};
