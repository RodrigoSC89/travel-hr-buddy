/**
 * BridgeLink Ping API
 * GET /api/bridgelink/ping
 */

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulate connection check
    const response = {
      status: 'online',
      timestamp: new Date().toISOString(),
      latency: Math.floor(Math.random() * 200) + 50, // Random 50-250ms
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('BridgeLink ping error:', error);
    return res.status(500).json({ 
      status: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
