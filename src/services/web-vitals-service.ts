// Web Vitals Service - Collects and reports Web Vitals metrics
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

export interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export class WebVitalsService {
  private static instance: WebVitalsService;
  private sessionId: string;
  private pageUrl: string;
  private metrics: Map<string, WebVitalsData> = new Map();
  
  private constructor() {
    this.sessionId = this.generateSessionId();
    this.pageUrl = window.location.pathname;
    this.initializeVitals();
  }
  
  public static getInstance(): WebVitalsService {
    if (!WebVitalsService.instance) {
      WebVitalsService.instance = new WebVitalsService();
    }
    return WebVitalsService.instance;
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private initializeVitals() {
    // Collect all Web Vitals metrics
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
  }
  
  private async handleMetric(metric: Metric) {
    const vitalsData: WebVitalsData = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'unknown'
    };
    
    this.metrics.set(metric.name, vitalsData);
    await this.reportMetric(vitalsData);
    this.checkForDegradation(vitalsData);
  }
  
  private async reportMetric(metric: WebVitalsData) {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          system_name: 'web_vitals',
          metric_name: metric.name,
          metric_value: metric.value,
          metric_unit: this.getMetricUnit(metric.name),
          status: this.getStatusFromRating(metric.rating),
          source: 'browser',
          metadata: {
            session_id: this.sessionId,
            page_url: this.pageUrl,
            rating: metric.rating,
            delta: metric.delta,
            navigation_type: metric.navigationType,
            metric_id: metric.id,
            timestamp: new Date().toISOString()
          }
        });
      
      if (error) {
        console.error('Error reporting Web Vitals metric:', error);
      }
    } catch (error) {
      console.error('Failed to report metric:', error);
    }
  }
  
  private getMetricUnit(metricName: string): string {
    switch (metricName) {
      case 'CLS':
        return 'score';
      case 'FCP':
      case 'LCP':
      case 'TTFB':
      case 'INP':
        return 'ms';
      default:
        return 'value';
    }
  }
  
  private getStatusFromRating(rating: string): 'normal' | 'warning' | 'critical' {
    switch (rating) {
      case 'good':
        return 'normal';
      case 'needs-improvement':
        return 'warning';
      case 'poor':
        return 'critical';
      default:
        return 'normal';
    }
  }
  
  private checkForDegradation(metric: WebVitalsData) {
    if (metric.rating === 'poor') {
      this.createAlert(metric, 'critical');
    } else if (metric.rating === 'needs-improvement') {
      this.createAlert(metric, 'warning');
    }
  }
  
  private async createAlert(metric: WebVitalsData, severity: 'warning' | 'critical') {
    try {
      const message = `${metric.name} performance ${severity === 'critical' ? 'critically degraded' : 'needs improvement'}: ${metric.value.toFixed(2)}${this.getMetricUnit(metric.name)} on ${this.pageUrl}`;
      
      const { error } = await supabase
        .from('performance_alerts')
        .insert({
          system_name: 'web_vitals',
          alert_type: 'threshold_exceeded',
          severity,
          message,
          metadata: {
            metric_name: metric.name,
            metric_value: metric.value,
            rating: metric.rating,
            page_url: this.pageUrl,
            session_id: this.sessionId
          }
        });
      
      if (error) {
        console.error('Error creating performance alert:', error);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }
  
  public getMetrics(): Map<string, WebVitalsData> {
    return this.metrics;
  }
  
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Initialize the service
export const webVitalsService = WebVitalsService.getInstance();
