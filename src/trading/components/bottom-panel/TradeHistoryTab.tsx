import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { orderApi } from '../../services/orderApi';

export const TradeHistoryTab: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    orderApi.fetchTradeHistory().then(setTrades);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-4 py-2 bg-[#0B0E14] border-b border-[#262B3D] text-xs text-[#8F9CAE]">
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'Custom'].map((period) => (
            <button
              key={period}
              className={clsx('px-2 py-1 rounded', period === '24h' ? 'bg-[#1C2030] text-white' : 'hover:bg-[#1C2030]')}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-[#262B3D]" />
        <div className="flex gap-2">
          {['All', 'Buy', 'Sell'].map((side) => (
            <button
              key={side}
              className={clsx('px-2 py-1 rounded', side === 'All' ? 'bg-[#1C2030] text-white' : 'hover:bg-[#1C2030]')}
            >
              {side}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0B0E14] text-[#5E6A7E] text-xs z-10 border-b border-[#262B3D]">
            <tr>
              <th className="px-4 py-2 font-normal whitespace-nowrap">Time</th>
              <th className="px-4 py-2 font-normal">Pair</th>
              <th className="px-4 py-2 font-normal">Side</th>
              <th className="px-4 py-2 font-normal text-right">Price</th>
              <th className="px-4 py-2 font-normal text-right">Amount</th>
              <th className="px-4 py-2 font-normal text-right">Fee</th>
              <th className="px-4 py-2 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2030] text-xs font-mono">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#5E6A7E]">
                  No trade history yet
                </td>
              </tr>
            ) : (
              trades.map((trade, idx) => (
                <tr key={idx} className="hover:bg-[#151924]/60 transition-colors">
                  <td className="px-4 py-2 text-[#8F9CAE]">
                    {trade.time ? format(new Date(trade.time), 'yyyy-MM-dd HH:mm:ss') : '—'}
                  </td>
                  <td className="px-4 py-2 text-white font-medium">{trade.symbol || 'BTC/USDT'}</td>
                  <td className={clsx('px-4 py-2 font-semibold', trade.side === 'BUY' ? 'text-[#00C087]' : 'text-[#F23645]')}>
                    {trade.side}
                  </td>
                  <td className="px-4 py-2 text-right text-white">{trade.price?.toFixed(2) ?? '0.00'}</td>
                  <td className="px-4 py-2 text-right text-white">{trade.amount?.toFixed(4) ?? '0.0000'}</td>
                  <td className="px-4 py-2 text-right text-[#8F9CAE]">${trade.fee?.toFixed(2) ?? '0.00'}</td>
                  <td className="px-4 py-2 text-right text-white">
                    ${((trade.price || 0) * (trade.amount || 0)).toFixed(2)}
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