// PATCH 110.0: Offline Mode Types

export interface CachedRoute {
  id: string;
  name: string;
  departure_port: string;
  arrival_port: string;
  estimated_duration: number;
  cached_at: string;
}

export interface CachedCrewMember {
  id: string;
  name: string;
  position: string;
  onboard_status: boolean;
  cached_at: string;
}

export interface CachedVessel {
  id: string;
  name: string;
  imo_code: string;
  status: string;
  last_known_position: any;
  cached_at: string;
}

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface OfflineStatus {
  is_offline: boolean;
  last_sync: string | null;
  pending_actions: number;
  cached_data_size: number;
}

export interface SyncResult {
  success: boolean;
  synced_actions: number;
  failed_actions: number;
  errors: string[];
}
