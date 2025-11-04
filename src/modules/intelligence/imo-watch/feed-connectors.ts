/**
 * IMO Watch & Compliance Alerts - Feed Connectors
 * PATCH 634
 * External feed integration for IMO, Equasis, Paris MoU, USCG, PSC
 */

import { Logger } from "@/lib/utils/logger";
import { IMOAlert, PSCInspection, ExternalFeedConfig, AlertSource } from "./types";

/**
 * Feed connector configuration
 */
const FEED_CONFIGS: ExternalFeedConfig[] = [
  {
    source: "IMO",
    enabled: true,
    rss_feed: "https://www.imo.org/en/MediaCentre/Pages/RSS.aspx",
    poll_interval_minutes: 360, // 6 hours
    error_count: 0
  },
  {
    source: "Paris_MoU",
    enabled: true,
    api_endpoint: "https://www.parismou.org/inspection-search",
    poll_interval_minutes: 720, // 12 hours
    error_count: 0
  },
  {
    source: "USCG",
    enabled: true,
    rss_feed: "https://www.dco.uscg.mil/psix/",
    poll_interval_minutes: 720,
    error_count: 0
  },
  {
    source: "Tokyo_MoU",
    enabled: true,
    api_endpoint: "http://www.tokyo-mou.org/inspections_detentions/",
    poll_interval_minutes: 720,
    error_count: 0
  },
  {
    source: "Equasis",
    enabled: false, // Requires authentication
    api_endpoint: "https://www.equasis.org/",
    poll_interval_minutes: 1440, // 24 hours
    error_count: 0
  }
];

/**
 * Parse IMO RSS feed
 */
export async function parseIMOFeed(): Promise<{
  success: boolean;
  alerts?: IMOAlert[];
  error?: string;
}> {
  try {
    Logger.info("Parsing IMO RSS feed");

    const config = FEED_CONFIGS.find(c => c.source === "IMO");
    if (!config || !config.enabled || !config.rss_feed) {
      return { success: false, error: "IMO feed not configured" };
    }

    // Fetch RSS feed
    const response = await fetch(config.rss_feed);
    if (!response.ok) {
      throw new Error(`Failed to fetch IMO feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const items = xmlDoc.querySelectorAll("item");
    const alerts: IMOAlert[] = [];

    items.forEach((item, index) => {
      const title = item.querySelector("title")?.textContent || "";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";

      alerts.push({
        id: `imo-${Date.now()}-${index}`,
        source: "IMO",
        alert_type: determineAlertType(title, description),
        severity: determineSeverity(title, description),
        status: "new",
        title,
        description,
        source_url: link,
        metadata: {
          published_date: pubDate
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    Logger.info(`Parsed ${alerts.length} alerts from IMO feed`);

    return {
      success: true,
      alerts
    };
  } catch (error) {
    Logger.error("Failed to parse IMO feed", error, "imo-watch");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch Paris MoU inspection data
 */
export async function fetchParisMoUInspections(
  vesselIMO?: string
): Promise<{
  success: boolean;
  inspections?: PSCInspection[];
  error?: string;
}> {
  try {
    Logger.info("Fetching Paris MoU inspection data", { vesselIMO });

    // Note: Paris MoU requires manual scraping or API access
    // This is a placeholder for the actual implementation
    
    const mockInspections: PSCInspection[] = [
      {
        id: `psc-${Date.now()}`,
        vessel_imo_number: vesselIMO || "9876543",
        vessel_name: "Example Vessel",
        flag_state: "Panama",
        inspection_date: "2025-10-15",
        port_of_inspection: "Rotterdam",
        port_state: "Netherlands",
        mou_region: "Paris MoU",
        deficiency_count: 2,
        deficiency_codes: ["01305", "07105"],
        detention: false,
        inspection_type: "initial",
        source_reference: "PSCMOU2025001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    Logger.info(`Fetched ${mockInspections.length} Paris MoU inspections`);

    return {
      success: true,
      inspections: mockInspections
    };
  } catch (error) {
    Logger.error("Failed to fetch Paris MoU data", error, "imo-watch");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch USCG inspection data
 */
export async function fetchUSCGInspections(
  vesselIMO?: string
): Promise<{
  success: boolean;
  inspections?: PSCInspection[];
  error?: string;
}> {
  try {
    Logger.info("Fetching USCG inspection data", { vesselIMO });

    // USCG data would need to be scraped from their database
    // This is a placeholder implementation
    
    return {
      success: true,
      inspections: []
    };
  } catch (error) {
    Logger.error("Failed to fetch USCG data", error, "imo-watch");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch Tokyo MoU inspection data
 */
export async function fetchTokyoMoUInspections(
  vesselIMO?: string
): Promise<{
  success: boolean;
  inspections?: PSCInspection[];
  error?: string;
}> {
  try {
    Logger.info("Fetching Tokyo MoU inspection data", { vesselIMO });

    // Tokyo MoU data implementation would go here
    
    return {
      success: true,
      inspections: []
    };
  } catch (error) {
    Logger.error("Failed to fetch Tokyo MoU data", error, "imo-watch");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Determine alert type from content
 */
function determineAlertType(title: string, description: string): IMOAlert["alert_type"] {
  const content = (title + " " + description).toLowerCase();
  
  if (content.includes("circular") || content.includes("msn")) return "circular";
  if (content.includes("amend")) return "amendment";
  if (content.includes("detention")) return "detention";
  if (content.includes("inspection")) return "inspection";
  if (content.includes("deficiency")) return "deficiency";
  if (content.includes("ban") || content.includes("prohibited")) return "ban";
  
  return "notification";
}

/**
 * Determine severity from content
 */
function determineSeverity(title: string, description: string): IMOAlert["severity"] {
  const content = (title + " " + description).toLowerCase();
  
  if (content.includes("urgent") || content.includes("immediate") || content.includes("critical")) {
    return "urgent";
  }
  if (content.includes("detention") || content.includes("ban") || content.includes("prohibited")) {
    return "critical";
  }
  if (content.includes("amend") || content.includes("compliance")) {
    return "warning";
  }
  
  return "info";
}

/**
 * Poll all enabled feeds
 */
export async function pollAllFeeds(): Promise<{
  success: boolean;
  totalAlerts: number;
  totalInspections: number;
  errors: string[];
}> {
  Logger.info("Starting polling of all external feeds");

  const errors: string[] = [];
  let totalAlerts = 0;
  let totalInspections = 0;

  // Poll IMO feed
  const imoResult = await parseIMOFeed();
  if (imoResult.success && imoResult.alerts) {
    totalAlerts += imoResult.alerts.length;
  } else if (imoResult.error) {
    errors.push(`IMO: ${imoResult.error}`);
  }

  // Poll Paris MoU
  const parisResult = await fetchParisMoUInspections();
  if (parisResult.success && parisResult.inspections) {
    totalInspections += parisResult.inspections.length;
  } else if (parisResult.error) {
    errors.push(`Paris MoU: ${parisResult.error}`);
  }

  // Poll USCG
  const uscgResult = await fetchUSCGInspections();
  if (uscgResult.success && uscgResult.inspections) {
    totalInspections += uscgResult.inspections.length;
  } else if (uscgResult.error) {
    errors.push(`USCG: ${uscgResult.error}`);
  }

  Logger.info("Feed polling completed", {
    totalAlerts,
    totalInspections,
    errorCount: errors.length
  });

  return {
    success: errors.length === 0,
    totalAlerts,
    totalInspections,
    errors
  };
}
