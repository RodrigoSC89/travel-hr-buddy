/**
 * Script para converter imports pesados para lazy loading
 * Executa: node fix-heavy-imports.js
 */
import { readFileSync, writeFileSync } from 'fs';

const files = [
  'src/components/forecast/ForecastAIInsights.tsx',
  'src/ai/nautilus-inference.ts',
  'src/xr/simulation/Scenario3D.tsx',
  'src/ai/vision/copilotVision.ts',
  'src/services/deepRiskAIService.ts',
  'src/modules/esg-dashboard/services/ESGReportExporter.ts',
  'src/modules/compliance/compliance-reports/index.tsx',
  'src/modules/ai-vision-core/services/aiVisionService.ts',
  'src/pages/admin/satellite-tracker.tsx',
  'src/lib/AI/forecast-engine.ts',
  'src/lib/AI/maintenance-orchestrator.ts',
  'src/components/dp/DPSyncDashboard.tsx',
  'src/components/projects/project-timeline.tsx',
  'src/components/forecast/ForecastAI.tsx',
  'src/components/dp-intelligence/DPAIAnalyzer.tsx'
];

const replacements = {
  'import * as ort from "onnxruntime-web";': `let ort: any = null;
const loadORT = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
};`,
  
  'import * as XLSX from "xlsx";': `let XLSX: any = null;
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
};`,
  
  'import * as tf from "@tensorflow/tfjs";': `let tf: any = null;
const loadTF = async () => {
  if (!tf) {
    tf = await import("@tensorflow/tfjs");
  }
  return tf;
};`,
  
  'import * as cocoSsd from "@tensorflow-models/coco-ssd";': `let cocoSsd: any = null;
const loadCocoSsd = async () => {
  if (!cocoSsd) {
    cocoSsd = await import("@tensorflow-models/coco-ssd");
  }
  return cocoSsd;
};`,
  
  'import * as THREE from "three";': `let THREE: any = null;
const loadTHREE = async () => {
  if (!THREE) {
    THREE = await import("three");
  }
  return THREE;
};`
};

let count = 0;
files.forEach(file => {
  try {
    let content = readFileSync(file, 'utf8');
    let modified = false;
    
    for (const [oldImport, newImport] of Object.entries(replacements)) {
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        modified = true;
        count++;
        console.log(`✓ ${file}: Convertido ${oldImport.match(/from "(.*?)"/)[1]}`);
      }
    }
    
    if (modified) {
      writeFileSync(file, content, 'utf8');
    }
  } catch (err) {
    console.log(`⚠ ${file}: ${err.message}`);
  }
});

console.log(`\n✅ ${count} imports convertidos para lazy loading!`);
