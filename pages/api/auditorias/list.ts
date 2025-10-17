import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type AuditoriaIMCA = {
  id: string;
  navio: string;
  data: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Observação";
  comentarios: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  success: boolean;
  data?: AuditoriaIMCA[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        success: false, 
        error: "Supabase configuration missing" 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch auditorias with the new fields
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("id, navio, data, norma, item_auditado, resultado, comentarios, created_at, updated_at")
      .not("navio", "is", null)
      .order("data", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}
