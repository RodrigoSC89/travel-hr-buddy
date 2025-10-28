/**
 * PATCH 407: Sonar Data Upload Component
 * Allows upload of sonar data files or streaming data
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Activity, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataUploaded: (data: any) => void;
  onStreamData?: (data: any) => void;
  mode?: 'file' | 'stream' | 'both';
}

export const SonarDataUpload: React.FC<FileUploadProps> = ({
  onDataUploaded,
  onStreamData,
  mode = 'both'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate file reading and parsing
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // Try to parse as JSON
          let parsedData;
          try {
            parsedData = JSON.parse(content);
          } catch {
            // If not JSON, treat as CSV or raw data
            parsedData = {
              raw: content,
              format: file.name.endsWith('.csv') ? 'csv' : 'text',
              filename: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString()
            };
          }

          setUploadProgress(100);
          setUploadStatus('success');
          
          toast({
            title: "File uploaded successfully",
            description: `${file.name} has been processed`,
          });

          onDataUploaded(parsedData);
        } catch (error) {
          setUploadStatus('error');
          toast({
            title: "Error parsing file",
            description: "The file format is not supported",
            variant: "destructive"
          });
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadStatus('error');
        setUploading(false);
        toast({
          title: "Upload failed",
          description: "Failed to read the file",
          variant: "destructive"
        });
      };

      reader.readAsText(file);
    } catch (error) {
      setUploadStatus('error');
      setUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }, [onDataUploaded, toast]);

  const startMockStream = useCallback(() => {
    if (!onStreamData) return;

    let count = 0;
    const streamInterval = setInterval(() => {
      // Generate mock streaming data
      const mockData = {
        timestamp: Date.now(),
        depth: 45 + Math.random() * 10,
        angle: count,
        distance: 80 + Math.random() * 40,
        intensity: Math.random() * 100,
        frequency: 50 + Math.random() * 200
      };

      onStreamData(mockData);
      count = (count + 1) % 360;

      if (count === 0) {
        clearInterval(streamInterval);
        toast({
          title: "Stream completed",
          description: "360° scan completed successfully"
        });
      }
    }, 50); // 50ms per ping = ~18 seconds for 360 pings

    toast({
      title: "Stream started",
      description: "Receiving live sonar data..."
    });
  }, [onStreamData, toast]);

  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          Data Input
        </CardTitle>
        <CardDescription>
          Upload sonar data file or start live streaming
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        {(mode === 'file' || mode === 'both') && (
          <div className="space-y-2">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 border-zinc-600 hover:bg-zinc-900 hover:border-cyan-500 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadStatus === 'idle' && (
                  <>
                    <FileText className="w-10 h-10 mb-2 text-zinc-400" />
                    <p className="mb-2 text-sm text-zinc-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">JSON, CSV or TXT files</p>
                  </>
                )}
                {uploadStatus === 'uploading' && (
                  <>
                    <Activity className="w-10 h-10 mb-2 text-cyan-400 animate-spin" />
                    <p className="text-sm text-cyan-400">Uploading...</p>
                  </>
                )}
                {uploadStatus === 'success' && (
                  <>
                    <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
                    <p className="text-sm text-green-400">Upload successful!</p>
                  </>
                )}
                {uploadStatus === 'error' && (
                  <>
                    <XCircle className="w-10 h-10 mb-2 text-red-400" />
                    <p className="text-sm text-red-400">Upload failed</p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".json,.csv,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            {uploading && (
              <Progress value={uploadProgress} className="w-full" />
            )}
          </div>
        )}

        {/* Stream Option */}
        {(mode === 'stream' || mode === 'both') && onStreamData && (
          <div className="space-y-2">
            {mode === 'both' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-800 px-2 text-zinc-500">Or</span>
                </div>
              </div>
            )}
            
            <Button
              onClick={startMockStream}
              disabled={uploading}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              Start Live Stream (Mock)
            </Button>
            <p className="text-xs text-center text-zinc-500">
              Simulates real-time sonar data streaming
            </p>
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30 text-xs text-blue-300">
          <p className="font-semibold mb-1">Supported Formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>JSON: Structured sonar ping data</li>
            <li>CSV: Comma-separated ping records</li>
            <li>TXT: Raw sonar output logs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
