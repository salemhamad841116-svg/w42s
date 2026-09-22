import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  X,
  Minus,
  Plus,
} from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';
import { usePositionsStore } from '../../stores/positionsStore';
import { wsManager } from '../../services/wsManager';
import { useBrokerStore } from '../../stores/brokerStore';
import { brokerService } from '../../services/brokerService';
import {
  OrderToastContainer,
  showOrderToast,
  clearToastsByType,
} from './OrderToast';
import clsx from 'clsx';

type PanelOrderType = 'market' | 'limit' | 'stop';
type OrderSide = 'BUY' | 'SELL';

export const ProOrderPanel: React.FC = () => {
  const { activeBroker } = useBrokerStore();

  /* ─── Global Panel State ─── */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<PanelOrderType>('market');

  /* ─── Basic Order Inputs ─── */
  const [lotSize, setLotSize] = useState('0.01');
  const [limitPrice, setLimitPrice] = useState('');
  
  // Quick lot controller state
  const [showQuickLot, setShowQuickLot] = useState(false);

  /* ─── Connection State ─── */
  const [wsConnected, setWsConnected] = useState(true);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const openOrders = usePositionsStore((s) => s.openOrders);
  const removeOrder = usePositionsStore((s) => s.removeOrder);

  useEffect(() => {
    const checkConnection = () => {
      const state = (wsManager as any).state;
      const connected = state === 'CONNECTED';
      setWsConnected(connected);
      if (!connected) {
        showOrderToast('disconnected', 'انقطع الاتصال بالوسيط', 'التنفيذ معطّل حتى يعود الاتصال');
      } else {
        clearToastsByType('disconnected');
      }
    };
    const interval = setInterval(checkConnection, 2000);
    checkConnection();
    return () => clearInterval(interval);
  }, []);

  /* ─── Store Data ─── */
  const currentPrice = useMarketStore((s) => s.ticker?.currentPrice ?? 0);
  const currentSymbol = useMarketStore((s) => s.currentSymbol || 'BTC/USDT');

  // Synthetic Bid/Ask for UI
  const spread = currentPrice * 0.0001;
  const buyPrice = currentPrice + spread;
  const sellPrice = currentPrice - spread;

  const formatPrice = (p: number) => {
    if (!p || isNaN(p)) return '0.00';
    return p < 10 ? p.toFixed(4) : p.toFixed(2);
  };

  /* ─── P&L Preview Calculation ─── */
  const pnlPreview = useMemo(() => {
    const lot = parseFloat(lotSize) || 0;
    const price = orderType === 'market' ? currentPrice : (parseFloat(limitPrice) || currentPrice);
    const orderValue = lot * price;
    const fee = orderValue * 0.0005; // 0.05% estimated fee
    return { orderValue, fee, lot, price };
  }, [lotSize, limitPrice, orderType, currentPrice]);

  /* ─── Execute Order ─── */
  const executeOrder = useCallback(() => {
    if (!wsConnected) {
      showOrderToast('disconnected', 'انقطع الاتصال بالوسيط', 'لا يمكن التنفيذ الآن');
      return;
    }

    const lot = parseFloat(lotSize);
    if (!lot || lot <= 0) {
      showOrderToast('order_rejected', 'تم رفض الأمر', 'حجم اللوت غير صالح');
      return;
    }

    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
    if (orderType !== 'market' && (!price || price <= 0)) {
      showOrderToast('order_rejected', 'تم رفض الأمر', 'السعر المحدد غير صالح');
      return;
    }

    const type = orderType === 'market' ? 'MARKET' : 'LIMIT';

    const brokerLabel =
      activeBroker === 'MT5_LIVE'
        ? 'MT5 Live (MetaApi)'
        : activeBroker === 'BINANCE_LIVE'
        ? 'Binance Live Mainnet'
        : activeBroker === 'MT5_DEMO'
        ? 'MT5 Demo'
        : activeBroker === 'BINANCE_TESTNET'
        ? 'Binance Testnet'
        : 'الوسيط';

    showOrderToast('order_sent', `جاري إرسال الأمر إلى ${brokerLabel}...`);

    brokerService.executeOrder({
      symbol: currentSymbol,
      side,
      type,
      amount: lot,
      price: price || currentPrice,
    }).then((res) => {
      if (res.success) {
        if (type === 'MARKET') {
          showOrderToast('order_filled', `تم تنفيذ ${side === 'BUY' ? 'الشراء' : 'البيع'} بنجاح (${res.broker})`, `Ticket: ${res.ticketId} | ${lot} Lot @ ${res.executedPrice.toFixed(2)}`);
        } else {
          showOrderToast('order_pending', `أمر ${side === 'BUY' ? 'شراء' : 'بيع'} معلق (${res.broker})`, `Ticket: ${res.ticketId} | ${lot} Lot @ ${res.executedPrice.toFixed(2)}`);
        }
        setIsPanelOpen(false); // Close panel on success
      } else {
        showOrderToast('order_rejected', 'تم رفض الأمر من الوسيط', res.message);
      }
    }).catch((err) => {
      showOrderToast('order_rejected', 'خطأ في التنفيذ', err.message);
    });
  }, [wsConnected, lotSize, limitPrice, orderType, currentPrice, currentSymbol, activeBroker, side]);

  /* ─── Close All ─── */
  const closeAll = useCallback(() => {
    const allOrders = [...openOrders];
    allOrders.forEach((o) => removeOrder(o.id));
    showOrderToast('order_filled', `🚨 تم إغلاق ${allOrders.length} أمر وصفقة بالكامل`);
    setShowCloseConfirm(false);
  }, [openOrders, removeOrder]);

  /* ─── Lot Size Stepper ─── */
  const stepLot = (delta: number) => {
    const val = Math.max(0.01, (parseFloat(lotSize) || 0) + delta);
    setLotSize(val.toFixed(2));
  };

  const openPanel = (selectedSide: OrderSide) => {
    setSide(selectedSide);
    setIsPanelOpen(true);
    setShowQuickLot(false);
  };

  return (
    <>
      <OrderToastContainer />
      
      {/* ─── Sleek Horizontal BUY / SELL Strip (Wider, Not Tall) ─── */}
      <div 
        className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-xl border border-black/10 shadow-md rounded-xl p-1 flex items-center gap-1.5 select-none h-9" 
        dir="ltr"
      >
        {/* BUY Button: Wider & Low Height */}
        <button 
          onClick={() => openPanel('BUY')} 
          className="h-7 min-w-[115px] px-3.5 rounded-lg bg-[#00C087]/12 hover:bg-[#00C087]/22 border border-[#00C087]/30 text-[#00C087] flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] group"
          title="شراء (BUY Order)"
        >
          <span className="text-[11px] font-black uppercase tracking-wider leading-none">BUY</span>
          <span className="text-xs font-black font-mono tabular-nums leading-none text-[#00A372] group-hover:text-[#008A60]">
            {formatPrice(buyPrice)}
          </span>
        </button>

        {/* SELL Button: Wider & Low Height */}
        <button 
          onClick={() => openPanel('SELL')} 
          className="h-7 min-w-[115px] px-3.5 rounded-lg bg-[#F23645]/12 hover:bg-[#F23645]/22 border border-[#F23645]/30 text-[#F23645] flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98] group"
          title="بيع (SELL Order)"
        >
          <span className="text-[11px] font-black uppercase tracking-wider leading-none">SELL</span>
          <span className="text-xs font-black font-mono tabular-nums leading-none text-[#D92B3A] group-hover:text-[#B51E2C]">
            {formatPrice(sellPrice)}
          </span>
        </button>
      </div>

      {/* ─── Premium White Glass Order Panel ─── */}
      {isPanelOpen && (
        <div 
          className="absolute top-13 left-3 z-40 w-[290px] bg-white/95 backdrop-blur-2xl border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2" 
          dir="ltr"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 bg-black/[0.03]">
            <div>
              <h2 className="text-[15px] font-[800] text-black leading-tight tracking-tight">{currentSymbol}</h2>
              <p className="text-[11px] font-[700] text-gray-500 font-mono tabular-nums">Current {currentPrice.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setIsPanelOpen(false)} 
              className="p-1.5 hover:bg-black/10 rounded-md transition-colors cursor-pointer text-gray-500 hover:text-black"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* BUY/SELL Toggle */}
            <div className="flex bg-black-[0.03] p-1 rounded-xl border border-black/5">
               <button 
                 onClick={() => setSide('BUY')} 
                 className={clsx("flex-1 py-1.5 text-xs font-[800] tracking-wide rounded-lg transition-all shadow-sm", side === 'BUY' ? "bg-white text-[#00C087] shadow-[0_2px_8px_rgba(0,192,135,0.2)] border border-[#00C087]/20" : "text-gray-500 hover:text-black bg-transparent border border-transparent")}
               >
                 BUY
               </button>
               <button 
                 onClick={() => setSide('SELL')} 
                 className={clsx("flex-1 py-1.5 text-xs font-[800] tracking-wide rounded-lg transition-all shadow-sm", side === 'SELL' ? "bg-white text-[#F23645] shadow-[0_2px_8px_rgba(242,54,69,0.2)] border border-[#F23645]/20" : "text-gray-500 hover:text-black bg-transparent border border-transparent")}
               >
                 SELL
               </button>
            </div>

            {/* Order Type */}
            <div>
               <label className="block text-[10px] font-[800] text-gray-400 uppercase tracking-widest mb-1.5">Order Type</label>
               <div className="relative">
                 <select 
                   value={orderType}
                   onChange={(e) => setOrderType(e.target.value as PanelOrderType)}
                   className="w-full bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm font-[700] text-black focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer transition-all"
                 >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                    <option value="stop">Stop Order</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
            </div>

            {/* Lot Size */}
            <div>
               <label className="block text-[10px] font-[800] text-gray-400 uppercase tracking-widest mb-1.5">Lot Size</label>
               <div className="flex items-center gap-2 p-1 border border-black/10 rounded-xl bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500/50 transition-all">
                  <button onClick={() => stepLot(-0.01)} className="w-8 h-8 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-lg text-black transition-colors"><Minus size={14} strokeWidth={2.5}/></button>
                  <input 
                    type="number" 
                    value={lotSize} 
                    onChange={e => setLotSize(e.target.value)} 
                    className="flex-1 bg-transparent border-none text-center text-[15px] font-[700] text-black focus:outline-none font-mono tabular-nums" 
                  />
                  <button onClick={() => stepLot(0.01)} className="w-8 h-8 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-lg text-black transition-colors"><Plus size={14} strokeWidth={2.5}/></button>
               </div>
            </div>

            {/* Entry Price (if limit/stop) */}
            {orderType !== 'market' && (
               <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                 <label className="block text-[10px] font-[800] text-gray-400 uppercase tracking-widest mb-1.5">Entry Price</label>
                 <input 
                   type="number" 
                   value={limitPrice} 
                   onChange={e => setLimitPrice(e.target.value)} 
                   placeholder={currentPrice.toFixed(2)} 
                   className="w-full bg-white border border-black/10 rounded-xl px-3 py-2.5 text-[15px] font-[700] text-black focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tabular-nums placeholder-gray-300" 
                 />
               </div>
            )}

            {/* TP / SL */}
            <div className="grid grid-cols-2 gap-3 pt-1">
               <div>
                 <label className="block text-[9px] font-[800] text-gray-400 uppercase tracking-widest mb-1.5">Take Profit</label>
                 <input 
                   type="number" 
                   placeholder="Optional" 
                   className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-[700] text-black focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tabular-nums placeholder-gray-300" 
                 />
               </div>
               <div>
                 <label className="block text-[9px] font-[800] text-gray-400 uppercase tracking-widest mb-1.5">Stop Loss</label>
                 <input 
                   type="number" 
                   placeholder="Optional" 
                   className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-[700] text-black focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tabular-nums placeholder-gray-300" 
                 />
               </div>
            </div>
          </div>

          {/* Margin / Risk / Est P&L */}
          <div className="px-4 py-3 bg-black/[0.02] border-t border-black/5 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
               <span className="text-gray-500 font-[700]">Est. Margin</span>
               <span className="text-black font-[800] font-mono tabular-nums">${(pnlPreview.orderValue / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
               <span className="text-gray-500 font-[700]">Est. Fee (0.05%)</span>
               <span className="text-black font-[800] font-mono tabular-nums">${pnlPreview.fee.toFixed(2)}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="p-4 pt-3 bg-white">
             <button 
               onClick={executeOrder} 
               className={clsx(
                 "w-full py-3.5 rounded-xl text-white text-[13px] font-[900] uppercase tracking-widest transition-all shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] active:scale-[0.98]", 
                 side === 'BUY' ? "bg-[#00C087] hover:bg-[#00A372]" : "bg-[#F23645] hover:bg-[#D92B3A]"
               )}
             >
                Confirm {side}
             </button>
             
             {/* Emergency Close All */}
             <div className="mt-3">
               {!showCloseConfirm ? (
                 <button 
                   onClick={() => setShowCloseConfirm(true)}
                   className="w-full py-2.5 rounded-xl text-xs font-[800] text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors uppercase tracking-widest"
                 >
                   Emergency Close All
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button 
                     onClick={closeAll}
                     className="flex-1 py-2.5 rounded-xl text-xs font-[800] text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 uppercase tracking-widest"
                   >
                     Confirm Close
                   </button>
                   <button 
                     onClick={() => setShowCloseConfirm(false)}
                     className="flex-1 py-2.5 rounded-xl text-xs font-[800] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-widest"
                   >
                     Cancel
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </>
  );
};
