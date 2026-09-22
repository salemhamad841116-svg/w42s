import React, { useRef, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';

interface ResizablePanelProps {
  direction: 'horizontal' | 'vertical';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  children: React.ReactNode;
  onResize?: (size: number) => void;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  direction,
  minSize = 100,
  maxSize = 800,
  defaultSize = 250,
  children,
  onResize,
  className
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;
    
    let newSize;
    const rect = panelRef.current.getBoundingClientRect();
    
    if (direction === 'horizontal') {
      newSize = e.clientX - rect.left;
    } else {
      // For vertical, assuming it resizes upwards (like a bottom panel)
      newSize = rect.bottom - e.clientY;
    }

    const clampedSize = Math.max(minSize, Math.min(newSize, maxSize));
    setSize(clampedSize);
    onResize?.(clampedSize);
  }, [isDragging, direction, minSize, maxSize, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: size,
        minWidth: direction === 'horizontal' ? minSize : undefined,
        minHeight: direction === 'vertical' ? minSize : undefined,
      }}
      className={clsx('relative flex', direction === 'vertical' ? 'flex-col' : 'flex-row', className)}
    >
      <div
        onMouseDown={handleMouseDown}
        className={clsx(
          'absolute z-10 bg-[#262B3D] hover:bg-[#2962FF] transition-colors',
          direction === 'horizontal' 
            ? 'top-0 right-0 w-1 h-full cursor-col-resize -mr-[2px]' 
            : 'top-0 left-0 h-1 w-full cursor-row-resize -mt-[2px]'
        )}
      />
      <div className="flex-1 overflow-hidden h-full w-full bg-[#0B0E14]">
        {children}
      </div>
    </div>
  );
};
