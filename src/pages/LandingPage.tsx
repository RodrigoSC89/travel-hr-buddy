import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LandingHeader, LandingHeroSection, TrustBar, LandingFooter } from './landing/LandingHero';
import { FeaturesSection, DifferentiatorsSection, PricingSection, TestimonialsSection, CTASection, CompetitorComparisonSection, LiveDemoSection, GuaranteesSection, SocialProofSection } from './landing/LandingSections';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Nauti One — Maritime HR & Operations Platform</title>
        <meta name="description" content="All-in-one maritime HR, crew management, compliance (MLC 2006, STCW) and fleet operations platform with AI" />
        <meta name="keywords" content="maritime HR, crew management, MLC 2006, STCW, maritime software, offshore, fleet management, predictive maintenance" />
        <link rel="canonical" href="https://nautione.com.br" />
        <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Nauti One", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "description": "Maritime HR & Operations Platform with AI", "offers": { "@type": "AggregateOffer", "lowPrice": "500", "highPrice": "2000", "priceCurrency": "USD", "offerCount": "3" } })}</script>
      </Helmet>
      <div className="min-h-screen bg-background overflow-hidden">
        <LandingHeader navigate={navigate} />
        <LandingHeroSection />
        <TrustBar />
        <SocialProofSection />
        <FeaturesSection />
        <CompetitorComparisonSection />
        <DifferentiatorsSection />
        <LiveDemoSection />
        <PricingSection />
        <GuaranteesSection />
        <TestimonialsSection />
        <CTASection />
        <LandingFooter />
      </div>
    </>
  );
};

export default LandingPage;
