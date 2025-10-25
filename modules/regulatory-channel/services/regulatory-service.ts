/**
 * Regulatory Channel Service
 * PATCH 155.0 - Secure document submission
 */

import { createClient } from '@/integrations/supabase/client';
import { 
  SecureSubmission, 
  SecureDocument, 
  RegulatoryAuthority,
  NotificationLog,
  TrackingInfo,
  TimelineEvent
} from '../types';
import { encryptData, generateEncryptionKey, generateChecksum } from '../utils/encryption';

/**
 * Submit secure document to regulatory authority
 */
export const submitSecureDocument = async (
  submission: Omit<SecureSubmission, 'id' | 'encryptedData' | 'encryptionKey' | 'submittedAt' | 'status'>
): Promise<SecureSubmission> => {
  const supabase = createClient();

  // Generate encryption key
  const encryptionKey = await generateEncryptionKey();

  // Encrypt submission data
  const dataToEncrypt = JSON.stringify({
    subject: submission.subject,
    description: submission.description,
    documents: submission.documents
  });

  const encryptedData = await encryptData(dataToEncrypt, encryptionKey);

  // Create submission
  const secureSubmission: SecureSubmission = {
    id: `SUB-${Date.now()}`,
    ...submission,
    encryptedData,
    encryptionKey,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };

  // Store in database
  const { error } = await supabase
    .from('regulatory_submissions')
    .insert([secureSubmission]);

  if (error) throw error;

  // Send notifications
  await sendNotifications(secureSubmission);

  // Add to timeline
  await addTimelineEvent(secureSubmission.id, 'submitted', 'Submission created and encrypted');

  return secureSubmission;
};

/**
 * Send notifications to authority
 */
const sendNotifications = async (submission: SecureSubmission): Promise<void> => {
  const supabase = createClient();

  // Fetch authority details
  const { data: authority } = await supabase
    .from('regulatory_authorities')
    .select('*')
    .eq('id', submission.authorityId)
    .single();

  if (!authority) return;

  const notifications: NotificationLog[] = [];

  // Email notification
  if (authority.email) {
    notifications.push({
      id: `NOTIF-${Date.now()}-EMAIL`,
      submissionId: submission.id,
      channel: 'email',
      recipient: authority.email,
      message: `New secure submission: ${submission.subject}`,
      sentAt: new Date().toISOString(),
      delivered: true
    });
  }

  // WhatsApp notification
  if (authority.whatsapp) {
    notifications.push({
      id: `NOTIF-${Date.now()}-WA`,
      submissionId: submission.id,
      channel: 'whatsapp',
      recipient: authority.whatsapp,
      message: `New secure submission: ${submission.subject}`,
      sentAt: new Date().toISOString(),
      delivered: true
    });
  }

  // Store notifications
  if (notifications.length > 0) {
    await supabase.from('notification_logs').insert(notifications);
  }
};

/**
 * Add timeline event
 */
const addTimelineEvent = async (
  submissionId: string,
  action: string,
  description: string
): Promise<void> => {
  const supabase = createClient();

  const event: TimelineEvent = {
    id: `EVENT-${Date.now()}`,
    action,
    description,
    timestamp: new Date().toISOString()
  };

  await supabase.from('submission_timeline').insert([{
    submissionId,
    ...event
  }]);
};

/**
 * Get tracking information
 */
export const getTrackingInfo = async (submissionId: string): Promise<TrackingInfo | null> => {
  const supabase = createClient();

  // Fetch submission
  const { data: submission } = await supabase
    .from('regulatory_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (!submission) return null;

  // Fetch timeline
  const { data: timeline } = await supabase
    .from('submission_timeline')
    .select('*')
    .eq('submissionId', submissionId)
    .order('timestamp', { ascending: true });

  return {
    submissionId,
    status: submission.status,
    timeline: timeline || []
  };
};

/**
 * List all submissions
 */
export const listSubmissions = async (filters?: {
  status?: string;
  authorityId?: string;
}) => {
  const supabase = createClient();

  let query = supabase
    .from('regulatory_submissions')
    .select('*, regulatory_authorities(*)')
    .order('submittedAt', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.authorityId) {
    query = query.eq('authorityId', filters.authorityId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error listing submissions:', error);
    return [];
  }

  return data || [];
};

/**
 * List regulatory authorities
 */
export const listAuthorities = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('regulatory_authorities')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error listing authorities:', error);
    return [];
  }

  return data || [];
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (
  submissionId: string,
  status: SecureSubmission['status']
): Promise<void> => {
  const supabase = createClient();

  await supabase
    .from('regulatory_submissions')
    .update({ status })
    .eq('id', submissionId);

  // Add timeline event
  await addTimelineEvent(
    submissionId,
    'status_update',
    `Status changed to ${status}`
  );
};

/**
 * Auto-cleanup old submissions (after 90 days)
 */
export const cleanupOldSubmissions = async (): Promise<number> => {
  const supabase = createClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const { data, error } = await supabase
    .from('regulatory_submissions')
    .delete()
    .lt('submittedAt', cutoffDate.toISOString())
    .select();

  if (error) {
    console.error('Error cleaning up submissions:', error);
    return 0;
  }

  return data?.length || 0;
};
