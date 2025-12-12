import React from "react";
import { useLocation } from "react-router-dom";
import { SEOHead } from "@/components/seo/seo-head";

interface SEOWrapperProps {
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({ children }) => {
  const location = useLocation();
  
  const getPageSEO = (pathname: string) => {
    switch (pathname) {
    case "/":
      return {
        title: "Nautilus One - Dashboard Principal",
        description: "Dashboard principal do sistema marítimo inteligente com IA e analytics avançados",
        keywords: "dashboard, maritimo, gestão, navegação, IA"
      };
    case "/maritime":
      return {
        title: "Gestão Marítima - Nautilus One",
        description: "Sistema completo de gestão marítima com monitoramento de embarcações e tripulação",
        keywords: "embarcações, tripulação, maritimo, gestão"
      };
    case "/analytics":
      return {
        title: "Analytics Avançados - Nautilus One",
        description: "Análises preditivas e insights inteligentes para operações marítimas",
        keywords: "analytics, insights, maritimo, dados"
      };
    case "/voice":
      return {
        title: "Interface de Voz - Nautilus One",
        description: "Comandos de voz inteligentes para controle do sistema marítimo",
        keywords: "voz, comandos, IA, maritimo"
      };
    case "/testing":
      return {
        title: "Testes & Homologação - Nautilus One",
        description: "Centro de testes e homologação do sistema marítimo",
        keywords: "testes, homologação, qualidade, maritimo"
      };
    default:
      return {
        title: "Nautilus One - Sistema Marítimo Inteligente",
        description: "Plataforma completa para gestão marítima com IA, analytics avançados e automação inteligente",
        keywords: "maritimo, gestão, navegação, IA, analytics"
      };
    }
  };

  const seoData = getPageSEO(location.pathname);

  return (
    <>
      <SEOHead {...seoData} />
      {children}
    </>
  );
};