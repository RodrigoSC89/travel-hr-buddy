import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Module {
  id: string;
  name: string;
  path: string;
  status: "functional" | "pending" | "disabled";
  description: string;
  created_at: string;
  updated_at: string;
}

export default function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      const { data, error } = await supabase.from("modules").select("*");
      if (!error) setModules(data || []);
      setLoading(false);
    }
    fetchModules();
  }, []);

  return { modules, loading };
}
