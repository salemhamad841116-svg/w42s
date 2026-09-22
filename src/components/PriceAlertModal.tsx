import React, { useState } from 'react';
import { PriceAlert, Language } from '../types';
import { PAIRS_DATA } from '../data/pairs';
import { t } from '../data/translations';
import { X, Bell, BellRing, Plus, Trash2, Zap, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered' | 'enabled'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onSimulateAlert: (alert: PriceAlert) => void;
  initialPair?: string;
  initialPrice?: number;
  lang: Language;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onDeleteAlert,
  onToggleAlert,
  onSimulateAlert,
  initialPair,
  initialPrice,
  lang,
}) => {
  const dictionary = t[lang];

  // Form State
  const [selectedPair, setSelectedPair] = useState<string>(initialPair || PAIRS_DATA[0].symbol);
  const currentPairObj = PAIRS_DATA.find((p) => p.symbol === selectedPair) || PAIRS_DATA[0];

  const [targetPrice, setTargetPrice] = useState<string>(
    initialPrice ? initialPrice.toString() : currentPairObj.currentPrice.toString()
  );
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [note, setNote] = useState<string>('');

  // Update target price when pair changes if user hasn't typed custom
  const handlePairChange = (symbol: string) => {
    setSelectedPair(symbol);
    const p = PAIRS_DATA.find((item) => item.symbol === symbol);
    if (p) {
      setTargetPrice(p.currentPrice.toString());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(targetPrice);
    if (isNaN(numPrice) || numPrice <= 0) return;

    onAddAlert({
      pair: selectedPair,
      targetPrice: numPrice,
      condition,
      note: note.trim() || undefined,
    });

    setNote('');
  };

  const adjustPrice = (percentage: number) => {
    const currentNum = parseFloat(targetPrice) || currentPairObj.currentPrice;
    const adjusted = currentNum * (1 + percentage / 100);
    const decimals = currentPairObj.decimals;
    setTargetPrice(adjusted.toFixed(decimals));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{dictionary.priceAlerts}</h3>
              <p className="text-xs text-zinc-400">
                {alerts.filter((a) => a.enabled && !a.isTriggered).length} {dictionary.activeAlertsCount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">

          {/* Form to Create New Price Alert */}
          <form onSubmit={handleSubmit} className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                {dictionary.addPriceAlert}
              </span>
              <span className="text-xs text-zinc-400">
                السعر الحالي: <strong className="text-emerald-400">{currentPairObj.currentPrice}</strong>
              </span>
            </div>

            {/* Pair Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">{dictionary.selectPair}</label>
                <select
                  value={selectedPair}
                  onChange={(e) => handlePairChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  {PAIRS_DATA.map((p) => (
                    <option key={p.symbol} value={p.symbol}>
                      {p.flags[0]}{p.flags[1]} {p.symbol} ({p.currentPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">{dictionary.targetPrice}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 1.0850"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Quick adjust buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400">تعديل سريع:</span>
              <button
                type="button"
                onClick={() => adjustPrice(0.1)}
                className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              >
                +0.1%
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(0.5)}
                className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              >
                +0.5%
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(-0.1)}
                className="px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              >
                -0.1%
              </button>
              <button
                type="button"
                onClick={() => adjustPrice(-0.5)}
                className="px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
              >
                -0.5%
              </button>
            </div>

            {/* Condition: Above vs Below */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">{dictionary.alertCondition}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>{dictionary.conditionAbove}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    condition === 'BELOW'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>{dictionary.conditionBelow}</span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">{dictionary.alertNote}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={dictionary.alertNotePlaceholder}
                className="w-full bg-zinc-900 border border-zinc-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-4 h-4" />
              <span>{dictionary.setPriceAlert}</span>
            </button>
          </form>

          {/* Alert List */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              قائمة تنبيهات الأسعار المسجلة ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <div className="text-center py-8 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800 text-zinc-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">{dictionary.noPriceAlerts}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.map((alert) => {
                  const pConfig = PAIRS_DATA.find((p) => p.symbol === alert.pair);
                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        alert.isTriggered
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : alert.enabled
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                          : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            alert.condition === 'ABOVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {alert.condition === 'ABOVE' ? '≥' : '≤'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {pConfig ? `${pConfig.flags[0]}${pConfig.flags[1]} ` : ''}
                              {alert.pair}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {alert.targetPrice}
                            </span>
                            {alert.isTriggered && (
                              <span className="text-[10px] font-bold bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> تم التفعيل
                              </span>
                            )}
                          </div>
                          {alert.note && <p className="text-xs text-zinc-400 mt-0.5">{alert.note}</p>}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Simulation Test Button */}
                        {!alert.isTriggered && (
                          <button
                            onClick={() => onSimulateAlert(alert)}
                            title="اختبار تفعيل التنبيه فوراً"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs flex items-center gap-1 transition"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="hidden sm:inline text-[11px]">تجربة</span>
                          </button>
                        )}

                        {/* Toggle Switch */}
                        <button
                          onClick={() => onToggleAlert(alert.id)}
                          className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                            alert.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              alert.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
