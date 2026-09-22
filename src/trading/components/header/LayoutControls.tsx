import React from 'react';
import { useUiStore } from '../../store';
import { Grid, Square, Columns } from 'lucide-react';
import clsx from 'clsx';

const LAYOUTS = [
  { id: '1x1', icon: Square, label: 'Single' },
  { id: '2x1', icon: Columns, label: 'Split' },
  { id: '2x2', icon: Grid, label: 'Grid' },
];

export const LayoutControls: React.FC = () => {
  const layoutMode = useUiStore((state) => state.layoutMode) || '1x1';
  const setLayoutMode = useUiStore((state) => state.setLayoutMode);

  return (
    <div className="flex items-center bg-[#1C2030] rounded border border-[#262B3D] p-0.5">
      {LAYOUTS.map(layout => {
        const Icon = layout.icon;
        return (
          <button
            key={layout.id}
            onClick={() => setLayoutMode(layout.id)}
            title={layout.label}
            className={clsx(
              "p-1.5 rounded transition-colors",
              layoutMode === layout.id 
                ? "bg-[#2962FF] text-white" 
                : "text-[#8F9CAE] hover:text-white hover:bg-[#1E2336]"
            )}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
};
