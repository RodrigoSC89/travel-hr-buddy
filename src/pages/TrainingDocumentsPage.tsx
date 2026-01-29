/**
 * Training Documents Page
 * Upload and manage training materials, certificates, attendance forms
 */

import React from "react";
import { TrainingDocumentUpload } from "@/components/training/training-document-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, Award, ClipboardList, Upload } from "lucide-react";

export default function TrainingDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos de Treinamento</h1>
          <p className="text-muted-foreground">
            Upload de materiais de treinamento, certificados, formulários de presença e avaliações
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Materiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Apostilas e manuais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Emitidos este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-orange-500" />
              Formulários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Listas de presença</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-500" />
              Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload de Documentos</TabsTrigger>
          <TabsTrigger value="materials">Materiais Didáticos</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="attendance">Listas de Presença</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <TrainingDocumentUpload />
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Materiais Didáticos</CardTitle>
              <CardDescription>Apostilas, manuais, apresentações e vídeos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Use a aba "Upload de Documentos" para adicionar materiais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Emitidos</CardTitle>
              <CardDescription>Certificados de conclusão de treinamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Certificados serão listados aqui após emissão
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Listas de Presença</CardTitle>
              <CardDescription>Formulários de presença de treinamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Faça upload das listas de presença escaneadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
