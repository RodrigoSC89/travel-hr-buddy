/**
 * PATCH 525 - AI Visual Recognition Core
 * TensorFlow.js COCO-SSD object detection with real-time analysis
 * 
 * Features:
 * - 80+ object classes with confidence scoring
 * - Real-time bounding box rendering on canvas
 * - Processing time metrics and detection history
 * - Mock persistence pattern for vision_events table
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Upload,
  Camera,
  Brain,
  Target,
  Activity,
  Clock,
  TrendingUp,
  Database,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { aiVisionService } from "./services/aiVisionService";
import { DetectedObject, VisionEvent, DetectionStats } from "./types";
import { toast } from "sonner";

const AIVisionCore: React.FC = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [detectionHistory, setDetectionHistory] = useState<VisionEvent[]>([]);
  const [stats, setStats] = useState<DetectionStats>({
    totalDetections: 0,
    averageConfidence: 0,
    mostCommonClass: "N/A",
    processingTimeAvg: 0,
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load model on mount
  useEffect(() => {
    loadModel();
    loadHistory();
  }, []);

  const loadModel = async () => {
    try {
      await aiVisionService.loadModel();
      setIsModelLoaded(true);
      toast.success("Modelo COCO-SSD carregado com sucesso");
    } catch (error) {
      console.error("Failed to load model:", error);
      toast.error("Falha ao carregar modelo AI");
    }
  };

  const loadHistory = async () => {
    try {
      const history = await aiVisionService.getRecentEvents(10);
      setDetectionHistory(history);
      updateStats(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const updateStats = (events: VisionEvent[]) => {
    const newStats = aiVisionService.calculateStats(events);
    setStats(newStats);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = imageRef.current;
      if (!img) return;

      img.onload = () => {
        processImage();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!imageRef.current || !canvasRef.current || !isModelLoaded) {
      toast.error("Modelo não carregado ou imagem inválida");
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const detectedObjects = await aiVisionService.detectObjects(imageRef.current);
      const endTime = performance.now();
      const timeTaken = endTime - startTime;

      setDetections(detectedObjects);
      setProcessingTime(timeTaken);
      drawBoundingBoxes(detectedObjects);

      // Save to mock persistence
      const visionEvent: Omit<VisionEvent, "id"> = {
        timestamp: new Date().toISOString(),
        detections: detectedObjects,
        processingTime: timeTaken,
        totalObjects: detectedObjects.length,
      };
      
      await aiVisionService.saveVisionEvent(visionEvent);
      
      // Reload history
      await loadHistory();

      toast.success(`${detectedObjects.length} objetos detectados em ${timeTaken.toFixed(0)}ms`);
    } catch (error) {
      console.error("Detection failed:", error);
      toast.error("Falha na detecção de objetos");
    } finally {
      setIsProcessing(false);
    }
  };

  const drawBoundingBoxes = (detectedObjects: DetectedObject[]) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Draw bounding boxes
    detectedObjects.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;

      // Draw rectangle
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      const label = `${detection.class} ${(detection.score * 100).toFixed(0)}%`;
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = "#000";
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500";
    if (score >= 0.7) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-950 to-cyan-950 border-cyan-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-cyan-400" />
              <div>
                <CardTitle className="text-2xl text-white">AI Visual Recognition Core</CardTitle>
                <p className="text-cyan-300 text-sm">TensorFlow.js COCO-SSD - 80+ Object Classes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isModelLoaded ? "default" : "secondary"} className="bg-cyan-600">
                {isModelLoaded ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Modelo Ativo
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Carregando...
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Total Detecções</p>
                <p className="text-2xl font-bold text-white">{stats.totalDetections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Confiança Média</p>
                <p className="text-2xl font-bold text-white">
                  {(stats.averageConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Classe Comum</p>
                <p className="text-lg font-bold text-white truncate">{stats.mostCommonClass}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Tempo Médio</p>
                <p className="text-2xl font-bold text-white">
                  {stats.processingTimeAvg.toFixed(0)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Image Processing Area */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Camera className="h-5 w-5 text-cyan-400" />
              Processamento de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isModelLoaded || isProcessing}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Imagem
              </Button>
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Activity className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              )}

              {processingTime > 0 && !isProcessing && (
                <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {processingTime.toFixed(0)}ms
                </Badge>
              )}
            </div>

            {/* Image and Canvas Display */}
            <div className="relative bg-slate-950 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
              <img
                ref={imageRef}
                alt="Upload an image"
                className="hidden"
              />
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[600px] object-contain"
              />
              {!imageRef.current?.src && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Upload className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>Upload uma imagem para começar a detecção</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detection Results */}
            {detections.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-cyan-400" />
                  Objetos Detectados ({detections.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {detections.map((detection, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium capitalize text-sm">
                          {detection.class}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${getConfidenceColor(detection.score)} text-white text-xs`}
                        >
                          {(detection.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Posição: [{detection.bbox[0].toFixed(0)}, {detection.bbox[1].toFixed(0)}]
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detection History */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-cyan-400" />
              Histórico ({detectionHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {detectionHistory.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-cyan-900 text-cyan-300 text-xs">
                        {event.totalObjects} objetos
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {event.detections.slice(0, 3).map((detection, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300 capitalize">{detection.class}</span>
                          <span className="text-cyan-400">
                            {(detection.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-2 bg-cyan-800/30" />
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {event.processingTime.toFixed(0)}ms
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Info Footer */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Sistema de reconhecimento visual alimentado por TensorFlow.js COCO-SSD
            </p>
            <p className="text-xs text-gray-500">
              Suporta 80+ classes de objetos incluindo pessoas, veículos, animais, e objetos do cotidiano
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVisionCore;
