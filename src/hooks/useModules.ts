import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  slug: string;
  title: string;
  description: string;
}

const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("modules")
          .select("*");

        if (error) {
          setError(error as Error);
        } else {
          setModules(data || []);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  return { modules, loading, error };
};

export default useModules;
