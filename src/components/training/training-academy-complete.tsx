import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Play,
  CheckCircle,
  Lock,
  Download,
  Star,
  Users,
  TrendingUp
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_hours: number;
  objectives: string[];
  prerequisites: string[];
  thumbnail_url?: string;
  is_published: boolean;
  is_mandatory: boolean;
  instructor_name?: string;
  tags: string[];
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  content_type: 'video' | 'text' | 'quiz' | 'interactive' | 'document';
  content_url?: string;
  content_data: any;
  estimated_duration_minutes: number;
  is_required: boolean;
  passing_score: number;
}

interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
  score?: number;
  started_at?: string;
  completed_at?: string;
  time_spent_minutes: number;
}

interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed';
  overall_progress: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
}

interface Certification {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_date: string;
  expiry_date?: string;
  is_valid: boolean;
  validation_code: string;
  final_score: number;
  certificate_url?: string;
}

export const TrainingAcademyComplete: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchCertifications();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_valid', true);

      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please log in to enroll", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('course_enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          status: 'enrolled'
        }]);

      if (error) throw error;

      toast({ title: "Success", description: "Enrolled in course successfully" });
      fetchEnrollments();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({ title: "Error", description: "Failed to enroll in course", variant: "destructive" });
    }
  };

  const fetchCourseLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);

      // Fetch progress for these lessons
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (!progressError) {
          setUserProgress(progressData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const startLesson = async (lesson: Lesson) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentLesson(lesson);
      setIsLessonViewOpen(true);

      // Create or update progress
      const existingProgress = userProgress.find(p => p.lesson_id === lesson.id);
      if (!existingProgress) {
        const { error } = await supabase
          .from('user_progress')
          .insert([{
            user_id: user.id,
            course_id: lesson.course_id,
            lesson_id: lesson.id,
            status: 'in_progress',
            started_at: new Date().toISOString()
          }]);

        if (error) console.error('Error creating progress:', error);
      }
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const completeLesson = async (lessonId: string, score?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: currentLesson?.course_id,
          lesson_id: lessonId,
          status: 'completed',
          progress_percentage: 100,
          score: score || 100,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id,attempt_number'
        });

      if (error) throw error;

      toast({ title: "Success", description: "Lesson completed!" });
      setIsLessonViewOpen(false);
      fetchCourseLessons(currentLesson?.course_id || '');
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({ title: "Error", description: "Failed to complete lesson", variant: "destructive" });
    }
  };

  const getCourseProgress = (courseId: string): number => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.overall_progress || 0;
  };

  const isEnrolled = (courseId: string): boolean => {
    return enrollments.some(e => e.course_id === courseId);
  };

  const getCertificate = (courseId: string) => {
    return certifications.find(c => c.course_id === courseId);
  };

  const downloadCertificate = async (cert: Certification) => {
    // In a real implementation, this would generate a PDF certificate
    toast({ title: "Download", description: "Certificate download feature coming soon!" });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "advanced": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "expert": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "in_progress": return "default";
      case "enrolled": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <GraduationCap className="h-8 w-8" />
                Training Academy
              </CardTitle>
              <CardDescription>
                Complete courses, earn certifications, and track your learning progress
              </CardDescription>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{enrollments.filter(e => e.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{certifications.length}</div>
                <div className="text-sm text-muted-foreground">Certificates</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="my-learning">
                <TrendingUp className="h-4 w-4 mr-2" />
                My Learning
              </TabsTrigger>
              <TabsTrigger value="certificates">
                <Award className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-8">Loading courses...</div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses available at the moment.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => {
                    const enrolled = isEnrolled(course.id);
                    const progress = getCourseProgress(course.id);
                    const certificate = getCertificate(course.id);

                    return (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <div className="flex gap-2 mt-2">
                                <Badge className={getLevelColor(course.difficulty_level)}>
                                  {course.difficulty_level}
                                </Badge>
                                {course.is_mandatory && (
                                  <Badge variant="destructive">Mandatory</Badge>
                                )}
                                {certificate && (
                                  <Badge className="bg-green-500">
                                    <Award className="h-3 w-3 mr-1" />
                                    Certified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {course.duration_hours}h
                            </div>
                            {course.instructor_name && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {course.instructor_name}
                              </div>
                            )}
                          </div>
                          {enrolled && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} />
                            </div>
                          )}
                          <div className="mt-4">
                            {!enrolled ? (
                              <Button
                                className="w-full"
                                onClick={() => enrollInCourse(course.id)}
                              >
                                Enroll Now
                              </Button>
                            ) : progress === 100 ? (
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  fetchCourseLessons(course.id);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Review Course
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  fetchCourseLessons(course.id);
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continue Learning
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-learning" className="space-y-4 mt-6">
              {enrollments.filter(e => e.status !== 'completed').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't enrolled in any courses yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments
                    .filter(e => e.status !== 'completed')
                    .map((enrollment) => {
                      const course = courses.find(c => c.id === enrollment.course_id);
                      if (!course) return null;

                      return (
                        <Card key={enrollment.id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <Badge variant={getStatusColor(enrollment.status) as any}>
                                {enrollment.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Overall Progress</span>
                                  <span>{enrollment.overall_progress}%</span>
                                </div>
                                <Progress value={enrollment.overall_progress} />
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedCourse(course);
                                  fetchCourseLessons(course.id);
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continue
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="certificates" className="space-y-4 mt-6">
              {certifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't earned any certificates yet. Complete courses to earn certificates!
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {certifications.map((cert) => {
                    const course = courses.find(c => c.id === cert.course_id);
                    if (!course) return null;

                    return (
                      <Card key={cert.id} className="border-2 border-primary/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Award className="h-8 w-8 text-primary" />
                            <Badge className="bg-green-500">Valid</Badge>
                          </div>
                          <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Certificate #:</span>{' '}
                              {cert.certificate_number}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Issued:</span>{' '}
                              {new Date(cert.issued_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Score:</span>{' '}
                              {cert.final_score}%
                            </div>
                            {cert.expiry_date && (
                              <div>
                                <span className="text-muted-foreground">Expires:</span>{' '}
                                {new Date(cert.expiry_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => downloadCertificate(cert)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Lessons Dialog */}
      <Dialog open={!!selectedCourse && !isLessonViewOpen} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedCourse.description}</p>
              
              {selectedCourse.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Learning Objectives:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedCourse.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-4">Course Content:</h3>
                <div className="space-y-2">
                  {lessons.map((lesson) => {
                    const progress = userProgress.find(p => p.lesson_id === lesson.id);
                    const isCompleted = progress?.status === 'completed';

                    return (
                      <Card key={lesson.id} className={isCompleted ? "border-green-500/50" : ""}>
                        <CardHeader className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2" />
                              )}
                              <div>
                                <div className="font-medium">{lesson.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {lesson.estimated_duration_minutes} min • {lesson.content_type}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => startLesson(lesson)}
                              disabled={isCompleted}
                            >
                              {isCompleted ? "Completed" : "Start"}
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Viewer Dialog */}
      <Dialog open={isLessonViewOpen} onOpenChange={setIsLessonViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentLesson?.title}</DialogTitle>
          </DialogHeader>
          {currentLesson && (
            <div className="space-y-4">
              <Badge>{currentLesson.content_type}</Badge>
              <p className="text-muted-foreground">{currentLesson.description}</p>
              
              <div className="border rounded-lg p-6 bg-muted/50 min-h-[300px]">
                <p className="text-center text-muted-foreground">
                  Lesson content would be displayed here based on content_type:
                  {currentLesson.content_type}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsLessonViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => completeLesson(currentLesson.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
