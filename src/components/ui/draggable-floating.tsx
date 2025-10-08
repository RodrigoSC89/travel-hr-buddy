import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Position { x: number; y: number }

type PositionInput = Position | (() => Position);

interface DraggableFloatingProps {
  storageKey: string;
  defaultPosition: PositionInput;
  zIndex?: number;
  boundsPadding?: number; // padding from window edges
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  ariaLabel?: string;
}

// Utility to clamp a value between min and max
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const DraggableFloating: React.FC<DraggableFloatingProps> = ({
  storageKey,
  defaultPosition,
  zIndex = 50,
  boundsPadding = 8,
  className,
  style,
  children,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    const initial = typeof defaultPosition === 'function' ? (defaultPosition as () => Position)() : defaultPosition;
    return initial;
  });
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Keep inside viewport on resize
  useEffect(() => {
    const handleResize = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - boundsPadding;
      const maxY = window.innerHeight - rect.height - boundsPadding;
      setPos((p) => ({ x: clamp(p.x, boundsPadding, maxX), y: clamp(p.y, boundsPadding, maxY) }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [boundsPadding]);

  // Persist position
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pos));
    } catch {
      // Ignore storage errors  
    }
  }, [pos, storageKey]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only left button
    if (e.button !== 0) return;
    const node = containerRef.current;
    if (!node) return;
    node.setPointerCapture(e.pointerId);
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  }, [pos.x, pos.y]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const nextX = dragState.current.origX + dx;
    const nextY = dragState.current.origY + dy;
    const maxX = window.innerWidth - rect.width - boundsPadding;
    const maxY = window.innerHeight - rect.height - boundsPadding;
    setPos({ x: clamp(nextX, boundsPadding, maxX), y: clamp(nextY, boundsPadding, maxY) });
  }, [boundsPadding]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    if (node) node.releasePointerCapture(e.pointerId);
    dragState.current.dragging = false;
  }, []);

  // Compose style
  const mergedStyle: React.CSSProperties = useMemo(() => ({
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    zIndex,
    touchAction: 'none',
    ...style,
  }), [pos.x, pos.y, zIndex, style]);

  return (
    <div
      ref={containerRef}
      role="complementary"
      aria-label={ariaLabel}
      className={className}
      style={mergedStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
};

export default DraggableFloating;
