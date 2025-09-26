import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, type, route, data } = await req.json();

    switch (action) {
      case 'generate_predictions':
        return await generatePredictions(type, route);
      case 'create_price_alert':
        return await createPriceAlert(data);
      case 'get_recommendations':
        return await getRecommendations(data.userId);
      case 'store_price_data':
        return await storePriceData(data);
      case 'analyze_trends':
        return await analyzeTrends(type, route);
      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Travel predictive analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generatePredictions(type: string, route: string) {
  console.log(`Generating predictions for ${type}: ${route}`);
  
  try {
    // Buscar dados históricos
    let historicalData;
    if (type === 'flight') {
      const { data } = await supabase
        .from('flight_price_history')
        .select('*')
        .eq('route_code', route)
        .order('departure_date', { ascending: false })
        .limit(100);
      historicalData = data || [];
    } else {
      const { data } = await supabase
        .from('hotel_price_history')
        .select('*')
        .eq('city', route)
        .order('check_in_date', { ascending: false })
        .limit(100);
      historicalData = data || [];
    }

    // Análise preditiva com IA
    const predictions = await performAIPrediction(type, route, historicalData);
    
    // Salvar predições no banco
    const { error } = await supabase
      .from('travel_predictions')
      .upsert({
        type,
        route_or_destination: route,
        prediction_date: new Date().toISOString().split('T')[0],
        ...predictions
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: predictions,
        historical_count: historicalData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating predictions:', error);
    throw error;
  }
}

async function performAIPrediction(type: string, route: string, historicalData: any[]) {
  if (!openaiApiKey) {
    // Fallback para análise simples sem IA
    return generateSimplePrediction(historicalData);
  }

  try {
    const prompt = `
    Analise os dados históricos de preços de ${type === 'flight' ? 'passagens aéreas' : 'hotéis'} para a rota/destino "${route}".
    
    Dados históricos (últimos registros):
    ${JSON.stringify(historicalData.slice(0, 20), null, 2)}
    
    Forneça uma análise preditiva no formato JSON com:
    {
      "current_avg_price": número,
      "predicted_price": número,
      "price_trend": "rising|falling|stable",
      "confidence_score": número entre 0 e 1,
      "best_booking_window_start": "YYYY-MM-DD",
      "best_booking_window_end": "YYYY-MM-DD",
      "seasonal_factor": número,
      "demand_level": "low|medium|high|very_high",
      "recommendation": "texto explicativo"
    }
    
    Considere:
    - Sazonalidade (feriados, férias)
    - Tendências de preço
    - Demanda histórica
    - Fatores econômicos
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise preditiva de preços de viagens.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.3
      }),
    });

    const aiResponse = await response.json();
    const analysis = JSON.parse(aiResponse.choices[0].message.content);

    return analysis;
  } catch (error) {
    console.error('AI prediction error:', error);
    return generateSimplePrediction(historicalData);
  }
}

function generateSimplePrediction(historicalData: any[]) {
  if (historicalData.length === 0) {
    return {
      current_avg_price: 500,
      predicted_price: 520,
      price_trend: 'stable',
      confidence_score: 0.5,
      best_booking_window_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      best_booking_window_end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seasonal_factor: 1.0,
      demand_level: 'medium',
      recommendation: 'Dados históricos insuficientes. Recomendamos monitorar preços por alguns dias.'
    };
  }

  const prices = historicalData.map(item => item.price || item.price_per_night || item.total_price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  // Análise simples de tendência
  const recentPrices = prices.slice(0, 10);
  const olderPrices = prices.slice(10, 20);
  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.length > 0 ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length : recentAvg;
  
  let trend = 'stable';
  if (recentAvg > olderAvg * 1.05) trend = 'rising';
  else if (recentAvg < olderAvg * 0.95) trend = 'falling';

  const currentDate = new Date();
  const bestStart = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const bestEnd = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  return {
    current_avg_price: Math.round(avgPrice),
    predicted_price: Math.round(avgPrice * (trend === 'rising' ? 1.08 : trend === 'falling' ? 0.95 : 1.02)),
    price_trend: trend,
    confidence_score: Math.min(historicalData.length / 50, 0.9),
    best_booking_window_start: bestStart.toISOString().split('T')[0],
    best_booking_window_end: bestEnd.toISOString().split('T')[0],
    seasonal_factor: 1.0,
    demand_level: trend === 'rising' ? 'high' : trend === 'falling' ? 'low' : 'medium',
    recommendation: generateRecommendation(trend, avgPrice)
  };
}

function generateRecommendation(trend: string, avgPrice: number): string {
  switch (trend) {
    case 'rising':
      return `Preços com tendência de alta. Recomendamos reservar o quanto antes para economizar até R$ ${Math.round(avgPrice * 0.08)}.`;
    case 'falling':
      return `Preços em queda. Aguarde mais alguns dias para melhores ofertas, economia esperada de até R$ ${Math.round(avgPrice * 0.05)}.`;
    default:
      return `Preços estáveis. Boa janela para reservar nos próximos 7-14 dias com preços consistentes.`;
  }
}

async function createPriceAlert(data: any) {
  const { error } = await supabase
    .from('travel_price_alerts')
    .insert({
      user_id: data.userId,
      type: data.type,
      route_or_destination: data.route,
      target_price: data.targetPrice,
      current_price: data.currentPrice,
      alert_type: data.alertType,
      travel_date: data.travelDate,
      passengers_or_guests: data.passengers || 1,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: 'Alerta criado com sucesso' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRecommendations(userId: string) {
  // Buscar recomendações ativas do usuário
  const { data: recommendations, error } = await supabase
    .from('travel_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Se não há recomendações, gerar algumas baseadas em tendências
  if (!recommendations || recommendations.length === 0) {
    await generateUserRecommendations(userId);
    
    const { data: newRecommendations } = await supabase
      .from('travel_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    return new Response(
      JSON.stringify({ success: true, data: newRecommendations || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: recommendations }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateUserRecommendations(userId: string) {
  const baseRecommendations = [
    {
      user_id: userId,
      type: 'flight',
      title: 'Oportunidade de Economia - São Paulo → Rio',
      description: 'Preços 15% abaixo da média para voos GRU-SDU na próxima semana.',
      recommendation_type: 'savings_opportunity',
      priority: 'high',
      route_or_destination: 'GRU-SDU',
      estimated_savings: 80,
      action_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      user_id: userId,
      type: 'hotel',
      title: 'Melhor Período para Reservar - Rio de Janeiro',
      description: 'Hotéis no Rio com preços mais baixos entre 2-3 semanas antes da viagem.',
      recommendation_type: 'timing_advice',
      priority: 'medium',
      route_or_destination: 'Rio de Janeiro',
      estimated_savings: 120,
      action_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      user_id: userId,
      type: 'general',
      title: 'Alerta de Tendência - Feriado Prolongado',
      description: 'Preços tendem a subir 25% nas próximas 2 semanas devido ao feriado.',
      recommendation_type: 'trend_alert',
      priority: 'urgent',
      estimated_savings: 200,
      action_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  const { error } = await supabase
    .from('travel_recommendations')
    .insert(baseRecommendations);

  if (error) console.error('Error generating recommendations:', error);
}

async function storePriceData(data: any) {
  try {
    if (data.type === 'flight') {
      const { error } = await supabase
        .from('flight_price_history')
        .insert({
          route_code: data.routeCode,
          airline_code: data.airlineCode,
          flight_number: data.flightNumber,
          departure_date: data.departureDate,
          price: data.price,
          currency: data.currency || 'BRL',
          booking_class: data.bookingClass || 'economy',
          source: data.source || 'api',
          passenger_count: data.passengerCount || 1,
          metadata: data.metadata || {}
        });
      
      if (error) throw error;
    } else if (data.type === 'hotel') {
      const { error } = await supabase
        .from('hotel_price_history')
        .insert({
          hotel_id: data.hotelId,
          hotel_name: data.hotelName,
          city: data.city,
          country: data.country || 'BR',
          check_in_date: data.checkInDate,
          check_out_date: data.checkOutDate,
          price_per_night: data.pricePerNight,
          total_price: data.totalPrice,
          currency: data.currency || 'BRL',
          room_type: data.roomType,
          guest_count: data.guestCount || 2,
          source: data.source || 'api',
          rating: data.rating,
          metadata: data.metadata || {}
        });
      
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Dados de preço armazenados com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error storing price data:', error);
    throw error;
  }
}

async function analyzeTrends(type: string, route: string) {
  try {
    // Buscar tendências dos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let trendData;
    if (type === 'flight') {
      const { data } = await supabase
        .from('flight_price_history')
        .select('price, departure_date, captured_at')
        .eq('route_code', route)
        .gte('captured_at', thirtyDaysAgo)
        .order('captured_at', { ascending: true });
      trendData = data || [];
    } else {
      const { data } = await supabase
        .from('hotel_price_history')
        .select('price_per_night, check_in_date, captured_at')
        .eq('city', route)
        .gte('captured_at', thirtyDaysAgo)
        .order('captured_at', { ascending: true });
      trendData = (data || []).map(item => ({ 
        price: item.price_per_night, 
        check_in_date: item.check_in_date, 
        captured_at: item.captured_at 
      }));
    }

    const analysis = {
      total_samples: trendData.length,
      average_price: trendData.length > 0 ? trendData.reduce((acc: number, item: any) => acc + (item.price || 0), 0) / trendData.length : 0,
      min_price: trendData.length > 0 ? Math.min(...trendData.map((item: any) => item.price || 0)) : 0,
      max_price: trendData.length > 0 ? Math.max(...trendData.map((item: any) => item.price || 0)) : 0,
      price_volatility: calculateVolatility(trendData),
      trend_direction: calculateTrendDirection(trendData),
      best_day_to_book: findBestBookingDay(trendData),
      data_quality: trendData.length >= 10 ? 'good' : trendData.length >= 5 ? 'fair' : 'poor'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analysis,
        chart_data: trendData.slice(-14) // Últimos 14 pontos para gráfico
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw error;
  }
}

function calculateVolatility(data: any[]): number {
  if (data.length < 2) return 0;
  
  const prices = data.map(item => item.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
  
  return Math.sqrt(variance) / avg; // Coeficiente de variação
}

function calculateTrendDirection(data: any[]): string {
  if (data.length < 5) return 'insufficient_data';
  
  const recentPrices = data.slice(-5).map(item => item.price);
  const olderPrices = data.slice(-10, -5).map(item => item.price);
  
  if (olderPrices.length === 0) return 'insufficient_data';
  
  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;
  
  const changePercent = (recentAvg - olderAvg) / olderAvg;
  
  if (changePercent > 0.05) return 'rising';
  if (changePercent < -0.05) return 'falling';
  return 'stable';
}

function findBestBookingDay(data: any[]): string {
  if (data.length === 0) return 'insufficient_data';
  
  // Agrupar por dia da semana
  const dayGroups: { [key: string]: number[] } = {};
  
  data.forEach(item => {
    const date = new Date(item.captured_at);
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    
    if (!dayGroups[dayName]) dayGroups[dayName] = [];
    dayGroups[dayName].push(item.price);
  });
  
  // Encontrar dia com menor preço médio
  let bestDay = '';
  let lowestAvg = Infinity;
  
  Object.entries(dayGroups).forEach(([day, prices]) => {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      bestDay = day;
    }
  });
  
  return bestDay || 'insufficient_data';
}