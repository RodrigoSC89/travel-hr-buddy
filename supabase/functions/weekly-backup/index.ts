/**
 * PATCH 507: Weekly Backup Edge Function
 * Automated weekly snapshots of critical database tables
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupData {
  [tableName: string]: any[];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // List of critical tables to backup
    const tablesToBackup = [
      'profiles',
      'documents',
      'checklists',
      'missions',
      'crew_members',
      'audits',
      'mmi_jobs',
      'workflows',
      'templates',
      'ai_memory_events',
    ];

    console.log('Starting weekly backup...');

    // Create backup metadata entry
    const backupName = `backup_${new Date().toISOString().split('T')[0]}`;
    const { data: backupEntry, error: createError } = await supabaseClient
      .rpc('create_backup_snapshot', {
        p_backup_name: backupName,
        p_backup_type: 'weekly',
        p_tables_included: tablesToBackup,
        p_retention_days: 90,
      });

    if (createError) {
      throw new Error(`Failed to create backup entry: ${createError.message}`);
    }

    const backupId = backupEntry;
    console.log(`Created backup entry: ${backupId}`);

    // Update status to in_progress
    await supabaseClient.rpc('update_backup_status', {
      p_backup_id: backupId,
      p_status: 'in_progress',
    });

    // Collect data from all tables
    const backupData: BackupData = {};
    const recordsCounts: { [key: string]: number } = {};

    for (const table of tablesToBackup) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .limit(10000); // Reasonable limit for each table

        if (error) {
          console.warn(`Warning: Could not backup table ${table}:`, error.message);
          backupData[table] = [];
          recordsCounts[table] = 0;
        } else {
          backupData[table] = data || [];
          recordsCounts[table] = data?.length || 0;
          console.log(`Backed up ${recordsCounts[table]} records from ${table}`);
        }
      } catch (error) {
        console.error(`Error backing up table ${table}:`, error);
        backupData[table] = [];
        recordsCounts[table] = 0;
      }
    }

    // Convert to JSON
    const backupJson = JSON.stringify({
      backup_date: new Date().toISOString(),
      backup_id: backupId,
      tables: backupData,
      metadata: {
        total_tables: tablesToBackup.length,
        total_records: Object.values(recordsCounts).reduce((a, b) => a + b, 0),
      },
    });

    // Calculate checksum (simple MD5-like)
    const checksum = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(backupJson)
    );
    const checksumHex = Array.from(new Uint8Array(checksum))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Upload to Supabase Storage
    const storagePath = `backups/${backupName}.json`;
    const { error: uploadError } = await supabaseClient.storage
      .from('backups')
      .upload(storagePath, backupJson, {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      // Update status to failed
      await supabaseClient.rpc('update_backup_status', {
        p_backup_id: backupId,
        p_status: 'failed',
        p_error_message: `Storage upload failed: ${uploadError.message}`,
      });

      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Update backup status to completed
    await supabaseClient.rpc('update_backup_status', {
      p_backup_id: backupId,
      p_status: 'completed',
      p_storage_path: storagePath,
      p_file_size: new Blob([backupJson]).size,
      p_checksum: checksumHex,
      p_records_count: recordsCounts,
    });

    console.log('Backup completed successfully');

    // Cleanup expired backups
    const { data: cleanedCount } = await supabaseClient.rpc('cleanup_expired_backups');
    if (cleanedCount && cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired backups`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupId,
        backup_name: backupName,
        storage_path: storagePath,
        records_count: recordsCounts,
        file_size: new Blob([backupJson]).size,
        checksum: checksumHex,
        cleaned_expired: cleanedCount || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
