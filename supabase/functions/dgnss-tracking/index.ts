import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// N2YO API for satellite tracking
const N2YO_API_KEY = Deno.env.get("N2YO_API_KEY") || "demo";
const N2YO_BASE_URL = "https://api.n2yo.com/rest/v1/satellite";

interface DGNSSRequest {
  action: "above" | "positions" | "passes" | "tle" | "visualPasses";
  noradId?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  observerLat?: number;
  observerLng?: number;
  observerAlt?: number;
  searchRadius?: number;
  category?: number;
  seconds?: number;
  days?: number;
  minElevation?: number;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DGNSSRequest = await req.json();
    const { action } = body;

    console.log(`DGNSS Tracking - Action: ${action}`, body);

    let result;

    switch (action) {
      case "above":
        result = await getSatellitesAbove(body);
        break;
      case "positions":
        result = await getSatellitePositions(body);
        break;
      case "passes":
        result = await getSatellitePasses(body);
        break;
      case "tle":
        result = await getSatelliteTLE(body);
        break;
      case "visualPasses":
        result = await getVisualPasses(body);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("DGNSS Tracking Error:", errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        satellites: getMockSatellites(),
      }),
      {
        status: 200, // Return 200 with mock data for graceful degradation
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function getSatellitesAbove(params: DGNSSRequest) {
  const { latitude = 0, longitude = 0, altitude = 0, searchRadius = 90, category = 18 } = params;
  
  const url = `${N2YO_BASE_URL}/above/${latitude}/${longitude}/${altitude}/${searchRadius}/${category}/&apiKey=${N2YO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      satellites: data.above || [],
      info: data.info,
      count: data.above?.length || 0,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("Using mock data due to API error:", errorMessage);
    return {
      satellites: getMockSatellites(),
      info: { category: "GPS", transactionscount: 0 },
      count: getMockSatellites().length,
      mock: true,
    };
  }
}

async function getSatellitePositions(params: DGNSSRequest) {
  const { noradId, observerLat = 0, observerLng = 0, observerAlt = 0, seconds = 1 } = params;
  
  if (!noradId) {
    throw new Error("noradId is required");
  }
  
  const url = `${N2YO_BASE_URL}/positions/${noradId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}/&apiKey=${N2YO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      positions: data.positions || [],
      info: data.info,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("Using mock position data:", errorMessage);
    return {
      positions: [getMockPosition(noradId)],
      mock: true,
    };
  }
}

async function getSatellitePasses(params: DGNSSRequest) {
  const { noradId, observerLat = 0, observerLng = 0, observerAlt = 0, days = 7, minElevation = 10 } = params;
  
  if (!noradId) {
    throw new Error("noradId is required");
  }
  
  const url = `${N2YO_BASE_URL}/radiopasses/${noradId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minElevation}/&apiKey=${N2YO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      passes: data.passes || [],
      info: data.info,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("Using mock passes data:", errorMessage);
    return {
      passes: getMockPasses(),
      mock: true,
    };
  }
}

async function getSatelliteTLE(params: DGNSSRequest) {
  const { noradId } = params;
  
  if (!noradId) {
    throw new Error("noradId is required");
  }
  
  const url = `${N2YO_BASE_URL}/tle/${noradId}&apiKey=${N2YO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      tle: {
        tle1: data.tle?.split("\r\n")?.[0] || "",
        tle2: data.tle?.split("\r\n")?.[1] || "",
      },
      info: data.info,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("Using mock TLE data:", errorMessage);
    return {
      tle: getMockTLE(noradId),
      mock: true,
    };
  }
}

async function getVisualPasses(params: DGNSSRequest) {
  const { noradId, observerLat = 0, observerLng = 0, observerAlt = 0, days = 7, minElevation = 10 } = params;
  
  if (!noradId) {
    throw new Error("noradId is required");
  }
  
  const url = `${N2YO_BASE_URL}/visualpasses/${noradId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minElevation}/&apiKey=${N2YO_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      passes: data.passes || [],
      info: data.info,
    };
  } catch (error: unknown) {
    return {
      passes: [],
      mock: true,
    };
  }
}

// Mock data functions for graceful degradation
function getMockSatellites() {
  const now = Date.now();
  return [
    {
      satid: 48859,
      satname: "GPS BIIF-12 (PRN 09)",
      intDesignator: "2021-054A",
      launchDate: "2021-06-17",
      satlat: -15 + Math.sin(now / 100000) * 20,
      satlng: -45 + Math.cos(now / 100000) * 30,
      satalt: 20200,
    },
    {
      satid: 41019,
      satname: "GPS BIIF-11 (PRN 10)",
      intDesignator: "2015-062A",
      launchDate: "2015-10-31",
      satlat: -10 + Math.sin(now / 110000) * 25,
      satlng: -50 + Math.cos(now / 110000) * 35,
      satalt: 20180,
    },
    {
      satid: 43508,
      satname: "GLONASS-M 756",
      intDesignator: "2018-053A",
      launchDate: "2018-06-16",
      satlat: -20 + Math.sin(now / 90000) * 15,
      satlng: -40 + Math.cos(now / 90000) * 25,
      satalt: 19100,
    },
    {
      satid: 43566,
      satname: "GALILEO 23",
      intDesignator: "2018-060A",
      launchDate: "2018-07-25",
      satlat: -5 + Math.sin(now / 95000) * 30,
      satlng: -55 + Math.cos(now / 95000) * 40,
      satalt: 23222,
    },
    {
      satid: 35951,
      satname: "EGNOS PRN 120",
      intDesignator: "2009-044A",
      launchDate: "2009-08-21",
      satlat: 0,
      satlng: -5,
      satalt: 35786,
    },
  ];
}

function getMockPosition(noradId: number) {
  const now = Date.now();
  return {
    satid: noradId,
    satname: `SAT-${noradId}`,
    satlatitude: Math.sin(now / 100000) * 55,
    satlongitude: ((now / 10000) % 360) - 180,
    sataltitude: 20200,
    azimuth: (now / 1000) % 360,
    elevation: 30 + Math.random() * 50,
    ra: Math.random() * 360,
    dec: (Math.random() - 0.5) * 180,
    timestamp: Math.floor(now / 1000),
  };
}

function getMockPasses() {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      startAz: 45,
      startAzCompass: "NE",
      startEl: 10,
      startUTC: now + 3600,
      maxAz: 180,
      maxAzCompass: "S",
      maxEl: 75,
      maxUTC: now + 3900,
      endAz: 315,
      endAzCompass: "NW",
      endEl: 10,
      endUTC: now + 4200,
      mag: -1.5,
      duration: 600,
    },
    {
      startAz: 90,
      startAzCompass: "E",
      startEl: 15,
      startUTC: now + 7200,
      maxAz: 0,
      maxAzCompass: "N",
      maxEl: 60,
      maxUTC: now + 7500,
      endAz: 270,
      endAzCompass: "W",
      endEl: 15,
      endUTC: now + 7800,
      mag: -2.0,
      duration: 600,
    },
  ];
}

function getMockTLE(noradId: number) {
  return {
    tle1: `1 ${noradId}U 21054A   24001.50000000  .00000000  00000-0  00000-0 0  9999`,
    tle2: `2 ${noradId}  55.0000   0.0000 0000001   0.0000   0.0000 12.56000000    10`,
  };
}
