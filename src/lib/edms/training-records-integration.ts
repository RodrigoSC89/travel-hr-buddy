/**
 * Training Records Integration - LMS/Academy Document Bridge
 * Connects training completion with document management
 * PATCH 864
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type TrainingType =
  | "mandatory"
  | "regulatory"
  | "company_specific"
  | "familiarization"
  | "refresher"
  | "assessment"
  | "drill"
  | "cbT"
  | "classroom"
  | "onboard"
  | "simulator";

export type CertificationType =
  | "STCW"
  | "flag_endorsement"
  | "company_certificate"
  | "competency"
  | "proficiency"
  | "medical"
  | "security"
  | "tanker"
  | "passenger"
  | "specialized";

export interface TrainingRecord {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  courseId: string;
  courseName: string;
  trainingType: TrainingType;
  
  // Completion details
  startDate: Date;
  completionDate?: Date;
  expiryDate?: Date;
  status: "enrolled" | "in_progress" | "completed" | "failed" | "expired" | "cancelled";
  score?: number;
  passingScore?: number;
  
  // Certificate details
  certificateGenerated: boolean;
  certificateId?: string;
  certificateNumber?: string;
  certificationType?: CertificationType;
  issuingAuthority?: string;
  
  // Documents
  trainingMaterials: string[];
  assessmentDocuments: string[];
  evidenceDocuments: string[];
  certificateDocumentId?: string;
  
  // Verification
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;
  
  // Regulatory
  regulationReference?: string;
  stcwCode?: string;
  complianceRequired: boolean;
  
  // Vessel
  vesselId?: string;
  vesselName?: string;
  
  // Metadata
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type: CertificationType;
  htmlTemplate: string;
  pdfSettings: {
    orientation: "portrait" | "landscape";
    size: "A4" | "letter";
    margins: { top: number; right: number; bottom: number; left: number };
  };
  variables: {
    name: string;
    source: "training" | "crew" | "course" | "custom";
    field?: string;
    format?: string;
  }[];
  validityMonths?: number;
  requiresSignature: boolean;
  signatureFields: {
    role: string;
    label: string;
  }[];
  logoUrl?: string;
  watermarkUrl?: string;
  isActive: boolean;
}

export interface TrainingComplianceMatrix {
  crewMemberId: string;
  crewMemberName: string;
  rank: string;
  vesselId?: string;
  vesselName?: string;
  
  requirements: {
    requirement: string;
    trainingType: TrainingType;
    regulation?: string;
    frequency: "once" | "annual" | "biennial" | "5_year";
    status: "compliant" | "due_soon" | "overdue" | "not_required";
    lastCompleted?: Date;
    nextDue?: Date;
    trainingRecordId?: string;
  }[];
  
  summary: {
    totalRequired: number;
    compliant: number;
    dueSoon: number;
    overdue: number;
    compliancePercentage: number;
  };
  
  generatedAt: Date;
}

export interface TrainingGap {
  crewMemberId: string;
  crewMemberName: string;
  rank: string;
  gapType: "missing" | "expired" | "expiring_soon";
  requirement: string;
  regulation?: string;
  dueDate?: Date;
  priority: "critical" | "high" | "medium" | "low";
  recommendedCourse?: string;
  estimatedCompletionTime?: string;
}

class TrainingRecordsIntegration {
  /**
   * Create training record with automatic document linking
   */
  async createTrainingRecord(
    record: Omit<TrainingRecord, "id" | "createdAt" | "updatedAt" | "certificateGenerated">
  ): Promise<TrainingRecord> {
    try {
      const newRecord: TrainingRecord = {
        ...record,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        certificateGenerated: false
      };

      // If completed, check for auto-certificate generation
      if (newRecord.status === "completed" && newRecord.score && newRecord.passingScore) {
        if (newRecord.score >= newRecord.passingScore) {
          await this.generateCertificate(newRecord);
        }
      }

      // Link training materials to document management
      await this.linkTrainingDocuments(newRecord);

      // Save record
      await this.saveTrainingRecord(newRecord);

      // Update compliance matrix
      await this.updateComplianceStatus(newRecord.crewMemberId);

      logger.info("Training record created", { recordId: newRecord.id });
      return newRecord;
    } catch (error) {
      logger.error("Error creating training record", error as Error);
      throw error;
    }
  }

  /**
   * Generate certificate from template
   */
  async generateCertificate(record: TrainingRecord): Promise<{
    certificateId: string;
    certificateNumber: string;
    documentId: string;
    pdfUrl: string;
  }> {
    try {
      // Get appropriate template
      const template = await this.getCertificateTemplate(record);
      if (!template) {
        throw new Error("No suitable certificate template found");
      }

      // Generate certificate number
      const certificateNumber = await this.generateCertificateNumber(template.type);

      // Get crew member details
      const crewDetails = await this.getCrewMemberDetails(record.crewMemberId);

      // Get course details
      const courseDetails = await this.getCourseDetails(record.courseId);

      // Build variable values
      const variables: Record<string, string> = {
        certificateNumber,
        crewMemberName: record.crewMemberName,
        courseName: record.courseName,
        completionDate: record.completionDate?.toLocaleDateString() || "",
        expiryDate: record.expiryDate?.toLocaleDateString() || "",
        score: record.score?.toString() || "",
        rank: crewDetails?.rank || "",
        vesselName: record.vesselName || "",
        issuingAuthority: record.issuingAuthority || "Nautilus Maritime Academy",
        issueDate: new Date().toLocaleDateString()
      };

      // Generate HTML content
      let htmlContent = template.htmlTemplate;
      for (const [key, value] of Object.entries(variables)) {
        htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, "g"), value);
      }

      // Generate PDF (would use jsPDF or similar)
      const pdfBlob = await this.generatePDF(htmlContent, template.pdfSettings);

      // Upload to storage
      const fileName = `certificates/${certificateNumber.replace(/\//g, "-")}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("enterprise-documents")
        .upload(fileName, pdfBlob);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from("ai_documents")
        .insert({
          file_name: `Certificate - ${record.courseName} - ${record.crewMemberName}.pdf`,
          file_type: "application/pdf",
          file_size: pdfBlob.size,
          storage_path: fileName,
          category: "certificate",
          ocr_status: "not_required"
        })
        .select()
        .single();

      if (docError) throw docError;

      // Update training record
      record.certificateGenerated = true;
      record.certificateId = docData.id;
      record.certificateNumber = certificateNumber;
      record.certificateDocumentId = docData.id;

      await this.updateTrainingRecord(record.id, {
        certificateGenerated: true,
        certificateId: docData.id,
        certificateNumber,
        certificateDocumentId: docData.id
      });

      const { data: urlData } = await supabase.storage
        .from("enterprise-documents")
        .getPublicUrl(fileName);

      logger.info("Certificate generated", { 
        recordId: record.id, 
        certificateNumber 
      });

      return {
        certificateId: docData.id,
        certificateNumber,
        documentId: docData.id,
        pdfUrl: urlData.publicUrl
      };
    } catch (error) {
      logger.error("Error generating certificate", error as Error);
      throw error;
    }
  }

  /**
   * Generate training compliance matrix for crew
   */
  async generateComplianceMatrix(
    crewMemberId: string,
    includeVesselRequirements: boolean = true
  ): Promise<TrainingComplianceMatrix> {
    try {
      // Get crew details
      const { data: crew } = await supabase
        .from("crew_members")
        .select("*")
        .eq("id", crewMemberId)
        .single();

      if (!crew) throw new Error("Crew member not found");

      const crewName = (crew as any).name || crew.employee_id || "Unknown";
      const crewRank = crew.rank || "";

      // Get training requirements for rank
      const requirements = await this.getRequirementsForRank(crewRank);

      // Get vessel-specific requirements if applicable
      if (includeVesselRequirements && crew.vessel_id) {
        const vesselReqs = await this.getVesselRequirements(crew.vessel_id);
        requirements.push(...vesselReqs);
      }

      // Get completed training
      const completedTraining = await this.getCrewTrainingRecords(crewMemberId);

      // Match requirements with completion
      const matrixRequirements = requirements.map(req => {
        const completion = completedTraining.find(t => 
          t.courseName.toLowerCase().includes(req.requirement.toLowerCase()) ||
          t.stcwCode === req.stcwCode
        );

        let status: "compliant" | "due_soon" | "overdue" | "not_required";
        let nextDue: Date | undefined;

        if (!req.required) {
          status = "not_required";
        } else if (!completion) {
          status = "overdue";
        } else if (completion.expiryDate) {
          const daysToExpiry = Math.ceil(
            (completion.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysToExpiry < 0) {
            status = "overdue";
          } else if (daysToExpiry <= 90) {
            status = "due_soon";
          } else {
            status = "compliant";
          }
          nextDue = completion.expiryDate;
        } else {
          status = "compliant";
        }

        return {
          requirement: req.requirement,
          trainingType: req.trainingType,
          regulation: req.regulation,
          frequency: req.frequency,
          status,
          lastCompleted: completion?.completionDate,
          nextDue,
          trainingRecordId: completion?.id
        };
      });

      // Calculate summary
      const summary = {
        totalRequired: matrixRequirements.filter(r => r.status !== "not_required").length,
        compliant: matrixRequirements.filter(r => r.status === "compliant").length,
        dueSoon: matrixRequirements.filter(r => r.status === "due_soon").length,
        overdue: matrixRequirements.filter(r => r.status === "overdue").length,
        compliancePercentage: 0
      };

      summary.compliancePercentage = summary.totalRequired > 0
        ? Math.round((summary.compliant / summary.totalRequired) * 100)
        : 100;

      return {
        crewMemberId,
        crewMemberName: crewName,
        rank: crewRank,
        vesselId: crew.vessel_id || undefined,
        vesselName: "",
        requirements: matrixRequirements,
        summary,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error("Error generating compliance matrix", error as Error);
      throw error;
    }
  }

  /**
   * Identify training gaps across fleet
   */
  async identifyTrainingGaps(
    organizationId?: string,
    vesselId?: string
  ): Promise<TrainingGap[]> {
    try {
      const gaps: TrainingGap[] = [];

      // Get all crew members
      let query = supabase.from("crew_members").select("*");
      
      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data: crewMembers } = await query;

      for (const crew of crewMembers || []) {
        const crewId = crew.id;
        if (!crewId) continue;
        const matrix = await this.generateComplianceMatrix(crewId);
        const crewName = (crew as any).name || crew.employee_id || "Unknown";
        const crewRank = crew.rank || "";

        for (const req of matrix.requirements) {
          if (req.status === "overdue" || req.status === "due_soon") {
            let priority: "critical" | "high" | "medium" | "low";
            
            if (req.status === "overdue") {
              priority = req.regulation?.includes("STCW") ? "critical" : "high";
            } else {
              const daysToExpiry = req.nextDue 
                ? Math.ceil((req.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 0;
              priority = daysToExpiry <= 30 ? "high" : "medium";
            }

            gaps.push({
              crewMemberId: crewId,
              crewMemberName: crewName,
              rank: crewRank,
              gapType: req.status === "overdue" ? "expired" : "expiring_soon",
              requirement: req.requirement,
              regulation: req.regulation,
              dueDate: req.nextDue,
              priority,
              recommendedCourse: await this.findRecommendedCourse(req.requirement),
              estimatedCompletionTime: this.estimateCompletionTime(req.trainingType)
            });
          }
        }
      }

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      logger.info("Training gaps identified", { gapCount: gaps.length });
      return gaps;
    } catch (error) {
      logger.error("Error identifying training gaps", error as Error);
      throw error;
    }
  }

  /**
   * Auto-enroll crew in required training
   */
  async autoEnrollRequired(
    crewMemberId: string,
    gaps: TrainingGap[]
  ): Promise<{
    enrolled: { courseId: string; courseName: string }[];
    failed: { requirement: string; reason: string }[];
  }> {
    try {
      const enrolled: { courseId: string; courseName: string }[] = [];
      const failed: { requirement: string; reason: string }[] = [];

      for (const gap of gaps.filter(g => g.priority === "critical" || g.priority === "high")) {
        try {
          // Find available course
          const course = await this.findAvailableCourse(gap.requirement);
          
          if (!course) {
            failed.push({
              requirement: gap.requirement,
              reason: "No available course found"
            });
            continue;
          }

          // Create enrollment
          await this.createTrainingRecord({
            crewMemberId,
            crewMemberName: gap.crewMemberName,
            courseId: course.id,
            courseName: course.name,
            trainingType: "mandatory",
            startDate: new Date(),
            status: "enrolled",
            complianceRequired: true,
            regulationReference: gap.regulation,
            trainingMaterials: [],
            assessmentDocuments: [],
            evidenceDocuments: [],
            organizationId: "",
            metadata: { autoEnrolled: true }
          });

          enrolled.push({
            courseId: course.id,
            courseName: course.name
          });
        } catch (error) {
          failed.push({
            requirement: gap.requirement,
            reason: (error as Error).message
          });
        }
      }

      logger.info("Auto-enrollment completed", { 
        enrolled: enrolled.length, 
        failed: failed.length 
      });

      return { enrolled, failed };
    } catch (error) {
      logger.error("Error in auto-enrollment", error as Error);
      throw error;
    }
  }

  /**
   * Verify training certificate authenticity
   */
  async verifyCertificate(
    certificateNumber: string
  ): Promise<{
    valid: boolean;
    certificate?: {
      number: string;
      holderName: string;
      courseName: string;
      issueDate: Date;
      expiryDate?: Date;
      issuingAuthority: string;
    };
    verificationDate: Date;
    verificationCode: string;
  }> {
    try {
      // Find certificate by number
      const { data: records } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("certificate_issued", true)
        .limit(100);

      const record = (records || []).find(r => 
        (r.metadata as any)?.certificateNumber === certificateNumber
      );

      const verificationCode = crypto.randomUUID().split("-")[0].toUpperCase();

      if (!record) {
        return {
          valid: false,
          verificationDate: new Date(),
          verificationCode
        };
      }

      // Get course and crew details
      const courseId = record.course_id || "";
      const { data: course } = await supabase
        .from("academy_courses")
        .select("course_name")
        .eq("id", courseId)
        .single();

      return {
        valid: true,
        certificate: {
          number: certificateNumber,
          holderName: (record.metadata as any)?.holderName || "Unknown",
          courseName: course?.course_name || "Unknown Course",
          issueDate: new Date(record.completed_at || record.created_at!),
          expiryDate: (record.metadata as any)?.expiryDate 
            ? new Date((record.metadata as any).expiryDate) 
            : undefined,
          issuingAuthority: "Nautilus Maritime Academy"
        },
        verificationDate: new Date(),
        verificationCode
      };
    } catch (error) {
      logger.error("Error verifying certificate", error as Error);
      throw error;
    }
  }

  // Private helper methods
  private async getCertificateTemplate(record: TrainingRecord): Promise<CertificateTemplate | null> {
    // Would fetch from database - returning mock template
    return {
      id: "default",
      name: "Standard Certificate",
      type: "company_certificate",
      htmlTemplate: `
        <div style="font-family: Georgia, serif; padding: 40px; text-align: center;">
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>{{crewMemberName}}</h2>
          <p>has successfully completed</p>
          <h3>{{courseName}}</h3>
          <p>Score: {{score}}%</p>
          <p>Date: {{completionDate}}</p>
          <p>Certificate Number: {{certificateNumber}}</p>
        </div>
      `,
      pdfSettings: {
        orientation: "landscape",
        size: "A4",
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      variables: [],
      requiresSignature: false,
      signatureFields: [],
      isActive: true
    };
  }

  private async generateCertificateNumber(type: CertificationType): Promise<string> {
    const prefix = type.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}/${year}/${random}`;
  }

  private async generatePDF(html: string, settings: CertificateTemplate["pdfSettings"]): Promise<Blob> {
    // Would use jsPDF or similar - returning mock PDF
    return new Blob([html], { type: "application/pdf" });
  }

  private async getCrewMemberDetails(crewMemberId: string) {
    const { data } = await supabase
      .from("crew_members")
      .select("*")
      .eq("id", crewMemberId)
      .single();
    return data;
  }

  private async getCourseDetails(courseId: string) {
    const { data } = await supabase
      .from("academy_courses")
      .select("*")
      .eq("id", courseId)
      .single();
    return data;
  }

  private async linkTrainingDocuments(record: TrainingRecord) {
    // Link training materials to document management
  }

  private async saveTrainingRecord(record: TrainingRecord) {
    // Save to database
  }

  private async updateTrainingRecord(id: string, updates: Partial<TrainingRecord>) {
    // Update in database
  }

  private async updateComplianceStatus(crewMemberId: string) {
    // Update compliance matrix
  }

  private async getRequirementsForRank(rank: string) {
    // Get STCW and company requirements for rank
    const requirements = [
      { requirement: "Basic Safety Training", trainingType: "mandatory" as TrainingType, regulation: "STCW A-VI/1", frequency: "5_year" as const, required: true, stcwCode: "VI/1" },
      { requirement: "Security Awareness", trainingType: "regulatory" as TrainingType, regulation: "STCW A-VI/6", frequency: "5_year" as const, required: true, stcwCode: "VI/6" },
      { requirement: "Crowd Management", trainingType: "mandatory" as TrainingType, regulation: "STCW A-V/2", frequency: "5_year" as const, required: rank.includes("Officer"), stcwCode: "V/2" }
    ];
    return requirements;
  }

  private async getVesselRequirements(vesselId: string) {
    // Get vessel-specific training requirements
    return [];
  }

  private async getCrewTrainingRecords(crewMemberId: string): Promise<TrainingRecord[]> {
    // Fetch from database
    return [];
  }

  private async findRecommendedCourse(requirement: string): Promise<string | undefined> {
    const { data } = await supabase
      .from("academy_courses")
      .select("course_name")
      .ilike("course_name", `%${requirement}%`)
      .limit(1)
      .single();
    return data?.course_name;
  }

  private estimateCompletionTime(type: TrainingType): string {
    const estimates: Record<TrainingType, string> = {
      mandatory: "4-8 hours",
      regulatory: "8-16 hours",
      company_specific: "2-4 hours",
      familiarization: "1-2 hours",
      refresher: "2-4 hours",
      assessment: "1-2 hours",
      drill: "1 hour",
      cbT: "4-8 hours",
      classroom: "16-40 hours",
      onboard: "Ongoing",
      simulator: "8-16 hours"
    };
    return estimates[type] || "4-8 hours";
  }

  private async findAvailableCourse(requirement: string) {
    const { data } = await supabase
      .from("academy_courses")
      .select("id, course_name")
      .ilike("course_name", `%${requirement}%`)
      .eq("is_published", true)
      .limit(1)
      .single();
    return data ? { id: data.id, name: data.course_name } : null;
  }
}

export const trainingRecordsIntegration = new TrainingRecordsIntegration();
