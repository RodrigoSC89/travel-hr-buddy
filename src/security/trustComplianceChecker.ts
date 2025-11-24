/**
 * PATCH 229 - Trust & Compliance Checker
 * Verification system for trust and compliance before accepting external inputs
 * Evaluates source, protocol security, and payload schema compliance
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ProtocolType } from "@/core/interop/protocolAdapter";

// Trust and Compliance Types
export type EventType = 
  | "validation"
  | "breach"
  | "alert"
  | "audit"
  | "whitelist_check"
  | "blacklist_check";

export type ComplianceStatus = 
  | "compliant"
  | "non_compliant"
  | "suspicious"
  | "blocked"
  | "pending";

export type AlertLevel = "info" | "warning" | "high" | "critical" | "emergency";

// Trust Evaluation Result
export interface TrustEvaluation {
  trustScore: number; // 0-100
  complianceStatus: ComplianceStatus;
  checks: CheckResult[];
  failedChecks: string[];
  alerts: Alert[];
  recommendations: string[];
}

// Individual Check Result
export interface CheckResult {
  checkName: string;
  passed: boolean;
  score: number;
  message: string;
  details?: Record<string, any>;
}

// Alert
export interface Alert {
  level: AlertLevel;
  message: string;
  timestamp: Date;
  action?: string;
}

// Source Configuration
export interface SourceConfig {
  sourceSystem: string;
  whitelisted: boolean;
  blacklisted: boolean;
  trustLevel: number; // 0-100
  allowedProtocols: ProtocolType[];
  metadata?: Record<string, any>;
}

// Whitelist and Blacklist (in-memory for this implementation)
const whitelist: Set<string> = new Set([
  "trusted-system-1",
  "maritime-ops-center",
  "naval-command",
  "allied-vessel-001",
]);

const blacklist: Set<string> = new Set([
  "malicious-source",
  "banned-system",
]);

const trustedProtocols: Set<ProtocolType> = new Set([
  "json-rpc",
  "graphql",
  "ais",
  "gmdss",
  "nato-stanag",
]);

/**
 * Evaluate trust and compliance for an external input
 */
export async function evaluateTrust(
  sourceSystem: string,
  protocol: ProtocolType,
  payload: any,
  sourceIp?: string
): Promise<TrustEvaluation> {
  logger.info(`[TrustComplianceChecker] Evaluating trust for ${sourceSystem}`);

  const checks: CheckResult[] = [];
  const failedChecks: string[] = [];
  const alerts: Alert[] = [];
  const recommendations: string[] = [];

  // Check 1: Whitelist verification
  const whitelistCheck = checkWhitelist(sourceSystem);
  checks.push(whitelistCheck);
  if (!whitelistCheck.passed) {
    failedChecks.push("whitelist_check");
    recommendations.push("Add source to whitelist after verification");
  }

  // Check 2: Blacklist verification
  const blacklistCheck = checkBlacklist(sourceSystem);
  checks.push(blacklistCheck);
  if (!blacklistCheck.passed) {
    failedChecks.push("blacklist_check");
    alerts.push({
      level: "critical",
      message: `Blocked source detected: ${sourceSystem}`,
      timestamp: new Date(),
      action: "REJECT_INPUT",
    });
  }

  // Check 3: Protocol security
  const protocolCheck = checkProtocolSecurity(protocol);
  checks.push(protocolCheck);
  if (!protocolCheck.passed) {
    failedChecks.push("protocol_security");
    recommendations.push("Use secure communication protocol");
  }

  // Check 4: Payload schema validation
  const schemaCheck = checkPayloadSchema(protocol, payload);
  checks.push(schemaCheck);
  if (!schemaCheck.passed) {
    failedChecks.push("schema_validation");
    recommendations.push("Ensure payload conforms to protocol schema");
  }

  // Check 5: IP reputation (if provided)
  if (sourceIp) {
    const ipCheck = checkIpReputation(sourceIp);
    checks.push(ipCheck);
    if (!ipCheck.passed) {
      failedChecks.push("ip_reputation");
      alerts.push({
        level: "warning",
        message: `Suspicious IP detected: ${sourceIp}`,
        timestamp: new Date(),
      });
    }
  }

  // Calculate overall trust score (0-100)
  const trustScore = calculateTrustScore(checks, whitelistCheck.passed, blacklistCheck.passed);

  // Determine compliance status
  const complianceStatus = determineComplianceStatus(trustScore, blacklistCheck.passed);

  // Generate appropriate alerts
  if (trustScore < 30) {
    alerts.push({
      level: "critical",
      message: `Very low trust score (${trustScore}) for ${sourceSystem}`,
      timestamp: new Date(),
      action: "REJECT_AND_LOG",
    });
  } else if (trustScore < 50) {
    alerts.push({
      level: "high",
      message: `Low trust score (${trustScore}) for ${sourceSystem}`,
      timestamp: new Date(),
      action: "ENHANCED_MONITORING",
    });
  } else if (trustScore < 70) {
    alerts.push({
      level: "warning",
      message: `Medium trust score (${trustScore}) for ${sourceSystem}`,
      timestamp: new Date(),
      action: "STANDARD_MONITORING",
    });
  }

  // Log trust event
  await logTrustEvent({
    eventType: "validation",
    sourceSystem,
    sourceIp,
    sourceProtocol: protocol,
    trustScore,
    complianceStatus,
    checks,
    failedChecks,
    alerts,
    payload,
  });

  logger.info(
    `[TrustComplianceChecker] Evaluation complete: score=${trustScore}, status=${complianceStatus}`
  );

  return {
    trustScore,
    complianceStatus,
    checks,
    failedChecks,
    alerts,
    recommendations,
  };
}

/**
 * Check if source is whitelisted
 */
function checkWhitelist(sourceSystem: string): CheckResult {
  const isWhitelisted = whitelist.has(sourceSystem);

  return {
    checkName: "Whitelist Verification",
    passed: isWhitelisted,
    score: isWhitelisted ? 100 : 50,
    message: isWhitelisted
      ? "Source is whitelisted"
      : "Source is not in whitelist - requires additional verification",
    details: { whitelisted: isWhitelisted },
  };
}

/**
 * Check if source is blacklisted
 */
function checkBlacklist(sourceSystem: string): CheckResult {
  const isBlacklisted = blacklist.has(sourceSystem);

  return {
    checkName: "Blacklist Verification",
    passed: !isBlacklisted,
    score: isBlacklisted ? 0 : 100,
    message: isBlacklisted
      ? "❌ CRITICAL: Source is blacklisted - REJECT"
      : "Source is not blacklisted",
    details: { blacklisted: isBlacklisted },
  };
}

/**
 * Check protocol security
 */
function checkProtocolSecurity(protocol: ProtocolType): CheckResult {
  const isSecure = trustedProtocols.has(protocol);
  
  // Additional security checks for specific protocols
  let securityLevel = 100;
  let message = "Protocol is secure and trusted";

  switch (protocol) {
  case "json-rpc":
  case "graphql":
    // These are application-level protocols - require transport security
    securityLevel = 80;
    message = "Protocol is trusted - ensure transport layer security (TLS)";
    break;
  case "ais":
  case "gmdss":
    // Maritime protocols - inherently less secure but necessary
    securityLevel = 70;
    message = "Maritime protocol - apply additional validation";
    break;
  case "nato-stanag":
    // Military protocol - should be highly secure
    securityLevel = 95;
    message = "Military-grade protocol with high security";
    break;
  }

  return {
    checkName: "Protocol Security",
    passed: isSecure,
    score: securityLevel,
    message,
    details: { protocol, securityLevel },
  };
}

/**
 * Check payload schema compliance
 */
function checkPayloadSchema(protocol: ProtocolType, payload: any): CheckResult {
  const errors: string[] = [];

  // Basic payload validation
  if (!payload || typeof payload !== "object") {
    errors.push("Payload must be an object");
  }

  // Protocol-specific schema checks
  switch (protocol) {
  case "json-rpc":
    if (!payload.jsonrpc || payload.jsonrpc !== "2.0") {
      errors.push("Invalid JSON-RPC version");
    }
    if (!payload.method) {
      errors.push("Missing method field");
    }
    break;

  case "graphql":
    if (!payload.query) {
      errors.push("Missing query field");
    }
    break;

  case "ais":
    if (!payload.mmsi) {
      errors.push("Missing MMSI field");
    }
    if (payload.latitude === undefined || payload.longitude === undefined) {
      errors.push("Missing position data");
    }
    break;

  case "nato-stanag":
    if (!payload.messageId || !payload.classification || !payload.priority) {
      errors.push("Missing required STANAG fields");
    }
    break;
  }

  const passed = errors.length === 0;

  return {
    checkName: "Schema Validation",
    passed,
    score: passed ? 100 : Math.max(0, 100 - errors.length * 25),
    message: passed ? "Payload conforms to schema" : `Schema validation failed: ${errors.join(", ")}`,
    details: { errors },
  };
}

/**
 * Check IP reputation (simulated)
 */
function checkIpReputation(ip: string): CheckResult {
  // Simulate IP reputation check
  // In real implementation, this would query a threat intelligence database
  
  const suspiciousPatterns = ["192.0.2", "198.51.100", "203.0.113"]; // TEST-NET addresses
  const isSuspicious = suspiciousPatterns.some(pattern => ip.startsWith(pattern));

  return {
    checkName: "IP Reputation",
    passed: !isSuspicious,
    score: isSuspicious ? 30 : 100,
    message: isSuspicious ? "IP has suspicious patterns" : "IP reputation is clean",
    details: { ip, suspicious: isSuspicious },
  };
}

/**
 * Calculate overall trust score
 */
function calculateTrustScore(
  checks: CheckResult[],
  isWhitelisted: boolean,
  notBlacklisted: boolean
): number {
  // Blacklist is an instant fail
  if (!notBlacklisted) {
    return 0;
  }

  // Calculate weighted average of check scores
  let totalScore = 0;
  let totalWeight = 0;

  checks.forEach(check => {
    const weight = getCheckWeight(check.checkName);
    totalScore += check.score * weight;
    totalWeight += weight;
  });

  let baseScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  // Bonus for whitelisted sources
  if (isWhitelisted) {
    baseScore = Math.min(100, baseScore + 10);
  }

  return Math.round(baseScore);
}

/**
 * Get weight for different check types
 */
function getCheckWeight(checkName: string): number {
  switch (checkName) {
  case "Blacklist Verification":
    return 3.0; // Most critical
  case "Whitelist Verification":
    return 2.0;
  case "Protocol Security":
    return 2.0;
  case "Schema Validation":
    return 1.5;
  case "IP Reputation":
    return 1.0;
  default:
    return 1.0;
  }
}

/**
 * Determine compliance status based on trust score
 */
function determineComplianceStatus(trustScore: number, notBlacklisted: boolean): ComplianceStatus {
  if (!notBlacklisted) {
    return "blocked";
  }

  if (trustScore >= 80) {
    return "compliant";
  } else if (trustScore >= 50) {
    return "non_compliant";
  } else if (trustScore >= 30) {
    return "suspicious";
  } else {
    return "blocked";
  }
}

/**
 * Log trust event to database
 */
async function logTrustEvent(event: {
  eventType: EventType;
  sourceSystem: string;
  sourceIp?: string;
  sourceProtocol?: ProtocolType;
  trustScore: number;
  complianceStatus: ComplianceStatus;
  checks: CheckResult[];
  failedChecks: string[];
  alerts: Alert[];
  payload?: any;
}): Promise<void> {
  try {
    const highestAlert = event.alerts.reduce(
      (highest, alert) => {
        const levels: AlertLevel[] = ["info", "warning", "high", "critical", "emergency"];
        return levels.indexOf(alert.level) > levels.indexOf(highest)
          ? alert.level
          : highest;
      },
      "info" as AlertLevel
    );

    const { error } = await supabase.from("trust_events").insert({
      event_type: event.eventType,
      source_system: event.sourceSystem,
      source_ip: event.sourceIp,
      source_protocol: event.sourceProtocol,
      trust_score: event.trustScore,
      compliance_status: event.complianceStatus,
      validation_results: {
        checks: event.checks,
        alerts: event.alerts,
      },
      checks_performed: event.checks.map(c => c.checkName),
      failed_checks: event.failedChecks,
      whitelisted: event.checks.find(c => c.checkName === "Whitelist Verification")?.passed || false,
      blacklisted: !(event.checks.find(c => c.checkName === "Blacklist Verification")?.passed ?? true),
      protocol_secure: event.checks.find(c => c.checkName === "Protocol Security")?.passed || false,
      schema_valid: event.checks.find(c => c.checkName === "Schema Validation")?.passed || false,
      alert_level: highestAlert,
      alert_message: event.alerts[0]?.message || "Trust evaluation completed",
      action_taken: event.alerts[0]?.action,
      operator_notified: event.trustScore < 50,
      metadata: {
        payload_hash: event.payload ? hashPayload(event.payload) : null,
      },
    });

    if (error) {
      logger.error("[TrustComplianceChecker] Failed to log trust event:", error);
    }

    // Console alert for critical issues
    if (event.trustScore < 50 || event.complianceStatus === "blocked") {
      console.warn(
        "🚨 SECURITY ALERT:",
        `Source: ${event.sourceSystem}`,
        `Trust Score: ${event.trustScore}`,
        `Status: ${event.complianceStatus}`,
        event.alerts
      );
    }
  } catch (error) {
    logger.error("[TrustComplianceChecker] Error logging trust event:", error);
  }
}

/**
 * Simple payload hash for tracking (not cryptographic)
 */
function hashPayload(payload: any): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Add source to whitelist
 */
export function addToWhitelist(sourceSystem: string): void {
  whitelist.add(sourceSystem);
  logger.info(`[TrustComplianceChecker] Added ${sourceSystem} to whitelist`);
}

/**
 * Remove source from whitelist
 */
export function removeFromWhitelist(sourceSystem: string): void {
  whitelist.delete(sourceSystem);
  logger.info(`[TrustComplianceChecker] Removed ${sourceSystem} from whitelist`);
}

/**
 * Add source to blacklist
 */
export function addToBlacklist(sourceSystem: string): void {
  blacklist.add(sourceSystem);
  logger.warn(`[TrustComplianceChecker] Added ${sourceSystem} to blacklist`);
}

/**
 * Remove source from blacklist
 */
export function removeFromBlacklist(sourceSystem: string): void {
  blacklist.delete(sourceSystem);
  logger.info(`[TrustComplianceChecker] Removed ${sourceSystem} from blacklist`);
}

/**
 * Get current whitelist
 */
export function getWhitelist(): string[] {
  return Array.from(whitelist);
}

/**
 * Get current blacklist
 */
export function getBlacklist(): string[] {
  return Array.from(blacklist);
}
