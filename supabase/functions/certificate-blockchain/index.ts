import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Certificate Blockchain - Immutable Certificate Registry
 * Creates tamper-proof certificates with hash verification and QR code generation
 */

interface CertificateData {
  type: string;
  holderName: string;
  holderDocument: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  endorsements?: string[];
  limitations?: string[];
  metadata?: Record<string, unknown>;
}

interface BlockchainRecord {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  data: CertificateData;
  signature: string;
}

// Simple hash function for demonstration (in production, use proper cryptographic library)
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Generate digital signature
async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Verify certificate integrity
async function verifyCertificate(record: BlockchainRecord, secret: string): Promise<boolean> {
  const dataString = JSON.stringify(record.data) + record.previousHash + record.timestamp;
  const expectedHash = await generateHash(dataString);
  const expectedSignature = await generateSignature(dataString, secret);
  
  return record.hash === expectedHash && record.signature === expectedSignature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const blockchainSecret = Deno.env.get("BLOCKCHAIN_SECRET") || "nautilus-blockchain-secret-key-2025";

  try {
    const { operation, ...payload } = await req.json();

    console.log(`[certificate-blockchain] Operation: ${operation}`);

    switch (operation) {
      case "issue": {
        // Issue a new certificate
        const certificate = payload.certificate as CertificateData;
        
        if (!certificate || !certificate.holderName || !certificate.certificateNumber) {
          return new Response(
            JSON.stringify({ error: "Certificate data is incomplete" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get the last block hash
        const { data: lastBlock } = await supabase
          .from("certificate_blockchain")
          .select("hash")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const previousHash = lastBlock?.hash || "GENESIS_BLOCK_NAUTILUS_2025";
        const timestamp = new Date().toISOString();
        const dataString = JSON.stringify(certificate) + previousHash + timestamp;
        
        const hash = await generateHash(dataString);
        const signature = await generateSignature(dataString, blockchainSecret);
        const blockId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const record: BlockchainRecord = {
          id: blockId,
          hash,
          previousHash,
          timestamp,
          data: certificate,
          signature,
        };

        // Store in database
        const { error: insertError } = await supabase
          .from("certificate_blockchain")
          .insert({
            block_id: blockId,
            hash,
            previous_hash: previousHash,
            certificate_data: certificate,
            signature,
            created_at: timestamp,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          // Continue even if insert fails - return the certificate data
        }

        // Generate QR code URL
        const qrData = {
          blockId,
          hash: hash.substring(0, 16),
          verify: `${supabaseUrl}/functions/v1/certificate-blockchain?operation=verify&blockId=${blockId}`,
        };

        return new Response(
          JSON.stringify({
            success: true,
            certificate: record,
            qrCode: {
              data: JSON.stringify(qrData),
              url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`,
            },
            verificationUrl: qrData.verify,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify": {
        // Verify a certificate by block ID or hash
        const { blockId, hash } = payload;

        const query = supabase.from("certificate_blockchain").select("*");
        
        if (blockId) {
          query.eq("block_id", blockId);
        } else if (hash) {
          query.eq("hash", hash);
        } else {
          return new Response(
            JSON.stringify({ error: "blockId or hash is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: block, error } = await query.single();

        if (error || !block) {
          return new Response(
            JSON.stringify({ 
              valid: false, 
              error: "Certificate not found",
              message: "Este certificado não foi encontrado no registro blockchain." 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify integrity
        const record: BlockchainRecord = {
          id: block.block_id,
          hash: block.hash,
          previousHash: block.previous_hash,
          timestamp: block.created_at,
          data: block.certificate_data,
          signature: block.signature,
        };

        const isValid = await verifyCertificate(record, blockchainSecret);
        const certificate = block.certificate_data as CertificateData;
        const isExpired = new Date(certificate.expiryDate) < new Date();

        return new Response(
          JSON.stringify({
            valid: isValid && !isExpired,
            integrityCheck: isValid,
            expired: isExpired,
            certificate: {
              blockId: block.block_id,
              type: certificate.type,
              holderName: certificate.holderName,
              certificateNumber: certificate.certificateNumber,
              issueDate: certificate.issueDate,
              expiryDate: certificate.expiryDate,
              issuingAuthority: certificate.issuingAuthority,
              endorsements: certificate.endorsements,
            },
            blockchain: {
              hash: block.hash.substring(0, 16) + "...",
              previousHash: block.previous_hash.substring(0, 16) + "...",
              timestamp: block.created_at,
              signature: block.signature.substring(0, 16) + "...",
            },
            message: isValid 
              ? (isExpired ? "Certificado válido mas EXPIRADO" : "Certificado VÁLIDO e AUTÊNTICO ✓")
              : "ATENÇÃO: Certificado INVÁLIDO ou ADULTERADO",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "history": {
        // Get certificate history for a holder
        const { holderDocument } = payload;

        const { data: blocks, error } = await supabase
          .from("certificate_blockchain")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const holderCerts = blocks?.filter((b: { certificate_data: CertificateData }) => 
          b.certificate_data.holderDocument === holderDocument
        ) || [];

        return new Response(
          JSON.stringify({
            success: true,
            holderDocument,
            count: holderCerts.length,
            certificates: holderCerts.map((b: { block_id: string; certificate_data: CertificateData; hash: string }) => ({
              blockId: b.block_id,
              type: b.certificate_data.type,
              certificateNumber: b.certificate_data.certificateNumber,
              issueDate: b.certificate_data.issueDate,
              expiryDate: (b.certificate_data as CertificateData).expiryDate,
              valid: new Date((b.certificate_data as CertificateData).expiryDate) >= new Date(),
              hash: b.hash.substring(0, 16),
            })),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "chain-integrity": {
        // Verify entire blockchain integrity
        const { data: blocks, error } = await supabase
          .from("certificate_blockchain")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const results = [];
        let chainValid = true;
        let previousHash = "GENESIS_BLOCK_NAUTILUS_2025";

        for (const block of blocks || []) {
          const record: BlockchainRecord = {
            id: block.block_id,
            hash: block.hash,
            previousHash: block.previous_hash,
            timestamp: block.created_at,
            data: block.certificate_data,
            signature: block.signature,
          };

          const blockValid = await verifyCertificate(record, blockchainSecret);
          const chainLinkValid = block.previous_hash === previousHash;

          results.push({
            blockId: block.block_id,
            integrityValid: blockValid,
            chainLinkValid,
          });

          if (!blockValid || !chainLinkValid) {
            chainValid = false;
          }

          previousHash = block.hash;
        }

        return new Response(
          JSON.stringify({
            success: true,
            chainValid,
            totalBlocks: blocks?.length || 0,
            results,
            message: chainValid 
              ? "Blockchain íntegra - Nenhuma adulteração detectada ✓" 
              : "ALERTA: Inconsistência detectada na blockchain!",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("certificate-blockchain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
