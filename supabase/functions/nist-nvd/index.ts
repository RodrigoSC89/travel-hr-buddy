import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NIST_API_KEY = Deno.env.get('NIST_NVD_API_KEY');
const NVD_BASE_URL = 'https://services.nvd.nist.gov/rest/json';

interface NISTRequest {
  action: 'cve' | 'cves' | 'cpe' | 'cpe-match';
  cveId?: string;
  keyword?: string;
  cpeName?: string;
  cvssV3Severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  pubStartDate?: string;
  pubEndDate?: string;
  resultsPerPage?: number;
  startIndex?: number;
}

/**
 * NIST NVD API Integration
 * Provides CVE vulnerability data, CPE dictionary, and security advisories
 * Critical for maritime systems security compliance
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NISTRequest = await req.json();
    console.log(`[NIST-NVD] ${request.action} request`);

    const params = new URLSearchParams();
    let endpoint = '';

    // Add API key if available (increases rate limit from 5 to 50 requests per 30 seconds)
    const fetchHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (NIST_API_KEY) {
      fetchHeaders['apiKey'] = NIST_API_KEY;
    }

    switch (request.action) {
      case 'cve':
        // Get specific CVE by ID
        if (!request.cveId) throw new Error('CVE ID required');
        endpoint = '/cves/2.0';
        params.append('cveId', request.cveId);
        break;

      case 'cves':
        // Search CVEs with filters
        endpoint = '/cves/2.0';
        if (request.keyword) params.append('keywordSearch', request.keyword);
        if (request.cvssV3Severity) params.append('cvssV3Severity', request.cvssV3Severity);
        if (request.pubStartDate) params.append('pubStartDate', request.pubStartDate);
        if (request.pubEndDate) params.append('pubEndDate', request.pubEndDate);
        params.append('resultsPerPage', String(request.resultsPerPage || 20));
        if (request.startIndex) params.append('startIndex', String(request.startIndex));
        break;

      case 'cpe':
        // Search CPE dictionary
        endpoint = '/cpes/2.0';
        if (request.cpeName) params.append('cpeNameId', request.cpeName);
        if (request.keyword) params.append('keywordSearch', request.keyword);
        params.append('resultsPerPage', String(request.resultsPerPage || 20));
        break;

      case 'cpe-match':
        // Get CPE match strings
        endpoint = '/cpematch/2.0';
        if (request.cveId) params.append('cveId', request.cveId);
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    const url = `${NVD_BASE_URL}${endpoint}?${params.toString()}`;
    console.log(`[NIST-NVD] Fetching: ${endpoint}`);

    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NIST-NVD] API error: ${response.status} - ${errorText}`);

      if (response.status === 403) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NIST NVD API rate limit exceeded. Try again later.',
            source: 'nist-nvd',
            timestamp: new Date().toISOString(),
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`NIST NVD API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[NIST-NVD] Success - action: ${request.action}`);

    const transformedData = transformNISTData(data, request.action);

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        raw: data,
        source: 'nist-nvd',
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NIST-NVD] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'nist-nvd',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface CVEItem {
  cve: {
    id: string;
    descriptions: Array<{ lang: string; value: string }>;
    published: string;
    lastModified: string;
    vulnStatus: string;
    metrics?: {
      cvssMetricV31?: Array<{
        cvssData: {
          version: string;
          vectorString: string;
          baseScore: number;
          baseSeverity: string;
        };
      }>;
      cvssMetricV2?: Array<{
        cvssData: {
          version: string;
          vectorString: string;
          baseScore: number;
        };
      }>;
    };
    weaknesses?: Array<{
      description: Array<{ lang: string; value: string }>;
    }>;
    configurations?: Array<{
      nodes: Array<{
        cpeMatch: Array<{
          vulnerable: boolean;
          criteria: string;
        }>;
      }>;
    }>;
    references?: Array<{
      url: string;
      source: string;
      tags?: string[];
    }>;
  };
}

function transformNISTData(data: Record<string, unknown>, action: string): unknown {
  switch (action) {
    case 'cve':
    case 'cves':
      const vulnerabilities = data.vulnerabilities as CVEItem[] || [];
      return {
        totalResults: data.totalResults,
        resultsPerPage: data.resultsPerPage,
        startIndex: data.startIndex,
        vulnerabilities: vulnerabilities.map((vuln) => transformCVE(vuln)),
        summary: generateVulnerabilitySummary(vulnerabilities),
      };

    case 'cpe':
      const products = data.products as Array<{ cpe: Record<string, unknown> }> || [];
      return {
        totalResults: data.totalResults,
        products: products.map((p) => ({
          cpeName: p.cpe.cpeName,
          cpeNameId: p.cpe.cpeNameId,
          titles: p.cpe.titles,
          deprecated: p.cpe.deprecated,
          lastModified: p.cpe.lastModified,
        })),
      };

    default:
      return data;
  }
}

function transformCVE(vuln: CVEItem): Record<string, unknown> {
  const cve = vuln.cve;
  const cvssV3 = cve.metrics?.cvssMetricV31?.[0]?.cvssData;
  const cvssV2 = cve.metrics?.cvssMetricV2?.[0]?.cvssData;

  return {
    id: cve.id,
    description: cve.descriptions.find((d) => d.lang === 'en')?.value || cve.descriptions[0]?.value,
    published: cve.published,
    lastModified: cve.lastModified,
    status: cve.vulnStatus,
    cvss: {
      v3: cvssV3 ? {
        score: cvssV3.baseScore,
        severity: cvssV3.baseSeverity,
        vector: cvssV3.vectorString,
      } : null,
      v2: cvssV2 ? {
        score: cvssV2.baseScore,
        vector: cvssV2.vectorString,
      } : null,
    },
    severity: cvssV3?.baseSeverity || (cvssV2 ? getSeverityFromV2Score(cvssV2.baseScore) : 'UNKNOWN'),
    weaknesses: cve.weaknesses?.flatMap((w) => 
      w.description.filter((d) => d.lang === 'en').map((d) => d.value)
    ) || [],
    affectedProducts: cve.configurations?.flatMap((config) =>
      config.nodes.flatMap((node) =>
        node.cpeMatch.filter((m) => m.vulnerable).map((m) => m.criteria)
      )
    ) || [],
    references: cve.references?.slice(0, 10).map((ref) => ({
      url: ref.url,
      source: ref.source,
      tags: ref.tags,
    })) || [],
  };
}

function getSeverityFromV2Score(score: number): string {
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  return 'LOW';
}

function generateVulnerabilitySummary(vulnerabilities: CVEItem[]): Record<string, unknown> {
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };

  vulnerabilities.forEach((vuln) => {
    const cvssV3 = vuln.cve.metrics?.cvssMetricV31?.[0]?.cvssData;
    const severity = cvssV3?.baseSeverity || 'UNKNOWN';
    severityCounts[severity as keyof typeof severityCounts]++;
  });

  return {
    total: vulnerabilities.length,
    bySeverity: severityCounts,
    criticalCount: severityCounts.CRITICAL,
    highCount: severityCounts.HIGH,
    riskLevel: severityCounts.CRITICAL > 0 ? 'critical' :
               severityCounts.HIGH > 0 ? 'high' :
               severityCounts.MEDIUM > 0 ? 'moderate' : 'low',
  };
}
