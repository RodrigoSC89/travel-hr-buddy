/**
 * BridgeLink Auth API
 * POST /api/bridgelink/auth
 */

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // In a real implementation, validate the token
    // For now, accept any token
    return res.status(200).json({
      authenticated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('BridgeLink auth error:', error);
    return res.status(401).json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
