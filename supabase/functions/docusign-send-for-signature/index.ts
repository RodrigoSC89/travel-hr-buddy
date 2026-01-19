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

    const { document_id, document_base64, signers, email_subject, email_body } = await req.json();

    if (!document_base64 || !signers || signers.length === 0) {
      return errorResponse('Document and at least one signer are required', 400);
    }

    const docusignAccountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    const docusignAccessToken = Deno.env.get('DOCUSIGN_ACCESS_TOKEN');
    const docusignBaseUrl = Deno.env.get('DOCUSIGN_BASE_URL') || 'https://demo.docusign.net/restapi';

    if (!docusignAccountId || !docusignAccessToken) {
      return errorResponse('DocuSign credentials not configured', 500);
    }

    // Build envelope definition
    const envelopeDefinition = {
      emailSubject: email_subject || 'Please sign this document',
      emailBlurb: email_body || 'Please review and sign the attached document.',
      documents: [{
        documentBase64: document_base64,
        name: 'Document',
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: signers.map((signer: { email: string; name: string }, index: number) => ({
          email: signer.email,
          name: signer.name,
          recipientId: String(index + 1),
          routingOrder: String(index + 1),
          tabs: {
            signHereTabs: [{
              anchorString: '/sig/',
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0'
            }],
            dateSignedTabs: [{
              anchorString: '/date/',
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0'
            }]
          }
        }))
      },
      status: 'sent'
    };

    const response = await fetch(
      `${docusignBaseUrl}/v2.1/accounts/${docusignAccountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${docusignAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(envelopeDefinition)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      log('error', 'docusign-send-for-signature', 'DocuSign API error', { error: errorData });
      return errorResponse('Failed to send document for signature', 500);
    }

    const result = await response.json();

    // Log the signature request
    await supabase.from('document_signatures').insert({
      document_id,
      envelope_id: result.envelopeId,
      status: 'sent',
      signers: signers,
      sent_by: user.id,
      sent_at: new Date().toISOString()
    });

    log('info', 'docusign-send-for-signature', 'Document sent for signature', { envelopeId: result.envelopeId });
    return jsonResponse({
      success: true,
      data: {
        envelope_id: result.envelopeId,
        status: result.status,
        uri: result.uri
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'docusign-send-for-signature', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
