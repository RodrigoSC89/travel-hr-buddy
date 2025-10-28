// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { FileText, Download, Calendar, Clock, Filter, Send, FileJson, File, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface ComplianceReport {
  id: string;
  title: string;
  template: string;
  format: 'pdf' | 'csv' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'scheduled' | 'error';
  generated_at: string;
  scheduled: boolean;
  schedule_frequency?: 'daily' | 'weekly' | 'monthly';
  next_run?: string;
  filters?: {
    categories?: string[];
    severities?: string[];
    dateRange?: { from?: Date; to?: Date };
  };
}

const ComplianceReports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reportConfig, setReportConfig] = useState({
    title: '',
    template: '',
    format: 'pdf' as 'pdf' | 'csv' | 'json',
    schedule: 'manual',
    categories: [] as string[],
    severities: [] as string[],
    dateRange: {} as { from?: Date; to?: Date }
  });

  const templates = [
    'SGSO Compliance',
    'Full Audit',
    'Environmental Report',
    'Safety Metrics',
    'Training Summary',
    'Incident Analysis',
    'Vessel Compliance Overview'
  ];

  const categories = [
    'Safety',
    'Environmental',
    'Quality',
    'Training',
    'Operations',
    'Maintenance',
    'Security'
  ];

  const severities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (report: ComplianceReport, data: any[]) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text(report.title, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Template: ${report.template}`, 14, 32);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 40);
      
      // Filters info
      if (report.filters) {
        let yPos = 48;
        if (report.filters.categories?.length) {
          doc.text(`Categories: ${report.filters.categories.join(', ')}`, 14, yPos);
          yPos += 8;
        }
        if (report.filters.severities?.length) {
          doc.text(`Severities: ${report.filters.severities.join(', ')}`, 14, yPos);
          yPos += 8;
        }
        if (report.filters.dateRange?.from && report.filters.dateRange?.to) {
          doc.text(
            `Period: ${format(report.filters.dateRange.from, 'PP')} - ${format(report.filters.dateRange.to, 'PP')}`,
            14,
            yPos
          );
        }
      }
      
      // Data table
      if (data && data.length > 0) {
        const tableData = data.map(item => [
          item.date || '-',
          item.category || '-',
          item.severity || '-',
          item.status || '-',
          item.description || '-'
        ]);

        doc.autoTable({
          head: [['Date', 'Category', 'Severity', 'Status', 'Description']],
          body: tableData,
          startY: 70,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
      }

      const fileName = `${report.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      doc.save(fileName);
      
      sonnerToast.success('PDF report generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      sonnerToast.error('Failed to generate PDF');
    }
  };

  const generateCSV = (report: ComplianceReport, data: any[]) => {
    try {
      const headers = ['Date', 'Category', 'Severity', 'Status', 'Description'];
      const csvData = data.map(item => [
        item.date || '-',
        item.category || '-',
        item.severity || '-',
        item.status || '-',
        item.description || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      sonnerToast.success('CSV report exported successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      sonnerToast.error('Failed to export CSV');
    }
  };

  const generateJSON = (report: ComplianceReport, data: any[]) => {
    try {
      const jsonData = {
        title: report.title,
        template: report.template,
        generated_at: new Date().toISOString(),
        filters: report.filters,
        data: data
      };

      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      sonnerToast.success('JSON report exported successfully');
    } catch (error) {
      console.error('JSON export error:', error);
      sonnerToast.error('Failed to export JSON');
    }
  };

  const fetchComplianceData = async (filters: any) => {
    try {
      let query = supabase
        .from('compliance_items')
        .select('*');

      if (filters.categories?.length > 0) {
        query = query.in('category', filters.categories);
      }

      if (filters.severities?.length > 0) {
        query = query.in('severity', filters.severities);
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data for reports
      return (data || []).map(item => ({
        date: format(new Date(item.created_at), 'yyyy-MM-dd'),
        category: item.category,
        severity: item.severity,
        status: item.status,
        description: item.description || item.title
      }));
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      return [];
    }
  };

  const handleCreateReport = async () => {
    if (!reportConfig.title || !reportConfig.template) {
      toast({
        title: 'Required fields',
        description: 'Please fill in title and template',
        variant: 'destructive'
      });
      return;
    }

    const newReport: ComplianceReport = {
      id: Date.now().toString(),
      title: reportConfig.title,
      template: reportConfig.template,
      format: reportConfig.format,
      status: reportConfig.schedule === 'manual' ? 'pending' : 'scheduled',
      generated_at: new Date().toISOString(),
      scheduled: reportConfig.schedule !== 'manual',
      schedule_frequency: reportConfig.schedule !== 'manual' ? reportConfig.schedule as any : undefined,
      next_run: reportConfig.schedule !== 'manual' 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      filters: {
        categories: reportConfig.categories,
        severities: reportConfig.severities,
        dateRange: reportConfig.dateRange
      }
    };

    try {
      const { error } = await supabase
        .from('compliance_reports')
        .insert(newReport);

      if (error) throw error;

      setReports([newReport, ...reports]);
      setShowForm(false);
      resetForm();
      
      toast({
        title: 'Report configured',
        description: newReport.scheduled ? 'Will be generated automatically' : 'Starting generation'
      });

      if (!newReport.scheduled) {
        await handleGenerateNow(newReport.id);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to create report',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setReportConfig({
      title: '',
      template: '',
      format: 'pdf',
      schedule: 'manual',
      categories: [],
      severities: [],
      dateRange: {}
    });
  };

  const handleGenerateNow = async (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'generating' } : r
    ));

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Fetch data with filters
      const data = await fetchComplianceData(report.filters);

      // Generate report based on format
      switch (report.format) {
        case 'pdf':
          await generatePDF(report, data);
          break;
        case 'csv':
          generateCSV(report, data);
          break;
        case 'json':
          generateJSON(report, data);
          break;
      }

      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'completed', generated_at: new Date().toISOString() } : r
      ));
      
      toast({
        title: 'Report generated',
        description: 'Available for download'
      });
    } catch (error) {
      console.error('Generation error:', error);
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'error' } : r
      ));
      toast({
        title: 'Generation failed',
        description: 'An error occurred while generating the report',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      generating: 'bg-blue-500',
      scheduled: 'bg-amber-500',
      pending: 'bg-muted',
      error: 'bg-destructive'
    };
    return colors[status] || 'bg-muted';
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'csv': return <File className="h-4 w-4" />;
      case 'json': return <FileJson className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = reportConfig.categories.includes(category)
      ? reportConfig.categories.filter(c => c !== category)
      : [...reportConfig.categories, category];
    setReportConfig({ ...reportConfig, categories: newCategories });
  };

  const toggleSeverity = (severity: string) => {
    const newSeverities = reportConfig.severities.includes(severity)
      ? reportConfig.severities.filter(s => s !== severity)
      : [...reportConfig.severities, severity];
    setReportConfig({ ...reportConfig, severities: newSeverities });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Reports</h1>
            <p className="text-muted-foreground">Generation and scheduling of compliance reports</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.scheduled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => {
                const reportDate = new Date(r.generated_at);
                const now = new Date();
                return reportDate.getMonth() === now.getMonth() && 
                       reportDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 
                ? Math.round((reports.filter(r => r.status === 'completed').length / reports.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creation Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configure New Report</CardTitle>
            <CardDescription>Set up filters, format, and scheduling for your compliance report</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label>Report Title</Label>
                  <Input
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                    placeholder="Ex: Monthly Compliance Report"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template</Label>
                    <Select 
                      value={reportConfig.template} 
                      onValueChange={(v) => setReportConfig({ ...reportConfig, template: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template} value={template}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Format</Label>
                    <Select 
                      value={reportConfig.format} 
                      onValueChange={(v: 'pdf' | 'csv' | 'json') => setReportConfig({ ...reportConfig, format: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div>
                  <Label className="mb-3 block">Date Range</Label>
                  <DatePickerWithRange 
                    value={reportConfig.dateRange}
                    onChange={(range) => setReportConfig({ ...reportConfig, dateRange: range })}
                  />
                </div>
                <div>
                  <Label className="mb-3 block">Categories</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={reportConfig.categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`cat-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Severities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {severities.map((severity) => (
                      <div key={severity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sev-${severity}`}
                          checked={reportConfig.severities.includes(severity)}
                          onCheckedChange={() => toggleSeverity(severity)}
                        />
                        <label
                          htmlFor={`sev-${severity}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {severity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div>
                  <Label>Scheduling</Label>
                  <Select 
                    value={reportConfig.schedule} 
                    onValueChange={(v) => setReportConfig({ ...reportConfig, schedule: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual (Generate once)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  {reportConfig.schedule !== 'manual' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      This report will be generated automatically {reportConfig.schedule}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleCreateReport}>Create Report</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>View and download generated compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports yet</p>
              <p className="text-sm mt-2">Click "New Report" to create your first compliance report</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      {report.scheduled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.schedule_frequency}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {getFormatIcon(report.format)}
                        <span className="text-xs text-muted-foreground">{report.format.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Template: {report.template}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(report.generated_at), 'PPp')}
                      </span>
                      {report.next_run && (
                        <span>Next: {format(new Date(report.next_run), 'PP')}</span>
                      )}
                    </div>
                    {report.filters && (
                      <div className="flex gap-2 mt-2">
                        {report.filters.categories && report.filters.categories.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {report.filters.categories.length} categories
                          </Badge>
                        )}
                        {report.filters.severities && report.filters.severities.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {report.filters.severities.length} severities
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'scheduled' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateNow(report.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Generate Now
                      </Button>
                    )}
                    {report.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateNow(report.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                    {report.status === 'error' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateNow(report.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceReports;
