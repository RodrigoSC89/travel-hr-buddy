import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LayoutDashboard, BookOpen, Users, Award, Brain } from "lucide-react";
import AcademyDashboard from "./components/AcademyDashboard";

export default function NautilusAcademy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Nautilus Academy
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestão inteligente de treinamentos e certificações marítimas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripulação</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certificações</span>
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AcademyDashboard />
          </TabsContent>

          <TabsContent value="courses">
            <div className="text-center py-12 text-muted-foreground">
              Catálogo de cursos - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="text-center py-12 text-muted-foreground">
              Gestão de tripulação - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="text-center py-12 text-muted-foreground">
              Controle de certificações - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="ai-generator">
            <div className="text-center py-12 text-muted-foreground">
              Gerador de cursos com IA - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
