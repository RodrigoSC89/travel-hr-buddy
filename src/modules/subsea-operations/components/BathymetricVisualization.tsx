/**
 * Bathymetric Visualization - Interactive 2D Depth Map
 * Renders seafloor terrain using canvas-based rendering with interactive depth profiles
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import {
  Map, Waves, Layers, Crosshair, ZoomIn, ZoomOut,
  RotateCcw, Download, Ruler, Anchor, Navigation
} from "lucide-react";

// Generate realistic bathymetric terrain data using Perlin-like noise
function generateTerrainGrid(rows: number, cols: number, seed: number = 42): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: number[] = [];
    for (let x = 0; x < cols; x++) {
      // Multi-octave noise simulation
      const nx = x / cols;
      const ny = y / rows;
      const val =
        Math.sin(nx * 6.28 + seed) * Math.cos(ny * 6.28 + seed * 0.7) * 120 +
        Math.sin(nx * 12.56 + seed * 1.3) * Math.cos(ny * 9.42) * 60 +
        Math.sin(nx * 25.12 + seed * 2.1) * Math.cos(ny * 18.84 + seed) * 30 +
        Math.sin(nx * 31.4 + seed * 3.7) * 7.5;
      // Depth range: -50m to -450m
      row.push(Math.round(Math.min(-50, Math.max(-450, -250 + val))));
    }
    grid.push(row);
  }
  return grid;
}

function depthToColor(depth: number): string {
  const d = Math.abs(depth);
  if (d < 100) return `hsl(190, 70%, ${70 - d * 0.2}%)`;
  if (d < 200) return `hsl(210, 75%, ${55 - (d - 100) * 0.15}%)`;
  if (d < 300) return `hsl(230, 80%, ${45 - (d - 200) * 0.1}%)`;
  if (d < 400) return `hsl(245, 85%, ${35 - (d - 300) * 0.08}%)`;
  return `hsl(260, 90%, ${27 - (d - 400) * 0.05}%)`;
}

interface SubseaAsset {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  type: "rov" | "auv" | "sensor" | "structure";
}

const ASSETS: SubseaAsset[] = [
  { id: "1", name: "ROV-01 Neptune", x: 12, y: 8, depth: -245, type: "rov" },
  { id: "2", name: "AUV-03 Triton", x: 22, y: 15, depth: -180, type: "auv" },
  { id: "3", name: "Sensor Array A", x: 18, y: 20, depth: -310, type: "sensor" },
  { id: "4", name: "Pipeline Junction", x: 8, y: 12, depth: -195, type: "structure" },
  { id: "5", name: "Wellhead W-1", x: 25, y: 5, depth: -380, type: "structure" },
];

export function BathymetricVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize] = useState({ rows: 30, cols: 30 });
  const [terrain] = useState(() => generateTerrainGrid(30, 30));
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; depth: number } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<"row" | "col">("row");
  const [profileIndex, setProfileIndex] = useState([15]);
  const [zoom, setZoom] = useState(1);
  const [showAssets, setShowAssets] = useState(true);
  const [colorScheme, setColorScheme] = useState<"ocean" | "thermal">("ocean");

  const cellSize = useMemo(() => Math.floor(16 * zoom), [zoom]);

  // Render terrain to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = gridSize.cols * cellSize;
    const h = gridSize.rows * cellSize;
    canvas.width = w;
    canvas.height = h;

    // Draw terrain cells
    for (let y = 0; y < gridSize.rows; y++) {
      for (let x = 0; x < gridSize.cols; x++) {
        const depth = terrain[y][x];
        ctx.fillStyle = colorScheme === "ocean" ? depthToColor(depth) : thermalColor(depth);
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw grid lines (subtle)
    if (cellSize >= 12) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y <= gridSize.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(w, y * cellSize);
        ctx.stroke();
      }
      for (let x = 0; x <= gridSize.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, h);
        ctx.stroke();
      }
    }

    // Draw profile line
    ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    if (selectedProfile === "row") {
      const py = profileIndex[0] * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    } else {
      const px = profileIndex[0] * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw assets
    if (showAssets) {
      ASSETS.forEach((asset) => {
        const ax = asset.x * cellSize + cellSize / 2;
        const ay = asset.y * cellSize + cellSize / 2;
        const r = Math.max(4, cellSize * 0.3);

        ctx.beginPath();
        ctx.arc(ax, ay, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ax, ay, r, 0, Math.PI * 2);
        ctx.fillStyle =
          asset.type === "rov" ? "#22c55e" :
          asset.type === "auv" ? "#3b82f6" :
          asset.type === "sensor" ? "#eab308" : "#ef4444";
        ctx.fill();

        if (cellSize >= 14) {
          ctx.fillStyle = "#fff";
          ctx.font = `${Math.max(8, cellSize * 0.4)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(asset.name.split(" ")[0], ax, ay + r + Math.max(10, cellSize * 0.5));
        }
      });
    }

    // Highlight hovered cell
    if (hoveredCell) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(hoveredCell.x * cellSize, hoveredCell.y * cellSize, cellSize, cellSize);
    }
  }, [terrain, cellSize, gridSize, hoveredCell, profileIndex, selectedProfile, showAssets, colorScheme, zoom]);

  function thermalColor(depth: number): string {
    const d = Math.abs(depth);
    const t = Math.min(1, d / 450);
    const h = 240 - t * 240; // blue→red
    return `hsl(${h}, 80%, ${50 - t * 15}%)`;
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < gridSize.cols && y >= 0 && y < gridSize.rows) {
      setHoveredCell({ x, y, depth: terrain[y][x] });
    }
  }, [cellSize, gridSize, terrain]);

  const handleCanvasMouseLeave = useCallback(() => setHoveredCell(null), []);

  // Generate depth profile data
  const profileData = useMemo(() => {
    const idx = profileIndex[0];
    if (selectedProfile === "row" && idx < gridSize.rows) {
      return terrain[idx].map((depth, i) => ({
        position: i * 50, // meters
        depth: Math.abs(depth),
        rawDepth: depth,
      }));
    } else if (idx < gridSize.cols) {
      return terrain.map((row, i) => ({
        position: i * 50,
        depth: Math.abs(row[idx]),
        rawDepth: row[idx],
      }));
    }
    return [];
  }, [terrain, profileIndex, selectedProfile, gridSize]);

  // Depth distribution for scatter
  const scatterData = useMemo(() => {
    const points: { x: number; y: number; depth: number; size: number }[] = [];
    for (let y = 0; y < gridSize.rows; y += 2) {
      for (let x = 0; x < gridSize.cols; x += 2) {
        points.push({
          x: x * 50,
          y: y * 50,
          depth: Math.abs(terrain[y][x]),
          size: Math.abs(terrain[y][x]) / 10,
        });
      }
    }
    return points;
  }, [terrain, gridSize]);

  const depthStats = useMemo(() => {
    const flat = terrain.flat();
    return {
      min: Math.min(...flat),
      max: Math.max(...flat),
      avg: Math.round(flat.reduce((a, b) => a + b, 0) / flat.length),
    };
  }, [terrain]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `bathymetric-map-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} aria-label="Reduzir zoom" title="Reduzir">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary">{Math.round(zoom * 100)}%</Badge>
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(2.5, zoom + 0.25))} aria-label="Ampliar zoom" title="Ampliar">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)} aria-label="Resetar zoom" title="Resetar">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Select value={colorScheme} onValueChange={(v: "ocean" | "thermal") => setColorScheme(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ocean">🌊 Oceânico</SelectItem>
            <SelectItem value="thermal">🌡️ Térmico</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showAssets ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAssets(!showAssets)}
        >
          <Navigation className="h-4 w-4 mr-1" />
          Ativos
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Exportar PNG
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {hoveredCell && (
            <Badge variant="outline" className="font-mono text-xs">
              <Crosshair className="h-3 w-3 mr-1" />
              ({hoveredCell.x * 50}m, {hoveredCell.y * 50}m) → {hoveredCell.depth}m
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Prof. Mínima</p>
            <p className="text-lg font-bold text-info">{depthStats.max}m</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Prof. Máxima</p>
            <p className="text-lg font-bold text-primary">{depthStats.min}m</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Prof. Média</p>
            <p className="text-lg font-bold">{depthStats.avg}m</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization */}
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Map className="h-4 w-4 text-cyan-400" />
            Mapa Batimétrico Interativo
            <Badge variant="outline" className="ml-auto text-xs">
              {gridSize.cols * 50}m × {gridSize.rows * 50}m
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="overflow-auto max-h-[500px] rounded-lg border border-border/30">
            <canvas
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="cursor-crosshair"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 mt-3 px-2">
            <span className="text-xs text-muted-foreground">Raso</span>
            <div className="flex-1 h-3 rounded-full" style={{
              background: colorScheme === "ocean"
                ? "linear-gradient(to right, hsl(190,70%,60%), hsl(210,75%,40%), hsl(230,80%,30%), hsl(245,85%,25%), hsl(260,90%,20%))"
                : "linear-gradient(to right, hsl(240,80%,50%), hsl(180,80%,45%), hsl(120,80%,40%), hsl(60,80%,45%), hsl(0,80%,40%))"
            }} />
            <span className="text-xs text-muted-foreground">Profundo</span>
          </div>

          {/* Asset Legend */}
          {showAssets && (
            <div className="flex items-center gap-4 mt-2 px-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> ROV</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> AUV</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Sensor</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Estrutura</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depth Profile */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-cyan-400" />
              Perfil Batimétrico
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedProfile} onValueChange={(v: "row" | "col") => setSelectedProfile(v)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">→ Horizontal</SelectItem>
                  <SelectItem value="col">↓ Vertical</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 w-[200px]">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Linha {profileIndex[0]}
                </span>
                <Slider
                  value={profileIndex}
                  onValueChange={setProfileIndex}
                  min={0}
                  max={gridSize.rows - 1}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={profileData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(210, 75%, 50%)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(240, 80%, 25%)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="position"
                fontSize={10}
                tickFormatter={(v) => `${v}m`}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                fontSize={10}
                tickFormatter={(v) => `-${v}m`}
                stroke="hsl(var(--muted-foreground))"
                reversed
              />
              <Tooltip
                formatter={(value: number) => [`-${value}m`, "Profundidade"]}
                labelFormatter={(label) => `Distância: ${label}m`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="depth"
                stroke="hsl(210, 75%, 50%)"
                fill="url(#depthGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default BathymetricVisualization;
