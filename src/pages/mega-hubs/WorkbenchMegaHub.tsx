/**
 * Workbench Mega-Hub - Centro de Trabalho Unificado
 * Rota canônica: /workbench
 * 
 * Consolida: Documents + People + Finance + System
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, Users, DollarSign, Settings, Plane, Plus, Download, Upload, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { 
  CrewSchedulerGantt, 
  FinanceApprovalWorkflow, 
  DocumentVersionControl 
} from '@/components/world-class';

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
  { id: 'docs-control', label: 'Doc Control', icon: Upload, color: 'blue' },
  { id: 'people', label: 'People', icon: Users, color: 'green' },
  { id: 'crew-schedule', label: 'Crew Schedule', icon: Calendar, color: 'green' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'yellow' },
  { id: 'approvals', label: 'Approvals', icon: DollarSign, color: 'yellow' },
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

  const handleActionBarAction = (action: string) => {
    console.log(`Workbench action: ${action}`);
  };

  const getColorClass = (section: string, isActive: boolean) => {
    if (!isActive) return '';
    switch (section) {
      case 'docs': 
      case 'docs-control':
        return 'bg-blue-500 text-white';
      case 'people':
      case 'crew-schedule': 
        return 'bg-green-500 text-white';
      case 'finance':
      case 'approvals': 
        return 'bg-yellow-500 text-white';
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
            <TabsList className="h-14 bg-transparent gap-2 justify-start overflow-x-auto">
              {sectionConfig.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={`gap-2 px-4 py-2 ${getColorClass(section.id, activeSection === section.id)}`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Section Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* DOCUMENTS SECTION */}
            <TabsContent value="docs" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Document Center"
                subtitle="Manage documents, templates, and knowledge base"
                actions={[
                  {
                    id: 'upload',
                    label: 'Upload Document',
                    icon: <Upload className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('upload'),
                    variant: 'default'
                  },
                  {
                    id: 'new-template',
                    label: 'New Template',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-template'),
                    variant: 'outline'
                  },
                  {
                    id: 'version-control',
                    label: 'Version Control',
                    icon: <FileText className="h-4 w-4" />,
                    onClick: () => setSearchParams({ section: 'docs-control' }),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search documents, templates..."
              />
              <DocumentCenterHub />
            </TabsContent>

            <TabsContent value="docs-control" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Document Version Control"
                subtitle="Advanced document versioning, metadata, and digital signatures"
                actions={[
                  {
                    id: 'upload',
                    label: 'Upload New Version',
                    icon: <Upload className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('upload'),
                    variant: 'default'
                  }
                ]}
              />
              <DocumentVersionControl />
            </TabsContent>

            {/* PEOPLE SECTION */}
            <TabsContent value="people" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="People Hub"
                subtitle="Manage crew, training, and HR operations"
                actions={[
                  {
                    id: 'add-crew',
                    label: 'Add Crew Member',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('add-crew'),
                    variant: 'default'
                  },
                  {
                    id: 'schedule',
                    label: 'Crew Schedule',
                    icon: <Calendar className="h-4 w-4" />,
                    onClick: () => setSearchParams({ section: 'crew-schedule' }),
                    variant: 'outline'
                  },
                  {
                    id: 'export',
                    label: 'Export Report',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search crew, training records..."
              />
              <WorkflowStatusBar
                title="Crew Rotation Cycle"
                steps={[
                  { id: 'planning', label: 'Planning', status: 'completed' },
                  { id: 'assignment', label: 'Assignment', status: 'completed' },
                  { id: 'onboard', label: 'On-board', status: 'current' },
                  { id: 'rotation', label: 'Rotation', status: 'pending' },
                  { id: 'offboard', label: 'Off-board', status: 'pending' }
                ]}
                variant="horizontal"
              />
              <PeopleHub />
            </TabsContent>

            <TabsContent value="crew-schedule" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Crew Scheduler Gantt"
                subtitle="Visual crew rotation management with STCW/MLC compliance"
                actions={[
                  {
                    id: 'add-rotation',
                    label: 'New Rotation',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('add-rotation'),
                    variant: 'default'
                  },
                  {
                    id: 'export',
                    label: 'Export Schedule',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
              />
              <CrewSchedulerGantt />
            </TabsContent>

            {/* FINANCE SECTION */}
            <TabsContent value="finance" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Finance Command"
                subtitle="Voyage accounting, P&L, and financial operations"
                actions={[
                  {
                    id: 'new-expense',
                    label: 'New Expense',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-expense'),
                    variant: 'default'
                  },
                  {
                    id: 'approvals',
                    label: 'Pending Approvals',
                    icon: <DollarSign className="h-4 w-4" />,
                    onClick: () => setSearchParams({ section: 'approvals' }),
                    variant: 'outline'
                  },
                  {
                    id: 'export',
                    label: 'Export Report',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search transactions, invoices..."
              />
              <FinanceHub />
            </TabsContent>

            <TabsContent value="approvals" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Finance Approval Workflow"
                subtitle="Multi-step approval for purchases, expenses, and invoices"
                actions={[
                  {
                    id: 'bulk-approve',
                    label: 'Bulk Approve',
                    icon: <DollarSign className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('bulk-approve'),
                    variant: 'default'
                  }
                ]}
              />
              <FinanceApprovalWorkflow />
            </TabsContent>
            
            <TabsContent value="travel" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="Travel Command"
                subtitle="Crew travel, logistics, and expense management"
                actions={[
                  {
                    id: 'new-booking',
                    label: 'New Booking',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-booking'),
                    variant: 'default'
                  },
                  {
                    id: 'export',
                    label: 'Export',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search bookings, crew travel..."
              />
              <TravelCommandPremium />
            </TabsContent>
            
            <TabsContent value="system" className="mt-0 space-y-6">
              <EnhancedActionBar
                title="System Hub"
                subtitle="Settings, integrations, and system administration"
                actions={[
                  {
                    id: 'new-integration',
                    label: 'Add Integration',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-integration'),
                    variant: 'default'
                  }
                ]}
                showSearch
                searchPlaceholder="Search settings, integrations..."
              />
              <SystemHub />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
