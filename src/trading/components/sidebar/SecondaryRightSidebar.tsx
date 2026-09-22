import React, { useState, useEffect, useRef } from 'react';
import { Brain, Settings, LineChart, Gauge } from 'lucide-react';
import { useUSEStore } from '../../stores/useUSEStore';
import { MarketStrengthPopover } from '../header/MarketStrengthPopover';

interface SecondaryRightSidebarProps {
  onOpenIndicators: () => void;
  // If we had a chart settings open function, we'd pass it here. For now just placeholder.
  onOpenChartSettings?: () => void;
}

type PanelState = 'use' | 'chart-properties' | 'indicators' | 'currency-strength' | null;

export const SecondaryRightSidebar: React.FC<SecondaryRightSidebarProps> = ({
  onOpenIndicators,
  onOpenChartSettings
}) => {
  const [activePanel, setActivePanel] = useState<PanelState>(null);
  const openUSE = useUSEStore((s) => s.openWorkspace);
  const isUSEOpen = useUSEStore((s) => s.isOpen); // Need to sync active state
  
  // We'll manage MarketStrengthPopover visibility locally here
  const [isStrengthOpen, setIsStrengthOpen] = useState(false);

  const handleToggle = (panel: PanelState) => {
    if (activePanel === panel) {
      setActivePanel(null);
      
      // Close specific panels
      if (panel === 'currency-strength') setIsStrengthOpen(false);
      // For USE, maybe we don't close it directly if it's a modal, but we can try
      if (panel === 'use') useUSEStore.getState().closeWorkspace();
      return;
    }
    
    setActivePanel(panel);
    
    // Reset others
    setIsStrengthOpen(false);
    
    // Open specific panel
    if (panel === 'use') {
      openUSE();
    } else if (panel === 'indicators') {
      onOpenIndicators();
      // Reset active panel immediately since it's a modal, or keep it active while modal is open
      setTimeout(() => setActivePanel(null), 200); 
    } else if (panel === 'currency-strength') {
      setIsStrengthOpen(true);
    } else if (panel === 'chart-properties') {
      if (onOpenChartSettings) onOpenChartSettings();
      setTimeout(() => setActivePanel(null), 200);
    }
  };

  // Sync USE state
  useEffect(() => {
    if (!isUSEOpen && activePanel === 'use') {
      setActivePanel(null);
    } else if (isUSEOpen && activePanel !== 'use') {
      setActivePanel('use');
    }
  }, [isUSEOpen]);

  // Sync Strength state
  useEffect(() => {
    if (!isStrengthOpen && activePanel === 'currency-strength') {
      setActivePanel(null);
    }
  }, [isStrengthOpen]);

  return (
    <div
      className="w-11 shrink-0 h-full bg-[#151924] border-l border-[#262B3D] flex flex-col items-center py-2.5 gap-2 relative z-30 select-none notranslate"
      dir="ltr"
    >
      {/* 1. Universal Strategy Engine */}
      <button
        onClick={() => handleToggle('use')}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          activePanel === 'use'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Universal Strategy Engine (USE)"
      >
        <Brain size={18} strokeWidth={2.4} className={activePanel === 'use' ? 'text-white' : 'text-purple-500'} />
      </button>

      {/* 2. Chart Properties */}
      <button
        onClick={() => handleToggle('chart-properties')}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          activePanel === 'chart-properties'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Chart Properties"
      >
        <Settings size={18} strokeWidth={2.4} className={activePanel === 'chart-properties' ? 'text-white' : 'text-gray-400'} />
      </button>

      {/* 3. Indicators */}
      <button
        onClick={() => handleToggle('indicators')}
        className={`relative w-8 h-8 flex flex-col items-center justify-center rounded-lg transition-all duration-150 cursor-pointer gap-0.5 ${
          activePanel === 'indicators'
            ? 'bg-[#2962FF] text-white shadow-md'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
        }`}
        title="Indicators"
      >
        <LineChart size={18} strokeWidth={2.2} className={activePanel === 'indicators' ? 'text-white' : 'text-blue-500'} />
      </button>

      {/* 4. Currency Strength Meter */}
      <div className="relative">
        <button
          onClick={() => handleToggle('currency-strength')}
          className={`relative w-8 h-8 flex flex-col items-center justify-center rounded-lg transition-all duration-150 cursor-pointer gap-0.5 ${
            activePanel === 'currency-strength'
              ? 'bg-[#2962FF] text-white shadow-md'
              : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white border border-transparent'
          }`}
          title="Currency Strength Meter"
        >
          <Gauge size={18} strokeWidth={2} className={activePanel === 'currency-strength' ? 'text-white' : 'text-emerald-500'} />
        </button>
        
        {/* CSM Popover renders itself with absolute right-12 top-0 relative to this button */}
        <MarketStrengthPopover isOpen={activePanel === 'currency-strength'} onClose={() => setActivePanel(null)} />
      </div>
    </div>
  );
};
