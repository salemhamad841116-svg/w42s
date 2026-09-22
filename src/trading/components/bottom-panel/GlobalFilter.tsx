import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const GlobalFilter: React.FC = () => {
  const [hideOtherPairs, setHideOtherPairs] = useState(false);
  const [search, setSearch] = useState('');

  const handleCancelAll = () => {
    if (window.confirm('Are you sure you want to cancel all open orders?')) {
      console.log('Cancelling all orders...');
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-[#151924] border-b border-[#262B3D] text-xs">
      <label className="flex items-center gap-2 cursor-pointer text-[#8F9CAE] hover:text-white transition-colors">
        <input
          type="checkbox"
          checked={hideOtherPairs}
          onChange={(e) => setHideOtherPairs(e.target.checked)}
          className="accent-[#2962FF] bg-[#1C2030] border-[#262B3D]"
        />
        Hide Other Pairs
      </label>

      <div className="relative flex items-center">
        <Search size={14} className="absolute left-2 text-[#8F9CAE]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-7 pr-2 py-1 bg-[#1C2030] border border-[#262B3D] text-white rounded text-xs focus:outline-none focus:border-[#2962FF] w-32"
        />
      </div>

      <div className="flex-1" />

      <button
        onClick={handleCancelAll}
        className="text-[#F23645] hover:bg-[#F23645]/10 px-2 py-1 rounded transition-colors"
      >
        Cancel All
      </button>
    </div>
  );
};
