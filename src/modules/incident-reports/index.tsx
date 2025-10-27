import React, { useState } from "react";
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

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'reported' | 'investigating' | 'action_required' | 'resolved' | 'closed';
  reported_date: string;
  impact_level: string;
}

const IncidentReports = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Equipment Malfunction - Main Engine',
      severity: 'high',
      category: 'Equipment',
      status: 'investigating',
      reported_date: '2025-10-26',
      impact_level: 'major'
    },
    {
      id: '2',
      title: 'Safety Protocol Violation',
      severity: 'medium',
      category: 'Safety',
      status: 'action_required',
      reported_date: '2025-10-25',
      impact_level: 'moderate'
    },
    {
      id: '3',
      title: 'Minor Personnel Injury',
      severity: 'low',
      category: 'Personnel',
      status: 'resolved',
      reported_date: '2025-10-24',
      impact_level: 'minor'
    }
  ];

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
      case 'action_required': return 'text-orange-600';
      case 'investigating': return 'text-blue-600';
      case 'reported': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

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
        <Button>
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
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">139</div>
            <p className="text-xs text-muted-foreground">94.6% resolution</p>
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
                {incidents.map(incident => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-12 rounded ${getSeverityColor(incident.severity)}`} />
                      <div className="flex-1">
                        <div className="font-medium">{incident.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{incident.category}</Badge>
                          <span>•</span>
                          <span>{new Date(incident.reported_date).toLocaleDateString()}</span>
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
    </div>
  );
};

export default IncidentReports;
