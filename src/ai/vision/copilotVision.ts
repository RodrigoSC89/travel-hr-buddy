import type * as CocoSsdType from "@tensorflow-models/coco-ssd";
import type * as TFType from "@tensorflow/tfjs";

let cocoSsd: typeof CocoSsdType | null = null;
const loadCocoSsd = async () => {
  if (!cocoSsd) {
    cocoSsd = await import("@tensorflow-models/coco-ssd");
  }
  return cocoSsd;
};
let tf: typeof TFType | null = null;
const loadTF = async () => {
  if (!tf) {
    tf = await import("@tensorflow/tfjs");
  }
  return tf;
};
import Tesseract from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";

export interface VisualContext {
  detectedObjects: DetectedObject[];
  extractedText: string[];
  sceneClassification: string;
  confidence: number;
  timestamp: string;
  imageData?: string;
}

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface OCRResult {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Copilot Vision Module
 * Analyzes images, text, and objects from camera for AI instruction
 * Uses Tesseract.js for OCR and TensorFlow.js COCO-SSD for object detection
 */
export class CopilotVision {
  private cocoModel: CocoSsdType.ObjectDetection | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      
      const tfLib = await loadTF();
      const cocoLib = await loadCocoSsd();
      
      // Initialize TensorFlow.js backend
      await tfLib.ready();
      
      // Load COCO-SSD model
      this.cocoModel = await cocoLib.load({
        base: "mobilenet_v2",
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Copilot Vision:", error);
      console.error("Failed to initialize Copilot Vision:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Analyze visual input from camera or image
   */
  async analyzeVisualInput(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Promise<VisualContext> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Perform object detection
      const objects = await this.detectObjects(imageSource);
      
      // Perform OCR
      const extractedText = await this.performOCR(imageSource);
      
      // Classify the scene based on detected objects and text
      const sceneClassification = this.classifyScene(objects, extractedText);
      
      // Calculate overall confidence
      const confidence = this.calculateConfidence(objects, extractedText);
      
      // Log performance
      const responseTime = Date.now() - startTime;
      await this.logPerformance({
        module_name: "copilot_vision",
        operation_type: "visual_analysis",
        response_time_ms: responseTime,
        context: {
          objectsDetected: objects.length,
          textExtracted: extractedText.length,
          sceneClassification,
        },
      });
      
      return {
        detectedObjects: objects,
        extractedText: extractedText.map(r => r.text),
        sceneClassification,
        confidence,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error analyzing visual input:", error);
      console.error("Error analyzing visual input:", error);
      throw error;
    }
  }

  /**
   * Detect objects in image using COCO-SSD
   */
  private async detectObjects(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Promise<DetectedObject[]> {
    try {
      if (!this.cocoModel) {
        console.warn("COCO model not loaded, skipping object detection");
        console.warn("COCO model not loaded, skipping object detection");
        return [];
      }

      const predictions = await this.cocoModel.detect(imageSource as any);
      
      return predictions.map((pred: { class: string; score: number; bbox: [number, number, number, number] }) => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox as [number, number, number, number],
      }));
    } catch (error) {
      console.error("Error detecting objects:", error);
      console.error("Error detecting objects:", error);
      return [];
    }
  }

  /**
   * Perform OCR on image using Tesseract.js
   */
  private async performOCR(
    imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Promise<OCRResult[]> {
    try {
      const result = await Tesseract.recognize(imageSource as any, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
          }
        },
      });

      const anyResult: any = result as any;
      const words: any[] = (anyResult?.data?.words as any[]) || [];
      if (words.length === 0) {
        return [];
      }

      return words
        .filter((word: any) => word.confidence > 60)
        .map((word: any) => ({
          text: word.text,
          confidence: word.confidence / 100,
          bbox: word.bbox,
        }));
    } catch (error) {
      console.error("Error performing OCR:", error);
      console.error("Error performing OCR:", error);
      return [];
    }
  }

  /**
   * Classify the scene based on detected objects and text
   */
  private classifyScene(objects: DetectedObject[], text: OCRResult[]): string {
    // Count object categories
    const objectCategories = new Map<string, number>();
    objects.forEach(obj => {
      objectCategories.set(obj.class, (objectCategories.get(obj.class) || 0) + 1);
    });

    // Determine scene type based on dominant objects
    const categories = Array.from(objectCategories.keys());
    
    // Maritime/vessel related
    if (categories.some(c => ["boat", "ship", "vessel"].includes(c.toLowerCase()))) {
      return "maritime_vessel";
    }
    
    // Office/workspace
    if (categories.some(c => ["laptop", "keyboard", "mouse", "monitor"].includes(c.toLowerCase()))) {
      return "office_workspace";
    }
    
    // Document/paperwork
    if (text.length > 5 && categories.some(c => ["book", "paper"].includes(c.toLowerCase()))) {
      return "document_reading";
    }
    
    // Person/people
    if (categories.includes("person")) {
      const personCount = objectCategories.get("person") || 0;
      return personCount > 1 ? "group_interaction" : "single_person";
    }
    
    // Default
    return objects.length > 0 ? "general_scene" : "empty_scene";
  }

  /**
   * Calculate overall confidence based on detections
   */
  private calculateConfidence(objects: DetectedObject[], text: OCRResult[]): number {
    if (objects.length === 0 && text.length === 0) {
      return 0;
    }

    const objectConfidence = objects.length > 0
      ? objects.reduce((sum, obj) => sum + obj.score, 0) / objects.length
      : 0;

    const textConfidence = text.length > 0
      ? text.reduce((sum, t) => sum + t.confidence, 0) / text.length
      : 0;

    // Weighted average
    const totalWeight = (objects.length > 0 ? 1 : 0) + (text.length > 0 ? 1 : 0);
    return (objectConfidence + textConfidence) / totalWeight;
  }

  /**
   * Capture frame from video stream
   */
  async captureFrameFromVideo(videoElement: HTMLVideoElement): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /**
   * Start continuous vision analysis from video stream
   */
  async startContinuousAnalysis(
    videoElement: HTMLVideoElement,
    onUpdate: (context: VisualContext) => void,
    intervalMs: number = 2000
  ): Promise<() => void> {
    let isRunning = true;
    
    const analyze = async () => {
      if (!isRunning) return;
      
      try {
        const canvas = await this.captureFrameFromVideo(videoElement);
        const context = await this.analyzeVisualInput(canvas);
        onUpdate(context);
      } catch (error) {
        console.error("Error in continuous analysis:", error);
        console.error("Error in continuous analysis:", error);
      }
      
      if (isRunning) {
        setTimeout(analyze, intervalMs);
      }
    };
    
    // Start analysis
    analyze();
    
    // Return stop function
    return () => {
      isRunning = false;
    };
  }

  private async logPerformance(data: any) {
    try {
      await (supabase as any).from("ia_performance_log").insert(data);
    } catch (error) {
      console.error("Failed to log performance:", error);
      console.error("Failed to log performance:", error);
    }
  }
}

// Singleton instance
export const copilotVision = new CopilotVision();
