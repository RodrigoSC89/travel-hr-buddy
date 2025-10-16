import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting IMCA crawler...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Fetching IMCA RSS feed...");
    const response = await fetch("https://www.imca-int.com/safety-events/feed/");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    console.log("RSS feed fetched successfully");

    const items = Array.from(xml.matchAll(/<item>(.*?)<\/item>/gs)).map((match) => {
      const raw = match[1];
      const title = raw.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = raw.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = raw.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const description = raw.match(/<description>(.*?)<\/description>/)?.[1] || "";
      return { title, link, pubDate, description };
    });

    console.log(`Found ${items.length} items in RSS feed`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const item of items) {
      try {
        // Generate a unique ID from the link (extract the incident number if present)
        const idMatch = item.link.match(/(\d+-\d+|[\w-]+)\/?\s*$/);
        const id = idMatch ? `imca-${idMatch[1]}` : `imca-${Date.now()}`;

        const { error } = await supabase.from("dp_incidents").upsert({
          id,
          title: item.title,
          link: item.link,
          summary: item.description,
          source: "IMCA",
          date: new Date(item.pubDate).toISOString(),
        }, { onConflict: "link" });

        if (error) {
          console.error(`Error upserting item ${id}:`, error);
          errors++;
        } else {
          // Check if it was an insert or update
          const { count } = await supabase
            .from("dp_incidents")
            .select("*", { count: "exact", head: true })
            .eq("link", item.link);
          
          if (count === 1) {
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (itemError) {
        console.error("Error processing item:", itemError);
        errors++;
      }
    }

    console.log(`Ingestion completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Ingestão concluída",
        stats: {
          total: items.length,
          inserted,
          updated,
          errors,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("IMCA crawler error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
