# PR #264 - Quick Reference Guide

## Usage Examples

### Using the Metrics Hook

```typescript
import { useRestoreLogsMetrics } from "@/hooks/use-restore-logs-metrics";

// In your component
const MyComponent = () => {
  const [logs, setLogs] = useState<RestoreLog[]>([]);
  
  // Calculate metrics automatically
  const metrics = useRestoreLogsMetrics(logs);
  
  return (
    <div>
      <p>Total Restores: {metrics.total}</p>
      <p>This Week: {metrics.thisWeek}</p>
      <p>This Month: {metrics.thisMonth}</p>
      <p>Most Active: {metrics.mostActiveUser} ({metrics.mostActiveCount})</p>
      
      {/* Use trend data for charts */}
      <Chart data={metrics.trendData} />
      
      {/* Use user distribution for charts */}
      <BarChart data={metrics.userDistribution} />
    </div>
  );
};
```

### Using Export Utilities

```typescript
import { exportLogsToCSV, exportLogsToPDF } from "@/utils/restore-logs-export";

// In your component
const MyComponent = () => {
  const [logs, setLogs] = useState<RestoreLog[]>([]);
  
  const handleExportCSV = () => {
    exportLogsToCSV(logs);  // Downloads CSV file automatically
  };
  
  const handleExportPDF = () => {
    exportLogsToPDF(logs);  // Downloads PDF file automatically
  };
  
  return (
    <div>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
};
```

## API Reference

### `useRestoreLogsMetrics(logs: RestoreLog[]): RestoreMetrics`

Custom hook that calculates various metrics from restore logs.

**Parameters:**
- `logs: RestoreLog[]` - Array of restore log objects

**Returns:** `RestoreMetrics` object containing:
- `total: number` - Total number of restores
- `thisWeek: number` - Number of restores this week
- `thisMonth: number` - Number of restores this month
- `mostActiveUser: string` - Email of most active user
- `mostActiveCount: number` - Number of restores by most active user
- `trendData: TrendDataPoint[]` - Array of daily restore counts (last 7 days)
- `userDistribution: UserDistribution[]` - Top 5 users by restore count

**Example:**
```typescript
const metrics = useRestoreLogsMetrics(filteredLogs);
console.log(metrics.total); // 42
console.log(metrics.trendData); // [{date: "05/10", count: 5}, ...]
```

### `exportLogsToCSV(logs: RestoreLog[]): void`

Exports restore logs to CSV format and triggers download.

**Parameters:**
- `logs: RestoreLog[]` - Array of restore log objects to export

**Behavior:**
- Returns early if logs array is empty
- Creates CSV with headers: Documento, Versão Restaurada, Restaurado por, Data
- Formats dates as dd/MM/yyyy HH:mm
- Automatically triggers browser download
- Cleans up blob URL after download

**Example:**
```typescript
exportLogsToCSV(logs); // Downloads "restore-logs.csv"
```

### `exportLogsToPDF(logs: RestoreLog[]): void`

Exports restore logs to PDF format and triggers download.

**Parameters:**
- `logs: RestoreLog[]` - Array of restore log objects to export

**Behavior:**
- Returns early if logs array is empty
- Creates PDF with title "Auditoria de Restauracoes"
- Includes table with: Documento, Versao, Email, Data
- Automatically adds pages when content exceeds page height
- Formats dates as dd/MM/yyyy HH:mm
- Triggers browser download

**Example:**
```typescript
exportLogsToPDF(logs); // Downloads "restore-logs.pdf"
```

## Type Definitions

### RestoreLog
```typescript
interface RestoreLog {
  id: string;
  document_id: string;
  version_id: string;
  restored_by: string;
  restored_at: string;  // ISO 8601 timestamp
  email: string | null;
}
```

### RestoreMetrics
```typescript
interface RestoreMetrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  mostActiveUser: string;
  mostActiveCount: number;
  trendData: TrendDataPoint[];
  userDistribution: UserDistribution[];
}
```

### TrendDataPoint
```typescript
interface TrendDataPoint {
  date: string;  // Format: "dd/MM"
  count: number;
}
```

### UserDistribution
```typescript
interface UserDistribution {
  name: string;  // Email (truncated if > 20 chars)
  count: number;
}
```

## Testing

### Testing the Metrics Hook
```typescript
import { renderHook } from "@testing-library/react";
import { useRestoreLogsMetrics } from "@/hooks/use-restore-logs-metrics";

it("should calculate total logs correctly", () => {
  const logs = [/* ... test data ... */];
  const { result } = renderHook(() => useRestoreLogsMetrics(logs));
  expect(result.current.total).toBe(2);
});
```

### Testing Export Functions
```typescript
import { exportLogsToCSV } from "@/utils/restore-logs-export";

it("should handle empty logs", () => {
  // Mock DOM methods
  const spy = vi.spyOn(document, "createElement");
  exportLogsToCSV([]);
  expect(spy).not.toHaveBeenCalled();
});
```

## Migration from Old Code

### Before (Inline)
```typescript
const metrics = useMemo(() => {
  // 50+ lines of calculation logic
}, [filteredLogs]);

function exportCSV() {
  // 25 lines of export logic
}
```

### After (Using New Modules)
```typescript
const metrics = useRestoreLogsMetrics(filteredLogs);

function exportCSV() {
  exportLogsToCSV(filteredLogs);
}
```

## Performance Notes

- The metrics hook uses `useMemo` internally to prevent unnecessary recalculations
- Export functions return early if given empty arrays to avoid unnecessary processing
- No additional re-renders introduced by the refactoring

## Best Practices

1. **Always pass filtered/sorted data** to the metrics hook for accurate calculations
2. **Check for empty arrays** before calling export functions (though they handle it gracefully)
3. **Reuse the hook** in any component that needs restore log metrics
4. **Import only what you need** to keep bundle size optimal

## Common Issues

**Q: Metrics not updating?**
A: Ensure you're passing the correct array reference. The hook recalculates when the array reference changes.

**Q: Export not working?**
A: Check browser console for errors. Ensure the logs array contains valid RestoreLog objects.

**Q: "Unknown" user appearing?**
A: This happens when email is null in the log. This is expected behavior.

## Support

For questions or issues, refer to:
- `PR264_REFACTORING_SUMMARY.md` - Complete overview
- `PR264_BEFORE_AFTER_COMPARISON.md` - Detailed comparisons
- Test files for usage examples
