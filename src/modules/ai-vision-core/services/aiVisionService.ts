/**
 * PATCH 525 - AI Visual Recognition Service
 * Handles TensorFlow.js COCO-SSD object detection
 */

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { DetectedObject, VisionEvent } from "../types";

class AIVisionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private modelLoading: Promise<void> | null = null;

  /**
   * Load the COCO-SSD model
   */
  async loadModel(): Promise<void> {
    if (this.model) return;
    if (this.modelLoading) return this.modelLoading;

    this.modelLoading = (async () => {
      try {
        console.log("Loading COCO-SSD model...");
        this.model = await cocoSsd.load();
        console.log("COCO-SSD model loaded successfully");
      } catch (error) {
        console.error("Failed to load COCO-SSD model:", error);
        throw error;
      } finally {
        this.modelLoading = null;
      }
    })();

    return this.modelLoading;
  }

  /**
   * Detect objects in an image
   */
  async detectObjects(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<DetectedObject[]> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error("Model not loaded");
    }

    const startTime = performance.now();
    const predictions = await this.model.detect(imageElement);
    const endTime = performance.now();

    console.log(`Detection completed in ${(endTime - startTime).toFixed(2)}ms`);

    return predictions.map(pred => ({
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox as [number, number, number, number],
    }));
  }

  /**
   * Mock persistence - save to vision_events table
   * In real implementation, would integrate with Supabase
   */
  async saveVisionEvent(event: Omit<VisionEvent, "id">): Promise<string> {
    const eventId = `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("Mock: Saving vision event to vision_events table", {
      id: eventId,
      ...event,
    });
    
    // Would integrate with Supabase here:
    // const { data, error } = await supabase
    //   .from('vision_events')
    //   .insert([{ id: eventId, ...event }])
    //   .select()
    //   .single();
    
    return eventId;
  }

  /**
   * Get recent vision events (mock)
   */
  async getRecentEvents(limit: number = 10): Promise<VisionEvent[]> {
    // Mock data - in real implementation would fetch from Supabase
    const mockEvents: VisionEvent[] = [];
    const now = Date.now();
    
    for (let i = 0; i < Math.min(limit, 5); i++) {
      mockEvents.push({
        id: `vision-${now - i * 60000}`,
        timestamp: new Date(now - i * 60000).toISOString(),
        detections: [
          { class: "person", score: 0.92, bbox: [10, 20, 100, 200] },
          { class: "boat", score: 0.87, bbox: [150, 50, 200, 150] },
        ],
        processingTime: 120 + Math.random() * 80,
        totalObjects: 2,
      });
    }
    
    return mockEvents;
  }

  /**
   * Calculate statistics from detection history
   */
  calculateStats(events: VisionEvent[]) {
    if (events.length === 0) {
      return {
        totalDetections: 0,
        averageConfidence: 0,
        mostCommonClass: "N/A",
        processingTimeAvg: 0,
      };
    }

    let totalDetections = 0;
    let totalConfidence = 0;
    let totalProcessingTime = 0;
    const classCount: Record<string, number> = {};

    events.forEach(event => {
      totalDetections += event.totalObjects;
      totalProcessingTime += event.processingTime;
      
      event.detections.forEach(detection => {
        totalConfidence += detection.score;
        classCount[detection.class] = (classCount[detection.class] || 0) + 1;
      });
    });

    const mostCommonClass = Object.entries(classCount).reduce(
      (max, [cls, count]) => (count > max.count ? { class: cls, count } : max),
      { class: "N/A", count: 0 }
    ).class;

    return {
      totalDetections,
      averageConfidence: totalConfidence / totalDetections,
      mostCommonClass,
      processingTimeAvg: totalProcessingTime / events.length,
    };
  }
}

export const aiVisionService = new AIVisionService();
