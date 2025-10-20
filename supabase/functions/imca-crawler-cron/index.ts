// ✅ Edge Function: imca-crawler-cron v1.0
// Automated weekly IMCA incidents crawler
// Fetches latest incidents from https://www.imca-int.com/safety-events/
// Runs weekly to update dp_incidents table with new incidents
// Schedule: Every Monday at 09:00 UTC

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// Use Deno-compatible cheerio alternative
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IMCAIncident {
  title: string;
  link_original: string;
  incident_date: string;
  description?: string;
  sistema_afetado?: string;
  severity?: string;
}

interface CrawlerResponse {
  success: boolean;
  total_found?: number;
  new_incidents?: number;
  duplicates?: number;
  error?: string;
  details?: string;
}

/**
 * Fetch and parse IMCA safety events page
 */
async function fetchIMCAIncidents(): Promise<IMCAIncident[]> {
  try {
    console.log('🌐 Fetching IMCA safety events...');
    
    const response = await fetch('https://www.imca-int.com/safety-events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMCACrawler/1.0; +https://nautilus-travel-hr.vercel.app)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const incidents: IMCAIncident[] = [];

    // Parse news list items
    $('.news-list__item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.news-list__title').text().trim();
      const link = $el.find('a').attr('href');
      const dateText = $el.find('.news-list__date').text().trim();
      
      if (title && link) {
        // Parse date
        let incidentDate: Date;
        try {
          incidentDate = new Date(dateText);
          if (isNaN(incidentDate.getTime())) {
            console.warn(`⚠️  Invalid date format: "${dateText}" for incident: ${title}`);
            incidentDate = new Date();
          }
        } catch (error) {
          console.warn(`⚠️  Error parsing date: "${dateText}" for incident: ${title}`);
          incidentDate = new Date();
        }

        // Construct full URL
        const fullLink = link.startsWith('http') ? link : `https://www.imca-int.com${link}`;

        incidents.push({
          title,
          link_original: fullLink,
          incident_date: incidentDate.toISOString(),
        });
      }
    });

    console.log(`✅ Found ${incidents.length} incidents on IMCA website`);
    return incidents;
    
  } catch (error) {
    console.error('❌ Error fetching IMCA incidents:', error);
    throw error;
  }
}

/**
 * Save incidents to Supabase
 */
async function saveIncidents(supabase: any, incidents: IMCAIncident[]): Promise<{ new: number; duplicates: number }> {
  let newCount = 0;
  let duplicateCount = 0;

  for (const incident of incidents) {
    try {
      // Check if incident already exists by link_original
      const { data: existing, error: queryError } = await supabase
        .from('dp_incidents')
        .select('id')
        .eq('link_original', incident.link_original)
        .maybeSingle();

      if (queryError) {
        console.error(`❌ Error checking for duplicate: ${incident.title}`, queryError);
        continue;
      }

      if (existing) {
        console.log(`⏭️  Already exists: ${incident.title}`);
        duplicateCount++;
        continue;
      }

      // Insert new incident
      const { error: insertError } = await supabase
        .from('dp_incidents')
        .insert({
          title: incident.title,
          description: incident.description || null,
          link_original: incident.link_original,
          incident_date: incident.incident_date,
          sistema_afetado: incident.sistema_afetado || null,
          severity: incident.severity || 'Média',
          vessel: 'Unknown',
          status: 'pending',
          tags: ['imca', 'crawler'],
        });

      if (insertError) {
        console.error(`❌ Error inserting incident: ${incident.title}`, insertError);
      } else {
        console.log(`🆕 New incident saved: ${incident.title}`);
        newCount++;
      }

    } catch (error) {
      console.error(`❌ Error processing incident: ${incident.title}`, error);
    }
  }

  return { new: newCount, duplicates: duplicateCount };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting IMCA Crawler Edge Function...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing Supabase configuration" 
        } as CrawlerResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch incidents from IMCA
    const incidents = await fetchIMCAIncidents();

    if (incidents.length === 0) {
      console.log('⚠️  No incidents found on IMCA website');
      return new Response(
        JSON.stringify({ 
          success: true, 
          total_found: 0,
          new_incidents: 0,
          duplicates: 0,
          details: "No incidents found on IMCA website"
        } as CrawlerResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save incidents to database
    const { new: newCount, duplicates: duplicateCount } = await saveIncidents(supabase, incidents);

    console.log('\n📊 Summary:');
    console.log(`   Total incidents found: ${incidents.length}`);
    console.log(`   New incidents saved: ${newCount}`);
    console.log(`   Duplicates skipped: ${duplicateCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_found: incidents.length,
        new_incidents: newCount,
        duplicates: duplicateCount,
        details: `Successfully processed ${incidents.length} incidents. ${newCount} new, ${duplicateCount} duplicates.`
      } as CrawlerResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('❌ IMCA Crawler failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      } as CrawlerResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
