import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const logPath = path.resolve("./logs/api-status-log.json");

    const payload = {
      timestamp: new Date().toISOString(),
      status: req.body,
    };

    // Ensure directory exists
    fs.mkdirSync(path.dirname(logPath), { recursive: true });

    // Append to log file
    fs.appendFileSync(logPath, JSON.stringify(payload, null, 2) + ",\n");

    return res.status(200).json({ message: "✅ Status logged successfully" });
  } catch (error) {
    console.error("❌ Error saving API status log:", error);
    return res.status(500).json({ error: "Failed to write log" });
  }
}
