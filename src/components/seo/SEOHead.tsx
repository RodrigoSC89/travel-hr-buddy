/**
 * SEO Head Component
 * Dynamic meta tags for each page using react-helmet-async
 */

import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  canonical?: string;
  structuredData?: Record<string, unknown>;
}

const DEFAULT_TITLE = 'Nautilus One - Sistema de Gestão Empresarial';
const DEFAULT_DESCRIPTION = 'Sistema revolucionário de gestão empresarial com módulos de RH, viagens, hospedagem e mais de 50 funcionalidades integradas.';
const DEFAULT_IMAGE = '/nautilus-logo.png';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = ['gestão empresarial', 'recursos humanos', 'viagens corporativas', 'sistema de gestão'],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  canonical,
  structuredData
}) => {
  const pageTitle = title ? `${title} | Nautilus One` : DEFAULT_TITLE;
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Nautilus One',
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL'
    },
    featureList: [
      'Gestão de Recursos Humanos',
      'Reserva de Viagens',
      'Gestão Financeira',
      'Automação de Processos',
      'Analytics e Relatórios'
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Nautilus One" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

// Page-specific SEO configurations
export const pageSEO = {
  dashboard: {
    title: 'Dashboard',
    description: 'Painel de controle centralizado com métricas em tempo real, insights de IA e visão geral de todos os módulos.',
    keywords: ['dashboard', 'painel de controle', 'métricas', 'analytics']
  },
  hr: {
    title: 'Recursos Humanos',
    description: 'Gestão completa de pessoas, certificados, treinamentos e documentos de tripulação.',
    keywords: ['recursos humanos', 'gestão de pessoas', 'certificados', 'treinamentos']
  },
  finance: {
    title: 'Financeiro',
    description: 'Controle financeiro completo com contas a pagar, receber, fluxo de caixa e relatórios.',
    keywords: ['financeiro', 'contas a pagar', 'contas a receber', 'fluxo de caixa']
  },
  flights: {
    title: 'Passagens Aéreas',
    description: 'Busca e reserva de passagens aéreas com as melhores tarifas do mercado.',
    keywords: ['passagens aéreas', 'voos', 'viagens', 'reservas']
  },
  hotels: {
    title: 'Hotéis',
    description: 'Busca e reserva de hospedagem com comparação de preços e avaliações.',
    keywords: ['hotéis', 'hospedagem', 'reservas', 'viagens']
  },
  documents: {
    title: 'Documentos',
    description: 'Gestão inteligente de documentos com OCR, assinatura digital e organização automática.',
    keywords: ['documentos', 'gestão documental', 'OCR', 'assinatura digital']
  },
  analytics: {
    title: 'Analytics',
    description: 'Análises avançadas e relatórios personalizados com insights de inteligência artificial.',
    keywords: ['analytics', 'relatórios', 'métricas', 'business intelligence']
  },
  settings: {
    title: 'Configurações',
    description: 'Configurações do sistema, preferências de usuário e personalizações.',
    keywords: ['configurações', 'preferências', 'personalização']
  }
};

export default SEOHead;
