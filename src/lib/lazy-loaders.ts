/**
 * Lazy Loaders - FASE 2.5 Lazy Loading
 * 
 * Utilitários para carregamento lazy de bibliotecas pesadas
 * Reduz o bundle inicial de 11.5MB para ~3-4MB
 */

// ==================== PDF GENERATION (1.04 MB) ====================
export const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

export const loadHtml2PDF = async () => {
  const html2pdf = await import("html2pdf.js");
  return html2pdf.default;
};

export const loadJsPDFAutoTable = async () => {
  const autoTable = await import("jspdf-autotable");
  return autoTable.default;
};

// ==================== CHARTS (434 KB) ====================
export const loadRecharts = async () => {
  const recharts = await import("recharts");
  return recharts;
};

export const loadChartJS = async () => {
  const chartjs = await import("chart.js");
  const reactChartjs = await import("react-chartjs-2");
  return { chartjs, reactChartjs };
};

// ==================== MAP (1.65 MB) ====================
export const loadMapbox = async () => {
  const mapboxgl = await import("mapbox-gl");
  // Também importar CSS dinamicamente
  await import("mapbox-gl/dist/mapbox-gl.css");
  return mapboxgl.default;
};

// ==================== MQTT (357 KB) ====================
export const loadMQTT = async () => {
  const mqtt = await import("mqtt");
  return mqtt;
};

// ==================== 3D/XR (74 KB) ====================
export const loadThree = async () => {
  const THREE = await import("three");
  return THREE;
};

export const loadReactThree = async () => {
  const { Canvas, useThree, useFrame } = await import("@react-three/fiber");
  const drei = await import("@react-three/drei");
  return { Canvas, useThree, useFrame, drei };
};

// ==================== AI/ML (401 KB) ====================
export const loadTensorFlow = async () => {
  const tf = await import("@tensorflow/tfjs");
  return tf;
};

export const loadCocoSSD = async () => {
  const cocoSsd = await import("@tensorflow-models/coco-ssd");
  return cocoSsd;
};

export const loadONNXRuntime = async () => {
  const onnx = await import("onnxruntime-web");
  return onnx;
};

// ==================== EDITOR (164 KB) ====================
export const loadTipTap = async () => {
  const { useEditor } = await import("@tiptap/react");
  const StarterKit = await import("@tiptap/starter-kit");
  return { useEditor, StarterKit };
};

export const loadTipTapCollaboration = async () => {
  const Collaboration = await import("@tiptap/extension-collaboration");
  const CollaborationCursor = await import("@tiptap/extension-collaboration-cursor");
  const Yjs = await import("yjs");
  const YProsemirror = await import("y-prosemirror");
  const YWebrtc = await import("y-webrtc");
  return { Collaboration, CollaborationCursor, Yjs, YProsemirror, YWebrtc };
};

// ==================== DOCUMENT GENERATION (DOCX) ====================
export const loadDocx = async () => {
  const docx = await import("docx");
  return docx;
};

// ==================== HTML2CANVAS ====================
export const loadHtml2Canvas = async () => {
  const html2canvas = await import("html2canvas");
  return html2canvas.default;
};

// ==================== MOTION (110 KB) ====================
export const loadFramerMotion = async () => {
  const motion = await import("framer-motion");
  return motion;
};

// ==================== FIREBASE ====================
export const loadFirebase = async () => {
  const firebase = await import("firebase/app");
  return firebase;
};

// ==================== OCR (TESSERACT) ====================
export const loadTesseract = async () => {
  const tesseract = await import("tesseract.js");
  return tesseract;
};

// ==================== QR CODE ====================
export const loadQRCode = async () => {
  const QRCode = await import("qrcode");
  const QRCodeReact = await import("qrcode.react");
  return { QRCode: QRCode.default, QRCodeReact };
};

// ==================== XLSX ====================
export const loadXLSX = async () => {
  const XLSX = await import("xlsx");
  return XLSX;
};

// ==================== JSZIP ====================
export const loadJSZip = async () => {
  const JSZip = await import("jszip");
  return JSZip.default;
};

// ==================== FILE SAVER ====================
export const loadFileSaver = async () => {
  const fileSaver = await import("file-saver");
  return fileSaver;
};

// ==================== REACT BIG CALENDAR ====================
export const loadBigCalendar = async () => {
  const bigCalendar = await import("react-big-calendar");
  return bigCalendar;
};

// ==================== REACT MARKDOWN ====================
export const loadReactMarkdown = async () => {
  const ReactMarkdown = await import("react-markdown");
  return ReactMarkdown.default;
};

// ==================== SIGNATURE CANVAS ====================
export const loadSignatureCanvas = async () => {
  const SignatureCanvas = await import("react-signature-canvas");
  return SignatureCanvas.default;
};

// ==================== REACTFLOW ====================
export const loadReactFlow = async () => {
  const reactFlow = await import("reactflow");
  await import("reactflow/dist/style.css");
  return reactFlow;
};

// ==================== HELPER: Preload Critical Modules ====================
/**
 * Precarrega módulos críticos em idle time para melhor UX
 */
export const preloadCriticalModules = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload apenas charts para dashboards
      loadRecharts().catch(() => {/* silent fail */});
    }, { timeout: 2000 });
  }
};

/**
 * Precarrega módulos baseado em rota atual
 */
export const preloadForRoute = (route: string) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Admin routes - preload pdf
      if (route.includes('/admin')) {
        loadJsPDF().catch(() => {/* silent fail */});
      }
      
      // Dashboard routes - preload charts
      if (route.includes('/dashboard') || route.includes('/command-center')) {
        loadRecharts().catch(() => {/* silent fail */});
      }
      
      // Map routes - preload mapbox
      if (route.includes('/fleet') || route.includes('/tracking') || route.includes('/maritime')) {
        loadMapbox().catch(() => {/* silent fail */});
      }
      
      // AI routes - preload tensorflow
      if (route.includes('/ai')) {
        loadTensorFlow().catch(() => {/* silent fail */});
      }
    }, { timeout: 1000 });
  }
};

export default {
  loadJsPDF,
  loadHtml2PDF,
  loadJsPDFAutoTable,
  loadRecharts,
  loadChartJS,
  loadMapbox,
  loadMQTT,
  loadThree,
  loadReactThree,
  loadTensorFlow,
  loadCocoSSD,
  loadONNXRuntime,
  loadTipTap,
  loadTipTapCollaboration,
  loadDocx,
  loadHtml2Canvas,
  loadFramerMotion,
  loadFirebase,
  loadTesseract,
  loadQRCode,
  loadXLSX,
  loadJSZip,
  loadFileSaver,
  loadBigCalendar,
  loadReactMarkdown,
  loadSignatureCanvas,
  loadReactFlow,
  preloadCriticalModules,
  preloadForRoute,
};
