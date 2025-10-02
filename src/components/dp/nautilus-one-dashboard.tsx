import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  GraduationCap,
  Database,
  BookOpen,
  Cloud,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { DPDocumentationManager } from './dp-documentation-manager';
import { DPTrainingCenter } from './dp-training-center';
import { DPKnowledgeCenter } from './dp-knowledge-center';
import { DPLogbook } from './dp-logbook';
import { OperationalWindow } from './operational-window';

export const NautilusOneDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('overview');

  const systemMetrics = {
    documentation: {
      complianceScore: 92,
      documentsProcessed: 234,
      auditsScheduled: 5,
      status: 'good'
    },
    training: {
      activeDPOs: 45,
      cpdHours: 1234,
      certifications: 89,
      expiringCerts: 3
    },
    knowledge: {
      totalEvents: 234,
      patternsDetected: 18,
      lessonsLearned: 89,
      criticalIssues: 5
    },
    logbook: {
      entriesToday: 24,
      complianceRate: 98,
      dpHours: 156,
      incidents: 2
    },
    operational: {
      operabilityIndex: 78,
      weatherAlerts: 1,
      operationsActive: 3,
      limitViolations: 0
    }
  };

  if (activeModule !== 'overview') {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setActiveModule('overview')}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        {activeModule === 'documentation' && <DPDocumentationManager />}
        {activeModule === 'training' && <DPTrainingCenter />}
        {activeModule === 'knowledge' && <DPKnowledgeCenter />}
        {activeModule === 'logbook' && <DPLogbook />}
        {activeModule === 'operational' && <OperationalWindow />}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">NAUTILUS ONE</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Advanced DP Management System - Enterprise Grade Platform
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          All Systems Operational
        </Badge>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { 
            label: 'Documentation', 
            value: `${systemMetrics.documentation.complianceScore}%`, 
            status: 'success',
            icon: FileText 
          },
          { 
            label: 'Training', 
            value: systemMetrics.training.activeDPOs.toString(), 
            status: 'success',
            icon: GraduationCap 
          },
          { 
            label: 'Knowledge', 
            value: systemMetrics.knowledge.totalEvents.toString(), 
            status: 'success',
            icon: Database 
          },
          { 
            label: 'Logbook', 
            value: `${systemMetrics.logbook.complianceRate}%`, 
            status: 'success',
            icon: BookOpen 
          },
          { 
            label: 'Operational', 
            value: `${systemMetrics.operational.operabilityIndex}%`, 
            status: 'success',
            icon: Cloud 
          }
        ].map((metric, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <metric.icon className={`h-8 w-8 ${
                  metric.status === 'success' ? 'text-green-600' : 
                  metric.status === 'warning' ? 'text-yellow-600' : 
                  'text-red-600'
                }`} />
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 3: Documentation */}
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('documentation')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle>DP Documentation</CardTitle>
                <CardDescription>Module 3</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>OCR Processing</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>IMCA Compliance</span>
                <Badge variant="default">{systemMetrics.documentation.complianceScore}%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Documents Processed</span>
                <span className="font-medium">{systemMetrics.documentation.documentsProcessed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Upcoming Audits</span>
                <Badge variant="secondary">{systemMetrics.documentation.auditsScheduled}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 4: Training Center */}
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('training')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle>DP Competence Hub</CardTitle>
                <CardDescription>Module 4</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Active DPOs</span>
                <span className="font-medium">{systemMetrics.training.activeDPOs}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>CPD Hours (YTD)</span>
                <Badge variant="default">{systemMetrics.training.cpdHours}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Certifications</span>
                <span className="font-medium">{systemMetrics.training.certifications}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Expiring Soon</span>
                {systemMetrics.training.expiringCerts > 0 ? (
                  <Badge variant="secondary">{systemMetrics.training.expiringCerts}</Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 5: Knowledge Center */}
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('knowledge')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <CardTitle>Knowledge Center</CardTitle>
                <CardDescription>Module 5</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Total Events</span>
                <span className="font-medium">{systemMetrics.knowledge.totalEvents}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Patterns Detected</span>
                <Badge variant="default">{systemMetrics.knowledge.patternsDetected}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Lessons Learned</span>
                <span className="font-medium">{systemMetrics.knowledge.lessonsLearned}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Critical Issues</span>
                {systemMetrics.knowledge.criticalIssues > 0 ? (
                  <Badge variant="destructive">{systemMetrics.knowledge.criticalIssues}</Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 6: Smart Logbook */}
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('logbook')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <CardTitle>Smart DP Logbook</CardTitle>
                <CardDescription>Module 6</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Entries Today</span>
                <span className="font-medium">{systemMetrics.logbook.entriesToday}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>M117 Compliance</span>
                <Badge variant="default">{systemMetrics.logbook.complianceRate}%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>DP Hours</span>
                <span className="font-medium">{systemMetrics.logbook.dpHours}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Incidents</span>
                <Badge variant="secondary">{systemMetrics.logbook.incidents}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 7: Operational Window */}
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('operational')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Cloud className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <CardTitle>Operational Window</CardTitle>
                <CardDescription>Module 7</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Operability Index</span>
                <Badge variant="default">{systemMetrics.operational.operabilityIndex}%</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Weather Alerts</span>
                {systemMetrics.operational.weatherAlerts > 0 ? (
                  <Badge variant="secondary">{systemMetrics.operational.weatherAlerts}</Badge>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Operations</span>
                <span className="font-medium">{systemMetrics.operational.operationsActive}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Limit Violations</span>
                {systemMetrics.operational.limitViolations === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Badge variant="destructive">{systemMetrics.operational.limitViolations}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Integration Status */}
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <CardTitle>System Integration</CardTitle>
                <CardDescription>Real-time Sync</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Data Flow</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cross-Module Sync</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>API Status</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Uptime</span>
                <Badge variant="default">99.95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Enterprise Metrics & KPIs
          </CardTitle>
          <CardDescription>
            Business impact and technical excellence targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Audit Time Reduction', value: '80%', target: '80%', status: 'success' },
              { label: 'Compliance Score', value: '92%', target: '90%', status: 'success' },
              { label: 'Training Efficiency', value: '60%', target: '60%', status: 'success' },
              { label: 'OCR Accuracy', value: '99%', target: '99%', status: 'success' },
              { label: 'Incident Prediction', value: '92%', target: '92%', status: 'success' },
              { label: 'Documentation Auto', value: '95%', target: '95%', status: 'success' },
              { label: 'System Uptime', value: '99.95%', target: '99.95%', status: 'success' },
              { label: 'Cost Reduction', value: '50%', target: '50%', status: 'success' }
            ].map((metric, idx) => (
              <div key={idx} className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-green-600">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
