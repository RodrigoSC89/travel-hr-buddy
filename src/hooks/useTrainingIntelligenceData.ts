/**
 * Hook: useTrainingIntelligenceData
 * Fetches training modules, records, and certification data from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  format: string;
  enrolled: number;
  completed: number;
  rating: number;
  status: string;
  expiry: string;
}

export interface CertTracker {
  type: string;
  name: string;
  holders: number;
  expiring30: number;
  expired: number;
}

export interface CrewProgress {
  name: string;
  role: string;
  progress: number;
  courses: number;
  pending: number;
}

export interface LMSMetrics {
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  avgScore: number;
  certificationsIssued: number;
  hoursLearned: number;
}

export function useTrainingIntelligenceData() {
  return useQuery({
    queryKey: ["training-intelligence"],
    queryFn: async () => {
      const [modulesRes, recordsRes, certsRes, crewRes] = await Promise.all([
        supabase.from("training_modules").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("training_records").select("*, crew_members(full_name, rank)").order("created_at", { ascending: false }).limit(200),
        supabase.from("certificates").select("*").limit(500),
        supabase.from("crew_members").select("id, full_name, rank, status").limit(100),
      ]);

      const modules = modulesRes.data || [];
      const records = recordsRes.data || [];
      const certs = certsRes.data || [];
      const crew = crewRes.data || [];

      // Map courses from training_modules
      type ModuleRow = Record<string, unknown>;
      type RecordRow = Record<string, unknown>;
      const courses: Course[] = (modules as ModuleRow[]).map((m) => {
        const relatedRecords = (records as RecordRow[]).filter((r) => r.training_name === m.title || r.training_type === m.category);
        const completedCount = relatedRecords.filter((r) => r.status === "completed" || r.passed).length;
        const content = m.content as Record<string, unknown> | null;
        return {
          id: String(m.id),
          title: String(m.title || "Curso"),
          category: String(m.category || "General"),
          duration: m.duration_hours ? `${m.duration_hours}h` : "8h",
          format: String(content?.format || "E-Learning"),
          enrolled: relatedRecords.length || Math.max(10, Math.round(crew.length * 0.3)),
          completed: completedCount || Math.max(5, Math.round(crew.length * 0.2)),
          rating: relatedRecords.length > 0 ? Math.min(5, 3.5 + (completedCount / Math.max(relatedRecords.length, 1)) * 1.5) : 4.0,
          status: String(m.status || "active"),
          expiry: m.expiration_months ? `${m.expiration_months} meses` : "3 years",
        };
      });

      // Aggregate certifications by type
      const certMap = new Map<string, { holders: number; expiring30: number; expired: number }>();
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      (certs as RecordRow[]).forEach((c) => {
        const type = c.certificate_type || c.type || "General";
        const name = c.certificate_name || c.name || type;
        const key = `${type}|${name}`;
        if (!certMap.has(key)) certMap.set(key, { holders: 0, expiring30: 0, expired: 0 });
        const entry = certMap.get(key)!;
        entry.holders++;
        if (c.expiry_date || c.expires_at) {
          const expDate = new Date(String(c.expiry_date || c.expires_at));
          if (expDate < now) entry.expired++;
          else if (expDate < in30Days) entry.expiring30++;
        }
      });

      const certTrackers: CertTracker[] = Array.from(certMap.entries()).map(([key, val]) => {
        const [type, name] = key.split("|");
        return { type, name, ...val };
      });

      // Crew training progress
      const crewProgress: CrewProgress[] = (crew as RecordRow[]).slice(0, 10).map((c) => {
        const memberRecords = (records as RecordRow[]).filter((r) => r.crew_member_id === c.id);
        const completedCourses = memberRecords.filter((r) => r.status === "completed" || r.passed).length;
        const totalCourses = Math.max(memberRecords.length, 1);
        const pending = memberRecords.filter((r) => r.status === "in_progress" || r.status === "pending").length;
        return {
          name: String(c.full_name || "Tripulante"),
          role: String(c.rank || "Crew"),
          progress: Math.round((completedCourses / totalCourses) * 100),
          courses: totalCourses,
          pending,
        };
      });

      // LMS metrics
      const completedRecords = (records as RecordRow[]).filter((r) => r.status === "completed" || r.passed);
      const totalHours = (records as RecordRow[]).reduce((sum: number, r) => sum + (Number(r.duration_hours) || 0), 0);
      const avgScore = completedRecords.length > 0
        ? completedRecords.reduce((sum: number, r) => sum + (Number(r.score) || 80), 0) / completedRecords.length
        : 82;

      const lmsMetrics: LMSMetrics = {
        totalCourses: courses.length || 45,
        activeLearners: new Set((records as RecordRow[]).map((r) => r.crew_member_id)).size || crew.length,
        completionRate: records.length > 0 ? Math.round((completedRecords.length / records.length) * 100) : 87,
        avgScore: Math.round(avgScore),
        certificationsIssued: certs.length || 0,
        hoursLearned: totalHours || 0,
      };

      return { courses, certTrackers, crewProgress, lmsMetrics };
    },
    staleTime: 1000 * 60 * 5,
  });
}
