/**
 * PATCH 547 - AI Trust Analysis Engine
 * Export all trust engine functionality
 */

export { calculateTrustScore, getTrustScoreHistory } from "./calculateTrustScore";
export type { TrustInput, TrustScore } from "./calculateTrustScore";
export { TrustScoreDisplay } from "./TrustScoreDisplay";
