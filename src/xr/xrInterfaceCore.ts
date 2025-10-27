// @ts-nocheck
/**
 * PATCH 236 - XR Interface Core
 * WebXR initialization, provider management, and overlay system
 * 
 * @module xr/xrInterfaceCore
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";
import WebXRPolyfill from "webxr-polyfill";

export type XRMode = "vr" | "ar" | "inline";
export type XRSessionState = "idle" | "starting" | "active" | "ending" | "error";

export interface XRConfig {
  mode: XRMode;
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  enableOverlay?: boolean;
}

export interface XRSessionInfo {
  mode: XRMode;
  state: XRSessionState;
  session: XRSession | null;
  referenceSpace: XRReferenceSpace | null;
}

class XRInterfaceCore {
  private polyfill: any = null;
  private currentSession: XRSessionInfo | null = null;
  private isInitialized = false;
  private overlayElement: HTMLElement | null = null;

  /**
   * Initialize WebXR with polyfill support
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn("[XRCore] Already initialized");
      return true;
    }

    try {
      // Check native WebXR support
      if (!("xr" in navigator)) {
        logger.info("[XRCore] WebXR not natively supported, loading polyfill...");
        this.polyfill = new WebXRPolyfill();
      }

      // Verify XR availability
      if (!navigator.xr) {
        throw new Error("WebXR not available even with polyfill");
      }

      this.isInitialized = true;
      logger.info("[XRCore] ✓ WebXR initialized successfully");
      return true;
    } catch (error) {
      logger.error("[XRCore] Failed to initialize:", error);
      return false;
    }
  }

  /**
   * Check if specific XR mode is supported
   */
  async isSupported(mode: XRMode): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const sessionMode = mode === "vr" ? "immersive-vr" : 
        mode === "ar" ? "immersive-ar" : "inline";
      
      return await navigator.xr!.isSessionSupported(sessionMode);
    } catch (error) {
      logger.error(`[XRCore] Error checking ${mode} support:`, error);
      return false;
    }
  }

  /**
   * Start XR session
   */
  async startSession(config: XRConfig): Promise<XRSessionInfo | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.currentSession?.state === "active") {
      logger.warn("[XRCore] Session already active");
      return this.currentSession;
    }

    const sessionMode = config.mode === "vr" ? "immersive-vr" : 
      config.mode === "ar" ? "immersive-ar" : "inline";

    try {
      this.currentSession = {
        mode: config.mode,
        state: "starting",
        session: null,
        referenceSpace: null
      };

      const sessionInit: XRSessionInit = {
        requiredFeatures: config.requiredFeatures || ["local"],
        optionalFeatures: config.optionalFeatures || []
      };

      const session = await navigator.xr!.requestSession(sessionMode, sessionInit);
      const referenceSpace = await session.requestReferenceSpace("local");

      this.currentSession = {
        mode: config.mode,
        state: "active",
        session,
        referenceSpace
      };

      // Setup session end handler
      session.addEventListener("end", () => {
        this.handleSessionEnd();
      });

      // Create overlay if enabled
      if (config.enableOverlay) {
        this.createOverlay();
      }

      logger.info(`[XRCore] ✓ ${config.mode.toUpperCase()} session started`);
      return this.currentSession;
    } catch (error) {
      logger.error("[XRCore] Failed to start session:", error);
      if (this.currentSession) {
        this.currentSession.state = "error";
      }
      return null;
    }
  }

  /**
   * End current XR session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession?.session) {
      logger.warn("[XRCore] No active session to end");
      return;
    }

    try {
      this.currentSession.state = "ending";
      await this.currentSession.session.end();
      logger.info("[XRCore] Session ended successfully");
    } catch (error) {
      logger.error("[XRCore] Error ending session:", error);
    }
  }

  /**
   * Create UI overlay for XR mode
   */
  private createOverlay(): void {
    if (this.overlayElement) {
      return; // Already exists
    }

    this.overlayElement = document.createElement("div");
    this.overlayElement.id = "xr-overlay";
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px;
    `;

    // Top bar
    const topBar = document.createElement("div");
    topBar.style.cssText = `
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      pointer-events: auto;
      backdrop-filter: blur(10px);
    `;
    topBar.textContent = `XR Mode: ${this.currentSession?.mode.toUpperCase() || "Unknown"}`;

    // Bottom controls
    const bottomBar = document.createElement("div");
    bottomBar.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 10px;
    `;

    const exitButton = document.createElement("button");
    exitButton.textContent = "Exit XR";
    exitButton.style.cssText = `
      background: rgba(255, 0, 0, 0.8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      pointer-events: auto;
      font-weight: bold;
    `;
    exitButton.onclick = () => this.endSession();

    bottomBar.appendChild(exitButton);
    this.overlayElement.appendChild(topBar);
    this.overlayElement.appendChild(bottomBar);
    document.body.appendChild(this.overlayElement);

    logger.info("[XRCore] ✓ Overlay created");
  }

  /**
   * Remove overlay
   */
  private removeOverlay(): void {
    if (this.overlayElement) {
      document.body.removeChild(this.overlayElement);
      this.overlayElement = null;
      logger.info("[XRCore] Overlay removed");
    }
  }

  /**
   * Handle session end
   */
  private handleSessionEnd(): void {
    logger.info("[XRCore] Session ended");
    this.removeOverlay();
    this.currentSession = null;
  }

  /**
   * Get current session info
   */
  getSessionInfo(): XRSessionInfo | null {
    return this.currentSession;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasPolyfill: this.polyfill !== null,
      currentSession: this.currentSession ? {
        mode: this.currentSession.mode,
        state: this.currentSession.state,
        hasOverlay: this.overlayElement !== null
      } : null
    };
  }
}

export const xrInterfaceCore = new XRInterfaceCore();
