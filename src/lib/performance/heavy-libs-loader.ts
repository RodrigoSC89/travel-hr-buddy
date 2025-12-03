/**
 * Heavy Libraries Loader
 * Centralized lazy loading for heavy dependencies to reduce initial bundle
 * 
 * Estimated savings:
 * - Three.js: ~500KB
 * - Mapbox GL: ~350KB
 * - Firebase: ~300KB
 * - TensorFlow.js: ~800KB
 * - Tesseract.js: ~500KB
 * - XLSX: ~400KB
 * - jsPDF: ~300KB
 * - Chart.js: ~200KB
 * - Recharts: ~300KB
 * - ReactFlow: ~250KB
 * 
 * Total potential savings: ~3.9MB in initial bundle
 */

// Cache for loaded libraries
const loadedLibs: Record<string, any> = {};

/**
 * Generic loader with caching
 */
async function loadLib<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!loadedLibs[key]) {
    loadedLibs[key] = await loader();
  }
  return loadedLibs[key] as T;
}

// ========== 3D / Graphics ==========

export const loadThree = () => loadLib("three", async () => {
  const THREE = await import("three");
  return THREE;
});

export const loadThreeOrbitControls = () => loadLib("three-orbit", async () => {
  const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
  return OrbitControls;
});

// ========== Maps ==========

export const loadMapboxGL = () => loadLib("mapbox-gl", async () => {
  const mapboxgl = await import("mapbox-gl");
  await import("mapbox-gl/dist/mapbox-gl.css");
  return mapboxgl.default || mapboxgl;
});

// ========== AI / ML ==========

export const loadTensorFlow = () => loadLib("tensorflow", async () => {
  const tf = await import("@tensorflow/tfjs");
  return tf;
});

export const loadCocoSSD = () => loadLib("coco-ssd", async () => {
  const cocoSsd = await import("@tensorflow-models/coco-ssd");
  return cocoSsd;
});

export const loadTesseract = () => loadLib("tesseract", async () => {
  const Tesseract = await import("tesseract.js");
  return Tesseract;
});

// ========== Documents / Export ==========

export const loadXLSX = () => loadLib("xlsx", async () => {
  const XLSX = await import("xlsx");
  return XLSX;
});

export const loadJsPDF = () => loadLib("jspdf", async () => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
});

export const loadDocx = () => loadLib("docx", async () => {
  const docx = await import("docx");
  return docx;
});

// ========== Charts ==========

export const loadChartJS = () => loadLib("chartjs", async () => {
  const ChartJS = await import("chart.js/auto");
  return ChartJS;
});

export const loadRecharts = () => loadLib("recharts", async () => {
  const recharts = await import("recharts");
  return recharts;
});

// ========== Other Heavy Libs ==========

export const loadReactFlow = () => loadLib("reactflow", async () => {
  const reactflow = await import("reactflow");
  await import("reactflow/dist/style.css");
  return reactflow;
});

export const loadFramerMotion = () => loadLib("framer-motion", async () => {
  const motion = await import("framer-motion");
  return motion;
});

export const loadFirebase = () => loadLib("firebase", async () => {
  const firebase = await import("firebase/app");
  return firebase;
});

export const loadONNX = () => loadLib("onnx", async () => {
  const ort = await import("onnxruntime-web");
  return ort;
});

// ========== Utility ==========

/**
 * Check if a library is already loaded
 */
export const isLibLoaded = (key: string): boolean => !!loadedLibs[key];

/**
 * Preload libraries in background (useful for anticipated usage)
 */
export const preloadLibs = async (libs: Array<() => Promise<any>>): Promise<void> => {
  await Promise.allSettled(libs.map(loader => loader()));
};

/**
 * Get estimated bundle savings
 */
export const getBundleSavingsEstimate = (): Record<string, string> => ({
  "three": "~500KB",
  "mapbox-gl": "~350KB",
  "firebase": "~300KB",
  "tensorflow": "~800KB",
  "tesseract": "~500KB",
  "xlsx": "~400KB",
  "jspdf": "~300KB",
  "chartjs": "~200KB",
  "recharts": "~300KB",
  "reactflow": "~250KB",
  "total": "~3.9MB"
});
