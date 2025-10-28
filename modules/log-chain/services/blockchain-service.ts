/**
 * Blockchain Service
 * PATCH 154.0 - Log hash registry on blockchain
 */

import { createClient } from "@/integrations/supabase/client";
import { LogEvent, BlockchainRecord, BlockchainConfig, VerificationResult } from "../types";

// Default configuration for testnet
const DEFAULT_CONFIG: BlockchainConfig = {
  network: "polygon-mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  explorerUrl: "https://mumbai.polygonscan.com"
};

/**
 * Generate SHA256 hash for log event
 */
export const generateLogHash = async (logEvent: Omit<LogEvent, "id" | "hash" | "timestamp">): Promise<string> => {
  const dataString = JSON.stringify({
    type: logEvent.type,
    severity: logEvent.severity,
    description: logEvent.description,
    metadata: logEvent.metadata,
    timestamp: new Date().toISOString()
  });

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return hash;
};

/**
 * Register log event on blockchain
 */
export const registerLogOnBlockchain = async (
  logEvent: Omit<LogEvent, "id" | "hash" | "timestamp">
): Promise<BlockchainRecord> => {
  const supabase = createClient();

  // Generate hash
  const hash = await generateLogHash(logEvent);

  // Create log event
  const event: LogEvent = {
    id: `LOG-${Date.now()}`,
    hash,
    timestamp: new Date().toISOString(),
    ...logEvent
  };

  // Store log event
  await supabase.from("log_events").insert([event]);

  // Simulate blockchain transaction
  // In real implementation, this would use ethers.js or web3.js
  const blockchainTx = await simulateBlockchainTransaction(hash);

  // Create blockchain record
  const record: BlockchainRecord = {
    id: `BC-${Date.now()}`,
    logEventId: event.id,
    blockNumber: blockchainTx.blockNumber,
    transactionHash: blockchainTx.txHash,
    blockHash: blockchainTx.blockHash,
    network: DEFAULT_CONFIG.network,
    explorerUrl: `${DEFAULT_CONFIG.explorerUrl}/tx/${blockchainTx.txHash}`,
    recordedAt: new Date().toISOString(),
    verified: true
  };

  // Store blockchain record
  await supabase.from("blockchain_records").insert([record]);

  return record;
};

/**
 * Verify log hash on blockchain
 */
export const verifyLogOnBlockchain = async (
  logEventId: string
): Promise<VerificationResult> => {
  const supabase = createClient();

  // Fetch log event
  const { data: logEvent, error: logError } = await supabase
    .from("log_events")
    .select("*")
    .eq("id", logEventId)
    .single();

  if (logError || !logEvent) {
    return {
      valid: false,
      logEvent: null,
      blockchainRecord: null,
      message: "Log event not found",
      verifiedAt: new Date().toISOString()
    };
  }

  // Fetch blockchain record
  const { data: bcRecord, error: bcError } = await supabase
    .from("blockchain_records")
    .select("*")
    .eq("logEventId", logEventId)
    .single();

  if (bcError || !bcRecord) {
    return {
      valid: false,
      logEvent,
      blockchainRecord: null,
      message: "Blockchain record not found",
      verifiedAt: new Date().toISOString()
    };
  }

  // Verify hash on blockchain
  const isValid = await verifyHashOnChain(
    logEvent.hash,
    bcRecord.transactionHash,
    bcRecord.network
  );

  return {
    valid: isValid,
    logEvent,
    blockchainRecord: bcRecord,
    message: isValid ? "Log verified on blockchain" : "Blockchain verification failed",
    verifiedAt: new Date().toISOString()
  };
};

/**
 * Simulate blockchain transaction (for demo)
 */
const simulateBlockchainTransaction = async (hash: string): Promise<{
  txHash: string;
  blockNumber: string;
  blockHash: string;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock transaction data
  const txHash = `0x${Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;

  const blockNumber = Math.floor(Math.random() * 1000000).toString();

  const blockHash = `0x${Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;

  return { txHash, blockNumber, blockHash };
};

/**
 * Verify hash on blockchain
 */
const verifyHashOnChain = async (
  hash: string,
  txHash: string,
  network: string
): Promise<boolean> => {
  // In real implementation, this would query the blockchain
  // For now, we simulate verification
  return hash.length > 0 && txHash.length > 0;
};

/**
 * List blockchain records
 */
export const listBlockchainRecords = async (filters?: {
  network?: string;
  type?: string;
}) => {
  const supabase = createClient();

  let query = supabase
    .from("blockchain_records")
    .select("*, log_events(*)")
    .order("recordedAt", { ascending: false });

  if (filters?.network) {
    query = query.eq("network", filters.network);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing blockchain records:", error);
    return [];
  }

  return data || [];
};

/**
 * Get blockchain statistics
 */
export const getBlockchainStats = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blockchain_records")
    .select("network, verified");

  if (error) {
    return { total: 0, verified: 0, byNetwork: {} };
  }

  const total = data?.length || 0;
  const verified = data?.filter(r => r.verified).length || 0;
  const byNetwork = data?.reduce((acc: any, record) => {
    acc[record.network] = (acc[record.network] || 0) + 1;
    return acc;
  }, {}) || {};

  return { total, verified, byNetwork };
};
