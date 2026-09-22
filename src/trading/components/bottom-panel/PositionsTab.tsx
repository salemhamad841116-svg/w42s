import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { usePositionsStore } from '../../stores/positionsStore';
import { PartialCloseModal } from '../chart/PartialCloseModal';
import { PositionData } from '../../types';
import { Scissors, XCircle } from 'lucide-react';

export const PositionsTab: React.FC = () => {
  const positions = usePositionsStore(state => state.positions) || [];
  const setPositions = usePositionsStore(state => state.setPositions);

  const [partialClosePos, setPartialClosePos] = useState<PositionData | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    position: PositionData;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu]);

  const handleClose = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
    setContextMenu(null);
  };

  const handleRowContextMenu = (e: React.MouseEvent, pos: PositionData) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      position: pos,
    });
  };

  return (
    <>
      <table className="w-full text-left border-collapse select-none">
        <thead className="sticky top-0 bg-[#0B0E14] text-[#5E6A7E] text-xs z-10 border-b border-[#262B3D]">
          <tr>
            <th className="px-4 py-2 font-normal whitespace-nowrap">Symbol & Leverage</th>
            <th className="px-4 py-2 font-normal text-right">Size</th>
            <th className="px-4 py-2 font-normal text-right">Entry Price</th>
            <th className="px-4 py-2 font-normal text-right">Mark Price</th>
            <th className="px-4 py-2 font-normal text-right">Liq. Price</th>
            <th className="px-4 py-2 font-normal text-right">Margin</th>
            <th className="px-4 py-2 font-normal text-right">PnL (ROE%)</th>
            <th className="px-4 py-2 font-normal text-right">TP / SL</th>
            <th className="px-4 py-2 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-xs font-mono">
          {positions.map((pos) => {
            const isLong = pos.side === 'BUY' || String(pos.side).toUpperCase() === 'LONG';
            const pnlNum = Number(pos.unrealizedPnl);
            const isProfit = pnlNum >= 0;

            return (
              <tr 
                key={pos.id} 
                onContextMenu={(e) => handleRowContextMenu(e, pos)}
                className="hover:bg-[#1E2336] border-b border-[#1E2336] group transition-colors cursor-context-menu"
                title="انقر بالزر الأيمن لخيارات الإغلاق السريع أو الجزئي"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx("px-1.5 py-0.5 rounded text-[10px] font-bold", isLong ? "bg-[#00C087]/15 text-[#00C087]" : "bg-[#F23645]/15 text-[#F23645]")}>
                      {isLong ? 'LONG' : 'SHORT'}
                    </span>
                    <span className="font-semibold text-white">{pos.symbol}</span>
                    <span className="text-[#8F9CAE]">{pos.tradingMode?.replace('_', ' ')} {pos.leverage}x</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-white font-bold">{pos.size}</td>
                <td className="px-4 py-2 text-right text-white">{Number(pos.entryPrice).toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-[#F7931A]">{Number(pos.markPrice).toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-[#F23645]">{Number(pos.liquidationPrice).toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-white">{Number(pos.margin).toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold">
                  <div className={clsx(isProfit ? "text-[#00C087]" : "text-[#F23645]")}>
                    {isProfit ? '+' : ''}{pnlNum.toFixed(2)} ({isProfit ? '+' : ''}{Number(pos.roePct).toFixed(2)}%)
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-[#8F9CAE]">
                  {pos.takeProfitPrice ? Number(pos.takeProfitPrice).toFixed(2) : '-'} / {pos.stopLossPrice ? Number(pos.stopLossPrice).toFixed(2) : '-'}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Partial Close Button */}
                    <button 
                      onClick={() => setPartialClosePos(pos)}
                      className="text-[10px] px-2 py-1 bg-[#2962FF]/15 hover:bg-[#2962FF] hover:text-white text-[#5C93FF] rounded transition-colors flex items-center gap-1 cursor-pointer font-sans font-bold"
                      title="إغلاق جزئي للصفقة (Partial Close)"
                    >
                      <Scissors size={11} />
                      <span>إغلاق جزئي...</span>
                    </button>

                    {/* Market Full Close Button */}
                    <button 
                      onClick={() => handleClose(pos.id)}
                      className="text-[10px] px-2 py-1 bg-[#F23645]/15 hover:bg-[#F23645] hover:text-white text-[#F23645] rounded transition-colors cursor-pointer font-sans font-bold"
                      title="إغلاق الصفقة بالكامل بسعر السوق"
                    >
                      إغلاق كامل
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {positions.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-8 text-[#5E6A7E]">
                No open positions
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Row Right-Click Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-[#1E222D] border border-[#2A2E39] rounded-xl shadow-2xl py-1.5 w-56 text-xs text-white notranslate select-none animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 235),
            top: Math.min(contextMenu.y, window.innerHeight - 120),
          }}
          dir="rtl"
        >
          <div className="px-3 py-1.5 text-[11px] font-bold text-[#787B86] border-b border-[#2A2E39] flex items-center justify-between">
            <span>إجراءات الصفقة: {contextMenu.position.symbol}</span>
            <span className="font-mono">{contextMenu.position.size} Lot</span>
          </div>

          <button
            onClick={() => {
              setPartialClosePos(contextMenu.position);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#2A2E39] text-[#5C93FF] hover:text-white transition-colors cursor-pointer text-right font-medium"
          >
            <Scissors size={14} className="shrink-0" />
            <span>إغلاق جزئي... (Partial Close)</span>
          </button>

          <button
            onClick={() => handleClose(contextMenu.position.id)}
            className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#F23645]/20 text-[#F23645] transition-colors cursor-pointer text-right font-medium"
          >
            <XCircle size={14} className="shrink-0" />
            <span>إغلاق كامل بالسوق (Market Close)</span>
          </button>
        </div>
      )}

      {/* Partial Close Modal */}
      <PartialCloseModal
        isOpen={Boolean(partialClosePos)}
        onClose={() => setPartialClosePos(null)}
        position={partialClosePos}
      />
    </>
  );
};
