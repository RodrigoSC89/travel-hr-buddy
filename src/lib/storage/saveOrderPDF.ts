/**
 * Storage Service for Order PDFs
 * Saves PDF files to Supabase Storage
 */

import { createClient } from "@supabase/supabase-js";

// Create Supabase client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase: ReturnType<typeof createClient> | null = null;

// Only create client if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export interface SaveOrderPDFResult {
  success: boolean;
  error?: string;
  path?: string;
}

/**
 * Save order PDF to Supabase Storage
 * @param id - Order ID
 * @param pdfBlob - PDF file as Blob
 * @returns SaveOrderPDFResult with success flag and optional error/path
 */
export async function saveOrderPDF(
  id: string,
  pdfBlob: Blob
): Promise<SaveOrderPDFResult> {
  if (!supabase) {
    console.error("❌ Supabase client not initialized");
    return {
      success: false,
      error: "Supabase client not initialized",
    };
  }

  try {
    const fileName = `os-${id}.pdf`;
    const { error } = await supabase.storage
      .from("mmi-orders")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("❌ Erro ao salvar PDF:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ PDF salvo com sucesso:", fileName);
    return {
      success: true,
      path: fileName,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("❌ Erro ao salvar PDF:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
