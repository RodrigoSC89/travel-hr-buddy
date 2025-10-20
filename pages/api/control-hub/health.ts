import { NextApiRequest, NextApiResponse } from "next";

/**
 * GET /api/control-hub/health
 * 
 * Health check endpoint that returns 200 for healthy, 503 for unhealthy
 * Used for external monitoring systems
 * 
 * Returns:
 * - status: 'healthy' | 'degraded' | 'critical'
 * - uptime: system uptime in seconds
 * - modules: array of module statuses
 * - cache: cache information
 * - connectivity: connectivity information
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Import control hub dynamically
    const { controlHub } = await import("@/modules/control_hub");
    
    // Get health status
    const health = await controlHub.getHealth();
    
    // Return appropriate HTTP status based on health
    const httpStatus = health.status === 'critical' ? 503 : 200;
    
    return res.status(httpStatus).json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking Control Hub health:", error);
    return res.status(503).json({
      success: false,
      data: {
        status: 'critical',
        error: "Failed to check health",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
