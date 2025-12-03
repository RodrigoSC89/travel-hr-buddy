/**
 * Bundle Size Analyzer Utilities
 * Helps identify and optimize large dependencies
 */

interface DependencyInfo {
  name: string;
  estimatedSize: string;
  category: "critical" | "heavy" | "medium" | "light";
  lazyLoadable: boolean;
  usedIn: string[];
  recommendation: string;
}

/**
 * Known heavy dependencies and their optimization strategies
 */
export const HEAVY_DEPENDENCIES: DependencyInfo[] = [
  {
    name: "@tensorflow/tfjs",
    estimatedSize: "800KB",
    category: "heavy",
    lazyLoadable: true,
    usedIn: ["AI Detection", "Object Recognition"],
    recommendation: "Lazy load only when AI features are accessed",
  },
  {
    name: "three",
    estimatedSize: "500KB",
    category: "heavy",
    lazyLoadable: true,
    usedIn: ["3D Visualization", "Orbit View"],
    recommendation: "Lazy load for 3D views only",
  },
  {
    name: "mapbox-gl",
    estimatedSize: "350KB",
    category: "heavy",
    lazyLoadable: true,
    usedIn: ["Maps", "Fleet Tracking", "Weather"],
    recommendation: "Lazy load, consider Leaflet for lighter maps",
  },
  {
    name: "firebase",
    estimatedSize: "300KB",
    category: "heavy",
    lazyLoadable: true,
    usedIn: ["Push Notifications", "Analytics"],
    recommendation: "Import only used modules (messaging, analytics)",
  },
  {
    name: "tesseract.js",
    estimatedSize: "500KB",
    category: "heavy",
    lazyLoadable: true,
    usedIn: ["OCR", "Document Scanning"],
    recommendation: "Lazy load only when OCR is needed",
  },
  {
    name: "xlsx",
    estimatedSize: "150KB",
    category: "medium",
    lazyLoadable: true,
    usedIn: ["Excel Export", "Data Import"],
    recommendation: "Lazy load on export/import actions",
  },
  {
    name: "jspdf",
    estimatedSize: "150KB",
    category: "medium",
    lazyLoadable: true,
    usedIn: ["PDF Generation", "Reports"],
    recommendation: "Lazy load on PDF generation",
  },
  {
    name: "chart.js",
    estimatedSize: "200KB",
    category: "medium",
    lazyLoadable: true,
    usedIn: ["Charts", "Analytics"],
    recommendation: "Consider removing - recharts already installed",
  },
  {
    name: "recharts",
    estimatedSize: "100KB",
    category: "medium",
    lazyLoadable: true,
    usedIn: ["Charts", "Dashboards"],
    recommendation: "Keep as primary chart library",
  },
  {
    name: "framer-motion",
    estimatedSize: "80KB",
    category: "medium",
    lazyLoadable: false,
    usedIn: ["Animations", "Transitions"],
    recommendation: "Keep - widely used for UX",
  },
  {
    name: "reactflow",
    estimatedSize: "150KB",
    category: "medium",
    lazyLoadable: true,
    usedIn: ["Workflow Editor", "Node Diagrams"],
    recommendation: "Lazy load for workflow pages only",
  },
  {
    name: "@supabase/supabase-js",
    estimatedSize: "150KB",
    category: "critical",
    lazyLoadable: false,
    usedIn: ["Database", "Auth", "Storage"],
    recommendation: "Keep - core dependency",
  },
  {
    name: "@tanstack/react-query",
    estimatedSize: "40KB",
    category: "light",
    lazyLoadable: false,
    usedIn: ["Data Fetching", "Caching"],
    recommendation: "Keep - essential for data management",
  },
];

/**
 * Get optimization recommendations
 */
export function getBundleOptimizationRecommendations(): string[] {
  return [
    "1. Remove chart.js - using recharts already (saves ~200KB)",
    "2. Lazy load Three.js/React Three Fiber (saves ~700KB initial)",
    "3. Lazy load TensorFlow.js (saves ~800KB initial)",
    "4. Lazy load Mapbox GL (saves ~350KB initial)",
    "5. Lazy load PDF/Excel libraries on demand (saves ~300KB initial)",
    "6. Use Firebase modular imports (saves ~150KB)",
    "7. Lazy load Tesseract.js (saves ~500KB initial)",
    "8. Consider removing onnxruntime-web if not essential (saves ~400KB)",
    "9. Split code by route using React.lazy (already implemented)",
    "10. Enable tree-shaking in Vite config",
  ];
}

/**
 * Calculate potential savings
 */
export function calculatePotentialSavings(): {
  total: string;
  breakdown: { action: string; savings: string }[];
} {
  return {
    total: "~3.5MB",
    breakdown: [
      { action: "Lazy load TensorFlow", savings: "800KB" },
      { action: "Lazy load Three.js", savings: "700KB" },
      { action: "Lazy load Tesseract", savings: "500KB" },
      { action: "Lazy load ONNX Runtime", savings: "400KB" },
      { action: "Lazy load Mapbox GL", savings: "350KB" },
      { action: "Remove duplicate chart.js", savings: "200KB" },
      { action: "Lazy load Firebase", savings: "300KB" },
      { action: "Lazy load PDF/Excel", savings: "300KB" },
    ],
  };
}

/**
 * Get critical path dependencies (must be in initial bundle)
 */
export function getCriticalDependencies(): string[] {
  return [
    "react",
    "react-dom",
    "react-router-dom",
    "@supabase/supabase-js",
    "@tanstack/react-query",
    "tailwind-merge",
    "clsx",
    "lucide-react",
    "sonner",
  ];
}

/**
 * Log bundle analysis to console
 */
export function logBundleAnalysis(): void {
  console.group("📦 Bundle Size Analysis");
  
  console.log("\n🔴 Heavy Dependencies (should lazy load):");
  HEAVY_DEPENDENCIES
    .filter(d => d.category === "heavy")
    .forEach(d => console.log(`  - ${d.name}: ${d.estimatedSize}`));
  
  console.log("\n🟡 Medium Dependencies:");
  HEAVY_DEPENDENCIES
    .filter(d => d.category === "medium")
    .forEach(d => console.log(`  - ${d.name}: ${d.estimatedSize}`));
  
  console.log("\n✅ Recommendations:");
  getBundleOptimizationRecommendations().forEach(r => console.log(`  ${r}`));
  
  const savings = calculatePotentialSavings();
  console.log(`\n💰 Potential Savings: ${savings.total}`);
  
  console.groupEnd();
}
