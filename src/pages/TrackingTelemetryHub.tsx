/**
 * Tracking & Telemetry Hub
 * Redirects to Premium version for unified experience
 * 
 * FUSION GROUP G - PROMPT MASTER V4.1
 */

import React from "react";
import TrackingTelemetryPremium from "./TrackingTelemetryPremium";

/**
 * Wrapper that redirects to the Premium version
 * Maintains backwards compatibility with existing routes
 */
export default function TrackingTelemetryHub() {
  return <TrackingTelemetryPremium />;
}
