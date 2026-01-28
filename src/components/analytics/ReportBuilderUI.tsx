/**
 * Report Builder UI - Enterprise Excellence v5.0
 * Drag-drop interface for custom reports
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  Play, 
  BarChart3, 
  PieChart, 
  LineChart,
  Table,
  Hash,
  GripVertical
} from 'lucide-react';
import { 
  reportBuilder, 
  type DataSource, 
  type ReportWidget, 
  type ChartType,
  type AggregationType
} from '@/lib/analytics/report-builder';

interface ReportBuilderUIProps {
  onSave?: (reportId: string) => void;
}

const chartTypeIcons: Record<ChartType, React.ReactNode> = {
  line: <LineChart className="h-4 w-4" />,
  bar: <BarChart3 className="h-4 w-4" />,
  pie: <PieChart className="h-4 w-4" />,
  area: <LineChart className="h-4 w-4" />,
  scatter: <BarChart3 className="h-4 w-4" />,
  table: <Table className="h-4 w-4" />,
  kpi: <Hash className="h-4 w-4" />
};

export function ReportBuilderUI({ onSave }: ReportBuilderUIProps) {
  const [reportName, setReportName] = useState('New Report');
  const [reportId, setReportId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);

  const dataSources = reportBuilder.getDataSources();

  // Create report on first widget add
  const ensureReport = useCallback(() => {
    if (!reportId) {
      const report = reportBuilder.createReport(reportName);
      setReportId(report.id);
      return report.id;
    }
    return reportId;
  }, [reportId, reportName]);

  // Add new widget
  const addWidget = useCallback((type: ChartType) => {
    const id = ensureReport();
    
    const newWidget = reportBuilder.addWidget(id, {
      type,
      title: `New ${type} chart`,
      dataSource: dataSources[0]?.id || '',
      columns: [],
      filters: [],
      options: {},
      position: { x: 0, y: widgets.length, w: 6, h: 4 }
    });

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
  }, [ensureReport, dataSources, widgets.length]);

  // Update widget
  const updateWidget = useCallback((widgetId: string, updates: Partial<ReportWidget>) => {
    if (!reportId) return;
    
    reportBuilder.updateWidget(reportId, widgetId, updates);
    setWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, ...updates } : w)
    );
  }, [reportId]);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    if (!reportId) return;
    
    reportBuilder.removeWidget(reportId, widgetId);
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  }, [reportId, selectedWidget]);

  // Execute report
  const executeReport = useCallback(async () => {
    if (!reportId) return;
    
    setIsExecuting(true);
    try {
      const data = await reportBuilder.executeReport(reportId);
      setResults(data.flatMap(d => d.data));
    } catch (error) {
      console.error('Report execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [reportId]);

  // Export report
  const exportReport = useCallback(async (format: 'pdf' | 'excel') => {
    if (!reportId) return;
    
    try {
      const blob = format === 'pdf' 
        ? await reportBuilder.exportToPDF(reportId)
        : await reportBuilder.exportToExcel(reportId);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [reportId, reportName]);

  const selectedWidgetData = widgets.find(w => w.id === selectedWidget);
  const selectedDataSource = selectedWidgetData 
    ? dataSources.find(ds => ds.id === selectedWidgetData.dataSource)
    : null;

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Widget Palette */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Add Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(chartTypeIcons) as ChartType[]).map(type => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => addWidget(type)}
              >
                {chartTypeIcons[type]}
                <span className="capitalize">{type}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dataSources.map(ds => (
              <div key={ds.id} className="text-sm text-muted-foreground">
                {ds.name}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="max-w-xs font-semibold"
          />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={executeReport}
              disabled={isExecuting || widgets.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportReport('excel')}
              disabled={widgets.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => onSave?.(reportId || '')}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-12 gap-4 min-h-[400px] p-4 border rounded-lg bg-muted/20">
          {widgets.length === 0 ? (
            <div className="col-span-12 flex items-center justify-center text-muted-foreground">
              Add widgets from the sidebar to start building your report
            </div>
          ) : (
            widgets.map(widget => (
              <Card
                key={widget.id}
                className={`col-span-6 cursor-pointer transition-all ${
                  selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedWidget(widget.id)}
              >
                <CardHeader className="py-2 flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    {chartTypeIcons[widget.type]}
                    <span className="text-sm font-medium">{widget.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(widget.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent className="py-4 min-h-[150px] flex items-center justify-center">
                  {widget.columns.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Configure widget →
                    </span>
                  ) : (
                    <div className="text-sm">
                      {widget.columns.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results Preview */}
        {results.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Results Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[200px] overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(results.slice(0, 10), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Sidebar - Widget Configuration */}
      <div className="w-80 flex-shrink-0">
        {selectedWidgetData ? (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Widget Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="data">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                
                <TabsContent value="data" className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={selectedWidgetData.title}
                      onChange={(e) => updateWidget(selectedWidgetData.id, { title: e.target.value })}
                    />
                  </div>

                  {/* Data Source */}
                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select
                      value={selectedWidgetData.dataSource}
                      onValueChange={(value) => updateWidget(selectedWidgetData.id, { dataSource: value, columns: [] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map(ds => (
                          <SelectItem key={ds.id} value={ds.id}>
                            {ds.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Columns */}
                  {selectedDataSource && (
                    <div className="space-y-2">
                      <Label>Columns</Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedDataSource.columns.map(col => (
                          <Badge
                            key={col.name}
                            variant={selectedWidgetData.columns.includes(col.name) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const newColumns = selectedWidgetData.columns.includes(col.name)
                                ? selectedWidgetData.columns.filter(c => c !== col.name)
                                : [...selectedWidgetData.columns, col.name];
                              updateWidget(selectedWidgetData.id, { columns: newColumns });
                            }}
                          >
                            {col.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aggregation */}
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select
                      value={selectedWidgetData.aggregation || ''}
                      onValueChange={(value) => updateWidget(selectedWidgetData.id, { aggregation: value as AggregationType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Min</SelectItem>
                        <SelectItem value="max">Max</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group By */}
                  {selectedDataSource && selectedWidgetData.aggregation && (
                    <div className="space-y-2">
                      <Label>Group By</Label>
                      <Select
                        value={selectedWidgetData.groupBy || ''}
                        onValueChange={(value) => updateWidget(selectedWidgetData.id, { groupBy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDataSource.columns
                            .filter(c => c.groupable)
                            .map(col => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  {/* Chart Type */}
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={selectedWidgetData.type}
                      onValueChange={(value) => updateWidget(selectedWidgetData.id, { type: value as ChartType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(chartTypeIcons) as ChartType[]).map(type => (
                          <SelectItem key={type} value={type}>
                            <span className="capitalize">{type}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={selectedWidgetData.position.w}
                        onChange={(e) => updateWidget(selectedWidgetData.id, {
                          position: { ...selectedWidgetData.position, w: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={selectedWidgetData.position.h}
                        onChange={(e) => updateWidget(selectedWidgetData.id, {
                          position: { ...selectedWidgetData.position, h: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Select a widget to configure
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ReportBuilderUI;
