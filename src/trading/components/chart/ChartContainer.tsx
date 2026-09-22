import React from 'react';
import { ChartWorkspaceTabs } from './ChartWorkspaceTabs';
import { ChartWidget } from './ChartWidget';
import { ProOrderPanel } from '../order-panel/ProOrderPanel';
import { ForexHeatmap } from './ForexHeatmap';

export const ChartContainer: React.FC = () => {
  return (
    <div className="flex-1 w-full h-full bg-[#0B0E14] relative flex flex-col overflow-hidden">
      {/* Top Multi-Asset Workspace Tabs */}
      <ChartWorkspaceTabs />

      {/* Main Candlestick Chart Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <ChartWidget />
        <ProOrderPanel />
        <ForexHeatmap />
      </div>
    </div>
  );
};
