/**
 * PATCH 189.0 - Heavy Computation Web Worker
 * 
 * Offloads CPU-intensive tasks to background thread
 * Prevents UI blocking on mobile devices
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Worker generic data types must remain flexible for cross-thread serialization
type GenericData = Record<string, unknown>;

// Worker message types
type WorkerMessage = 
  | { type: "SORT_DATA"; payload: { data: GenericData[]; key: string; order: "asc" | "desc" } }
  | { type: "FILTER_DATA"; payload: { data: GenericData[]; filters: Record<string, unknown> } }
  | { type: "SEARCH_DATA"; payload: { data: GenericData[]; query: string; fields: string[] } }
  | { type: "AGGREGATE_DATA"; payload: { data: GenericData[]; groupBy: string; aggregate: string } }
  | { type: "COMPRESS_DATA"; payload: { data: unknown } }
  | { type: "DECOMPRESS_DATA"; payload: { compressed: string } }
  | { type: "DIFF_DATA"; payload: { oldData: unknown; newData: unknown } };

type WorkerResponse = 
  | { type: "SUCCESS"; result: unknown; duration: number }
  | { type: "ERROR"; error: string };

// Handle incoming messages
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const startTime = performance.now();
  
  try {
    let result: unknown;
    
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
function sortData(data: GenericData[], key: string, order: "asc" | "desc"): GenericData[] {
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = (aVal as string | number) < (bVal as string | number) ? -1 : 1;
    return order === "asc" ? comparison : -comparison;
  });
}

// Filter data by multiple criteria
function filterData(data: GenericData[], filters: Record<string, unknown>): GenericData[] {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = getNestedValue(item, key);
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === "object" && value !== null) {
        const range = value as Record<string, number>;
        if ("min" in range && (itemValue as number) < range.min) return false;
        if ("max" in range && (itemValue as number) > range.max) return false;
        return true;
      }
      
      return itemValue === value;
    });
  });
}

// Full-text search across multiple fields
function searchData(data: GenericData[], query: string, fields: string[]): GenericData[] {
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
  data: GenericData[],
  groupBy: string,
  aggregate: string
): Record<string, unknown> {
  const groups: Record<string, GenericData[]> = {};
  
  data.forEach((item) => {
    const key = String(getNestedValue(item, groupBy) || "unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  
  const result: Record<string, unknown> = {};
  
  Object.entries(groups).forEach(([key, items]) => {
    switch (aggregate) {
      case "count":
        result[key] = items.length;
        break;
      case "sum":
        result[key] = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        break;
      case "avg":
        result[key] = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0) / items.length;
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
function compressData(data: unknown): string {
  const json = JSON.stringify(data);
  // Simple RLE-like compression for repeated characters
  return json.replace(/(.)\1{3,}/g, (match, char) => `${char}×${match.length}`);
}

// Decompress data
function decompressData(compressed: string): unknown {
  const decompressed = compressed.replace(
    /(.)\×(\d+)/g,
    (_, char, count) => char.repeat(parseInt(count))
  );
  return JSON.parse(decompressed);
}

// Calculate diff between old and new data
function diffData(oldData: unknown, newData: unknown): Record<string, unknown> | null {
  if (typeof oldData !== typeof newData) {
    return { type: "replace", value: newData };
  }
  
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    const added = newData.filter((item) => !oldData.some((o) => deepEqual(o, item)));
    const removed = oldData.filter((item) => !newData.some((n) => deepEqual(n, item)));
    return { type: "array", added, removed };
  }
  
  if (typeof oldData === "object" && oldData !== null) {
    const changes: Record<string, unknown> = {};
    const oldObj = oldData as Record<string, unknown>;
    const newObj = newData as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    
    allKeys.forEach((key) => {
      if (!deepEqual(oldObj[key], newObj[key])) {
        changes[key] = { old: oldObj[key], new: newObj[key] };
      }
    });
    
    return { type: "object", changes };
  }
  
  return oldData === newData ? null : { type: "primitive", old: oldData, new: newData };
}

// Helper: get nested value by dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Helper: deep equality check
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null) return false;
  
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every((key) => deepEqual(objA[key], objB[key]));
}

export {};
