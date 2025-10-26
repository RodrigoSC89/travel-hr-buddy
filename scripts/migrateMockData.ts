/**
 * PATCH 193.0 - Mock to Real Data Migration Script
 * Converts mock/static data to real Supabase queries across critical modules
 */

import { supabase } from "@/integrations/supabase/client";

// List of modules with mock data to migrate
export const MODULES_WITH_MOCK_DATA = [
  'performance',
  'fuel-optimizer',
  'mission-logs',
  'satcom',
  'emergency-response',
  'crew-wellbeing',
  'navigation-copilot',
  'underwater-drone',
  'marine-ar-overlay',
  'auto-sub'
] as const;

export type ModuleName = typeof MODULES_WITH_MOCK_DATA[number];

// Status tracking for migration
export interface MigrationStatus {
  module: ModuleName;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp: string;
}

// Helper to check if a table exists
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Helper to create loading state component
export function createLoadingState(moduleName: string) {
  return {
    isLoading: true,
    data: null,
    error: null,
    message: `Loading ${moduleName} data...`
  };
}

// Helper to create empty state component
export function createEmptyState(moduleName: string) {
  return {
    isLoading: false,
    data: [],
    error: null,
    message: `No ${moduleName} data available. Add your first entry to get started.`
  };
}

// Migration functions for specific modules

export async function migratePerformanceData() {
  try {
    // Check if required tables exist
    const hasFleetLogs = await checkTableExists('fleet_logs');
    const hasMissionActivities = await checkTableExists('mission_activities');
    const hasFuelUsage = await checkTableExists('fuel_usage');

    if (!hasFleetLogs || !hasMissionActivities || !hasFuelUsage) {
      return {
        success: false,
        message: 'Required tables not found. Need: fleet_logs, mission_activities, fuel_usage'
      };
    }

    // Load real data from Supabase
    const { data: fleetLogs, error: fleetError } = await supabase
      .from('fleet_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: missions, error: missionsError } = await supabase
      .from('mission_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: fuelData, error: fuelError } = await supabase
      .from('fuel_usage')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    return {
      success: true,
      data: {
        fleetLogs: fleetLogs || [],
        missions: missions || [],
        fuelData: fuelData || []
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function migrateFuelOptimizerData() {
  try {
    const hasFuelOptimization = await checkTableExists('fuel_optimization_data');

    if (!hasFuelOptimization) {
      return {
        success: false,
        message: 'Required table not found: fuel_optimization_data'
      };
    }

    const { data, error } = await supabase
      .from('fuel_optimization_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function migrateMissionLogsData() {
  try {
    const hasMissionLogs = await checkTableExists('mission_logs');

    if (!hasMissionLogs) {
      return {
        success: false,
        message: 'Required table not found: mission_logs'
      };
    }

    const { data, error } = await supabase
      .from('mission_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function migrateSatcomData() {
  try {
    const hasSatcomStatus = await checkTableExists('satcom_status');

    if (!hasSatcomStatus) {
      return {
        success: false,
        message: 'Required table not found: satcom_status'
      };
    }

    const { data, error } = await supabase
      .from('satcom_status')
      .select('*')
      .order('last_update', { ascending: false })
      .limit(50);

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function migrateEmergencyResponseData() {
  try {
    const hasEmergencyIncidents = await checkTableExists('emergency_incidents');

    if (!hasEmergencyIncidents) {
      return {
        success: false,
        message: 'Required table not found: emergency_incidents'
      };
    }

    const { data, error } = await supabase
      .from('emergency_incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return {
      success: true,
      data: data || []
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Main migration runner
export async function runMockDataMigration(
  modules: ModuleName[] = [...MODULES_WITH_MOCK_DATA]
): Promise<MigrationStatus[]> {
  const results: MigrationStatus[] = [];

  for (const module of modules) {
    let result;
    const timestamp = new Date().toISOString();

    try {
      switch (module) {
        case 'performance':
          result = await migratePerformanceData();
          break;
        case 'fuel-optimizer':
          result = await migrateFuelOptimizerData();
          break;
        case 'mission-logs':
          result = await migrateMissionLogsData();
          break;
        case 'satcom':
          result = await migrateSatcomData();
          break;
        case 'emergency-response':
          result = await migrateEmergencyResponseData();
          break;
        default:
          result = { success: false, message: 'Migration not implemented yet' };
      }

      results.push({
        module,
        status: result.success ? 'success' : 'error',
        message: result.message || (result.success ? 'Migration completed' : 'Migration failed'),
        timestamp
      });
    } catch (error: any) {
      results.push({
        module,
        status: 'error',
        message: error.message,
        timestamp
      });
    }
  }

  return results;
}

// Export utilities for components
export const migrationUtils = {
  createLoadingState,
  createEmptyState,
  checkTableExists,
  runMigration: runMockDataMigration
};
