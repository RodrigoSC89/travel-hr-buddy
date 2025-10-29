/**
 * PATCH 525: AI Visual Recognition Core
 * Main component for AI-powered visual recognition and object detection
 * 
 * Features:
 * - ONNX-based object detection with YOLO
 * - Image upload and real-time analysis
 * - Confidence scoring and bounding boxes
 * - Scene classification
 * - Database logging of results
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Upload,
  Brain,
  Target,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { onnxVisionService, type DetectedObject } from "./services/onnxVisionService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AIVisionCore: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Auto-process
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Run ONNX object detection
      const result = await onnxVisionService.detectObjects(file);
      setDetectionResult(result);
      
      // Save to database
      const { data: userData } = await supabase.auth.getUser();
      const sessionId = crypto.randomUUID();
      
      const { error } = await supabase.from('vision_events').insert({
        user_id: userData?.user?.id,
        session_id: sessionId,
        image_name: file.name,
        image_size: file.size,
        image_width: result.imageWidth,
        image_height: result.imageHeight,
        image_format: file.type,
        processing_time_ms: result.processingTimeMs,
        ai_model: 'yolo-v5-onnx',
        objects_detected: result.objects,
        total_objects: result.totalObjects,
        high_confidence_objects: result.highConfidenceObjects,
        scene_classification: result.sceneClassification,
        image_quality_score: result.qualityScore,
      });
      
      if (error) throw error;
      
      toast.success(`Detected ${result.totalObjects} objects!`);
      
      // Add to history
      setProcessingHistory(prev => [{
        id: sessionId,
        fileName: file.name,
        timestamp: new Date().toISOString(),
        objectsCount: result.totalObjects,
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      console.error('Image processing failed:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Eye className="w-8 h-8 text-purple-400 animate-pulse" />
            AI Visual Recognition Core
          </h1>
          <p className="text-zinc-400 mt-1">
            ONNX-powered object detection with YOLO - PATCH 525
          </p>
        </div>

        {/* Quick Stats */}
        {detectionResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-zinc-400">Objects</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {detectionResult.totalObjects}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-400">High Confidence</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {detectionResult.highConfidenceObjects}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-zinc-400">Quality</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {detectionResult.qualityScore}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Scene</span>
                </div>
                <div className="text-sm font-bold text-blue-400">
                  {detectionResult.sceneClassification.scene}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload and Preview */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                  {isProcessing ? (
                    <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-zinc-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium">
                      {isProcessing ? 'Processing...' : 'Click to upload image'}
                    </p>
                    <p className="text-sm text-zinc-400">
                      JPG, PNG, or WebP (max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg border border-zinc-700"
                  />
                  {detectionResult && detectionResult.objects.length > 0 && (
                    <div className="absolute inset-0">
                      <svg className="w-full h-full">
                        {detectionResult.objects.map((obj: DetectedObject, idx: number) => (
                          <g key={idx}>
                            <rect
                              x={obj.bbox.x}
                              y={obj.bbox.y}
                              width={obj.bbox.width}
                              height={obj.bbox.height}
                              fill="none"
                              stroke={obj.confidence > 0.7 ? '#22c55e' : '#eab308'}
                              strokeWidth="2"
                            />
                            <text
                              x={obj.bbox.x}
                              y={obj.bbox.y - 5}
                              fill="white"
                              fontSize="12"
                              fontWeight="bold"
                              style={{ textShadow: '1px 1px 2px black' }}
                            >
                              {obj.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detection Results */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Detection Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!detectionResult ? (
                <div className="text-center py-8 text-zinc-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Upload an image to start detection</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {detectionResult.objects.map((obj: DetectedObject, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-zinc-800/50 rounded border border-zinc-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold capitalize">{obj.class}</span>
                          <Badge className={getConfidenceColor(obj.confidence)}>
                            {(obj.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-zinc-400 space-y-1">
                          <div>Position: ({obj.bbox.x}, {obj.bbox.y})</div>
                          <div>Size: {obj.bbox.width} x {obj.bbox.height}px</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processing History */}
        {processingHistory.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Processing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {processingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-zinc-700 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{item.fileName}</div>
                      <div className="text-xs text-zinc-400">
                        {new Date(item.timestamp).toLocaleString()} • {item.objectsCount} objects
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIVisionCore;
