/**
 * PATCH 101.0 - Analytics Data Collector Service
 */

import { DataSource, KPIMetric, ChartData } from '../types';

class DataCollectorService {
  private sources: Map<string, DataSource> = new Map();

  constructor() {
    // Initialize data sources
    this.registerSource('logs', 'System Logs', 15420);
    this.registerSource('finance', 'Financial Data', 3241);
    this.registerSource('missions', 'Mission Records', 892);
    this.registerSource('fleet', 'Fleet Analytics', 245);
  }

  private registerSource(
    type: DataSource['type'],
    name: string,
    recordCount: number
  ): void {
    const source: DataSource = {
      id: `source_${type}`,
      name,
      type,
      recordCount,
      lastUpdated: new Date(),
      isConnected: true
    };
    this.sources.set(type, source);
  }

  getAllSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  getSource(type: string): DataSource | undefined {
    return this.sources.get(type);
  }

  async collectKPIMetrics(): Promise<KPIMetric[]> {
    return [
      {
        name: 'Fuel Consumption',
        value: 87.5,
        unit: '%',
        trend: 'down',
        change: -5.2,
        category: 'consumption'
      },
      {
        name: 'Operational Performance',
        value: 94.3,
        unit: '%',
        trend: 'up',
        change: 3.1,
        category: 'performance'
      },
      {
        name: 'System Downtime',
        value: 2.1,
        unit: 'hours',
        trend: 'down',
        change: -12.5,
        category: 'downtime'
      },
      {
        name: 'Crew Efficiency',
        value: 91.7,
        unit: '%',
        trend: 'stable',
        change: 0.3,
        category: 'efficiency'
      }
    ];
  }

  async collectConsumptionVsPerformance(): Promise<ChartData> {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Consumption',
          data: [92, 88, 85, 87, 83, 80],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)'
        },
        {
          label: 'Performance',
          data: [85, 88, 90, 92, 94, 95],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    };
  }

  async collectDowntimeVsEfficiency(): Promise<ChartData> {
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Downtime (hours)',
          data: [4.2, 3.1, 2.8, 2.1]
        },
        {
          label: 'Efficiency (%)',
          data: [88, 90, 91, 92]
        }
      ]
    };
  }
}

export const dataCollector = new DataCollectorService();
