/**
 * useTerrastar Hook
 * React hook for Terrastar Ionosphere API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getIonosphericData,
  requestPositionCorrection,
  subscribeToIonosphericAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  getIonosphericForecast,
  getCorrectionStatistics,
  validateServiceStatus,
  type TerrastarIonosphereData,
  type TerrastarCorrection,
  type TerrastarAlert,
} from '@/services/api/terrastar/terrastar.service';

export function useTerrastar(vesselId?: string) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ionosphereData, setIonosphereData] = useState<TerrastarIonosphereData | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<TerrastarAlert[]>([]);
  const [correction, setCorrection] = useState<TerrastarCorrection | null>(null);
  const [serviceStatus, setServiceStatus] = useState({
    available: false,
    service_level: 'UNKNOWN',
    latency_ms: 0,
    message: '',
  });
  const [statistics, setStatistics] = useState({
    total_corrections: 0,
    average_accuracy: 0,
    max_accuracy: 0,
    min_accuracy: 0,
    average_correction_age: 0,
    signal_quality_avg: 0,
  });

  /**
   * Fetch current ionospheric data
   */
  const fetchIonosphereData = useCallback(async (lat: number, lon: number, alt: number = 0) => {
    setLoading(true);
    try {
      const data = await getIonosphericData(lat, lon, alt);
      setIonosphereData(data);
      return data;
    } catch (error) {
      toast({
        title: "❌ Ionosphere Data Error",
        description: error instanceof Error ? error.message : 'Failed to fetch data',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Request position correction
   */
  const getCorrection = useCallback(async (
    vId: string,
    lat: number,
    lon: number,
    alt: number = 0
  ) => {
    setLoading(true);
    try {
      const correctionData = await requestPositionCorrection(vId, lat, lon, alt);
      setCorrection(correctionData);
      
      toast({
        title: "✅ Position Corrected",
        description: `Accuracy: ${correctionData.horizontal_accuracy.toFixed(2)}m`,
      });
      
      return correctionData;
    } catch (error) {
      toast({
        title: "❌ Correction Error",
        description: error instanceof Error ? error.message : 'Failed to get correction',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Subscribe to ionospheric alerts
   */
  const subscribeAlerts = useCallback(async (
    vId: string,
    boundingBox: {
      lat_min: number;
      lat_max: number;
      lon_min: number;
      lon_max: number;
    }
  ) => {
    setLoading(true);
    try {
      const result = await subscribeToIonosphericAlerts(vId, boundingBox);
      
      toast({
        title: "✅ Alert Subscription Active",
        description: "You will receive ionospheric alerts for your area",
      });
      
      // Refresh active alerts
      await refreshAlerts(vId);
      
      return result;
    } catch (error) {
      toast({
        title: "❌ Subscription Error",
        description: error instanceof Error ? error.message : 'Failed to subscribe',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Refresh active alerts
   */
  const refreshAlerts = useCallback(async (vId: string) => {
    try {
      const alerts = await getActiveAlerts(vId);
      setActiveAlerts(alerts);
      
      // Show critical alerts as toast
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        toast({
          title: "⚠️ Critical Ionospheric Alert",
          description: criticalAlerts[0].message,
          variant: "destructive",
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error refreshing alerts:', error);
      return [];
    }
  }, [toast]);

  /**
   * Acknowledge an alert
   */
  const acknowledgeAlertById = useCallback(async (alertId: string) => {
    try {
      const success = await acknowledgeAlert(alertId);
      
      if (success) {
        toast({
          title: "✅ Alert Acknowledged",
          description: "Alert has been marked as acknowledged",
        });
        
        // Refresh alerts
        if (vesselId) {
          await refreshAlerts(vesselId);
        }
      }
      
      return success;
    } catch (error) {
      toast({
        title: "❌ Acknowledge Error",
        description: error instanceof Error ? error.message : 'Failed to acknowledge',
        variant: "destructive",
      });
      return false;
    }
  }, [toast, vesselId, refreshAlerts]);

  /**
   * Get ionospheric forecast
   */
  const getForecast = useCallback(async (
    lat: number,
    lon: number,
    hours: number = 24
  ) => {
    setLoading(true);
    try {
      const forecast = await getIonosphericForecast(lat, lon, hours);
      return forecast;
    } catch (error) {
      toast({
        title: "❌ Forecast Error",
        description: error instanceof Error ? error.message : 'Failed to get forecast',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Get correction statistics
   */
  const refreshStatistics = useCallback(async (vId: string, days: number = 7) => {
    try {
      const stats = await getCorrectionStatistics(vId, days);
      setStatistics(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return statistics;
    }
  }, [statistics]);

  /**
   * Check service status
   */
  const checkServiceStatus = useCallback(async () => {
    try {
      const status = await validateServiceStatus();
      setServiceStatus(status);
      
      if (!status.available) {
        toast({
          title: "⚠️ Service Unavailable",
          description: status.message || "Terrastar service is currently unavailable",
          variant: "destructive",
        });
      }
      
      return status;
    } catch (error) {
      console.error('Error checking service status:', error);
      return serviceStatus;
    }
  }, [toast, serviceStatus]);

  /**
   * Auto-refresh data when vesselId changes
   */
  useEffect(() => {
    if (vesselId) {
      refreshAlerts(vesselId);
      refreshStatistics(vesselId);
      checkServiceStatus();
    }
  }, [vesselId]);

  /**
   * Set up periodic alert refresh
   */
  useEffect(() => {
    if (!vesselId) return;

    const interval = setInterval(() => {
      refreshAlerts(vesselId);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [vesselId, refreshAlerts]);

  return {
    loading,
    ionosphereData,
    activeAlerts,
    correction,
    serviceStatus,
    statistics,
    fetchIonosphereData,
    getCorrection,
    subscribeAlerts,
    refreshAlerts,
    acknowledgeAlertById,
    getForecast,
    refreshStatistics,
    checkServiceStatus,
  };
}
