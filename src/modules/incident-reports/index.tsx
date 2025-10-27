import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle, 
  TrendingDown,
  FileText,
  Search,
  Upload,
  Download,
  Plus,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateIncidentDialog } from "./components/CreateIncidentDialog";
import { IncidentDetailDialog } from "./components/IncidentDetailDialog";

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'pending' | 'under_analysis' | 'resolved' | 'closed';
  incident_date: string;
  impact_level: string;
  description?: string;
}

const IncidentReports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;

      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load incidents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'text-gray-600';
      case 'resolved': return 'text-green-600';
      case 'under_analysis': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'pending' || i.status === 'under_analysis').length,
    resolved: incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertOctagon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Incident Reports</h1>
            <p className="text-muted-foreground">Complete incident management system</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Incident
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}% resolution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-12%</div>
            <p className="text-xs text-muted-foreground">Reduction vs last year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">All Incidents</TabsTrigger>
          <TabsTrigger value="investigations">Investigations</TabsTrigger>
          <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest reported incidents and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.slice(0, 10).map(incident => (
                  <div 
                    key={incident.id} 
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-12 rounded ${getSeverityColor(incident.severity)}`} />
                      <div className="flex-1">
                        <div className="font-medium">{incident.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{incident.category}</Badge>
                          <span>•</span>
                          <span>{new Date(incident.incident_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{incident.incident_number}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(incident.status)} variant="outline">
                        {incident.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Incidents</CardTitle>
                  <CardDescription>View and manage all incident reports</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map(incident => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-1.5 h-16 rounded ${getSeverityColor(incident.severity)}`} />
                      <div className="flex-1">
                        <div className="font-medium text-lg">{incident.title}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <Badge>{incident.category}</Badge>
                          <Badge variant="outline">{incident.severity}</Badge>
                          <span className="text-muted-foreground">
                            Impact: {incident.impact_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(incident.reported_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Investigations</CardTitle>
              <CardDescription>Ongoing incident investigations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Equipment Malfunction Investigation</div>
                    <Badge>In Progress</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Lead: Chief Engineer Johnson</div>
                    <div>Started: Oct 26, 2025</div>
                    <div>Evidence: 5 items collected</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Safety Protocol Review</div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Lead: Safety Officer Smith</div>
                    <div>Completed: Oct 25, 2025</div>
                    <div>Root cause identified</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Corrective Actions</CardTitle>
              <CardDescription>Track corrective and preventive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">Update maintenance schedule</div>
                      <div className="text-sm text-muted-foreground mt-1">Preventive action for equipment failure</div>
                    </div>
                    <Badge className="bg-orange-500">High Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assigned to: Maintenance Team</span>
                    <span className="text-muted-foreground">Due: Oct 30, 2025</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">Conduct safety refresher training</div>
                      <div className="text-sm text-muted-foreground mt-1">Corrective action for protocol violation</div>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed by: Training Dept.</span>
                    <span className="text-muted-foreground">Oct 27, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateIncidentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchIncidents}
      />

      {selectedIncident && (
        <IncidentDetailDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </div>
  );
};

export default IncidentReports;
