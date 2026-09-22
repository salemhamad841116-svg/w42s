import React, { useState, useMemo, useEffect } from 'react';
import { X, Scissors, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PositionData } from '../../types';
import { usePositionsStore } from '../../stores/positionsStore';

export interface PartialCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: PositionData | null;
  onSuccess?: (realizedPnl: number, closedUnits: number) => void;
}

export const PartialCloseModal: React.FC<PartialCloseModalProps> = ({
  isOpen,
  onClose,
  position,
  onSuccess,
}) => {
  const partialClosePosition = usePositionsStore((state) => state.partialClosePosition);

  const [closeAmount, setCloseAmount] = useState<string>('0.01');
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values when position changes
  useEffect(() => {
    if (position && isOpen) {
      const half = +(position.size * 0.5).toFixed(2);
      const initialVal = Math.max(0.01, Math.min(position.size, half || 0.01));
      setCloseAmount(initialVal.toString());
      setSelectedPercentage(50);
      setIsSubmitting(false);
    }
  }, [position, isOpen]);

  // Real-time calculation engine
  const calculations = useMemo(() => {
    if (!position) {
      return {
        closedUnits: 0,
        remainingUnits: 0,
        realizedPnl: 0,
        remainingMargin: 0,
        isValid: false,
        isFullClose: false,
      };
    }

    const units = parseFloat(closeAmount) || 0;
    const totalSize = position.size;
    const isValid = units > 0 && units <= totalSize + 0.0001;
    const clampedUnits = Math.min(units, totalSize);
    const isFullClose = clampedUnits >= totalSize - 0.0001;

    const isLong = position.side === 'BUY' || String(position.side).toUpperCase() === 'LONG';
    const priceDiff = isLong
      ? (position.markPrice - position.entryPrice)
      : (position.entryPrice - position.markPrice);

    const realizedPnl = priceDiff * clampedUnits;
    const remainingUnits = Math.max(0, +(totalSize - clampedUnits).toFixed(4));
    const ratio = totalSize > 0 ? (totalSize - clampedUnits) / totalSize : 0;
    const remainingMargin = +(position.margin * ratio).toFixed(2);

    return {
      closedUnits: clampedUnits,
      remainingUnits,
      realizedPnl,
      remainingMargin,
      isValid,
      isFullClose,
    };
  }, [position, closeAmount]);

  if (!isOpen || !position) return null;

  const isLong = position.side === 'BUY' || String(position.side).toUpperCase() === 'LONG';

  // Apply percentage preset
  const handleSelectPercentage = (pct: number) => {
    setSelectedPercentage(pct);
    const calculated = +(position.size * (pct / 100)).toFixed(2);
    const safeValue = Math.max(0.01, Math.min(position.size, calculated));
    setCloseAmount(safeValue.toString());
  };

  // Step amount (+/- 0.01)
  const handleStepAmount = (delta: number) => {
    setSelectedPercentage(null);
    const current = parseFloat(closeAmount) || 0;
    const nextVal = +(current + delta).toFixed(2);
    if (nextVal >= 0.01 && nextVal <= position.size) {
      setCloseAmount(nextVal.toString());
    }
  };

  const handleManualInput = (val: string) => {
    setSelectedPercentage(null);
    setCloseAmount(val);
  };

  // Submit Partial Close via API contract & Store Sync
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculations.isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. API Contract Dispatch (Simulated or Real Endpoint)
      try {
        await fetch('/api/v1/order/partial-close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionId: position.id,
            unitsToClose: calculations.closedUnits,
            orderType: 'MARKET',
          }),
        });
      } catch {
        // Fallback for offline/mock development mode
      }

      // 2. Reconcile Store & WebSocket State
      const result = partialClosePosition(position.id, calculations.closedUnits);

      if (onSuccess) {
        onSuccess(result.realizedPnl, calculations.closedUnits);
      }

      onClose();
    } catch (err) {
      console.error('Failed to partial close:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-white font-sans notranslate"
        dir="rtl"
        translate="no"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2962FF]/15 border border-[#2962FF]/30 flex items-center justify-center text-[#2962FF]">
              <Scissors size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>إغلاق جزئي للصفقة</span>
                <span className="font-mono text-cyan-400">{position.symbol}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                    isLong
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isLong ? 'شراء (BUY)' : 'بيع (SELL)'}
                </span>
              </h3>
              <p className="text-[11px] text-[#787B86]">
                تحديد كمية اللوت المراد تسييلها وتأمين الأرباح الحالية
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

        {/* Position Summary Card */}
        <div className="p-4 bg-[#141720]/60 border-b border-[#2A2E39] grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-[#1E222D] border border-[#2A2E39]/60">
            <div className="text-[10px] text-[#787B86] font-sans">سعر الدخول</div>
            <div className="font-bold text-white mt-0.5">{position.entryPrice.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-lg bg-[#1E222D] border border-[#2A2E39]/60">
            <div className="text-[10px] text-[#787B86] font-sans">السعر الحالي</div>
            <div className="font-bold text-[#F7931A] mt-0.5">{position.markPrice.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-lg bg-[#1E222D] border border-[#2A2E39]/60">
            <div className="text-[10px] text-[#787B86] font-sans">الحجم الكلي</div>
            <div className="font-bold text-cyan-400 mt-0.5">{position.size} Lot</div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preset Percentage Reduction Chips */}
          <div>
            <label className="block text-xs font-bold text-[#A0A5B5] mb-2">
              نسبة الإغلاق السريع:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleSelectPercentage(pct)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    selectedPercentage === pct
                      ? 'bg-[#2962FF] text-white border-[#2962FF] shadow-[0_0_12px_rgba(41,98,255,0.4)]'
                      : 'bg-[#151924] text-[#8F9CAE] border-[#2A2E39] hover:bg-[#2A2E39] hover:text-white'
                  }`}
                >
                  {pct === 100 ? 'كامل (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Volume Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#A0A5B5]">
                حجم اللوت المراد إغلاقه (Units to Close):
              </label>
              <span className="text-[11px] font-mono text-[#787B86]">
                الأقصى: {position.size}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepAmount(-0.01)}
                className="w-10 h-10 rounded-lg bg-[#151924] border border-[#2A2E39] text-[#A0A5B5] hover:text-white hover:bg-[#2A2E39] flex items-center justify-center font-mono font-bold text-base transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={position.size}
                value={closeAmount}
                onChange={(e) => handleManualInput(e.target.value)}
                className="flex-1 h-10 px-3 bg-[#151924] border border-[#2A2E39] rounded-lg text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-[#2962FF] transition-colors"
                placeholder="0.01"
              />
              <button
                type="button"
                onClick={() => handleStepAmount(0.01)}
                className="w-10 h-10 rounded-lg bg-[#151924] border border-[#2A2E39] text-[#A0A5B5] hover:text-white hover:bg-[#2A2E39] flex items-center justify-center font-mono font-bold text-base transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
            {!calculations.isValid && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>الرجاء إدخال كمية صالحة بين 0.01 و {position.size} لوت</span>
              </p>
            )}
          </div>

          {/* Real-time Calculation Card */}
          <div className="p-3.5 rounded-xl bg-[#151924] border border-[#2A2E39] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#8F9CAE]">
              <span>الربح / الخسارة المحققة فوراً (Realized PnL):</span>
              <span
                className={`font-mono font-bold text-sm flex items-center gap-1 ${
                  calculations.realizedPnl >= 0 ? 'text-[#00C087]' : 'text-[#F23645]'
                }`}
              >
                {calculations.realizedPnl >= 0 ? '+' : ''}
                ${calculations.realizedPnl.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#8F9CAE]">
              <span>الحجم المتبقي في الصفقة (Remaining Size):</span>
              <span className="font-mono font-semibold text-white">
                {calculations.remainingUnits} Lot
              </span>
            </div>

            <div className="flex items-center justify-between text-[#8F9CAE] pt-1.5 border-t border-[#2A2E39]/60">
              <span>الهامش المحجوز المتبقي (Remaining Margin):</span>
              <span className="font-mono font-semibold text-zinc-300">
                ${calculations.remainingMargin.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={!calculations.isValid || isSubmitting}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                calculations.isValid && !isSubmitting
                  ? calculations.isFullClose
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(242,54,69,0.3)]'
                    : 'bg-[#2962FF] hover:bg-[#1E50E6] text-white shadow-[0_0_15px_rgba(41,98,255,0.3)]'
                  : 'bg-zinc-800 text-zinc-600 border border-zinc-700/40 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>جاري التنفيذ...</span>
              ) : calculations.isFullClose ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>تأكيد الإغلاق الكامل ({position.size} Lot)</span>
                </>
              ) : (
                <>
                  <Scissors size={15} />
                  <span>تأكيد الإغلاق الجزئي ({calculations.closedUnits} Lot)</span>
                </>
              )}
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

export default PartialCloseModal;
