/**
 * Space Weather & GNSS Services
 * 
 * Exportação centralizada de todos os serviços de clima espacial e GNSS
 */

// Services
export { default as NOAASWPC } from "./noaa-swpc.service";
export { default as CelesTrak } from "./celestrak.service";
export { default as SpaceWeatherMonitoring } from "./space-weather-monitoring.service";

// DP ASOG Client (Python FastAPI backend)
export {
  DPASOGClient,
  getDPASOGClient,
  getKpFromDPASOG,
  quickDPASOGCheck,
  getPDOPTimeline,
  mapDPASOGToSpaceWeatherStatus,
} from "./dp-asog-client.service";

export type {
  DPASOGKpResponse,
  DPASOGPDOPPoint,
  DPASOGPDOPResponse,
  DPASOGStatusResponse,
  DPASOGPDOPRequest,
  DPASOGStatusRequest,
} from "./dp-asog-client.service";

// Hybrid Service (DP ASOG + TypeScript fallback)
export {
  HybridSpaceWeatherService,
  getHybridSpaceWeatherService,
  hybridQuickCheck,
  getHybridSpaceWeatherStatus,
} from "./hybrid-monitoring.service";

export type {
  HybridSpaceWeatherConfig,
} from "./hybrid-monitoring.service";

// Types
export type * from "@/types/space-weather.types";

// Quick imports
export {
  getSpaceWeatherStatus,
  planGNSSWindow,
  quickDPCheck,
} from "./space-weather-monitoring.service";

import { SpaceWeatherMonitoring } from "./space-weather-monitoring.service";
export const DEFAULT_THRESHOLDS = SpaceWeatherMonitoring.DEFAULT_THRESHOLDS;

export {
  getKpIndex,
  getCurrentKp,
  getAlerts,
  getSolarWind,
  getSpaceWeatherSummary,
  checkDPGateStatus,
} from "./noaa-swpc.service";

export {
  getGNSSElements,
  getAllGNSSConstellations,
  calculateVisibility,
  calculateDOP,
  calculateDOPTimeline,
  findBestWindow,
} from "./celestrak.service";
