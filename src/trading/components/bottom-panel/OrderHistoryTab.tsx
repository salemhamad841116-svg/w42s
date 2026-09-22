import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { orderApi } from '../../services/orderApi';

export const OrderHistoryTab: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    orderApi.fetchOrderHistory().then(setHistory);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-4 py-2 bg-[#0B0E14] border-b border-[#262B3D] text-xs text-[#8F9CAE]">
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'Custom'].map(period => (
            <button key={period} className={clsx("px-2 py-1 rounded", period === '24h' ? "bg-[#1C2030] text-white" : "hover:bg-[#1C2030]")}>
              {period}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-[#262B3D]" />
        <div className="flex gap-2">
          {['All', 'Buy', 'Sell'].map(side => (
            <button key={side} className={clsx("px-2 py-1 rounded", side === 'All' ? "bg-[#1C2030] text-white" : "hover:bg-[#1C2030]")}>
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
              <th className="px-4 py-2 font-normal">Type</th>
              <th className="px-4 py-2 font-normal">Side</th>
              <th className="px-4 py-2 font-normal text-right">Price</th>
              <th className="px-4 py-2 font-normal text-right">Amount</th>
              <th className="px-4 py-2 font-normal text-right">Filled</th>
              <th className="px-4 py-2 font-normal text-right">Total</th>
              <th className="px-4 py-2 font-normal text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-white">
            {history.map(order => {
              const isBuy = order.side === 'Buy';
              const statusColor = {
                Filled: 'text-[#00C087]',
                Cancelled: 'text-[#8F9CAE]',
                Expired: 'text-[#F7931A]',
                Partial: 'text-[#F7931A]',
              }[order.status as string] || 'text-white';

              return (
                <tr key={order.id} className="hover:bg-[#1E2336] border-b border-[#1E2336]">
                  <td className="px-4 py-2 text-[#8F9CAE]">
                    {format(order.time, 'MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-2 font-semibold">{order.pair}</td>
                  <td className="px-4 py-2">{order.type}</td>
                  <td className={clsx("px-4 py-2", isBuy ? "text-[#00C087]" : "text-[#F23645]")}>
                    {order.side}
                  </td>
                  <td className="px-4 py-2 text-right">{order.price}</td>
                  <td className="px-4 py-2 text-right">{order.amount}</td>
                  <td className="px-4 py-2 text-right">{order.filled}</td>
                  <td className="px-4 py-2 text-right">{order.total}</td>
                  <td className={clsx("px-4 py-2 text-right", statusColor)}>{order.status}</td>
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#5E6A7E]">
                  No order history
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
