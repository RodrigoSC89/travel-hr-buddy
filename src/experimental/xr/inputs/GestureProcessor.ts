import { Hands, Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export interface GestureData {
  type: string;
  confidence: number;
  landmarks?: any;
  handedness?: string;
  timestamp: string;
}

export type GestureType = 
  | "pointing"
  | "grab"
  | "pinch"
  | "swipe_left"
  | "swipe_right"
  | "swipe_up"
  | "swipe_down"
  | "open_palm"
  | "closed_fist"
  | "thumbs_up"
  | "thumbs_down"
  | "peace_sign"
  | "unknown";

/**
 * GestureProcessor
 * Processes hand gestures using MediaPipe Hands
 */
export class GestureProcessor {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  private isInitialized = false;
  private onGestureCallback?: (gesture: GestureData) => void;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.hands.onResults((results: Results) => {
        this.processResults(results);
      });

      this.isInitialized = true;
      console.log("GestureProcessor initialized");
    } catch (error) {
      console.error("Failed to initialize GestureProcessor:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Start gesture recognition from video stream
   */
  async startRecognition(
    videoElement: HTMLVideoElement,
    onGesture: (gesture: GestureData) => void
  ): Promise<void> {
    if (!this.isInitialized || !this.hands) {
      throw new Error("GestureProcessor not initialized");
    }

    this.onGestureCallback = onGesture;

    // Initialize camera
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
    });

    await this.camera.start();
    console.log("Gesture recognition started");
  }

  /**
   * Stop gesture recognition
   */
  stopRecognition(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    this.onGestureCallback = undefined;
    console.log("Gesture recognition stopped");
  }

  /**
   * Process MediaPipe hand detection results
   */
  private processResults(results: Results): void {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    // Process each detected hand
    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness?.[index]?.label || "Unknown";
      const gesture = this.recognizeGesture(landmarks);

      if (gesture && this.onGestureCallback) {
        const gestureData: GestureData = {
          type: gesture.type,
          confidence: gesture.confidence,
          landmarks: landmarks,
          handedness: handedness,
          timestamp: new Date().toISOString(),
        };

        this.onGestureCallback(gestureData);
      }
    });
  }

  /**
   * Recognize gesture from hand landmarks
   */
  private recognizeGesture(landmarks: any[]): { type: GestureType; confidence: number } | null {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    // Calculate finger states (extended or folded)
    const fingerStates = this.calculateFingerStates(landmarks);

    // Recognize specific gestures
    const gesture = this.matchGesturePattern(fingerStates, landmarks);

    return gesture;
  }

  /**
   * Calculate which fingers are extended
   */
  private calculateFingerStates(landmarks: any[]): {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  } {
    // Thumb
    const thumbExtended = landmarks[4].x < landmarks[3].x;

    // Index finger
    const indexExtended = landmarks[8].y < landmarks[6].y;

    // Middle finger
    const middleExtended = landmarks[12].y < landmarks[10].y;

    // Ring finger
    const ringExtended = landmarks[16].y < landmarks[14].y;

    // Pinky finger
    const pinkyExtended = landmarks[20].y < landmarks[18].y;

    return {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
    };
  }

  /**
   * Match finger states to gesture patterns
   */
  private matchGesturePattern(
    fingerStates: ReturnType<typeof this.calculateFingerStates>,
    landmarks: any[]
  ): { type: GestureType; confidence: number } {
    const { thumb, index, middle, ring, pinky } = fingerStates;

    // Pointing gesture (index finger extended, others folded)
    if (!thumb && index && !middle && !ring && !pinky) {
      return { type: "pointing", confidence: 0.9 };
    }

    // Open palm (all fingers extended)
    if (thumb && index && middle && ring && pinky) {
      return { type: "open_palm", confidence: 0.95 };
    }

    // Closed fist (all fingers folded)
    if (!thumb && !index && !middle && !ring && !pinky) {
      return { type: "closed_fist", confidence: 0.9 };
    }

    // Thumbs up
    if (thumb && !index && !middle && !ring && !pinky) {
      return { type: "thumbs_up", confidence: 0.85 };
    }

    // Peace sign (index and middle extended)
    if (!thumb && index && middle && !ring && !pinky) {
      return { type: "peace_sign", confidence: 0.85 };
    }

    // Pinch gesture (thumb and index close together)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    
    if (distance < 0.05) {
      return { type: "pinch", confidence: 0.8 };
    }

    // Unknown gesture
    return { type: "unknown", confidence: 0.3 };
  }

  /**
   * Check if processor is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const gestureProcessor = new GestureProcessor();
