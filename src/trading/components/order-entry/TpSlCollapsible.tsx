import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';

const TpSlCollapsible = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const setTpSl = useOrderEntryStore((state: any) => state.setTpSl || (() => {}));

  return (
    <div className="flex flex-col select-none text-xs">
      <div 
        className="flex items-center gap-1 text-[#8F9CAE] hover:text-white cursor-pointer py-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>Take Profit / Stop Loss</span>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 mt-2">
          {/* TP */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={tpEnabled}
                onChange={(e) => {
                  setTpEnabled(e.target.checked);
                  setTpSl('tp', e.target.checked ? '68000.00' : undefined);
                }}
                className="accent-[#2962FF]"
              />
              <span className="text-[#8F9CAE]">Take Profit</span>
            </div>
            {tpEnabled && (
              <div className="flex items-center h-[32px] bg-[#1C2030] border border-[#262B3D] rounded px-2">
                <input 
                  type="text" 
                  placeholder="Price"
                  className="flex-1 bg-transparent outline-none text-white text-xs"
                  onChange={(e) => setTpSl('tp', e.target.value)}
                />
                <span className="text-[#8F9CAE] text-[10px]">USDT</span>
              </div>
            )}
          </div>
          
          {/* SL */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={slEnabled}
                onChange={(e) => {
                  setSlEnabled(e.target.checked);
                  setTpSl('sl', e.target.checked ? '66000.00' : undefined);
                }}
                className="accent-[#2962FF]"
              />
              <span className="text-[#8F9CAE]">Stop Loss</span>
            </div>
            {slEnabled && (
              <div className="flex items-center h-[32px] bg-[#1C2030] border border-[#262B3D] rounded px-2">
                <input 
                  type="text" 
                  placeholder="Price"
                  className="flex-1 bg-transparent outline-none text-white text-xs"
                  onChange={(e) => setTpSl('sl', e.target.value)}
                />
                <span className="text-[#8F9CAE] text-[10px]">USDT</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TpSlCollapsible;