/**
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Kit de componentes padronizados para UX consistente:
 * - PageTemplate: Estrutura de página padrão
 * - CRUDDrawer: Drawer para operações CRUD
 * - ConfirmDialog: Diálogo de confirmação
 * - UploadPanel: Painel de upload
 * - MapPanel: Painel de mapa com estados
 * 
 * Uso:
 * import { PageTemplate, CRUDDrawer, ConfirmDialog } from "@/components/ui/ux-system";
 */

// Page Template
export { PageTemplate } from "./PageTemplate";
export type { PageTemplateProps, PageAction } from "./PageTemplate";

// CRUD Drawer
export { CRUDDrawer, useCRUDDrawer } from "./CRUDDrawer";
export type { CRUDDrawerProps, CRUDMode } from "./CRUDDrawer";

// Confirm Dialog
export { ConfirmDialog, useConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps, ConfirmDialogVariant } from "./ConfirmDialog";

// Upload Panel
export { UploadPanel } from "./UploadPanel";
export type { UploadPanelProps, UploadedFile } from "./UploadPanel";

// Map Panel
export { MapPanel } from "./MapPanel";
export type { MapPanelProps, MapLayer } from "./MapPanel";

// Re-export existing UI components for convenience
export { DataTable } from "@/components/ui/data-table";
export { EmptyState } from "@/components/ui/EmptyState";
export { ErrorState } from "@/components/ui/ErrorState";
export { ModuleHeader } from "@/components/ui/module-header";
