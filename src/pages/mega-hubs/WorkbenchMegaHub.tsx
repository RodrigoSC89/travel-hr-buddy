/**
 * Workbench Mega-Hub - Centro de Trabalho Unificado
 * Rota canônica: /workbench
 * 
 * Consolida: Documents + People + Finance + System
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, Users, DollarSign, Settings, Plane } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load sub-components
const DocumentCenterHub = lazy(() => import('@/pages/DocumentCenterPremium'));
const PeopleHub = lazy(() => import('@/pages/PeopleHubPremium'));
const FinanceHub = lazy(() => import('@/pages/FinanceCommandCenterPremium'));
const SystemHub = lazy(() => import('@/pages/SystemHubPremium'));
const TravelCommandPremium = lazy(() => import('@/pages/TravelCommandPremium'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const sectionConfig = [
  { id: 'docs', label: 'Documents', icon: FileText, color: 'blue' },
  { id: 'people', label: 'People', icon: Users, color: 'green' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'yellow' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'purple' },
  { id: 'system', label: 'System', icon: Settings, color: 'gray' },
];

export default function WorkbenchMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Determine section from path or query params
  const pathSection = location.pathname.split('/')[2] || '';
  const activeSection = pathSection || searchParams.get('section') || 'docs';

  const handleSectionChange = (value: string) => {
    setSearchParams({ section: value });
  };

  const getColorClass = (section: string, isActive: boolean) => {
    if (!isActive) return '';
    switch (section) {
      case 'docs': return 'bg-blue-500 text-white';
      case 'people': return 'bg-green-500 text-white';
      case 'finance': return 'bg-yellow-500 text-white';
      case 'travel': return 'bg-purple-500 text-white';
      case 'system': return 'bg-gray-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Workbench</h1>
                <p className="text-sm text-muted-foreground">Docs • People • Finance • System</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
              MEGA-HUB G
            </Badge>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-14 bg-transparent gap-4 justify-start">
              {sectionConfig.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={`gap-2 px-6 py-3 text-base ${getColorClass(section.id, activeSection === section.id)}`}
                >
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Section Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="docs" className="mt-0">
              <DocumentCenterHub />
            </TabsContent>
            
            <TabsContent value="people" className="mt-0">
              <PeopleHub />
            </TabsContent>
            
            <TabsContent value="finance" className="mt-0">
              <FinanceHub />
            </TabsContent>
            
            <TabsContent value="travel" className="mt-0">
              <TravelCommandPremium />
            </TabsContent>
            
            <TabsContent value="system" className="mt-0">
              <SystemHub />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
