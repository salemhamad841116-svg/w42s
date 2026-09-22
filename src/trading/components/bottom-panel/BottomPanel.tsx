import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResizablePanel } from '../layout/ResizablePanel';
import { GlobalFilter } from './GlobalFilter';
import { PositionsTab } from './PositionsTab';
import { OpenOrdersTab } from './OpenOrdersTab';
import { OrderHistoryTab } from './OrderHistoryTab';
import { TradeHistoryTab } from './TradeHistoryTab';
import { BalancesTab } from './BalancesTab';
import { usePositionsStore } from '../../stores/positionsStore';
import { PineEditor } from '../editor/PineEditor';

export const BottomPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('positions');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleOpenTab = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
        setCollapsed(false);
      }
    };
    const handleCloseTab = () => {
      setCollapsed(true);
    };
    window.addEventListener('open_bottom_tab', handleOpenTab);
    window.addEventListener('close_bottom_tab', handleCloseTab);
    return () => {
      window.removeEventListener('open_bottom_tab', handleOpenTab);
      window.removeEventListener('close_bottom_tab', handleCloseTab);
    };
  }, []);

  const positions = usePositionsStore(state => state.positions) || [];
  const openOrders = usePositionsStore(state => state.openOrders) || [];

  const tabs = [
    { id: 'positions', label: 'Positions', count: positions.length },
    { id: 'orders', label: 'Open Orders', count: openOrders.length },
    { id: 'order_history', label: 'Order History', count: null },
    { id: 'trade_history', label: 'Trade History', count: null },
    { id: 'balances', label: 'Balances', count: null },
    { id: 'pine_editor', label: 'Pine Editor', count: null },
  ];

  if (collapsed) {
    return (
      <div className="h-9 w-full bg-[#0B0E14] border-t border-[#262B3D] flex items-center justify-between px-3 select-none shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#8F9CAE]">Terminal</span>
          <div className="flex gap-2 text-xs">
            <span className="text-[#8F9CAE]">Positions: <strong className="text-white">{positions.length}</strong></span>
            <span className="text-[#262B3D]">|</span>
            <span className="text-[#8F9CAE]">Open Orders: <strong className="text-white">{openOrders.length}</strong></span>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1 text-xs text-[#8F9CAE] hover:text-white p-1 rounded hover:bg-[#1E2336] transition-colors"
        >
          <span>Expand</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <ResizablePanel direction="vertical" minSize={140} maxSize={800} defaultSize={300} className="w-full shrink-0 z-10 relative">
      <div className="flex flex-col h-full bg-[#0B0E14] border-t border-[#262B3D]">
        {/* Tab Bar */}
        <div className="flex items-center justify-between px-2 border-b border-[#262B3D] bg-[#0B0E14] h-10 select-none">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer',
                  activeTab === tab.id
                    ? 'border-[#2962FF] text-white bg-[#151924]/50'
                    : 'border-transparent text-[#8F9CAE] hover:text-[#FFFFFF] hover:bg-[#1E2336]/30'
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={clsx(
                    "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]",
                    activeTab === tab.id ? "bg-[#2962FF]/20 text-[#2962FF]" : "bg-[#1E2336] text-[#8F9CAE]"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCollapsed(true)}
            className="text-[#8F9CAE] hover:text-white p-1 rounded hover:bg-[#1E2336] transition-colors mr-2 cursor-pointer"
            title="Collapse panel"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Global Filter */}
        {activeTab !== 'pine_editor' && <GlobalFilter />}

        {/* Tab Content */}
        <div className="flex-1 overflow-auto bg-[#0B0E14] relative h-full">
          {activeTab === 'positions' && <PositionsTab />}
          {activeTab === 'orders' && <OpenOrdersTab />}
          {activeTab === 'order_history' && <OrderHistoryTab />}
          {activeTab === 'trade_history' && <TradeHistoryTab />}
          {activeTab === 'balances' && <BalancesTab />}
          {activeTab === 'pine_editor' && <PineEditor />}
        </div>
      </div>
    </ResizablePanel>
  );
};
