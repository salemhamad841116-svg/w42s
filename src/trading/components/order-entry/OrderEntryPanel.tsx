import React from 'react';
import AccountBar from './AccountBar';
import OrderTypeSelector from './OrderTypeSelector';
import PriceInput from './PriceInput';
import AmountInput from './AmountInput';
import PercentageSlider from './PercentageSlider';
import TpSlCollapsible from './TpSlCollapsible';
import RiskSummaryBox from './RiskSummaryBox';
import ExecuteButtons from './ExecuteButtons';
import { useOrderEntryStore } from '../../stores/orderEntryStore';

const OrderEntryPanel = React.memo(() => {
  return (
    <div className="flex flex-col w-full h-full bg-[#0B0E14] border-l border-[#262B3D] text-white overflow-y-auto overflow-x-hidden relative">
      <AccountBar />
      
      <div className="p-3 flex flex-col gap-4">
        <OrderTypeSelector />
        
        <div className="flex flex-col gap-3">
          <PriceInput />
          <AmountInput />
          <PercentageSlider />
        </div>
        
        <TpSlCollapsible />
        <RiskSummaryBox />
      </div>
      
      <div className="mt-auto p-3 bg-[#0B0E14] border-t border-[#262B3D] sticky bottom-0 z-10">
        <ExecuteButtons />
      </div>
    </div>
  );
});

export default OrderEntryPanel;
