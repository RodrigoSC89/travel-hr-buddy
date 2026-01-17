/**
 * React Singleton - PATCH 852
 * Ensures single React instance across the entire application
 * MUST be imported before any other React imports
 */
import React from "react";
import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

// Attach React to window to ensure global singleton
if (typeof window !== "undefined") {
  const win = window as unknown as {
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
    __REACT_SINGLETON_LOADED__?: boolean;
  };

  if (!win.__REACT_SINGLETON_LOADED__) {
    win.React = React;
    win.ReactDOM = ReactDOM;
    win.__REACT_SINGLETON_LOADED__ = true;
  }
}

// Export to ensure consistent imports
export { React, ReactDOM, ReactDOMClient };
export default React;
