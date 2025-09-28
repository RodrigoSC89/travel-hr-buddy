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
    const { crew_member_id, action, goal_data } = await req.json()

    if (!crew_member_id || !action) {
      throw new Error('Crew member ID and action are required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result = {}

    switch (action) {
      case 'create_goal':
        result = await createGoal(crew_member_id, goal_data, supabase)
        break
      case 'update_progress':
        result = await updateGoalProgress(goal_data.goal_id, goal_data.progress, supabase)
        break
      case 'get_goals':
        result = await getCrewGoals(crew_member_id, supabase)
        break
      case 'suggest_goals':
        result = await suggestPersonalizedGoals(crew_member_id, supabase)
        break
      case 'complete_goal':
        result = await completeGoal(goal_data.goal_id, supabase)
        break
      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in crew goal tracker:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function createGoal(crewMemberId: string, goalData: any, supabase: any) {
  const goal = {
    crew_member_id: crewMemberId,
    title: goalData.title,
    description: goalData.description,
    category: goalData.category, // 'certification', 'skill', 'career', 'safety'
    target_value: goalData.target_value || 100,
    current_progress: 0,
    unit: goalData.unit || 'percentage',
    priority: goalData.priority || 'medium',
    deadline: goalData.deadline,
    status: 'active',
    milestones: goalData.milestones || [],
    reward_points: calculateRewardPoints(goalData),
    created_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('crew_development_goals')
    .insert(goal)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating goal: ${error.message}`)
  }

  return {
    goal: data,
    message: 'Meta criada com sucesso!',
    estimated_completion: calculateEstimatedCompletion(goalData)
  }
}

async function updateGoalProgress(goalId: string, progress: number, supabase: any) {
  const { data: currentGoal, error: fetchError } = await supabase
    .from('crew_development_goals')
    .select('*')
    .eq('id', goalId)
    .single()

  if (fetchError || !currentGoal) {
    throw new Error('Goal not found')
  }

  const previousProgress = currentGoal.current_progress
  const newProgress = Math.min(progress, currentGoal.target_value)
  const isCompleted = newProgress >= currentGoal.target_value

  // Check for milestone achievements
  const milestonesAchieved = checkMilestoneAchievements(
    currentGoal.milestones || [],
    previousProgress,
    newProgress,
    currentGoal.target_value
  )

  const updateData: any = {
    current_progress: newProgress,
    last_updated: new Date().toISOString(),
    progress_history: [
      ...(currentGoal.progress_history || []),
      {
        date: new Date().toISOString(),
        progress: newProgress,
        note: 'Progress update'
      }
    ]
  }

  if (isCompleted) {
    updateData.status = 'completed'
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('crew_development_goals')
    .update(updateData)
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating goal: ${error.message}`)
  }

  // Award points for progress
  const progressPercentage = (newProgress / currentGoal.target_value) * 100
  const pointsAwarded = Math.floor(progressPercentage / 10) * 5 // 5 points per 10% progress

  return {
    goal: data,
    progress_update: {
      previous_progress: previousProgress,
      new_progress: newProgress,
      percentage: progressPercentage,
      is_completed: isCompleted
    },
    milestones_achieved: milestonesAchieved,
    points_awarded: pointsAwarded,
    message: isCompleted 
      ? `🎉 Parabéns! Você completou a meta "${currentGoal.title}"!`
      : `Progresso atualizado: ${progressPercentage.toFixed(1)}% completo`
  }
}

async function getCrewGoals(crewMemberId: string, supabase: any) {
  const { data: goals, error } = await supabase
    .from('crew_development_goals')
    .select('*')
    .eq('crew_member_id', crewMemberId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching goals: ${error.message}`)
  }

  // Calculate statistics
  const stats = {
    total_goals: goals.length,
    completed_goals: goals.filter((g: any) => g.status === 'completed').length,
    active_goals: goals.filter((g: any) => g.status === 'active').length,
    overdue_goals: goals.filter((g: any) => 
      g.status === 'active' && 
      g.deadline && 
      new Date(g.deadline) < new Date()
    ).length,
    total_points_earned: goals
      .filter((g: any) => g.status === 'completed')
      .reduce((sum: number, g: any) => sum + (g.reward_points || 0), 0),
    average_completion_time: calculateAverageCompletionTime(goals.filter((g: any) => g.status === 'completed'))
  }

  return {
    goals: goals,
    statistics: stats,
    recommendations: await generateGoalRecommendations(crewMemberId, goals, supabase)
  }
}

async function suggestPersonalizedGoals(crewMemberId: string, supabase: any) {
  // Fetch crew member data to analyze
  const { data: crewData, error: crewError } = await supabase
    .from('crew_members')
    .select(`
      *,
      crew_certifications (*),
      crew_embarkations (*),
      crew_performance_reviews (*)
    `)
    .eq('id', crewMemberId)
    .single()

  if (crewError || !crewData) {
    throw new Error('Crew member not found')
  }

  const suggestions = []

  // Certification suggestions
  const certifications = crewData.crew_certifications || []
  const expiringSoon = certifications.filter((c: any) => {
    const expiryDate = new Date(c.expiry_date)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    return expiryDate <= sixMonthsFromNow && c.status === 'valid'
  })

  if (expiringSoon.length > 0) {
    suggestions.push({
      title: 'Renovar Certificações',
      description: `Renovar ${expiringSoon.length} certificação(ões) que expiram em breve`,
      category: 'certification',
      priority: 'high',
      estimated_duration: '2-4 semanas',
      reward_points: 100,
      urgency: 'immediate'
    })
  }

  // Skill development suggestions
  const recentReviews = crewData.crew_performance_reviews?.slice(-3) || []
  if (recentReviews.length > 0) {
    const avgTechnical = recentReviews.reduce((sum: number, r: any) => sum + (r.technical_score || 0), 0) / recentReviews.length
    const avgLeadership = recentReviews.reduce((sum: number, r: any) => sum + (r.leadership_score || 0), 0) / recentReviews.length

    if (avgTechnical < 8.0) {
      suggestions.push({
        title: 'Melhorar Competências Técnicas',
        description: 'Elevar score técnico para 8.5+',
        category: 'skill',
        priority: 'medium',
        target_value: 8.5,
        current_value: avgTechnical,
        reward_points: 75
      })
    }

    if (avgLeadership < 7.5 && crewData.experience_years > 5) {
      suggestions.push({
        title: 'Desenvolver Liderança',
        description: 'Participar de curso de liderança marítima',
        category: 'leadership',
        priority: 'medium',
        estimated_duration: '6-8 semanas',
        reward_points: 80
      })
    }
  }

  // Career progression suggestions
  if (crewData.experience_years >= 5 && crewData.position?.toLowerCase().includes('officer')) {
    suggestions.push({
      title: 'Buscar Promoção',
      description: 'Preparar-se para posição de Chief Officer',
      category: 'career',
      priority: 'low',
      estimated_duration: '6-12 meses',
      reward_points: 200
    })
  }

  // Safety suggestions
  const safetyIncidents = recentReviews.some((r: any) => r.incidents && r.incidents.trim() !== '')
  if (safetyIncidents) {
    suggestions.push({
      title: 'Melhorar Segurança',
      description: 'Completar curso avançado de segurança',
      category: 'safety',
      priority: 'high',
      estimated_duration: '2-3 semanas',
      reward_points: 90
    })
  }

  return {
    personalized_suggestions: suggestions,
    analysis: {
      experience_level: crewData.experience_years >= 10 ? 'senior' : crewData.experience_years >= 5 ? 'intermediate' : 'junior',
      certification_status: calculateCertificationStatus(certifications),
      performance_trend: calculatePerformanceTrend(recentReviews),
      recommended_focus: determineRecommendedFocus(crewData, recentReviews)
    }
  }
}

async function completeGoal(goalId: string, supabase: any) {
  const { data, error } = await supabase
    .from('crew_development_goals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      current_progress: supabase.raw('target_value')
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error completing goal: ${error.message}`)
  }

  return {
    goal: data,
    points_awarded: data.reward_points || 0,
    message: `🎉 Meta "${data.title}" completada com sucesso!`,
    achievements_unlocked: await checkForAchievements(data.crew_member_id, supabase)
  }
}

function calculateRewardPoints(goalData: any): number {
  const basePoints = {
    certification: 100,
    skill: 75,
    career: 150,
    safety: 90,
    leadership: 80
  }

  const categoryPoints = basePoints[goalData.category as keyof typeof basePoints] || 50
  const priorityMultiplier = {
    low: 1.0,
    medium: 1.2,
    high: 1.5
  }

  return Math.floor(categoryPoints * (priorityMultiplier[goalData.priority as keyof typeof priorityMultiplier] || 1.0))
}

function calculateEstimatedCompletion(goalData: any): string {
  // Logic to estimate completion time based on goal type and complexity
  const estimates: { [key: string]: string } = {
    certification: '4-8 semanas',
    skill: '6-12 semanas',
    career: '6-18 meses',
    safety: '2-4 semanas',
    leadership: '8-16 semanas'
  }

  return estimates[goalData.category] || '4-8 semanas'
}

function checkMilestoneAchievements(milestones: any[], previousProgress: number, newProgress: number, targetValue: number) {
  const achieved = []
  
  for (const milestone of milestones) {
    const milestoneProgress = (milestone.percentage / 100) * targetValue
    if (previousProgress < milestoneProgress && newProgress >= milestoneProgress) {
      achieved.push({
        ...milestone,
        achieved_at: new Date().toISOString()
      })
    }
  }
  
  return achieved
}

function calculateAverageCompletionTime(completedGoals: any[]): number {
  if (completedGoals.length === 0) return 0
  
  const totalDays = completedGoals.reduce((sum, goal) => {
    const created = new Date(goal.created_at)
    const completed = new Date(goal.completed_at)
    return sum + Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)
  
  return Math.floor(totalDays / completedGoals.length)
}

async function generateGoalRecommendations(crewMemberId: string, existingGoals: any[], supabase: any) {
  // Generate smart recommendations based on current goals and progress
  const recommendations = []
  
  const activeGoals = existingGoals.filter(g => g.status === 'active')
  const completedGoals = existingGoals.filter(g => g.status === 'completed')
  
  if (activeGoals.length === 0) {
    recommendations.push('Crie uma nova meta para continuar seu desenvolvimento profissional')
  }
  
  if (completedGoals.length >= 5) {
    recommendations.push('Parabéns! Você já completou várias metas. Considere definir objetivos mais ambiciosos')
  }
  
  return recommendations
}

function calculateCertificationStatus(certifications: any[]): string {
  const valid = certifications.filter(c => c.status === 'valid').length
  const total = certifications.length
  
  if (total === 0) return 'needs_improvement'
  const percentage = (valid / total) * 100
  
  if (percentage >= 90) return 'excellent'
  if (percentage >= 70) return 'good'
  return 'needs_improvement'
}

function calculatePerformanceTrend(reviews: any[]): string {
  if (reviews.length < 2) return 'stable'
  
  const recent = reviews.slice(-2)
  const trend = recent[1].overall_score - recent[0].overall_score
  
  if (trend > 0.5) return 'improving'
  if (trend < -0.5) return 'declining'
  return 'stable'
}

function determineRecommendedFocus(crewData: any, reviews: any[]): string {
  // Logic to determine what the crew member should focus on
  if (reviews.length === 0) return 'performance'
  
  const latest = reviews[reviews.length - 1]
  const scores = {
    technical: latest.technical_score || 0,
    behavioral: latest.behavioral_score || 0,
    safety: latest.safety_score || 0,
    leadership: latest.leadership_score || 0
  }
  
  const lowest = Object.entries(scores).reduce((min, [key, value]) => 
    value < min.value ? { key, value } : min, 
    { key: 'technical', value: 10 }
  )
  
  return lowest.key
}

async function checkForAchievements(crewMemberId: string, supabase: any): Promise<any[]> {
  // Check if completing this goal unlocks any achievements
  return []
}