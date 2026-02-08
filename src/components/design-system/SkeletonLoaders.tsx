/**
 * SkeletonLoaders - Loaders Padronizados para Todo o Sistema
 * Variantes para diferentes tipos de conteúdo
 */

import { FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// === TABLE SKELETON ===
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const TableSkeleton: FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {showHeader && (
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    )}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className={cn(
              'h-10 flex-1',
              colIndex === 0 && 'max-w-[200px]'
            )} 
          />
        ))}
      </div>
    ))}
  </div>
);

// === CARD SKELETON ===
interface CardSkeletonProps {
  showImage?: boolean;
  showActions?: boolean;
  className?: string;
}

export const CardSkeleton: FC<CardSkeletonProps> = ({
  showImage = true,
  showActions = true,
  className,
}) => (
  <div className={cn('border border-border rounded-lg p-4 space-y-4', className)}>
    {showImage && (
      <Skeleton className="h-40 w-full rounded-md" />
    )}
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    {showActions && (
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    )}
  </div>
);

// === CARDS GRID SKELETON ===
interface CardsGridSkeletonProps {
  cards?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const CardsGridSkeleton: FC<CardsGridSkeletonProps> = ({
  cards = 6,
  columns = 3,
  className,
}) => (
  <div 
    className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}
  >
    {Array.from({ length: cards }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// === KPI CARD SKELETON ===
interface KPISkeletonProps {
  className?: string;
}

export const KPISkeleton: FC<KPISkeletonProps> = ({ className }) => (
  <div className={cn('border border-border rounded-lg p-4 space-y-3', className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

// === KPI GRID SKELETON ===
interface KPIGridSkeletonProps {
  count?: number;
  className?: string;
}

export const KPIGridSkeleton: FC<KPIGridSkeletonProps> = ({
  count = 4,
  className,
}) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <KPISkeleton key={i} />
    ))}
  </div>
);

// === FORM SKELETON ===
interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export const FormSkeleton: FC<FormSkeletonProps> = ({
  fields = 4,
  className,
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// === DETAIL PAGE SKELETON ===
interface DetailPageSkeletonProps {
  className?: string;
}

export const DetailPageSkeleton: FC<DetailPageSkeletonProps> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    
    {/* KPIs */}
    <KPIGridSkeleton />
    
    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TableSkeleton rows={5} columns={4} />
      </div>
      <div className="space-y-4">
        <CardSkeleton showImage={false} />
        <CardSkeleton showImage={false} />
      </div>
    </div>
  </div>
);

// === CHART SKELETON ===
interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  className?: string;
}

export const ChartSkeleton: FC<ChartSkeletonProps> = ({
  type = 'bar',
  height = 300,
  className,
}) => (
  <div 
    className={cn('border border-border rounded-lg p-4', className)}
    style={{ height }}
  >
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="flex-1 flex items-end justify-around gap-2 h-[calc(100%-60px)]">
      {type === 'bar' && Array.from({ length: 8 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 max-w-12" 
          style={{ height: `${30 + ((i * 37 + 13) % 70)}%` }}
        />
      ))}
      {type === 'pie' && (
        <Skeleton className="w-48 h-48 rounded-full mx-auto" />
      )}
      {(type === 'line' || type === 'area') && (
        <Skeleton className="w-full h-full rounded-md" />
      )}
    </div>
  </div>
);

// === PROFILE SKELETON ===
interface ProfileSkeletonProps {
  className?: string;
}

export const ProfileSkeleton: FC<ProfileSkeletonProps> = ({ className }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// === LIST SKELETON ===
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListSkeleton: FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = true,
  className,
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    ))}
  </div>
);

export default {
  Table: TableSkeleton,
  Card: CardSkeleton,
  CardsGrid: CardsGridSkeleton,
  KPI: KPISkeleton,
  KPIGrid: KPIGridSkeleton,
  Form: FormSkeleton,
  DetailPage: DetailPageSkeleton,
  Chart: ChartSkeleton,
  Profile: ProfileSkeleton,
  List: ListSkeleton,
};
