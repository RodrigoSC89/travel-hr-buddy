/**
 * Encryption Utility
 * PATCH 155.0 - AES encryption for secure communications
 */

/**
 * Generate AES encryption key
 */
export const generateEncryptionKey = async (): Promise<string> => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const keyArray = Array.from(new Uint8Array(exportedKey));
  const keyHex = keyArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return keyHex;
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encryptData = async (data: string, keyHex: string): Promise<string> => {
  // Convert hex key to CryptoKey
  const keyArray = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    keyArray,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt data
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    dataBuffer
  );

  // Combine IV and encrypted data
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  // Convert to hex
  const hexString = Array.from(combined)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return hexString;
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decryptData = async (encryptedHex: string, keyHex: string): Promise<string> => {
  // Convert hex to arrays
  const encryptedArray = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  const keyArray = new Uint8Array(
    keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  // Extract IV and encrypted data
  const iv = encryptedArray.slice(0, 12);
  const data = encryptedArray.slice(12);

  // Import key
  const key = await crypto.subtle.importKey(
    "raw",
    keyArray,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

/**
 * Generate checksum for file integrity
 */
export const generateChecksum = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return checksum;
};
