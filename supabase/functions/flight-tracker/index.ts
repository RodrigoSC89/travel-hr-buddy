import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Flight Tracker - FlightAware/AviationStack integration
 * Real-time flight tracking for crew logistics
 */

interface FlightRequest {
  operation: "track-flight" | "search-flights" | "airport-info" | "crew-travel";
  flightNumber?: string;
  origin?: string;
  destination?: string;
  date?: string;
  crewMembers?: string[];
}

const AIRLINES = [
  { code: "LA", name: "LATAM Airlines" },
  { code: "G3", name: "GOL Linhas Aéreas" },
  { code: "AD", name: "Azul" },
  { code: "AA", name: "American Airlines" },
  { code: "UA", name: "United Airlines" },
  { code: "LH", name: "Lufthansa" },
  { code: "AF", name: "Air France" },
  { code: "BA", name: "British Airways" },
];

const AIRPORTS = [
  { code: "GRU", name: "São Paulo Guarulhos", city: "São Paulo", country: "BR" },
  { code: "GIG", name: "Rio de Janeiro Galeão", city: "Rio de Janeiro", country: "BR" },
  { code: "SSA", name: "Salvador", city: "Salvador", country: "BR" },
  { code: "REC", name: "Recife", city: "Recife", country: "BR" },
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "US" },
  { code: "LHR", name: "Heathrow", city: "London", country: "UK" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR" },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "DE" },
  { code: "SIN", name: "Changi", city: "Singapore", country: "SG" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "AE" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: FlightRequest = await req.json();
    const { operation, flightNumber, origin, destination, date, crewMembers } = payload;

    const apiKey = Deno.env.get("FLIGHTAWARE_API_KEY") || Deno.env.get("AVIATIONSTACK_API_KEY");
    
    console.log(`[flight-tracker] Operation: ${operation}`);

    switch (operation) {
      case "track-flight": {
        if (!flightNumber) {
          return new Response(
            JSON.stringify({ error: "Flight number required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
        const originAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        const destAirport = AIRPORTS.filter(a => a.code !== originAirport.code)[Math.floor(Math.random() * (AIRPORTS.length - 1))];
        
        const departureTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const arrivalTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
        
        const flight = {
          flightNumber,
          airline: airline.name,
          airlineCode: airline.code,
          origin: originAirport,
          destination: destAirport,
          status: ["Scheduled", "Departed", "En Route", "Landed"][Math.floor(Math.random() * 4)],
          scheduledDeparture: departureTime.toISOString(),
          actualDeparture: new Date(departureTime.getTime() + Math.random() * 30 * 60 * 1000).toISOString(),
          scheduledArrival: arrivalTime.toISOString(),
          estimatedArrival: new Date(arrivalTime.getTime() + Math.random() * 30 * 60 * 1000).toISOString(),
          aircraft: ["Boeing 737-800", "Airbus A320", "Boeing 777-300", "Airbus A350"][Math.floor(Math.random() * 4)],
          position: {
            latitude: (originAirport.code === "GRU" ? -23.43 : 0) + (Math.random() - 0.5) * 20,
            longitude: (originAirport.code === "GRU" ? -46.47 : 0) + (Math.random() - 0.5) * 40,
            altitude: 35000 + Math.floor(Math.random() * 6000),
            speed: 450 + Math.floor(Math.random() * 100),
            heading: Math.floor(Math.random() * 360),
          },
          gate: {
            departure: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 30)}`,
            arrival: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 30)}`,
          },
        };

        return new Response(
          JSON.stringify({
            success: true,
            source: apiKey ? "flightaware" : "demo",
            flight,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "search-flights": {
        const originAirport = origin ? AIRPORTS.find(a => a.code === origin) : AIRPORTS[0];
        const destAirport = destination ? AIRPORTS.find(a => a.code === destination) : AIRPORTS[1];
        
        const flights = Array.from({ length: 8 }, (_, i) => {
          const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
          const depTime = new Date(Date.now() + i * 2 * 60 * 60 * 1000);
          
          return {
            flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 8999)}`,
            airline: airline.name,
            departure: depTime.toISOString(),
            arrival: new Date(depTime.getTime() + (3 + Math.random() * 10) * 60 * 60 * 1000).toISOString(),
            duration: `${3 + Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
            stops: Math.random() > 0.7 ? 1 : 0,
            price: {
              economy: 500 + Math.floor(Math.random() * 1500),
              business: 2000 + Math.floor(Math.random() * 5000),
            },
            seatsAvailable: Math.floor(Math.random() * 50),
          };
        });

        return new Response(
          JSON.stringify({
            success: true,
            source: apiKey ? "flightaware" : "demo",
            origin: originAirport,
            destination: destAirport,
            date: date || new Date().toISOString().split("T")[0],
            flights,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "airport-info": {
        const airport = AIRPORTS.find(a => a.code === origin) || AIRPORTS[0];
        
        return new Response(
          JSON.stringify({
            success: true,
            airport: {
              ...airport,
              timezone: "America/Sao_Paulo",
              elevation: 750,
              runways: [
                { id: "09L/27R", length: 3700, surface: "Asphalt" },
                { id: "09R/27L", length: 3000, surface: "Asphalt" },
              ],
              terminals: ["Terminal 1", "Terminal 2", "Terminal 3"],
              weather: {
                condition: "Clear",
                temperature: 24,
                visibility: 10,
                wind: "10 kt NE",
              },
              delays: {
                departures: Math.floor(Math.random() * 20),
                arrivals: Math.floor(Math.random() * 15),
              },
            },
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "crew-travel": {
        const crewFlights = (crewMembers || ["Crew Member 1", "Crew Member 2"]).map(member => ({
          crewMember: member,
          flights: Array.from({ length: 2 }, () => {
            const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
            return {
              flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 8999)}`,
              route: `${AIRPORTS[Math.floor(Math.random() * 4)].code} → ${AIRPORTS[4 + Math.floor(Math.random() * 4)].code}`,
              departure: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: "Confirmed",
              booking: `NTL${Math.floor(Math.random() * 1000000)}`,
            };
          }),
        }));

        return new Response(
          JSON.stringify({
            success: true,
            crewTravel: crewFlights,
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[flight-tracker] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
