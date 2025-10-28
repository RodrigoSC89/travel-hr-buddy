// API endpoint for training progress tracking
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const { user_id, course_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          courses!inner(id, title, category, estimated_duration_hours)
        `)
        .eq('user_id', user_id)
        .order('enrollment_date', { ascending: false });

      if (course_id) {
        query = query.eq('course_id', course_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching progress:', error);
        return res.status(500).json({ error: error.message });
      }

      // Get user progress details for each enrollment
      const progressWithDetails = await Promise.all(
        (data || []).map(async (enrollment: any) => {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user_id)
            .eq('course_id', enrollment.course_id);

          return {
            ...enrollment,
            progress_details: progress || []
          };
        })
      );

      return res.status(200).json({ enrollments: progressWithDetails });
    }

    if (req.method === 'POST') {
      // Update lesson progress
      const {
        user_id,
        course_id,
        lesson_id,
        status,
        score,
        time_spent_minutes
      } = req.body;

      if (!user_id || !course_id || !lesson_id || !status) {
        return res.status(400).json({ 
          error: 'user_id, course_id, lesson_id, and status are required' 
        });
      }

      // Update or create user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id,
          course_id,
          lesson_id,
          status,
          score,
          time_spent_minutes: time_spent_minutes || 0,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (progressError) {
        console.error('Error updating progress:', progressError);
        return res.status(500).json({ error: progressError.message });
      }

      // Update enrollment progress
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user_id)
        .eq('course_id', course_id)
        .single();

      if (enrollment) {
        const { data: completedLessons, count } = await supabase
          .from('user_progress')
          .select('id', { count: 'exact' })
          .eq('user_id', user_id)
          .eq('course_id', course_id)
          .eq('status', 'completed');

        const progressPercentage = enrollment.total_lessons > 0
          ? (count || 0) / enrollment.total_lessons * 100
          : 0;

        await supabase
          .from('course_enrollments')
          .update({
            lessons_completed: count || 0,
            overall_progress_percentage: progressPercentage,
            last_accessed_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('course_id', course_id);
      }

      // Log activity
      await supabase
        .from('training_logs')
        .insert({
          user_id,
          activity_type: status === 'completed' ? 'lesson_complete' : 'progress_update',
          course_id,
          lesson_id,
          description: `Lesson ${status}`
        });

      return res.status(200).json({ progress });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
