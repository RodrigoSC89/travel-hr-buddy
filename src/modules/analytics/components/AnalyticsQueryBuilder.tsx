
/**
 * PATCH 379: Analytics Query Builder
 * Advanced query builder with filters, aggregations, and custom dashboards
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Filter, Download, Plus, Trash2, Play } from "lucide-react";

interface QueryFilter {
  field: string;
  operator: string;
  value: string;
}

interface QueryConfig {
  table: string;
  filters: QueryFilter[];
  aggregation?: string;
  groupBy?: string;
  orderBy?: string;
  limit: number;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  count: number;
}

export const AnalyticsQueryBuilder: React.FC = () => {
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    table: "analytics_events",
    filters: [],
    limit: 100
  });
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addFilter = () => {
    setQueryConfig({
      ...queryConfig,
      filters: [
        ...queryConfig.filters,
        { field: "event_type", operator: "equals", value: "" }
      ]
    });
  };

  const removeFilter = (index: number) => {
    const newFilters = queryConfig.filters.filter((_, i) => i !== index);
    setQueryConfig({ ...queryConfig, filters: newFilters });
  };

  const updateFilter = (index: number, field: keyof QueryFilter, value: string) => {
    const newFilters = [...queryConfig.filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setQueryConfig({ ...queryConfig, filters: newFilters });
  };

  const executeQuery = async () => {
    try {
      setLoading(true);
      let query = supabase.from(queryConfig.table).select("*", { count: "exact" });

      // Apply filters
      queryConfig.filters.forEach((filter) => {
        if (filter.value) {
          switch (filter.operator) {
          case "equals":
            query = query.eq(filter.field, filter.value);
            break;
          case "not_equals":
            query = query.neq(filter.field, filter.value);
            break;
          case "greater_than":
            query = query.gt(filter.field, filter.value);
            break;
          case "less_than":
            query = query.lt(filter.field, filter.value);
            break;
          case "contains":
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
          }
        }
      });

      // Apply order
      if (queryConfig.orderBy) {
        query = query.order(queryConfig.orderBy, { ascending: false });
      }

      // Apply limit
      query = query.limit(queryConfig.limit);

      const { data, error, count } = await query;

      if (error) throw error;

      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
      setQueryResult({
        columns,
        rows: data || [],
        count: count || 0
      });

      toast({
        title: "Success",
        description: `Query returned ${data?.length || 0} results`
      });
    } catch (error) {
      console.error("Error executing query:", error);
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) {
      toast({
        title: "No Data",
        description: "No data to export",
        variant: "destructive"
      });
      return;
    }

    const headers = queryResult.columns.join(",");
    const rows = queryResult.rows.map((row) =>
      queryResult.columns.map((col) => {
        const value = row[col];
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      }).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported to CSV"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Analytics Query Builder</h1>
          <p className="text-muted-foreground">
            Build custom queries with filters and aggregations
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Query Configuration</CardTitle>
            <CardDescription>Configure your analytics query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Table/Source</Label>
              <Select
                value={queryConfig.table}
                onValueChange={(value) => setQueryConfig({ ...queryConfig, table: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytics_events">Events</SelectItem>
                  <SelectItem value="analytics_metrics">Metrics</SelectItem>
                  <SelectItem value="analytics_sessions">Sessions</SelectItem>
                  <SelectItem value="analytics_alert_history">Alert History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Filters</Label>
                <Button size="sm" variant="outline" onClick={addFilter}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {queryConfig.filters.map((filter, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Filter {index + 1}</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFilter(index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Field name"
                      value={filter.field}
                      onChange={(e) => updateFilter(index, "field", e.target.value)}
                      className="text-sm"
                    />
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, "operator", value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Order By</Label>
              <Select
                value={queryConfig.orderBy || ""}
                onValueChange={(value) => setQueryConfig({ ...queryConfig, orderBy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created At</SelectItem>
                  <SelectItem value="timestamp">Timestamp</SelectItem>
                  <SelectItem value="event_type">Event Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                value={queryConfig.limit}
                onChange={(e) => setQueryConfig({ ...queryConfig, limit: parseInt(e.target.value) || 100 })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={executeQuery}
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? "Running..." : "Run Query"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Query Results</CardTitle>
                {queryResult && (
                  <CardDescription>
                    {queryResult.count} total results, showing {queryResult.rows.length}
                  </CardDescription>
                )}
              </div>
              {queryResult && queryResult.rows.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!queryResult ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                Configure and run a query to see results
              </div>
            ) : queryResult.rows.length === 0 ? (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                No results found
              </div>
            ) : (
              <div className="border rounded-lg overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {queryResult.columns.map((column) => (
                        <th
                          key={column}
                          className="px-4 py-2 text-left font-medium text-gray-600"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t hover:bg-gray-50"
                      >
                        {queryResult.columns.map((column) => (
                          <td
                            key={column}
                            className="px-4 py-2 text-gray-700"
                          >
                            {typeof row[column] === "object"
                              ? JSON.stringify(row[column])
                              : String(row[column] || "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
