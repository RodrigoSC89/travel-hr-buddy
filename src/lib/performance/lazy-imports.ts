/**
 * Lazy Import Utilities for Heavy Dependencies
 * Reduces initial bundle size by loading heavy libraries on demand
 */

// Heavy library loaders - only import when needed

/**
 * Lazy load Three.js (500KB+)
 */
export const loadThreeJS = async () => {
  const THREE = await import("three");
  return THREE;
};

/**
 * Lazy load React Three Fiber
 */
export const loadReactThreeFiber = async () => {
  const [fiber, drei] = await Promise.all([
    import("@react-three/fiber"),
    import("@react-three/drei"),
  ]);
  return { fiber, drei };
};

/**
 * Lazy load TensorFlow.js (800KB+)
 */
export const loadTensorFlow = async () => {
  const tf = await import("@tensorflow/tfjs");
  return tf;
};

/**
 * Lazy load TensorFlow COCO-SSD model
 */
export const loadCocoSsd = async () => {
  const [tf, cocoSsd] = await Promise.all([
    import("@tensorflow/tfjs"),
    import("@tensorflow-models/coco-ssd"),
  ]);
  return { tf, cocoSsd };
};

/**
 * Lazy load Mapbox GL (350KB+)
 */
export const loadMapboxGL = async () => {
  const mapboxgl = await import("mapbox-gl");
  return mapboxgl.default;
};

/**
 * Lazy load Chart.js (200KB+)
 */
export const loadChartJS = async () => {
  const { Chart, registerables } = await import("chart.js");
  Chart.register(...registerables);
  return Chart;
};

/**
 * Lazy load PDF generation libraries (250KB+)
 */
export const loadPDFLibraries = async () => {
  const [jsPDF, html2canvas] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  return { jsPDF: jsPDF.default, html2canvas: html2canvas.default };
};

/**
 * Lazy load Excel library (150KB+)
 */
export const loadXLSX = async () => {
  const XLSX = await import("xlsx");
  return XLSX;
};

/**
 * Lazy load Firebase (300KB+)
 */
export const loadFirebase = async () => {
  const firebase = await import("firebase/app");
  return firebase;
};

/**
 * Lazy load Tesseract OCR (500KB+)
 */
export const loadTesseract = async () => {
  const Tesseract = await import("tesseract.js");
  return Tesseract;
};

/**
 * Lazy load ONNX Runtime (400KB+)
 */
export const loadONNXRuntime = async () => {
  const ort = await import("onnxruntime-web");
  return ort;
};

/**
 * Lazy load QRCode libraries
 */
export const loadQRCode = async () => {
  const QRCode = await import("qrcode");
  return QRCode;
};

/**
 * Lazy load Recharts (100KB+)
 */
export const loadRecharts = async () => {
  const recharts = await import("recharts");
  return recharts;
};

/**
 * Lazy load Framer Motion (80KB+)
 */
export const loadFramerMotion = async () => {
  const motion = await import("framer-motion");
  return motion;
};

/**
 * Lazy load ReactFlow (150KB+)
 */
export const loadReactFlow = async () => {
  const reactflow = await import("reactflow");
  return reactflow;
};

/**
 * Preload critical libraries in background after initial render
 */
export const preloadCriticalLibraries = () => {
  // Start preloading after 3 seconds of idle time
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => {
      // Preload commonly used libraries
      loadMapboxGL().catch(() => {});
      loadChartJS().catch(() => {});
    }, { timeout: 5000 });
  }
};

/**
 * Bundle size estimates for reference
 */
export const BUNDLE_SIZE_ESTIMATES = {
  "three": "500KB",
  "@react-three/fiber": "200KB",
  "@react-three/drei": "150KB",
  "@tensorflow/tfjs": "800KB",
  "@tensorflow-models/coco-ssd": "100KB",
  "mapbox-gl": "350KB",
  "chart.js": "200KB",
  "recharts": "100KB",
  "jspdf": "150KB",
  "html2canvas": "100KB",
  "xlsx": "150KB",
  "firebase": "300KB",
  "tesseract.js": "500KB",
  "onnxruntime-web": "400KB",
  "framer-motion": "80KB",
  "reactflow": "150KB",
} as const;
