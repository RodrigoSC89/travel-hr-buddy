/**
 * Document Version Control Engine
 * Enterprise-grade versioning with diff, merge, and branching
 * PATCH 865 - All-in-One EDMS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string;
  majorVersion: number;
  minorVersion: number;
  revisionVersion: number;
  status: "draft" | "pending_review" | "approved" | "published" | "archived" | "superseded";
  checksum: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  createdBy: string;
  createdAt: Date;
  modifiedBy?: string;
  modifiedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  changelog: string;
  tags: string[];
  metadata: Record<string, unknown>;
  previousVersionId?: string;
  isLatest: boolean;
  isMajorRelease: boolean;
}

export interface VersionCompare {
  versionA: DocumentVersion;
  versionB: DocumentVersion;
  differences: VersionDiff[];
  similarity: number;
  changesCount: number;
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified";
}

export interface DocumentBranch {
  id: string;
  documentId: string;
  branchName: string;
  description: string;
  sourceVersionId: string;
  status: "active" | "merged" | "abandoned";
  createdBy: string;
  createdAt: Date;
  mergedAt?: Date;
  mergedBy?: string;
  mergeTargetVersionId?: string;
}

export interface CheckoutRecord {
  id: string;
  documentId: string;
  versionId: string;
  checkedOutBy: string;
  checkedOutAt: Date;
  dueDate?: Date;
  status: "active" | "returned" | "expired";
  notes?: string;
}

export interface VersionHistory {
  documentId: string;
  documentName: string;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  totalVersions: number;
  branches: DocumentBranch[];
  timeline: VersionTimelineEntry[];
}

export interface VersionTimelineEntry {
  timestamp: Date;
  action: string;
  actor: string;
  versionNumber: string;
  details: string;
}

class VersionControlEngine {
  private versions: Map<string, DocumentVersion[]> = new Map();
  private branches: Map<string, DocumentBranch[]> = new Map();
  private checkouts: Map<string, CheckoutRecord> = new Map();
  private locks: Set<string> = new Set();

  /**
   * Create initial version for a new document
   */
  async createInitialVersion(
    documentId: string,
    createdBy: string,
    metadata: {
      filePath: string;
      fileSize: number;
      mimeType: string;
      changelog?: string;
      tags?: string[];
    }
  ): Promise<DocumentVersion> {
    const version: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId,
      versionNumber: "1.0.0",
      majorVersion: 1,
      minorVersion: 0,
      revisionVersion: 0,
      status: "draft",
      checksum: await this.generateChecksum(metadata.filePath),
      fileSize: metadata.fileSize,
      filePath: metadata.filePath,
      mimeType: metadata.mimeType,
      createdBy,
      createdAt: new Date(),
      changelog: metadata.changelog || "Initial version",
      tags: metadata.tags || [],
      metadata: {},
      isLatest: true,
      isMajorRelease: true
    };

    const docVersions = this.versions.get(documentId) || [];
    docVersions.push(version);
    this.versions.set(documentId, docVersions);

    await this.logVersionAction("created", version, createdBy);
    return version;
  }

  /**
   * Create new version (check in)
   */
  async createVersion(
    documentId: string,
    createdBy: string,
    versionType: "major" | "minor" | "revision",
    metadata: {
      filePath: string;
      fileSize: number;
      mimeType: string;
      changelog: string;
      tags?: string[];
    }
  ): Promise<DocumentVersion | null> {
    // Check if document is locked by another user
    if (this.isLockedByOther(documentId, createdBy)) {
      logger.error("Document is locked by another user", new Error("Document locked"));
      return null;
    }

    const docVersions = this.versions.get(documentId) || [];
    const currentVersion = docVersions.find(v => v.isLatest);

    if (!currentVersion) {
      return this.createInitialVersion(documentId, createdBy, metadata);
    }

    // Calculate new version number
    let majorVersion = currentVersion.majorVersion;
    let minorVersion = currentVersion.minorVersion;
    let revisionVersion = currentVersion.revisionVersion;

    switch (versionType) {
      case "major":
        majorVersion++;
        minorVersion = 0;
        revisionVersion = 0;
        break;
      case "minor":
        minorVersion++;
        revisionVersion = 0;
        break;
      case "revision":
        revisionVersion++;
        break;
    }

    const versionNumber = `${majorVersion}.${minorVersion}.${revisionVersion}`;

    // Mark previous version as not latest
    currentVersion.isLatest = false;
    currentVersion.status = "superseded";

    const newVersion: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId,
      versionNumber,
      majorVersion,
      minorVersion,
      revisionVersion,
      status: "draft",
      checksum: await this.generateChecksum(metadata.filePath),
      fileSize: metadata.fileSize,
      filePath: metadata.filePath,
      mimeType: metadata.mimeType,
      createdBy,
      createdAt: new Date(),
      changelog: metadata.changelog,
      tags: metadata.tags || currentVersion.tags,
      metadata: {},
      previousVersionId: currentVersion.id,
      isLatest: true,
      isMajorRelease: versionType === "major"
    };

    docVersions.push(newVersion);
    this.versions.set(documentId, docVersions);

    // Release checkout if active
    this.releaseCheckout(documentId, createdBy);

    await this.logVersionAction("created", newVersion, createdBy);
    return newVersion;
  }

  /**
   * Check out document for editing
   */
  async checkOut(
    documentId: string,
    userId: string,
    options?: { dueDate?: Date; notes?: string }
  ): Promise<CheckoutRecord | null> {
    // Check if already checked out
    const existingCheckout = this.checkouts.get(documentId);
    if (existingCheckout && existingCheckout.status === "active") {
      if (existingCheckout.checkedOutBy !== userId) {
        logger.error("Document already checked out", new Error("Already checked out"));
        return null;
      }
      return existingCheckout;
    }

    const docVersions = this.versions.get(documentId);
    const currentVersion = docVersions?.find(v => v.isLatest);
    if (!currentVersion) {
      logger.error("Document not found", new Error("Not found"));
      return null;
    }

    const checkout: CheckoutRecord = {
      id: `checkout-${Date.now()}`,
      documentId,
      versionId: currentVersion.id,
      checkedOutBy: userId,
      checkedOutAt: new Date(),
      dueDate: options?.dueDate,
      status: "active",
      notes: options?.notes
    };

    this.checkouts.set(documentId, checkout);
    this.locks.add(documentId);

    await this.logVersionAction("checked_out", currentVersion, userId);
    return checkout;
  }

  /**
   * Check in document (release checkout)
   */
  releaseCheckout(documentId: string, userId: string): boolean {
    const checkout = this.checkouts.get(documentId);
    if (!checkout || checkout.checkedOutBy !== userId) {
      return false;
    }

    checkout.status = "returned";
    this.locks.delete(documentId);
    return true;
  }

  /**
   * Compare two versions
   */
  async compareVersions(versionAId: string, versionBId: string): Promise<VersionCompare | null> {
    let versionA: DocumentVersion | undefined;
    let versionB: DocumentVersion | undefined;

    // Find versions
    for (const versions of this.versions.values()) {
      for (const v of versions) {
        if (v.id === versionAId) versionA = v;
        if (v.id === versionBId) versionB = v;
      }
    }

    if (!versionA || !versionB) {
      return null;
    }

    const differences: VersionDiff[] = [];

    // Compare metadata fields using type-safe access
    const getFieldValue = (version: DocumentVersion, field: string): unknown => {
      switch (field) {
        case "fileSize": return version.fileSize;
        case "changelog": return version.changelog;
        case "tags": return version.tags;
        case "status": return version.status;
        default: return undefined;
      }
    };

    const fieldsToCompare = ["fileSize", "changelog", "tags", "status"];
    for (const field of fieldsToCompare) {
      const oldVal = getFieldValue(versionA, field);
      const newVal = getFieldValue(versionB, field);
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        differences.push({
          field,
          oldValue: oldVal,
          newValue: newVal,
          changeType: "modified"
        });
      }
    }

    // Calculate similarity (simplified)
    const totalFields = fieldsToCompare.length;
    const changedFields = differences.length;
    const similarity = ((totalFields - changedFields) / totalFields) * 100;

    return {
      versionA,
      versionB,
      differences,
      similarity,
      changesCount: differences.length
    };
  }

  /**
   * Create a branch for parallel editing
   */
  async createBranch(
    documentId: string,
    branchName: string,
    createdBy: string,
    description?: string
  ): Promise<DocumentBranch | null> {
    const docVersions = this.versions.get(documentId);
    const currentVersion = docVersions?.find(v => v.isLatest);
    
    if (!currentVersion) {
      return null;
    }

    const branch: DocumentBranch = {
      id: `branch-${Date.now()}`,
      documentId,
      branchName,
      description: description || `Branch from v${currentVersion.versionNumber}`,
      sourceVersionId: currentVersion.id,
      status: "active",
      createdBy,
      createdAt: new Date()
    };

    const docBranches = this.branches.get(documentId) || [];
    docBranches.push(branch);
    this.branches.set(documentId, docBranches);

    return branch;
  }

  /**
   * Merge branch back to main
   */
  async mergeBranch(
    branchId: string,
    mergedBy: string,
    changelog: string
  ): Promise<DocumentVersion | null> {
    let targetBranch: DocumentBranch | undefined;
    let documentId: string | undefined;

    // Find branch
    for (const [docId, branches] of this.branches.entries()) {
      const branch = branches.find(b => b.id === branchId);
      if (branch) {
        targetBranch = branch;
        documentId = docId;
        break;
      }
    }

    if (!targetBranch || !documentId) {
      return null;
    }

    // Create merge version
    const newVersion = await this.createVersion(documentId, mergedBy, "minor", {
      filePath: "",
      fileSize: 0,
      mimeType: "",
      changelog: `Merged from branch: ${targetBranch.branchName}. ${changelog}`
    });

    if (newVersion) {
      targetBranch.status = "merged";
      targetBranch.mergedAt = new Date();
      targetBranch.mergedBy = mergedBy;
      targetBranch.mergeTargetVersionId = newVersion.id;
    }

    return newVersion;
  }

  /**
   * Rollback to previous version
   */
  async rollback(
    documentId: string,
    targetVersionId: string,
    rolledBackBy: string,
    reason: string
  ): Promise<DocumentVersion | null> {
    const docVersions = this.versions.get(documentId);
    if (!docVersions) return null;

    const targetVersion = docVersions.find(v => v.id === targetVersionId);
    if (!targetVersion) return null;

    // Create new version based on rollback
    const newVersion = await this.createVersion(documentId, rolledBackBy, "revision", {
      filePath: targetVersion.filePath,
      fileSize: targetVersion.fileSize,
      mimeType: targetVersion.mimeType,
      changelog: `Rollback to v${targetVersion.versionNumber}: ${reason}`
    });

    return newVersion;
  }

  /**
   * Get version history for document
   */
  async getVersionHistory(documentId: string): Promise<VersionHistory | null> {
    const docVersions = this.versions.get(documentId);
    if (!docVersions || docVersions.length === 0) return null;

    const currentVersion = docVersions.find(v => v.isLatest);
    if (!currentVersion) return null;

    const docBranches = this.branches.get(documentId) || [];

    // Build timeline
    const timeline: VersionTimelineEntry[] = docVersions.map(v => ({
      timestamp: v.createdAt,
      action: v.isMajorRelease ? "Major Release" : "Version Created",
      actor: v.createdBy,
      versionNumber: v.versionNumber,
      details: v.changelog
    }));

    // Sort timeline by date
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      documentId,
      documentName: `Document ${documentId}`,
      currentVersion,
      versions: docVersions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      totalVersions: docVersions.length,
      branches: docBranches,
      timeline
    };
  }

  /**
   * Approve version for publishing
   */
  async approveVersion(
    versionId: string,
    approvedBy: string
  ): Promise<boolean> {
    for (const versions of this.versions.values()) {
      const version = versions.find(v => v.id === versionId);
      if (version) {
        version.status = "approved";
        version.approvedBy = approvedBy;
        version.approvedAt = new Date();
        await this.logVersionAction("approved", version, approvedBy);
        return true;
      }
    }
    return false;
  }

  /**
   * Publish approved version
   */
  async publishVersion(versionId: string, publishedBy: string): Promise<boolean> {
    for (const versions of this.versions.values()) {
      const version = versions.find(v => v.id === versionId);
      if (version && version.status === "approved") {
        version.status = "published";
        await this.logVersionAction("published", version, publishedBy);
        return true;
      }
    }
    return false;
  }

  /**
   * Check if document is locked by another user
   */
  private isLockedByOther(documentId: string, userId: string): boolean {
    if (!this.locks.has(documentId)) return false;
    const checkout = this.checkouts.get(documentId);
    return checkout?.checkedOutBy !== userId && checkout?.status === "active";
  }

  /**
   * Generate checksum for file integrity
   */
  private async generateChecksum(filePath: string): Promise<string> {
    // In production, calculate actual file hash
    const encoder = new TextEncoder();
    const data = encoder.encode(filePath + Date.now());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Log version action to audit trail
   */
  private async logVersionAction(
    action: string,
    version: DocumentVersion,
    actorId: string
  ): Promise<void> {
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Version ${action}: ${version.versionNumber}`,
        module_name: "version_control",
        interaction_type: `version_${action}`,
        ai_response: JSON.stringify({
          versionId: version.id,
          documentId: version.documentId,
          versionNumber: version.versionNumber,
          actor: actorId
        })
      });
    } catch (error) {
      logger.error("Error logging version action", error as Error);
    }
  }

  /**
   * Get checkout status
   */
  getCheckoutStatus(documentId: string): CheckoutRecord | null {
    const checkout = this.checkouts.get(documentId);
    return checkout?.status === "active" ? checkout : null;
  }

  /**
   * Get all active branches
   */
  getActiveBranches(documentId: string): DocumentBranch[] {
    return (this.branches.get(documentId) || []).filter(b => b.status === "active");
  }
}

export const versionControlEngine = new VersionControlEngine();
