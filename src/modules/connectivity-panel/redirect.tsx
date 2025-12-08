/**
 * Connectivity Panel - Redirects to unified Maritime Connectivity (SATCOM)
 * PATCH: UNIFY-CONNECTIVITY - Connectivity modules merged into SATCOM
 * 
 * All connectivity features are now in the unified SATCOM module:
 * - Satellite connectivity monitoring
 * - Offline mode synchronization
 * - Signal strength tracking
 * - Multi-provider support (Iridium, Starlink, Inmarsat)
 */

export { default } from "@/modules/satcom";
export { default as ConnectivityPanel } from "@/modules/satcom";
