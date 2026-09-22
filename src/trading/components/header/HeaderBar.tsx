import React, { useState } from 'react';
import { AssetSelector } from './AssetSelector';
import { MarketTicker } from './MarketTicker';
import { TimeframeSelector } from './TimeframeSelector';
import { DesktopMarketBar } from './DesktopMarketBar';
import { ChartTypeSelector } from './ChartTypeSelector';
import { IndicatorMenu } from './IndicatorMenu';
import { ConnectionStatus } from './ConnectionStatus';
import { BrokerConnectionStatus } from './BrokerConnectionStatus';
import { LayoutControls } from './LayoutControls';
import { USEWorkspace } from '../../../components/use/USEWorkspace';
import { useUSEStore } from '../../stores/useUSEStore';
import { Brain, LineChart, Gauge } from 'lucide-react';
import { MarketStrengthPopover } from './MarketStrengthPopover';

interface HeaderBarProps {
  onOpenIndicators?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenIndicators }) => {
  const openUSE = useUSEStore((s) => s.openWorkspace);
  const [isStrengthOpen, setIsStrengthOpen] = useState(false);

  return (
    <div className="w-full h-14 bg-white/90 backdrop-blur-xl border-b border-black/10 flex items-center justify-between px-4 fixed top-0 z-50">
      <div className="flex items-center gap-3 h-full">
        {/* Mobile View: Dedicated Symbol & Timeframe Selectors */}
        <div className="md:hidden flex items-center gap-1.5">
          <AssetSelector isLight={true} />
          <TimeframeSelector isLight={true} />
        </div>
        {/* Desktop View: Full Market Bar with [Symbol] [Timeframe] + Live Metrics */}
        <div className="hidden md:block"><DesktopMarketBar /></div>
      </div>
      
      <div className="flex items-center gap-2 h-full">
        <ChartTypeSelector />
        <IndicatorMenu />
      </div>

      <div className="flex items-center gap-3 h-full">
        <BrokerConnectionStatus />
        <LayoutControls />
        <ConnectionStatus />
      </div>

      <USEWorkspace />
    </div>
  );
};

