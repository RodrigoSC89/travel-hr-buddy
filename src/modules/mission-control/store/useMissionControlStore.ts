import { create } from 'zustand';

export interface Mission {
  id: string;
  mission_name: string;
  mission_type: string;
  description?: string;
  objective?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  start_date?: string;
  end_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  commander_id?: string;
  organization_id?: string;
  location_coordinates?: any;
  location_name?: string;
  success_criteria?: any;
  risks?: any;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MissionResource {
  id: string;
  mission_id: string;
  resource_type: 'crew' | 'vessel' | 'equipment' | 'vehicle' | 'sensor' | 'other';
  resource_id?: string;
  resource_name: string;
  quantity: number;
  allocation_status: 'assigned' | 'deployed' | 'returned' | 'unavailable';
  allocated_at: string;
  deployed_at?: string;
  returned_at?: string;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface MissionStatusUpdate {
  id: string;
  mission_id: string;
  update_type: 'status_change' | 'progress' | 'alert' | 'incident' | 'completion' | 'note';
  title: string;
  description?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  previous_status?: string;
  new_status?: string;
  progress_percentage?: number;
  location_coordinates?: any;
  reported_by?: string;
  metadata?: any;
  created_at: string;
}

interface MissionControlState {
  missions: Mission[];
  activeMission: Mission | null;
  missionResources: Record<string, MissionResource[]>;
  missionUpdates: Record<string, MissionStatusUpdate[]>;
  
  // Actions
  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  setActiveMission: (mission: Mission | null) => void;
  
  setMissionResources: (missionId: string, resources: MissionResource[]) => void;
  addMissionResource: (missionId: string, resource: MissionResource) => void;
  updateMissionResource: (missionId: string, resourceId: string, updates: Partial<MissionResource>) => void;
  
  setMissionUpdates: (missionId: string, updates: MissionStatusUpdate[]) => void;
  addMissionUpdate: (missionId: string, update: MissionStatusUpdate) => void;
  
  clearMissionData: () => void;
}

export const useMissionControlStore = create<MissionControlState>((set) => ({
  missions: [],
  activeMission: null,
  missionResources: {},
  missionUpdates: {},

  setMissions: (missions) => set({ missions }),
  
  addMission: (mission) => set((state) => ({
    missions: [...state.missions, mission]
  })),
  
  updateMission: (id, updates) => set((state) => ({
    missions: state.missions.map(m => m.id === id ? { ...m, ...updates } : m),
    activeMission: state.activeMission?.id === id 
      ? { ...state.activeMission, ...updates }
      : state.activeMission
  })),
  
  deleteMission: (id) => set((state) => ({
    missions: state.missions.filter(m => m.id !== id),
    activeMission: state.activeMission?.id === id ? null : state.activeMission
  })),
  
  setActiveMission: (mission) => set({ activeMission: mission }),
  
  setMissionResources: (missionId, resources) => set((state) => ({
    missionResources: { ...state.missionResources, [missionId]: resources }
  })),
  
  addMissionResource: (missionId, resource) => set((state) => ({
    missionResources: {
      ...state.missionResources,
      [missionId]: [...(state.missionResources[missionId] || []), resource]
    }
  })),
  
  updateMissionResource: (missionId, resourceId, updates) => set((state) => ({
    missionResources: {
      ...state.missionResources,
      [missionId]: (state.missionResources[missionId] || []).map(r =>
        r.id === resourceId ? { ...r, ...updates } : r
      )
    }
  })),
  
  setMissionUpdates: (missionId, updates) => set((state) => ({
    missionUpdates: { ...state.missionUpdates, [missionId]: updates }
  })),
  
  addMissionUpdate: (missionId, update) => set((state) => ({
    missionUpdates: {
      ...state.missionUpdates,
      [missionId]: [...(state.missionUpdates[missionId] || []), update]
    }
  })),
  
  clearMissionData: () => set({
    missions: [],
    activeMission: null,
    missionResources: {},
    missionUpdates: {}
  })
}));
