import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Mock data based on IMCA incidents (2025)
    const incidents = [
      {
        id: 'imca-2025-014',
        title: 'Loss of Position Due to Gyro Drift',
        date: '2025-09-12',
        vessel: 'DP Shuttle Tanker X',
        location: 'Campos Basin',
        rootCause: 'Sensor drift not compensated',
        classDP: 'DP Class 2',
        source: 'IMCA Safety Flash 42/25',
        link: 'https://www.imca-int.com/safety-events/42-25/',
        summary: `The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops. Thrusters responded late to positional errors. Operator initiated manual correction but system had exceeded excursion limits.`,
        tags: ['gyro', 'drive off', 'sensor', 'position loss'],
      },
      {
        id: 'imca-2025-009',
        title: 'Thruster Control Software Failure During ROV Ops',
        date: '2025-08-05',
        vessel: 'DP DSV Subsea Alpha',
        location: 'North Sea',
        rootCause: 'Unexpected software reboot',
        classDP: 'DP Class 3',
        source: 'IMCA SF 37/25',
        link: 'https://www.imca-int.com/safety-events/37-25/',
        summary: `During critical ROV launch, the vessel experienced a momentary loss of thruster control due to unexpected software reboot. Position held, but manual override was required.`,
        tags: ['thruster', 'software', 'rov', 'reboot'],
      },
      {
        id: 'imca-2025-006',
        title: 'Reference System Failure in Heavy Weather',
        date: '2025-07-18',
        vessel: 'DP Drillship Beta',
        location: 'Gulf of Mexico',
        rootCause: 'Multiple DGPS reference loss',
        classDP: 'DP Class 3',
        source: 'IMCA SF 31/25',
        link: 'https://www.imca-int.com/safety-events/31-25/',
        summary: `During heavy weather operations, the vessel lost multiple DGPS references simultaneously. Redundant system switched to acoustic positioning, but with degraded accuracy. Operations were suspended until conditions improved.`,
        tags: ['dgps', 'reference system', 'weather', 'acoustic'],
      },
      {
        id: 'imca-2024-089',
        title: 'Power Management System Malfunction',
        date: '2024-12-03',
        vessel: 'DP Construction Vessel Gamma',
        location: 'Santos Basin',
        rootCause: 'PMS configuration error',
        classDP: 'DP Class 2',
        source: 'IMCA SF 89/24',
        link: 'https://www.imca-int.com/safety-events/89-24/',
        summary: `The Power Management System experienced a configuration error that resulted in unnecessary load shedding. While DP was maintained, several non-critical systems were powered down temporarily causing operational delays.`,
        tags: ['pms', 'power', 'load shedding', 'configuration'],
      },
      {
        id: 'imca-2024-076',
        title: 'Wind Sensor Calibration Issue',
        date: '2024-10-22',
        vessel: 'DP Pipelay Vessel Delta',
        location: 'West Africa',
        rootCause: 'Incorrect wind sensor calibration',
        classDP: 'DP Class 2',
        source: 'IMCA SF 76/24',
        link: 'https://www.imca-int.com/safety-events/76-24/',
        summary: `During pipelaying operations, it was discovered that the wind sensor had been incorrectly calibrated after maintenance. This led to sub-optimal thruster allocation and increased fuel consumption before being detected.`,
        tags: ['wind sensor', 'calibration', 'thruster allocation'],
      }
    ];

    return new Response(
      JSON.stringify({ 
        incidents,
        meta: {
          total: incidents.length,
          source: 'DP Intelligence Center - Mock Feed',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }),
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );

  } catch (error) {
    console.error("DP Intel Feed Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch DP incidents feed",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});
