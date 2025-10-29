/**
 * PATCH 523: Drone Camera Feed Component
 * Simulated live camera feed from underwater drone
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  ZoomIn,
  ZoomOut,
  Target,
  Grid3x3,
  Droplets,
} from "lucide-react";

interface CameraFeedProps {
  isRecording: boolean;
  depth: number;
  visibility: number;
  temperature: number;
}

export const DroneCameraFeed: React.FC<CameraFeedProps> = ({
  isRecording,
  depth,
  visibility,
  temperature,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [showGrid, setShowGrid] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getSceneDescription = () => {
    if (depth < 20) return "Bright water, good visibility";
    if (depth < 50) return "Moderate depth, reduced light";
    if (depth < 100) return "Deep water, low light";
    return "Very deep, minimal light";
  };

  const getWaterColor = () => {
    if (depth < 20) return "rgba(100, 149, 237, 0.3)";
    if (depth < 50) return "rgba(65, 105, 225, 0.5)";
    if (depth < 100) return "rgba(25, 25, 112, 0.7)";
    return "rgba(0, 0, 50, 0.9)";
  };

  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Camera Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge className="bg-red-500 animate-pulse">REC</Badge>
            )}
            <Badge variant="outline">Frame: {frameCount}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-cyan-500/30"
          style={{
            background: `linear-gradient(180deg, ${getWaterColor()}, rgba(0, 0, 20, 0.95))`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full" style={{ transform: `scale(${zoom})` }}>
              {showOverlay && (
                <div className="absolute top-4 left-4 bg-black/50 p-2 rounded text-xs font-mono">
                  <div className="text-green-400">DEPTH: {depth.toFixed(1)}m</div>
                  <div className="text-cyan-400">TEMP: {temperature.toFixed(1)}°C</div>
                  <div className="text-blue-400">VIS: {visibility.toFixed(1)}m</div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-xs text-zinc-400">
                {getSceneDescription()}
              </div>
            </div>
          </div>
          {visibility < 5 && (
            <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 p-2 rounded">
              <Droplets className="w-4 h-4 text-yellow-400" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowOverlay(!showOverlay)}>
            <Target className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
