/**
 * PATCH 91.0 - Document Hub AI Service
 * AI-powered document analysis using runAIContext
 */

import { runAIContext } from '@/ai/kernel';
import { logger } from '@/lib/logger';
import { AIAnalysisResult } from '../types';

/**
 * Analyze a document using AI
 * Extracts summary, topics, and validity information
 */
export async function analyzeDocument(
  documentText: string,
  fileName: string
): Promise<AIAnalysisResult> {
  try {
    const response = await runAIContext({
      module: 'document-ai',
      action: 'analyze',
      context: {
        documentText,
        fileName,
        tasks: [
          'Extract summary',
          'Identify main topics',
          'Check validity (CNPJ, expiry dates, terms)',
          'Extract key information',
        ],
      },
    });

    // Parse AI response
    const message = response.message || '';
    
    // Extract structured information from AI response
    const summary = extractSummary(message);
    const topics = extractTopics(message);
    const validityStatus = extractValidityStatus(message);
    const keyInfo = extractKeyInfo(message);

    return {
      summary,
      topics,
      validity_status: validityStatus,
      key_info: keyInfo,
      confidence: response.confidence || 0,
    };
  } catch (error) {
    logger.error('AI document analysis error:', error);
    
    // Return fallback analysis
    return {
      summary: 'Documento carregado com sucesso. Análise automática não disponível.',
      topics: ['Documento'],
      confidence: 0,
    };
  }
}

/**
 * Extract summary from AI response
 */
function extractSummary(message: string): string {
  const summaryMatch = message.match(/summ?ário[:\s]+(.*?)(?=\n\n|tópicos|validade|$)/is);
  if (summaryMatch && summaryMatch[1]) {
    return summaryMatch[1].trim();
  }
  
  // Fallback: use first 200 characters
  return message.substring(0, 200).trim() || 'Documento processado com sucesso.';
}

/**
 * Extract topics from AI response
 */
function extractTopics(message: string): string[] {
  const topicsMatch = message.match(/tópicos[:\s]+(.*?)(?=\n\n|validade|$)/is);
  if (topicsMatch && topicsMatch[1]) {
    const topicsText = topicsMatch[1];
    return topicsText
      .split(/[,;\n]/)
      .map(t => t.trim())
      .filter(t => t && t.length > 2 && t.length < 50)
      .slice(0, 5);
  }
  
  return ['Documento'];
}

/**
 * Extract validity status from AI response
 */
function extractValidityStatus(message: string): 'valid' | 'expired' | 'expiring_soon' | 'invalid' {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expirado') || lowerMessage.includes('vencido')) {
    return 'expired';
  }
  
  if (lowerMessage.includes('expira em breve') || lowerMessage.includes('próximo do vencimento')) {
    return 'expiring_soon';
  }
  
  if (lowerMessage.includes('inválido')) {
    return 'invalid';
  }
  
  return 'valid';
}

/**
 * Extract key information from AI response
 */
function extractKeyInfo(message: string): Record<string, any> {
  const keyInfo: Record<string, any> = {};
  
  // Extract CNPJ
  const cnpjMatch = message.match(/cnpj[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i);
  if (cnpjMatch) {
    keyInfo.cnpj = cnpjMatch[1];
  }
  
  // Extract expiry date
  const expiryMatch = message.match(/(?:vencimento|validade)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i);
  if (expiryMatch) {
    keyInfo.expiry_date = expiryMatch[1];
  }
  
  // Extract document type
  const typeMatch = message.match(/tipo[:\s]*([^\n,;]{5,30})/i);
  if (typeMatch) {
    keyInfo.document_type = typeMatch[1].trim();
  }
  
  return keyInfo;
}

/**
 * Read text from PDF file (simplified)
 * In production, you would use a proper PDF parser library
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For now, return a placeholder
    // In a real implementation, use pdf.js or similar
    return `Texto extraído do arquivo: ${file.name}\nTamanho: ${file.size} bytes\nTipo: ${file.type}`;
  } catch (error) {
    logger.error('PDF text extraction error:', error);
    return '';
  }
}

/**
 * Read text from DOCX file (simplified)
 * In production, you would use a proper DOCX parser library
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    // For now, return a placeholder
    // In a real implementation, use mammoth.js or similar
    return `Texto extraído do arquivo: ${file.name}\nTamanho: ${file.size} bytes\nTipo: ${file.type}`;
  } catch (error) {
    logger.error('DOCX text extraction error:', error);
    return '';
  }
}
