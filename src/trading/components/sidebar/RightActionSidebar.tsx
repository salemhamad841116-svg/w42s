import React, { useState, useEffect, useRef } from 'react';
import { Plus, Code, Bell } from 'lucide-react';
import { AddSymbolPanel } from './AddSymbolPanel';
import { PineScriptManagerPopover } from './PineScriptManagerPopover';
import { AlertCreationPanel } from './AlertCreationPanel';

type RightSidebarPanel = 'addSymbol' | 'pine' | 'alerts' | null;

export const RightActionSidebar: React.FC = () => {
  const [activePanel, setActivePanel] = useState<RightSidebarPanel>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close active panel on click outside or Escape key
  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePanel(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setActivePanel(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePanel]);

  const handleToggle = (panel: 'addSymbol' | 'pine' | 'alerts') => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div
      ref={sidebarRef}
      className="w-11 shrink-0 h-full bg-[#151924] border-l border-[#262B3D] flex flex-col items-center py-2.5 gap-2 relative z-30 select-none notranslate"
      dir="ltr"
    >
      {/* 1. "+" Button: Add Symbol */}
      <button
        onClick={() => handleToggle('addSymbol')}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          activePanel === 'addSymbol'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Add Symbol (+)"
      >
        <Plus size={18} strokeWidth={2.4} />
      </button>

      <button
        onClick={() => {
          if (activePanel === 'pine') {
            setActivePanel(null);
            window.dispatchEvent(new CustomEvent('close_bottom_tab'));
          } else {
            setActivePanel('pine');
            window.dispatchEvent(new CustomEvent('open_bottom_tab', { detail: 'pine_editor' }));
          }
        }}
        className={`relative w-8 h-10 flex flex-col items-center justify-center rounded-lg transition-all duration-150 cursor-pointer gap-0.5 ${
          activePanel === 'pine'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Pine Script™ Manager"
      >
        <Code size={15} strokeWidth={2.2} />
        <span className="text-[9px] font-bold tracking-tighter leading-none">
          Pine
        </span>
      </button>

      {/* 3. "Alerts" Button: Alert Creation Panel */}
      <button
        onClick={() => handleToggle('alerts')}
        className={`relative w-8 h-10 flex flex-col items-center justify-center rounded-lg transition-all duration-150 cursor-pointer gap-0.5 ${
          activePanel === 'alerts'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Create Alert"
      >
        <Bell size={15} strokeWidth={2} />
        <span className="text-[9px] font-bold tracking-tighter leading-none">
          Alerts
        </span>
      </button>

      {/* Floating Popover Panels (Anchored to the left of the right sidebar) */}
      {activePanel && (
        <div
          ref={panelRef}
          className="absolute right-12 top-2 z-50 pointer-events-auto"
        >
          {activePanel === 'addSymbol' && (
            <AddSymbolPanel onClose={() => setActivePanel(null)} />
          )}

          {activePanel === 'alerts' && (
            <AlertCreationPanel onClose={() => setActivePanel(null)} />
          )}
        </div>
      )}
    </div>
  );
};
