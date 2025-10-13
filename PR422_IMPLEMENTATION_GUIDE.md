# PR #422 - Future Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the full functionality of the restore logs pages when the database schema is ready.

---

## Prerequisites

Before implementing the full functionality, ensure the following database schema is created:

### Database Schema Requirements

#### 1. document_restore_logs Table
```sql
CREATE TABLE document_restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES auth.users(id),
  restored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version_number INTEGER,
  status TEXT, -- 'success', 'failed', 'partial'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_document_restore_logs_document_id ON document_restore_logs(document_id);
CREATE INDEX idx_document_restore_logs_user_id ON document_restore_logs(user_id);
CREATE INDEX idx_document_restore_logs_restored_at ON document_restore_logs(restored_at);
CREATE INDEX idx_document_restore_logs_status ON document_restore_logs(status);
```

#### 2. restore_report_logs Table
```sql
CREATE TABLE restore_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID,
  user_id UUID REFERENCES auth.users(id),
  action TEXT, -- 'generated', 'exported', 'viewed'
  restored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_restore_report_logs_user_id ON restore_report_logs(user_id);
CREATE INDEX idx_restore_report_logs_restored_at ON restore_report_logs(restored_at);
CREATE INDEX idx_restore_report_logs_action ON restore_report_logs(action);
```

#### 3. RPC Functions

**get_restore_summary**
```sql
CREATE OR REPLACE FUNCTION get_restore_summary(email_filter TEXT DEFAULT NULL)
RETURNS TABLE(
  total BIGINT,
  unique_docs BIGINT,
  avg_per_day NUMERIC,
  last_execution TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total,
    COUNT(DISTINCT document_id)::BIGINT as unique_docs,
    (COUNT(*) / NULLIF(DATE_PART('day', NOW() - MIN(restored_at)), 0))::NUMERIC as avg_per_day,
    MAX(restored_at) as last_execution
  FROM document_restore_logs
  WHERE 
    CASE 
      WHEN email_filter IS NOT NULL THEN
        user_id IN (SELECT id FROM auth.users WHERE email = email_filter)
      ELSE TRUE
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**get_restore_count_by_day_with_email**
```sql
CREATE OR REPLACE FUNCTION get_restore_count_by_day_with_email(
  email_filter TEXT DEFAULT NULL,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  day DATE,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(restored_at) as day,
    COUNT(*)::BIGINT as count
  FROM document_restore_logs
  WHERE 
    restored_at >= NOW() - (days_back || ' days')::INTERVAL
    AND CASE 
      WHEN email_filter IS NOT NULL THEN
        user_id IN (SELECT id FROM auth.users WHERE email = email_filter)
      ELSE TRUE
    END
  GROUP BY DATE(restored_at)
  ORDER BY DATE(restored_at) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**get_restore_count_by_status**
```sql
CREATE OR REPLACE FUNCTION get_restore_count_by_status(email_filter TEXT DEFAULT NULL)
RETURNS TABLE(
  name TEXT,
  value BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    status as name,
    COUNT(*)::BIGINT as value
  FROM document_restore_logs
  WHERE 
    CASE 
      WHEN email_filter IS NOT NULL THEN
        user_id IN (SELECT id FROM auth.users WHERE email = email_filter)
      ELSE TRUE
    END
  GROUP BY status
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 4. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE document_restore_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_report_logs ENABLE ROW LEVEL SECURITY;

-- Policies for document_restore_logs
CREATE POLICY "Users can view their own restore logs"
  ON document_restore_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all restore logs"
  ON document_restore_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policies for restore_report_logs
CREATE POLICY "Users can view their own report logs"
  ON restore_report_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all report logs"
  ON restore_report_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
```

---

## Implementation Steps

### Step 1: Update the Hook (use-restore-logs-summary.ts)

Replace the mock implementation with the real implementation:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRestoreLogsSummary(emailInput: string | null = null): UseRestoreLogsSummaryResult {
  const [data, setData] = useState<RestoreLogsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_restore_summary', { email_filter: emailInput });

      if (summaryError) throw summaryError;

      // Fetch by day
      const { data: byDayData, error: byDayError } = await supabase
        .rpc('get_restore_count_by_day_with_email', { 
          email_filter: emailInput,
          days_back: 30 
        });

      if (byDayError) throw byDayError;

      // Fetch by status
      const { data: byStatusData, error: byStatusError } = await supabase
        .rpc('get_restore_count_by_status', { email_filter: emailInput });

      if (byStatusError) throw byStatusError;

      setData({
        summary: summaryData[0] || {
          total: 0,
          unique_docs: 0,
          avg_per_day: 0,
          last_execution: null,
        },
        byDay: byDayData || [],
        byStatus: byStatusData || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [emailInput]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
```

### Step 2: Update RestoreChartEmbed.tsx

Add back the chart and data visualization:

```typescript
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRestoreLogsSummary } from "@/hooks/use-restore-logs-summary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RestoreChartEmbed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Validate token
  useEffect(() => {
    const expectedToken = import.meta.env.VITE_EMBED_ACCESS_TOKEN;
    if (!token || token !== expectedToken) {
      navigate("/unauthorized");
    }
  }, [token, navigate]);

  const { data, loading, error } = useRestoreLogsSummary(email);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error?.message || "Dados não disponíveis"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const chartData = {
    labels: data.byDay.map(item => item.day),
    datasets: [{
      label: 'Restaurações por Dia',
      data: data.byDay.map(item => item.count),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: email ? `Restaurações - ${email}` : 'Restaurações de Documentos',
      },
    },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total</h3>
            <p className="text-2xl font-bold">{data.summary.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Docs Únicos</h3>
            <p className="text-2xl font-bold">{data.summary.unique_docs}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Média/Dia</h3>
            <p className="text-2xl font-bold">{data.summary.avg_per_day.toFixed(1)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Última Execução</h3>
            <p className="text-sm font-medium">
              {data.summary.last_execution 
                ? new Date(data.summary.last_execution).toLocaleString('pt-BR')
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow" style={{ height: '500px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Update LogsPage.tsx (TV Wall)

Add back the charts and metrics:

```typescript
import { useRestoreLogsSummary } from "@/hooks/use-restore-logs-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TVWallLogsPage() {
  const { data, loading, error } = useRestoreLogsSummary(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card>
          <CardHeader>
            <CardTitle>TV Wall - Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar dados: {error?.message || "Dados não disponíveis"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">TV Wall - Logs de Restauração</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Restaurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documentos Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.summary.unique_docs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Média por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.summary.avg_per_day.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {data.summary.last_execution
                ? new Date(data.summary.last_execution).toLocaleString('pt-BR')
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurações por Dia</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de Restaurações</CardTitle>
          </CardHeader>
          <CardContent style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 4: Update logs.tsx (Admin Reports)

Add back filtering and export functionality:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestoreLogsSummary } from "@/hooks/use-restore-logs-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const [emailFilter, setEmailFilter] = useState("");
  const { data, loading, error, refetch } = useRestoreLogsSummary(emailFilter || null);

  const handleExportCSV = () => {
    if (!data) return;

    const csvContent = [
      ["Dia", "Contagem"],
      ...data.byDay.map(item => [item.day, item.count.toString()])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restore-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        ← Voltar
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Logs de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Filtrar por email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => refetch()}>Aplicar</Button>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={!data || data.byDay.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando dados...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar dados: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Data Display */}
          {data && !loading && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{data.summary.total}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Docs Únicos</p>
                  <p className="text-2xl font-bold">{data.summary.unique_docs}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Média/Dia</p>
                  <p className="text-2xl font-bold">{data.summary.avg_per_day.toFixed(1)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Última Execução</p>
                  <p className="text-sm">
                    {data.summary.last_execution
                      ? new Date(data.summary.last_execution).toLocaleString('pt-BR')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Restaurações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byDay.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(item.day).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 5: Update Tests

Restore the complex tests from git history and adapt them:

```bash
# View the original tests
git show <commit-before-simplification>:src/tests/hooks/use-restore-logs-summary.test.ts
git show <commit-before-simplification>:src/tests/pages/embed/RestoreChartEmbed.test.tsx
git show <commit-before-simplification>:src/tests/pages/tv/LogsPage.test.tsx
git show <commit-before-simplification>:src/tests/pages/admin/reports/logs.test.tsx

# Adapt and update as needed based on final implementation
```

---

## Testing Checklist

After implementation, verify:

- [ ] Database tables created with correct schema
- [ ] RPC functions created and tested
- [ ] RLS policies applied correctly
- [ ] Hook fetches data correctly
- [ ] Pages render with data
- [ ] Charts display properly
- [ ] Filtering works (where applicable)
- [ ] Export functionality works (where applicable)
- [ ] Loading states work
- [ ] Error states work
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Performance is acceptable

---

## Rollback Plan

If issues occur during deployment:

1. **Quick Fix**: Revert to placeholder implementation
   ```bash
   git revert <implementation-commit>
   git push
   ```

2. **Database**: Keep tables but disable RLS temporarily if needed
   ```sql
   ALTER TABLE document_restore_logs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE restore_report_logs DISABLE ROW LEVEL SECURITY;
   ```

3. **Feature Flag**: Consider adding a feature flag for gradual rollout
   ```typescript
   const RESTORE_LOGS_ENABLED = import.meta.env.VITE_RESTORE_LOGS_ENABLED === 'true';
   ```

---

## Performance Considerations

- **Indexing**: Ensure all indexes are created for fast queries
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider caching summary data
- **Auto-refresh**: Be mindful of refresh intervals on TV wall
- **Chart Performance**: Use chart libraries with good performance
- **Data Limits**: Set reasonable limits on date ranges

---

## Security Considerations

- **RLS**: Ensure row-level security is properly configured
- **Token Validation**: Validate embed tokens securely
- **Input Sanitization**: Sanitize email filters and other inputs
- **CORS**: Configure CORS properly for embed pages
- **Rate Limiting**: Consider rate limiting for API calls

---

## Conclusion

This guide provides a complete roadmap for implementing the full restore logs functionality. Follow each step carefully and test thoroughly before deploying to production.

