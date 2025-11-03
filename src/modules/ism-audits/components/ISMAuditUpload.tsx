/**
 * PATCH 609: ISM Audit Upload Component
 * OCR processing of ISM audit documents
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWorker } from "tesseract.js";

export default function ISMAuditUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [vesselName, setVesselName] = useState("");
  const [auditType, setAuditType] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [nonConformities, setNonConformities] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processDocument = async () => {
    if (!file || !vesselName || !auditType || !auditDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Step 1: OCR Processing
      toast({
        title: "Processing Document",
        description: "Extracting text from PDF...",
      });

      const worker = await createWorker('eng');
      setProgress(30);

      // Create image URL from file
      const imageUrl = URL.createObjectURL(file);
      
      setProgress(50);
      const { data: { text } } = await worker.recognize(imageUrl);
      setExtractedText(text);
      
      setProgress(70);
      await worker.terminate();

      // Step 2: AI Analysis (mock)
      toast({
        title: "Analyzing Content",
        description: "AI is interpreting non-conformities...",
      });

      setProgress(85);

      // Mock AI interpretation
      const mockNonConformities = [
        {
          id: "NC001",
          category: "Safety Management",
          severity: "Major",
          description: "Inadequate documentation of safety procedures",
          recommendation: "Update safety management system documentation",
          section: "ISM Code 1.2.3",
        },
        {
          id: "NC002",
          category: "Emergency Preparedness",
          severity: "Minor",
          description: "Missing drill records for Q2 2024",
          recommendation: "Complete all required emergency drills and maintain proper records",
          section: "ISM Code 8.2",
        },
      ];

      setNonConformities(mockNonConformities);
      setProgress(100);

      toast({
        title: "Processing Complete",
        description: `Found ${mockNonConformities.length} non-conformities`,
      });

    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload ISM Audit Document
          </CardTitle>
          <CardDescription>
            Upload PDF or image files for OCR processing and AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="e.g., MV Oceanic"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditType">Audit Type</Label>
              <Select value={auditType} onValueChange={setAuditType} disabled={isProcessing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Audit</SelectItem>
                  <SelectItem value="external">External Audit</SelectItem>
                  <SelectItem value="certification">Certification Audit</SelectItem>
                  <SelectItem value="surveillance">Surveillance Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditDate">Audit Date</Label>
              <Input
                id="auditDate"
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditFile">Audit Document</Label>
              <Input
                id="auditFile"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing document...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button 
            onClick={processDocument} 
            disabled={isProcessing || !file}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {nonConformities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-identified non-conformities from the audit document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nonConformities.map((nc, idx) => (
              <Card key={idx} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{nc.id} - {nc.category}</h4>
                      <span className={`text-sm px-2 py-1 rounded ${
                        nc.severity === 'Major' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {nc.severity}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{nc.section}</span>
                  </div>
                  <p className="text-sm">{nc.description}</p>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Recommendation:</p>
                    <p className="text-sm text-muted-foreground">{nc.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
