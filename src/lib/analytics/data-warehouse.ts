/**
 * Data Warehouse Engine v6.0
 * Advanced BI and data warehousing for maritime analytics
 */

import { supabase } from "@/integrations/supabase/client";

interface DataSource {
  id: string;
  name: string;
  type: 'supabase' | 'api' | 'file' | 'stream';
  config: Record<string, unknown>;
  refreshInterval?: number;
}

interface DataCube {
  id: string;
  name: string;
  dimensions: string[];
  measures: string[];
  facts: Record<string, unknown>[];
  aggregations: Record<string, number>;
}

interface WarehouseQuery {
  cube: string;
  dimensions: string[];
  measures: string[];
  filters?: Record<string, unknown>;
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

interface QueryResult {
  data: Record<string, unknown>[];
  metadata: {
    rowCount: number;
    executionTime: number;
    cached: boolean;
  };
}

interface ETLJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  transform: (data: unknown[]) => unknown[];
  schedule?: string;
  lastRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

class DataWarehouseEngine {
  private dataSources = new Map<string, DataSource>();
  private cubes = new Map<string, DataCube>();
  private etlJobs = new Map<string, ETLJob>();
  private queryCache = new Map<string, { result: QueryResult; timestamp: number }>();
  private cacheExpiry = 300000; // 5 minutes

  async initialize(): Promise<void> {
    // Register default data sources
    await this.registerDefaultSources();
    
    // Build default cubes
    await this.buildDefaultCubes();

    console.log('[DataWarehouse] Initialized with', this.cubes.size, 'cubes');
  }

  private async registerDefaultSources(): Promise<void> {
    // Crew data source
    this.dataSources.set('crew', {
      id: 'crew',
      name: 'Crew Management',
      type: 'supabase',
      config: { table: 'crew_members' },
      refreshInterval: 60000
    });

    // Vessels data source
    this.dataSources.set('vessels', {
      id: 'vessels',
      name: 'Fleet Management',
      type: 'supabase',
      config: { table: 'vessels' },
      refreshInterval: 30000
    });

    // Operations data source
    this.dataSources.set('operations', {
      id: 'operations',
      name: 'Operations',
      type: 'supabase',
      config: { table: 'voyage_routes' },
      refreshInterval: 60000
    });

    // Compliance data source
    this.dataSources.set('compliance', {
      id: 'compliance',
      name: 'Compliance',
      type: 'supabase',
      config: { table: 'compliance_items' },
      refreshInterval: 120000
    });
  }

  private async buildDefaultCubes(): Promise<void> {
    // Crew Analytics Cube
    this.cubes.set('crew_analytics', {
      id: 'crew_analytics',
      name: 'Crew Analytics',
      dimensions: ['position', 'vessel', 'nationality', 'certification_status', 'department'],
      measures: ['headcount', 'avg_tenure', 'certification_rate', 'turnover_rate'],
      facts: [],
      aggregations: {}
    });

    // Fleet Performance Cube
    this.cubes.set('fleet_performance', {
      id: 'fleet_performance',
      name: 'Fleet Performance',
      dimensions: ['vessel_type', 'region', 'status', 'flag_state'],
      measures: ['vessel_count', 'avg_utilization', 'maintenance_compliance', 'fuel_efficiency'],
      facts: [],
      aggregations: {}
    });

    // Compliance Cube
    this.cubes.set('compliance_metrics', {
      id: 'compliance_metrics',
      name: 'Compliance Metrics',
      dimensions: ['regulation', 'vessel', 'category', 'severity'],
      measures: ['compliance_rate', 'open_items', 'overdue_items', 'resolved_items'],
      facts: [],
      aggregations: {}
    });

    // Financial Cube
    this.cubes.set('financial_analytics', {
      id: 'financial_analytics',
      name: 'Financial Analytics',
      dimensions: ['cost_category', 'vessel', 'period', 'department'],
      measures: ['total_cost', 'budget_variance', 'cost_per_day', 'opex_ratio'],
      facts: [],
      aggregations: {}
    });

    // Safety Cube
    this.cubes.set('safety_metrics', {
      id: 'safety_metrics',
      name: 'Safety Metrics',
      dimensions: ['incident_type', 'vessel', 'severity', 'cause_category'],
      measures: ['incident_count', 'ltir', 'trir', 'near_miss_count'],
      facts: [],
      aggregations: {}
    });
  }

  async refreshCube(cubeId: string): Promise<void> {
    const cube = this.cubes.get(cubeId);
    if (!cube) throw new Error(`Cube ${cubeId} not found`);

    // Fetch fresh data based on cube type
    const facts = await this.fetchCubeFacts(cubeId);
    cube.facts = facts;
    
    // Recalculate aggregations
    cube.aggregations = this.calculateAggregations(cube);
  }

  private async fetchCubeFacts(cubeId: string): Promise<Record<string, unknown>[]> {
    try {
      let data: unknown[] = [];
      
      switch (cubeId) {
        case 'crew_analytics':
          const crew = await supabase.from('crew_members').select('*').limit(1000);
          data = crew.data || [];
          break;
        case 'fleet_performance':
          const vessels = await supabase.from('vessels').select('*').limit(1000);
          data = vessels.data || [];
          break;
        default:
          data = [];
      }
      
      return data as Record<string, unknown>[];
    } catch (error) {
      console.error(`[DataWarehouse] Failed to fetch facts for ${cubeId}:`, error);
      return [];
    }
  }

  private calculateAggregations(cube: DataCube): Record<string, number> {
    const aggs: Record<string, number> = {};
    
    aggs['total_records'] = cube.facts.length;
    
    // Calculate numeric aggregations
    cube.measures.forEach(measure => {
      const values = cube.facts
        .map(f => f[measure])
        .filter((v): v is number => typeof v === 'number');
      
      if (values.length > 0) {
        aggs[`${measure}_sum`] = values.reduce((a, b) => a + b, 0);
        aggs[`${measure}_avg`] = aggs[`${measure}_sum`] / values.length;
        aggs[`${measure}_min`] = Math.min(...values);
        aggs[`${measure}_max`] = Math.max(...values);
      }
    });

    return aggs;
  }

  async query(query: WarehouseQuery): Promise<QueryResult> {
    const cacheKey = JSON.stringify(query);
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return { ...cached.result, metadata: { ...cached.result.metadata, cached: true } };
    }

    const startTime = performance.now();
    const cube = this.cubes.get(query.cube);
    
    if (!cube) {
      throw new Error(`Cube ${query.cube} not found`);
    }

    // Ensure cube has fresh data
    if (cube.facts.length === 0) {
      await this.refreshCube(query.cube);
    }

    let results = [...cube.facts];

    // Apply filters
    if (query.filters) {
      results = results.filter(row => {
        return Object.entries(query.filters!).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(row[key]);
          }
          return row[key] === value;
        });
      });
    }

    // Select dimensions and measures
    const selectedFields = [...query.dimensions, ...query.measures];
    results = results.map(row => {
      const selected: Record<string, unknown> = {};
      selectedFields.forEach(field => {
        if (row[field] !== undefined) {
          selected[field] = row[field];
        }
      });
      return selected;
    });

    // Group by
    if (query.groupBy && query.groupBy.length > 0) {
      results = this.groupByFields(results, query.groupBy, query.measures);
    }

    // Order by
    if (query.orderBy) {
      query.orderBy.forEach(({ field, direction }) => {
        results.sort((a, b) => {
          const aVal = a[field] as string | number;
          const bVal = b[field] as string | number;
          const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return direction === 'desc' ? -compare : compare;
        });
      });
    }

    // Limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    const result: QueryResult = {
      data: results,
      metadata: {
        rowCount: results.length,
        executionTime: performance.now() - startTime,
        cached: false
      }
    };

    // Cache result
    this.queryCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  private groupByFields(
    data: Record<string, unknown>[],
    groupBy: string[],
    measures: string[]
  ): Record<string, unknown>[] {
    const groups = new Map<string, Record<string, unknown>[]>();

    data.forEach(row => {
      const key = groupBy.map(g => row[g]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    return Array.from(groups.entries()).map(([key, rows]) => {
      const result: Record<string, unknown> = {};
      
      // Copy group by values
      groupBy.forEach((g, i) => {
        result[g] = key.split('|')[i];
      });

      // Aggregate measures
      measures.forEach(measure => {
        const values = rows
          .map(r => r[measure])
          .filter((v): v is number => typeof v === 'number');
        
        result[measure] = values.length > 0 
          ? values.reduce((a, b) => a + b, 0) 
          : 0;
        result[`${measure}_avg`] = values.length > 0 
          ? values.reduce((a, b) => a + b, 0) / values.length 
          : 0;
        result[`${measure}_count`] = rows.length;
      });

      return result;
    });
  }

  registerETLJob(job: Omit<ETLJob, 'status' | 'lastRun'>): void {
    this.etlJobs.set(job.id, { ...job, status: 'idle' });
  }

  async runETLJob(jobId: string): Promise<boolean> {
    const job = this.etlJobs.get(jobId);
    if (!job) return false;

    job.status = 'running';

    try {
      // Extract
      const source = this.dataSources.get(job.source);
      if (!source) throw new Error(`Source ${job.source} not found`);

      const rawData = await this.extractFromSource(source);

      // Transform
      const transformedData = job.transform(rawData);

      // Load
      await this.loadToDestination(job.destination, transformedData);

      job.status = 'completed';
      job.lastRun = new Date();
      
      return true;
    } catch (error) {
      console.error(`[DataWarehouse] ETL job ${jobId} failed:`, error);
      job.status = 'failed';
      return false;
    }
  }

  private async extractFromSource(_source: DataSource): Promise<unknown[]> {
    // Source extraction handled per-cube in fetchCubeFacts
    return [];
  }

  private async loadToDestination(destination: string, data: unknown[]): Promise<void> {
    const cube = this.cubes.get(destination);
    if (cube) {
      cube.facts = data as Record<string, unknown>[];
      cube.aggregations = this.calculateAggregations(cube);
    }
  }

  getCubeMetadata(cubeId: string): Omit<DataCube, 'facts'> | null {
    const cube = this.cubes.get(cubeId);
    if (!cube) return null;
    
    const { facts: _facts, ...metadata } = cube;
    return metadata;
  }

  listCubes(): Array<{ id: string; name: string; recordCount: number }> {
    return Array.from(this.cubes.values()).map(cube => ({
      id: cube.id,
      name: cube.name,
      recordCount: cube.facts.length
    }));
  }

  clearCache(): void {
    this.queryCache.clear();
  }
}

export const dataWarehouseEngine = new DataWarehouseEngine();
export type { DataSource, DataCube, WarehouseQuery, QueryResult, ETLJob };
