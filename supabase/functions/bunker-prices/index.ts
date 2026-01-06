/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BunkerPrice {
  port: string;
  country: string;
  vlsfo: number;
  mgo: number;
  hfo: number;
  currency: string;
  lastUpdated: string;
  source: string;
  trend?: "up" | "down" | "stable";
  change24h?: number;
}

interface BunkerPricesResponse {
  success: boolean;
  prices: BunkerPrice[];
  globalAverage: {
    vlsfo: number;
    mgo: number;
    hfo: number;
  };
  lastUpdated: string;
  source: string;
}

interface HistoricalPrice {
  date: string;
  vlsfo: number;
  mgo: number;
  hfo: number;
}

// Simulated real-time bunker prices (would be replaced with actual API calls)
// In production, this would call Ship&Bunker API, Platts, or similar
const LIVE_BUNKER_DATA: BunkerPrice[] = [
  { 
    port: "Rotterdam", 
    country: "Netherlands", 
    vlsfo: 598, 
    mgo: 742, 
    hfo: 462, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "down",
    change24h: -3.2
  },
  { 
    port: "Singapore", 
    country: "Singapore", 
    vlsfo: 575, 
    mgo: 715, 
    hfo: 445, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "stable",
    change24h: 0.5
  },
  { 
    port: "Houston", 
    country: "USA", 
    vlsfo: 612, 
    mgo: 758, 
    hfo: 478, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "up",
    change24h: 2.8
  },
  { 
    port: "Fujairah", 
    country: "UAE", 
    vlsfo: 565, 
    mgo: 698, 
    hfo: 438, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "down",
    change24h: -1.5
  },
  { 
    port: "Shanghai", 
    country: "China", 
    vlsfo: 582, 
    mgo: 725, 
    hfo: 455, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "stable",
    change24h: 0.2
  },
  { 
    port: "Santos", 
    country: "Brazil", 
    vlsfo: 625, 
    mgo: 772, 
    hfo: 485, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "up",
    change24h: 4.1
  },
  { 
    port: "Gibraltar", 
    country: "Gibraltar", 
    vlsfo: 608, 
    mgo: 755, 
    hfo: 472, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "down",
    change24h: -2.0
  },
  { 
    port: "Las Palmas", 
    country: "Spain", 
    vlsfo: 595, 
    mgo: 738, 
    hfo: 465, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "stable",
    change24h: -0.3
  },
  { 
    port: "Durban", 
    country: "South Africa", 
    vlsfo: 618, 
    mgo: 765, 
    hfo: 480, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "up",
    change24h: 1.9
  },
  { 
    port: "Piraeus", 
    country: "Greece", 
    vlsfo: 592, 
    mgo: 735, 
    hfo: 458, 
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    source: "market",
    trend: "down",
    change24h: -1.2
  },
];

// Add some randomness to simulate live prices
function addMarketVariation(prices: BunkerPrice[]): BunkerPrice[] {
  return prices.map(p => ({
    ...p,
    vlsfo: Math.round(p.vlsfo * (1 + (Math.random() - 0.5) * 0.02)),
    mgo: Math.round(p.mgo * (1 + (Math.random() - 0.5) * 0.02)),
    hfo: Math.round(p.hfo * (1 + (Math.random() - 0.5) * 0.02)),
    lastUpdated: new Date().toISOString(),
  }));
}

function calculateGlobalAverage(prices: BunkerPrice[]) {
  const count = prices.length;
  return {
    vlsfo: Math.round(prices.reduce((sum, p) => sum + p.vlsfo, 0) / count),
    mgo: Math.round(prices.reduce((sum, p) => sum + p.mgo, 0) / count),
    hfo: Math.round(prices.reduce((sum, p) => sum + p.hfo, 0) / count),
  };
}

// Generate 30-day historical data for a port
function generateHistoricalData(portName: string): HistoricalPrice[] {
  const portData = LIVE_BUNKER_DATA.find(p => 
    p.port.toLowerCase() === portName.toLowerCase()
  ) || LIVE_BUNKER_DATA[1]; // Default to Singapore

  const history: HistoricalPrice[] = [];
  const today = new Date();

  // Create trend patterns for realism
  const trendDirection = portData.trend === "up" ? 1 : portData.trend === "down" ? -1 : 0;
  const volatility = 0.015;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayFactor = (29 - i) / 29;
    const trendAdjust = trendDirection * dayFactor * 0.04;
    const dailyNoise = (Math.random() - 0.5) * volatility * 2;
    const factor = 1 + trendAdjust + dailyNoise;

    history.push({
      date: date.toISOString().split("T")[0],
      vlsfo: Math.round(portData.vlsfo * factor),
      mgo: Math.round(portData.mgo * factor * (1 + (Math.random() - 0.5) * 0.008)),
      hfo: Math.round(portData.hfo * factor * (1 + (Math.random() - 0.5) * 0.008)),
    });
  }

  return history;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { port, fuelType, includeHistory } = await req.json().catch(() => ({}));

    // Get live prices with market variation
    let prices = addMarketVariation(LIVE_BUNKER_DATA);

    // Filter by port if specified
    if (port) {
      prices = prices.filter(p => 
        p.port.toLowerCase().includes(port.toLowerCase()) ||
        p.country.toLowerCase().includes(port.toLowerCase())
      );
    }

    // Calculate global average
    const globalAverage = calculateGlobalAverage(LIVE_BUNKER_DATA);

    const response: BunkerPricesResponse & { history?: HistoricalPrice[] } = {
      success: true,
      prices,
      globalAverage,
      lastUpdated: new Date().toISOString(),
      source: "Nautilus Market Data",
    };

    // Include 30-day history if requested
    if (includeHistory && port) {
      response.history = generateHistoricalData(port);
    }

    // If specific fuel type requested, add it to response
    if (fuelType) {
      const avgPrice = globalAverage[fuelType.toLowerCase() as keyof typeof globalAverage];
      if (avgPrice) {
        (response as any).requestedFuelType = {
          type: fuelType.toUpperCase(),
          globalAverage: avgPrice,
          cheapestPort: prices.reduce((min, p) => {
            const price = p[fuelType.toLowerCase() as keyof BunkerPrice] as number;
            const minPrice = min[fuelType.toLowerCase() as keyof BunkerPrice] as number;
            return price < minPrice ? p : min;
          }, prices[0]),
        };
      }
    }

    console.log(`Bunker prices fetched for port: ${port || "all"}, includeHistory: ${!!includeHistory}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching bunker prices:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        prices: [],
        globalAverage: { vlsfo: 580, mgo: 720, hfo: 450 },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
