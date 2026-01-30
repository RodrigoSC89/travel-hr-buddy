/**
 * Typed Supabase Hooks - Nautilus One v3.2.1
 * Type-safe data fetching with validation
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type aliases from Database
type Vessel = Database["public"]["Tables"]["vessels"]["Row"];
type CrewMember = Database["public"]["Tables"]["crew_members"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// ============================================================
// GENERIC TYPED HOOK
// ============================================================

interface UseTypedQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseTypedQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================
// VESSELS HOOK
// ============================================================

export function useVessels(
  organizationId?: string,
  options: UseTypedQueryOptions = {}
): UseTypedQueryResult<Vessel> {
  const [data, setData] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("vessels").select("*");

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data: result, error: err } = await query;

      if (err) throw new Error(err.message);

      setData((result || []) as Vessel[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch vessels";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// CREW MEMBERS HOOK
// ============================================================

export function useCrewMembers(
  filters?: { vesselId?: string; organizationId?: string; status?: string },
  options: UseTypedQueryOptions = {}
): UseTypedQueryResult<CrewMember> {
  const [data, setData] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("crew_members").select("*");

      if (filters?.vesselId) {
        query = query.eq("current_vessel_id", filters.vesselId);
      }
      if (filters?.organizationId) {
        query = query.eq("organization_id", filters.organizationId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data: result, error: err } = await query;

      if (err) throw new Error(err.message);

      setData((result || []) as CrewMember[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch crew members";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters?.vesselId, filters?.organizationId, filters?.status, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// SINGLE VESSEL HOOK
// ============================================================

export function useVessel(vesselId: string | undefined) {
  const [data, setData] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!vesselId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: err } = await supabase
        .from("vessels")
        .select("*")
        .eq("id", vesselId)
        .single();

      if (err) throw new Error(err.message);

      setData(result as Vessel);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch vessel";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [vesselId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// SINGLE CREW MEMBER HOOK
// ============================================================

export function useCrewMember(crewMemberId: string | undefined) {
  const [data, setData] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!crewMemberId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: err } = await supabase
        .from("crew_members")
        .select("*")
        .eq("id", crewMemberId)
        .single();

      if (err) throw new Error(err.message);

      setData(result as CrewMember);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch crew member";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [crewMemberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// PROFILE HOOK
// ============================================================

export function useProfile(userId: string | undefined) {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: err } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (err && err.code !== "PGRST116") {
        throw new Error(err.message);
      }

      setData(result as Profile | null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
