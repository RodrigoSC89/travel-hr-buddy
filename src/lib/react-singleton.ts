/**
 * React Singleton - Ensures single React instance
 * This file is imported early to guarantee React is loaded once
 */
import * as React from "react";
import * as ReactDOM from "react-dom";

// Export React to ensure single instance is used everywhere
export { React, ReactDOM };

// Validation - log if multiple instances detected
if (typeof window !== "undefined") {
  const existingReact = (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: { renderers?: Map<number, unknown> } }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (existingReact?.renderers && existingReact.renderers.size > 1) {
    console.warn("[React Singleton] Multiple React renderers detected!");
  }
}
