/**
import { useEffect, useRef, useState } from "react";;
 * PATCH 533 - Mission Replay Component
 * Interactive replay interface with timeline control
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Clock,
  MapPin,
  Activity,
  AlertTriangle,
} from "lucide-react";
import type { MissionRecording, RecordedTrajectory, AttentionPoint } from "../services/missionRecorderService";

interface MissionReplayProps {
  recording: MissionRecording;
  onClose?: () => void;
}

export const MissionReplayPanel: React.FC<MissionReplayProps> = ({ recording, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = recording.duration || 0;
  const trajectory = recording.trajectory;
  const totalFrames = trajectory.length;

  // Get current trajectory point
  const getCurrentTrajectory = (): RecordedTrajectory | null => {
    if (trajectory.length === 0) return null;
    return trajectory[currentFrame] || trajectory[trajectory.length - 1];
  };

  // Get attention points near current time
  const getNearbyAttentionPoints = (): AttentionPoint[] => {
    if (!recording.analysis?.attentionPoints) return [];
    
    const currentTimestamp = recording.startTime + (currentTime * 1000);
    const timeWindow = 5000; // 5 seconds window

    return recording.analysis.attentionPoints.filter(point => 
      Math.abs(point.timestamp - currentTimestamp) < timeWindow
    );
  };

  // Play/Pause control
  useEffect(() => {
    if (isPlaying) {
      playbackInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + (0.1 * playbackSpeed);
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }, 100);
    } else {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
        playbackInterval.current = null;
      }
    }

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Update frame based on current time
  useEffect(() => {
    if (totalDuration === 0) return;
    
    const progress = currentTime / totalDuration;
    const frame = Math.floor(progress * totalFrames);
    setCurrentFrame(Math.min(frame, totalFrames - 1));
  }, [currentTime, totalDuration, totalFrames]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleSkipForward = () => {
    setCurrentTime(Math.min(totalDuration, currentTime + 5));
  };

  const handleTimelineChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTrajectory = getCurrentTrajectory();
  const nearbyAlerts = getNearbyAttentionPoints();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{recording.name}</h3>
          <p className="text-sm text-muted-foreground">
            Recorded on {new Date(recording.startTime).toLocaleString()}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Playback Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatTime(currentTime)}</span>
              <span className="text-muted-foreground">{formatTime(totalDuration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              min={0}
              max={totalDuration}
              step={0.1}
              onValueChange={handleTimelineChange}
              className="w-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRestart}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[0.5, 1, 2, 4].map(speed => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "default" : "outline"}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      {currentTrajectory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latitude:</span>
                <span className="font-mono">{currentTrajectory.position.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Longitude:</span>
                <span className="font-mono">{currentTrajectory.position.lon.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Depth:</span>
                <span className="font-mono">{currentTrajectory.position.depth.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Altitude:</span>
                <span className="font-mono">{currentTrajectory.position.altitude.toFixed(1)}m</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Velocity & Orientation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forward:</span>
                <span className="font-mono">{currentTrajectory.velocity.forward.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lateral:</span>
                <span className="font-mono">{currentTrajectory.velocity.lateral.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vertical:</span>
                <span className="font-mono">{currentTrajectory.velocity.vertical.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yaw:</span>
                <span className="font-mono">{currentTrajectory.orientation.yaw.toFixed(1)}°</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Battery:</span>
                <Badge variant={currentTrajectory.telemetry.battery > 50 ? "default" : "destructive"}>
                  {currentTrajectory.telemetry.battery.toFixed(0)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature:</span>
                <span className="font-mono">{currentTrajectory.telemetry.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pressure:</span>
                <span className="font-mono">{currentTrajectory.telemetry.pressure.toFixed(1)} bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signal:</span>
                <span className="font-mono">{currentTrajectory.telemetry.signalStrength.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Nearby Attention Points */}
      {nearbyAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Attention Points Nearby
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nearbyAlerts.map((point, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950"
              >
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                  point.severity === "high" ? "text-red-500" :
                    point.severity === "medium" ? "text-orange-500" :
                      "text-yellow-500"
                }`} />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{point.type.replace("_", " ")}</p>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {point.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
