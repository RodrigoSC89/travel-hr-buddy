/**
 * DocuSign Integration Edge Function
 * Sends documents for digital signature via DocuSign API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignatureRequest {
  documentTitle: string;
  documentType: 'contract' | 'gmud' | 'audit' | 'policy';
  signers: Array<{
    email: string;
    name: string;
    role: string;
  }>;
  documentContent?: string;
  documentBase64?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DOCUSIGN_API_KEY = Deno.env.get('DOCUSIGN_API_KEY');
    const DOCUSIGN_INTEGRATION_KEY = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const DOCUSIGN_ACCOUNT_ID = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    if (!DOCUSIGN_API_KEY || !DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_ACCOUNT_ID) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'DocuSign not configured. Please add DOCUSIGN_API_KEY, DOCUSIGN_INTEGRATION_KEY, and DOCUSIGN_ACCOUNT_ID secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SignatureRequest = await req.json();
    const { documentTitle, documentType, signers, documentContent, documentBase64, metadata } = body;

    if (!documentTitle || !signers || signers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: documentTitle, signers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Creating envelope for document

    // Build DocuSign envelope definition
    const envelopeDefinition = {
      emailSubject: `Nautilus One - Assinatura: ${documentTitle}`,
      emailBlurb: `Por favor, revise e assine o documento "${documentTitle}" através do Nautilus One Maritime HR Management.`,
      documents: [{
        documentBase64: documentBase64 || Buffer.from(documentContent || `Document: ${documentTitle}`).toString('base64'),
        name: `${documentTitle}.pdf`,
        fileExtension: 'pdf',
        documentId: '1',
      }],
      recipients: {
        signers: signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: String(index + 1),
          routingOrder: String(index + 1),
          roleName: signer.role,
          tabs: {
            signHereTabs: [{
              anchorString: '/signer/',
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0',
            }],
            dateSignedTabs: [{
              anchorString: '/date/',
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0',
            }],
          },
        })),
      },
      status: 'sent',
    };

    // Call DocuSign API
    const docusignResponse = await fetch(
      `https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DOCUSIGN_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DocuSign-SDK': 'Node',
        },
        body: JSON.stringify(envelopeDefinition),
      }
    );

    if (!docusignResponse.ok) {
      const errorText = await docusignResponse.text();
      
      // Store failed attempt
      await supabase.from('docusign_envelopes').insert({
        document_type: documentType,
        document_title: documentTitle,
        status: 'failed',
        sender_id: user.id,
        sender_email: user.email,
        recipients: signers,
        document_data: metadata,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'DocuSign API error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const envelopeResult = await docusignResponse.json();

    // Store envelope in database
    const { data: envelope, error: dbError } = await supabase
      .from('docusign_envelopes')
      .insert({
        envelope_id: envelopeResult.envelopeId,
        document_type: documentType,
        document_title: documentTitle,
        status: 'sent',
        sender_id: user.id,
        sender_email: user.email,
        recipients: signers,
        document_data: metadata,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    // Note: dbError is silently handled - envelope was created successfully

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId: envelopeResult.envelopeId,
        status: 'sent',
        message: `Documento enviado para ${signers.length} assinante(s)`,
        envelope,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
