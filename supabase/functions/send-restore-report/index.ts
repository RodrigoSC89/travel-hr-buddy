import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, toEmail = "admin@empresa.com" } = await req.json();

    if (!imageBase64) {
      throw new Error("Imagem não recebida.");
    }

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    if (!SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    // Remove data URL prefix if present
    const base64Content = imageBase64.replace(/^data:image\/png;base64,/, "");

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: toEmail }],
          subject: "📊 Restore Chart Report - Nautilus One",
        },
      ],
      from: {
        email: "noreply@nautilusone.com",
        name: "Nautilus One",
      },
      content: [
        {
          type: "text/plain",
          value: "Segue em anexo o gráfico atualizado de restaurações.",
        },
      ],
      attachments: [
        {
          content: base64Content,
          filename: "restore-chart.png",
          type: "image/png",
          disposition: "attachment",
        },
      ],
    };

    console.log("Sending email to:", toEmail);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", errorText);
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log("Email enviado com sucesso para:", toEmail);

    return new Response(
      JSON.stringify({
        message: "Email enviado com sucesso.",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao enviar email:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro ao enviar e-mail.",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
