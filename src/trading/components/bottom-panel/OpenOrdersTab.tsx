import React from 'react';
import { Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { usePositionsStore } from '../../stores/positionsStore';
import { orderApi } from '../../services/orderApi';

export const OpenOrdersTab: React.FC = () => {
  const openOrders = usePositionsStore(state => state.openOrders) || [];
  const removeOrder = usePositionsStore(state => state.removeOrder);

  const handleCancel = (id: string) => {
    removeOrder(id);
    orderApi.cancelOrder(id);
  };

  return (
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
          <th className="px-4 py-2 font-normal text-right">TIF</th>
          <th className="px-4 py-2 font-normal text-right">Status</th>
          <th className="px-4 py-2 font-normal text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="text-xs font-mono text-white">
        {openOrders.map(order => {
          const isBuy = order.side === 'BUY' || String(order.side).toUpperCase() === 'BUY';
          const totalVal = (Number(order.price) * Number(order.amount)).toFixed(2);
          const timeFormatted = order.createdAt ? format(new Date(order.createdAt), 'MM-dd HH:mm:ss') : '--:--';

          return (
            <tr key={order.id} className="hover:bg-[#1E2336] border-b border-[#1E2336] group">
              <td className="px-4 py-2 text-[#8F9CAE]">
                {timeFormatted}
              </td>
              <td className="px-4 py-2 font-semibold">{order.symbol}</td>
              <td className="px-4 py-2">{order.type}</td>
              <td className={clsx("px-4 py-2 font-semibold", isBuy ? "text-[#00C087]" : "text-[#F23645]")}>
                {order.side}
              </td>
              <td className="px-4 py-2 text-right">{Number(order.price).toFixed(2)}</td>
              <td className="px-4 py-2 text-right">{Number(order.amount).toFixed(4)}</td>
              <td className="px-4 py-2 text-right">{order.filled || 0}%</td>
              <td className="px-4 py-2 text-right">{totalVal}</td>
              <td className="px-4 py-2 text-right text-[#8F9CAE]">{order.timeInForce || 'GTC'}</td>
              <td className="px-4 py-2 text-right text-[#F7931A]">{order.status || 'NEW'}</td>
              <td className="px-4 py-2 text-center flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleCancel(order.id)}
                  className="text-[#8F9CAE] hover:text-[#F23645] transition-colors cursor-pointer p-1 rounded hover:bg-[#F23645]/10" 
                  title="Cancel Order"
                >
                  <X size={14} />
                </button>
              </td>
            </tr>
          );
        })}
        {openOrders.length === 0 && (
          <tr>
            <td colSpan={11} className="text-center py-8 text-[#5E6A7E]">
              No open orders
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
