import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { template_type, data, title, include_header, include_footer } = await req.json();

    if (!template_type || !data) {
      return errorResponse('Template type and data are required', 400);
    }

    // Generate HTML based on template type
    let htmlContent = '';

    switch (template_type) {
      case 'crew_report':
        htmlContent = generateCrewReportHTML(data, title);
        break;
      case 'voyage_report':
        htmlContent = generateVoyageReportHTML(data, title);
        break;
      case 'compliance_report':
        htmlContent = generateComplianceReportHTML(data, title);
        break;
      case 'invoice':
        htmlContent = generateInvoiceHTML(data);
        break;
      case 'maintenance_report':
        htmlContent = generateMaintenanceReportHTML(data, title);
        break;
      default:
        htmlContent = generateGenericReportHTML(data, title);
    }

    // Wrap with header/footer if requested
    if (include_header || include_footer) {
      htmlContent = wrapWithHeaderFooter(htmlContent, include_header, include_footer);
    }

    log('info', 'pdf-generator', 'PDF content generated', { templateType: template_type });
    
    return jsonResponse({
      success: true,
      data: {
        html: htmlContent,
        generated_at: new Date().toISOString(),
        template_type
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'pdf-generator', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});

function generateCrewReportHTML(data: Record<string, unknown>, title?: string): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>${title || 'Crew Report'}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function generateVoyageReportHTML(data: Record<string, unknown>, title?: string): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>${title || 'Voyage Report'}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function generateComplianceReportHTML(data: Record<string, unknown>, title?: string): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>${title || 'Compliance Report'}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function generateInvoiceHTML(data: Record<string, unknown>): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>Invoice</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function generateMaintenanceReportHTML(data: Record<string, unknown>, title?: string): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>${title || 'Maintenance Report'}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function generateGenericReportHTML(data: Record<string, unknown>, title?: string): string {
  return `
    <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h1>${title || 'Report'}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}

function wrapWithHeaderFooter(content: string, header?: boolean, footer?: boolean): string {
  const headerHTML = header ? '<div style="text-align: center; border-bottom: 1px solid #ccc; padding: 10px;">Nauti One - Maritime HR Management</div>' : '';
  const footerHTML = footer ? `<div style="text-align: center; border-top: 1px solid #ccc; padding: 10px; margin-top: 20px;">Generated on ${new Date().toISOString()}</div>` : '';
  
  return content.replace('<body>', `<body>${headerHTML}`).replace('</body>', `${footerHTML}</body>`);
}
