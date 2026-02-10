/**
 * ISM/ISPS Audit Center - TIER-1 Compliance Management
 * Based on DNV Navigator, Helm CONNECT, ClassNK standards
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, FileText, CheckCircle, AlertTriangle, Clock, Calendar,
  ClipboardCheck, Award, Eye, Camera, Upload, MessageSquare,
  TrendingUp, Users, Ship, Building, Target, AlertCircle
} from "lucide-react";

interface AuditItem {
  id: string;
  code: string;
  requirement: string;
  category: string;
  status: 'compliant' | 'non_conformity' | 'observation' | 'pending';
  evidence: string[];
  lastAudit: string;
  nextAudit: string;
  responsibility: string;
  notes?: string;
}

interface NonConformity {
  id: string;
  ncNumber: string;
  type: 'major' | 'minor' | 'observation';
  source: 'ISM' | 'ISPS' | 'MLC' | 'MARPOL' | 'Internal';
  description: string;
  rootCause?: string;
  correctiveAction: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
  evidence?: string[];
  createdAt: string;
  closedAt?: string;
}

// ISM/ISPS audit checklist - regulatory reference data
const fallbackAuditItems: AuditItem[] = [
  { id: "1", code: "ISM 1.2", requirement: "Safety and Environmental Protection Policy documented and implemented", category: "Safety Policy", status: "compliant", evidence: ["policy.pdf", "implementation_record.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "DPA" },
  { id: "2", code: "ISM 2.1", requirement: "Company responsibility and authority defined", category: "Company Responsibilities", status: "compliant", evidence: ["org_chart.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "DPA" },
  { id: "3", code: "ISM 5.1", requirement: "Master's overriding authority documented", category: "Master's Authority", status: "compliant", evidence: ["master_authority.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "Master" },
  { id: "4", code: "ISM 6.1", requirement: "Resources and personnel adequate", category: "Resources", status: "observation", evidence: [], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "HR Manager", notes: "Training records need update" },
  { id: "5", code: "ISM 7.1", requirement: "Shipboard operations covered by procedures", category: "Operations", status: "compliant", evidence: ["sms_procedures.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "Master" },
  { id: "6", code: "ISM 8.1", requirement: "Emergency preparedness established", category: "Emergency", status: "compliant", evidence: ["contingency_plan.pdf", "drill_records.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "Master" },
  { id: "7", code: "ISM 9.1", requirement: "Non-conformities reported and analyzed", category: "NCR", status: "compliant", evidence: ["ncr_register.xlsx"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "DPA" },
  { id: "8", code: "ISM 10.1", requirement: "Maintenance of ship and equipment", category: "Maintenance", status: "non_conformity", evidence: [], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "C/E", notes: "PMS records incomplete for aux engine" },
  { id: "9", code: "ISPS A/9.4", requirement: "Ship Security Plan approved by Flag", category: "ISPS", status: "compliant", evidence: ["ssp_approval.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "SSO" },
  { id: "10", code: "ISPS A/11.1", requirement: "Security drills conducted", category: "ISPS", status: "compliant", evidence: ["security_drills.pdf"], lastAudit: "2026-01-15", nextAudit: "2026-07-15", responsibility: "SSO" },
];

// Non-conformities - regulatory tracking
const fallbackNCRs: NonConformity[] = [
  {
    id: "1",
    ncNumber: "NCR-2026-001",
    type: "minor",
    source: "ISM",
    description: "PMS records incomplete for auxiliary engine maintenance intervals",
    rootCause: "System migration caused data loss",
    correctiveAction: "Reconstruct maintenance history from engine logbooks and vendor records",
    responsiblePerson: "C/E L. Eriksen",
    dueDate: "2026-02-28",
    status: "in_progress",
    evidence: ["engine_logbook.pdf"],
    createdAt: "2026-01-15"
  },
  {
    id: "2",
    ncNumber: "OBS-2026-001",
    type: "observation",
    source: "ISM",
    description: "Training records for new crew members not updated within 7 days of joining",
    correctiveAction: "Implement automated reminder system for training record updates",
    responsiblePerson: "HR Manager",
    dueDate: "2026-02-15",
    status: "closed",
    evidence: ["training_system.pdf"],
    createdAt: "2026-01-15",
    closedAt: "2026-02-01"
  },
];

// Compliance Score Card
function ComplianceScoreCard() {
  const scores = {
    ism: 94,
    isps: 100,
    mlc: 96,
    marpol: 98,
    overall: 97
  };

  return (
    <Card className="bg-gradient-to-br from-success/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" 
                strokeDasharray={`${scores.overall * 3.52} 352`} 
                className="text-success" />
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-bold">{scores.overall}%</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "ISM Code", score: scores.ism, icon: Shield },
            { label: "ISPS Code", score: scores.isps, icon: Shield },
            { label: "MLC 2006", score: scores.mlc, icon: Users },
            { label: "MARPOL", score: scores.marpol, icon: Ship },
          ].map(item => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <item.icon className="h-3 w-3 text-muted-foreground" />
                  {item.label}
                </span>
                <span className={`font-medium ${item.score >= 95 ? 'text-success' : item.score >= 80 ? 'text-warning' : 'text-destructive'}`}>
                  {item.score}%
                </span>
              </div>
              <Progress value={item.score} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Audit Checklist Component
function AuditChecklist({ items }: { items: AuditItem[] }) {
  const getStatusBadge = (status: AuditItem['status']) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>;
      case 'non_conformity':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />NC</Badge>;
      case 'observation':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />OBS</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            ISM/ISPS Audit Checklist
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{items.filter(i => i.status === 'compliant').length} Compliant</Badge>
            <Badge variant="destructive">{items.filter(i => i.status === 'non_conformity').length} NC</Badge>
            <Badge variant="secondary">{items.filter(i => i.status === 'observation').length} OBS</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.requirement}</p>
                  <p className="text-xs text-muted-foreground">{item.category} • {item.responsibility}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.evidence.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {item.evidence.length} docs
                  </Badge>
                )}
                {getStatusBadge(item.status)}
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NCR Tracker Component
function NCRTracker({ ncrs }: { ncrs: NonConformity[] }) {
  const getTypeBadge = (type: NonConformity['type']) => {
    switch (type) {
      case 'major':
        return <Badge variant="destructive">Major NC</Badge>;
      case 'minor':
        return <Badge className="bg-warning text-warning-foreground">Minor NC</Badge>;
      default:
        return <Badge variant="secondary">Observation</Badge>;
    }
  };

  const getStatusBadge = (status: NonConformity['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'verified':
        return <Badge className="bg-success text-success-foreground">Verified</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Non-Conformities & Observations
          </CardTitle>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            New NCR
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ncrs.map(ncr => (
            <Card key={ncr.id} className={`border-l-4 ${
              ncr.status === 'closed' || ncr.status === 'verified' ? 'border-l-success' : 
              ncr.type === 'major' ? 'border-l-destructive' : 'border-l-warning'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{ncr.ncNumber}</Badge>
                    {getTypeBadge(ncr.type)}
                    <Badge variant="outline">{ncr.source}</Badge>
                  </div>
                  {getStatusBadge(ncr.status)}
                </div>

                <p className="text-sm font-medium mb-2">{ncr.description}</p>

                {ncr.rootCause && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground">Root Cause:</p>
                    <p className="text-sm">{ncr.rootCause}</p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground">Corrective Action:</p>
                  <p className="text-sm">{ncr.correctiveAction}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ncr.responsiblePerson}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {ncr.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Camera className="h-4 w-4 mr-1" />
                      Evidence
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comments
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function ISMISPSAuditCenter() {
  const [activeTab, setActiveTab] = useState("checklist");

  // Stats
  const openNCRs = fallbackNCRs.filter((n: NonConformity) => n.status !== 'closed' && n.status !== 'verified').length;
  const daysToNextAudit = 45;

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">DOC Status</p>
                <p className="text-lg font-bold text-success">Valid</p>
                <p className="text-xs text-muted-foreground">Exp: 2027-06</p>
              </div>
              <Award className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">SMC Status</p>
                <p className="text-lg font-bold text-success">Valid</p>
                <p className="text-xs text-muted-foreground">Exp: 2027-03</p>
              </div>
              <Award className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ISSC Status</p>
                <p className="text-lg font-bold text-success">Valid</p>
                <p className="text-xs text-muted-foreground">Exp: 2028-01</p>
              </div>
              <Shield className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Open NCRs</p>
                <p className="text-2xl font-bold text-warning">{openNCRs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Next Audit</p>
                <p className="text-2xl font-bold">{daysToNextAudit}d</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <div className="lg:col-span-1">
          <ComplianceScoreCard />
        </div>

        {/* Checklist & NCRs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="checklist">Audit Checklist</TabsTrigger>
              <TabsTrigger value="ncrs">NCRs & Observations</TabsTrigger>
              <TabsTrigger value="drills">Drills & Training</TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="mt-4">
              <AuditChecklist items={fallbackAuditItems} />
            </TabsContent>

            <TabsContent value="ncrs" className="mt-4">
              <NCRTracker ncrs={fallbackNCRs} />
            </TabsContent>

            <TabsContent value="drills" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Safety Drills & Training Records</p>
                  <p className="text-sm">ISM/ISPS required drills and crew training tracking</p>
                  <Button className="mt-4">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Schedule Drill
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
