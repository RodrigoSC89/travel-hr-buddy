/**
 * PATCH 239 - Immersive Scenario Simulator
 * 3D scenario rendering and AI-driven simulation
 * 
 * @module ai/simulation/scenarioSimulator
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

// Lazy import THREE.js para não incluir ~600KB no bundle inicial
type ThreeModule = typeof import("three");

async function loadThree(): Promise<ThreeModule> {
  const mod = await import(/* @vite-ignore */ "three");
  return mod;
}

export type ScenarioType = "emergency" | "training" | "planning" | "inspection";
export type SimulationState = "idle" | "loading" | "running" | "paused" | "completed";

export interface ScenarioConfig {
  type: ScenarioType;
  environment: string;
  objectives: string[];
  aiEnabled?: boolean;
  parameters?: Record<string, any>;
}

export interface SimulationEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  aiResponse?: string;
  impact?: number;
}

export interface DecisionLog {
  eventId: string;
  decision: string;
  reasoning: string;
  outcome: string;
  timestamp: string;
}

class ScenarioSimulator {
  private three: ThreeModule | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private animationFrameId: number | null = null;
  private aiEventInterval: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private state: SimulationState = "idle";
  private currentScenario: ScenarioConfig | null = null;
  private events: SimulationEvent[] = [];
  private decisions: DecisionLog[] = [];
  private startTime: number = 0;

  private async ensureThree(): Promise<ThreeModule> {
    if (!this.three) {
      this.three = await loadThree();
    }
    return this.three;
  }

  private getThree(): ThreeModule {
    if (!this.three) {
      throw new Error("Three.js not loaded. Call initialize first.");
    }
    return this.three;
  }

  /**
   * Initialize 3D environment
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.scene) {
      logger.warn("[Simulator] Already initialized");
      return;
    }

    try {
      const THREE = await this.ensureThree();
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87ceeb);
      this.scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 10, 30);
      this.camera.lookAt(0, 0, 0);

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      // Add lights
      this.setupLighting();

      // Handle window resize
      this.resizeHandler = () => this.handleResize(container);
      window.addEventListener("resize", this.resizeHandler);

      logger.info("[Simulator] ✓ 3D environment initialized");
    } catch (error) {
      logger.error("[Simulator] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x334455, 0.4);
    this.scene.add(hemiLight);
  }

  /**
   * Load and render scenario
   */
  async loadScenario(config: ScenarioConfig): Promise<void> {
    if (!this.scene) {
      throw new Error("Simulator not initialized");
    }

    this.state = "loading";
    this.currentScenario = config;

    try {
      // Clear existing objects
      this.clearScene();

      // Load environment based on type
      await this.buildEnvironment(config.environment);

      // Add interactive elements
      this.addInteractiveElements();

      logger.info(`[Simulator] ✓ Scenario loaded: ${config.type}`);
      this.state = "idle";
    } catch (error) {
      logger.error("[Simulator] Failed to load scenario:", error);
      this.state = "idle";
      throw error;
    }
  }

  /**
   * Clear scene objects
   */
  private clearScene(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child instanceof THREE.Light) {
        // Keep lights
        this.scene.remove(child);
        this.scene.add(child);
      } else {
        this.scene.remove(child);
      }
    }
  }

  /**
   * Build 3D environment
   */
  private async buildEnvironment(environment: string): Promise<void> {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228b22,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add environment-specific objects
    switch (environment) {
    case "maritime":
      this.buildMaritimeEnvironment();
      break;
    case "industrial":
      this.buildIndustrialEnvironment();
      break;
    case "emergency":
      this.buildEmergencyEnvironment();
      break;
    default:
      this.buildDefaultEnvironment();
    }
  }

  /**
   * Build maritime environment
   */
  private buildMaritimeEnvironment(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Water plane
    const waterGeometry = new THREE.PlaneGeometry(200, 200);
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e90ff,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.1;
    this.scene.add(water);

    // Ship
    const shipGeometry = new THREE.BoxGeometry(10, 3, 20);
    const shipMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const ship = new THREE.Mesh(shipGeometry, shipMaterial);
    ship.position.set(0, 1.5, 0);
    ship.castShadow = true;
    this.scene.add(ship);
  }

  /**
   * Build industrial environment
   */
  private buildIndustrialEnvironment(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Warehouse building
    const buildingGeometry = new THREE.BoxGeometry(30, 15, 40);
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(0, 7.5, 0);
    building.castShadow = true;
    this.scene.add(building);

    // Storage containers
    for (let i = 0; i < 5; i++) {
      const containerGeometry = new THREE.BoxGeometry(3, 3, 6);
      const containerMaterial = new THREE.MeshStandardMaterial({ 
        color: Math.random() * 0xffffff 
      });
      const container = new THREE.Mesh(containerGeometry, containerMaterial);
      container.position.set(
        (Math.random() - 0.5) * 20,
        1.5,
        (Math.random() - 0.5) * 20
      );
      container.castShadow = true;
      this.scene.add(container);
    }
  }

  /**
   * Build emergency environment
   */
  private buildEmergencyEnvironment(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Emergency lights (red)
    for (let i = 0; i < 4; i++) {
      const lightGeometry = new THREE.SphereGeometry(0.5);
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      const angle = (i / 4) * Math.PI * 2;
      light.position.set(Math.cos(angle) * 20, 5, Math.sin(angle) * 20);
      this.scene.add(light);

      // Point light
      const pointLight = new THREE.PointLight(0xff0000, 2, 50);
      pointLight.position.copy(light.position);
      this.scene.add(pointLight);
    }
  }

  /**
   * Build default environment
   */
  private buildDefaultEnvironment(): void {
    const THREE = this.getThree();
    if (!this.scene) return;

    // Simple cube
    const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 2.5, 0);
    cube.castShadow = true;
    this.scene.add(cube);
  }

  /**
   * Add interactive elements
   */
  private addInteractiveElements(): void {
    // Add markers, buttons, etc.
    // This would be expanded based on scenario requirements
  }

  /**
   * Start simulation
   */
  start(): void {
    if (this.state === "running") {
      logger.warn("[Simulator] Simulation already running");
      return;
    }

    this.state = "running";
    this.startTime = Date.now();
    this.animate();
    
    if (this.currentScenario?.aiEnabled) {
      this.startAISimulation();
    }

    logger.info("[Simulator] ✓ Simulation started");
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    if (this.state !== "running") return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    // Update scene
    if (this.scene && this.camera && this.renderer) {
      // Rotate camera around scene
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.camera.position.x = Math.cos(elapsed * 0.1) * 30;
      this.camera.position.z = Math.sin(elapsed * 0.1) * 30;
      this.camera.lookAt(0, 0, 0);

      this.renderer.render(this.scene, this.camera);
    }
  };

  /**
   * Start AI-driven simulation
   */
  private async startAISimulation(): Promise<void> {
    this.clearAiInterval();
    this.aiEventInterval = window.setInterval(() => {
      if (this.state !== "running") {
        this.clearAiInterval();
        return;
      }

      this.generateSimulationEvent();
    }, 5000); // Every 5 seconds
  }

  /**
   * Generate simulation event
   */
  private async generateSimulationEvent(): Promise<void> {
    const eventTypes = ["warning", "alert", "info", "critical"];
    const event: SimulationEvent = {
      id: `event_${Date.now()}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      description: `Simulated event at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      impact: Math.random()
    };

    // Get AI response if enabled
    if (this.currentScenario?.aiEnabled) {
      event.aiResponse = await this.getAIResponse(event);
    }

    this.events.push(event);
    await this.logEvent(event);
    
    logger.info("[Simulator] Event generated:", event);
  }

  /**
   * Get AI response to event
   */
  private async getAIResponse(event: SimulationEvent): Promise<string> {
    try {
      const { data } = await supabase.functions.invoke("simulate-ai-decision", {
        body: {
          event,
          scenario: this.currentScenario
        }
      });

      return data?.response || "No AI response";
    } catch (error) {
      logger.error("[Simulator] AI response failed:", error);
      return "AI response unavailable";
    }
  }

  /**
   * Log simulation event
   */
  private async logEvent(event: SimulationEvent): Promise<void> {
    try {
      await (supabase as any).from("simulation_event_log").insert({
        event_id: event.id,
        event_type: event.type,
        description: event.description,
        ai_response: event.aiResponse,
        impact: event.impact,
        timestamp: event.timestamp
      });
    } catch (error) {
      logger.error("Failed to log event", { error });
    }
  }

  /**
   * Log decision
   */
  async logDecision(decision: DecisionLog): Promise<void> {
    this.decisions.push(decision);
    
    try {
      await (supabase as any).from("simulation_decision_log").insert(decision);
      logger.info("Decision logged");
    } catch (error) {
      logger.error("Failed to log decision", { error });
    }
  }

  /**
   * Pause simulation
   */
  pause(): void {
    this.state = "paused";
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    logger.info("[Simulator] Simulation paused");
  }

  /**
   * Resume simulation
   */
  resume(): void {
    if (this.state === "paused") {
      this.state = "running";
      this.animate();
      if (this.currentScenario?.aiEnabled) {
        this.startAISimulation();
      }
      logger.info("[Simulator] Simulation resumed");
    }
  }

  /**
   * Stop simulation
   */
  stop(): void {
    this.state = "completed";
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.clearAiInterval();
    logger.info("[Simulator] Simulation stopped");
  }

  /**
   * Handle window resize
   */
  private handleResize(container: HTMLElement): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }

  /**
   * Get simulation data
   */
  getSimulationData() {
    return {
      state: this.state,
      scenario: this.currentScenario,
      events: this.events,
      decisions: this.decisions,
      duration: this.startTime ? Date.now() - this.startTime : 0
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stop();

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.events = [];
    this.decisions = [];
    this.three = null;
    
    logger.info("[Simulator] Cleanup complete");
  }

  private clearAiInterval(): void {
    if (this.aiEventInterval) {
      clearInterval(this.aiEventInterval);
      this.aiEventInterval = null;
    }
  }
}

export const scenarioSimulator = new ScenarioSimulator();
