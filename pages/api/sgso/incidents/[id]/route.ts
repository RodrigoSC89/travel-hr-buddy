import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    return handlePut(req, res);
  } else if (req.method === "DELETE") {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;
    const { id } = req.query;

    const { error } = await supabase
      .from("sgso_incidents")
      .update(body)
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/sgso/incidents/[id]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const { error } = await supabase
      .from("sgso_incidents")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/sgso/incidents/[id]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
