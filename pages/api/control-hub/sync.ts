/**
 * Control Hub Sync API
 * 
 * Triggers manual synchronization with BridgeLink
 */

import { NextApiRequest, NextApiResponse } from "next";
import controlHub from "@/modules/control_hub/hub_core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize if not already done
    if (!controlHub.getState().initialized) {
      await controlHub.iniciar();
    }

    // Trigger synchronization
    const result = await controlHub.sincronizar();

    return res.status(200).json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error syncing with BridgeLink:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to sync",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
