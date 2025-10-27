/**
 * Blockchain Log Registry - Type Definitions
 * PATCH 154.0 - Blockchain-based log verification
 */

export interface BlockchainConfig {
  network: "ethereum-rinkeby" | "polygon-mumbai" | "ethereum-mainnet" | "polygon-mainnet";
  rpcUrl: string;
  contractAddress?: string;
  explorerUrl: string;
}

export interface LogEvent {
  id: string;
  type: "incident" | "audit" | "certificate" | "signature" | "system";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata: Record<string, any>;
  hash: string;
  timestamp: string;
}

export interface BlockchainRecord {
  id: string;
  logEventId: string;
  blockNumber: string;
  transactionHash: string;
  blockHash: string;
  network: string;
  explorerUrl: string;
  recordedAt: string;
  verified: boolean;
}

export interface VerificationResult {
  valid: boolean;
  logEvent: LogEvent | null;
  blockchainRecord: BlockchainRecord | null;
  message: string;
  verifiedAt: string;
}
