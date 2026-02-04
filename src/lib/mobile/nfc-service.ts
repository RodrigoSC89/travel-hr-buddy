/**
 * NFC Service for Mobile
 * Handles NFC reading/writing for check-ins, access cards, and crew identification
 */

import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/logger";

export interface NFCTag {
  id: string;
  type: string;
  techTypes?: string[];
  message?: NFCMessage;
}

export interface NFCMessage {
  records: NFCRecord[];
}

export interface NFCRecord {
  type: "text" | "url" | "mime" | "unknown";
  payload: string;
  encoding?: string;
  language?: string;
}

export interface NFCWriteOptions {
  format?: boolean;
  overwrite?: boolean;
}

export type NFCCallback = (tag: NFCTag) => void;
export type NFCErrorCallback = (error: Error) => void;

class NFCService {
  private isNative: boolean;
  private isScanning: boolean = false;
  private scanCallback: NFCCallback | null = null;
  private errorCallback: NFCErrorCallback | null = null;
  private ndefReader: any = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Check if NFC is available on the device
   */
  async isAvailable(): Promise<boolean> {
    // Check for Web NFC API
    if ("NDEFReader" in window) {
      return true;
    }

    // On native, would check Capacitor NFC plugin
    if (this.isNative) {
      // Would use: await NFC.isEnabled()
      return true; // Placeholder - assume available on native
    }

    return false;
  }

  /**
   * Check if NFC is enabled (not just available)
   */
  async isEnabled(): Promise<boolean> {
    const available = await this.isAvailable();
    if (!available) return false;

    // On web, availability means enabled
    if ("NDEFReader" in window) {
      return true;
    }

    // On native, would check: await NFC.isEnabled()
    return true;
  }

  /**
   * Start scanning for NFC tags
   */
  async startScan(
    onTagRead: NFCCallback,
    onError?: NFCErrorCallback
  ): Promise<boolean> {
    if (this.isScanning) {
      logger.warn("[NFC] Already scanning");
      return true;
    }

    this.scanCallback = onTagRead;
    this.errorCallback = onError || null;

    try {
      // Web NFC API
      if ("NDEFReader" in window) {
        const NDEFReader = (window as any).NDEFReader;
        this.ndefReader = new NDEFReader();
        
        await this.ndefReader.scan();
        
        this.ndefReader.addEventListener("reading", ({ message, serialNumber }: any) => {
          const tag = this.parseWebNFCTag(serialNumber, message);
          logger.info("[NFC] Tag read:", tag);
          if (this.scanCallback) {
            this.scanCallback(tag);
          }
        });

        this.ndefReader.addEventListener("readingerror", () => {
          const error = new Error("Erro ao ler tag NFC");
          logger.error("[NFC] Read error");
          if (this.errorCallback) {
            this.errorCallback(error);
          }
        });

        this.isScanning = true;
        logger.info("[NFC] Scan started (Web NFC)");
        return true;
      }

      // Native NFC (Capacitor plugin)
      if (this.isNative) {
        // Would use: await NFC.startScan()
        // NFC.addListener('tagRead', (tag) => { ... })
        this.isScanning = true;
        logger.info("[NFC] Scan started (Native)");
        return true;
      }

      throw new Error("NFC não disponível neste dispositivo");
    } catch (error) {
      logger.error("[NFC] Failed to start scan:", error);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
      return false;
    }
  }

  /**
   * Stop scanning for NFC tags
   */
  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    if (this.ndefReader) {
      // Web NFC doesn't have explicit stop, just remove references
      this.ndefReader = null;
    }

    // Native: await NFC.stopScan()

    this.isScanning = false;
    this.scanCallback = null;
    this.errorCallback = null;
    logger.info("[NFC] Scan stopped");
  }

  /**
   * Write data to an NFC tag
   */
  async writeTag(
    data: NFCRecord[],
    options: NFCWriteOptions = {}
  ): Promise<boolean> {
    try {
      // Web NFC API
      if ("NDEFReader" in window) {
        const NDEFReader = (window as any).NDEFReader;
        const writer = new NDEFReader();
        
        const records = data.map((record) => {
          if (record.type === "text") {
            return { recordType: "text", data: record.payload };
          } else if (record.type === "url") {
            return { recordType: "url", data: record.payload };
          } else {
            return { recordType: "mime", mediaType: "application/json", data: record.payload };
          }
        });

        await writer.write({ records });
        logger.info("[NFC] Tag written successfully");
        return true;
      }

      // Native: await NFC.write({ records: [...] })
      throw new Error("NFC write não disponível");
    } catch (error) {
      logger.error("[NFC] Write failed:", error);
      throw error;
    }
  }

  /**
   * Parse Web NFC tag to our interface
   */
  private parseWebNFCTag(serialNumber: string, message: any): NFCTag {
    const records: NFCRecord[] = [];

    if (message && message.records) {
      for (const record of message.records) {
        const decoder = new TextDecoder(record.encoding || "utf-8");
        let payload = "";
        
        if (record.data) {
          payload = decoder.decode(record.data);
        }

        records.push({
          type: record.recordType === "text" ? "text" : 
                record.recordType === "url" ? "url" :
                record.recordType?.startsWith("mime") ? "mime" : "unknown",
          payload,
          encoding: record.encoding,
          language: record.lang
        });
      }
    }

    return {
      id: serialNumber,
      type: "NDEF",
      message: records.length > 0 ? { records } : undefined
    };
  }

  /**
   * Create a crew check-in record
   */
  createCrewCheckInRecord(crewId: string, vesselId: string): NFCRecord[] {
    const payload = JSON.stringify({
      type: "crew_checkin",
      crewId,
      vesselId,
      timestamp: new Date().toISOString(),
      app: "nautilus-one"
    });

    return [
      {
        type: "mime",
        payload
      }
    ];
  }

  /**
   * Create an access card record
   */
  createAccessCardRecord(
    userId: string,
    accessLevel: string,
    validUntil: Date
  ): NFCRecord[] {
    const payload = JSON.stringify({
      type: "access_card",
      userId,
      accessLevel,
      validUntil: validUntil.toISOString(),
      issuer: "nautilus-one"
    });

    return [
      {
        type: "mime",
        payload
      }
    ];
  }

  /**
   * Parse a check-in record from NFC tag
   */
  parseCheckInRecord(tag: NFCTag): {
    type: string;
    crewId?: string;
    vesselId?: string;
    userId?: string;
    accessLevel?: string;
    timestamp?: string;
  } | null {
    if (!tag.message || tag.message.records.length === 0) {
      return null;
    }

    try {
      const record = tag.message.records[0];
      if (record.type === "mime") {
        return JSON.parse(record.payload);
      }
    } catch (error) {
      logger.error("[NFC] Failed to parse check-in record:", error);
    }

    return null;
  }

  /**
   * Check if currently scanning
   */
  get scanning(): boolean {
    return this.isScanning;
  }
}

export const nfcService = new NFCService();
export default nfcService;
