/**
 * 📊 3D Audit Timeline - Interactive React Three Fiber Visualization
 * NAUTILUS ONE v5.0 - Immersive Data Visualization
 * 
 * Interactive 3D timeline showing audit history, findings, and actions
 */

import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Text, Line, Float, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck, AlertTriangle, CheckCircle, Clock, Eye, Plus } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'audit' | 'finding' | 'action' | 'closure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  score?: number;
  assignedTo?: string;
  relatedEventId?: string;
}

interface TimelineEvent3DProps {
  event: TimelineEvent;
  position: [number, number, number];
  onSelect: (event: TimelineEvent) => void;
  isSelected: boolean;
}

interface EventDetailsCardProps {
  event: TimelineEvent;
  onClose: () => void;
  onAction: (action: string) => void;
}

// Colors for different severity levels
const SEVERITY_COLORS = {
  low: '#4ade80',
  medium: '#fbbf24',
  high: '#fb923c',
  critical: '#ef4444'
};

// Colors for event types
const TYPE_COLORS = {
  audit: '#3b82f6',
  finding: '#f59e0b',
  action: '#8b5cf6',
  closure: '#10b981'
};

// 3D Event Node Component
function TimelineEvent3D({ event, position, onSelect, isSelected }: TimelineEvent3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const color = TYPE_COLORS[event.type];
  const scale = hovered || isSelected ? 1.3 : 1;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      
      // Pulse when selected
      if (isSelected) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
        meshRef.current.scale.setScalar(scale * pulse);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const getGeometry = () => {
    switch (event.type) {
      case 'audit':
        return <boxGeometry args={[0.3, 0.3, 0.3]} />;
      case 'finding':
        return <octahedronGeometry args={[0.2]} />;
      case 'action':
        return <cylinderGeometry args={[0.15, 0.15, 0.3, 6]} />;
      case 'closure':
        return <sphereGeometry args={[0.18, 16, 16]} />;
      default:
        return <sphereGeometry args={[0.2, 16, 16]} />;
    }
  };

  return (
    <group position={position}>
      {/* Main event mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(event); }}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Severity indicator ring */}
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.3, 32]} />
        <meshStandardMaterial 
          color={SEVERITY_COLORS[event.severity]} 
          emissive={SEVERITY_COLORS[event.severity]}
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover label */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.5, 0]} center distanceFactor={5}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg min-w-[150px] pointer-events-none">
            <p className="font-semibold text-sm truncate">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(event.date, 'MMM d, yyyy')}
            </p>
          </div>
        </Html>
      )}

      {/* Connection line to timeline */}
      <Line
        points={[[0, 0, 0], [0, -0.8, 0]]}
        color={color}
        lineWidth={2}
        opacity={0.5}
        transparent
      />
    </group>
  );
}

// Main Timeline Line
function TimelineLine({ length }: { length: number }) {
  const points = useMemo(() => [
    new THREE.Vector3(-length / 2, -1, 0),
    new THREE.Vector3(length / 2, -1, 0)
  ], [length]);

  return (
    <>
      {/* Main timeline */}
      <Line
        points={points}
        color="#6366f1"
        lineWidth={4}
        opacity={0.8}
        transparent
      />
      
      {/* Timeline markers */}
      {Array.from({ length: Math.ceil(length) }).map((_, i) => (
        <group key={i} position={[-length / 2 + i, -1, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 0.1, 0.05]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Grid floor
function GridFloor() {
  return (
    <gridHelper 
      args={[20, 20, '#444444', '#333333']} 
      position={[0, -1.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Event Details Card (2D overlay)
function EventDetailsCard({ event, onClose, onAction }: EventDetailsCardProps) {
  const statusColors = {
    pending: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    overdue: 'bg-red-500'
  };

  const StatusIcon = {
    pending: Clock,
    in_progress: AlertTriangle,
    completed: CheckCircle,
    overdue: AlertTriangle
  }[event.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-4 top-4 w-80 z-10"
    >
      <Card className="backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: TYPE_COLORS[event.type] }} 
              />
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">{event.type}</Badge>
            <Badge 
              className={`${statusColors[event.status]} text-white capitalize`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {event.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(event.date, 'PPpp')}
            </p>
          </div>
          
          <p className="text-sm">{event.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {event.score && (
              <div className="bg-muted rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Score:</span>
                <span className="font-bold ml-1">{event.score}%</span>
              </div>
            )}
            <div className="bg-muted rounded-lg px-3 py-1.5">
              <span className="text-xs text-muted-foreground">Severity:</span>
              <span 
                className="font-bold ml-1 capitalize"
                style={{ color: SEVERITY_COLORS[event.severity] }}
              >
                {event.severity}
              </span>
            </div>
          </div>

          {event.assignedTo && (
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="ml-1 font-medium">{event.assignedTo}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1" onClick={() => onAction('view')}>
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            {event.type === 'finding' && (
              <Button size="sm" variant="outline" onClick={() => onAction('action')}>
                <Plus className="w-4 h-4 mr-1" />
                Add Action
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading fallback
function TimelineLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading 3D Timeline...</p>
      </div>
    </div>
  );
}

// Main Timeline Component
export function AuditTimeline3D({ 
  events,
  onEventSelect,
  onAction 
}: { 
  events: TimelineEvent[];
  onEventSelect?: (event: TimelineEvent) => void;
  onAction?: (event: TimelineEvent, action: string) => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Sort events by date and calculate positions
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events]
  );

  const timelineLength = Math.max(10, sortedEvents.length * 1.5);

  const eventPositions = useMemo(() => {
    if (sortedEvents.length === 0) return [];
    
    const startDate = sortedEvents[0].date.getTime();
    const endDate = sortedEvents[sortedEvents.length - 1].date.getTime();
    const dateRange = endDate - startDate || 1;

    return sortedEvents.map((event, index) => {
      const x = -timelineLength / 2 + ((event.date.getTime() - startDate) / dateRange) * timelineLength;
      const y = 0;
      const z = (index % 3 - 1) * 0.5; // Slight Z offset for visual separation
      return { event, position: [x, y, z] as [number, number, number] };
    });
  }, [sortedEvents, timelineLength]);

  const handleEventSelect = (event: TimelineEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const handleAction = (action: string) => {
    if (selectedEvent && onAction) {
      onAction(selectedEvent, action);
    }
  };

  if (events.length === 0) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No audit events to display</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative h-[500px] w-full rounded-lg border bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }} 
            />
            <span className="text-xs capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* 3D Canvas */}
      <Suspense fallback={<TimelineLoading />}>
        <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />

          <TimelineLine length={timelineLength} />
          <GridFloor />

          {eventPositions.map(({ event, position }) => (
            <TimelineEvent3D
              key={event.id}
              event={event}
              position={position}
              onSelect={handleEventSelect}
              isSelected={selectedEvent?.id === event.id}
            />
          ))}
        </Canvas>
      </Suspense>

      {/* Event Details Overlay */}
      {selectedEvent && (
        <EventDetailsCard
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAction={handleAction}
        />
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
        Drag to rotate • Scroll to zoom • Click events for details
      </div>
    </div>
  );
}

export default AuditTimeline3D;
