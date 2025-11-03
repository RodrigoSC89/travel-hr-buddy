/**
 * LSA & FFA Inspections Module - Main Dashboard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  LifeBuoy,
  Flame,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLsaFfa } from './useLsaFfa';
import { LSAFFAForm } from './LSAFFAForm';
import type { LSAFFAInspection } from '@/types/lsa-ffa';
import { getComplianceColor } from '@/lib/scoreCalculator';
import { downloadInspectionReport } from './ReportGenerator';

interface LSAFFAInspectionsDashboardProps {
  vesselId?: string;
  vesselName?: string;
}

export default function LSAFFAInspectionsDashboard({
  vesselId,
  vesselName = 'Unknown Vessel',
}: LSAFFAInspectionsDashboardProps) {
  const {
    inspections,
    stats,
    loading,
    createInspection,
    updateInspection,
    deleteInspection,
    getInspectionsByType,
    getCriticalInspections,
  } = useLsaFfa({ vesselId });

  const [showForm, setShowForm] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<LSAFFAInspection | undefined>();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleCreateNew = (type: 'LSA' | 'FFA') => {
    setSelectedInspection(undefined);
    setShowForm(true);
    setActiveTab('form');
  };

  const handleEdit = (inspection: LSAFFAInspection) => {
    setSelectedInspection(inspection);
    setShowForm(true);
    setActiveTab('form');
  };

  const handleSave = async (inspectionData: Partial<LSAFFAInspection>) => {
    try {
      if (selectedInspection) {
        await updateInspection(selectedInspection.id, inspectionData);
        toast({
          title: 'Success',
          description: 'Inspection updated successfully',
        });
      } else {
        await createInspection(inspectionData as Omit<LSAFFAInspection, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: 'Success',
          description: 'Inspection created successfully',
        });
      }
      setShowForm(false);
      setActiveTab('overview');
    } catch (error) {
      console.error('Failed to save inspection:', error);
    }
  };

  const handleExport = async (inspection: LSAFFAInspection) => {
    try {
      await downloadInspectionReport(inspection, vesselName);
      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const lsaInspections = getInspectionsByType('LSA');
  const ffaInspections = getInspectionsByType('FFA');
  const criticalInspections = getCriticalInspections();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LSA & FFA Inspections</h1>
          <p className="text-muted-foreground">
            Life-Saving & Fire-Fighting Appliances - SOLAS Compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCreateNew('LSA')}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            New LSA Inspection
          </Button>
          <Button onClick={() => handleCreateNew('FFA')} variant="secondary">
            <Flame className="mr-2 h-4 w-4" />
            New FFA Inspection
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lsa">LSA ({lsaInspections.length})</TabsTrigger>
          <TabsTrigger value="ffa">FFA ({ffaInspections.length})</TabsTrigger>
          <TabsTrigger value="form">
            {showForm ? (selectedInspection ? 'Edit' : 'New') : 'Inspection Form'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalInspections || 0}</div>
                <p className="text-xs text-muted-foreground">
                  LSA: {stats?.lsaInspections || 0} | FFA: {stats?.ffaInspections || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getComplianceColor(stats?.averageScore || 0)}`}>
                  {stats?.averageScore || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Compliance rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.criticalIssues || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats?.averageScore || 0) >= 75 ? (
                    <Badge variant="default" className="text-lg">Compliant</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-lg">At Risk</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Overall status</p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Inspections Alert */}
          {criticalInspections.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {criticalInspections.length} inspection(s) require immediate attention due to
                low scores or critical issues.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Inspections */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Inspections</CardTitle>
              <CardDescription>Latest inspection activities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : inspections.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No inspections found. Create your first inspection above.
                </p>
              ) : (
                <div className="space-y-3">
                  {inspections.slice(0, 5).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleEdit(inspection)}
                    >
                      <div className="flex items-center gap-4">
                        {inspection.type === 'LSA' ? (
                          <LifeBuoy className="h-8 w-8 text-blue-600" />
                        ) : (
                          <Flame className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-semibold">
                            {inspection.type} Inspection
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {inspection.inspector} • {new Date(inspection.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getComplianceColor(inspection.score)}`}>
                            {inspection.score}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {inspection.issues_found.length} issue(s)
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(inspection);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LSA Inspections Tab */}
        <TabsContent value="lsa">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>LSA Inspections</CardTitle>
                  <CardDescription>Life-Saving Appliances</CardDescription>
                </div>
                <Button onClick={() => handleCreateNew('LSA')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New LSA Inspection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lsaInspections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No LSA inspections found
                </p>
              ) : (
                <div className="space-y-3">
                  {lsaInspections.map((inspection) => (
                    <InspectionCard
                      key={inspection.id}
                      inspection={inspection}
                      onEdit={handleEdit}
                      onExport={handleExport}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FFA Inspections Tab */}
        <TabsContent value="ffa">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FFA Inspections</CardTitle>
                  <CardDescription>Fire-Fighting Appliances</CardDescription>
                </div>
                <Button onClick={() => handleCreateNew('FFA')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New FFA Inspection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ffaInspections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No FFA inspections found
                </p>
              ) : (
                <div className="space-y-3">
                  {ffaInspections.map((inspection) => (
                    <InspectionCard
                      key={inspection.id}
                      inspection={inspection}
                      onEdit={handleEdit}
                      onExport={handleExport}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Tab */}
        <TabsContent value="form">
          {showForm || selectedInspection ? (
            <LSAFFAForm
              inspection={selectedInspection}
              vesselId={vesselId || ''}
              vesselName={vesselName}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setSelectedInspection(undefined);
                setActiveTab('overview');
              }}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Form Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create a new inspection or edit an existing one to view the form
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => handleCreateNew('LSA')}>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    New LSA Inspection
                  </Button>
                  <Button onClick={() => handleCreateNew('FFA')} variant="secondary">
                    <Flame className="mr-2 h-4 w-4" />
                    New FFA Inspection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for inspection cards
function InspectionCard({
  inspection,
  onEdit,
  onExport,
}: {
  inspection: LSAFFAInspection;
  onEdit: (inspection: LSAFFAInspection) => void;
  onExport: (inspection: LSAFFAInspection) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
      onClick={() => onEdit(inspection)}
    >
      <div className="flex items-center gap-4">
        {inspection.type === 'LSA' ? (
          <LifeBuoy className="h-8 w-8 text-blue-600" />
        ) : (
          <Flame className="h-8 w-8 text-red-600" />
        )}
        <div>
          <h4 className="font-semibold">{inspection.type} Inspection</h4>
          <p className="text-sm text-muted-foreground">
            {inspection.inspector} • {new Date(inspection.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`text-lg font-bold ${getComplianceColor(inspection.score)}`}>
            {inspection.score}%
          </div>
          <p className="text-xs text-muted-foreground">
            {inspection.issues_found.filter((i) => !i.resolved).length} open issue(s)
          </p>
        </div>
        <div className="flex gap-1">
          {inspection.signature_validated && (
            <Badge variant="outline" className="text-xs">
              Signed
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onExport(inspection);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
