/**
 * useStarFix Hook
 * React hook for StarFix API integration
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  registerVesselInStarFix,
  fetchStarFixInspections,
  getStarFixPerformanceMetrics,
  submitInspectionToStarFix,
  syncPendingInspections,
  getStarFixSyncStatus,
  type StarFixVessel,
  type StarFixInspection,
  type StarFixPerformanceMetrics,
} from '@/services/api/starfix/starfix.service';

export function useStarFix(vesselId?: string) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inspections, setInspections] = useState<StarFixInspection[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<StarFixPerformanceMetrics | null>(null);
  const [syncStatus, setSyncStatus] = useState({
    last_sync: null as string | null,
    pending_inspections: 0,
    synced_inspections: 0,
    failed_inspections: 0,
  });

  /**
   * Register vessel in StarFix
   */
  const registerVessel = async (vessel: StarFixVessel) => {
    setLoading(true);
    try {
      const result = await registerVesselInStarFix(vessel);
      
      if (result.success) {
        toast({
          title: "✅ Vessel Registered",
          description: `Vessel ${vessel.vessel_name} successfully registered in StarFix`,
        });
        return result;
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast({
        title: "❌ Registration Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch inspections from StarFix
   */
  const fetchInspections = async (imoNumber: string) => {
    setLoading(true);
    try {
      const data = await fetchStarFixInspections(imoNumber);
      setInspections(data);
      
      toast({
        title: "✅ Inspections Synced",
        description: `${data.length} inspections retrieved from StarFix`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "❌ Sync Failed",
        description: error instanceof Error ? error.message : 'Failed to fetch inspections',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get performance metrics
   */
  const fetchPerformanceMetrics = async (imoNumber: string, periodMonths: number = 12) => {
    setLoading(true);
    try {
      const metrics = await getStarFixPerformanceMetrics(imoNumber, periodMonths);
      setPerformanceMetrics(metrics);
      return metrics;
    } catch (error) {
      toast({
        title: "❌ Metrics Error",
        description: error instanceof Error ? error.message : 'Failed to fetch metrics',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit inspection to StarFix
   */
  const submitInspection = async (inspection: StarFixInspection) => {
    setLoading(true);
    try {
      const result = await submitInspectionToStarFix(inspection);
      
      if (result.success) {
        toast({
          title: "✅ Inspection Submitted",
          description: "Inspection data successfully sent to StarFix",
        });
        
        // Refresh inspections
        if (vesselId) {
          await fetchInspections(vesselId);
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
      return result;
    } catch (error) {
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync all pending inspections
   */
  const syncAllPending = async () => {
    setLoading(true);
    try {
      const result = await syncPendingInspections();
      
      toast({
        title: "✅ Sync Complete",
        description: `${result.synced} inspections synced, ${result.failed} failed`,
      });
      
      // Refresh sync status
      if (vesselId) {
        await refreshSyncStatus(vesselId);
      }
      
      return result;
    } catch (error) {
      toast({
        title: "❌ Sync Error",
        description: error instanceof Error ? error.message : 'Sync failed',
        variant: "destructive",
      });
      return { synced: 0, failed: 0 };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh sync status
   */
  const refreshSyncStatus = async (vId: string) => {
    try {
      const status = await getStarFixSyncStatus(vId);
      setSyncStatus(status);
      return status;
    } catch (error) {
      console.error('Error refreshing sync status:', error);
      return syncStatus;
    }
  };

  /**
   * Auto-load data when vesselId changes
   */
  useEffect(() => {
    if (vesselId) {
      refreshSyncStatus(vesselId);
    }
  }, [vesselId]);

  return {
    loading,
    inspections,
    performanceMetrics,
    syncStatus,
    registerVessel,
    fetchInspections,
    fetchPerformanceMetrics,
    submitInspection,
    syncAllPending,
    refreshSyncStatus,
  };
}
