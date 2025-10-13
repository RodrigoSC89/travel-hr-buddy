/**
 * ✅ API Route: /api/send-restore-dashboard
 * Send restore dashboard report via email with PDF attachment
 * 
 * Note: This is a REFERENCE IMPLEMENTATION for Next.js 13+ App Router.
 * The current project uses Vite + React with Supabase Edge Functions.
 * 
 * Active implementation: supabase/functions/send-restore-dashboard/index.ts
 * 
 * To use this in a Next.js environment:
 * 1. Ensure Next.js 13+ is installed with App Router
 * 2. Install required packages: @supabase/supabase-js, jspdf, jspdf-autotable, resend
 * 3. Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;

    // Create Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch restore count data using RPC function
    const { data, error } = await supabase.rpc("get_restore_count_by_day_with_email", {
      email_input: email || null,
    });

    if (error) {
      console.error("Error fetching restore data:", error);
      return NextResponse.json(
        { error: "Failed to fetch restore data" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        status: "ok",
        message: "No restore data found",
        recipient: email,
        dataCount: 0
      });
    }

    // Generate PDF report
    const doc = new jsPDF();
    doc.text("Relatório de Restaurações", 14, 16);
    
    autoTable(doc, {
      head: [["Data", "Restaurações"]],
      body: data.map((d: { day: string; count: number }) => [
        new Date(d.day).toLocaleDateString("pt-BR"),
        d.count.toString(),
      ]),
      startY: 25,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }, // Indigo color
      styles: { fontSize: 10 },
    });

    // Get PDF as buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "dash@empresa.com",
      to: email,
      subject: "📊 Relatório Diário de Restaurações",
      text: "Segue em anexo o relatório diário do painel de restaurações.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">📊 Relatório de Restaurações</h1>
          <p>Olá,</p>
          <p>Segue em anexo o relatório diário do painel de restaurações.</p>
          <div style="background-color: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Total de registros:</strong> ${data.length} dias</p>
            <p><strong>Data de geração:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <p>O relatório em PDF está anexado a este email.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Este é um email automático. Por favor, não responda.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `relatorio-restauracoes-${new Date().toISOString().split("T")[0]}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    return NextResponse.json({ 
      status: "ok",
      message: "Relatório enviado por e-mail com sucesso!",
      recipient: email,
      dataCount: data.length
    });
  } catch (error) {
    console.error("Error in send-restore-dashboard:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "An error occurred while sending the report"
      },
      { status: 500 }
    );
  }
}
