/**
 * Shared system modules data
 * Used across dashboard components
 */

import {
  Network,
  Brain,
  Layers,
  Cpu,
  Target,
  Radio,
} from "lucide-react";

export const systemModules = [
  {
    id: "patch-216",
    name: "Context Mesh Core",
    description: "Sistema de malha de contexto distribuído para sincronização em tempo real",
    icon: Network,
    status: "operational",
    uptime: 99.8,
    features: ["Pub/Sub Architecture", "Real-time State Sync", "Local Cache", "Supabase Persistence"],
    metrics: { events: "2.4M", latency: "< 100ms", nodes: "156" }
  },
  {
    id: "patch-221",
    name: "Cognitive Clone Core",
    description: "Clonagem cognitiva de instâncias IA com contexto parcial/completo",
    icon: Brain,
    status: "operational",
    uptime: 98.5,
    features: ["Instance Cloning", "Context Snapshot", "Remote Dispatch", "Clone Registry"],
    metrics: { clones: "24", avgCloneTime: "350ms", contextSize: "3.2MB" }
  },
  {
    id: "patch-222",
    name: "Adaptive UI Engine",
    description: "Motor de reconfiguração adaptativa de interface por contexto",
    icon: Layers,
    status: "operational",
    uptime: 99.2,
    features: ["Mobile/Desktop/Mission Profiles", "Network Optimization", "Conditional Loading", "Hot Reload Config"],
    metrics: { profiles: "3", networkSaved: "42%", loadTime: "< 2s" }
  },
  {
    id: "patch-223",
    name: "Edge AI Ops Core",
    description: "IA embarcada operando localmente via WebGPU/WASM",
    icon: Cpu,
    status: "operational",
    uptime: 97.8,
    features: ["Local Inference", "WebGPU Acceleration", "ONNX Runtime", "Offline Capability"],
    metrics: { inferenceTime: "< 100ms", modelSize: "87MB", gpuUsage: "78%" }
  },
  {
    id: "patch-227",
    name: "Decision Simulator",
    description: "Simulador de decisões estratégicas com IA",
    icon: Target,
    status: "operational",
    uptime: 98.3,
    features: ["Scenario Planning", "Risk Analysis", "Outcome Prediction", "Strategy Optimization"],
    metrics: { scenarios: "142", accuracy: "94%", decisions: "1.2K" }
  },
  {
    id: "patch-226",
    name: "Multi-Protocol Bridge",
    description: "Ponte universal entre protocolos (MQTT, HTTP, WebSocket, gRPC)",
    icon: Radio,
    status: "operational",
    uptime: 99.6,
    features: ["Protocol Translation", "Message Queue", "Real-time Sync", "Bidirectional Flow"],
    metrics: { protocols: "4", throughput: "10K/s", latency: "< 50ms" }
  },
] as const;

export const moduleStats = {
  total: systemModules.length,
  operational: systemModules.filter(m => m.status === "operational").length,
  avgUptime: Number((systemModules.reduce((sum, m) => sum + m.uptime, 0) / systemModules.length).toFixed(1)),
  performance: "A+"
} as const;
