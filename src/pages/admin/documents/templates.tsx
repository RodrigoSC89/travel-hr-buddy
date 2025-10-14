import React from "react";
import TemplateList from "@/components/templates/TemplateList";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DocumentTemplates = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <Card>
        <CardHeader>
          <CardTitle>Templates de Documentos</CardTitle>
          <CardDescription>
            Gerencie e aplique templates de documentos para agilizar seu trabalho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateList />
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
};

export default DocumentTemplates;
