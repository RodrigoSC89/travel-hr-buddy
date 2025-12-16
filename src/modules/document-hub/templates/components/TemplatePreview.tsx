/**
 * PATCH 417: Template Preview and PDF Generator
 * Preview templates with variable substitution and export to PDF
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { escapeRegexSpecialChars } from "../services/template-utils";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface TemplatePreviewProps {
  templateContent: string;
  variables?: string[];
  templateName: string;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateContent,
  variables = [],
  templateName
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState(templateContent);
  const { toast } = useToast();

  const updatePreview = () => {
    let content = templateContent;
    
    // Replace all variables with their values using utility function
    Object.entries(variableValues).forEach(([key, value]) => {
      const escapedKey = escapeRegexSpecialChars(key);
      const regex = new RegExp(`{{${escapedKey}}}`, "g");
      content = content.replace(regex, value || `<span style="color: red;">{{${key}}}</span>`);
    });
    
    setPreviewContent(content);
  };

  const generatePDF = async () => {
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      
      // Use DOMParser to safely parse HTML
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(previewContent, "text/html");
      const text = htmlDoc.body.textContent || "";
      
      // Split text into lines that fit the PDF page
      const lines = doc.splitTextToSize(text, 180);
      
      // Add lines to PDF
      doc.setFontSize(12);
      doc.text(lines, 15, 15);
      
      // Save the PDF
      doc.save(`${templateName}-${Date.now()}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your template has been exported to PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const generateHTML = () => {
    const blob = new Blob([previewContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Downloaded",
      description: "Your template has been exported to HTML",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Template Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variables">Fill Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-4">
            {variables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No variables in this template</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Fill in the values for each variable to preview the template
                </p>
                {variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={variable}>{variable}</Label>
                    <Input
                      id={variable}
                      value={variableValues[variable] || ""}
                      onChange={(e) =>
                        setVariableValues({
                          ...variableValues,
                          [variable]: e.target.value
                        })
                      }
                      placeholder={`Enter value for ${variable}`}
                    />
                  </div>
                ))}
                <Button onClick={updatePreview} className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Update Preview
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {/* Preview Area */}
            <div 
              className="p-6 border border-zinc-700 rounded-lg bg-white text-black min-h-[400px] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />

            {/* Export Options */}
            <div className="flex gap-2">
              <Button onClick={generatePDF} variant="default" className="flex-1">
                <FileDown className="w-4 h-4 mr-2" />
                Export to PDF
              </Button>
              <Button onClick={generateHTML} variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Export to HTML
              </Button>
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <Eye className="inline w-4 h-4 mr-1" />
                Preview shows how the template will look with filled variables
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
