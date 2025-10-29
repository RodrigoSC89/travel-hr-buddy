/**
 * PATCH 524 - Incident Replay AI
 * Enhanced existing replay component with speed controls and per-event insights
 * 
 * Features:
 * - Adjustable playback speed: 0.5x, 1x, 2x, 4x
 * - Per-event AI insight generation with toggle control
 * - Speed affects replay interval dynamically
 * - Insights highlight critical decision points and procedural alignment
 */

import Patch520AIReplay from "@/pages/admin/Patch520AIReplay";

export default function IncidentReplayAIPage() {
  return <Patch520AIReplay />;
}
