/**
 * React Singleton - CRITICAL: Ensures single React instance
 * This file MUST be imported first in main.tsx to prevent duplicate React issues
 * 
 * Error this prevents:
 * - "Cannot read properties of null (reading 'useEffect')"
 * - "Invalid hook call. Hooks can only be called inside of the body of a function component"
 */

// Import React hooks directly to ensure they're from the same instance
import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef, 
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useId,
  useInsertionEffect,
  useSyncExternalStore,
  useTransition
} from "react";

import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

// Attach to window to ensure global singleton
if (typeof window !== "undefined") {
  const win = window as unknown as { 
    React?: typeof React; 
    ReactDOM?: typeof ReactDOM;
    __REACT_SINGLETON_INITIALIZED__?: boolean;
  };
  
  // Only initialize once
  if (!win.__REACT_SINGLETON_INITIALIZED__) {
    win.React = React;
    win.ReactDOM = ReactDOM;
    win.__REACT_SINGLETON_INITIALIZED__ = true;
  }
}

// Re-export everything for consistent imports
export { 
  React, 
  ReactDOM, 
  createRoot,
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef, 
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useId,
  useInsertionEffect,
  useSyncExternalStore,
  useTransition
};

export default React;
