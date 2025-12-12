// @ts-nocheck
/**
 * DP Operations Monitor Component
 * 
 * Dashboard completo de monitoramento space weather para DP operations.
 * 
 * Features:
 * - Status traffic light (🟢🟡🔴)
 * - Real-time Kp index
 * - PDOP chart
 * - Recommendations panel
 * - Auto-refresh (5 min)
 * - Alerts (audio/visual quando status muda pra RED/AMBER)
 * 
 * @example
 * ```tsx
 * <DPOperationsMonitor
 *   vesselLatitude={-22.9}
 *   vesselLongitude={-43.2}
 *   vesselName="MV Explorer"
 *   onStatusChange={(status) => }
 * />
 * ```
 */

import React, { useEffect, useState } from "react";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";

// ============================================================================
// Types
// ============================================================================

export interface DPOperationsMonitorProps {
  /** Latitude do navio */
  vesselLatitude: number;
  
  /** Longitude do navio */
  vesselLongitude: number;
  
  /** Nome do navio (opcional) */
  vesselName?: string;
  
  /** Janela de análise em horas (default: 6) */
  hours?: number;
  
  /** Intervalo de refresh em ms (default: 5 min) */
  refreshInterval?: number;
  
  /** Callback quando status muda */
  onStatusChange?: (status: "GREEN" | "AMBER" | "RED") => void;
  
  /** Habilitar alertas sonoros (default: false) */
  enableAudioAlerts?: boolean;
  
  /** Habilitar PDOP chart (default: true) */
  showPDOPChart?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function DPOperationsMonitor({
  vesselLatitude,
  vesselLongitude,
  vesselName = "Vessel",
  hours = 6,
  refreshInterval = 5 * 60 * 1000,
  onStatusChange,
  enableAudioAlerts = false,
  showPDOPChart = true,
}: DPOperationsMonitorProps) {
  const {
    status,
    loading,
    error,
    lastUpdate,
    refresh,
    isCritical,
    needsAttention,
    isOk,
  } = useSpaceWeather({
    latitude: vesselLatitude,
    longitude: vesselLongitude,
    hours,
    refreshInterval,
    onStatusChange: (newStatus) => {
      if (onStatusChange) {
        onStatusChange(newStatus.status);
      }
    },
  });

  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  // Alert on status change
  useEffect(() => {
    if (!status) return;

    if (previousStatus && previousStatus !== status.status) {
      // Status changed

      if (enableAudioAlerts) {
        if (status.status === "RED") {
          playAlert("critical");
        } else if (status.status === "AMBER") {
          playAlert("warning");
        }
      }
    }

    setPreviousStatus(status.status);
  }, [status, previousStatus, enableAudioAlerts]);

  // Loading state
  if (loading && !status) {
    return (
      <div className="dp-monitor loading">
        <div className="spinner"></div>
        <p>Loading space weather data...</p>
      </div>
    );
  }

  // Error state
  if (error && !status) {
    return (
      <div className="dp-monitor error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={refresh} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  if (!status) return null;

  // Status colors
  const statusColor = 
    status.status === "RED" ? "#ef4444" :
      status.status === "AMBER" ? "#f59e0b" :
        "#10b981";

  const statusIcon =
    status.status === "RED" ? "🔴" :
      status.status === "AMBER" ? "🟡" :
        "🟢";

  const gateIcon =
    status.dp_gate === "HOLD" ? "🛑" :
      status.dp_gate === "CAUTION" ? "⚠️" :
        "✅";

  return (
    <div className="dp-monitor" style={{ "--status-color": statusColor } as React.CSSProperties}>
      {/* Header */}
      <div className="dp-monitor-header">
        <div className="vessel-info">
          <h2>🚢 {vesselName}</h2>
          <p className="location">
            {vesselLatitude.toFixed(4)}°, {vesselLongitude.toFixed(4)}°
          </p>
        </div>

        <div className="last-update">
          {lastUpdate && (
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <button onClick={refresh} className="btn-refresh" title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {/* Status Panel */}
      <div className={`status-panel status-${status.status.toLowerCase()}`}>
        <div className="status-main">
          <div className="status-icon">{statusIcon}</div>
          <div className="status-info">
            <h1 className="status-title">{status.status}</h1>
            <div className="dp-gate">
              <span className="gate-icon">{gateIcon}</span>
              <span className="gate-text">DP GATE: {status.dp_gate}</span>
            </div>
          </div>
        </div>

        <div className="status-metrics">
          <div className="metric">
            <div className="metric-label">Kp Index</div>
            <div className="metric-value">{status.kp.toFixed(1)}</div>
            <div className="metric-sub">{status.kp_risk}</div>
          </div>

          <div className="metric">
            <div className="metric-label">PDOP</div>
            <div className="metric-value">{status.worst_pdop.toFixed(1)}</div>
            <div className="metric-sub">{status.pdop_quality}</div>
          </div>

          <div className="metric">
            <div className="metric-label">Source</div>
            <div className="metric-value">{status.data_source}</div>
            <div className="metric-sub">
              {status.analysis_window_hours}h window
            </div>
          </div>
        </div>
      </div>

      {/* Reasons (if any) */}
      {status.reasons.length > 0 && (
        <div className="reasons-panel">
          <h3>⚠️ Reasons for {status.status} Status</h3>
          <ul>
            {status.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="recommendations-panel">
        <h3>📋 Recommendations</h3>
        <ul>
          {status.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* PDOP Chart */}
      {showPDOPChart && status.pdop_timeline && status.pdop_timeline.length > 0 && (
        <div className="pdop-chart-panel">
          <h3>📊 PDOP Timeline ({hours}h)</h3>
          <PDOPChart data={status.pdop_timeline} />
        </div>
      )}

      {/* Data Source Info */}
      <div className="data-source-info">
        <small>
          Data from: {status.data_source} | 
          Updated: {new Date(status.timestamp).toLocaleString()}
        </small>
      </div>
    </div>
  );
}

// ============================================================================
// PDOP Chart Component (Simple SVG)
// ============================================================================

interface PDOPChartProps {
  data: Array<{
    time: string;
    pdop: number;
    satellites: number;
  }>;
}

function PDOPChart({ data }: PDOPChartProps) {
  if (data.length === 0) return null;

  const width = 800;
  const height = 200;
  const padding = 40;

  // Find min/max PDOP
  const pdops = data.map(d => d.pdop);
  const minPDOP = Math.floor(Math.min(...pdops));
  const maxPDOP = Math.ceil(Math.max(...pdops));

  // Scale functions
  const xScale = (i: number) => padding + (i / (data.length - 1)) * (width - 2 * padding);
  const yScale = (pdop: number) => height - padding - ((pdop - minPDOP) / (maxPDOP - minPDOP)) * (height - 2 * padding);

  // Generate path
  const pathData = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.pdop);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Thresholds
  const amber = yScale(4.0);
  const red = yScale(6.0);

  return (
    <div className="pdop-chart">
      <svg width={width} height={height} className="pdop-svg">
        {/* Background zones */}
        <rect x={padding} y={yScale(maxPDOP)} width={width - 2 * padding} height={red - yScale(maxPDOP)} fill="#fef3c7" opacity="0.3" />
        <rect x={padding} y={red} width={width - 2 * padding} height={amber - red} fill="#fed7aa" opacity="0.3" />
        <rect x={padding} y={amber} width={width - 2 * padding} height={yScale(minPDOP) - amber} fill="#dcfce7" opacity="0.3" />

        {/* Grid */}
        <line x1={padding} y1={amber} x2={width - padding} y2={amber} stroke="#f59e0b" strokeDasharray="5,5" strokeWidth="1" />
        <line x1={padding} y1={red} x2={width - padding} y2={red} stroke="#ef4444" strokeDasharray="5,5" strokeWidth="1" />

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#999" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#999" strokeWidth="2" />

        {/* Y-axis labels */}
        <text x={padding - 10} y={yScale(minPDOP)} textAnchor="end" fontSize="12" fill="#666">{minPDOP}</text>
        <text x={padding - 10} y={amber} textAnchor="end" fontSize="12" fill="#f59e0b">4.0</text>
        <text x={padding - 10} y={red} textAnchor="end" fontSize="12" fill="#ef4444">6.0</text>
        <text x={padding - 10} y={yScale(maxPDOP)} textAnchor="end" fontSize="12" fill="#666">{maxPDOP}</text>

        {/* X-axis labels (first, middle, last) */}
        <text x={xScale(0)} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
          {new Date(data[0].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </text>
        <text x={xScale(Math.floor(data.length / 2))} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
          {new Date(data[Math.floor(data.length / 2)].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </text>
        <text x={xScale(data.length - 1)} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
          {new Date(data[data.length - 1].time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </text>

        {/* PDOP line */}
        <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="3" />

        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.pdop)}
            r="4"
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth="2"
          >
            <title>
              {new Date(d.time).toLocaleTimeString()}: PDOP {d.pdop.toFixed(1)}, {d.satellites} sats
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

// ============================================================================
// Audio Alerts
// ============================================================================

function playAlert(type: "warning" | "critical") {
  // Browser Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "critical") {
      // Critical: 3 beeps @ 800Hz
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 800;
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 300);

      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.frequency.value = 800;
        gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc3.start();
        osc3.stop(audioContext.currentTime + 0.2);
      }, 600);
    } else {
      // Warning: single beep @ 600Hz
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.warn("[DPMonitor] Audio alert failed:", error);
    console.warn("[DPMonitor] Audio alert failed:", error);
  }
}

// ============================================================================
// CSS Styles (Inline for demo - move to CSS file in production)
// ============================================================================

const styles = `
.dp-monitor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.dp-monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.vessel-info h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.location {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
}

.btn-refresh, .btn-retry {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-refresh:hover, .btn-retry:hover {
  background: #e5e7eb;
}

.status-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 6px solid var(--status-color);
}

.status-main {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 64px;
}

.status-title {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: var(--status-color);
}

.dp-gate {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 18px;
  color: #4b5563;
}

.gate-icon {
  font-size: 24px;
}

.status-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.metric {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 4px;
}

.metric-sub {
  font-size: 14px;
  color: #9ca3af;
}

.reasons-panel, .recommendations-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reasons-panel h3, .recommendations-panel h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #1f2937;
}

.reasons-panel ul, .recommendations-panel ul {
  margin: 0;
  padding-left: 24px;
}

.reasons-panel li, .recommendations-panel li {
  margin-bottom: 8px;
  color: #4b5563;
  line-height: 1.6;
}

.pdop-chart-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pdop-chart-panel h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #1f2937;
}

.pdop-chart {
  overflow-x: auto;
}

.data-source-info {
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
}

.dp-monitor.loading, .dp-monitor.error {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.status-panel.status-red {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.status-panel.status-amber {
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

.status-panel.status-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}
`;

// Inject styles (in real app, use CSS file)
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// ============================================================================
// Export
// ============================================================================

export default DPOperationsMonitor;
