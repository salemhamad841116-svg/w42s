import React, { useEffect, useRef } from 'react';
import { SHAPES_GROUPS, ShapeTool } from './shapesData';

interface ShapesFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToolId: string;
  onSelectTool: (tool: ShapeTool) => void;
  topOffset: number;
}

export const ShapesFlyout: React.FC<ShapesFlyoutProps> = ({
  isOpen,
  onClose,
  selectedToolId,
  onSelectTool,
  topOffset,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 40);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-[270px] bg-[#151924] border border-[#262B3D] rounded-lg shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 notranslate select-none"
      translate="no"
      style={{
        left: 48,
        top: Math.max(8, Math.min(topOffset, (typeof window !== 'undefined' ? window.innerHeight : 600) - 580)),
        maxHeight: 'calc(100vh - 80px)',
      }}
      dir="rtl"
    >
      <div 
        className="overflow-y-auto max-h-[calc(100vh-90px)] py-1.5 custom-scrollbar"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#262B3D #151924' }}
      >
        {SHAPES_GROUPS.map((group, groupIdx) => (
          <div key={group.groupId} className={groupIdx > 0 ? 'mt-2 pt-2 border-t border-[#262B3D]/70' : ''}>
            {/* Section Header matching reference screenshot */}
            <div className="px-3 py-1 flex items-center justify-between" dir="ltr">
              <span className="text-[11px] font-bold text-[#6B788E] tracking-wider uppercase font-mono">
                {group.titleEn}
              </span>
              <span className="text-[10px] text-[#4E586E]">
                {group.titleAr !== group.titleEn ? group.titleAr : ''}
              </span>
            </div>

            {/* Group Items */}
            <div className="px-1 space-y-0.5" dir="rtl">
              {group.items.map((tool) => {
                const isSelected = selectedToolId === tool.id;
                const IconComponent = tool.icon;

                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool)}
                    className={`
                      w-full flex items-center justify-between px-2.5 py-1.5 rounded-md
                      transition-colors duration-150 cursor-pointer text-right group
                      ${isSelected
                        ? 'bg-[#2A2E39] text-white font-medium shadow-inner'
                        : 'text-[#B0B9C8] hover:bg-[#262B3D] hover:text-white'
                      }
                    `}
                    title={`${tool.nameAr} (${tool.nameEn})`}
                  >
                    {/* Tool Name */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{tool.nameAr}</span>
                    </div>

                    {/* Left side: Shortcut indicator and Icon */}
                    <div className="flex items-center gap-2">
                      {tool.shortcut && (
                        <span className="text-[10px] text-[#556075] font-mono group-hover:text-[#8895A7] transition-colors" dir="ltr">
                          {tool.shortcut}
                        </span>
                      )}
                      <div className={`shrink-0 ${isSelected ? 'text-white' : 'text-[#8F9CAE] group-hover:text-white'}`}>
                        <IconComponent size={18} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
