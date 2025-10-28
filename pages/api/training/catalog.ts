// API endpoint for training course catalog
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
      const { category, difficulty, published_only = 'true' } = req.query;

      // Use the view for aggregated course data
      let query = supabase
        .from('course_catalog_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }

      if (published_only === 'true') {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching course catalog:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ courses: data });
    }

    if (req.method === 'POST') {
      // Enroll user in a course
      const { user_id, course_id, enrollment_type = 'self' } = req.body;

      if (!user_id || !course_id) {
        return res.status(400).json({ error: 'user_id and course_id are required' });
      }

      // Get course details
      const { data: course } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', course_id)
        .single();

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Count lessons in course
      const { count: lessonCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', course_id);

      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert({
          user_id,
          course_id,
          enrollment_type,
          enrollment_status: 'active',
          total_lessons: lessonCount || 0,
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (enrollmentError) {
        if (enrollmentError.code === '23505') {
          return res.status(409).json({ error: 'User already enrolled in this course' });
        }
        console.error('Error creating enrollment:', enrollmentError);
        return res.status(500).json({ error: enrollmentError.message });
      }

      // Log enrollment activity
      await supabase
        .from('training_logs')
        .insert({
          user_id,
          activity_type: 'enrollment',
          course_id,
          description: `Enrolled in course: ${course.title}`
        });

      return res.status(201).json({ enrollment });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
