/**
 * NAUTI ONE - Design System Tier-1
 * Sistema de Design Unificado para UX de Classe Mundial
 * 
 * Este é o ponto central de importação para todos os componentes
 * padronizados do sistema de design.
 */

// === CORE COMPONENTS ===
export * from './PageShell';
export * from './DataGrid';
export * from './ActionHeader';
export * from './ConfirmModal';
export * from './FormField';
export * from './StatusBadge';
export * from './SkeletonLoaders';

// === STATE COMPONENTS ===
export { EmptyState } from '@/components/ui/EmptyState';
export { LoadingState, PageLoader, CardLoader, InlineLoader } from '@/components/ui/LoadingState';
export { ErrorState } from '@/components/ui/ErrorState';

// === FEEDBACK COMPONENTS ===
export * from './ToastNotification';
export * from './ProgressIndicator';

// === NAVIGATION ===
export * from './Breadcrumbs';
