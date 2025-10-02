import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Brain,
  Scan,
  FileCheck,
  Calendar,
  Shield,
  Download,
  Eye,
  RefreshCw,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import type {
  DocumentType,
  ChecklistVersion,
  AuditSchedule,
  ValidationResult,
  OCREngine
} from '@/types/dp-modules';

export const DPDocumentationManager: React.FC = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('ASOG');
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [checklistVersions] = useState<ChecklistVersion[]>([
    {
      id: '1',
      year: 2024,
      version: 'v2.0',
      imcaStandard: {
        code: 'M190',
        version: '2.0',
        effectiveDate: new Date('2024-01-01'),
        requirements: ['DP Annual Trial procedures', 'Failure mode testing', 'FMEA documentation']
      },
      petrobrasRequirements: {
        standard: 'PEOTRAM',
        year: 2024,
        version: '3.1',
        requirements: ['Brazilian regulatory compliance', 'Local certification', 'Emergency procedures']
      },
      changes: [
        {
          id: 'c1',
          date: new Date('2024-01-15'),
          author: 'João Silva',
          description: 'Updated ASAOG limits for heavy weather operations',
          affectedSections: ['Section 4.2', 'Appendix B'],
          impactLevel: 'major'
        }
      ],
      approvalStatus: {
        status: 'approved',
        approvedBy: 'Chief Engineer',
        approvedAt: new Date('2024-01-20'),
        comments: 'Approved for implementation'
      }
    }
  ]);

  const [upcomingAudits] = useState<AuditSchedule[]>([
    {
      id: 'audit1',
      type: 'external',
      scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      auditors: ['IMCA Inspector', 'Class Surveyor'],
      scope: ['DP System', 'Documentation', 'Crew Competency'],
      status: 'scheduled'
    }
  ]);

  const documentTypes: DocumentType[] = [
    'ASOG', 'BIAS', 'FMEA', 'DP_ANNUAL_TRIAL',
    'CAPABILITY_PLOT', 'CAMO', 'TAM', 'DPOM',
    'WCPS', 'OPERATIONS_MANUAL'
  ];

  const ocrEngines: OCREngine = {
    tesseract: true,
    awsTextract: false,
    googleVision: false,
    customML: true
  };

  const handleDocumentUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const steps = [
        { progress: 20, message: 'Scanning document...' },
        { progress: 40, message: 'Applying OCR engines...' },
        { progress: 60, message: 'Extracting structured data...' },
        { progress: 80, message: 'Validating against IMCA standards...' },
        { progress: 100, message: 'Complete!' }
      ];

      for (const step of steps) {
        setUploadProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Consider updating section 3.2 with latest IMCA M190 guidelines'],
        score: 92
      };

      setValidationResults(mockValidation);

      toast({
        title: 'Document Processed',
        description: `${file.name} processed with ${mockValidation.score}% compliance`,
      });
    } catch (error) {
      toast({
        title: 'Processing Error',
        description: 'Failed to process document',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const runIMCAValidation = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [
          'FMEA analysis requires update for new thruster model',
          'Annual trial due in 45 days'
        ],
        score: 88
      };

      setValidationResults(validation);

      toast({
        title: 'IMCA Validation Complete',
        description: `Compliance Score: ${validation.score}%`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DP Documentation Management</h1>
          <p className="text-muted-foreground">
            Smart document processing with OCR, versioning, and IMCA compliance validation
          </p>
        </div>
        <Button onClick={runIMCAValidation} disabled={isProcessing}>
          <Shield className="mr-2 h-4 w-4" />
          Run IMCA Validation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-blue-600" />
            OCR Multi-Engine Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(ocrEngines).map(([engine, enabled]) => (
              <div key={engine} className="flex items-center gap-2">
                {enabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircleIcon className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm capitalize">{engine.replace(/([A-Z])/g, ' $1')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload & OCR
          </TabsTrigger>
          <TabsTrigger value="versions">
            <Calendar className="h-4 w-4 mr-2" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="validation">
            <FileCheck className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="audits">
            <Shield className="h-4 w-4 mr-2" />
            Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Document Upload & OCR</CardTitle>
              <CardDescription>
                Upload DP documents for automatic recognition, data extraction, and validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select value={selectedDocType} onValueChange={(val) => setSelectedDocType(val as DocumentType)}>
                    <SelectTrigger id="doc-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file);
                    }}
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, PNG (max 50MB)
                  </p>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing with AI & OCR...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {validationResults && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${validationResults.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                          {validationResults.isValid ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Validation Result</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Compliance Score:</span>
                              <Badge variant={validationResults.score >= 90 ? 'default' : 'secondary'}>
                                {validationResults.score}%
                              </Badge>
                            </div>
                            {validationResults.warnings.length > 0 && (
                              <div className="text-sm">
                                <p className="font-medium mb-1">Warnings:</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                  {validationResults.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist Version Control</CardTitle>
              <CardDescription>
                Annual models with IMCA and Petrobras requirements tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklistVersions.map(version => (
                  <Card key={version.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Year {version.year} - {version.version}</h4>
                            <Badge variant={
                              version.approvalStatus.status === 'approved' ? 'default' :
                              version.approvalStatus.status === 'pending_review' ? 'secondary' :
                              'outline'
                            }>
                              {version.approvalStatus.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">IMCA Standard:</p>
                              <p className="font-medium">{version.imcaStandard.code} v{version.imcaStandard.version}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Petrobras:</p>
                              <p className="font-medium">{version.petrobrasRequirements.standard} {version.petrobrasRequirements.year}</p>
                            </div>
                          </div>
                          {version.changes.length > 0 && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Recent Changes:</p>
                              <ul className="space-y-1">
                                {version.changes.map(change => (
                                  <li key={change.id} className="flex items-start gap-2">
                                    <Badge variant="outline" className="mt-0.5">
                                      {change.impactLevel}
                                    </Badge>
                                    <span>{change.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IMCA Compliance Validation</CardTitle>
              <CardDescription>
                Automated validation against IMCA M190, M109, M182, and M117 standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['M190', 'M109', 'M182', 'M117'].map(standard => (
                    <Card key={standard}>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-sm font-medium">{standard}</p>
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-2xl font-bold">95%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Compliant</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full" onClick={runIMCAValidation} disabled={isProcessing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  Run Full Validation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DP Audit Management</CardTitle>
              <CardDescription>
                Schedule and manage internal and external DP audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAudits.map(audit => (
                  <Card key={audit.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={audit.type === 'external' ? 'default' : 'secondary'}>
                              {audit.type}
                            </Badge>
                            <span className="font-semibold">
                              {audit.scheduledDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Auditors:</p>
                            <p>{audit.auditors.join(', ')}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Scope:</p>
                            <p>{audit.scope.join(', ')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
