import React, { useState, useEffect } from 'react';
import { X, Clock, Bell, Volume2, CheckCircle2 } from 'lucide-react';

interface ChartAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  initialPrice: number;
  onAlertCreated?: (alert: {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: string;
    frequency: string;
    name: string;
    message: string;
  }) => void;
  initialIndicator?: string;
}

export const ChartAlertModal: React.FC<ChartAlertModalProps> = ({
  isOpen,
  onClose,
  symbol,
  initialPrice,
  onAlertCreated,
  initialIndicator,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>(initialPrice.toString());
  const [condition, setCondition] = useState<'CROSS' | 'CROSS_UP' | 'CROSS_DOWN' | 'GREATER_THAN' | 'LESS_THAN'>('CROSS');
  const [frequency, setFrequency] = useState<'ONCE' | 'EVERY_TIME'>('ONCE');
  const [playSound, setPlaySound] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [alertName, setAlertName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetPrice(initialPrice.toString());
      if (initialIndicator) {
        setAlertName(`${symbol}: تقاطع مع ${initialIndicator} @ ${initialPrice}`);
      } else {
        setAlertName(`${symbol} @ ${initialPrice}`);
      }
    }
  }, [isOpen, initialPrice, symbol, initialIndicator]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(targetPrice);
    if (isNaN(numPrice) || numPrice <= 0) return;

    if (onAlertCreated) {
      onAlertCreated({
        id: `alert-${Date.now()}`,
        symbol,
        targetPrice: numPrice,
        condition,
        frequency,
        name: alertName.trim() || `${symbol} @ ${numPrice}`,
        message: `سعر ${symbol} وصل إلى ${numPrice}`,
      });
    }

    onClose();
  };

  const conditionLabels: Record<string, string> = {
    CROSS: 'تقاطع (Crossing)',
    CROSS_UP: 'تقاطع للأعلى (Crossing Up)',
    CROSS_DOWN: 'تقاطع للأسفل (Crossing Down)',
    GREATER_THAN: 'أكبر من (Greater Than)',
    LESS_THAN: 'أقل من (Less Than)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-white font-sans notranslate"
        dir="rtl"
        translate="no"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2962FF]/15 border border-[#2962FF]/30 flex items-center justify-center text-[#2962FF]">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                إنشاء تنبيه على <span className="font-mono text-[#2962FF]">{symbol}</span>
              </h3>
              <p className="text-xs text-[#8F9CAE]">ضبط معايير التنبيه وإشعارك عند تحقق الشرط</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Condition & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8F9CAE] mb-1.5">الشرط (Condition)</label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2962FF] transition-colors"
              >
                {Object.entries(conditionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8F9CAE] mb-1.5">السعر المستهدف (Target Price)</label>
              <input
                type="number"
                step="any"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#2962FF] transition-colors"
              />
            </div>
          </div>

          {/* Trigger Frequency */}
          <div>
            <label className="block text-xs font-medium text-[#8F9CAE] mb-1.5">تكرار التنبيه</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('ONCE')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  frequency === 'ONCE'
                    ? 'bg-[#2962FF]/15 border-[#2962FF] text-[#2962FF]'
                    : 'bg-[#131722] border-[#2A2E39] text-[#8F9CAE] hover:text-white'
                }`}
              >
                <span>مرة واحدة فقط (Only Once)</span>
              </button>
              <button
                type="button"
                onClick={() => setFrequency('EVERY_TIME')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  frequency === 'EVERY_TIME'
                    ? 'bg-[#2962FF]/15 border-[#2962FF] text-[#2962FF]'
                    : 'bg-[#131722] border-[#2A2E39] text-[#8F9CAE] hover:text-white'
                }`}
              >
                <span>في كل مرة (Every Time)</span>
              </button>
            </div>
          </div>

          {/* Options: Sound and Notification */}
          <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2.5">
            <label className="text-xs font-medium text-[#8F9CAE] block mb-1">خيارات التنبيه والإشعار</label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white flex items-center gap-2">
                <Volume2 size={14} className="text-[#2962FF]" />
                تشغيل صوت التنبيه
              </span>
              <input
                type="checkbox"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white flex items-center gap-2">
                <Bell size={14} className="text-[#00C087]" />
                نافذة إشعار منبثقة (Popup)
              </span>
              <input
                type="checkbox"
                checked={showPopup}
                onChange={(e) => setShowPopup(e.target.checked)}
                className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Alert Name */}
          <div>
            <label className="block text-xs font-medium text-[#8F9CAE] mb-1.5">اسم التنبيه (اختياري)</label>
            <input
              type="text"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="مثال: تنبيه كسر المقاومة"
              className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2962FF] transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#2A2E39]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#2962FF] hover:bg-[#1E4FD9] text-white rounded-lg shadow-lg shadow-[#2962FF]/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>إنشاء التنبيه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
