import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY;

const AUDIT_TYPES = ['Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vessel_id, audit_type } = req.body;

    if (!vessel_id || !audit_type) {
      return res.status(400).json({ error: 'vessel_id and audit_type are required' });
    }

    if (!AUDIT_TYPES.includes(audit_type)) {
      return res.status(400).json({ error: `Invalid audit_type. Must be one of: ${AUDIT_TYPES.join(', ')}` });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get vessel details
    const { data: vessel } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', vessel_id)
      .single();

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    // Get 6 months of compliance data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [incidents, certificates, trainingRecords, sgsoRecords] = await Promise.all([
      supabase
        .from('safety_incidents')
        .select('*')
        .eq('vessel_id', vessel_id)
        .gte('incident_date', sixMonthsAgo.toISOString()),
      supabase
        .from('certificates')
        .select('*')
        .eq('vessel_id', vessel_id),
      supabase
        .from('crew_training_records')
        .select('*')
        .eq('vessel_id', vessel_id)
        .gte('training_date', sixMonthsAgo.toISOString()),
      supabase
        .from('sgso_practices')
        .select('*')
        .eq('vessel_id', vessel_id)
        .gte('date', sixMonthsAgo.toISOString())
    ]);

    const complianceData = {
      vessel_name: vessel.name,
      incidents: incidents.data || [],
      certificates: certificates.data || [],
      training_records: trainingRecords.data || [],
      sgso_records: sgsoRecords.data || []
    };

    let prediction: any = null;

    // Try AI analysis with OpenAI
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const prompt = `Analyze the following 6 months of compliance data for vessel "${vessel.name}" and predict the outcome of a ${audit_type} audit.

Compliance Data:
- Safety Incidents: ${incidents.data?.length || 0} (last 6 months)
- Certificates: ${certificates.data?.length || 0} total, ${certificates.data?.filter((c: any) => new Date(c.expiry_date) > new Date()).length || 0} valid
- Training Records: ${trainingRecords.data?.length || 0} (last 6 months)
- SGSO Records: ${sgsoRecords.data?.length || 0} (last 6 months)

Generate a JSON prediction with this structure:
{
  "expected_score": 0-100,
  "probability": "Alta|Média|Baixa",
  "confidence_level": 0.00-1.00,
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "compliance_areas": {
    "Documentation": 0-100,
    "Training": 0-100,
    "Safety": 0-100,
    "Equipment": 0-100,
    "Procedures": 0-100
  }
}

Base your analysis on ${audit_type} audit standards.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2000
        });

        const content = completion.choices[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          prediction = JSON.parse(jsonMatch[0]);
        }
      } catch (aiError) {
        console.error('AI analysis failed, using fallback:', aiError);
      }
    }

    // Fallback: rule-based prediction
    if (!prediction) {
      const incidentCount = incidents.data?.length || 0;
      const validCerts = certificates.data?.filter((c: any) => new Date(c.expiry_date) > new Date()).length || 0;
      const totalCerts = certificates.data?.length || 1;
      const trainingCount = trainingRecords.data?.length || 0;
      const sgsoCompliance = sgsoRecords.data?.filter((s: any) => s.compliance_level === 'high').length || 0;
      const totalSgso = sgsoRecords.data?.length || 1;

      const certScore = Math.round((validCerts / totalCerts) * 100);
      const incidentPenalty = Math.min(30, incidentCount * 5);
      const trainingBonus = Math.min(20, trainingCount * 2);
      const sgsoScore = Math.round((sgsoCompliance / totalSgso) * 100);

      let baseScore = 70;
      baseScore = baseScore + trainingBonus - incidentPenalty;
      baseScore = Math.round((baseScore + certScore + sgsoScore) / 3);
      baseScore = Math.max(0, Math.min(100, baseScore));

      const probability = baseScore >= 80 ? 'Alta' : baseScore >= 60 ? 'Média' : 'Baixa';
      const confidenceLevel = 0.75;

      const weaknesses = [];
      const recommendations = [];

      if (incidentCount > 3) {
        weaknesses.push(`High incident rate: ${incidentCount} incidents in 6 months`);
        recommendations.push('Implement enhanced safety protocols and training');
      }
      if (certScore < 90) {
        weaknesses.push(`Certificate compliance at ${certScore}%`);
        recommendations.push('Renew expiring certificates and maintain documentation');
      }
      if (trainingCount < 10) {
        weaknesses.push('Limited training records');
        recommendations.push('Increase crew training frequency and documentation');
      }
      if (sgsoScore < 70) {
        weaknesses.push(`SGSO compliance at ${sgsoScore}%`);
        recommendations.push('Improve SGSO practice compliance and documentation');
      }

      if (weaknesses.length === 0) {
        weaknesses.push('No major weaknesses identified');
        recommendations.push('Maintain current standards and continue monitoring');
      }

      prediction = {
        expected_score: baseScore,
        probability,
        confidence_level: confidenceLevel,
        weaknesses,
        recommendations,
        compliance_areas: {
          Documentation: certScore,
          Training: Math.min(100, trainingCount * 8),
          Safety: Math.max(0, 100 - incidentCount * 10),
          Equipment: certScore,
          Procedures: sgsoScore
        }
      };
    }

    // Store prediction in database
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30);

    const { data: insertedPrediction, error: insertError } = await supabase
      .from('audit_predictions')
      .insert({
        vessel_id,
        audit_type,
        expected_score: prediction.expected_score,
        probability: prediction.probability,
        confidence_level: prediction.confidence_level,
        weaknesses: prediction.weaknesses,
        recommendations: prediction.recommendations,
        compliance_areas: prediction.compliance_areas,
        predicted_date: now.toISOString(),
        valid_until: validUntil.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting prediction:', insertError);
      return res.status(500).json({ error: 'Failed to store prediction' });
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${audit_type} audit prediction for vessel ${vessel.name}`,
      prediction: insertedPrediction
    });
  } catch (error: any) {
    console.error('Error in score-predict:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
