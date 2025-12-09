/**
 * Document Workflow Service
 * PATCH 850 - ISM/MLC/PSC Document Management
 */

import { supabase } from '@/integrations/supabase/client';

export type DocumentCategory = 
  | 'ism_procedure'
  | 'mlc_agreement'
  | 'psc_checklist'
  | 'audit_report'
  | 'safety_manual'
  | 'crew_certificate'
  | 'vessel_certificate'
  | 'emergency_procedure'
  | 'training_record'
  | 'maintenance_procedure';

export type ApprovalStatus = 
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'superseded'
  | 'archived';

export interface Document {
  id: string;
  organization_id: string;
  vessel_id?: string;
  document_number: string;
  title: string;
  category: DocumentCategory;
  description?: string;
  version: number;
  revision_number?: string;
  is_current_version: boolean;
  status: ApprovalStatus;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  checksum?: string;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  ism_code_reference?: string;
  mlc_reference?: string;
  solas_reference?: string;
  marpol_reference?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  document_id: string;
  version: number;
  step_order: number;
  step_name: string;
  required_role?: string;
  approver_id?: string;
  approver_name?: string;
  approver_role?: string;
  decision: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments?: string;
  signature_data?: Record<string, unknown>;
  signed_at?: string;
  ip_address?: string;
  created_at: string;
}

export interface DistributionRecord {
  id: string;
  document_id: string;
  version: number;
  recipient_type: 'user' | 'department' | 'vessel' | 'role';
  recipient_id?: string;
  recipient_name?: string;
  distribution_method: 'email' | 'system' | 'print' | 'manual';
  distributed_at: string;
  distributed_by?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledgment_signature?: Record<string, unknown>;
  first_accessed_at?: string;
  access_count: number;
}

/**
 * Create a new document
 */
export async function createDocument(
  data: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'version' | 'is_current_version'>
): Promise<Document | null> {
  // Use type assertion for new columns not yet in generated types
  const insertData = {
    organization_id: data.organization_id,
    vessel_id: data.vessel_id,
    document_number: data.document_number,
    title: data.title,
    category: data.category,
    description: data.description,
    status: 'draft',
  } as Record<string, unknown>;

  const { data: doc, error } = await supabase
    .from('document_registry')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    console.error('Failed to create document:', error);
    return null;
  }

  return doc as unknown as Document;
}

/**
 * Get documents by organization
 */
export async function getDocuments(
  organizationId: string,
  filters?: {
    category?: DocumentCategory;
    status?: ApprovalStatus;
    vesselId?: string;
  }
): Promise<Document[]> {
  let query = supabase
    .from('document_registry')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_current_version', true);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.vesselId) {
    query = query.eq('vessel_id', filters.vesselId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }

  return data as unknown as Document[];
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: ApprovalStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('document_registry')
    .update({ status })
    .eq('id', documentId);

  if (error) {
    console.error('Failed to update document status:', error);
    return false;
  }

  return true;
}

/**
 * Create a new version of a document
 */
export async function createNewVersion(
  documentId: string,
  changeSummary: string,
  userId: string
): Promise<Document | null> {
  // Get current document
  const { data: current, error: fetchError } = await supabase
    .from('document_registry')
    .select('*')
    .eq('id', documentId)
    .single();

  if (fetchError || !current) {
    console.error('Failed to fetch document:', fetchError);
    return null;
  }

  // Mark current as superseded
  await supabase
    .from('document_registry')
    .update({ 
      is_current_version: false,
      status: 'superseded'
    })
    .eq('id', documentId);

  // Create new version
  const newVersion = (current as any).version + 1;
  const { data: newDoc, error: createError } = await supabase
    .from('document_registry')
    .insert({
      ...current,
      id: undefined,
      version: newVersion,
      is_current_version: true,
      status: 'draft',
      parent_document_id: documentId,
      created_by: userId,
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single();

  if (createError) {
    console.error('Failed to create new version:', createError);
    return null;
  }

  // Record version history
  await supabase.from('document_versions').insert({
    document_id: documentId,
    version: (current as any).version,
    file_path: (current as any).file_path,
    file_size: (current as any).file_size,
    checksum: (current as any).checksum,
    change_summary: changeSummary,
    changed_by: userId,
    document_snapshot: current,
  });

  return newDoc as unknown as Document;
}

/**
 * Submit document for approval
 */
export async function submitForApproval(
  documentId: string,
  approvalSteps: Array<{ step_name: string; required_role?: string }>
): Promise<boolean> {
  // Get document
  const { data: doc, error: fetchError } = await supabase
    .from('document_registry')
    .select('*')
    .eq('id', documentId)
    .single();

  if (fetchError || !doc) {
    console.error('Failed to fetch document:', fetchError);
    return false;
  }

  // Create approval steps
  const steps = approvalSteps.map((step, index) => ({
    document_id: documentId,
    version: (doc as any).version,
    step_order: index + 1,
    step_name: step.step_name,
    required_role: step.required_role,
    decision: 'pending',
  }));

  const { error: stepsError } = await supabase
    .from('document_approvals')
    .insert(steps);

  if (stepsError) {
    console.error('Failed to create approval steps:', stepsError);
    return false;
  }

  // Update document status
  await updateDocumentStatus(documentId, 'pending_approval');

  return true;
}

/**
 * Approve or reject a document
 */
export async function processApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  userId: string,
  userName: string,
  userRole: string,
  comments?: string,
  signatureData?: Record<string, unknown>
): Promise<boolean> {
  const updateData = {
    decision,
    approver_id: userId,
    approver_name: userName,
    approver_role: userRole,
    comments,
    signature_data: signatureData ? JSON.stringify(signatureData) : null,
    signed_at: new Date().toISOString(),
  } as Record<string, unknown>;

  const { error } = await supabase
    .from('document_approvals')
    .update(updateData as any)
    .eq('id', approvalId);

  if (error) {
    console.error('Failed to process approval:', error);
    return false;
  }

  return true;
}

/**
 * Distribute document to recipients
 */
export async function distributeDocument(
  documentId: string,
  version: number,
  recipients: Array<{
    type: 'user' | 'department' | 'vessel' | 'role';
    id?: string;
    name: string;
  }>,
  method: 'email' | 'system' | 'print' | 'manual',
  distributedBy: string
): Promise<boolean> {
  const records = recipients.map(r => ({
    document_id: documentId,
    version,
    recipient_type: r.type,
    recipient_id: r.id,
    recipient_name: r.name,
    distribution_method: method,
    distributed_by: distributedBy,
    acknowledged: false,
    access_count: 0,
  }));

  const { error } = await supabase
    .from('document_distribution')
    .insert(records);

  if (error) {
    console.error('Failed to distribute document:', error);
    return false;
  }

  return true;
}

/**
 * Acknowledge document receipt
 */
export async function acknowledgeDocument(
  distributionId: string,
  signatureData?: Record<string, unknown>
): Promise<boolean> {
  const updateData = {
    acknowledged: true,
    acknowledged_at: new Date().toISOString(),
    acknowledgment_signature: signatureData ? JSON.stringify(signatureData) : null,
  } as Record<string, unknown>;

  const { error } = await supabase
    .from('document_distribution')
    .update(updateData as any)
    .eq('id', distributionId);

  if (error) {
    console.error('Failed to acknowledge document:', error);
    return false;
  }

  return true;
}

/**
 * Get document approval history
 */
export async function getApprovalHistory(
  documentId: string
): Promise<ApprovalStep[]> {
  const { data, error } = await supabase
    .from('document_approvals')
    .select('*')
    .eq('document_id', documentId)
    .order('step_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch approval history:', error);
    return [];
  }

  return data as unknown as ApprovalStep[];
}

/**
 * Get document distribution records
 */
export async function getDistributionRecords(
  documentId: string
): Promise<DistributionRecord[]> {
  const { data, error } = await supabase
    .from('document_distribution')
    .select('*')
    .eq('document_id', documentId)
    .order('distributed_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch distribution records:', error);
    return [];
  }

  return data as unknown as DistributionRecord[];
}

/**
 * Calculate document checksum
 */
export async function calculateChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
