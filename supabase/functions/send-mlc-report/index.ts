// @ts-nocheck
/**
 * Send MLC Report Email Edge Function
 * Sends MLC inspection reports via Resend to shipowner and Flag State
 * PATCH 861: MLC Report Email Integration
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MLCReportEmailRequest {
  // Recipients
  shipownerEmail: string;
  shipownerName?: string;
  flagStateEmail?: string;
  flagStateName?: string;
  additionalRecipients?: string[];
  
  // Inspection Data
  vesselName: string;
  imoNumber: string;
  flagState: string;
  portOfInspection: string;
  inspectorName: string;
  inspectionDate: string;
  
  // Results
  complianceScore: number;
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  naItems: number;
  
  // Non-conformities summary
  nonConformities: Array<{
    itemId: string;
    title: string;
    severity: string;
    correctiveAction?: string;
    deadline?: string;
  }>;
  
  // Optional PDF attachment (base64)
  pdfAttachment?: string;
  pdfFilename?: string;
  
  // Email customization
  subject?: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: MLCReportEmailRequest = await req.json();
    console.log("[MLC Email] Processing request for vessel:", data.vesselName);

    // Validate required fields
    if (!data.shipownerEmail || !data.vesselName || !data.imoNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: shipownerEmail, vesselName, imoNumber" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build recipients list
    const recipients: string[] = [data.shipownerEmail];
    if (data.flagStateEmail) {
      recipients.push(data.flagStateEmail);
    }
    if (data.additionalRecipients?.length) {
      recipients.push(...data.additionalRecipients);
    }

    // Determine compliance status color
    const statusColor = data.complianceScore >= 90 ? "#22c55e" : 
                        data.complianceScore >= 70 ? "#f59e0b" : "#ef4444";
    const statusText = data.complianceScore >= 90 ? "COMPLIANT" : 
                       data.complianceScore >= 70 ? "MINOR DEFICIENCIES" : "NON-COMPLIANT";

    // Build non-conformities table
    const ncRows = data.nonConformities.map(nc => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${nc.itemId}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${nc.title}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
          <span style="background: ${
            nc.severity === 'critical' ? '#ef4444' : 
            nc.severity === 'high' ? '#f97316' : 
            nc.severity === 'medium' ? '#f59e0b' : '#3b82f6'
          }; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
            ${nc.severity.toUpperCase()}
          </span>
        </td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${nc.deadline || '14 days'}</td>
      </tr>
    `).join('');

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0052a3 0%, #007bc1 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚓ MLC 2006 INSPECTION REPORT</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Maritime Labour Convention 2006 (as amended 2022)</p>
  </div>

  <!-- Vessel Info -->
  <div style="background: #f8fafc; padding: 25px; border: 1px solid #e2e8f0;">
    <h2 style="margin: 0 0 15px 0; color: #0052a3; font-size: 18px;">📋 Vessel Information</h2>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 5px 0;"><strong>Vessel Name:</strong></td>
        <td>${data.vesselName}</td>
        <td style="padding: 5px 0;"><strong>IMO Number:</strong></td>
        <td>${data.imoNumber}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong>Flag State:</strong></td>
        <td>${data.flagState}</td>
        <td style="padding: 5px 0;"><strong>Port:</strong></td>
        <td>${data.portOfInspection}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong>Inspector:</strong></td>
        <td>${data.inspectorName}</td>
        <td style="padding: 5px 0;"><strong>Date:</strong></td>
        <td>${new Date(data.inspectionDate).toLocaleDateString('en-GB')}</td>
      </tr>
    </table>
  </div>

  <!-- Compliance Score -->
  <div style="background: white; padding: 25px; border: 1px solid #e2e8f0; text-align: center;">
    <h2 style="margin: 0 0 15px 0; color: #0052a3; font-size: 18px;">📊 Compliance Score</h2>
    <div style="display: inline-block; background: ${statusColor}; color: white; padding: 20px 40px; border-radius: 12px; margin-bottom: 15px;">
      <div style="font-size: 48px; font-weight: bold;">${data.complianceScore}%</div>
      <div style="font-size: 14px; opacity: 0.9;">${statusText}</div>
    </div>
    <div style="display: flex; justify-content: center; gap: 30px; margin-top: 15px;">
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${data.compliantItems}</div>
        <div style="font-size: 12px; color: #666;">Compliant</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${data.nonCompliantItems}</div>
        <div style="font-size: 12px; color: #666;">Non-Compliant</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #6b7280;">${data.naItems}</div>
        <div style="font-size: 12px; color: #666;">N/A</div>
      </div>
    </div>
  </div>

  ${data.nonConformities.length > 0 ? `
  <!-- Non-Conformities -->
  <div style="background: #fff5f5; padding: 25px; border: 1px solid #fed7d7;">
    <h2 style="margin: 0 0 15px 0; color: #c53030; font-size: 18px;">⚠️ Non-Conformities (${data.nonConformities.length})</h2>
    <table style="width: 100%; border-collapse: collapse; background: white;">
      <thead>
        <tr style="background: #fee2e2;">
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Item</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Description</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Severity</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Deadline</th>
        </tr>
      </thead>
      <tbody>
        ${ncRows}
      </tbody>
    </table>
  </div>
  ` : `
  <div style="background: #f0fdf4; padding: 25px; border: 1px solid #bbf7d0; text-align: center;">
    <div style="font-size: 48px;">✅</div>
    <h2 style="margin: 10px 0; color: #166534;">No Non-Conformities Found</h2>
    <p style="color: #666; margin: 0;">The vessel meets all MLC 2006 requirements inspected.</p>
  </div>
  `}

  ${data.additionalNotes ? `
  <!-- Additional Notes -->
  <div style="background: #fffbeb; padding: 25px; border: 1px solid #fef3c7;">
    <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">📝 Additional Notes</h2>
    <p style="margin: 0; color: #666;">${data.additionalNotes}</p>
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="background: #1e293b; padding: 25px; text-align: center; border-radius: 0 0 8px 8px;">
    <p style="color: rgba(255,255,255,0.7); margin: 0 0 10px 0; font-size: 14px;">
      This report was generated by <strong style="color: white;">Nautilus One</strong> - Maritime HR Management System
    </p>
    <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">
      Report generated on ${new Date().toLocaleString('en-GB')} | Reference: MLC-${data.imoNumber}-${Date.now()}
    </p>
  </div>

</body>
</html>
    `;

    // Prepare attachments if PDF is provided
    const attachments = data.pdfAttachment ? [{
      filename: data.pdfFilename || `MLC_Report_${data.vesselName}_${data.inspectionDate}.pdf`,
      content: data.pdfAttachment,
    }] : [];

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Nautilus One <reports@resend.dev>",
      to: recipients,
      subject: data.subject || `MLC Inspection Report - ${data.vesselName} (${data.imoNumber}) - ${statusText}`,
      html: emailHtml,
      attachments,
    });

    console.log("[MLC Email] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.id,
        recipients,
        vesselName: data.vesselName,
        complianceScore: data.complianceScore,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("[MLC Email] Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
