import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // GET - List all templates
  if (method === "GET") {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, templates: data || [] });
  }

  // Method not allowed
  return res.status(405).json({ error: "Método não permitido." });
}
