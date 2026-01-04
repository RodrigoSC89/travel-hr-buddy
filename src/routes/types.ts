/**
 * Route Type Definitions
 * Centralized route metadata and types
 */
import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

export interface RouteMetadata {
  title: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  roles?: string[];
  icon?: ReactNode;
  description?: string;
}

export interface AppRoute {
  path: string;
  element: ReactNode;
  meta?: RouteMetadata;
  children?: AppRoute[];
}

export type LazyComponent = LazyExoticComponent<ComponentType<Record<string, unknown>>>;
