/**
 * PATCH 524 - Incident Replay AI Service
 * Handles incident data retrieval, AI analysis, and replay functionality
 */

import { IncidentReplay, IncidentEvent, TelemetrySnapshot } from "../types";

class IncidentReplayService {
  /**
   * Generate mock incident data for demonstration
   */
  generateMockIncident(incidentId: string): IncidentReplay {
    const startTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const events: IncidentEvent[] = [];
    
    // Generate 10 events spanning the incident
    for (let i = 0; i < 10; i++) {
      const eventTime = new Date(Date.now() - 3600000 + i * 360000).toISOString();
      const latitude = -23.5505 + (Math.random() - 0.5) * 0.01;
      const longitude = -46.6333 + (Math.random() - 0.5) * 0.01;
      
      events.push({
        id: `event-${i}`,
        timestamp: eventTime,
        eventType: this.getEventType(i),
        description: this.getEventDescription(i),
        severity: this.getEventSeverity(i),
        telemetry: {
          timestamp: eventTime,
          speed: 12 + Math.random() * 8,
          heading: 45 + i * 10 + Math.random() * 5,
          temperature: 20 + Math.random() * 3,
          pressure: 1013 + Math.random() * 10,
          depth: 50 + i * 10 + Math.random() * 5,
          gps: {
            latitude,
            longitude,
          },
        },
        aiInsight: this.generateAIInsight(i),
      });
    }
    
    return {
      id: incidentId,
      name: "Emergency Navigation Incident",
      description: "Unexpected weather pattern caused navigation challenges",
      startTime,
      endTime: new Date().toISOString(),
      events,
      vesselId: "vessel-001",
      vesselName: "MV Ocean Explorer",
    };
  }

  private getEventType(index: number): string {
    const types = [
      "navigation_alert",
      "weather_warning",
      "course_deviation",
      "speed_reduction",
      "sensor_alert",
      "crew_response",
      "system_check",
      "communication",
      "course_correction",
      "all_clear",
    ];
    return types[index] || "unknown";
  }

  private getEventDescription(index: number): string {
    const descriptions = [
      "Initial navigation alert triggered",
      "Weather pattern detected on radar",
      "Vessel deviated from planned route",
      "Speed reduced for safety",
      "Pressure sensor anomaly detected",
      "Crew initiated emergency protocols",
      "System diagnostic completed",
      "Communication with shore established",
      "Course corrected to safe heading",
      "Situation stabilized, all systems normal",
    ];
    return descriptions[index] || "Event occurred";
  }

  private getEventSeverity(index: number): "low" | "medium" | "high" | "critical" {
    if (index < 2) return "low";
    if (index < 5) return "medium";
    if (index < 8) return "high";
    return "low";
  }

  private generateAIInsight(index: number): string {
    const insights = [
      "AI detected early warning signs in telemetry data",
      "Weather pattern suggests localized storm formation",
      "Course deviation within acceptable safety margins",
      "Speed reduction appropriate for current conditions",
      "Sensor readings indicate temporary environmental interference",
      "Crew response time optimal, protocols followed correctly",
      "All critical systems functioning within normal parameters",
      "Communication latency minimal, no data loss detected",
      "Course correction aligned with AI-recommended safe zone",
      "All risk factors have been mitigated successfully",
    ];
    return insights[index] || "AI analysis in progress";
  }

  /**
   * Get list of available incidents (mock data)
   */
  async getIncidentList(): Promise<Array<{ id: string; name: string; date: string }>> {
    // Mock incident list
    return [
      {
        id: "incident-001",
        name: "Emergency Navigation Incident",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "incident-002",
        name: "Equipment Malfunction",
        date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "incident-003",
        name: "Weather Emergency",
        date: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
  }

  /**
   * Load incident replay data
   */
  async loadIncident(incidentId: string): Promise<IncidentReplay> {
    // In a real implementation, this would fetch from Supabase
    // Mock data for now
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    return this.generateMockIncident(incidentId);
  }

  /**
   * Export replay data as JSON
   */
  exportReplayLog(incident: IncidentReplay): void {
    const dataStr = JSON.stringify(incident, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-replay-${incident.id}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Mock persistence - In real app, would save to Supabase incident_logs table
   */
  async saveReplaySession(incidentId: string, sessionData: Record<string, unknown>): Promise<void> {
    console.log("Mock: Saving replay session to incident_logs", { incidentId, sessionData });
    // Would integrate with Supabase here:
    // await supabase.from('incident_logs').insert({ ... })
  }
}

export const incidentReplayService = new IncidentReplayService();
