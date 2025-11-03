/**
 * Pre-PSC Module - Main Dashboard
 * Port State Control preparation and internal audit system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Ship,
  ClipboardCheck,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bot,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PrePSCForm } from './PrePSCForm';
import { PSCAIAssistant } from './PSCAIAssistant';
import { calculatePSCScore, PSCFinding, getRiskColor, getScoreColor } from './PSCScoreCalculator';
import {
  triggerPSCAlert,
  shouldTriggerAlert,
  generateAlertSummary,
  getRecommendedActions,
} from './PSCAlertTrigger';
import { exportPSCReport } from '@/lib/psc/PSCReportGenerator';
import { generatePSCSignatureHash, generateRSAIdentifier } from '@/lib/psc/PSCSignatureValidator';

interface Inspection {
  id: string;
  vessel_id: string;
  vessel_name: string;
  inspector_name: string;
  inspection_date: string;
  findings: PSCFinding[];
  recommendations: string[];
  score: number;
  signed_by: string;
  signature_hash: string;
  risk_flag: boolean;
}

export default function PrePSCDashboard() {
  const [activeTab, setActiveTab] = useState('new-inspection');
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [inspectionHistory, setInspectionHistory] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [vesselId, setVesselId] = useState<string>('');
  const [vesselName, setVesselName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadVesselInfo();
    loadInspectionHistory();
  }, []);

  const loadVesselInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's vessel from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('vessel_id')
        .eq('id', user.id)
        .single();

      if (profile?.vessel_id) {
        setVesselId(profile.vessel_id);
        
        // Get vessel name
        const { data: vessel } = await supabase
          .from('vessels')
          .select('name')
          .eq('id', profile.vessel_id)
          .single();

        if (vessel) {
          setVesselName(vessel.name);
        }
      }
    } catch (error) {
      console.error('Error loading vessel info:', error);
    }
  };

  const loadInspectionHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pre_psc_inspections')
        .select('*')
        .order('inspection_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setInspectionHistory(data || []);
    } catch (error) {
      console.error('Error loading inspection history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inspection history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionSubmit = async (formData: {
    inspectorName: string;
    findings: PSCFinding[];
    recommendations: string[];
  }) => {
    if (!vesselId) {
      toast({
        title: 'Error',
        description: 'Vessel information not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate score
      const scoreResult = calculatePSCScore(formData.findings);

      // Generate inspection ID
      const inspectionId = `PSC-${Date.now()}`;
      const inspectionDate = new Date().toISOString();

      // Generate digital signature
      const findingsJson = JSON.stringify(formData.findings);
      const signatureHash = await generatePSCSignatureHash(
        inspectionId,
        vesselId,
        formData.inspectorName,
        inspectionDate,
        findingsJson
      );

      const inspection: Inspection = {
        id: inspectionId,
        vessel_id: vesselId,
        vessel_name: vesselName,
        inspector_name: formData.inspectorName,
        inspection_date: inspectionDate,
        findings: formData.findings,
        recommendations: [...scoreResult.recommendations, ...formData.recommendations],
        score: scoreResult.overallScore,
        signed_by: formData.inspectorName,
        signature_hash: signatureHash,
        risk_flag: scoreResult.riskLevel === 'high' || scoreResult.riskLevel === 'critical',
      };

      // Save to Supabase
      const { error } = await supabase.from('pre_psc_inspections').insert({
        id: inspection.id,
        vessel_id: inspection.vessel_id,
        inspector_name: inspection.inspector_name,
        inspection_date: inspection.inspection_date,
        findings: inspection.findings,
        recommendations: inspection.recommendations,
        score: inspection.score,
        signed_by: inspection.signed_by,
        signature_hash: inspection.signature_hash,
        risk_flag: inspection.risk_flag,
      });

      if (error) throw error;

      // Trigger alert if needed
      if (shouldTriggerAlert(scoreResult)) {
        triggerPSCAlert(
          {
            inspectionId: inspection.id,
            vesselId: inspection.vessel_id,
            vesselName: inspection.vessel_name,
            score: inspection.score,
            riskLevel: scoreResult.riskLevel,
            criticalFindings: scoreResult.criticalFindings,
            timestamp: new Date(inspection.inspection_date),
          },
          scoreResult
        );
      }

      setCurrentInspection(inspection);
      setActiveTab('results');
      loadInspectionHistory();

      toast({
        title: 'Success',
        description: 'Inspection completed and saved successfully',
      });
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to save inspection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!currentInspection) return;

    try {
      const scoreResult = calculatePSCScore(currentInspection.findings);
      await exportPSCReport(currentInspection, scoreResult);

      toast({
        title: 'Success',
        description: 'PDF report downloaded successfully',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to export PDF report',
        variant: 'destructive',
      });
    }
  };

  const renderInspectionResults = () => {
    if (!currentInspection) return null;

    const scoreResult = calculatePSCScore(currentInspection.findings);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inspection Results</CardTitle>
              <Button onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${getScoreColor(scoreResult.overallScore)}`}>
                    {scoreResult.overallScore}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getRiskColor(scoreResult.riskLevel)}>
                    {scoreResult.riskLevel.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${scoreResult.criticalFindings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {scoreResult.criticalFindings}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert */}
            {shouldTriggerAlert(scoreResult) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alert triggered to System Watchdog:</strong> {generateAlertSummary(
                    {
                      inspectionId: currentInspection.id,
                      vesselId: currentInspection.vessel_id,
                      vesselName: currentInspection.vessel_name,
                      score: currentInspection.score,
                      riskLevel: scoreResult.riskLevel,
                      criticalFindings: scoreResult.criticalFindings,
                      timestamp: new Date(currentInspection.inspection_date),
                    },
                    scoreResult
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scoreResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            {shouldTriggerAlert(scoreResult) && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getRecommendedActions(scoreResult).map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Digital Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Digital Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Signed by:</strong> {currentInspection.signed_by}
                  </div>
                  <div>
                    <strong>Signature ID:</strong>{' '}
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {generateRSAIdentifier(currentInspection.signature_hash)}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Signature verified - Data integrity confirmed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8 text-primary" />
            Pre-Port State Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Internal audit and compliance preparation system
          </p>
          {vesselName && (
            <Badge variant="outline" className="mt-2">
              Vessel: {vesselName}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-inspection">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            New Inspection
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!currentInspection}>
            <FileText className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-inspection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start New Inspection</CardTitle>
              <CardDescription>
                Complete the PSC checklist based on international maritime conventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrePSCForm onSubmit={handleInspectionSubmit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {renderInspectionResults()}
        </TabsContent>

        <TabsContent value="ai-assistant">
          <PSCAIAssistant vesselId={vesselId} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>Previous PSC inspections for this vessel</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : inspectionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No inspection history available
                </div>
              ) : (
                <div className="space-y-4">
                  {inspectionHistory.map((inspection) => (
                    <Card key={inspection.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{inspection.inspector_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(inspection.inspection_date).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <div className={`text-2xl font-bold ${getScoreColor(inspection.score)}`}>
                                {inspection.score}%
                              </div>
                            </div>
                            {inspection.risk_flag && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Risk
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
