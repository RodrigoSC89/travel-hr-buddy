/**
 * PATCH 189.0 - Heavy Computation Web Worker
 * 
 * Offloads CPU-intensive tasks to background thread
 * Prevents UI blocking on mobile devices
 */

// Worker message types
type WorkerMessage = 
  | { type: "SORT_DATA"; payload: { data: any[]; key: string; order: "asc" | "desc" } }
  | { type: "FILTER_DATA"; payload: { data: any[]; filters: Record<string, any> } }
  | { type: "SEARCH_DATA"; payload: { data: any[]; query: string; fields: string[] } }
  | { type: "AGGREGATE_DATA"; payload: { data: any[]; groupBy: string; aggregate: string } }
  | { type: "COMPRESS_DATA"; payload: { data: any } }
  | { type: "DECOMPRESS_DATA"; payload: { compressed: string } }
  | { type: "DIFF_DATA"; payload: { oldData: any; newData: any } };

type WorkerResponse = 
  | { type: "SUCCESS"; result: any; duration: number }
  | { type: "ERROR"; error: string };

// Handle incoming messages
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const startTime = performance.now();
  
  try {
    let result: any;
    
    switch (event.data.type) {
      case "SORT_DATA":
        result = sortData(
          event.data.payload.data,
          event.data.payload.key,
          event.data.payload.order
        );
        break;
        
      case "FILTER_DATA":
        result = filterData(
          event.data.payload.data,
          event.data.payload.filters
        );
        break;
        
      case "SEARCH_DATA":
        result = searchData(
          event.data.payload.data,
          event.data.payload.query,
          event.data.payload.fields
        );
        break;
        
      case "AGGREGATE_DATA":
        result = aggregateData(
          event.data.payload.data,
          event.data.payload.groupBy,
          event.data.payload.aggregate
        );
        break;
        
      case "COMPRESS_DATA":
        result = compressData(event.data.payload.data);
        break;
        
      case "DECOMPRESS_DATA":
        result = decompressData(event.data.payload.compressed);
        break;
        
      case "DIFF_DATA":
        result = diffData(
          event.data.payload.oldData,
          event.data.payload.newData
        );
        break;
        
      default:
        throw new Error(`Unknown message type`);
    }
    
    const duration = performance.now() - startTime;
    
    self.postMessage({
      type: "SUCCESS",
      result,
      duration
    } as WorkerResponse);
    
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error"
    } as WorkerResponse);
  }
};

// Sort data by key
function sortData(data: any[], key: string, order: "asc" | "desc"): any[] {
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return order === "asc" ? comparison : -comparison;
  });
}

// Filter data by multiple criteria
function filterData(data: any[], filters: Record<string, any>): any[] {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = getNestedValue(item, key);
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === "object" && value !== null) {
        if ("min" in value && itemValue < value.min) return false;
        if ("max" in value && itemValue > value.max) return false;
        return true;
      }
      
      return itemValue === value;
    });
  });
}

// Full-text search across multiple fields
function searchData(data: any[], query: string, fields: string[]): any[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return data;
  
  const terms = normalizedQuery.split(/\s+/);
  
  return data.filter((item) => {
    const searchText = fields
      .map((field) => String(getNestedValue(item, field) || ""))
      .join(" ")
      .toLowerCase();
    
    return terms.every((term) => searchText.includes(term));
  });
}

// Aggregate data by group
function aggregateData(
  data: any[],
  groupBy: string,
  aggregate: string
): Record<string, any> {
  const groups: Record<string, any[]> = {};
  
  data.forEach((item) => {
    const key = String(getNestedValue(item, groupBy) || "unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  
  const result: Record<string, any> = {};
  
  Object.entries(groups).forEach(([key, items]) => {
    switch (aggregate) {
      case "count":
        result[key] = items.length;
        break;
      case "sum":
        result[key] = items.reduce((sum, item) => sum + (item.value || 0), 0);
        break;
      case "avg":
        result[key] = items.reduce((sum, item) => sum + (item.value || 0), 0) / items.length;
        break;
      case "items":
        result[key] = items;
        break;
      default:
        result[key] = items;
    }
  });
  
  return result;
}

// Simple LZ-style compression
function compressData(data: any): string {
  const json = JSON.stringify(data);
  // Simple RLE-like compression for repeated characters
  return json.replace(/(.)\1{3,}/g, (match, char) => `${char}×${match.length}`);
}

// Decompress data
function decompressData(compressed: string): any {
  const decompressed = compressed.replace(
    /(.)\×(\d+)/g,
    (_, char, count) => char.repeat(parseInt(count))
  );
  return JSON.parse(decompressed);
}

// Calculate diff between old and new data
function diffData(oldData: any, newData: any): any {
  if (typeof oldData !== typeof newData) {
    return { type: "replace", value: newData };
  }
  
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    const added = newData.filter((item) => !oldData.some((o) => deepEqual(o, item)));
    const removed = oldData.filter((item) => !newData.some((n) => deepEqual(n, item)));
    return { type: "array", added, removed };
  }
  
  if (typeof oldData === "object" && oldData !== null) {
    const changes: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    allKeys.forEach((key) => {
      if (!deepEqual(oldData[key], newData[key])) {
        changes[key] = { old: oldData[key], new: newData[key] };
      }
    });
    
    return { type: "object", changes };
  }
  
  return oldData === newData ? null : { type: "primitive", old: oldData, new: newData };
}

// Helper: get nested value by dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

// Helper: deep equality check
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

export {};
