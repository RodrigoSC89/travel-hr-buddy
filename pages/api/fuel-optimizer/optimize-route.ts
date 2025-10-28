// API endpoint for AI-powered fuel route optimization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const { vessel_id, limit = 10 } = req.query;

      let query = supabase
        .from('fuel_ai_route_optimization')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit as string));

      if (vessel_id) {
        query = query.eq('vessel_id', vessel_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching route optimizations:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ optimizations: data });
    }

    if (req.method === 'POST') {
      // Request route optimization
      const {
        vessel_id,
        origin_port,
        destination_port,
        distance_nm,
        cargo_weight_tons,
        departure_date,
        weather_data,
        created_by
      } = req.body;

      if (!vessel_id || !origin_port || !destination_port || !distance_nm) {
        return res.status(400).json({ 
          error: 'vessel_id, origin_port, destination_port, and distance_nm are required' 
        });
      }

      // Get vessel historical fuel consumption
      const { data: historicalData } = await supabase
        .from('fuel_consumption_logs')
        .select('quantity_consumed, distance_covered_nm, vessel_speed_knots')
        .eq('vessel_id', vessel_id)
        .order('log_date', { ascending: false })
        .limit(10);

      // Calculate baseline consumption (simplified - in production use ML model)
      let avgConsumptionRate = 2.5; // tons per 100 nm (default)
      if (historicalData && historicalData.length > 0) {
        const totalConsumption = historicalData.reduce((sum, log) => sum + log.quantity_consumed, 0);
        const totalDistance = historicalData.reduce((sum, log) => sum + (log.distance_covered_nm || 0), 0);
        if (totalDistance > 0) {
          avgConsumptionRate = (totalConsumption / totalDistance) * 100;
        }
      }

      const baselineConsumption = (distance_nm / 100) * avgConsumptionRate;
      
      // AI optimization (simplified - in production use actual ML model)
      const weatherOptimizationFactor = weather_data ? 0.92 : 0.95; // 5-8% savings
      const optimizedConsumption = baselineConsumption * weatherOptimizationFactor;
      const fuelSavings = baselineConsumption - optimizedConsumption;
      const savingsPercentage = (fuelSavings / baselineConsumption) * 100;

      // Calculate environmental impact
      const co2Reduction = fuelSavings * 3.15; // 1 ton fuel = ~3.15 tons CO2

      const { data: optimization, error: optimizationError } = await supabase
        .from('fuel_ai_route_optimization')
        .insert({
          vessel_id,
          origin_port,
          destination_port,
          distance_nm,
          cargo_weight_tons,
          departure_date,
          weather_data: weather_data || {},
          ai_model_version: 'v1.0',
          optimization_algorithm: 'weather_routing',
          optimized_waypoints: [],
          recommended_speed_knots: 12.5,
          baseline_fuel_consumption_mt: baselineConsumption,
          optimized_fuel_consumption_mt: optimizedConsumption,
          predicted_fuel_savings_mt: fuelSavings,
          predicted_fuel_savings_percentage: savingsPercentage,
          cost_savings_usd: fuelSavings * 650, // ~$650 per ton
          co2_reduction_tons: co2Reduction,
          confidence_score: weather_data ? 85 : 70,
          created_by
        })
        .select()
        .single();

      if (optimizationError) {
        console.error('Error creating optimization:', optimizationError);
        return res.status(500).json({ error: optimizationError.message });
      }

      return res.status(201).json({ optimization });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
