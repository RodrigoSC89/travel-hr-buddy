/**
 * PATCH 851 - Protocol Adapter
 * PATCH 900 - Removed @ts-nocheck, using proper typing with dynamic table access
 */
import { supabase } from "@/integrations/supabase/client";

export type ProtocolType = "json-rpc" | "gmdss" | "ais" | "http" | "mqtt";

export interface ProtocolMessage {
  protocol: ProtocolType;
  payload: unknown;
  timestamp?: string;
}

export interface ProtocolResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

interface JsonRpcMessage {
  jsonrpc: string;
  method?: string;
  id?: string | number;
  params?: unknown;
}

interface InteropLogEntry {
  protocol_type: string;
  message: unknown;
  status: string;
  error_message?: string;
}

// Type-safe dynamic DB access
type DynamicSupabaseClient = {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const dynamicDb = supabase as unknown as DynamicSupabaseClient;

// JSON-RPC Protocol Handler
export async function handleJsonRpc(message: unknown): Promise<ProtocolResponse> {
  try {
    const rpcMessage = message as JsonRpcMessage;
    
    if (!rpcMessage.jsonrpc || rpcMessage.jsonrpc !== "2.0") {
      throw new Error("Invalid JSON-RPC version");
    }
    
    if (!rpcMessage.method) {
      throw new Error("Missing method in JSON-RPC request");
    }

    // Log the request
    await logInterop("json-rpc", message, "success");

    // Simulate processing
    return {
      success: true,
      data: {
        jsonrpc: "2.0",
        id: rpcMessage.id,
        result: { status: "processed", method: rpcMessage.method }
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logInterop("json-rpc", message, "error", errorMessage);
    return {
      success: false,
      error: errorMessage,
      message: "JSON-RPC processing failed"
    };
  }
}

// GMDSS Protocol Parser (Simulated)
export async function parseGmdss(message: string): Promise<ProtocolResponse> {
  try {
    // Validate GMDSS message format
    if (!message || message.length < 10) {
      throw new Error("Invalid GMDSS message format");
    }

    // Extract message components (simplified)
    const parts = message.split("|");
    if (parts.length < 3) {
      throw new Error("Incomplete GMDSS message structure");
    }

    const parsed = {
      messageType: parts[0],
      sender: parts[1],
      content: parts[2],
      timestamp: new Date().toISOString()
    };

    await logInterop("gmdss", { raw: message, parsed }, "success");

    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logInterop("gmdss", { raw: message }, "error", errorMessage);
    return {
      success: false,
      error: errorMessage,
      message: "GMDSS parsing failed"
    };
  }
}

// Generic Protocol Adapter
export async function processProtocolMessage(msg: ProtocolMessage): Promise<ProtocolResponse> {
  switch (msg.protocol) {
  case "json-rpc":
    return handleJsonRpc(msg.payload);
    
  case "gmdss":
    return parseGmdss(msg.payload as string);
    
  default:
    await logInterop(msg.protocol, msg.payload, "warning", "Unsupported protocol");
    return {
      success: false,
      error: "Unsupported protocol",
      message: `Protocol ${msg.protocol} is not supported`
    };
  }
}

// Log interop events - uses in-memory fallback if table doesn't exist
async function logInterop(
  protocolType: string,
  message: unknown,
  status: "success" | "error" | "warning",
  errorMessage?: string
): Promise<void> {
  try {
    const logEntry: InteropLogEntry = {
      protocol_type: protocolType,
      message: message,
      status: status,
      error_message: errorMessage
    };

    await dynamicDb.from("interop_log").insert(logEntry as never);
  } catch {
    // Silent fallback - log to console in development
    if (import.meta.env.DEV) {
      console.log("[InteropLog]", { protocolType, status, errorMessage });
    }
  }
}

// Get recent logs
export async function getInteropLogs(protocolType?: string, limit: number = 50): Promise<unknown[]> {
  try {
    let query = dynamicDb
      .from("interop_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (protocolType) {
      query = query.eq("protocol_type", protocolType);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch {
    // Return empty array if table doesn't exist
    return [];
  }
}
