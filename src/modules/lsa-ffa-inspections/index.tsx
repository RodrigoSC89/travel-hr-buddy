import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  LifeBuoy, 
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLsaFfa } from './useLsaFfa';
import { LSAFFAForm } from './LSAFFAForm';
import { LSAFFAInsightAI } from './LSAFFAInsightAI';
import { ReportGenerator } from './ReportGenerator';
import type { Vessel, LSAFFAInspection } from './types';

export const LSAFFAInspections: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [selectedInspection, setSelectedInspection] = useState<LSAFFAInspection | null>(null);
  const [loading, setLoading] = useState(false);

  const { 
    inspections, 
    stats, 
    loading: dataLoading,
    fetchInspections 
  } = useLsaFfa(selectedVessel);

  // Fetch vessels on mount
  useEffect(() => {
    const fetchVessels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vessels')
          .select('id, name, imo_number, vessel_type, flag_state')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setVessels(data || []);
        
        if (data && data.length > 0) {
          setSelectedVessel(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching vessels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVessels();
  }, []);

  const handleDownloadReport = async (inspection: LSAFFAInspection) => {
    const vessel = vessels.find(v => v.id === inspection.vessel_id);
    if (vessel) {
      await ReportGenerator.downloadPDF(inspection, vessel);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskBadge = (rating?: string) => {
    switch (rating) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical Risk</Badge>;
      default:
        return <Badge variant="outline">Not Assessed</Badge>;
    }
  };

  const currentVessel = vessels.find(v => v.id === selectedVessel);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">LSA/FFA Inspections</h1>
            <p className="text-muted-foreground">
              Life Saving Appliances & Fire Fighting Appliances Inspection System
            </p>
          </div>
        </div>
      </div>

      {/* SOLAS Reference Banner */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Based on <strong>SOLAS Chapter III Regulation 20</strong>, <strong>MSC/Circ.1093</strong>, 
          and <strong>MSC/Circ.1206</strong> requirements for LSA/FFA maintenance and inspection.
        </AlertDescription>
      </Alert>

      {/* Vessel Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Vessel</CardTitle>
          <CardDescription>Choose a vessel to view or create inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vessel" />
            </SelectTrigger>
            <SelectContent>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.name} {vessel.imo_number ? `(IMO: ${vessel.imo_number})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Dashboard Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_inspections}</div>
              <p className="text-xs text-muted-foreground">
                LSA: {stats.lsa_inspections} | FFA: {stats.ffa_inspections}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_compliance_score.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.compliance_trend === 'improving' && (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Improving</span>
                  </>
                )}
                {stats.compliance_trend === 'declining' && (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Declining</span>
                  </>
                )}
                {stats.compliance_trend === 'stable' && <span>Stable</span>}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical_issues}</div>
              <p className="text-xs text-muted-foreground">
                {stats.open_corrective_actions} open actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue Actions</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.overdue_actions}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Inspection History</TabsTrigger>
          <TabsTrigger value="new">New Inspection</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Inspection History */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>
                View all LSA/FFA inspections for {currentVessel?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading inspections...</p>
                </div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No inspections found</p>
                  <Button className="mt-4" onClick={() => {}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Inspection
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell>{formatDate(inspection.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {inspection.type === 'LSA' ? (
                              <>
                                <LifeBuoy className="h-3 w-3" />
                                LSA
                              </>
                            ) : (
                              <>
                                <Flame className="h-3 w-3" />
                                FFA
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{inspection.inspector}</TableCell>
                        <TableCell>
                          <Badge className={getScoreColor(inspection.score)}>
                            {inspection.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{getRiskBadge(inspection.ai_risk_rating)}</TableCell>
                        <TableCell>
                          <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
                            {inspection.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedInspection(inspection)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadReport(inspection)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Selected Inspection Details */}
          {selectedInspection && (
            <LSAFFAInsightAI
              inspection={selectedInspection}
              onAnalysisComplete={(analysis) => {
                console.log('AI Analysis:', analysis);
              }}
            />
          )}
        </TabsContent>

        {/* New Inspection Form */}
        <TabsContent value="new">
          {selectedVessel ? (
            <LSAFFAForm
              vesselId={selectedVessel}
              vessel={currentVessel}
              onSubmitSuccess={() => fetchInspections(selectedVessel)}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a vessel first to create an inspection
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>
                Overview of LSA/FFA compliance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Compliance dashboard with charts and analytics</p>
                <p className="text-sm">Coming soon in next iteration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LSAFFAInspections;
