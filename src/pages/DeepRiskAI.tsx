/**
 * PATCH 522 - Deep Risk AI
 * Main route page for Deep Risk AI with ONNX-based temporal predictions
 * Enhanced existing module with LSTM-style risk forecasting
 */

import DeepRiskAI from "@/modules/deep-risk-ai";

export default function DeepRiskAIPage() {
  return <DeepRiskAI />;
}
