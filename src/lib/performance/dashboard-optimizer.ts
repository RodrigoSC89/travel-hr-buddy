/**
 * Dashboard Optimizer - PATCH 975
 * Optimized rendering for dashboards with virtual pagination and web workers
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface DashboardWidget {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dataFn: () => Promise<any>;
  visible?: boolean;
}

interface WidgetState {
  data: any;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

/**
 * Priority queue for widget loading
 */
class WidgetLoadQueue {
  private queue: DashboardWidget[] = [];
  private loading = new Set<string>();
  private maxConcurrent = 3;
  
  add(widget: DashboardWidget): void {
    const index = this.queue.findIndex(w => 
      this.getPriorityValue(w.priority) < this.getPriorityValue(widget.priority)
    );
    
    if (index === -1) {
      this.queue.push(widget);
    } else {
      this.queue.splice(index, 0, widget);
    }
  }
  
  getNext(): DashboardWidget | null {
    if (this.loading.size >= this.maxConcurrent) return null;
    
    const widget = this.queue.shift();
    if (widget) {
      this.loading.add(widget.id);
    }
    return widget || null;
  }
  
  complete(id: string): void {
    this.loading.delete(id);
  }
  
  private getPriorityValue(priority: DashboardWidget['priority']): number {
    const values = { critical: 4, high: 3, medium: 2, low: 1 };
    return values[priority];
  }
  
  get pendingCount(): number {
    return this.queue.length;
  }
  
  get loadingCount(): number {
    return this.loading.size;
  }
}

/**
 * Dashboard optimizer for conditional rendering and data loading
 */
class DashboardOptimizer {
  private loadQueue = new WidgetLoadQueue();
  private widgetStates: Map<string, WidgetState> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private worker: Worker | null = null;
  
  /**
   * Initialize web worker for heavy calculations
   */
  initWorker(): void {
    if (this.worker) return;
    
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data, id } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'aggregate':
              result = aggregate(data);
              break;
            case 'sort':
              result = data.items.sort((a, b) => {
                const valA = a[data.field];
                const valB = b[data.field];
                return data.desc ? valB - valA : valA - valB;
              });
              break;
            case 'filter':
              result = data.items.filter(item => {
                return Object.entries(data.filters).every(([key, value]) => {
                  if (value === null || value === undefined) return true;
                  return item[key] === value || String(item[key]).includes(String(value));
                });
              });
              break;
            case 'calculate':
              result = calculate(data);
              break;
            default:
              result = data;
          }
          
          self.postMessage({ id, result, success: true });
        } catch (error) {
          self.postMessage({ id, error: error.message, success: false });
        }
      };
      
      function aggregate(data) {
        const { items, groupBy, metrics } = data;
        const groups = {};
        
        for (const item of items) {
          const key = item[groupBy] || 'other';
          if (!groups[key]) {
            groups[key] = { count: 0, sum: 0, items: [] };
          }
          groups[key].count++;
          if (metrics.sumField) {
            groups[key].sum += item[metrics.sumField] || 0;
          }
          groups[key].items.push(item);
        }
        
        return Object.entries(groups).map(([key, value]) => ({
          [groupBy]: key,
          count: value.count,
          sum: value.sum,
          avg: value.sum / value.count
        }));
      }
      
      function calculate(data) {
        const { items, calculations } = data;
        const results = {};
        
        for (const calc of calculations) {
          switch (calc.type) {
            case 'sum':
              results[calc.name] = items.reduce((s, i) => s + (i[calc.field] || 0), 0);
              break;
            case 'avg':
              results[calc.name] = items.reduce((s, i) => s + (i[calc.field] || 0), 0) / items.length;
              break;
            case 'min':
              results[calc.name] = Math.min(...items.map(i => i[calc.field] || Infinity));
              break;
            case 'max':
              results[calc.name] = Math.max(...items.map(i => i[calc.field] || -Infinity));
              break;
            case 'count':
              results[calc.name] = items.filter(i => i[calc.field]).length;
              break;
          }
        }
        
        return results;
      }
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }
  
  /**
   * Execute heavy calculation in worker
   */
  async executeInWorker<T>(
    type: 'aggregate' | 'sort' | 'filter' | 'calculate',
    data: any
  ): Promise<T> {
    this.initWorker();
    const worker = this.worker;
    if (!worker) {
      throw new Error('Worker not available');
    }
    
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handler = (e: MessageEvent) => {
        if (e.data.id === id) {
          worker.removeEventListener('message', handler);
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        }
      };
      
      worker.addEventListener('message', handler);
      worker.postMessage({ type, data, id });
    });
  }
  
  /**
   * Create visibility observer for lazy loading widgets
   */
  observeWidget(
    elementId: string,
    onVisible: () => void,
    options: { threshold?: number; rootMargin?: string } = {}
  ): () => void {
    const { threshold = 0.1, rootMargin = '100px' } = options;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onVisible();
          observer.disconnect();
          this.observers.delete(elementId);
        }
      },
      { threshold, rootMargin }
    );
    
    const element = document.getElementById(elementId);
    if (element) {
      observer.observe(element);
      this.observers.set(elementId, observer);
    }
    
    return () => {
      observer.disconnect();
      this.observers.delete(elementId);
    };
  }
  
  /**
   * Get widget state
   */
  getWidgetState(id: string): WidgetState {
    return this.widgetStates.get(id) || {
      data: null,
      loading: false,
      error: null,
      lastUpdate: 0
    };
  }
  
  /**
   * Virtual pagination for large datasets
   */
  virtualPaginate<T>(
    items: T[],
    pageSize: number,
    currentPage: number
  ): {
    items: T[];
    totalPages: number;
    hasMore: boolean;
    startIndex: number;
    endIndex: number;
  } {
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, items.length);
    
    return {
      items: items.slice(startIndex, endIndex),
      totalPages,
      hasMore: currentPage < totalPages - 1,
      startIndex,
      endIndex
    };
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.observers.forEach(obs => obs.disconnect());
    this.observers.clear();
    this.worker?.terminate();
    this.worker = null;
  }
}

export const dashboardOptimizer = new DashboardOptimizer();

/**
 * Hook for optimized dashboard widgets
 */
export function useOptimizedWidget<T>(
  id: string,
  fetchData: () => Promise<T>,
  options: {
    priority?: DashboardWidget['priority'];
    refreshInterval?: number;
    cacheMs?: number;
  } = {}
) {
  const { priority = 'medium', refreshInterval, cacheMs = 30000 } = options;
  
  const [state, setState] = useState<WidgetState>({
    data: null,
    loading: false,
    error: null,
    lastUpdate: 0
  });
  
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  
  const load = useCallback(async () => {
    // Check cache
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < cacheMs) {
      setState(s => ({ ...s, data: cacheRef.current!.data }));
      return;
    }
    
    setState(s => ({ ...s, loading: true, error: null }));
    
    try {
      const data = await fetchData();
      cacheRef.current = { data, timestamp: Date.now() };
      setState({ data, loading: false, error: null, lastUpdate: Date.now() });
    } catch (e) {
      setState(s => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      }));
    }
  }, [fetchData, cacheMs]);
  
  useEffect(() => {
    load();
    
    if (refreshInterval) {
      const interval = setInterval(load, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [load, refreshInterval]);
  
  return {
    ...state,
    refresh: load,
    isStale: cacheRef.current ? Date.now() - cacheRef.current.timestamp > cacheMs : true
  };
}

/**
 * Hook for virtual scrolling in dashboard tables
 */
export function useVirtualDashboard<T>(
  items: T[],
  options: {
    pageSize?: number;
    overscan?: number;
  } = {}
) {
  const { pageSize = 20, overscan = 5 } = options;
  
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const processedItems = useMemo(() => {
    let result = [...items];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (value === null || value === undefined || value === '') return true;
          const itemValue = (item as any)[key];
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        })
      );
    }
    
    // Apply sort
    if (sortField) {
      result.sort((a, b) => {
        const valA = (a as any)[sortField];
        const valB = (b as any)[sortField];
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDesc ? -comparison : comparison;
      });
    }
    
    return result;
  }, [items, filters, sortField, sortDesc]);
  
  const paginatedData = useMemo(() => {
    return dashboardOptimizer.virtualPaginate(processedItems, pageSize, page);
  }, [processedItems, pageSize, page]);
  
  return {
    items: paginatedData.items,
    totalItems: processedItems.length,
    totalPages: paginatedData.totalPages,
    currentPage: page,
    hasMore: paginatedData.hasMore,
    setPage,
    nextPage: () => setPage(p => Math.min(p + 1, paginatedData.totalPages - 1)),
    prevPage: () => setPage(p => Math.max(p - 1, 0)),
    sort: (field: string) => {
      if (sortField === field) {
        setSortDesc(!sortDesc);
      } else {
        setSortField(field);
        setSortDesc(false);
      }
    },
    filter: (field: string, value: any) => {
      setFilters(f => ({ ...f, [field]: value }));
      setPage(0);
    },
    clearFilters: () => {
      setFilters({});
      setPage(0);
    },
    sortField,
    sortDesc,
    filters
  };
}

/**
 * Execute calculation in web worker
 */
export async function calculateInWorker<T>(
  type: 'aggregate' | 'sort' | 'filter' | 'calculate',
  data: any
): Promise<T> {
  return dashboardOptimizer.executeInWorker<T>(type, data);
}
