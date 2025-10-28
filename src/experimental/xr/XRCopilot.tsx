import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Camera, 
  Mic, 
  Hand, 
  Brain, 
  Activity,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { intentEngine, IntentOutput } from "@/ai/multimodal/intentEngine";
import { copilotVision, VisualContext } from "@/ai/vision/copilotVision";
import { gestureProcessor, GestureData } from "./inputs/GestureProcessor";
import { voiceFeedback } from "./outputs/VoiceFeedback";
import { contextualAdapter, AdaptiveResponse } from "@/ai/multimodal/contextualAdapter";

interface XRCopilotProps {
  experimentalMode?: boolean;
}

export function XRCopilot({ experimentalMode = true }: XRCopilotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [visualContext, setVisualContext] = useState<VisualContext | null>(null);
  const [currentIntent, setCurrentIntent] = useState<IntentOutput | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureData | null>(null);
  const [lastResponse, setLastResponse] = useState<AdaptiveResponse | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const stopAnalysisRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (stopAnalysisRef.current) {
      stopAnalysisRef.current();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    gestureProcessor.stopRecognition();
    voiceFeedback.stop();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setCameraEnabled(true);
      toast.success("Camera activated");
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to activate camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
    toast.info("Camera deactivated");
  };

  const startVisionAnalysis = async () => {
    if (!videoRef.current || !cameraEnabled) {
      toast.error("Camera must be enabled first");
      return;
    }

    try {
      const stopFn = await copilotVision.startContinuousAnalysis(
        videoRef.current,
        (context) => {
          setVisualContext(context);
          processMultimodalInput({ visual: context });
        },
        3000 // Analyze every 3 seconds
      );

      stopAnalysisRef.current = stopFn;
      toast.success("Vision analysis started");
    } catch (error) {
      console.error("Error starting vision analysis:", error);
      toast.error("Failed to start vision analysis");
    }
  };

  const startGestureRecognition = async () => {
    if (!videoRef.current || !cameraEnabled) {
      toast.error("Camera must be enabled first");
      return;
    }

    try {
      await gestureProcessor.startRecognition(videoRef.current, (gesture) => {
        setCurrentGesture(gesture);
        processMultimodalInput({ gestural: gesture });
      });

      setGestureEnabled(true);
      toast.success("Gesture recognition started");
    } catch (error) {
      console.error("Error starting gesture recognition:", error);
      toast.error("Failed to start gesture recognition");
    }
  };

  const stopGestureRecognition = () => {
    gestureProcessor.stopRecognition();
    setGestureEnabled(false);
    toast.info("Gesture recognition stopped");
  };

  const startVoiceCommand = async () => {
    try {
      setVoiceEnabled(true);
      toast.info("Listening for voice command...");

      await intentEngine.processVoiceCommand(
        (transcript) => {
          toast.success(`Recognized: "${transcript}"`);
          processMultimodalInput({ voice: transcript });
        },
        (error) => {
          console.error("Voice recognition error:", error);
          toast.error("Voice recognition failed");
        }
      );

      setVoiceEnabled(false);
    } catch (error) {
      console.error("Error with voice command:", error);
      toast.error("Failed to process voice command");
      setVoiceEnabled(false);
    }
  };

  const processMultimodalInput = async (input: {
    visual?: VisualContext;
    gestural?: GestureData;
    voice?: string;
  }) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Process intent
      const intent = await intentEngine.processIntent({
        voiceCommand: input.voice,
        gestureInput: input.gestural ? {
          type: input.gestural.type,
          confidence: input.gestural.confidence,
          data: input.gestural,
        } : undefined,
        context: {
          visual: input.visual,
          currentEnvironment: "xr",
        },
      });

      setCurrentIntent(intent);

      // Generate adaptive response
      const response = await contextualAdapter.adaptResponse(intent, {
        visual: input.visual || visualContext || undefined,
        gestural: input.gestural ? {
          type: input.gestural.type,
          confidence: input.gestural.confidence,
          data: input.gestural
        } : undefined,
        currentEnvironment: "xr",
      });

      setLastResponse(response);

      // Output response
      await outputResponse(response);

    } catch (error) {
      console.error("Error processing multimodal input:", error);
      toast.error("Failed to process input");
    } finally {
      setIsProcessing(false);
    }
  };

  const outputResponse = async (response: AdaptiveResponse) => {
    // Voice output
    if (response.modality === "voice" || response.modality === "multimodal") {
      const emotion = response.urgency === "critical" ? "critical" :
        response.urgency === "high" ? "urgent" :
          response.urgency === "medium" ? "warning" : "calm";
      
      await voiceFeedback.speakWithEmotion(response.content, emotion);
    }

    // Text/visual output
    if (response.modality === "text" || response.modality === "visual" || response.modality === "multimodal") {
      const variant = response.urgency === "critical" || response.urgency === "high" ? "error" :
        response.urgency === "medium" ? "warning" : "success";
      
      toast[variant === "error" ? "error" : variant === "warning" ? "warning" : "success"](response.content);
    }
  };

  const toggleCopilot = async () => {
    if (!isActive) {
      // Start copilot
      await startCamera();
      setIsActive(true);
      toast.success("XR Copilot activated");
    } else {
      // Stop copilot
      cleanup();
      stopCamera();
      setIsActive(false);
      toast.info("XR Copilot deactivated");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            XR Copilot
          </h2>
          <p className="text-muted-foreground">
            Multimodal AI assistant with voice, vision, and gesture support
          </p>
        </div>
        {experimentalMode && (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Zap className="h-3 w-3 mr-1" />
            Experimental
          </Badge>
        )}
      </div>

      {/* Main Control */}
      <Card>
        <CardHeader>
          <CardTitle>System Control</CardTitle>
          <CardDescription>Activate and configure XR Copilot modules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${isActive ? "text-green-600 animate-pulse" : "text-gray-400"}`} />
              <span className="font-medium">XR Copilot</span>
            </div>
            <Button onClick={toggleCopilot} variant={isActive ? "destructive" : "default"}>
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>

          {isActive && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <Label>Camera & Vision</Label>
                </div>
                <div className="flex items-center gap-2">
                  {cameraEnabled && (
                    <Button size="sm" variant="outline" onClick={startVisionAnalysis}>
                      Start Analysis
                    </Button>
                  )}
                  <Switch checked={cameraEnabled} disabled />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4" />
                  <Label>Gesture Recognition</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={gestureEnabled} 
                    onCheckedChange={(checked) => {
                      if (checked) startGestureRecognition();
                      else stopGestureRecognition();
                    }}
                    disabled={!cameraEnabled}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <Label>Voice Commands</Label>
                </div>
                <Button 
                  size="sm" 
                  variant={voiceEnabled ? "secondary" : "outline"}
                  onClick={startVoiceCommand}
                  disabled={voiceEnabled}
                >
                  {voiceEnabled ? "Listening..." : "Speak"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Feed */}
      {isActive && cameraEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              className="w-full rounded-lg border"
              playsInline
              muted
            />
          </CardContent>
        </Card>
      )}

      {/* Status Grid */}
      {isActive && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Visual Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visualContext ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Scene:</span>{" "}
                    {visualContext.sceneClassification}
                  </div>
                  <div>
                    <span className="font-semibold">Objects:</span>{" "}
                    {visualContext.detectedObjects.length}
                  </div>
                  <div>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {(visualContext.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No visual data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Hand className="h-4 w-4" />
                Current Gesture
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentGesture ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Type:</span>{" "}
                    {currentGesture.type}
                  </div>
                  <div>
                    <span className="font-semibold">Hand:</span>{" "}
                    {currentGesture.handedness}
                  </div>
                  <div>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {(currentGesture.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No gesture detected</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Intent & Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentIntent ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Intent:</span>{" "}
                    {currentIntent.intent}
                  </div>
                  <div>
                    <span className="font-semibold">Action:</span>{" "}
                    {currentIntent.action}
                  </div>
                  {lastResponse && (
                    <div>
                      <span className="font-semibold">Urgency:</span>{" "}
                      <Badge variant={lastResponse.urgency === "critical" ? "destructive" : "default"}>
                        {lastResponse.urgency}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No intent detected</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Activity className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Processing multimodal input...
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
