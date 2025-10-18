import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileText, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import {
  AuditType,
  AuditSimulation,
  AUDIT_TYPE_NAMES,
  SEVERITY_COLORS,
  NonConformitySeverity
} from '@/types/external-audit';

export const AuditSimulator: React.FC = () => {
  const [vesselId, setVesselId] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [auditType, setAuditType] = useState<AuditType>('ISO_9001');
  const [auditObjective, setAuditObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditSimulation | null>(null);

  const handleSimulate = async () => {
    if (!vesselId || !vesselName || !auditType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-simulate', {
        body: {
          vesselId,
          vesselName,
          auditType,
          auditObjective: auditObjective || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data.simulation);
        toast.success('Audit simulation completed successfully!');
      } else {
        throw new Error(data.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Audit simulation error:', error);
      toast.error(`Failed to simulate audit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;

    const element = document.getElementById('audit-report');
    const opt = {
      margin: 10,
      filename: `audit-report-${result.vessel_name}-${result.audit_type}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    toast.success('PDF export started');
  };

  const getSeverityColor = (severity: NonConformitySeverity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      major: 'bg-orange-100 text-orange-800 border-orange-300',
      minor: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[severity];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Powered Audit Simulator
          </CardTitle>
          <CardDescription>
            Simulate technical audits using AI to generate comprehensive compliance reports in 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselId">Vessel ID *</Label>
              <Input
                id="vesselId"
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                placeholder="Enter vessel ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name *</Label>
              <Input
                id="vesselName"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Enter vessel name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditType">Audit Type *</Label>
            <Select value={auditType} onValueChange={(value) => setAuditType(value as AuditType)}>
              <SelectTrigger id="auditType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AUDIT_TYPE_NAMES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditObjective">Audit Objective (Optional)</Label>
            <Textarea
              id="auditObjective"
              value={auditObjective}
              onChange={(e) => setAuditObjective(e.target.value)}
              placeholder="Describe specific objectives for this audit..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSimulate} 
            disabled={loading} 
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating Audit...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Simulate Audit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card id="audit-report">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Report: {result.vessel_name}</CardTitle>
                <CardDescription>
                  {AUDIT_TYPE_NAMES[result.audit_type]} • {new Date(result.audit_date).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {result.overall_score}%
              </div>
              <div className="text-sm text-gray-600">Overall Compliance Score</div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {(result.processing_time_ms / 1000).toFixed(1)}s
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {result.incidents_analyzed} incidents analyzed
                </div>
              </div>
            </div>

            {/* Scores by Norm */}
            {Object.keys(result.scores_by_norm).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Scores by Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(result.scores_by_norm).map(([norm, score]) => (
                    <div key={norm} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{norm}</span>
                      <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                        {score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Conformities */}
            {result.conformities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Conformities ({result.conformities.length})
                </h3>
                <div className="space-y-2">
                  {result.conformities.map((conf, idx) => (
                    <Alert key={idx} className="border-green-200 bg-green-50">
                      <AlertDescription>
                        <div className="font-medium text-green-900">{conf.clause}</div>
                        <div className="text-sm text-green-700 mt-1">{conf.description}</div>
                        {conf.evidence && (
                          <div className="text-xs text-green-600 mt-1 italic">
                            Evidence: {conf.evidence}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Conformities */}
            {result.non_conformities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Non-Conformities ({result.non_conformities.length})
                </h3>
                <div className="space-y-3">
                  {result.non_conformities.map((nc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${getSeverityColor(nc.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium">{nc.clause}</div>
                        <Badge variant="outline" className="capitalize">
                          {nc.severity}
                        </Badge>
                      </div>
                      <div className="text-sm mb-2">{nc.description}</div>
                      <div className="text-sm font-medium mt-2">Recommendation:</div>
                      <div className="text-sm italic">{nc.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Technical Report */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Technical Report</h3>
              <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                {result.technical_report}
              </div>
            </div>

            {/* Action Plan */}
            {result.action_plan.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Prioritized Action Plan</h3>
                <div className="space-y-2">
                  {result.action_plan
                    .sort((a, b) => a.priority - b.priority)
                    .map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {action.priority}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{action.action}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Responsible: {action.responsible} • Deadline: {action.deadline}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
