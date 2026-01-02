import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Ship, FileText, Users, Navigation, Shield, LifeBuoy, 
  Flame, Droplets, Building2, Anchor, Radio, Settings,
  Eye, Snowflake, Plane, Target, Wrench
} from 'lucide-react';

export interface ChapterProgress {
  total: number;
  completed: number;
  compliant: number;
  nonCompliant: number;
}

interface PreOVIDChapterTabsProps {
  activeChapter: string;
  onChapterChange: (chapter: string) => void;
  chapterProgress: Record<string, ChapterProgress>;
}

export const OVIQ4_CHAPTERS = [
  { id: '1', name: 'Vessel Particulars', icon: Ship, shortName: '1. Vessel' },
  { id: '2', name: 'Certification & Documentation', icon: FileText, shortName: '2. Certificates' },
  { id: '3', name: 'Crew & Contractor Management', icon: Users, shortName: '3. Crew' },
  { id: '4', name: 'Navigation', icon: Navigation, shortName: '4. Navigation' },
  { id: '5', name: 'Safety & Security Management', icon: Shield, shortName: '5. Safety' },
  { id: '6', name: 'Life Saving Appliances', icon: LifeBuoy, shortName: '6. LSA' },
  { id: '7', name: 'Fire-Fighting', icon: Flame, shortName: '7. Fire' },
  { id: '8', name: 'Pollution Prevention', icon: Droplets, shortName: '8. Pollution' },
  { id: '9', name: 'Structural Condition', icon: Building2, shortName: '9. Structure' },
  { id: '10', name: 'Operations', icon: Wrench, shortName: '10. Operations' },
  { id: '11', name: 'Mooring', icon: Anchor, shortName: '11. Mooring' },
  { id: '12', name: 'Communications', icon: Radio, shortName: '12. Comms' },
  { id: '13', name: 'Propulsion & Machinery', icon: Settings, shortName: '13. Machinery' },
  { id: '14', name: 'General Appearance', icon: Eye, shortName: '14. Appearance' },
  { id: '15', name: 'Ice Operations', icon: Snowflake, shortName: '15. Ice' },
  { id: '16', name: 'Helicopter Operations', icon: Plane, shortName: '16. Heli' },
  { id: '17', name: 'DP Operations', icon: Target, shortName: '17. DP' },
];

export const PreOVIDChapterTabs: React.FC<PreOVIDChapterTabsProps> = ({
  activeChapter,
  onChapterChange,
  chapterProgress,
}) => {
  const getProgressColor = (progress: ChapterProgress) => {
    if (progress.completed === 0) return 'bg-muted';
    if (progress.nonCompliant > 0) return 'bg-red-500';
    if (progress.completed === progress.total) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          {OVIQ4_CHAPTERS.map((chapter) => {
            const progress = chapterProgress[chapter.id] || { total: 0, completed: 0, compliant: 0, nonCompliant: 0 };
            const Icon = chapter.icon;
            const isActive = activeChapter === chapter.id;
            
            return (
              <button
                key={chapter.id}
                onClick={() => onChapterChange(chapter.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[80px]
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                  }
                `}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{chapter.shortName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getProgressColor(progress)}`} />
                  <span className="text-[10px]">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
