import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MobileRequest {
  action: 'sync_data' | 'offline_package' | 'voice_command' | 'camera_ocr' | 'geolocation_tracking';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: MobileRequest = await req.json();

    let result;

    switch (action) {
      case 'sync_data':
        result = await syncMobileData(data);
        break;
      case 'offline_package':
        result = await generateOfflinePackage(data);
        break;
      case 'voice_command':
        result = await processVoiceCommand(data);
        break;
      case 'camera_ocr':
        result = await processCameraOCR(data);
        break;
      case 'geolocation_tracking':
        result = await handleGeolocation(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Mobile Offline AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncMobileData(data: { userId: string; deviceId: string; lastSync: string; pendingChanges: any[] }) {
  const { userId, deviceId, lastSync, pendingChanges } = data;
  
  // Process pending changes from mobile
  const processedChanges = pendingChanges.map(change => ({
    ...change,
    processedAt: new Date().toISOString(),
    status: 'synced',
    serverId: `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }));
  
  // Conflicts detection
  const conflicts = pendingChanges.filter(change => {
    // Simulated conflict detection
    return Math.random() < 0.05; // 5% chance of conflict for demo
  }).map(change => ({
    changeId: change.id,
    conflictType: 'concurrent_modification',
    serverVersion: { ...change, modifiedBy: 'another_user' },
    clientVersion: change,
    resolution: 'manual_required',
  }));
  
  // Generate server changes since last sync
  const serverChanges = [
    { type: 'checklist_update', id: 'CHK-001', data: { status: 'completed' }, timestamp: new Date().toISOString() },
    { type: 'task_assigned', id: 'TSK-005', data: { assignee: userId }, timestamp: new Date().toISOString() },
    { type: 'document_added', id: 'DOC-012', data: { name: 'Safety Bulletin' }, timestamp: new Date().toISOString() },
  ];
  
  return {
    syncId: `SYNC-${Date.now()}`,
    deviceId,
    syncedAt: new Date().toISOString(),
    previousSync: lastSync,
    results: {
      uploaded: {
        total: pendingChanges.length,
        successful: processedChanges.length - conflicts.length,
        failed: 0,
        conflicts: conflicts.length,
      },
      downloaded: {
        total: serverChanges.length,
        changes: serverChanges,
      },
    },
    conflicts,
    nextSyncRecommended: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    bandwidth: {
      uploaded: pendingChanges.length * 2, // KB estimate
      downloaded: serverChanges.length * 3, // KB estimate
    },
  };
}

async function generateOfflinePackage(data: { userId: string; vesselId: string; modules: string[] }) {
  const { userId, vesselId, modules } = data;
  
  const packageContents: Record<string, any> = {
    checklists: {
      items: 45,
      size: 120, // KB
      lastUpdated: new Date().toISOString(),
      data: [
        { id: 'CHK-001', name: 'Daily Bridge Checklist', items: 25 },
        { id: 'CHK-002', name: 'Engine Room Rounds', items: 32 },
        { id: 'CHK-003', name: 'Safety Equipment Check', items: 18 },
      ],
    },
    documents: {
      items: 28,
      size: 5400, // KB
      lastUpdated: new Date().toISOString(),
      categories: ['procedures', 'certificates', 'manuals'],
      downloadPriority: ['critical', 'high', 'medium'],
    },
    crew: {
      items: 22,
      size: 45, // KB
      data: [
        { id: 'C001', name: 'Capt. Rodriguez', rank: 'Master' },
        { id: 'C002', name: 'John Santos', rank: 'Chief Officer' },
      ],
    },
    maintenance: {
      items: 156,
      size: 380, // KB
      pendingJobs: 12,
      overdueJobs: 2,
    },
    forms: {
      items: 35,
      size: 250, // KB
      types: ['incident', 'inspection', 'permit_to_work', 'near_miss'],
    },
  };
  
  const selectedModules: Record<string, any> = {};
  let totalSize = 0;
  
  modules.forEach(mod => {
    if (packageContents[mod]) {
      selectedModules[mod] = packageContents[mod];
      totalSize += packageContents[mod].size;
    }
  });
  
  return {
    packageId: `PKG-${Date.now()}`,
    userId,
    vesselId,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    modules: selectedModules,
    summary: {
      totalModules: Object.keys(selectedModules).length,
      totalItems: Object.values(selectedModules).reduce((sum: number, mod: any) => sum + mod.items, 0),
      totalSize: totalSize,
      sizeUnit: 'KB',
      estimatedDownloadTime: Math.round(totalSize / 100), // seconds at 100KB/s
    },
    offlineCapabilities: {
      viewDocuments: true,
      completeChecklists: true,
      createIncidents: true,
      viewCrewInfo: true,
      updateMaintenance: true,
      aiAssistant: 'limited', // On-device ML only
    },
    syncStrategy: {
      autoSync: true,
      syncInterval: 300, // seconds
      prioritySync: ['incidents', 'checklists'],
      backgroundSync: true,
    },
  };
}

async function processVoiceCommand(data: { audioText: string; context: string }) {
  const { audioText, context } = data;
  
  // Natural language command processing
  const commandPatterns = [
    { pattern: /create (a |an )?(incident|report)/i, action: 'create_incident' },
    { pattern: /complete (the )?checklist/i, action: 'complete_checklist' },
    { pattern: /show (me )?(the )?status/i, action: 'show_status' },
    { pattern: /navigate to/i, action: 'navigate' },
    { pattern: /call|contact/i, action: 'initiate_call' },
    { pattern: /take (a )?photo/i, action: 'capture_photo' },
    { pattern: /log (an? )?(entry|reading)/i, action: 'log_entry' },
    { pattern: /what('s| is) (the )?weather/i, action: 'weather_info' },
    { pattern: /schedule|remind/i, action: 'set_reminder' },
    { pattern: /help|what can (you|I) do/i, action: 'show_help' },
  ];
  
  let matchedAction = null;
  let confidence = 0;
  
  for (const cmd of commandPatterns) {
    if (cmd.pattern.test(audioText)) {
      matchedAction = cmd.action;
      confidence = 0.92;
      break;
    }
  }
  
  if (!matchedAction) {
    // Fallback to AI interpretation
    matchedAction = 'unknown';
    confidence = 0.3;
  }
  
  const actionResponses: Record<string, any> = {
    create_incident: {
      response: 'Opening incident report form. Please describe what happened.',
      nextStep: 'incident_form',
      followUp: ['What type of incident?', 'When did it occur?', 'Was anyone injured?'],
    },
    complete_checklist: {
      response: 'Here are your pending checklists. Which one would you like to complete?',
      nextStep: 'checklist_list',
      options: ['Daily Bridge Checklist', 'Engine Room Rounds', 'Safety Equipment Check'],
    },
    show_status: {
      response: 'Showing vessel status. All systems operational. 2 maintenance tasks pending.',
      nextStep: 'status_dashboard',
      data: { operational: true, pendingTasks: 2, alerts: 1 },
    },
    weather_info: {
      response: 'Current conditions: Wind 15 knots from NW, seas 1.5m, visibility good. No weather warnings.',
      nextStep: 'weather_detail',
      data: { wind: 15, direction: 'NW', seas: 1.5, visibility: 'good' },
    },
    show_help: {
      response: 'I can help you with: Creating incidents, completing checklists, viewing status, logging readings, taking photos, and more. What would you like to do?',
      nextStep: 'help_menu',
    },
    unknown: {
      response: "I didn't understand that command. Try saying 'help' to see what I can do.",
      nextStep: 'retry',
    },
  };
  
  return {
    commandId: `CMD-${Date.now()}`,
    originalText: audioText,
    interpretedAction: matchedAction,
    confidence,
    context,
    ...actionResponses[matchedAction],
    voiceResponse: {
      text: actionResponses[matchedAction]?.response,
      speak: true,
      language: 'en-US',
    },
  };
}

async function processCameraOCR(data: { imageBase64: string; documentType: string }) {
  const { documentType } = data;
  
  // Simulated OCR results based on document type
  const ocrResults: Record<string, any> = {
    certificate: {
      documentType: 'Maritime Certificate',
      extractedFields: {
        certificateNumber: 'CERT-2024-12345',
        vesselName: 'MV Ocean Star',
        imoNumber: '1234567',
        issuingAuthority: 'Panama Maritime Authority',
        issueDate: '2024-01-15',
        expiryDate: '2025-01-14',
        certificateType: 'Safety Management Certificate',
      },
      confidence: 0.94,
      validation: {
        formatValid: true,
        datesValid: true,
        expiryStatus: 'valid',
        daysUntilExpiry: 350,
      },
    },
    gauge_reading: {
      documentType: 'Gauge Reading',
      extractedFields: {
        equipmentId: 'ME-001',
        readingType: 'Pressure',
        value: 4.5,
        unit: 'bar',
        timestamp: new Date().toISOString(),
        location: 'Engine Room - Main Engine',
      },
      confidence: 0.89,
      validation: {
        withinNormalRange: true,
        normalRange: { min: 3.0, max: 6.0 },
        trend: 'stable',
      },
    },
    barcode: {
      documentType: 'Barcode/QR',
      extractedFields: {
        codeType: 'QR',
        content: 'SPARE-PART-12345',
        linkedData: {
          partNumber: 'SP-12345',
          partName: 'Oil Filter Element',
          location: 'Store Room A',
          quantity: 5,
          reorderLevel: 2,
        },
      },
      confidence: 0.99,
    },
    form: {
      documentType: 'Handwritten Form',
      extractedFields: {
        formType: 'Inspection Form',
        inspector: 'J. Santos',
        date: '2024-02-01',
        items: [
          { item: 'Fire extinguisher', status: 'OK' },
          { item: 'Emergency exit', status: 'OK' },
          { item: 'First aid kit', status: 'Needs refill' },
        ],
        signature: 'detected',
      },
      confidence: 0.78,
      warnings: ['Handwriting partially unclear', 'Verify item 3 status'],
    },
  };
  
  const result = ocrResults[documentType] || ocrResults['form'];
  
  return {
    ocrId: `OCR-${Date.now()}`,
    processedAt: new Date().toISOString(),
    result,
    suggestedActions: [
      { action: 'save_to_records', label: 'Save to Records' },
      { action: 'share', label: 'Share with Team' },
      { action: 'create_task', label: 'Create Follow-up Task' },
    ],
    offlineCapable: true,
    syncRequired: true,
  };
}

async function handleGeolocation(data: { userId: string; coordinates: { lat: number; lng: number }; accuracy: number }) {
  const { userId, coordinates, accuracy } = data;
  
  // Simulated geofencing and location tracking
  const geofences = [
    { id: 'GF-001', name: 'MV Ocean Star', center: { lat: 1.2644, lng: 103.8196 }, radius: 500 },
    { id: 'GF-002', name: 'Singapore Port', center: { lat: 1.2644, lng: 103.8196 }, radius: 5000 },
    { id: 'GF-003', name: 'Danger Zone - Restricted', center: { lat: 1.3000, lng: 103.8500 }, radius: 1000 },
  ];
  
  const activeGeofences = geofences.filter(gf => {
    const distance = calculateDistance(coordinates, gf.center);
    return distance <= gf.radius;
  });
  
  return {
    locationId: `LOC-${Date.now()}`,
    userId,
    coordinates,
    accuracy,
    timestamp: new Date().toISOString(),
    geofenceStatus: {
      activeGeofences: activeGeofences.map(gf => gf.name),
      alerts: activeGeofences.filter(gf => gf.name.includes('Danger')).map(gf => ({
        type: 'warning',
        message: `Entering ${gf.name}`,
        action: 'acknowledge_required',
      })),
    },
    tracking: {
      enabled: true,
      interval: 60, // seconds
      batteryOptimized: true,
    },
    nearbyAssets: [
      { type: 'vessel', name: 'MV Ocean Star', distance: 250 },
      { type: 'facility', name: 'Terminal Building', distance: 1200 },
    ],
    offlineTracking: {
      bufferedPositions: 0,
      maxBufferSize: 1000,
      syncOnConnect: true,
    },
  };
}

function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
