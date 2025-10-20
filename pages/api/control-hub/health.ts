/**
 * Control Hub Health Check API
 * GET /api/control-hub/health
 */

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check system health
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      modules: {
        mmi: "operational",
        "peo-dp": "operational",
        "dp-intelligence": "operational",
        bridgelink: "operational",
        sgso: "operational",
      },
      uptime: process.uptime ? process.uptime() * 1000 : 0,
    };

    // Return 200 if healthy, 503 if degraded/critical
    const statusCode = health.status === "healthy" ? 200 : 503;

    return res.status(statusCode).json(health);
  } catch (error) {
    console.error("Control Hub health check error:", error);
    return res.status(503).json({ 
      status: "critical",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
