/**
 * User Management Hook
 * Provides user CRUD operations for admin panel
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface OrganizationUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  last_active_at?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
}

export interface UserInvite {
  email: string;
  role: string;
  department?: string;
  message?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  pending: number;
  managers: number;
}

export function useUserManagement() {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, inactive: 0, admins: 0, pending: 0, managers: 0 });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: OrganizationUser[] = (data || []).map((p) => ({
        id: p.id,
        email: p.email || '',
        full_name: p.full_name || p.email || '',
        role: (p as Record<string, unknown>).role as string || 'viewer',
        status: ((p.status as string) || 'active') as OrganizationUser['status'],
        created_at: p.created_at || new Date().toISOString(),
        last_login: (p as Record<string, unknown>).last_login as string | undefined,
        last_active_at: p.updated_at || undefined,
        avatar_url: p.avatar_url || undefined,
        department: p.department || undefined,
        position: (p as Record<string, unknown>).position as string | undefined,
      }));

      setUsers(mapped);
      setStats({
        total: mapped.length,
        active: mapped.filter(u => u.status === 'active').length,
        inactive: mapped.filter(u => u.status !== 'active').length,
        admins: mapped.filter(u => u.role === 'admin').length,
        pending: mapped.filter(u => u.status === 'inactive').length,
        managers: mapped.filter(u => u.role === 'manager' || u.role === 'hr_manager').length,
      });
    } catch (err) {
      logger.error('[UserManagement] fetchUsers failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const inviteUser = useCallback(async (_invite: UserInvite) => {
    logger.info('[UserManagement] inviteUser:', _invite.email);
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ status: role } as Record<string, unknown>).eq('id', userId);
    if (error) throw error;
    await fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = useCallback(async (userId: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (error) throw error;
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    await fetchUsers();
  }, [fetchUsers]);

  const bulkDelete = useCallback(async (userIds: string[]) => {
    const { error } = await supabase.from('profiles').delete().in('id', userIds);
    if (error) throw error;
    await fetchUsers();
  }, [fetchUsers]);

  const exportUsers = useCallback(() => {
    const csv = users.map(u => `${u.full_name},${u.email},${u.role},${u.status}`).join('\n');
    const blob = new Blob([`Name,Email,Role,Status\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [users]);

  return {
    users,
    isLoading,
    stats,
    fetchUsers,
    inviteUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    bulkDelete,
    exportUsers,
  };
}
