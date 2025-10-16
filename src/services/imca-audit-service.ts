/**
 * IMCA DP Technical Audit Service
 * 
 * Service layer for IMCA DP Technical Audit System operations including:
 * - Generating AI-powered audit reports
 * - CRUD operations for audit records
 * - Exporting audit reports
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  IMCAAuditInput, 
  IMCAAuditReport, 
  IMCAAuditRecord 
} from '@/types/imca-audit';
import { exportAuditToMarkdown } from '@/types/imca-audit';

/**
 * Generate an IMCA audit report using AI
 */
export async function generateIMCAAudit(
  input: IMCAAuditInput
): Promise<IMCAAuditReport> {
  try {
    const { data, error } = await supabase.functions.invoke('imca-audit-generator', {
      body: input
    });

    if (error) {
      console.error('Error generating IMCA audit:', error);
      throw new Error(`Failed to generate audit: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from audit generation');
    }

    return data as IMCAAuditReport;
  } catch (error) {
    console.error('Error in generateIMCAAudit:', error);
    throw error;
  }
}

/**
 * Save an audit report to the database
 */
export async function saveIMCAAudit(
  audit: IMCAAuditReport,
  status: 'draft' | 'in_progress' | 'completed' | 'approved' = 'draft'
): Promise<IMCAAuditRecord> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const record: Partial<IMCAAuditRecord> = {
      user_id: user.id,
      title: `Auditoria DP - ${audit.vesselName}`,
      description: audit.auditObjective,
      status,
      audit_date: audit.auditDate,
      score: audit.overallScore,
      findings: audit,
      recommendations: audit.recommendations,
      metadata: {
        dpClass: audit.dpClass,
        location: audit.location,
        standardsCount: audit.standards.length,
        modulesCount: audit.modules.length,
        nonConformitiesCount: audit.nonConformities.length
      }
    };

    const { data, error } = await supabase
      .from('auditorias_imca')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving IMCA audit:', error);
      throw new Error(`Failed to save audit: ${error.message}`);
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error('Error in saveIMCAAudit:', error);
    throw error;
  }
}

/**
 * Get all audit records for the current user
 */
export async function getIMCAAudits(): Promise<IMCAAuditRecord[]> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching IMCA audits:', error);
      throw new Error(`Failed to fetch audits: ${error.message}`);
    }

    return (data || []) as IMCAAuditRecord[];
  } catch (error) {
    console.error('Error in getIMCAAudits:', error);
    throw error;
  }
}

/**
 * Get a specific audit record by ID
 */
export async function getIMCAAudit(id: string): Promise<IMCAAuditRecord | null> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      console.error('Error fetching IMCA audit:', error);
      throw new Error(`Failed to fetch audit: ${error.message}`);
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error('Error in getIMCAAudit:', error);
    throw error;
  }
}

/**
 * Update an existing audit record
 */
export async function updateIMCAAudit(
  id: string,
  updates: Partial<IMCAAuditRecord>
): Promise<IMCAAuditRecord> {
  try {
    const { data, error } = await supabase
      .from('auditorias_imca')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating IMCA audit:', error);
      throw new Error(`Failed to update audit: ${error.message}`);
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error('Error in updateIMCAAudit:', error);
    throw error;
  }
}

/**
 * Delete an audit record
 */
export async function deleteIMCAAudit(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('auditorias_imca')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting IMCA audit:', error);
      throw new Error(`Failed to delete audit: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteIMCAAudit:', error);
    throw error;
  }
}

/**
 * Export an audit report as Markdown
 */
export async function exportIMCAAudit(
  audit: IMCAAuditReport,
  filename?: string
): Promise<void> {
  try {
    const markdown = exportAuditToMarkdown(audit);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `auditoria-imca-${audit.vesselName}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting IMCA audit:', error);
    throw error;
  }
}
