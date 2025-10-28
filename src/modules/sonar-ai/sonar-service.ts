/**
 * PATCH 407: Sonar AI Service
 * Handles database operations for sonar analysis
 */

import { supabase } from "@/integrations/supabase/client";

export interface SonarInput {
  id?: string;
  session_id: string;
  user_id?: string;
  scan_type: 'manual' | 'auto' | 'file_upload' | 'stream';
  scan_depth: number;
  scan_radius: number;
  resolution: number;
  raw_data: any;
  metadata?: any;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SonarAnalysisResult {
  id?: string;
  input_id: string;
  quality_score: number;
  coverage: number;
  resolution_meters: number;
  detected_patterns: any[];
  detected_returns: any[];
  anomalies_count: number;
  risk_score: number;
  overall_risk: 'safe' | 'caution' | 'dangerous' | 'critical';
  navigation_advice: string;
  ai_confidence: number;
  processing_time_ms: number;
}

export interface SonarAlert {
  id?: string;
  analysis_id: string;
  alert_type: 'hazard' | 'safe_zone' | 'anomaly' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    angle: number;
    distance: number;
    depth: number;
  };
  characteristics?: string[];
  safety_score?: number;
  requires_action?: boolean;
}

export class SonarAIService {
  /**
   * Save sonar input data
   */
  static async saveInput(input: SonarInput) {
    const { data, error } = await supabase
      .from('sonar_inputs')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error saving sonar input:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update sonar input status
   */
  static async updateInputStatus(id: string, status: string) {
    const { error } = await supabase
      .from('sonar_inputs')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating input status:', error);
      throw error;
    }
  }

  /**
   * Save analysis results
   */
  static async saveAnalysis(analysis: SonarAnalysisResult) {
    const { data, error } = await supabase
      .from('sonar_analysis')
      .insert([analysis])
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }

    return data;
  }

  /**
   * Save multiple alerts
   */
  static async saveAlerts(alerts: SonarAlert[]) {
    const { data, error } = await supabase
      .from('sonar_alerts')
      .insert(alerts)
      .select();

    if (error) {
      console.error('Error saving alerts:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get recent sonar inputs for current user
   */
  static async getRecentInputs(limit = 10) {
    const { data, error } = await supabase
      .from('sonar_inputs')
      .select(`
        *,
        sonar_analysis (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching inputs:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get analysis by ID with alerts
   */
  static async getAnalysisWithAlerts(analysisId: string) {
    const { data, error } = await supabase
      .from('sonar_analysis')
      .select(`
        *,
        sonar_inputs (*),
        sonar_alerts (*)
      `)
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get unacknowledged critical alerts
   */
  static async getCriticalAlerts() {
    const { data, error } = await supabase
      .from('sonar_alerts')
      .select(`
        *,
        sonar_analysis!inner (
          *,
          sonar_inputs!inner (*)
        )
      `)
      .eq('acknowledged', false)
      .in('severity', ['high', 'critical'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching critical alerts:', error);
      throw error;
    }

    return data;
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string, userId: string) {
    const { error } = await supabase
      .from('sonar_alerts')
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Get sonar statistics
   */
  static async getStats() {
    const { data, error } = await supabase
      .from('sonar_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
      // Return default stats if view doesn't exist yet
      return {
        total_scans: 0,
        total_sessions: 0,
        total_analyses: 0,
        critical_alerts: 0,
        unacknowledged_alerts: 0,
        avg_quality_score: 0,
        avg_risk_score: 0
      };
    }

    return data;
  }

  /**
   * Save complete scan with analysis and alerts
   */
  static async saveScanComplete(
    input: SonarInput,
    analysis: Omit<SonarAnalysisResult, 'input_id'>,
    alerts: Omit<SonarAlert, 'analysis_id'>[]
  ) {
    try {
      // 1. Save input
      const savedInput = await this.saveInput(input);
      
      // 2. Save analysis
      const savedAnalysis = await this.saveAnalysis({
        ...analysis,
        input_id: savedInput.id!
      });

      // 3. Save alerts
      const alertsToSave = alerts.map(alert => ({
        ...alert,
        analysis_id: savedAnalysis.id!
      }));
      
      const savedAlerts = alerts.length > 0 
        ? await this.saveAlerts(alertsToSave) 
        : [];

      // 4. Update input status to completed
      await this.updateInputStatus(savedInput.id!, 'completed');

      return {
        input: savedInput,
        analysis: savedAnalysis,
        alerts: savedAlerts
      };
    } catch (error) {
      console.error('Error saving complete scan:', error);
      throw error;
    }
  }
}
