/**
 * React Singleton - Ensures single React instance across all modules
 * This file MUST be imported FIRST before any other imports
 * 
 * Fixes "Cannot read properties of null (reading 'useEffect')" error
 * caused by duplicate React instances
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

// Store references globally to prevent duplicates
if (typeof window !== "undefined") {
  const win = window as unknown as {
    __REACT_SINGLETON__?: typeof React;
    __REACT_DOM_SINGLETON__?: typeof ReactDOM;
    __REACT_DOM_CLIENT_SINGLETON__?: typeof ReactDOMClient;
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
  };

  // Set globals if not already set
  if (!win.__REACT_SINGLETON__) {
    win.__REACT_SINGLETON__ = React;
    win.__REACT_DOM_SINGLETON__ = ReactDOM;
    win.__REACT_DOM_CLIENT_SINGLETON__ = ReactDOMClient;
    win.React = React;
    win.ReactDOM = ReactDOM;
  }
}

// Export for use in other modules
export { React, ReactDOM, ReactDOMClient };

// Re-export common hooks to ensure consistency
export const {
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
  useTransition,
  useId,
  useSyncExternalStore,
  useInsertionEffect,
  createElement,
  createContext,
  createRef,
  forwardRef,
  memo,
  lazy,
  Suspense,
  Fragment,
  StrictMode,
  Children,
  cloneElement,
  isValidElement
} = React;
