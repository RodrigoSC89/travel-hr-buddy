import React from "react";
import { Loading } from "./Loading";

/**
 * Simple Loader component wrapper for Suspense fallbacks
 * Used in lazy-loaded components
 */
export const Loader: React.FC = () => {
  return <Loading variant="spinner" size="lg" fullScreen message="Carregando módulo..." />;
};
