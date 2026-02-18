import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email_subject, email_from, email_body, organization_id } = await req.json();

    if (!email_body) {
      return new Response(JSON.stringify({ error: "email_body is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NLP extraction patterns for fixture emails
    const extractedData: Record<string, unknown> = {};

    // Vessel name patterns
    const vesselMatch = email_body.match(/(?:MV|MT|M\/V|M\/T)\s+["']?([A-Z][A-Z\s]+?)["']?(?:\s|,|\.|$)/i);
    if (vesselMatch) extractedData.vessel_name = vesselMatch[1].trim();

    // Cargo type and quantity
    const cargoMatch = email_body.match(/(\d[\d,.]+)\s*(?:MT|MTS|TONS?)\s+(?:OF\s+)?([A-Za-z\s]+?)(?:\s+IN\s|\s+FROM|\s*,)/i);
    if (cargoMatch) {
      extractedData.cargo_quantity = parseFloat(cargoMatch[1].replace(/,/g, ""));
      extractedData.cargo_type = cargoMatch[2].trim();
    }

    // Ports
    const loadMatch = email_body.match(/(?:LOAD(?:ING)?|FROM)\s*(?:PORT)?[:\s]+([A-Za-z\s,]+?)(?:\s+TO\s|\s+DISCH|\s*[-/])/i);
    if (loadMatch) extractedData.load_port = loadMatch[1].trim();

    const dischMatch = email_body.match(/(?:DISCH(?:ARGE)?|TO)\s*(?:PORT)?[:\s]+([A-Za-z\s,]+?)(?:\s|,|\.|$)/i);
    if (dischMatch) extractedData.discharge_port = dischMatch[1].trim();

    // Freight rate
    const rateMatch = email_body.match(/(?:FREIGHT|RATE|FRT)[:\s]*(?:USD?\s*)?(\d[\d,.]+)\s*(?:\/\s*MT|PMT|PER\s*MT|LUMPSUM|\/DAY)?/i);
    if (rateMatch) extractedData.freight_rate = parseFloat(rateMatch[1].replace(/,/g, ""));

    // Laycan dates
    const laycanMatch = email_body.match(/(?:LAYCAN|L\/C|LAY\/CAN)[:\s]*(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)\s*[-/]\s*(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)/i);
    if (laycanMatch) {
      extractedData.laycan_start = laycanMatch[1];
      extractedData.laycan_end = laycanMatch[2];
    }

    // Demurrage
    const demurrageMatch = email_body.match(/(?:DEMURRAGE|DEM)[:\s]*(?:USD?\s*)?(\d[\d,.]+)\s*(?:\/\s*DAY|PDPR|PER\s*DAY)/i);
    if (demurrageMatch) extractedData.demurrage_rate = parseFloat(demurrageMatch[1].replace(/,/g, ""));

    // Laytime
    const laytimeMatch = email_body.match(/(?:LAYTIME|LT)[:\s]*(\d+)\s*(?:HOURS|HRS|SHINC|SHEX)/i);
    if (laytimeMatch) extractedData.laytime_hours = parseInt(laytimeMatch[1]);

    // Commission
    const commMatch = email_body.match(/(?:COMM(?:ISSION)?|BROKERAGE)[:\s]*(\d+\.?\d*)\s*%/i);
    if (commMatch) extractedData.commission_pct = parseFloat(commMatch[1]);

    // Calculate confidence based on fields extracted
    const totalFields = 8;
    const extractedFields = Object.keys(extractedData).length;
    const confidence = Math.round((extractedFields / totalFields) * 100);

    // Save extraction
    const { data: extraction, error: insertErr } = await supabase
      .from("chartering_email_extractions")
      .insert({
        organization_id,
        email_subject,
        email_from,
        email_received_at: new Date().toISOString(),
        raw_content: email_body.substring(0, 10000),
        extracted_data: extractedData,
        confidence_score: confidence,
        status: confidence >= 50 ? "processed" : "pending",
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({
        success: true,
        extraction_id: extraction.id,
        extracted_data: extractedData,
        confidence_score: confidence,
        fields_found: extractedFields,
        message: `Extracted ${extractedFields}/${totalFields} fields with ${confidence}% confidence`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
