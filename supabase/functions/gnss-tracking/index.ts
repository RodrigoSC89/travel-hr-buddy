/**
 * GNSS Tracking Edge Function
 * Processes GNSS data, applies corrections, and provides AI recommendations
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GnssPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  deviceId: string;
  fixType?: string;
}

interface CorrectionData {
  source: string;
  correctionAge: number;
  accuracy: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, data } = await req.json();
    console.log(`GNSS Tracking action: ${action}`);

    switch (action) {
      case 'log_position': {
        const position: GnssPosition = data;
        
        // Validate position data
        if (!position.latitude || !position.longitude || !position.deviceId) {
          throw new Error('Missing required position data');
        }

        // Calculate signal quality based on accuracy
        const signalQuality = position.accuracy 
          ? Math.max(0, Math.min(100, 100 - (position.accuracy * 2)))
          : 50;

        // Log to database
        const { data: logData, error: logError } = await supabase
          .from('tracking_gnss_logs')
          .insert({
            device_id: position.deviceId,
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude,
            speed: position.speed,
            heading: position.heading,
            accuracy: position.accuracy,
            fix_type: position.fixType || 'gps',
            signal_quality: signalQuality,
            recorded_at: position.timestamp || new Date().toISOString(),
          })
          .select()
          .single();

        if (logError) {
          console.error('Error logging position:', logError);
          throw logError;
        }

        // Check for alerts (accuracy degradation, signal loss, etc.)
        const alerts = [];
        
        if (position.accuracy && position.accuracy > 10) {
          alerts.push({
            type: 'accuracy_degraded',
            severity: position.accuracy > 50 ? 'critical' : 'warning',
            message: `Accuracy degraded to ${position.accuracy}m`,
          });
        }

        return new Response(JSON.stringify({
          success: true,
          logId: logData.id,
          signalQuality,
          alerts,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_correction': {
        const { latitude, longitude, correctionType } = data;
        
        // Simulate correction data (in production, would call RBMC/IBGE APIs)
        const corrections: Record<string, CorrectionData> = {
          dgps: { source: 'RBMC-IBGE', correctionAge: 1500, accuracy: 1.5 },
          rtk: { source: 'NTRIP-Caster', correctionAge: 100, accuracy: 0.02 },
          ppp: { source: 'IBGE-PPP', correctionAge: 3600000, accuracy: 0.05 },
        };

        const correction = corrections[correctionType] || corrections.dgps;

        return new Response(JSON.stringify({
          success: true,
          correction,
          correctedPosition: {
            latitude: latitude + (Math.random() - 0.5) * 0.00001,
            longitude: longitude + (Math.random() - 0.5) * 0.00001,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'predict_trajectory': {
        const { deviceId, historyHours } = data;
        
        // Get historical positions
        const since = new Date(Date.now() - (historyHours || 1) * 3600000).toISOString();
        
        const { data: history, error: historyError } = await supabase
          .from('tracking_gnss_logs')
          .select('latitude, longitude, speed, heading, recorded_at')
          .eq('device_id', deviceId)
          .gte('recorded_at', since)
          .order('recorded_at', { ascending: true });

        if (historyError) throw historyError;

        // Simple trajectory prediction based on last known speed and heading
        if (!history || history.length < 2) {
          return new Response(JSON.stringify({
            success: true,
            prediction: null,
            message: 'Insufficient data for prediction',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const lastPosition = history[history.length - 1];
        const avgSpeed = history.reduce((sum: number, p: { speed?: number }) => sum + (p.speed || 0), 0) / history.length;
        const avgHeading = lastPosition.heading || 0;

        // Predict next 5 positions (every 5 minutes)
        const predictions = [];
        let lat = lastPosition.latitude;
        let lng = lastPosition.longitude;
        const speedKmh = avgSpeed * 1.852; // knots to km/h
        
        for (let i = 1; i <= 5; i++) {
          const distanceKm = (speedKmh * 5) / 60; // 5 minutes
          const headingRad = (avgHeading * Math.PI) / 180;
          
          lat += (distanceKm / 111.32) * Math.cos(headingRad);
          lng += (distanceKm / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(headingRad);
          
          predictions.push({
            latitude: lat,
            longitude: lng,
            estimatedTime: new Date(Date.now() + i * 5 * 60000).toISOString(),
            confidence: Math.max(50, 95 - i * 8),
          });
        }

        return new Response(JSON.stringify({
          success: true,
          prediction: {
            trajectory: predictions,
            basedOn: history.length,
            avgSpeed,
            avgHeading,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check_geofence': {
        const { latitude, longitude, vesselId } = data;
        
        // Get active waypoints/geofences for the vessel
        const { data: waypoints, error: waypointError } = await supabase
          .from('gnss_waypoints')
          .select('*')
          .eq('is_active', true)
          .eq('waypoint_type', 'geofence');

        if (waypointError) throw waypointError;

        // Check if position is within any geofence
        const breaches = [];
        for (const wp of waypoints || []) {
          const distance = calculateDistance(
            latitude, longitude,
            wp.latitude, wp.longitude
          );
          
          if (distance > wp.radius_meters) {
            breaches.push({
              waypointId: wp.id,
              waypointName: wp.name,
              distance,
              radiusMeters: wp.radius_meters,
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          isWithinAllGeofences: breaches.length === 0,
          breaches,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('GNSS Tracking error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
