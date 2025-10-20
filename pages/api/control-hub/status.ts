import { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/control-hub/status
 * 
 * Returns the full system status of the Control Hub including:
 * - Module statuses
 * - Cache information
 * - Connectivity status
 * - Last synchronization time
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Import control hub dynamically to avoid issues with server-side rendering
    const { controlHub } = await import("@/modules/control_hub");
    
    // Get current state
    const state = controlHub.getState();
    const cacheStats = controlHub.getCacheStats();
    
    return res.status(200).json({
      success: true,
      data: {
        ...state,
        cache: cacheStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Control Hub status:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch Control Hub status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
