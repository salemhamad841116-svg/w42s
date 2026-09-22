import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';
import { usePositionsStore } from '../../stores/positionsStore';
import { useMarketStore } from '../../stores/marketStore';
import { useBrokerStore } from '../../stores/brokerStore';
import { brokerService } from '../../services/brokerService';

export interface ChartOrderTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  initialSide: 'BUY' | 'SELL';
  initialType: 'LIMIT' | 'STOP' | 'MARKET';
  initialPrice: number;
  marketPrice?: number;
  onOrderConfirmed?: (order: any) => void;
}

export const ChartOrderTicketModal: React.FC<ChartOrderTicketModalProps> = ({
  isOpen,
  onClose,
  symbol,
  initialSide,
  initialType,
  initialPrice,
  marketPrice: propMarketPrice,
  onOrderConfirmed,
}) => {
  const currentMarketPrice = useMarketStore((s) => s.ticker?.currentPrice ?? propMarketPrice ?? initialPrice);
  const addOptimisticOrder = usePositionsStore((s) => s.addOptimisticOrder);
  const activeBroker = useBrokerStore((s) => s.activeBroker);

  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);
  const [orderType, setOrderType] = useState<'LIMIT' | 'STOP' | 'MARKET'>(initialType);
  const [price, setPrice] = useState<string>(initialPrice.toString());
  const [lotSize, setLotSize] = useState<string>('0.01');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format price helper
  const formatPrice = (p: number) => {
    if (p < 2) return p.toFixed(5);
    if (p < 50) return p.toFixed(4);
    if (p < 1000) return p.toFixed(2);
    return p.toFixed(2);
  };

  useEffect(() => {
    if (isOpen) {
      setSide(initialSide);
      setOrderType(initialType);
      setPrice(initialPrice.toString());
      setLotSize('0.01');

      // Auto-calculate suggested TP and SL based on side and price
      const p = initialPrice;
      const isLong = initialSide === 'BUY';
      const delta = p * 0.008; // 0.8% default buffer
      setTakeProfit(formatPrice(isLong ? p + delta * 2 : p - delta * 2));
      setStopLoss(formatPrice(isLong ? p - delta : p + delta));
      setIsSubmitting(false);
    }
  }, [isOpen, initialSide, initialType, initialPrice]);

  // Stepper helper
  const handleStepLot = (delta: number) => {
    const current = parseFloat(lotSize) || 0;
    const nextVal = Math.max(0.01, +(current + delta).toFixed(2));
    setLotSize(nextVal.toString());
  };

  // Calculations
  const calculations = useMemo(() => {
    const lot = parseFloat(lotSize) || 0;
    const entry = parseFloat(price) || initialPrice;
    const tp = parseFloat(takeProfit) || 0;
    const sl = parseFloat(stopLoss) || 0;

    const notionalValue = lot * entry;
    const estimatedMargin = notionalValue / 10; // 10x leverage standard
    const isLong = side === 'BUY';

    let expectedProfit = 0;
    if (tp > 0) {
      const pnlPerUnit = isLong ? tp - entry : entry - tp;
      expectedProfit = Math.max(0, pnlPerUnit * lot);
    }

    let expectedLoss = 0;
    if (sl > 0) {
      const lossPerUnit = isLong ? entry - sl : sl - entry;
      expectedLoss = Math.max(0, lossPerUnit * lot);
    }

    const riskRewardRatio = expectedLoss > 0 && expectedProfit > 0
      ? (expectedProfit / expectedLoss).toFixed(1)
      : '0.0';

    return {
      notionalValue,
      estimatedMargin,
      expectedProfit,
      expectedLoss,
      riskRewardRatio,
      isValid: lot > 0 && entry > 0,
    };
  }, [lotSize, price, takeProfit, stopLoss, side, initialPrice]);

  if (!isOpen) return null;

  const isLong = side === 'BUY';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculations.isValid || isSubmitting) return;

    setIsSubmitting(true);

    const orderPrice = parseFloat(price) || initialPrice;
    const orderLot = parseFloat(lotSize) || 0.01;
    const tpPrice = parseFloat(takeProfit) || undefined;
    const slPrice = parseFloat(stopLoss) || undefined;

    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      clientOrderId: `cl_${Date.now()}`,
      symbol,
      side,
      type: orderType as any,
      price: orderPrice,
      amount: orderLot,
      filled: 0,
      status: 'NEW' as const,
      timeInForce: 'GTC' as const,
      postOnly: false,
      reduceOnly: false,
      takeProfit: tpPrice,
      stopLoss: slPrice,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 1. Dispatch order to Active Broker (MT5 Demo, Binance Testnet, or Sandbox)
    try {
      const execResult = await brokerService.executeOrder({
        symbol,
        side,
        type: orderType as any,
        amount: orderLot,
        price: orderPrice,
        stopLoss: slPrice,
        takeProfit: tpPrice,
      });

      if (onOrderConfirmed) {
        onOrderConfirmed({
          ...newOrder,
          id: execResult.ticketId,
          ticketId: execResult.ticketId,
          executedPrice: execResult.executedPrice,
        });
      }
    } catch (err) {
      console.warn('Broker execution error, falling back to optimistic store', err);
      addOptimisticOrder(newOrder);
      if (onOrderConfirmed) {
        onOrderConfirmed(newOrder);
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-white font-sans notranslate"
        dir="rtl"
        translate="no"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isLong ? 'bg-[#00C087]/20 text-[#00C087] border border-[#00C087]/30' : 'bg-[#F23645]/20 text-[#F23645] border border-[#F23645]/30'
            }`}>
              {isLong ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            </span>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>تأكيد أمر تداول:</span>
                <span className="font-mono text-cyan-400">{symbol}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {activeBroker === 'MT5_LIVE'
                    ? 'MT5 Live ⚡'
                    : activeBroker === 'BINANCE_LIVE'
                    ? 'Binance Live 🟡'
                    : activeBroker === 'MT5_DEMO'
                    ? 'MT5 Demo'
                    : activeBroker === 'BINANCE_TESTNET'
                    ? 'Binance Testnet'
                    : 'Sandbox 🟢'}
                </span>
              </h3>
              <p className="text-[11px] text-[#787B86]">
                السعر الحالي في السوق: <span className="font-mono font-bold text-white">{formatPrice(currentMarketPrice)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Order Details Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Side Selector (BUY vs SELL) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#151924] rounded-xl border border-[#2A2E39]">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isLong
                  ? 'bg-[#00C087] text-white shadow-[0_0_12px_rgba(0,192,135,0.4)]'
                  : 'text-[#787B86] hover:text-white'
              }`}
            >
              <ArrowUpRight size={15} />
              <span>شراء (BUY)</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isLong
                  ? 'bg-[#F23645] text-white shadow-[0_0_12px_rgba(242,54,69,0.4)]'
                  : 'text-[#787B86] hover:text-white'
              }`}
            >
              <ArrowDownRight size={15} />
              <span>بيع (SELL)</span>
            </button>
          </div>

          {/* Order Type Tabs */}
          <div className="flex gap-1 bg-[#151924] p-1 rounded-lg border border-[#2A2E39] text-[11px] font-bold">
            {[
              { id: 'LIMIT', label: 'محدد (Limit)' },
              { id: 'STOP', label: 'إيقاف (Stop)' },
              { id: 'MARKET', label: 'سوق (Market)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setOrderType(t.id as any)}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  orderType === t.id
                    ? 'bg-[#2962FF] text-white'
                    : 'text-[#787B86] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Price & Lot Size Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Price Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#A0A5B5] mb-1">
                سعر الدخول (Price):
              </label>
              <input
                type="text"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? formatPrice(currentMarketPrice) : price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-9 px-3 bg-[#151924] border border-[#2A2E39] rounded-lg font-mono font-bold text-white focus:outline-none focus:border-[#2962FF] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="0.00"
              />
            </div>

            {/* Lot Size Stepper */}
            <div>
              <label className="block text-[11px] font-bold text-[#A0A5B5] mb-1">
                حجم العقد (Lot Size):
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepLot(-0.01)}
                  className="w-9 h-9 rounded-lg bg-[#151924] border border-[#2A2E39] text-[#A0A5B5] hover:text-white hover:bg-[#2A2E39] flex items-center justify-center font-mono font-bold cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="w-full h-9 px-2 bg-[#151924] border border-[#2A2E39] rounded-lg text-center font-mono font-bold text-white focus:outline-none focus:border-[#2962FF]"
                  placeholder="0.01"
                />
                <button
                  type="button"
                  onClick={() => handleStepLot(0.01)}
                  className="w-9 h-9 rounded-lg bg-[#151924] border border-[#2A2E39] text-[#A0A5B5] hover:text-white hover:bg-[#2A2E39] flex items-center justify-center font-mono font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Take Profit & Stop Loss */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#00C087] mb-1">
                أخذ الربح (Take Profit):
              </label>
              <input
                type="text"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full h-9 px-3 bg-[#151924] border border-[#2A2E39] rounded-lg font-mono font-bold text-white focus:outline-none focus:border-[#00C087]"
                placeholder="TP"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#F23645] mb-1">
                إيقاف الخسارة (Stop Loss):
              </label>
              <input
                type="text"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full h-9 px-3 bg-[#151924] border border-[#2A2E39] rounded-lg font-mono font-bold text-white focus:outline-none focus:border-[#F23645]"
                placeholder="SL"
              />
            </div>
          </div>

          {/* Metric calculations card */}
          <div className="p-3 rounded-xl bg-[#151924] border border-[#2A2E39] space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-[#8F9CAE]">
              <span>الهامش التقديري (Est. Margin):</span>
              <span className="font-mono font-bold text-white">
                ${calculations.estimatedMargin.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8F9CAE]">
              <span>الربح المتوقع (Potential Profit):</span>
              <span className="font-mono font-bold text-[#00C087]">
                +${calculations.expectedProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8F9CAE]">
              <span>الخسارة المحتملة (Potential Risk):</span>
              <span className="font-mono font-bold text-[#F23645]">
                -${calculations.expectedLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8F9CAE] pt-1 border-t border-[#2A2E39]/60">
              <span>نسبة العائد إلى المخاطرة (R:R Ratio):</span>
              <span className="font-mono font-bold text-amber-400">
                1:{calculations.riskRewardRatio}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={!calculations.isValid || isSubmitting}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLong
                  ? 'bg-[#00C087] hover:bg-[#00A876] text-white shadow-[0_0_15px_rgba(0,192,135,0.4)]'
                  : 'bg-[#F23645] hover:bg-[#D92B38] text-white shadow-[0_0_15px_rgba(242,54,69,0.4)]'
              }`}
            >
              <Check size={16} />
              <span>تأكيد الأمر ({isLong ? 'شراء' : 'بيع'} {lotSize} Lot)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#151924] hover:bg-[#2A2E39] border border-[#2A2E39] text-[#8F9CAE] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChartOrderTicketModal;
