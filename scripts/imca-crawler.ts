/**
 * IMCA Crawler - Automatic DP Incidents Ingestion
 * 
 * Fetches latest public incidents from IMCA website:
 * https://www.imca-int.com/safety-events/
 * 
 * Saves to Supabase dp_incidents table with fields:
 * - title (titulo)
 * - description (descricao)
 * - sistema_afetado (optional, detected via NLP or text pattern)
 * - severity (gravidade, optional if indicated)
 * - link_original (full URL of original source)
 * - incident_date (data_incidente - publication date)
 * 
 * Usage:
 *   npx tsx scripts/imca-crawler.ts
 * 
 * Environment Variables Required:
 *   VITE_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for server-side operations)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface IMCAIncident {
  title: string;
  link_original: string;
  incident_date: string;
  description?: string;
  sistema_afetado?: string;
  severity?: string;
}

/**
 * Fetch and parse IMCA safety events page
 */
async function fetchIMCAIncidents(): Promise<IMCAIncident[]> {
  try {
    console.log('🌐 Fetching IMCA safety events from: https://www.imca-int.com/safety-events/');
    
    const { data: html } = await axios.get('https://www.imca-int.com/safety-events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMCACrawler/1.0; +https://nautilus-travel-hr.vercel.app)'
      }
    });
    
    const $ = cheerio.load(html);
    const incidents: IMCAIncident[] = [];

    // Parse news list items
    $('.news-list__item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.news-list__title').text().trim();
      const link = $el.find('a').attr('href');
      const dateText = $el.find('.news-list__date').text().trim();
      
      if (title && link) {
        // Parse date - IMCA typically uses formats like "15 October 2024"
        let incidentDate: Date;
        try {
          incidentDate = new Date(dateText);
          // If date is invalid, use current date
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
 * Save incidents to Supabase, avoiding duplicates
 */
async function saveIncidents(incidents: IMCAIncident[]): Promise<void> {
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
          severity: incident.severity || 'Média', // Default to 'Média' if not specified
          vessel: 'Unknown', // Required field, will be updated manually or via AI analysis
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

  console.log('\n📊 Summary:');
  console.log(`   Total incidents found: ${incidents.length}`);
  console.log(`   New incidents saved: ${newCount}`);
  console.log(`   Duplicates skipped: ${duplicateCount}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting IMCA Crawler...\n');
  
  try {
    const incidents = await fetchIMCAIncidents();
    
    if (incidents.length === 0) {
      console.log('⚠️  No incidents found on IMCA website');
      return;
    }

    await saveIncidents(incidents);
    
    console.log('\n✅ IMCA Crawler completed successfully!');
    
  } catch (error) {
    console.error('\n❌ IMCA Crawler failed:', error);
    process.exit(1);
  }
}

// Run the crawler
main();
