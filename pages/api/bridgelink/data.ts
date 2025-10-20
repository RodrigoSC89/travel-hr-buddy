import type { NextApiRequest, NextApiResponse } from "next";

/**
 * BridgeLink Data API
 * 
 * Returns consolidated data from DP Intelligence, SGSO, and navigation systems
 * This is a mock endpoint for development/testing
 */

interface DPEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "normal" | "degradation" | "critical";
  system: string;
  description: string;
  vessel?: string;
  location?: string;
}

interface RiskAlert {
  id: string;
  level: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  recommendations?: string[];
}

// Mock data for development
const mockDPEvents: DPEvent[] = [
  {
    id: "evt-001",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: "position",
    severity: "normal",
    system: "DP-2",
    description: "Position maintained within tolerances",
    vessel: "MV Atlantic Explorer",
    location: "Campos Basin",
  },
  {
    id: "evt-002",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    type: "thruster",
    severity: "degradation",
    system: "DP-3",
    description: "Starboard bow thruster showing reduced efficiency",
    vessel: "MV Atlantic Explorer",
    location: "Campos Basin",
  },
  {
    id: "evt-003",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: "reference",
    severity: "normal",
    system: "DP-2",
    description: "All position reference systems operational",
    vessel: "MV Atlantic Explorer",
    location: "Campos Basin",
  },
  {
    id: "evt-004",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    type: "wind",
    severity: "degradation",
    system: "DP-2",
    description: "Wind speed increasing - 25 knots from NE",
    vessel: "MV Atlantic Explorer",
    location: "Campos Basin",
  },
  {
    id: "evt-005",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    type: "power",
    severity: "critical",
    system: "DP-3",
    description: "Generator 3 offline - redundancy compromised",
    vessel: "MV Atlantic Explorer",
    location: "Campos Basin",
  },
];

const mockRiskAlerts: RiskAlert[] = [
  {
    id: "alert-001",
    level: "critical",
    title: "Generator Offline",
    description: "Generator 3 is offline, reducing system redundancy",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    source: "Power Management System",
    recommendations: [
      "Initiate emergency power procedures",
      "Assess remaining generator capacity",
      "Consider aborting operations if weather deteriorates",
    ],
  },
  {
    id: "alert-002",
    level: "high",
    title: "Thruster Performance Degraded",
    description: "Starboard bow thruster showing 15% reduction in performance",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    source: "DP Control System",
    recommendations: [
      "Monitor thruster temperatures",
      "Review maintenance logs",
      "Schedule inspection at next opportunity",
    ],
  },
  {
    id: "alert-003",
    level: "medium",
    title: "Weather Conditions Deteriorating",
    description: "Wind speed increasing beyond normal operational parameters",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    source: "Weather Station",
    recommendations: [
      "Monitor weather forecast",
      "Review operational limits",
      "Prepare for potential operations suspension",
    ],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // In a real implementation, this would:
    // 1. Query DP Intelligence Center API
    // 2. Fetch SGSO logs from database
    // 3. Get navigation data from vessel systems
    // 4. Process and aggregate the data
    
    // For now, return mock data
    const response = {
      events: mockDPEvents,
      alerts: mockRiskAlerts,
      status: determineOverallStatus(mockDPEvents, mockRiskAlerts),
      systemStatus: {
        overall: determineOverallStatus(mockDPEvents, mockRiskAlerts),
        subsystems: [
          {
            name: "DP Control",
            status: "operational",
            lastUpdate: new Date().toISOString(),
          },
          {
            name: "Power Management",
            status: "degraded",
            lastUpdate: new Date().toISOString(),
          },
          {
            name: "Position Reference",
            status: "operational",
            lastUpdate: new Date().toISOString(),
          },
          {
            name: "Thruster Control",
            status: "degraded",
            lastUpdate: new Date().toISOString(),
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in BridgeLink API:", error);
    res.status(500).json({
      error: "Internal server error",
      events: [],
      alerts: [],
      status: "Offline",
    });
  }
}

/**
 * Determine overall system status based on events and alerts
 */
function determineOverallStatus(
  events: DPEvent[],
  alerts: RiskAlert[]
): string {
  // Check for critical alerts
  const hasCriticalAlerts = alerts.some((alert) => alert.level === "critical");
  if (hasCriticalAlerts) {
    return "Critical";
  }

  // Check for critical events in last 30 minutes
  const recentEvents = events.filter(
    (event) =>
      new Date(event.timestamp).getTime() > Date.now() - 30 * 60000
  );
  const hasCriticalEvents = recentEvents.some(
    (event) => event.severity === "critical"
  );
  if (hasCriticalEvents) {
    return "Critical";
  }

  // Check for degradation
  const hasDegradation = events.some(
    (event) => event.severity === "degradation"
  );
  if (hasDegradation) {
    return "Degradation";
  }

  return "Normal";
}
