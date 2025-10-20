/**
 * IMCA Crawler Cron - Supabase Edge Function
 * 
 * Automatically fetches and ingests DP incidents from IMCA website
 * Scheduled to run every Monday at 09:00 UTC via Supabase cron
 * 
 * Deploy: supabase functions deploy imca-crawler-cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

interface IncidentData {
  title: string;
  link_original: string;
  incident_date: string;
  description?: string;
  sistema_afetado?: string;
  tags?: string[];
}

/**
 * Parse date from various formats to ISO 8601
 */
function parseDate(dateText: string): string {
  try {
    const date = new Date(dateText);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn(`Could not parse date: ${dateText}, using current date`);
  }
  return new Date().toISOString();
}

/**
 * Fetch incidents from IMCA website
 */
async function fetchIMCAIncidents(): Promise<IncidentData[]> {
  console.log('Fetching IMCA safety events...');
  
  try {
    const response = await fetch('https://www.imca-int.com/safety-events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMCA-Crawler/1.0; +https://travel-hr-buddy.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const incidents: IncidentData[] = [];

    // Parse incidents from IMCA website structure
    $('.news-list__item, .event-item, article.post').each((_, element: any) => {
      const $el = $(element);
      
      // Try different selectors for title
      const title = $el.find('.news-list__title, .event-title, h2, h3').first().text().trim() ||
                   $el.find('a').first().text().trim();
      
      // Try different selectors for link
      const linkHref = $el.find('a').first().attr('href');
      
      // Try different selectors for date
      const dateText = $el.find('.news-list__date, .event-date, time, .date').first().text().trim() ||
                      $el.find('.post-date').text().trim();

      if (title && linkHref) {
        // Ensure link is absolute
        const link = linkHref.startsWith('http') 
          ? linkHref 
          : `https://www.imca-int.com${linkHref}`;

        incidents.push({
          title,
          link_original: link,
          incident_date: dateText ? parseDate(dateText) : new Date().toISOString(),
          tags: ['imca', 'crawler'],
        });
      }
    });

    console.log(`Found ${incidents.length} incidents on IMCA website`);
    return incidents;
  } catch (error) {
    console.error('Error fetching IMCA incidents:', error);
    throw error;
  }
}

/**
 * Save incidents to Supabase dp_incidents table
 */
async function saveIncidents(supabase: any, incidents: IncidentData[]) {
  let newCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const incident of incidents) {
    try {
      // Check if incident already exists (by link_original)
      const { data: existing, error: checkError } = await supabase
        .from('dp_incidents')
        .select('id')
        .eq('link_original', incident.link_original)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking incident: ${incident.title}`, checkError);
        errorCount++;
        continue;
      }

      if (existing) {
        console.log(`Already exists: ${incident.title}`);
        duplicateCount++;
        continue;
      }

      // Insert new incident
      const { error: insertError } = await supabase
        .from('dp_incidents')
        .insert({
          title: incident.title,
          link_original: incident.link_original,
          incident_date: incident.incident_date,
          description: incident.description || incident.title,
          sistema_afetado: incident.sistema_afetado,
          tags: incident.tags,
          severity: 'Média', // Default severity, can be updated later
          vessel: 'Unknown', // Will be updated when more details are available
          status: 'pending',
        });

      if (insertError) {
        console.error(`Error inserting incident: ${incident.title}`, insertError);
        errorCount++;
        continue;
      }

      console.log(`New incident saved: ${incident.title}`);
      newCount++;
    } catch (error) {
      console.error(`Error processing incident: ${incident.title}`, error);
      errorCount++;
    }
  }

  return { newCount, duplicateCount, errorCount };
}

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting IMCA Crawler...');

    // Fetch incidents from IMCA
    const incidents = await fetchIMCAIncidents();

    if (incidents.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No incidents found on IMCA website',
          data: {
            total: 0,
            new: 0,
            duplicates: 0,
            errors: 0,
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Save incidents to database
    console.log('Saving incidents to database...');
    const { newCount, duplicateCount, errorCount } = await saveIncidents(supabase, incidents);

    // Return summary
    const response = {
      success: true,
      message: 'IMCA Crawler completed successfully',
      data: {
        total: incidents.length,
        new: newCount,
        duplicates: duplicateCount,
        errors: errorCount,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('IMCA Crawler completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('IMCA Crawler failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'IMCA Crawler failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
