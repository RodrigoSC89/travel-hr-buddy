import { createClient } from "@/lib/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();


  const { data, error } = await supabase.rpc("jobs_trend_by_month");


  if (error) return res.status(500).json({ error: error.message });


  return res.status(200).json(data);
}
