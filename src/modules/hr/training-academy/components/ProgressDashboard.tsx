// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ProgressDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalCertificates: 0,
    averageScore: 0,
    progressData: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProgressStats();
  }, []);

  const loadProgressStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get enrolled courses
      const { data: progress } = await supabase
        .from('academy_progress')
        .select('course_id, is_completed, score, updated_at')
        .eq('user_id', user.id);

      const uniqueCourses = new Set(progress?.map(p => p.course_id) || []);
      const completedCourses = progress?.filter(p => p.is_completed) || [];
      const scores = progress?.map(p => p.score).filter(Boolean) || [];
      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      // Get certificates
      const { data: certificates } = await supabase
        .from('academy_certificates')
        .select('id')
        .eq('user_id', user.id);

      // Create progress chart data
      const progressData = progress
        ?.slice(0, 10)
        .map((p, idx) => ({
          name: `Lesson ${idx + 1}`,
          score: p.score || 0,
        })) || [];

      setStats({
        totalCourses: uniqueCourses.size,
        completedCourses: new Set(completedCourses.map(p => p.course_id)).size,
        totalCertificates: certificates?.length || 0,
        averageScore: Math.round(avgScore),
        progressData,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading progress',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = stats.totalCourses > 0
    ? Math.round((stats.completedCourses / stats.totalCourses) * 100)
    : 0;

  if (isLoading) {
    return <div className="text-center py-8">Loading progress...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats.completedCourses} completed
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <Badge variant="default" className="mt-2">
              {stats.averageScore >= 80 ? 'Excellent' : stats.averageScore >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep learning to earn more!
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.progressData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
