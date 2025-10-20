/**
 * IMCA Crawler - Automatic DP Incidents Ingestion
 * 
 * This script fetches the latest DP incidents from the IMCA website
 * and saves them to the Supabase dp_incidents table.
 * 
 * Usage: npm run crawler:imca
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    console.warn(`⚠️  Could not parse date: ${dateText}, using current date`);
  }
  return new Date().toISOString();
}

/**
 * Fetch incidents from IMCA website
 */
async function fetchIMCAIncidents(): Promise<IncidentData[]> {
  console.log('🌐 Fetching IMCA safety events...');
  
  try {
    const { data: html } = await axios.get('https://www.imca-int.com/safety-events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMCA-Crawler/1.0; +https://travel-hr-buddy.com)',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(html);
    const incidents: IncidentData[] = [];

    // Parse incidents from IMCA website structure
    // Note: This selector may need to be adjusted based on the actual HTML structure
    $('.news-list__item, .event-item, article.post').each((_, element) => {
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

    console.log(`✅ Found ${incidents.length} incidents on IMCA website`);
    return incidents;
  } catch (error) {
    console.error('❌ Error fetching IMCA incidents:', error);
    throw error;
  }
}

/**
 * Save incidents to Supabase dp_incidents table
 */
async function saveIncidents(incidents: IncidentData[]) {
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
        console.error(`❌ Error checking incident: ${incident.title}`, checkError);
        errorCount++;
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
        console.error(`❌ Error inserting incident: ${incident.title}`, insertError);
        errorCount++;
        continue;
      }

      console.log(`🆕 New incident saved: ${incident.title}`);
      newCount++;
    } catch (error) {
      console.error(`❌ Error processing incident: ${incident.title}`, error);
      errorCount++;
    }
  }

  return { newCount, duplicateCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting IMCA Crawler...\n');

  try {
    // Fetch incidents from IMCA
    const incidents = await fetchIMCAIncidents();

    if (incidents.length === 0) {
      console.log('⚠️  No incidents found on IMCA website');
      return;
    }

    // Save incidents to database
    console.log('\n💾 Saving incidents to database...');
    const { newCount, duplicateCount, errorCount } = await saveIncidents(incidents);

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Total found: ${incidents.length}`);
    console.log(`   New saved: ${newCount}`);
    console.log(`   Duplicates skipped: ${duplicateCount}`);
    console.log(`   Errors: ${errorCount}`);

    console.log('\n✅ IMCA Crawler completed successfully!');
  } catch (error) {
    console.error('\n❌ IMCA Crawler failed:', error);
    process.exit(1);
  }
}

// Run the crawler
main();
