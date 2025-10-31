/**
 * Document Bundle
 * PATCH 540 Fase 4 - Agrupa componentes de documentos para reduzir lazy loading
 */

import { lazy } from "react";

// Document management - Lazy loaded as bundle
export const DocumentList = lazy(() => import("@/pages/admin/documents/DocumentList"));
export const DocumentView = lazy(() => import("@/pages/admin/documents/DocumentView"));
export const DocumentHistory = lazy(() => import("@/pages/admin/documents/DocumentHistory"));
export const DocumentEditorPage = lazy(() => import("@/pages/admin/documents/DocumentEditorPage"));
export const CollaborativeEditor = lazy(() => import("@/pages/admin/documents/CollaborativeEditor"));
export const DocumentEditorDemo = lazy(() => import("@/pages/admin/documents/DocumentEditorDemo"));
export const RestoreDashboard = lazy(() => import("@/pages/admin/documents/restore-dashboard"));
