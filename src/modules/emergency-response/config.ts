/**
 * Emergency Response Configuration - PATCH 69.0
 */

export const EMERGENCY_CONFIG = {
  // Response times in minutes
  RESPONSE_TIMES: {
    sar: 5,
    fire: 3,
    medical: 5,
    abandon_ship: 10,
    pollution: 15,
    collision: 10,
    grounding: 20,
    flooding: 5,
    piracy: 2,
    other: 10
  },

  // Emergency contact frequencies
  VHF_CHANNELS: {
    distress: "16",
    working: "13",
    port_ops: "12",
    pilot: "14"
  },

  // SOLAS requirements
  MUSTER_REQUIREMENTS: {
    drill_frequency_days: 7,
    max_muster_time_minutes: 15,
    min_lifeboat_capacity_percent: 100,
    min_liferaft_capacity_percent: 100
  },

  // AI Assessment thresholds
  AI_ASSESSMENT: {
    confidence_threshold: 0.7,
    max_retry_attempts: 3,
    timeout_seconds: 30
  },

  // Logging configuration
  LOGGING: {
    retention_days: 365,
    auto_archive: true,
    compliance_export: true
  }
} as const;

export const EMERGENCY_CONTACTS = [
  {
    id: "coast-guard",
    name: "Coast Guard",
    organization: "National Maritime Authority",
    contactType: "radio" as const,
    contactInfo: "VHF Ch 16",
    priority: 1,
    available24h: true
  },
  {
    id: "medical-evac",
    name: "Medical Evacuation Service",
    organization: "Maritime Medical Response",
    contactType: "satellite" as const,
    contactInfo: "+1-555-MED-EVAC",
    priority: 2,
    available24h: true
  },
  {
    id: "company-emergency",
    name: "Company Emergency Line",
    organization: "Nautilus Maritime",
    contactType: "phone" as const,
    contactInfo: "+1-555-NAUTILUS",
    priority: 3,
    available24h: true
  },
  {
    id: "port-authority",
    name: "Port Authority",
    organization: "Local Port Operations",
    contactType: "radio" as const,
    contactInfo: "VHF Ch 12",
    priority: 4,
    available24h: true
  }
];

export const SAR_PATTERNS = {
  expanding_square: {
    name: "Expanding Square",
    description: "Start at datum, expand in square pattern",
    best_for: "Known last position, good visibility"
  },
  sector: {
    name: "Sector Search",
    description: "Divide area into sectors, systematic coverage",
    best_for: "Large areas, multiple vessels"
  },
  parallel: {
    name: "Parallel Track",
    description: "Parallel sweeps across search area",
    best_for: "Drift scenarios, current considerations"
  },
  creeping_line: {
    name: "Creeping Line",
    description: "Progressive parallel tracks",
    best_for: "Uncertain position, methodical coverage"
  }
};
