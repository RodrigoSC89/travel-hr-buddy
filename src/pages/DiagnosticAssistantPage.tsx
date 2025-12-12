/**
 * DIAGNOSTIC ASSISTANT PAGE - PHASE 4
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { DiagnosticAssistant } from "@/components/diagnostic/DiagnosticAssistant";

const DiagnosticAssistantPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Assistente de Diagnóstico | Nautilus One</title>
        <meta name="description" content="IA para diagnóstico técnico de falhas com acesso a documentação e histórico" />
      </Helmet>
      <div className="container mx-auto p-6 max-w-7xl">
        <DiagnosticAssistant />
      </div>
    </>
  );
});

export default DiagnosticAssistantPage;
