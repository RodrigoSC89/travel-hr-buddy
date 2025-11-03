/**
 * PATCH 609: ISM Audits Module
 * OCR processing and AI interpretation of ISM audit documents
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ISMAuditUpload from "./components/ISMAuditUpload";
import ISMAuditList from "./components/ISMAuditList";
import ISMVesselHistory from "./components/ISMVesselHistory";
import ISMReports from "./components/ISMReports";
import { FileText, Upload, Ship, BarChart3 } from "lucide-react";

export default function ISMAudits() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ISM Audits
          </CardTitle>
          <CardDescription>
            PATCH 609 - OCR and AI-powered ISM audit analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Audit
              </TabsTrigger>
              <TabsTrigger value="audits" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Audits
              </TabsTrigger>
              <TabsTrigger value="vessels" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Vessel History
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <ISMAuditUpload />
            </TabsContent>

            <TabsContent value="audits" className="space-y-4">
              <ISMAuditList />
            </TabsContent>

            <TabsContent value="vessels" className="space-y-4">
              <ISMVesselHistory />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <ISMReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
