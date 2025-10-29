/**
 * PATCH 525 - AI Visual Recognition Core Types
 */

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface VisionEvent {
  id: string;
  timestamp: string;
  imageUrl?: string;
  detections: DetectedObject[];
  processingTime: number;
  totalObjects: number;
}

export interface DetectionStats {
  totalDetections: number;
  averageConfidence: number;
  mostCommonClass: string;
  processingTimeAvg: number;
}
