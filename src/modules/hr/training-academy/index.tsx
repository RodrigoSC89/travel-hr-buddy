import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock, 
  Users,
  Play,
  CheckCircle,
  Download,
  Star
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  progress?: number;
  instructor_name: string;
  thumbnail_url?: string;
  is_enrolled?: boolean;
}

interface Certificate {
  id: string;
  course_title: string;
  certificate_number: string;
  issued_date: string;
  final_score: number;
  is_valid: boolean;
}

const TrainingAcademy: React.FC = () => {
  const [activeTab, setActiveTab] = useState("courses");

  // Mock data
  const courses: Course[] = [
    {
      id: "1",
      title: "Maritime Safety Fundamentals",
      description: "Essential safety procedures and protocols for maritime operations",
      category: "Safety",
      difficulty_level: "beginner",
      duration_hours: 8,
      progress: 60,
      instructor_name: "Capt. John Smith",
      is_enrolled: true
    },
    {
      id: "2",
      title: "Advanced Navigation Systems",
      description: "Master modern navigation equipment and techniques",
      category: "Navigation",
      difficulty_level: "advanced",
      duration_hours: 12,
      instructor_name: "Nav. Officer Maria Santos",
      is_enrolled: false
    },
    {
      id: "3",
      title: "Emergency Response Procedures",
      description: "Comprehensive emergency handling and crisis management",
      category: "Safety",
      difficulty_level: "intermediate",
      duration_hours: 10,
      progress: 100,
      instructor_name: "Chief Officer David Brown",
      is_enrolled: true
    }
  ];

  const certificates: Certificate[] = [
    {
      id: "1",
      course_title: "Maritime Safety Fundamentals",
      certificate_number: "CERT-2025-123456",
      issued_date: "2025-10-15",
      final_score: 92,
      is_valid: true
    },
    {
      id: "2",
      course_title: "Emergency Response Procedures",
      certificate_number: "CERT-2025-123457",
      issued_date: "2025-10-20",
      final_score: 88,
      is_valid: true
    }
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
    case "beginner": return "bg-green-500";
    case "intermediate": return "bg-yellow-500";
    case "advanced": return "bg-orange-500";
    case "expert": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Training Academy</h1>
            <p className="text-muted-foreground">Professional development and certification</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.is_enrolled).length}</div>
            <p className="text-xs text-muted-foreground">Active learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.progress === 100).length}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Total time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Course Catalog</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-2">{course.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge>{course.category}</Badge>
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.instructor_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                  {course.is_enrolled && course.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                  )}
                  <Button className="w-full" variant={course.is_enrolled ? "default" : "outline"}>
                    {course.is_enrolled ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-courses" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.filter(c => c.is_enrolled).map(course => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                  {course.progress === 100 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  ) : (
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <Card key={cert.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-lg">{cert.course_title}</CardTitle>
                      </div>
                      <CardDescription>Certificate #{cert.certificate_number}</CardDescription>
                    </div>
                    {cert.is_valid && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Valid
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Issued</div>
                      <div className="font-medium">{new Date(cert.issued_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Score</div>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {cert.final_score}%
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingAcademy;
