# PATCHES 269-270 Implementation Guide

## Overview

This document provides detailed implementation guidelines for completing PATCH 269 (Integrations Hub) and PATCH 270 (PEO-DP Wizard), which are the remaining patches from the requirements.

## PATCH 269 - Integrations Hub with OAuth and Plugins

### Already Implemented ✅

1. **OAuth Integration Service** (`src/services/oauth-integration.service.ts`):
   - Complete OAuth2 authentication flow support
   - Support for Google Drive, Outlook, and Slack
   - Secure credential management with encryption
   - CSRF protection with state parameter
   - Token refresh functionality
   - Integration event logging
   - Connection testing capabilities

### Remaining Implementation Steps

#### 1. Enhance Integrations Hub Component

Update `src/components/integrations/integrations-hub.tsx` to add:

```typescript
import { OAuthIntegrationService } from '@/services/oauth-integration.service';
import { Lock, Key, History, FileText } from 'lucide-react';

// Add OAuth-enabled integrations
const oauthIntegrations = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Store and sync documents in Google Drive",
    category: "data",
    status: "disconnected",
    icon: Cloud,
    isEnabled: false,
    requiresOAuth: true,
    oauthProvider: "google-drive"
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Email notifications and calendar sync",
    category: "communication",
    status: "disconnected",
    icon: Mail,
    isEnabled: false,
    requiresOAuth: true,
    oauthProvider: "outlook"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team notifications and alerts",
    category: "communication",
    status: "disconnected",
    icon: MessageSquare,
    isEnabled: false,
    requiresOAuth: true,
    oauthProvider: "slack"
  }
];

// Add OAuth connection handler
const handleConnectOAuth = (integration: Integration) => {
  if (integration.requiresOAuth && integration.oauthProvider) {
    OAuthIntegrationService.initiateOAuthFlow(integration.oauthProvider);
  }
};

// Add credentials management section
<TabsContent value="credentials">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lock className="h-5 w-5" />
        Secure Credentials Management
      </CardTitle>
      <CardDescription>
        Manage OAuth tokens and API keys securely
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* List stored credentials */}
      {/* Add revoke functionality */}
      {/* Show credential expiry */}
    </CardContent>
  </Card>
</TabsContent>

// Add event logs section
<TabsContent value="logs">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <History className="h-5 w-5" />
        Integration Event Logs
      </CardTitle>
      <CardDescription>
        Monitor all integration activities and events
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {OAuthIntegrationService.getIntegrationLogs().map((log) => (
          <div key={log.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <p className="font-medium text-sm">{log.message}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
              {log.status}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

#### 2. Create OAuth Callback Handler

Create `src/pages/integrations/oauth-callback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OAuthIntegrationService } from '@/services/oauth-integration.service';
import { toast } from 'sonner';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = sessionStorage.getItem('oauth_provider');

      if (!code || !state || !provider) {
        toast.error('Invalid OAuth callback');
        navigate('/integrations');
        return;
      }

      try {
        const credentials = await OAuthIntegrationService.handleOAuthCallback(
          code,
          state,
          provider
        );

        // Store credentials (requires user ID - get from auth context)
        await OAuthIntegrationService.storeCredentials('user-id', credentials);

        toast.success(`Successfully connected to ${provider}`);
        navigate('/integrations');
      } catch (error) {
        toast.error(`OAuth authentication failed: ${error.message}`);
        navigate('/integrations');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center p-8">
      <p>Completing authentication...</p>
    </div>
  );
};
```

#### 3. Add Plugin System Architecture

Create `src/services/plugin-system.service.ts`:

```typescript
/**
 * Plugin System Service
 * Zapier-style plugin architecture for custom integrations
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  triggers: PluginTrigger[];
  actions: PluginAction[];
  icon?: string;
}

export interface PluginTrigger {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute: (input: any) => Promise<any>;
}

export interface PluginAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute: (input: any) => Promise<any>;
}

export class PluginSystemService {
  private static plugins: Map<string, PluginManifest> = new Map();

  // Register plugin
  static registerPlugin(plugin: PluginManifest): void {
    this.plugins.set(plugin.id, plugin);
  }

  // Execute plugin trigger
  static async executeTrigger(
    pluginId: string,
    triggerId: string,
    input: any
  ): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

    const trigger = plugin.triggers.find(t => t.id === triggerId);
    if (!trigger) throw new Error(`Trigger ${triggerId} not found`);

    return await trigger.execute(input);
  }

  // Execute plugin action
  static async executeAction(
    pluginId: string,
    actionId: string,
    input: any
  ): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

    const action = plugin.actions.find(a => a.id === actionId);
    if (!action) throw new Error(`Action ${actionId} not found`);

    return await action.execute(input);
  }

  // List all plugins
  static listPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }
}
```

#### 4. Database Schema for Integration Credentials

Add migration for secure credential storage:

```sql
-- Create integration_credentials table
CREATE TABLE IF NOT EXISTS integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_credentials TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create integration_logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own credentials"
  ON integration_credentials FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logs"
  ON integration_logs FOR SELECT
  USING (auth.uid() = user_id);
```

## PATCH 270 - PEO-DP with Real Data and Complete Workflow

### Current Implementation Status

The PEO-DP wizard (`src/components/peo-dp/peo-dp-wizard.tsx`) already has:
- ✅ Multi-step wizard interface
- ✅ Form navigation
- ✅ Data collection for all 7 steps

### Remaining Implementation Steps

#### 1. Connect to Real Data Sources

Update `src/components/peo-dp/peo-dp-wizard.tsx`:

```typescript
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useCallback } from 'react';

// Add data fetching hooks
const [vesselData, setVesselData] = useState([]);
const [crewData, setCrewData] = useState([]);
const [performanceData, setPerformanceData] = useState([]);

// Load real vessel data
const loadVesselData = useCallback(async () => {
  const { data, error } = await supabase
    .from('vessels')
    .select('*')
    .order('name');
  
  if (!error && data) {
    setVesselData(data);
  }
}, []);

// Load crew performance data
const loadCrewData = useCallback(async () => {
  const { data, error } = await supabase
    .from('crew_members')
    .select(`
      *,
      crew_assignments(*)
    `)
    .order('name');
  
  if (!error && data) {
    setCrewData(data);
  }
}, []);

// Load performance metrics
const loadPerformanceData = useCallback(async () => {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('category', 'operational')
    .order('recorded_at', { ascending: false })
    .limit(50);
  
  if (!error && data) {
    setPerformanceData(data);
  }
}, []);

useEffect(() => {
  loadVesselData();
  loadCrewData();
  loadPerformanceData();
}, [loadVesselData, loadCrewData, loadPerformanceData]);
```

#### 2. Add AI-Powered Recommendations

Create `src/services/peodp-inference.service.ts`:

```typescript
/**
 * PEO-DP Inference Service
 * Provides AI-powered recommendations for Dynamic Positioning operations
 */

export interface DPRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  reasoning: string[];
  dataSource: string[];
  confidenceScore: number;
  actionRequired: boolean;
}

export class PEODPInferenceService {
  /**
   * Analyze PEO-DP data and generate recommendations
   */
  static async generateRecommendations(
    formData: Record<string, any>,
    vesselData: any[],
    crewData: any[],
    performanceData: any[]
  ): Promise<DPRecommendation[]> {
    const recommendations: DPRecommendation[] = [];

    // Analyze vessel configuration
    const vesselRec = this.analyzeVesselConfiguration(formData, vesselData);
    if (vesselRec) recommendations.push(vesselRec);

    // Analyze crew competency
    const crewRec = this.analyzeCrewCompetency(formData, crewData);
    if (crewRec) recommendations.push(crewRec);

    // Analyze maintenance schedule
    const maintenanceRec = this.analyzeMaintenanceSchedule(formData, performanceData);
    if (maintenanceRec) recommendations.push(maintenanceRec);

    // Analyze training requirements
    const trainingRec = this.analyzeTrainingRequirements(formData, crewData);
    if (trainingRec) recommendations.push(trainingRec);

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Save inference decisions to database
   */
  static async saveInferenceLog(
    userId: string,
    formData: Record<string, any>,
    recommendations: DPRecommendation[]
  ): Promise<void> {
    // Save to dp_inference_logs table
    // Include all recommendations, reasoning, and data sources
  }

  // Private analysis methods...
  private static analyzeVesselConfiguration(
    formData: Record<string, any>,
    vesselData: any[]
  ): DPRecommendation | null {
    // Implement vessel configuration analysis
    return null;
  }

  // Add other private analysis methods...
}
```

#### 3. Add Compliance Hub Integration

```typescript
// In peo-dp-wizard.tsx

const handleComplete = async () => {
  setIsSubmitting(true);
  try {
    // Generate AI recommendations
    const recommendations = await PEODPInferenceService.generateRecommendations(
      formData,
      vesselData,
      crewData,
      performanceData
    );

    // Save to database
    const { data: planData, error: planError } = await supabase
      .from('peodp_plans')
      .insert({
        ...formData,
        status: 'draft',
        created_by: userId
      })
      .select()
      .single();

    if (planError) throw planError;

    // Save inference log
    await PEODPInferenceService.saveInferenceLog(
      userId,
      formData,
      recommendations
    );

    // Trigger compliance actions
    if (recommendations.some(r => r.actionRequired)) {
      await triggerComplianceActions(planData.id, recommendations);
    }

    toast.success("Plano PEO-DP criado com sucesso!");
    onComplete(formData);
  } catch (error) {
    toast.error("Erro ao criar plano PEO-DP");
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 4. Database Schema for PEO-DP

```sql
-- Create peodp_plans table
CREATE TABLE IF NOT EXISTS peodp_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  vessel_name VARCHAR(255),
  vessel_type VARCHAR(100),
  dp_class VARCHAR(10),
  operation_type TEXT,
  org_structure TEXT,
  dp_master VARCHAR(255),
  responsibilities TEXT,
  required_certs TEXT,
  training_plan TEXT,
  competency_matrix TEXT,
  fmea TEXT,
  asog TEXT,
  contingency_plan TEXT,
  watch_keeping TEXT,
  communication TEXT,
  protocols TEXT,
  preventive TEXT,
  predictive TEXT,
  corrective TEXT,
  dp_trials TEXT,
  capability_plots TEXT,
  validation TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dp_inference_logs table
CREATE TABLE IF NOT EXISTS dp_inference_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES peodp_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  recommendations JSONB NOT NULL,
  data_sources JSONB,
  confidence_score DECIMAL(5,2),
  actions_triggered JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE peodp_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dp_inference_logs ENABLE ROW LEVEL SECURITY;
```

## Testing Checklist

### PATCH 269
- [ ] OAuth flow works for Google Drive
- [ ] OAuth flow works for Outlook
- [ ] OAuth flow works for Slack
- [ ] Credentials stored securely
- [ ] Credentials can be revoked
- [ ] Integration logs visible
- [ ] Toggle enable/disable works
- [ ] Connection testing functional

### PATCH 270
- [ ] Wizard loads real vessel data
- [ ] Wizard loads real crew data
- [ ] Wizard loads performance metrics
- [ ] AI recommendations generated
- [ ] Recommendations show reasoning
- [ ] Data sources displayed
- [ ] Confidence scores calculated
- [ ] Decisions saved to dp_inference_logs
- [ ] Compliance actions triggered
- [ ] All wizard steps functional

## Security Considerations

1. **OAuth Credentials**: Must be encrypted at rest and in transit
2. **CSRF Protection**: State parameter validation required
3. **Token Refresh**: Implement automatic token refresh
4. **RLS Policies**: Ensure proper row-level security
5. **Audit Logging**: Log all integration activities
6. **Rate Limiting**: Implement rate limits for API calls
7. **Input Validation**: Validate all form inputs

## Deployment Steps

1. Run database migrations
2. Configure OAuth client IDs and secrets
3. Set up redirect URIs in OAuth providers
4. Deploy updated components
5. Test OAuth flows in production
6. Monitor integration logs
7. Verify data connectivity

## Documentation

- Update user guide with OAuth instructions
- Document plugin development process
- Add API documentation for custom plugins
- Create troubleshooting guide for integrations
