/**
 * Ethics Guard - Patch 150.1
 * Data privacy and ethics compliance layer for crew well-being module
 */

import { logger } from "@/lib/logger";

// Simple AES256-like encryption simulation
// ⚠️ WARNING: This is a DEMO implementation only
// In production, use Web Crypto API or crypto-js library
// TODO: Replace with proper encryption before production deployment
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "crew-ethics-guard-key-2025";

/**
 * NOTE: The encryption/decryption functions below are PLACEHOLDERS
 * They use simple XOR which is NOT secure for production use
 * 
 * For production, replace with:
 * - Web Crypto API: crypto.subtle.encrypt(algorithm, key, data)
 * - Or crypto-js: CryptoJS.AES.encrypt(data, key).toString()
 */

/**
 * Anonymize crew member name
 */
export const anonymizeName = (name: string): string => {
  if (!name || name.length === 0) return "Anônimo";
  
  // Keep first letter, replace rest with asterisks
  const firstLetter = name.charAt(0);
  const length = name.length;
  const masked = firstLetter + "*".repeat(Math.min(length - 1, 5));
  
  logger.debug("Name anonymized", { original: name.length, anonymized: masked.length });
  return masked;
};

/**
 * Anonymize crew member ID
 */
export const anonymizeId = (id: string): string => {
  if (!id) return "anon-" + generateRandomId();
  
  // Hash the ID to create a consistent anonymous ID
  const hash = simpleHash(id);
  return `anon-${hash}`;
};

/**
 * Simple hash function (in production, use proper crypto hash)
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Generate random anonymous ID
 */
const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Encrypt sensitive data
 * ⚠️ DEMO IMPLEMENTATION - Replace before production
 * Currently uses XOR for demonstration purposes only
 * 
 * Production implementation should use:
 * - Web Crypto API for browser-native encryption
 * - Or crypto-js for cross-browser compatibility
 */
export const encryptData = (data: string): string => {
  try {
    // ⚠️ XOR encryption - DEMO ONLY, NOT SECURE
    // TODO: Replace with proper AES256 before production
    const encrypted = btoa(
      data.split("").map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      ).join("")
    );
    
    logger.debug("Data encrypted (DEMO mode)", { originalLength: data.length, encryptedLength: encrypted.length });
    return encrypted;
  } catch (error) {
    logger.error("Encryption failed", error);
    return data; // Fallback to unencrypted (log the error)
  }
};

/**
 * Decrypt sensitive data
 * ⚠️ DEMO IMPLEMENTATION - Replace before production
 */
export const decryptData = (encryptedData: string): string => {
  try {
    // ⚠️ XOR decryption - DEMO ONLY, NOT SECURE
    // TODO: Replace with proper AES256 before production
    const decrypted = atob(encryptedData)
      .split("")
      .map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join("");
    
    logger.debug("Data decrypted (DEMO mode)");
    return decrypted;
  } catch (error) {
    logger.error("Decryption failed", error);
    return encryptedData; // Fallback to encrypted (log the error)
  }
};

/**
 * Check if user has given consent
 */
export const hasConsent = (userId: string): boolean => {
  try {
    const consent = localStorage.getItem(`ethics_consent_${userId}`);
    return consent === "true";
  } catch (error) {
    logger.error("Failed to check consent", error);
    return false;
  }
};

/**
 * Save user consent
 */
export const saveConsent = (userId: string, consent: boolean): void => {
  try {
    localStorage.setItem(`ethics_consent_${userId}`, consent.toString());
    localStorage.setItem(`ethics_consent_timestamp_${userId}`, new Date().toISOString());
    
    logger.info("User consent saved", { userId: anonymizeId(userId), consent });
  } catch (error) {
    logger.error("Failed to save consent", error);
  }
};

/**
 * Check if user has opted out
 */
export const hasOptedOut = (userId: string): boolean => {
  try {
    const optOut = localStorage.getItem(`ethics_opt_out_${userId}`);
    return optOut === "true";
  } catch (error) {
    logger.error("Failed to check opt-out status", error);
    return false;
  }
};

/**
 * Save user opt-out preference
 */
export const saveOptOut = (userId: string, optOut: boolean): void => {
  try {
    localStorage.setItem(`ethics_opt_out_${userId}`, optOut.toString());
    localStorage.setItem(`ethics_opt_out_timestamp_${userId}`, new Date().toISOString());
    
    logger.info("User opt-out preference saved", { userId: anonymizeId(userId), optOut });
  } catch (error) {
    logger.error("Failed to save opt-out preference", error);
  }
};

/**
 * Anonymize and encrypt crew check-in data
 */
export interface CrewCheckIn {
  crewId: string;
  crewName: string;
  mood: string;
  notes?: string;
  timestamp: string;
}

export interface AnonymizedCheckIn {
  anonymousId: string;
  anonymousName: string;
  mood: string;
  encryptedNotes?: string;
  timestamp: string;
}

export const anonymizeCheckIn = (checkIn: CrewCheckIn): AnonymizedCheckIn => {
  const anonymized: AnonymizedCheckIn = {
    anonymousId: anonymizeId(checkIn.crewId),
    anonymousName: anonymizeName(checkIn.crewName),
    mood: checkIn.mood,
    encryptedNotes: checkIn.notes ? encryptData(checkIn.notes) : undefined,
    timestamp: checkIn.timestamp,
  };
  
  logger.info("Check-in anonymized and encrypted", {
    anonymousId: anonymized.anonymousId,
    hasNotes: !!anonymized.encryptedNotes,
  });
  
  return anonymized;
};

/**
 * Decrypt and de-anonymize check-in (for authorized personnel only)
 */
export const decryptCheckIn = (anonymized: AnonymizedCheckIn, originalCrewId: string): CrewCheckIn => {
  const decrypted: CrewCheckIn = {
    crewId: originalCrewId,
    crewName: anonymized.anonymousName, // Keep anonymized name for privacy
    mood: anonymized.mood,
    notes: anonymized.encryptedNotes ? decryptData(anonymized.encryptedNotes) : undefined,
    timestamp: anonymized.timestamp,
  };
  
  logger.info("Check-in decrypted", { crewId: anonymizeId(originalCrewId) });
  return decrypted;
};

/**
 * Get consent timestamp
 */
export const getConsentTimestamp = (userId: string): string | null => {
  try {
    return localStorage.getItem(`ethics_consent_timestamp_${userId}`);
  } catch (error) {
    logger.error("Failed to get consent timestamp", error);
    return null;
  }
};

/**
 * Delete all user data (right to be forgotten)
 */
export const deleteUserData = (userId: string): void => {
  try {
    // Remove consent
    localStorage.removeItem(`ethics_consent_${userId}`);
    localStorage.removeItem(`ethics_consent_timestamp_${userId}`);
    
    // Remove opt-out
    localStorage.removeItem(`ethics_opt_out_${userId}`);
    localStorage.removeItem(`ethics_opt_out_timestamp_${userId}`);
    
    // In production, also remove from backend
    logger.info("User data deleted", { userId: anonymizeId(userId) });
  } catch (error) {
    logger.error("Failed to delete user data", error);
  }
};
