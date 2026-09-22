import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface CollapsiblePanelProps {
  collapsed: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  minHeight?: number;
  className?: string;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  collapsed,
  onToggle,
  title,
  children,
  minHeight = 40,
  className
}) => {
  return (
    <div className={clsx('flex flex-col border border-[#262B3D] bg-[#0B0E14] overflow-hidden', className)}>
      <div 
        onClick={onToggle}
        className="flex items-center justify-between px-3 h-10 bg-[#151924] cursor-pointer hover:bg-[#1E2336] transition-colors"
      >
        <span className="text-sm font-medium text-[#8F9CAE]">{title}</span>
        {collapsed ? (
          <ChevronDown size={16} className="text-[#8F9CAE]" />
        ) : (
          <ChevronUp size={16} className="text-[#8F9CAE]" />
        )}
      </div>
      <div
        className={clsx(
          'transition-all duration-200 ease-in-out',
          collapsed ? 'h-0 opacity-0 overflow-hidden' : 'flex-1 opacity-100 overflow-auto'
        )}
        style={{ minHeight: collapsed ? 0 : minHeight }}
      >
        {children}
      </div>
    </div>
  );
};
