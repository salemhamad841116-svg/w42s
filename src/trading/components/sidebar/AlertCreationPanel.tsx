import React, { useState, useEffect } from 'react';
import { useChartStore } from '../../store';
import { useMarketStore } from '../../stores/marketStore';
import { Bell, X, Check, Volume2, Smartphone, Send, Calendar } from 'lucide-react';

interface AlertCreationPanelProps {
  onClose: () => void;
}

type AlertCondition =
  | 'CROSS'
  | 'CROSS_UP'
  | 'CROSS_DOWN'
  | 'GREATER_THAN'
  | 'LESS_THAN';

export const AlertCreationPanel: React.FC<AlertCreationPanelProps> = ({
  onClose,
}) => {
  const activeSymbol =
    useChartStore((state) => state.activeSymbol) || 'BTC/USDT';
  const currentTickerPrice = useMarketStore(
    (state) => state.ticker?.currentPrice
  );

  const defaultPrice = currentTickerPrice
    ? currentTickerPrice.toString()
    : '2480.36';

  const [price, setPrice] = useState(defaultPrice);
  const [condition, setCondition] = useState<AlertCondition>('CROSS');
  const [triggerOption, setTriggerOption] = useState<'ONCE' | 'EVERY_TIME'>(
    'ONCE'
  );
  const [expirationDate, setExpirationDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [message, setMessage] = useState('');
  const [notifyApp, setNotifyApp] = useState(true);
  const [notifySound, setNotifySound] = useState(true);
  const [notifyWebhook, setNotifyWebhook] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    if (currentTickerPrice) {
      setPrice(currentTickerPrice.toString());
    }
  }, [currentTickerPrice]);

  useEffect(() => {
    setMessage(`${activeSymbol} price crossed ${price}`);
  }, [activeSymbol, price]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return;

    const alertData = {
      id: `alert-${Date.now()}`,
      symbol: activeSymbol,
      targetPrice: numPrice,
      condition,
      triggerOption,
      expirationDate,
      message,
      notifications: {
        app: notifyApp,
        sound: notifySound,
        webhook: notifyWebhook,
      },
      createdAt: Date.now(),
    };

    // Dispatch alert event for chart overlays and system notifications
    window.dispatchEvent(
      new CustomEvent('tv_alert_created', { detail: alertData })
    );

    setIsCreated(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      className="w-84 bg-[#181C28] border border-[#2D3345] rounded-xl shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150 notranslate text-left"
      dir="ltr"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#262B3D] bg-[#12151F]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#F23645]/15 text-[#F23645] flex items-center justify-center font-bold text-xs">
            <Bell size={13} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            Create Alert on <span className="text-[#2962FF]">{activeSymbol}</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#8F9CAE] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {isCreated ? (
        <div className="p-6 text-center animate-in zoom-in-95 duration-150">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2">
            <Check size={20} />
          </div>
          <div className="text-xs font-bold text-white mb-1">
            Alert Created Successfully!
          </div>
          <div className="text-[11px] text-[#8F9CAE]">
            {activeSymbol} @ {price} ({condition})
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateAlert} className="p-3 space-y-3">
          {/* Condition Select */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AlertCondition)}
              className="w-full h-8 px-2.5 bg-[#1E222D] border border-[#2B3144] rounded-lg text-xs text-white focus:outline-none focus:border-[#2962FF] transition-colors cursor-pointer"
            >
              <option value="CROSS">Crossing</option>
              <option value="CROSS_UP">Crossing Up</option>
              <option value="CROSS_DOWN">Crossing Down</option>
              <option value="GREATER_THAN">Greater Than</option>
              <option value="LESS_THAN">Less Than</option>
            </select>
          </div>

          {/* Target Price */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1">
              Target Price
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-[#1E222D] border border-[#2B3144] rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2962FF] transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#60687B] font-mono">
                USD
              </span>
            </div>
          </div>

          {/* Trigger Frequency */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1">
              Trigger Frequency
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#12151F] p-1 rounded-lg border border-[#252B3B]">
              <button
                type="button"
                onClick={() => setTriggerOption('ONCE')}
                className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  triggerOption === 'ONCE'
                    ? 'bg-[#2962FF] text-white shadow-xs'
                    : 'text-[#8F9CAE] hover:text-white'
                }`}
              >
                Only Once
              </button>
              <button
                type="button"
                onClick={() => setTriggerOption('EVERY_TIME')}
                className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  triggerOption === 'EVERY_TIME'
                    ? 'bg-[#2962FF] text-white shadow-xs'
                    : 'text-[#8F9CAE] hover:text-white'
                }`}
              >
                Every Time
              </button>
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1">
              Expiration
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-[#1E222D] border border-[#2B3144] rounded-lg text-xs text-white focus:outline-none focus:border-[#2962FF] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1">
              Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Alert message..."
              className="w-full h-8 px-2.5 bg-[#1E222D] border border-[#2B3144] rounded-lg text-xs text-white placeholder-[#60687B] focus:outline-none focus:border-[#2962FF] transition-colors"
            />
          </div>

          {/* Notification Options */}
          <div>
            <label className="block text-[11px] font-medium text-[#8F9CAE] mb-1.5">
              Notification Methods
            </label>
            <div className="space-y-1.5 bg-[#141824] p-2 rounded-lg border border-[#242A3C]">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyApp}
                  onChange={(e) => setNotifyApp(e.target.checked)}
                  className="rounded border-[#2B3144] text-[#2962FF] focus:ring-0 cursor-pointer"
                />
                <Smartphone size={13} className="text-[#2962FF]" />
                <span>Show In-App Pop-up</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySound}
                  onChange={(e) => setNotifySound(e.target.checked)}
                  className="rounded border-[#2B3144] text-[#2962FF] focus:ring-0 cursor-pointer"
                />
                <Volume2 size={13} className="text-amber-400" />
                <span>Play Sound Chime</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyWebhook}
                  onChange={(e) => setNotifyWebhook(e.target.checked)}
                  className="rounded border-[#2B3144] text-[#2962FF] focus:ring-0 cursor-pointer"
                />
                <Send size={13} className="text-purple-400" />
                <span>Webhook / External Dispatch</span>
              </label>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 h-8 rounded-lg bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Create Alert
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 h-8 rounded-lg bg-[#1E222D] hover:bg-[#252A38] text-[#8F9CAE] hover:text-white text-xs font-medium transition-colors cursor-pointer border border-[#2B3144]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
