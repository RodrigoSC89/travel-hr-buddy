/**
 * PATCH 181.0 - Underwater Drone Control Module
 * Main component for ROV/AUV control and monitoring
 * 
 * Features:
 * - 3D movement control
 * - Real-time telemetry display
 * - Mission waypoint navigation
 * - System health monitoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Anchor,
  Navigation,
  Activity,
  Gauge,
  Thermometer,
  Battery,
  Radio,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Upload,
  Map,
  Waves,
} from "lucide-react";
import DroneSubCore, { DronePosition, MovementCommand } from "./droneSubCore";
import TelemetrySub, { TelemetryAlert } from "./telemetrySub";
import MissionUploadSub, { Mission, MissionEvent } from "./missionUploadSub";

const UnderwaterDrone: React.FC = () => {
  // Initialize subsystems
  const [droneCore] = useState(() => new DroneSubCore({
    lat: -23.5505,
    lon: -46.6333,
    depth: 0,
    altitude: 0,
  }));
  
  const [telemetry] = useState(() => new TelemetrySub({
    lat: -23.5505,
    lon: -46.6333,
    depth: 0,
    altitude: 0,
  }));
  
  const [missionManager] = useState(() => new MissionUploadSub());

  // State
  const [droneState, setDroneState] = useState(droneCore.getState());
  const [telemetryData, setTelemetryData] = useState(telemetry.getTelemetry());
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missionEvents, setMissionEvents] = useState<MissionEvent[]>([]);
  const [missionJson, setMissionJson] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Control inputs
  const [targetDepth, setTargetDepth] = useState(10);
  const [targetLat, setTargetLat] = useState(-23.5505);
  const [targetLon, setTargetLon] = useState(-46.6333);

  // Initialize
  useEffect(() => {
    // Setup telemetry alert callback
    telemetry.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10));
    });

    // Setup mission event callback
    missionManager.onEvent((event) => {
      setMissionEvents(prev => [event, ...prev].slice(0, 20));
    });

    // Start drone simulation
    droneCore.startSimulation(100);

    // Update loop
    const updateInterval = setInterval(() => {
      const state = droneCore.getState();
      setDroneState(state);

      // Calculate total thruster load
      const thrusterLoad = (
        Math.abs(state.thrusters.forward) +
        Math.abs(state.thrusters.lateral) +
        Math.abs(state.thrusters.vertical) +
        Math.abs(state.thrusters.rotation)
      ) / 4;

      telemetry.updateTelemetry(state.position, state.orientation, thrusterLoad);
      setTelemetryData(telemetry.getTelemetry());

      // Check mission progress
      const mission = missionManager.getMission();
      if (mission?.status === 'active') {
        const waypoint = missionManager.getCurrentWaypoint();
        if (waypoint) {
          missionManager.waypointReached(state.position);
          
          // Auto-complete waypoint if close enough and hovering
          const distance = droneCore.distanceTo(waypoint.position);
          if (distance < 5 && state.status === 'hovering') {
            setTimeout(() => missionManager.completeWaypoint(), 2000);
          }
        }
      }

      setCurrentMission(missionManager.getMission());
    }, 100);

    return () => {
      clearInterval(updateInterval);
      droneCore.stopSimulation();
    };
  }, [droneCore, telemetry, missionManager]);

  // Command handlers
  const handleMoveTo = () => {
    const command: MovementCommand = {
      type: 'move',
      target: { lat: targetLat, lon: targetLon, depth: targetDepth, altitude: 0 },
      speed: 3,
    };
    droneCore.executeCommand(command);
  };

  const handleChangeDepth = () => {
    droneCore.executeCommand({ type: 'depth', target: { depth: targetDepth, lat: 0, lon: 0, altitude: 0 } });
  };

  const handleHover = () => {
    droneCore.executeCommand({ type: 'hover' });
  };

  const handleSurface = () => {
    droneCore.executeCommand({ type: 'surface' });
  };

  const handleEmergencyStop = () => {
    droneCore.executeCommand({ type: 'emergency_stop' });
    missionManager.abortMission('Emergency stop activated');
  };

  const handleUploadMission = () => {
    setUploadError("");
    const result = missionManager.uploadMission(missionJson);
    if (!result.success) {
      setUploadError(result.error || "Upload failed");
    } else {
      setCurrentMission(missionManager.getMission());
      setMissionJson("");
    }
  };

  const handleStartMission = () => {
    if (missionManager.startMission()) {
      setCurrentMission(missionManager.getMission());
    }
  };

  const handlePauseMission = () => {
    if (missionManager.pauseMission()) {
      setCurrentMission(missionManager.getMission());
    }
  };

  const handleAbortMission = () => {
    if (missionManager.abortMission('Manually aborted')) {
      setCurrentMission(missionManager.getMission());
    }
  };

  const handleLoadTemplate = () => {
    setMissionJson(missionManager.exportTemplate());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'moving': return 'bg-blue-500';
      case 'hovering': return 'bg-green-500';
      case 'ascending': return 'bg-cyan-500';
      case 'descending': return 'bg-indigo-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Anchor className="w-8 h-8 text-cyan-400" />
              Underwater Drone Control
            </h1>
            <p className="text-zinc-400 mt-1">
              ROV/AUV Control System - PATCH 181.0
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(droneState.status)} text-white`}>
              {droneState.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-800/50 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-zinc-400">Depth</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {droneState.position.depth.toFixed(1)}m
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-zinc-400">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {telemetryData.temperature.toFixed(1)}°C
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-400">Battery</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {telemetryData.battery.level.toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-zinc-400">Signal</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {telemetryData.communication.signalStrength.toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Control */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Manual Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Target Lat</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={targetLat}
                    onChange={(e) => setTargetLat(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Target Lon</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={targetLon}
                    onChange={(e) => setTargetLon(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Target Depth (m)</label>
                  <Input
                    type="number"
                    value={targetDepth}
                    onChange={(e) => setTargetDepth(parseFloat(e.target.value))}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleMoveTo} className="bg-cyan-600 hover:bg-cyan-700">
                  <Navigation className="w-4 h-4 mr-2" />
                  Move To Position
                </Button>
                <Button onClick={handleChangeDepth} className="bg-blue-600 hover:bg-blue-700">
                  <Waves className="w-4 h-4 mr-2" />
                  Change Depth
                </Button>
                <Button onClick={handleHover} className="bg-green-600 hover:bg-green-700">
                  <Activity className="w-4 h-4 mr-2" />
                  Hover
                </Button>
                <Button onClick={handleSurface} className="bg-purple-600 hover:bg-purple-700">
                  <Anchor className="w-4 h-4 mr-2" />
                  Surface
                </Button>
              </div>

              <Button 
                onClick={handleEmergencyStop} 
                className="w-full bg-red-600 hover:bg-red-700"
                variant="destructive"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                EMERGENCY STOP
              </Button>
            </CardContent>
          </Card>

          {/* Telemetry */}
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-400" />
                Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400 text-xs">Position</div>
                  <div className="font-mono">
                    {droneState.position.lat.toFixed(4)}°, {droneState.position.lon.toFixed(4)}°
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Pressure</div>
                  <div className="font-mono">{telemetryData.pressure.toFixed(2)} bar</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Orientation (Yaw/Pitch/Roll)</div>
                  <div className="font-mono">
                    {droneState.orientation.yaw.toFixed(0)}° / 
                    {droneState.orientation.pitch.toFixed(0)}° / 
                    {droneState.orientation.roll.toFixed(0)}°
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Visibility</div>
                  <div className="font-mono">
                    {telemetryData.environmental.visibility.toFixed(1)}m
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Battery Time</div>
                  <div className="font-mono">{telemetryData.battery.timeRemaining} min</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Connection</div>
                  <div className="font-mono capitalize">
                    {telemetryData.communication.connectionType}
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-700" />

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400">Active Alerts</div>
                {alerts.length === 0 ? (
                  <div className="text-xs text-zinc-500">No active alerts</div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`text-xs p-2 rounded border ${getAlertColor(alert.severity)}`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Control */}
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-purple-400" />
              Mission Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentMission ? (
              <>
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Upload Mission JSON</label>
                  <Textarea
                    value={missionJson}
                    onChange={(e) => setMissionJson(e.target.value)}
                    placeholder='{"id": "mission-1", "name": "Survey Mission", "waypoints": [...]}'
                    className="bg-zinc-900/50 border-zinc-700 text-white font-mono text-xs min-h-[150px]"
                  />
                </div>
                {uploadError && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
                    {uploadError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleUploadMission} className="bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Mission
                  </Button>
                  <Button onClick={handleLoadTemplate} variant="outline" className="border-zinc-600">
                    Load Template
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{currentMission.name}</div>
                    <div className="text-sm text-zinc-400">{currentMission.description}</div>
                  </div>
                  <Badge className={
                    currentMission.status === 'active' ? 'bg-green-500' :
                    currentMission.status === 'paused' ? 'bg-yellow-500' :
                    currentMission.status === 'completed' ? 'bg-blue-500' :
                    currentMission.status === 'aborted' ? 'bg-red-500' :
                    'bg-gray-500'
                  }>
                    {currentMission.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Progress</span>
                    <span className="font-semibold">{currentMission.progress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${currentMission.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-zinc-400 mb-2">Waypoints ({currentMission.waypoints.length})</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {currentMission.waypoints.map((wp, idx) => (
                      <div 
                        key={wp.id}
                        className={`p-2 rounded ${wp.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-900/50 border border-zinc-700'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">
                            {idx + 1}. {wp.description || wp.id}
                          </span>
                          {wp.completed && <Badge className="bg-green-500 text-xs">✓</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {currentMission.status === 'pending' && (
                    <Button onClick={handleStartMission} className="bg-green-600 hover:bg-green-700">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Mission
                    </Button>
                  )}
                  {currentMission.status === 'active' && (
                    <Button onClick={handlePauseMission} className="bg-yellow-600 hover:bg-yellow-700">
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Pause Mission
                    </Button>
                  )}
                  {currentMission.status === 'paused' && (
                    <Button onClick={handleStartMission} className="bg-green-600 hover:bg-green-700">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Resume Mission
                    </Button>
                  )}
                  {(currentMission.status === 'active' || currentMission.status === 'paused') && (
                    <Button onClick={handleAbortMission} variant="destructive">
                      <StopCircle className="w-4 h-4 mr-2" />
                      Abort Mission
                    </Button>
                  )}
                </div>

                {missionEvents.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-400">Mission Events</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {missionEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="text-xs p-2 bg-zinc-900/50 rounded border border-zinc-700">
                          <div className="flex justify-between">
                            <span className="text-zinc-300">{event.message}</span>
                            <span className="text-zinc-500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnderwaterDrone;
