import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentRequest {
  fileName: string;
  fileType: string;
  fileContent: string; // base64 encoded
  fileSize: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, fileContent, fileSize }: DocumentRequest = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log(`Processing document: ${fileName} (${fileType})`);

    // Extract text content from the document
    let extractedText = '';
    
    try {
      // Decode base64 content
      const binaryString = atob(fileContent);
      
      // For text files, we can directly read the content
      if (fileType === 'text/plain' || fileType === 'text/csv') {
        extractedText = binaryString;
      } else {
        // For other file types, we'll use a simplified text extraction
        // In a production environment, you'd use specialized libraries
        extractedText = extractTextFromBinary(binaryString, fileType);
      }

      // Limit text size for processing
      if (extractedText.length > 10000) {
        extractedText = extractedText.substring(0, 10000) + '...';
      }

    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('Failed to extract text from document');
    }

    // Analyze document with OpenAI
    const systemPrompt = `Você é um especialista em análise de documentos. Analise o documento fornecido e retorne uma resposta em JSON com a seguinte estrutura:

{
  "summary": "Resumo claro e conciso do documento em português",
  "keyPoints": ["lista", "de", "pontos", "principais"],
  "entities": ["entidades", "pessoas", "empresas", "locais", "identificados"],
  "sentiment": "positive/negative/neutral",
  "category": "categoria do documento (ex: contrato, relatório, carta, etc)",
  "confidence": 0.95
}

Seja preciso e objetivo. Use português brasileiro.`;

    const userPrompt = `Analise este documento:

Nome do arquivo: ${fileName}
Tipo: ${fileType}
Tamanho: ${fileSize} bytes

Conteúdo:
${extractedText}

Forneça uma análise completa seguindo o formato JSON especificado.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let analysis;
    
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI analysis');
    }

    // Add original text to analysis
    analysis.originalText = extractedText.substring(0, 1000); // First 1000 chars for preview

    console.log('Document analyzed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      fileName,
      processedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTextFromBinary(binaryString: string, fileType: string): string {
  // This is a simplified text extraction
  // In production, you'd use proper libraries for PDF, DOC, etc.
  
  if (fileType === 'application/pdf') {
    // Simple PDF text extraction (very basic)
    // Look for text patterns in PDF
    const textPattern = /\(([^)]+)\)/g;
    const matches = binaryString.match(textPattern);
    if (matches) {
      return matches.map(match => match.slice(1, -1)).join(' ');
    }
  }
  
  if (fileType.includes('word')) {
    // Simple DOC/DOCX text extraction
    // Look for readable text patterns
    const readableText = binaryString.replace(/[^\x20-\x7E\u00C0-\u017F]/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
    return readableText.substring(0, 5000);
  }
  
  // For other types, try to extract readable characters
  const readableText = binaryString.replace(/[^\x20-\x7E\u00C0-\u017F]/g, ' ')
                                  .replace(/\s+/g, ' ')
                                  .trim();
  
  // If we got very little readable text, create a descriptive message
  if (readableText.length < 50) {
    return `Documento de tipo ${fileType} com ${binaryString.length} bytes. ` +
           `Conteúdo binário que requer processamento especializado para extração de texto completo.`;
  }
  
  return readableText.substring(0, 5000);
}