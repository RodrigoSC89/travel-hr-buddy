/**
 * MLC Inspection Overview Component
 * Inspired by professional maritime inspection dashboard design
 * Features: World map, quick stats, inspection details, findings table
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ship, MapPin, Calendar, User, Flag, FileText, Plus,
  CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown,
  Globe, Users, ClipboardCheck, FileCheck, MoreHorizontal
} from 'lucide-react';

interface Finding {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'open' | 'resolved' | 'pending';
  correctiveAction: string;
}

interface InspectionHistoryItem {
  date: string;
  vesselName: string;
  flagState: string;
  status: 'completed' | 'pending' | 'deficiencies';
}

interface MLCInspectionOverviewProps {
  vesselName?: string;
  imoNumber?: string;
  inspectionDate?: string;
  flagState?: string;
  inspector?: string;
  findings?: Finding[];
  inspectionHistory?: InspectionHistoryItem[];
  stats?: {
    inspectionsConducted: number;
    shipsInspected: number;
    deficienciesFound: number;
    reportsPending: number;
    upcomingInspections: number;
    completedInspections: number;
  };
  onAddFinding?: () => void;
  onViewDetails?: (id: string) => void;
}

export function MLCInspectionOverview({
  vesselName = 'MV Ocean Star',
  imoNumber = '9876543',
  inspectionDate = new Date().toLocaleDateString('pt-BR'),
  flagState = 'Panama',
  inspector = 'Carlos Silva',
  findings = [],
  inspectionHistory = [],
  stats = {
    inspectionsConducted: 12,
    shipsInspected: 8,
    deficienciesFound: 3,
    reportsPending: 2,
    upcomingInspections: 2,
    completedInspections: 10,
  },
  onAddFinding,
  onViewDetails,
}: MLCInspectionOverviewProps) {
  const [activeCategory, setActiveCategory] = useState('general');
  const [documents, setDocuments] = useState({
    mlcCertificate: true,
    dmlc: true,
    crewList: true,
    healthSafetyManual: true,
  });

  // Survey results (mock data)
  const surveyResults = {
    crewSatisfaction: 85,
    workingHoursCompliance: 75,
  };

  const defaultFindings: Finding[] = findings.length > 0 ? findings : [
    { id: '1', name: 'Medical Facilities', category: 'Labor Standards', status: 'open', correctiveAction: 'Contracts to be provided.' },
    { id: '2', name: 'Crew Contracts', description: 'Missing employment contracts', category: 'Health & Safety', status: 'resolved', correctiveAction: 'Safety gear updated.' },
  ];

  const defaultHistory: InspectionHistoryItem[] = inspectionHistory.length > 0 ? inspectionHistory : [
    { date: '15/03/2024', vesselName: 'MV Seawind', flagState: 'Norway', status: 'completed' },
    { date: '12/03/2024', vesselName: 'MV Ocean Star', flagState: 'Panama', status: 'completed' },
    { date: '05/03/2024', vesselName: 'MV Horizon', flagState: 'Singapore', status: 'pending' },
    { date: '26/02/2024', vesselName: 'MV Blue Wave', flagState: 'Liberia', status: 'deficiencies' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-orange-500 text-white">Open</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'deficiencies':
        return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />No Deficiencies</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 flex items-center gap-3 bg-primary/5 border-primary/20">
          <Plus className="h-5 w-5 text-primary" />
          <div>
            <div className="text-lg font-bold">{stats.inspectionsConducted}</div>
            <p className="text-xs text-muted-foreground">Inspections Conducted</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <Ship className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-lg font-bold">{stats.shipsInspected}</div>
            <p className="text-xs text-muted-foreground">Ships Inspected</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <div className="text-lg font-bold text-green-600">{stats.deficienciesFound}</div>
            <p className="text-xs text-muted-foreground">Deficiencies Found</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <div className="text-lg font-bold text-orange-600">{stats.reportsPending}</div>
            <p className="text-xs text-muted-foreground">Reports Pending</p>
          </div>
        </Card>
      </div>

      {/* Inspection Overview with Map */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            INSPECTION OVERVIEW
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* World Map Placeholder */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-blue-500/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Inspection Locations</p>
                </div>
              </div>
              {/* Map pins */}
              <div className="absolute top-1/4 left-1/3">
                <MapPin className="h-5 w-5 text-primary fill-primary/20" />
              </div>
              <div className="absolute top-1/2 left-1/2">
                <MapPin className="h-5 w-5 text-green-500 fill-green-500/20" />
              </div>
              <div className="absolute bottom-1/3 right-1/4">
                <MapPin className="h-5 w-5 text-orange-500 fill-orange-500/20" />
              </div>
              {/* Dropdown overlay */}
              <div className="absolute top-2 right-2">
                <Select defaultValue="upcoming">
                  <SelectTrigger className="w-40 h-8 text-xs bg-background/80 backdrop-blur">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming Inspections</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Stats on map */}
              <div className="absolute bottom-2 left-2 text-xs space-y-1">
                <div><span className="font-semibold">20</span> Scheduled</div>
                <div><span className="font-semibold">10</span> Completed</div>
                <div><span className="font-semibold">2</span> Reports Pending</div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.upcomingInspections}</div>
                  <p className="text-xs text-muted-foreground">Upcoming Inspections</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.completedInspections}</div>
                  <p className="text-xs text-muted-foreground">Completed Inspections</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3 col-span-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.reportsPending}</div>
                  <p className="text-xs text-muted-foreground">Pending Reports</p>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Details */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ship className="h-4 w-4" />
            INSPECTION DETAILS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Vessel Name:</p>
              <p className="font-semibold">{vesselName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">IMO Number:</p>
              <p className="font-semibold">{imoNumber}</p>
            </div>
            <div className="space-y-1 relative">
              <p className="text-xs text-muted-foreground">Inspection:</p>
              <p className="font-semibold">{inspectionDate}</p>
              <div className="absolute -top-1 right-0 w-12 h-12 opacity-20">
                <Ship className="h-full w-full text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Flag State:</p>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span className="font-semibold">{flagState}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Inspector:</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-semibold">{inspector}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings Section with Tabs */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="general" className="w-full" onValueChange={setActiveCategory}>
              <TabsList className="h-auto p-0 bg-transparent border-b-0">
                <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  General Conditions
                </TabsTrigger>
                <TabsTrigger value="accommodation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Crew Accommodation
                </TabsTrigger>
                <TabsTrigger value="health" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Health & Safety
                </TabsTrigger>
                <TabsTrigger value="rights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Seafarers' Rights
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" onClick={onAddFinding}>
              <Plus className="h-4 w-4 mr-1" />
              ADD FINDING
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Findings</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Findings</th>
                    <th className="text-left p-3 text-sm font-medium">Category</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Corrective Action</th>
                    <th className="text-center p-3 text-sm font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {defaultFindings.map((finding, index) => (
                    <tr key={finding.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${finding.status === 'resolved' ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="font-medium">{finding.name}</p>
                            {finding.description && (
                              <p className="text-xs text-muted-foreground">{finding.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{finding.category}</td>
                      <td className="p-3">{getStatusBadge(finding.status)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{finding.correctiveAction}</td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation & Certificates + Interviews & Surveys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentation */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                DOCUMENTATION & CERTIFICATES
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">MLC Certificates</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="mlc-cert" 
                    checked={documents.mlcCertificate}
                    onCheckedChange={(checked) => setDocuments(prev => ({ ...prev, mlcCertificate: !!checked }))}
                  />
                  <label htmlFor="mlc-cert" className="text-sm">MLC Certificate of Compliance</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="dmlc" 
                    checked={documents.dmlc}
                    onCheckedChange={(checked) => setDocuments(prev => ({ ...prev, dmlc: !!checked }))}
                  />
                  <label htmlFor="dmlc" className="text-sm">Declaration of Maritime Labour Compliance</label>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              UPLOAD DOCUMENT
            </Button>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Ship Documents</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="crew-list" 
                    checked={documents.crewList}
                    onCheckedChange={(checked) => setDocuments(prev => ({ ...prev, crewList: !!checked }))}
                  />
                  <label htmlFor="crew-list" className="text-sm">Crew List</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="health-manual" 
                    checked={documents.healthSafetyManual}
                    onCheckedChange={(checked) => setDocuments(prev => ({ ...prev, healthSafetyManual: !!checked }))}
                  />
                  <label htmlFor="health-manual" className="text-sm">Health & Safety Manual</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interviews & Surveys + Final Report */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  INTERVIEWS & SURVEYS
                </div>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Survey Results</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Crew Satisfaction</span>
                      <span className="font-semibold">{surveyResults.crewSatisfaction}%</span>
                    </div>
                    <Progress value={surveyResults.crewSatisfaction} className="h-2 bg-green-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Working Hours Compliance</span>
                      <span className="font-semibold">{surveyResults.workingHoursCompliance}%</span>
                    </div>
                    <Progress value={surveyResults.workingHoursCompliance} className="h-2 bg-green-100" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Crew interviews conducted. Concerns raised about overtime hours.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  FINAL REPORT
                </div>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Inspection Status:</span>
                <Badge className="bg-green-500 text-white">Completed</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Deficiencies Found:</span>
                <span className="font-semibold">{stats.deficienciesFound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Actions Taken:</span>
                <span className="text-sm">Corrected <span className="text-green-600 font-semibold">2</span>, Pending <span className="text-orange-600 font-semibold">1</span></span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">Inspector's Remarks</p>
                <p className="text-xs text-muted-foreground">
                  The inspection identified deficiencies in employment contracts and safety equipment. Corrective actions are in progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inspection History */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              INSPECTION HISTORY
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Vessel Name</th>
                  <th className="text-left p-3 text-sm font-medium">Flag State</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {defaultHistory.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 cursor-pointer">
                    <td className="p-3 text-sm">{item.date}</td>
                    <td className="p-3 text-sm font-medium">{item.vesselName}</td>
                    <td className="p-3 text-sm">{item.flagState}</td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
