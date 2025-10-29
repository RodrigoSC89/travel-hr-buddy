/**
 * PATCH 525 - AI Visual Recognition Core
 * AI-powered visual recognition system using TensorFlow.js with COCO-SSD
 * 
 * Features:
 * - Image upload and recognition
 * - Real-time object detection
 * - Confidence scores for detections
 * - Event logging in vision_events table
 * - Clean and interactive UI
 * - Multi-object detection
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Upload,
  Brain,
  CheckCircle,
  AlertCircle,
  Database,
  Image as ImageIcon,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

interface VisionEvent {
  id: string;
  timestamp: string;
  image_url?: string;
  detections: DetectedObject[];
  total_objects: number;
  processing_time: number;
}

const AIVisionCore: React.FC = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [visionHistory, setVisionHistory] = useState<VisionEvent[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load model on mount
  useEffect(() => {
    loadModel();
    loadVisionHistory();
  }, []);

  const loadModel = async () => {
    setIsLoadingModel(true);
    try {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      toast.success("Modelo AI carregado com sucesso");
    } catch (error) {
      console.error("Failed to load model:", error);
      toast.error("Falha ao carregar modelo AI");
    } finally {
      setIsLoadingModel(false);
    }
  };

  const loadVisionHistory = () => {
    // Mock data - In production, this would fetch from vision_events table
    const mockHistory: VisionEvent[] = [
      {
        id: "ve-001",
        timestamp: "2025-10-29T10:15:00Z",
        detections: [
          { class: "person", score: 0.95, bbox: [100, 50, 200, 400] },
          { class: "boat", score: 0.88, bbox: [350, 100, 150, 200] },
        ],
        total_objects: 2,
        processing_time: 450,
      },
      {
        id: "ve-002",
        timestamp: "2025-10-29T09:30:00Z",
        detections: [
          { class: "ship", score: 0.92, bbox: [50, 80, 500, 300] },
        ],
        total_objects: 1,
        processing_time: 320,
      },
    ];
    setVisionHistory(mockHistory);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setDetectedObjects([]);
    };
    reader.readAsDataURL(file);
  };

  const detectObjects = async () => {
    if (!model || !selectedImage || !imageRef.current) {
      toast.error("Carregue uma imagem primeiro");
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();

    try {
      // Run detection
      const predictions = await model.detect(imageRef.current);
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);

      setDetectedObjects(predictions);
      setProcessingTime(timeTaken);

      // Draw bounding boxes
      drawBoundingBoxes(predictions);

      // Log the event
      const visionEvent: VisionEvent = {
        id: `ve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        image_url: selectedImage,
        detections: predictions,
        total_objects: predictions.length,
        processing_time: timeTaken,
      };

      setVisionHistory((prev) => [visionEvent, ...prev]);

      toast.success(`${predictions.length} objeto(s) detectado(s) em ${timeTaken}ms`);
    } catch (error) {
      console.error("Detection failed:", error);
      toast.error("Falha na detecção");
    } finally {
      setIsProcessing(false);
    }
  };

  const drawBoundingBoxes = (predictions: DetectedObject[]) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each bounding box
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // Draw box
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = "#00ffff";
      const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = "#000000";
      ctx.font = "16px Arial";
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  const clearImage = () => {
    setSelectedImage(null);
    setDetectedObjects([]);
    setProcessingTime(0);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      detections: detectedObjects,
      processing_time: processingTime,
      total_objects: detectedObjects.length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vision-detection-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Resultados exportados");
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-400";
    if (score >= 0.7) return "text-yellow-400";
    if (score >= 0.5) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Camera className="w-8 h-8 text-cyan-400 animate-pulse" />
              AI Visual Recognition Core
            </h1>
            <p className="text-zinc-400 mt-1">
              Real-time object detection with TensorFlow.js - PATCH 525
            </p>
          </div>
          {model ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Modelo Ativo
            </Badge>
          ) : (
            <Badge className="bg-yellow-500 text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              {isLoadingModel ? "Carregando..." : "Inativo"}
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        {detectedObjects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-zinc-400">Objetos Detectados</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{detectedObjects.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-400">Tempo de Processamento</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{processingTime}ms</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-zinc-400">Confiança Média</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((detectedObjects.reduce((sum, obj) => sum + obj.score, 0) / detectedObjects.length) * 100)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Histórico</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{visionHistory.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload & Display */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    Análise de Imagem
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedImage && (
                      <>
                        <Button size="sm" variant="outline" onClick={clearImage} className="border-zinc-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar
                        </Button>
                        {detectedObjects.length > 0 && (
                          <Button size="sm" variant="outline" onClick={exportResults} className="border-zinc-600">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-xl font-semibold text-zinc-400 mb-2">Upload de Imagem</h3>
                    <p className="text-zinc-500 mb-4">
                      Selecione uma imagem para análise com IA
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      disabled={!model || isLoadingModel}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Imagem
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <img
                        ref={imageRef}
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-auto"
                        onLoad={() => {
                          // Auto-detect on load
                          if (model && detectedObjects.length === 0) {
                            detectObjects();
                          }
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={detectObjects}
                        disabled={isProcessing || !model}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing ? (
                          <>
                            <Brain className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Analisar com IA
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="border-zinc-600"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detection Results */}
          <div className="space-y-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Objetos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detectedObjects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum objeto detectado</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {detectedObjects.map((obj, index) => (
                        <div
                          key={index}
                          className="p-3 bg-purple-500/10 rounded border border-purple-500/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm capitalize">{obj.class}</span>
                            <Badge className="bg-purple-500">
                              {Math.round(obj.score * 100)}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-zinc-400 mb-1">Confiança</div>
                              <Progress value={obj.score * 100} className="h-2" />
                            </div>
                            <div className="text-xs text-zinc-500">
                              Posição: x:{Math.round(obj.bbox[0])}, y:{Math.round(obj.bbox[1])}
                              <br />
                              Tamanho: {Math.round(obj.bbox[2])}x{Math.round(obj.bbox[3])}px
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vision History */}
        {visionHistory.length > 0 && (
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {visionHistory.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-zinc-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                            {event.total_objects} objetos
                          </Badge>
                          <Badge variant="outline" className="text-green-400 border-green-500/30">
                            {event.processing_time}ms
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Detectados: {event.detections.map((d) => d.class).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIVisionCore;
