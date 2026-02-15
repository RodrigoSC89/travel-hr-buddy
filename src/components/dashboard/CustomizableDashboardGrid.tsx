/**
 * CustomizableDashboardGrid
 * Drag-and-drop widget grid with Deep Ocean Command Center styling
 * Uses @dnd-kit for accessible, performant reordering
 */
import React, { useState, useCallback, Suspense, lazy } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ship, Users, Shield, Wrench, BarChart3, Brain, AlertTriangle, Activity,
  GripVertical, Eye, EyeOff, Maximize2, Minimize2, RotateCcw, Save, Settings2, X,
} from "lucide-react";
import { useCustomizableDashboard, type DashboardWidget } from "@/hooks/useCustomizableDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Lazy load widget contents
const FleetStatusWidget = lazy(() => import("@/components/dashboard/widgets/FleetStatusWidget"));
const CrewReadinessWidget = lazy(() => import("@/components/dashboard/widgets/CrewReadinessWidget"));
const ComplianceScoreWidget = lazy(() => import("@/components/dashboard/widgets/ComplianceScoreWidget"));
const MaintenanceWidget = lazy(() => import("@/components/dashboard/widgets/MaintenanceWidget"));
const OpexChartWidget = lazy(() => import("@/components/dashboard/widgets/OpexChartWidget"));
const AIInsightsWidget = lazy(() => import("@/components/dashboard/widgets/AIInsightsWidget"));
const CertificatesWidget = lazy(() => import("@/components/dashboard/widgets/CertificatesWidget"));
const RecentActivityWidget = lazy(() => import("@/components/dashboard/widgets/RecentActivityWidget"));

const ICON_MAP: Record<string, React.ElementType> = {
  Ship, Users, Shield, Wrench, BarChart3, Brain, AlertTriangle, Activity,
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "col-span-1",
  md: "col-span-1 lg:col-span-2",
  lg: "col-span-1 lg:col-span-3",
  xl: "col-span-1 lg:col-span-4",
};

const WIDGET_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  fleet: FleetStatusWidget,
  crew: CrewReadinessWidget,
  compliance: ComplianceScoreWidget,
  maintenance: MaintenanceWidget,
  finance: OpexChartWidget,
  ai: AIInsightsWidget,
  certificates: CertificatesWidget,
  activity: RecentActivityWidget,
};

function WidgetSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// ────── Sortable Widget ──────
interface SortableWidgetProps {
  widget: DashboardWidget;
  isEditing: boolean;
  onToggle: (id: string) => void;
  onResize: (id: string, size: DashboardWidget["size"]) => void;
}

function SortableWidget({ widget, isEditing, onToggle, onResize }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const IconComponent = ICON_MAP[widget.icon] || Activity;
  const WidgetContent = WIDGET_COMPONENTS[widget.type];

  const sizes: DashboardWidget["size"][] = ["sm", "md", "lg", "xl"];

  return (
    <motion.div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      className={cn(SIZE_CLASSES[widget.size], "min-h-[180px]")}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "h-full relative group transition-all duration-200",
        "bg-card/80 backdrop-blur-sm border-border/50",
        isDragging && "ring-2 ring-primary shadow-lg shadow-primary/20",
        isEditing && "ring-1 ring-dashed ring-primary/30 hover:ring-primary/60",
      )}>
        {/* Edit overlay */}
        {isEditing && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {sizes.map((s) => (
              <Button
                key={s}
                variant={widget.size === s ? "default" : "ghost"}
                size="icon"
                className="h-6 w-6 text-[10px]"
                onClick={() => onResize(widget.id, s)}
                aria-label={`Resize to ${s}`}
              >
                {s === "sm" ? <Minimize2 className="h-3 w-3" /> : s === "xl" ? <Maximize2 className="h-3 w-3" /> : s.toUpperCase()}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => onToggle(widget.id)}
              aria-label="Hide widget"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        )}

        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <IconComponent className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <Suspense fallback={<WidgetSkeleton />}>
            {WidgetContent ? <WidgetContent /> : <WidgetSkeleton />}
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ────── Main Grid ──────
export default function CustomizableDashboardGrid() {
  const {
    widgets,
    allWidgets,
    isEditing,
    setIsEditing,
    isSaving,
    reorderWidgets,
    toggleWidget,
    resizeWidget,
    resetLayout,
  } = useCustomizableDashboard();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  }, [reorderWidgets]);

  const hiddenWidgets = allWidgets.filter((w) => !w.visible);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Dashboard Personalizado</h2>
          {isSaving && (
            <Badge variant="secondary" className="animate-pulse text-xs">
              Salvando...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetLayout}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              {hiddenWidgets.length > 0 && (
                <div className="flex items-center gap-1">
                  {hiddenWidgets.map((w) => (
                    <Button
                      key={w.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => toggleWidget(w.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {w.title}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) {
                toast.success("Layout salvo com sucesso!");
              }
            }}
          >
            {isEditing ? (
              <>
                <Save className="h-3 w-3 mr-1" />
                Salvar
              </>
            ) : (
              <>
                <Settings2 className="h-3 w-3 mr-1" />
                Customizar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  isEditing={isEditing}
                  onToggle={toggleWidget}
                  onResize={resizeWidget}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
