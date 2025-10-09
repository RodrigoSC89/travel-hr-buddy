import { useEffect, useState, useRef, RefObject } from 'react';

interface UseArrowNavigationOptions {
  isOpen: boolean;
  itemCount: number;
  onSelect?: (index: number) => void;
  onClose?: () => void;
  orientation?: 'vertical' | 'horizontal';
  loop?: boolean;
}

/**
 * Hook for arrow key navigation in menus and lists
 * Supports both vertical and horizontal navigation
 */
export const useArrowNavigation = ({
  isOpen,
  itemCount,
  onSelect,
  onClose,
  orientation = 'vertical',
  loop = true,
}: UseArrowNavigationOptions) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Reset focused index when menu opens/closes or item count changes
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    }
  }, [isOpen, itemCount]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          setFocusedIndex(prev => {
            if (loop) {
              return (prev + 1) % itemCount;
            }
            return Math.min(prev + 1, itemCount - 1);
          });
          break;

        case prevKey:
          e.preventDefault();
          setFocusedIndex(prev => {
            if (loop) {
              return prev === 0 ? itemCount - 1 : prev - 1;
            }
            return Math.max(prev - 1, 0);
          });
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(focusedIndex);
          break;

        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, itemCount, orientation, loop, onSelect, onClose]);

  // Focus the element when index changes
  useEffect(() => {
    if (isOpen && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    tabIndex: isOpen && focusedIndex === index ? 0 : -1,
    'data-focused': focusedIndex === index,
    onMouseEnter: () => setFocusedIndex(index),
    onFocus: () => setFocusedIndex(index),
  });

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
  };
};
