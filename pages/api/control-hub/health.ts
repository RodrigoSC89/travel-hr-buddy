/**
 * Control Hub Health Check API
 * 
 * Returns overall system health status
 */

import { NextApiRequest, NextApiResponse } from "next";
import controlHub from "@/modules/control_hub/hub_core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize if not already done
    if (!controlHub.getState().initialized) {
      await controlHub.iniciar();
    }

    // Get health status
    const health = await controlHub.getHealth();

    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

    return res.status(statusCode).json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking Control Hub health:", error);
    return res.status(500).json({
      success: false,
      health: {
        status: "critical",
        details: {
          modules: "error",
          bridge: "error",
          cache: "error",
        },
      },
      error: "Failed to check health",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
