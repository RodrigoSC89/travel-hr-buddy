import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import "webxr-polyfill";

interface XRContextType {
  isXRSupported: boolean;
  isXRActive: boolean;
  xrSession: XRSession | null;
  startXRSession: () => Promise<void>;
  endXRSession: () => Promise<void>;
  xrMode: "immersive-vr" | "immersive-ar" | "inline" | null;
  error: string | null;
}

const XRContext = createContext<XRContextType | undefined>(undefined);

interface XRProviderProps {
  children: ReactNode;
  defaultMode?: "immersive-vr" | "immersive-ar" | "inline";
}

export function XRProvider({ children, defaultMode = "inline" }: XRProviderProps) {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isXRActive, setIsXRActive] = useState(false);
  const [xrSession, setXRSession] = useState<XRSession | null>(null);
  const [xrMode, setXRMode] = useState<"immersive-vr" | "immersive-ar" | "inline" | null>(defaultMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkXRSupport();
  }, []);

  const checkXRSupport = async () => {
    try {
      if (!navigator.xr) {
        console.warn("WebXR not supported in this browser");
        setError("WebXR not supported. Using fallback mode.");
        setIsXRSupported(false);
        return;
      }

      // Check for immersive VR support
      const vrSupported = await navigator.xr.isSessionSupported("immersive-vr");
      
      // Check for immersive AR support
      const arSupported = await navigator.xr.isSessionSupported("immersive-ar");
      
      // Check for inline support
      const inlineSupported = await navigator.xr.isSessionSupported("inline");

      if (vrSupported || arSupported || inlineSupported) {
        setIsXRSupported(true);
        console.log("WebXR supported:", { vrSupported, arSupported, inlineSupported });
      } else {
        setIsXRSupported(false);
        setError("No XR modes supported. Using fallback mode.");
      }
    } catch (err) {
      console.error("Error checking XR support:", err);
      setError("Failed to check XR support");
      setIsXRSupported(false);
    }
  };

  const startXRSession = async () => {
    try {
      if (!navigator.xr) {
        throw new Error("WebXR not available");
      }

      if (!xrMode) {
        throw new Error("XR mode not set");
      }

      // Check if the desired mode is supported
      const isSupported = await navigator.xr.isSessionSupported(xrMode);
      if (!isSupported) {
        throw new Error(`${xrMode} not supported`);
      }

      // Request XR session
      const session = await navigator.xr.requestSession(xrMode, {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking", "layers"],
      });

      setXRSession(session);
      setIsXRActive(true);
      setError(null);

      // Handle session end
      session.addEventListener("end", () => {
        setXRSession(null);
        setIsXRActive(false);
        console.log("XR session ended");
      });

      console.log("XR session started:", xrMode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to start XR session:", errorMessage);
      setError(`Failed to start XR session: ${errorMessage}`);
      setIsXRActive(false);
    }
  };

  const endXRSession = async () => {
    try {
      if (xrSession) {
        await xrSession.end();
        setXRSession(null);
        setIsXRActive(false);
        console.log("XR session ended manually");
      }
    } catch (err) {
      console.error("Error ending XR session:", err);
      setError("Failed to end XR session");
    }
  };

  const value: XRContextType = {
    isXRSupported,
    isXRActive,
    xrSession,
    startXRSession,
    endXRSession,
    xrMode,
    error,
  };

  return <XRContext.Provider value={value}>{children}</XRContext.Provider>;
}

export function useXR() {
  const context = useContext(XRContext);
  if (context === undefined) {
    throw new Error("useXR must be used within an XRProvider");
  }
  return context;
}
