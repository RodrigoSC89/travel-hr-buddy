// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Satellite, AlertTriangle, Play, Square, Globe, Orbit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface SatelliteData {
  id: string;
  norad_id: number;
  name: string;
  satellite_type: string;
  is_active: boolean;
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    calculated_at: string;
  };
}

interface SatelliteAlert {
  id: string;
  satellite_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  is_resolved: boolean;
  created_at: string;
}

export default function SatelliteTracker() {
  const { toast } = useToast();
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [alerts, setAlerts] = useState<SatelliteAlert[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<string | null>(null);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    fetchSatellites();
    fetchAlerts();
    initializeVisualization();

    // Real-time alerts subscription
    const channel = supabase
      .channel("satellite_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "satellite_alerts"
        },
        (payload) => {
          console.log("New satellite alert:", payload);
          toast({
            title: "Satellite Alert",
            description: payload.new.title,
            variant: payload.new.severity === "critical" ? "destructive" : "default",
          });
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      cleanupVisualization();
    };
  }, []);

  const fetchSatellites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("satellites")
        .select(`
          *,
          satellite_positions (
            latitude,
            longitude,
            altitude,
            calculated_at
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      const satellitesWithPosition = (data || []).map(sat => ({
        ...sat,
        position: sat.satellite_positions?.[0]
      }));

      setSatellites(satellitesWithPosition);
    } catch (error) {
      console.error("Error fetching satellites:", error);
      toast({
        title: "Error",
        description: "Failed to load satellites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("satellite_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const initializeVisualization = () => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      shininess: 25
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };

  const cleanupVisualization = () => {
    if (rendererRef.current && canvasRef.current) {
      canvasRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
  };

  const startTracking = async (satelliteId: string) => {
    try {
      const { data, error } = await supabase.rpc("start_tracking_session", {
        p_satellite_id: satelliteId,
        p_tracking_mode: "real-time"
      });

      if (error) throw error;

      setTrackingSessionId(data);
      setSelectedSatellite(satelliteId);

      toast({
        title: "Tracking Started",
        description: "Satellite tracking session initiated",
      });
    } catch (error) {
      console.error("Error starting tracking:", error);
      toast({
        title: "Error",
        description: "Failed to start tracking session",
        variant: "destructive",
      });
    }
  };

  const stopTracking = async () => {
    if (!trackingSessionId) return;

    try {
      const { error } = await supabase.rpc("end_tracking_session", {
        p_session_id: trackingSessionId
      });

      if (error) throw error;

      setTrackingSessionId(null);
      setSelectedSatellite(null);

      toast({
        title: "Tracking Stopped",
        description: "Satellite tracking session ended",
      });
    } catch (error) {
      console.error("Error stopping tracking:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.rpc("resolve_satellite_alert", {
        p_alert_id: alertId
      });

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "Satellite alert marked as resolved",
      });

      fetchAlerts();
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Satellite Tracker
          </h1>
          <p className="text-muted-foreground">
            Real-time satellite tracking with orbital visualization
          </p>
        </div>
        <div className="flex gap-2">
          {trackingSessionId ? (
            <Button variant="destructive" onClick={stopTracking}>
              <Square className="mr-2 h-4 w-4" />
              Stop Tracking
            </Button>
          ) : (
            <Button onClick={fetchSatellites}>
              <Orbit className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 3D Visualization */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              3D Orbital View
            </CardTitle>
            <CardDescription>
              Real-time satellite positions and orbital paths
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={canvasRef} 
              className="w-full h-[500px] rounded-lg bg-slate-950"
            />
          </CardContent>
        </Card>

        {/* Satellite List & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Satellites</CardTitle>
              <CardDescription>
                {satellites.length} satellites tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {satellites.map((satellite) => (
                    <Card
                      key={satellite.id}
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        selectedSatellite === satellite.id ? "border-primary" : ""
                      }`}
                      onClick={() => startTracking(satellite.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{satellite.name}</p>
                            <p className="text-xs text-muted-foreground">
                              NORAD: {satellite.norad_id}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {satellite.satellite_type}
                          </Badge>
                        </div>
                        {satellite.position && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <p>Alt: {satellite.position.altitude.toFixed(2)} km</p>
                            <p>
                              Lat: {satellite.position.latitude.toFixed(2)}°, 
                              Lon: {satellite.position.longitude.toFixed(2)}°
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>
                {alerts.length} unresolved alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={
                                  alert.severity === "critical" 
                                    ? "destructive" 
                                    : alert.severity === "warning"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.alert_type}</Badge>
                            </div>
                            <p className="font-semibold text-sm">{alert.title}</p>
                            {alert.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
