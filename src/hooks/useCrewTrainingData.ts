/**
 * Hook para dados reais de Treinamento do Funcionário
 * Substitui MOCK_COURSES e MOCK_CERTIFICATES em EmployeeTrainingPortal.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "locked";
  mandatory: boolean;
  deadline?: string;
  certificate?: boolean;
  rating?: number;
}

export interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  expiryDate?: string;
  status: "valid" | "expiring" | "expired";
}

export function useCrewTrainingData() {
  const { data, isLoading } = useQuery({
    queryKey: ["crew-training-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { courses: [], certificates: [] };

      // Fetch courses from academy_courses
      const { data: allCourses, error: coursesError } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("is_published", true)
        .limit(20);

      if (coursesError) throw coursesError;

      // Fetch user progress from academy_progress
      const { data: progressData } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("user_id", user.id);

      const progressMap = new Map<string, any>();
      (progressData || []).forEach((p: any) => {
        progressMap.set(p.course_id, p);
      });

      const courses: Course[] = (allCourses || []).map((c: any) => {
        const progress = progressMap.get(c.id);
        return {
          id: c.id,
          title: c.course_name || "Curso",
          category: extractCategory(c.metadata),
          duration: `${c.duration_hours || 0} horas`,
          progress: progress?.progress_percent || 0,
          status: mapProgressToStatus(progress),
          mandatory: c.metadata?.mandatory === true,
          deadline: c.metadata?.deadline || undefined,
          certificate: c.certificate_template !== null,
          rating: c.metadata?.rating || undefined,
        };
      });

      // Fetch certificates from maritime_certificates
      const { data: crewMember } = await supabase
        .from("crew_members")
        .select("id")
        .or(`auth_user_id.eq.${user.id},user_id.eq.${user.id}`)
        .single();

      let certificates: Certificate[] = [];

      if (crewMember) {
        const { data: certs } = await supabase
          .from("maritime_certificates")
          .select("*")
          .eq("crew_member_id", crewMember.id);

        certificates = (certs || []).map((cert: any) => ({
          id: cert.id,
          name: cert.certificate_type || "Certificado",
          issueDate: cert.issue_date || cert.created_at,
          expiryDate: cert.expiry_date || undefined,
          status: getExpiryStatus(cert.expiry_date),
        }));
      }

      return { courses, certificates };
    },
  });

  return {
    courses: data?.courses || [],
    certificates: data?.certificates || [],
    isLoading,
  };
}

function extractCategory(metadata: any): string {
  if (!metadata) return "Geral";
  if (typeof metadata === "string") {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      return "Geral";
    }
  }
  return metadata?.category || "Geral";
}

function mapProgressToStatus(progress: any): Course["status"] {
  if (!progress) return "not_started";
  if (progress.status === "completed" || progress.progress_percent >= 100) return "completed";
  if (progress.progress_percent > 0) return "in_progress";
  return "not_started";
}

function getExpiryStatus(expiryDate: string | null): Certificate["status"] {
  if (!expiryDate) return "valid";
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 30) return "expiring";
  return "valid";
}
