import { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/control-hub/sync
 * 
 * Triggers a manual synchronization with BridgeLink
 * Returns the synchronization result including:
 * - Success status
 * - Number of records sent
 * - Any errors that occurred
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Import control hub dynamically
    const { controlHub } = await import("@/modules/control_hub");
    
    // Trigger synchronization
    const result = await controlHub.forceSyncronizar();
    
    return res.status(200).json({
      success: result.success,
      data: {
        recordsSent: result.recordsSent,
        errors: result.errors,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error("Error triggering Control Hub sync:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to trigger synchronization",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
