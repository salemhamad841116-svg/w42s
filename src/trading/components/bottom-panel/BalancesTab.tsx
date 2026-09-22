import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/orderApi';
import clsx from 'clsx';

export const BalancesTab: React.FC = () => {
  const [balances, setBalances] = useState<any[]>([]);

  useEffect(() => {
    orderApi.fetchBalances().then(setBalances);
  }, []);

  const totalUsd = balances.reduce((acc, curr) => acc + (parseFloat(curr.usdValue) || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-[#0B0E14] border-b border-[#262B3D] text-xs text-[#8F9CAE] flex items-center justify-between">
        <span>Total Equity: <strong className="text-white font-mono">${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0B0E14] text-[#5E6A7E] text-xs z-10 border-b border-[#262B3D]">
            <tr>
              <th className="px-4 py-2 font-normal whitespace-nowrap">Asset</th>
              <th className="px-4 py-2 font-normal text-right">Available</th>
              <th className="px-4 py-2 font-normal text-right">Locked</th>
              <th className="px-4 py-2 font-normal text-right">Total</th>
              <th className="px-4 py-2 font-normal text-right">Equivalent (USD)</th>
              <th className="px-4 py-2 font-normal text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {balances.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#5E6A7E]">
                  No balance records
                </td>
              </tr>
            ) : (
              balances.map((balance) => (
                <tr key={balance.asset} className="hover:bg-[#1E2336] border-b border-[#1E2336] group">
                  <td className="px-4 py-2 font-bold text-white">{balance.asset}</td>
                  <td className="px-4 py-2 text-right text-white">{balance.available}</td>
                  <td className="px-4 py-2 text-right text-[#F7931A]">{balance.locked}</td>
                  <td className="px-4 py-2 text-right text-white">{balance.total}</td>
                  <td className="px-4 py-2 text-right text-[#8F9CAE]">${balance.usdValue}</td>
                  <td className="px-4 py-2 text-center font-sans">
                    <button className="text-[#2962FF] hover:text-[#2962FF]/80 transition-colors mr-3 cursor-pointer">
                      Deposit
                    </button>
                    <button className="text-[#2962FF] hover:text-[#2962FF]/80 transition-colors cursor-pointer">
                      Transfer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};