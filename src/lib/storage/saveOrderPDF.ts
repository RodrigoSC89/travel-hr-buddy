/**
 * PDF Storage Service for MMI Orders
 * Saves work order PDFs to Supabase Storage
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Save a work order PDF to Supabase Storage
 * @param id - Work order ID (UUID)
 * @param pdfBlob - PDF file as Blob
 * @returns Object with success status and file path or error
 */
export async function saveOrderPDF(
  id: string,
  pdfBlob: Blob
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Validate inputs
    if (!id) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    if (!pdfBlob || pdfBlob.size === 0) {
      return {
        success: false,
        error: "Invalid PDF file",
      };
    }

    // Generate file path
    const fileName = `os-${id}.pdf`;
    const filePath = `orders/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("mmi-orders")
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: true, // Allow overwrites
      });

    if (error) {
      console.error("Error saving PDF:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`PDF saved successfully: ${filePath}`);

    return {
      success: true,
      path: filePath,
    };
  } catch (error) {
    console.error("Error in saveOrderPDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get public URL for a stored PDF
 * @param path - File path in storage
 * @returns Public URL or null
 */
export function getOrderPDFUrl(path: string): string | null {
  try {
    const { data } = supabase.storage.from("mmi-orders").getPublicUrl(path);

    return data?.publicUrl || null;
  } catch (error) {
    console.error("Error getting PDF URL:", error);
    return null;
  }
}

/**
 * Delete a work order PDF from storage
 * @param id - Work order ID
 * @returns Success status
 */
export async function deleteOrderPDF(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fileName = `os-${id}.pdf`;
    const filePath = `orders/${fileName}`;

    const { error } = await supabase.storage
      .from("mmi-orders")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting PDF:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOrderPDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
