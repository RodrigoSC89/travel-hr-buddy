/**
import { useCallback, useState } from "react";;
 * PATCH 407: Sonar Data Upload Component
 * Upload files (JSON/CSV/TXT) with mock streaming visualization
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileJson, FileText, Table, Loader2 } from "lucide-react";
import { SonarAIService } from "../sonar-service";
import { cn } from "@/lib/utils";

export function SonarDataUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toUpperCase();
    if (!["JSON", "CSV", "TXT"].includes(fileType || "")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON, CSV, or TXT file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Read file content
      const content = await file.text();
      
      // Simulate streaming with progress
      const intervals = 20;
      for (let i = 0; i <= intervals; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress((i / intervals) * 100);
      }

      // Parse data based on type
      let parsedData;
      if (fileType === "JSON") {
        parsedData = JSON.parse(content);
      } else if (fileType === "CSV") {
        // Simple CSV parsing
        const lines = content.split("\n");
        const headers = lines[0].split(",");
        parsedData = lines.slice(1).map(line => {
          const values = line.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
          }, {} as Record<string, string>);
        });
      } else {
        parsedData = { raw: content };
      }

      // Mock AI analysis
      const mockAnalysis = {
        input_id: "", // Will be set by service
        analysis_type: "frequency_analysis",
        ai_model: "sonar-detect-v1",
        confidence_score: 85 + Math.random() * 15,
        patterns_detected: {
          count: Math.floor(Math.random() * 10),
          types: ["echo", "noise", "object"],
        },
        frequency_data: {
          range: "20-200 kHz",
          peak: Math.floor(50 + Math.random() * 100),
        },
        anomalies: Math.random() > 0.7 ? { detected: true, count: Math.floor(Math.random() * 5) } : null,
        recommendations: "Continue monitoring frequency patterns",
      };

      // Mock alerts
      const mockAlerts = [];
      if (mockAnalysis.anomalies) {
        mockAlerts.push({
          analysis_id: "", // Will be set by service
          alert_type: "anomaly_detected",
          severity: "medium" as const,
          title: "Frequency Anomaly Detected",
          description: `Detected ${mockAnalysis.anomalies.count} unusual patterns in sonar data`,
          frequency_range: mockAnalysis.frequency_data.range,
        });
      }

      // Save to database
      const result = await SonarAIService.saveScanComplete(
        {
          file_name: file.name,
          file_type: fileType as "JSON" | "CSV" | "TXT",
          file_size: file.size,
          status: "completed",
          raw_data: parsedData,
          metadata: {
            uploadedAt: new Date().toISOString(),
            fileHash: btoa(file.name + file.size),
          },
        },
        mockAnalysis,
        mockAlerts
      );

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Upload successful",
        description: `File ${file.name} analyzed successfully. ${mockAlerts.length} alerts generated.`,
      });

      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
      setIsUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const getFileIcon = (type: string) => {
    switch (type) {
    case "JSON":
      return <FileJson className="h-6 w-6" />;
    case "CSV":
      return <Table className="h-6 w-6" />;
    case "TXT":
      return <FileText className="h-6 w-6" />;
    default:
      return <Upload className="h-6 w-6" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Sonar Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className={cn(
                "cursor-pointer flex flex-col items-center space-y-4",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <p className="text-lg font-medium">
                  {isUploading ? "Processing..." : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  JSON, CSV, or TXT files (max 10MB)
                </p>
              </div>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing sonar data...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <FileJson className="h-5 w-5 text-blue-600" />
              <span>JSON</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Table className="h-5 w-5 text-green-600" />
              <span>CSV</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-5 w-5 text-orange-600" />
              <span>TXT</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
