import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { crew_member_id, action_type, data } = await req.json()

    if (!crew_member_id || !action_type) {
      throw new Error('Crew member ID and action type are required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current crew member data
    const { data: crewMember, error: crewError } = await supabase
      .from('crew_members')
      .select('*, crew_certifications(*), crew_embarkations(*), crew_performance_reviews(*)')
      .eq('id', crew_member_id)
      .single()

    if (crewError || !crewMember) {
      throw new Error('Crew member not found')
    }

    // Calculate experience and achievements
    const achievementData = await calculateAchievements(crewMember, supabase)
    const skillProgression = await calculateSkillProgression(crewMember)
    const badges = await calculateBadges(crewMember)
    const levelData = await calculateLevel(crewMember)

    // Process specific action
    let actionResult = {}
    switch (action_type) {
      case 'complete_certification':
        actionResult = await processCertificationCompletion(crew_member_id, data, supabase)
        break
      case 'complete_embarkation':
        actionResult = await processEmbarkationCompletion(crew_member_id, data, supabase)
        break
      case 'performance_review':
        actionResult = await processPerformanceReview(crew_member_id, data, supabase)
        break
      case 'get_profile':
        actionResult = await getGamificationProfile(crew_member_id, supabase)
        break
      default:
        actionResult = { message: 'Unknown action type' }
    }

    // Update or create gamification profile
    const gamificationProfile = {
      crew_member_id,
      total_experience_points: levelData.experience_points,
      current_level: levelData.level,
      badges_earned: badges,
      achievements: achievementData,
      skill_progression: skillProgression,
      last_activity: new Date().toISOString(),
      streaks: await calculateStreaks(crewMember),
      leaderboard_rank: await calculateLeaderboardRank(crew_member_id, supabase)
    }

    const { data: profileData, error: profileError } = await supabase
      .from('crew_gamification_profiles')
      .upsert(gamificationProfile, { onConflict: 'crew_member_id' })
      .select()
      .single()

    if (profileError) {
      console.error('Error updating gamification profile:', profileError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: gamificationProfile,
        action_result: actionResult,
        new_achievements: achievementData.filter((a: any) => a.unlocked_recently),
        level_up: levelData.level_up || false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in crew gamification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function calculateAchievements(crewMember: any, supabase: any) {
  const achievements = []

  // Certification achievements
  const validCerts = crewMember.crew_certifications?.filter((c: any) => c.status === 'valid') || []
  if (validCerts.length >= 5) {
    achievements.push({
      id: 'cert_collector',
      name: 'Colecionador de Certificados',
      description: 'Possua 5 ou mais certificações válidas',
      icon: '🏆',
      unlocked: true,
      unlocked_date: new Date().toISOString()
    })
  }

  // Experience achievements
  if (crewMember.experience_years >= 10) {
    achievements.push({
      id: 'veteran',
      name: 'Veterano dos Mares',
      description: '10 anos de experiência marítima',
      icon: '⚓',
      unlocked: true,
      unlocked_date: new Date().toISOString()
    })
  }

  // Embarkation achievements
  const embarkations = crewMember.crew_embarkations || []
  if (embarkations.length >= 20) {
    achievements.push({
      id: 'frequent_sailor',
      name: 'Navegador Frequente',
      description: '20 embarques completados',
      icon: '🚢',
      unlocked: true,
      unlocked_date: new Date().toISOString()
    })
  }

  // Performance achievements
  const recentReviews = crewMember.crew_performance_reviews?.filter(
    (r: any) => new Date(r.review_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  ) || []
  
  const avgScore = recentReviews.length > 0 
    ? recentReviews.reduce((sum: number, r: any) => sum + r.overall_score, 0) / recentReviews.length
    : 0

  if (avgScore >= 9.0) {
    achievements.push({
      id: 'excellence',
      name: 'Excelência Operacional',
      description: 'Média de 9.0+ em avaliações do último ano',
      icon: '⭐',
      unlocked: true,
      unlocked_date: new Date().toISOString()
    })
  }

  return achievements
}

async function calculateSkillProgression(crewMember: any) {
  const skills = {
    technical: 0,
    leadership: 0,
    safety: 0,
    communication: 0,
    navigation: 0
  }

  // Calculate skills based on performance reviews
  const reviews = crewMember.crew_performance_reviews || []
  if (reviews.length > 0) {
    skills.technical = reviews.reduce((sum: number, r: any) => sum + (r.technical_score || 0), 0) / reviews.length
    skills.safety = reviews.reduce((sum: number, r: any) => sum + (r.safety_score || 0), 0) / reviews.length
    skills.leadership = reviews.reduce((sum: number, r: any) => sum + (r.leadership_score || 0), 0) / reviews.length
  }

  // Adjust based on certifications
  const certCount = crewMember.crew_certifications?.length || 0
  skills.technical += Math.min(certCount * 0.5, 2.0)

  return skills
}

async function calculateBadges(crewMember: any) {
  const badges = []

  // Safety badge
  const hasBasicSafety = crewMember.crew_certifications?.some(
    (c: any) => c.certification_type.toLowerCase().includes('safety')
  )
  if (hasBasicSafety) {
    badges.push({
      id: 'safety_certified',
      name: 'Certificado em Segurança',
      icon: '🛡️',
      earned_date: new Date().toISOString()
    })
  }

  // Leadership badge
  if (crewMember.position?.toLowerCase().includes('captain') || 
      crewMember.position?.toLowerCase().includes('chief')) {
    badges.push({
      id: 'leadership',
      name: 'Liderança',
      icon: '👨‍✈️',
      earned_date: new Date().toISOString()
    })
  }

  // International badge
  const countries = new Set(
    crewMember.crew_embarkations?.map((e: any) => e.embark_location?.split(',').pop()?.trim()) || []
  )
  if (countries.size >= 5) {
    badges.push({
      id: 'international',
      name: 'Navegador Internacional',
      icon: '🌍',
      earned_date: new Date().toISOString()
    })
  }

  return badges
}

async function calculateLevel(crewMember: any) {
  let experiencePoints = 0

  // Points from years of experience
  experiencePoints += (crewMember.experience_years || 0) * 100

  // Points from certifications
  experiencePoints += (crewMember.crew_certifications?.length || 0) * 50

  // Points from embarkations
  experiencePoints += (crewMember.crew_embarkations?.length || 0) * 25

  // Points from performance reviews
  const reviews = crewMember.crew_performance_reviews || []
  const totalReviewScore = reviews.reduce((sum: number, r: any) => sum + (r.overall_score || 0), 0)
  experiencePoints += totalReviewScore * 10

  // Calculate level (every 500 points = 1 level)
  const level = Math.floor(experiencePoints / 500) + 1

  return {
    experience_points: experiencePoints,
    level: level,
    points_to_next_level: 500 - (experiencePoints % 500),
    level_up: false // Would be true if level just increased
  }
}

async function calculateStreaks(crewMember: any) {
  // Calculate various streaks (consecutive achievements, etc.)
  return {
    certification_streak: 0,
    performance_streak: 0,
    safety_streak: 0
  }
}

async function calculateLeaderboardRank(crewMemberId: string, supabase: any) {
  // This would calculate the crew member's rank among all crew members
  // For now, return a placeholder
  return Math.floor(Math.random() * 100) + 1
}

async function processCertificationCompletion(crewMemberId: string, data: any, supabase: any) {
  // Award points for certification completion
  return {
    points_awarded: 50,
    message: 'Parabéns! Você ganhou 50 pontos por completar uma certificação!',
    badge_earned: data.certification_type === 'safety' ? 'safety_specialist' : null
  }
}

async function processEmbarkationCompletion(crewMemberId: string, data: any, supabase: any) {
  return {
    points_awarded: 25,
    message: 'Embarque concluído com sucesso! +25 pontos de experiência.',
    streak_bonus: data.consecutive_embarkations >= 5 ? 25 : 0
  }
}

async function processPerformanceReview(crewMemberId: string, data: any, supabase: any) {
  const bonus = data.overall_score >= 9.0 ? 50 : data.overall_score >= 8.0 ? 25 : 10
  return {
    points_awarded: bonus,
    message: `Avaliação de performance concluída! +${bonus} pontos.`,
    excellence_badge: data.overall_score >= 9.5
  }
}

async function getGamificationProfile(crewMemberId: string, supabase: any) {
  const { data, error } = await supabase
    .from('crew_gamification_profiles')
    .select('*')
    .eq('crew_member_id', crewMemberId)
    .single()

  if (error) {
    return { message: 'Profile not found', create_new: true }
  }

  return { profile: data }
}