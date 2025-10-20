/**
 * Control Hub Status API
 * 
 * Returns current status of all modules and BridgeLink connectivity
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

    // Get dashboard data
    const data = await controlHub.getDashboardData();

    return res.status(200).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting Control Hub status:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
