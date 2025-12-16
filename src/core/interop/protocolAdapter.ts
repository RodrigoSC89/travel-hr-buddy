// @ts-nocheck
/**
 * PATCH 226 - Protocol Adapter
 * TODO PATCH 659: TypeScript fixes deferred (interop_log table schema missing)
 * Interoperability adapter for input/output with external systems via multiple protocols
 * Supports: JSON-RPC 2.0, GraphQL, AIS/GMDSS (simulated), NATO STANAG (simulated)
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Protocol types
export type ProtocolType = "json-rpc" | "graphql" | "ais" | "gmdss" | "nato-stanag";
export type Direction = "inbound" | "outbound";
export type ValidationStatus = "valid" | "invalid" | "pending" | "error";
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed" | "rejected";

// JSON-RPC 2.0 Interfaces
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id: string | number;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

// GraphQL Interfaces
export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

// AIS/GMDSS Message (Simulated)
export interface AisMessage {
  messageType: number;
  mmsi: string;
  latitude: number;
  longitude: number;
  speed?: number;
  course?: number;
  timestamp: Date;
  vesselName?: string;
  callSign?: string;
}

// NATO STANAG Message (Simulated)
export interface StanagMessage {
  messageId: string;
  classification: "UNCLASSIFIED" | "CONFIDENTIAL" | "SECRET" | "TOP_SECRET";
  priority: "ROUTINE" | "PRIORITY" | "IMMEDIATE" | "FLASH";
  originUnit: string;
  destinationUnit: string;
  messageType: string;
  content: Record<string, any>;
  timestamp: Date;
}

// Protocol Message
export interface ProtocolMessage {
  protocol: ProtocolType;
  direction: Direction;
  sourceSystem: string;
  targetSystem?: string;
  payload: any;
  timestamp?: Date;
  trustScore?: number;
}

// Parsed Message
export interface ParsedMessage {
  protocol: ProtocolType;
  isValid: boolean;
  data: any;
  errors: string[];
  metadata: Record<string, any>;
}

// Validation Result
export interface ValidationResult {
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
  trustScore?: number;
}

// Route Result
export interface RouteResult {
  success: boolean;
  routedTo: string;
  latencyMs: number;
  response?: any;
  error?: string;
}

/**
 * Parse incoming message based on protocol type
 */
export async function parse(message: ProtocolMessage): Promise<ParsedMessage> {
  logger.info(`[ProtocolAdapter] Parsing ${message.protocol} message from ${message.sourceSystem}`);
  
  const errors: string[] = [];
  let data: any = null;
  let isValid = false;
  const metadata: Record<string, any> = {
    receivedAt: new Date().toISOString(),
    protocol: message.protocol,
    sourceSystem: message.sourceSystem,
  };

  try {
    switch (message.protocol) {
    case "json-rpc":
      const rpcResult = parseJsonRpc(message.payload);
      data = rpcResult.data;
      isValid = rpcResult.isValid;
      errors.push(...rpcResult.errors);
      break;

    case "graphql":
      const gqlResult = parseGraphQL(message.payload);
      data = gqlResult.data;
      isValid = gqlResult.isValid;
      errors.push(...gqlResult.errors);
      break;

    case "ais":
      const aisResult = parseAIS(message.payload);
      data = aisResult.data;
      isValid = aisResult.isValid;
      errors.push(...aisResult.errors);
      break;

    case "gmdss":
      const gmdssResult = parseGMDSS(message.payload);
      data = gmdssResult.data;
      isValid = gmdssResult.isValid;
      errors.push(...gmdssResult.errors);
      break;

    case "nato-stanag":
      const stanagResult = parseStanag(message.payload);
      data = stanagResult.data;
      isValid = stanagResult.isValid;
      errors.push(...stanagResult.errors);
      break;

    default:
      errors.push(`Unknown protocol: ${message.protocol}`);
    }
  } catch (error) {
    errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
    logger.error("[ProtocolAdapter] Parse error:", error);
  }

  return {
    protocol: message.protocol,
    isValid,
    data,
    errors,
    metadata,
  };
}

/**
 * Validate parsed message
 */
export async function validate(
  parsedMessage: ParsedMessage,
  schemaValidation: boolean = true
): Promise<ValidationResult> {
  logger.info(`[ProtocolAdapter] Validating ${parsedMessage.protocol} message`);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  let status: ValidationStatus = "valid";

  try {
    // Check basic validity
    if (!parsedMessage.isValid) {
      errors.push(...parsedMessage.errors);
      status = "invalid";
    }

    // Protocol-specific validation
    if (schemaValidation && parsedMessage.data) {
      const schemaErrors = validateSchema(parsedMessage.protocol, parsedMessage.data);
      if (schemaErrors.length > 0) {
        errors.push(...schemaErrors);
        status = "invalid";
      }
    }

    // Additional security checks
    if (parsedMessage.protocol === "nato-stanag") {
      const stanagData = parsedMessage.data as StanagMessage;
      if (stanagData.classification === "TOP_SECRET") {
        warnings.push("TOP_SECRET classification requires additional clearance");
      }
    }

    if (status === "valid" && errors.length > 0) {
      status = "invalid";
    }
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    status = "error";
    logger.error("[ProtocolAdapter] Validation error:", error);
  }

  return {
    status,
    errors,
    warnings,
  };
}

/**
 * Route message to appropriate handler
 */
export async function route(
  message: ProtocolMessage,
  parsedMessage: ParsedMessage,
  validationResult: ValidationResult
): Promise<RouteResult> {
  const startTime = Date.now();
  logger.info(`[ProtocolAdapter] Routing ${message.protocol} message to handler`);

  try {
    // Reject invalid messages
    if (validationResult.status === "invalid" || validationResult.status === "error") {
      await logInteropEvent(message, parsedMessage, validationResult, null, "rejected");
      return {
        success: false,
        routedTo: "none",
        latencyMs: Date.now() - startTime,
        error: `Message rejected: ${validationResult.errors.join(", ")}`,
      };
    }

    // Determine routing destination based on protocol
    const destination = determineRouteDestination(message.protocol, parsedMessage.data);
    
    // Simulate routing to handler (in real implementation, this would call actual handlers)
    const response = await simulateRouteToHandler(destination, parsedMessage.data);
    
    const latencyMs = Date.now() - startTime;

    // Log successful routing
    await logInteropEvent(message, parsedMessage, validationResult, destination, "completed", response, latencyMs);

    return {
      success: true,
      routedTo: destination,
      latencyMs,
      response,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await logInteropEvent(message, parsedMessage, validationResult, null, "failed", null, latencyMs, errorMessage);
    
    logger.error("[ProtocolAdapter] Routing error:", error);
    return {
      success: false,
      routedTo: "error",
      latencyMs,
      error: errorMessage,
    };
  }
}

// Internal parsing functions

function parseJsonRpc(payload: any): { data: any; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof payload !== "object" || payload === null) {
    return { data: null, isValid: false, errors: ["Invalid JSON-RPC payload"] };
  }

  const rpc = payload as Partial<JsonRpcRequest>;
  
  if (rpc.jsonrpc !== "2.0") {
    errors.push("Invalid JSON-RPC version, expected 2.0");
  }
  
  if (!rpc.method || typeof rpc.method !== "string") {
    errors.push("Missing or invalid method");
  }
  
  if (rpc.id === undefined) {
    errors.push("Missing request id");
  }

  return {
    data: payload,
    isValid: errors.length === 0,
    errors,
  };
}

function parseGraphQL(payload: any): { data: any; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof payload !== "object" || payload === null) {
    return { data: null, isValid: false, errors: ["Invalid GraphQL payload"] };
  }

  const gql = payload as Partial<GraphQLQuery>;
  
  if (!gql.query || typeof gql.query !== "string") {
    errors.push("Missing or invalid query string");
  }

  return {
    data: payload,
    isValid: errors.length === 0,
    errors,
  };
}

function parseAIS(payload: any): { data: any; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof payload !== "object" || payload === null) {
    return { data: null, isValid: false, errors: ["Invalid AIS payload"] };
  }

  const ais = payload as Partial<AisMessage>;
  
  if (!ais.mmsi || typeof ais.mmsi !== "string") {
    errors.push("Missing or invalid MMSI");
  }
  
  if (ais.latitude === undefined || typeof ais.latitude !== "number") {
    errors.push("Missing or invalid latitude");
  }
  
  if (ais.longitude === undefined || typeof ais.longitude !== "number") {
    errors.push("Missing or invalid longitude");
  }

  return {
    data: payload,
    isValid: errors.length === 0,
    errors,
  };
}

function parseGMDSS(payload: any): { data: any; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // GMDSS is similar to AIS but includes distress signaling
  if (typeof payload !== "object" || payload === null) {
    return { data: null, isValid: false, errors: ["Invalid GMDSS payload"] };
  }

  // Simulate GMDSS-specific validation
  const gmdss = payload as any;
  
  if (!gmdss.messageType) {
    errors.push("Missing GMDSS message type");
  }

  return {
    data: payload,
    isValid: errors.length === 0,
    errors,
  };
}

function parseStanag(payload: any): { data: any; isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof payload !== "object" || payload === null) {
    return { data: null, isValid: false, errors: ["Invalid STANAG payload"] };
  }

  const stanag = payload as Partial<StanagMessage>;
  
  if (!stanag.messageId) {
    errors.push("Missing message ID");
  }
  
  if (!stanag.classification) {
    errors.push("Missing classification level");
  }
  
  if (!stanag.priority) {
    errors.push("Missing priority level");
  }
  
  if (!stanag.originUnit) {
    errors.push("Missing origin unit");
  }

  return {
    data: payload,
    isValid: errors.length === 0,
    errors,
  };
}

function validateSchema(protocol: ProtocolType, data: any): string[] {
  const errors: string[] = [];
  
  // Protocol-specific schema validation
  switch (protocol) {
  case "json-rpc":
    // Already validated in parse
    break;
  case "graphql":
    // Additional GraphQL schema validation could go here
    break;
  case "ais":
    const ais = data as AisMessage;
    if (ais.latitude && (ais.latitude < -90 || ais.latitude > 90)) {
      errors.push("Latitude out of range");
    }
    if (ais.longitude && (ais.longitude < -180 || ais.longitude > 180)) {
      errors.push("Longitude out of range");
    }
    break;
  case "gmdss":
    // GMDSS schema validation
    break;
  case "nato-stanag":
    const stanag = data as StanagMessage;
    const validClassifications = ["UNCLASSIFIED", "CONFIDENTIAL", "SECRET", "TOP_SECRET"];
    if (stanag.classification && !validClassifications.includes(stanag.classification)) {
      errors.push("Invalid classification level");
    }
    break;
  }

  return errors;
}

function determineRouteDestination(protocol: ProtocolType, data: any): string {
  // Route based on protocol and data content
  switch (protocol) {
  case "json-rpc":
    const rpc = data as JsonRpcRequest;
    return `rpc-handler:${rpc.method}`;
  case "graphql":
    return "graphql-resolver";
  case "ais":
  case "gmdss":
    return "maritime-tracking-system";
  case "nato-stanag":
    return "military-ops-center";
  default:
    return "default-handler";
  }
}

async function simulateRouteToHandler(destination: string, data: any): Promise<any> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    status: "accepted",
    destination,
    processedAt: new Date().toISOString(),
    acknowledgment: `Message routed to ${destination}`,
  };
}

async function logInteropEvent(
  message: ProtocolMessage,
  parsedMessage: ParsedMessage,
  validationResult: ValidationResult,
  routedTo: string | null,
  status: ProcessingStatus,
  response?: any,
  latencyMs?: number,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase.from("interop_log").insert({
      protocol: message.protocol,
      direction: message.direction,
      source_system: message.sourceSystem,
      target_system: message.targetSystem,
      payload: message.payload,
      parsed_data: parsedMessage.data,
      validation_status: validationResult.status,
      validation_errors: validationResult.errors,
      routed_to: routedTo,
      trust_score: message.trustScore,
      response_data: response,
      latency_ms: latencyMs,
      status,
      error_message: errorMessage,
      processed_at: status === "completed" ? new Date().toISOString() : null,
    });

    if (error) {
      logger.error("[ProtocolAdapter] Failed to log interop event:", error);
    }
  } catch (error) {
    logger.error("[ProtocolAdapter] Error logging interop event:", error);
  }
}

/**
 * Convenience function to process a complete message flow
 */
export async function processMessage(message: ProtocolMessage): Promise<RouteResult> {
  const parsed = await parse(message);
  const validated = await validate(parsed);
  const routed = await route(message, parsed, validated);
  return routed;
}
