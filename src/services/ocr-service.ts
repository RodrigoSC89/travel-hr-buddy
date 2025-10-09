import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  blocks?: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(language: string = "por+eng"): Promise<void> {
    if (this.worker) {
      await this.terminate();
    }

    this.worker = await Tesseract.createWorker(language, 1, {
      logger: (m) => console.log("OCR:", m),
    });
  }

  async processImage(
    imageSource: string | File | Blob,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    const startTime = Date.now();

    if (!this.worker) {
      await this.initialize();
    }

    const { data } = await this.worker!.recognize(imageSource);

    const processingTime = Date.now() - startTime;

    // Extract blocks with bounding boxes
    const blocks: OCRBlock[] = data.blocks?.map(block => ({
      text: block.text,
      confidence: block.confidence,
      bbox: block.bbox,
    })) || [];

    return {
      text: data.text,
      confidence: data.confidence,
      language: "por+eng",
      processingTime,
      blocks,
    };
  }

  async processBatch(
    images: (string | File | Blob)[],
    onProgress?: (currentIndex: number, total: number, itemProgress: OCRProgress) => void
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const result = await this.processImage(images[i], (progress) => {
        if (onProgress) {
          onProgress(i, images.length, progress);
        }
      });
      results.push(result);
    }

    return results;
  }

  async extractFormFields(imageSource: string | File | Blob): Promise<Map<string, string>> {
    const result = await this.processImage(imageSource);
    const fields = new Map<string, string>();

    // Parse text to extract form fields (basic implementation)
    const lines = result.text.split("\n");
    
    for (const line of lines) {
      // Look for key-value patterns like "Field Name: Value"
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        fields.set(key.trim(), value.trim());
      }
    }

    return fields;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Enhance image for better OCR results
  static preprocessImage(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      // Increase contrast
      const contrast = (gray - 128) * 1.5 + 128;
      const pixel = Math.max(0, Math.min(255, contrast));
      
      data[i] = pixel;     // R
      data[i + 1] = pixel; // G
      data[i + 2] = pixel; // B
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

// Singleton instance
let ocrServiceInstance: OCRService | null = null;

export const getOCRService = (): OCRService => {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OCRService();
  }
  return ocrServiceInstance;
};
