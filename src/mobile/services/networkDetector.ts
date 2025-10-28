/**
 * PATCH 162.0 - Network Detector
 * Detects network status and quality
 */

import { NetworkStatus } from "../types";

type NetworkChangeCallback = (status: NetworkStatus) => void;

class NetworkDetector {
  private listeners: NetworkChangeCallback[] = [];
  private currentStatus: NetworkStatus;

  constructor() {
    this.currentStatus = this.getCurrentStatus();
    this.initializeListeners();
  }

  /**
   * Get current network status
   */
  private getCurrentStatus(): NetworkStatus {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return { isOnline: true };
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }

  /**
   * Initialize event listeners
   */
  private initializeListeners(): void {
    if (typeof window === "undefined") return;

    // Listen for online/offline events
    window.addEventListener("online", () => this.handleStatusChange());
    window.addEventListener("offline", () => this.handleStatusChange());

    // Listen for connection quality changes
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener("change", () => this.handleStatusChange());
    }
  }

  /**
   * Handle network status change
   */
  private handleStatusChange(): void {
    const newStatus = this.getCurrentStatus();
    
    // Only notify if status actually changed
    if (
      newStatus.isOnline !== this.currentStatus.isOnline ||
      newStatus.effectiveType !== this.currentStatus.effectiveType
    ) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);
    }
  }

  /**
   * Add listener for network changes
   */
  public onChange(callback: NetworkChangeCallback): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Add listener (alias for onChange for consistency)
   */
  public addListener(callback: (isOnline: boolean) => void): () => void {
    const wrappedCallback: NetworkChangeCallback = (status) => {
      callback(status.isOnline);
    };
    this.listeners.push(wrappedCallback);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== wrappedCallback);
    };
  }

  /**
   * Check if currently online
   */
  public async isOnline(): Promise<boolean> {
    return this.currentStatus.isOnline;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in network status callback:", error);
      }
    });
  }

  /**
   * Get current status
   */
  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Check if connection is good enough for sync
   */
  public isGoodConnection(): boolean {
    const { isOnline, effectiveType } = this.currentStatus;
    
    if (!isOnline) return false;
    
    // Consider 3g and better as good
    if (!effectiveType) return true; // Assume good if we can't detect
    
    return ["3g", "4g"].includes(effectiveType);
  }

  /**
   * Wait for online connection
   */
  public async waitForOnline(timeout: number = 30000): Promise<boolean> {
    if (this.currentStatus.isOnline) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.onChange((status) => {
        if (status.isOnline) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

export const networkDetector = new NetworkDetector();
