import React, { useState } from 'react';
import { X, Layers, Sliders, MapPin, Eye, Bell, ShieldAlert, DollarSign, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';
import { calculatePositionMetrics } from './forecastingData';
import { useChartStore } from '../../stores/chartStore';

interface PositionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: TrendLineDrawing | null;
}

type TabType = 'style' | 'coordinates' | 'risk' | 'visibility' | 'alerts';

const PRESET_COLORS = [
  '#00C087', '#2962FF', '#00BCD4', '#FF9800', '#F23645', 
  '#E040FB', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

export const PositionSettingsModal: React.FC<PositionSettingsModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const [activeTab, setActiveTab] = useState<TabType>('risk');
  const activeSymbol = useChartStore(state => state.activeSymbol) || 'BTC/USDT';

  if (!isOpen || !drawing) return null;

  const isLong = drawing.toolType === 'longPosition';

  const positionData = drawing.positionData || {
    entryPrice: drawing.point1.price,
    targetPrice: drawing.point2.price,
    stopLossPrice: isLong ? drawing.point1.price * 0.99 : drawing.point1.price * 1.01,
    accountSize: 10000,
    riskPercent: 1.0,
    riskAmount: 100,
    lotSize: 0.1,
    rewardAmount: 200,
    riskRewardRatio: 2.0,
    profitColor: '#00C087',
    lossColor: '#F23645',
    entryLineColor: '#2962FF',
    profitOpacity: 0.22,
    lossOpacity: 0.22,
    showMetrics: true,
    currency: 'USD',
  };

  const handleLevelChange = (key: 'entryPrice' | 'targetPrice' | 'stopLossPrice', value: number) => {
    if (isNaN(value) || value <= 0) return;
    const newEntry = key === 'entryPrice' ? value : positionData.entryPrice;
    const newTarget = key === 'targetPrice' ? value : positionData.targetPrice;
    const newStop = key === 'stopLossPrice' ? value : positionData.stopLossPrice;

    const metrics = calculatePositionMetrics(
      newEntry,
      newTarget,
      newStop,
      isLong,
      activeSymbol,
      positionData.accountSize ?? 10000,
      positionData.riskPercent ?? 1,
      positionData.barCount,
      positionData.durationSeconds
    );

    updateDrawing(drawing.id, {
      point1: { ...drawing.point1, price: newEntry },
      point2: { ...drawing.point2, price: newTarget },
      positionData: {
        ...positionData,
        ...metrics,
        profitColor: positionData.profitColor,
        lossColor: positionData.lossColor,
        entryLineColor: positionData.entryLineColor,
        profitOpacity: positionData.profitOpacity,
        lossOpacity: positionData.lossOpacity,
        showMetrics: positionData.showMetrics,
      },
    });
  };

  const handleRiskParamChange = (field: 'accountSize' | 'riskPercent', val: number) => {
    if (isNaN(val) || val < 0) return;
    const newAcc = field === 'accountSize' ? val : (positionData.accountSize ?? 10000);
    const newRiskPct = field === 'riskPercent' ? val : (positionData.riskPercent ?? 1);

    const metrics = calculatePositionMetrics(
      positionData.entryPrice,
      positionData.targetPrice,
      positionData.stopLossPrice,
      isLong,
      activeSymbol,
      newAcc,
      newRiskPct,
      positionData.barCount,
      positionData.durationSeconds
    );

    updateDrawing(drawing.id, {
      positionData: {
        ...positionData,
        ...metrics,
        accountSize: newAcc,
        riskPercent: newRiskPct,
        profitColor: positionData.profitColor,
        lossColor: positionData.lossColor,
        entryLineColor: positionData.entryLineColor,
        profitOpacity: positionData.profitOpacity,
        lossOpacity: positionData.lossOpacity,
        showMetrics: positionData.showMetrics,
      }
    });
  };

  const handleStyleUpdate = (updates: Partial<typeof positionData>) => {
    updateDrawing(drawing.id, {
      positionData: {
        ...positionData,
        ...updates,
      }
    });
  };

  return (
    <div 
      className="drawing-settings-modal fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onPointerDown={e => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-[540px] bg-[#1E222D] border border-[#2A3050] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3050] bg-[#171B26]">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isLong ? 'bg-[#00C087]/20 text-[#00C087]' : 'bg-[#F23645]/20 text-[#F23645]'}`}>
              {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isLong ? 'إعدادات مركز الشراء (Long Position)' : 'إعدادات مركز البيع (Short Position)'}
              </h2>
              <span className="text-[11px] text-[#787B86]">أداة قياس المخاطر والعائد والصفقات</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A3050] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A3050] px-4 bg-[#1A1E2B] gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'risk'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <ShieldAlert size={15} />
            <span>الحساب وإدارة المخاطر</span>
          </button>
          <button
            onClick={() => setActiveTab('coordinates')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coordinates'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <MapPin size={15} />
            <span>المستويات والأسعار</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'style'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Sliders size={15} />
            <span>المظهر والتنسيق</span>
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'visibility'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Eye size={15} />
            <span>الظهور الزمني</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Bell size={15} />
            <span>التنبيهات</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-[#D1D4DC]">
          
          {/* TAB 1: RISK & POSITION SIZING */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              {/* Account Size & Risk % Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#787B86] mb-1.5 font-medium">حجم الحساب (Account Size)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={positionData.accountSize ?? 10000}
                      onChange={e => handleRiskParamChange('accountSize', parseFloat(e.target.value))}
                      className="w-full bg-[#131722] border border-[#2A3050] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#2962FF] outline-none"
                    />
                    <span className="absolute left-3 top-2 text-xs text-[#787B86]">USD</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#787B86] mb-1.5 font-medium">نسبة المخاطرة (% Risk)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={positionData.riskPercent ?? 1}
                      onChange={e => handleRiskParamChange('riskPercent', parseFloat(e.target.value))}
                      className="w-full bg-[#131722] border border-[#2A3050] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#2962FF] outline-none"
                    />
                    <span className="absolute left-3 top-2 text-xs text-[#787B86]">%</span>
                  </div>
                </div>
              </div>

              {/* Live Calculated Stats Box */}
              <div className="bg-[#131722] border border-[#2A3050] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#2A3050]/60 pb-2.5">
                  <span className="text-xs text-[#787B86]">نسبة العائد إلى المخاطرة (R:R)</span>
                  <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                    (positionData.riskRewardRatio ?? 0) >= 2 ? 'bg-[#00C087]/20 text-[#00C087]' :
                    (positionData.riskRewardRatio ?? 0) >= 1 ? 'bg-[#FF9800]/20 text-[#FF9800]' : 'bg-[#F23645]/20 text-[#F23645]'
                  }`}>
                    1 : {(positionData.riskRewardRatio ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#1E222D] p-2.5 rounded-lg border border-[#2A3050]">
                    <div className="text-[11px] text-[#787B86] mb-1">المخاطرة المقدرة (Loss)</div>
                    <div className="text-sm font-bold text-[#F23645] font-mono">
                      ${(positionData.riskAmount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#787B86] mt-0.5">
                      {positionData.stopPips ?? 0} نقطة ({(positionData.stopPercent ?? 0).toFixed(2)}%)
                    </div>
                  </div>

                  <div className="bg-[#1E222D] p-2.5 rounded-lg border border-[#2A3050]">
                    <div className="text-[11px] text-[#787B86] mb-1">الربح المتوقع (Profit)</div>
                    <div className="text-sm font-bold text-[#00C087] font-mono">
                      +${(positionData.rewardAmount ?? 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#787B86] mt-0.5">
                      {positionData.targetPips ?? 0} نقطة (+{(positionData.targetPercent ?? 0).toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#2A3050]/60 text-xs">
                  <span className="text-[#787B86]">حجم العقد المقترح (Lot Size):</span>
                  <span className="text-sm font-bold text-[#2962FF] font-mono">
                    {positionData.lotSize ?? 0.1} Lot
                  </span>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="text-[11px] text-[#787B86] bg-[#1E222D] border border-white/5 rounded-lg p-3">
                تنبيه: هذه الحسابات مخصصة للتخطيط الرياضي وإدارة رأس المال على الرسم البياني ولا تقوم بتنفيذ صفقات حية.
              </div>
            </div>
          )}

          {/* TAB 2: COORDINATES */}
          {activeTab === 'coordinates' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#787B86] mb-1.5 font-medium">سعر الهدف (Target Price)</label>
                <input
                  type="number"
                  step="any"
                  value={positionData.targetPrice}
                  onChange={e => handleLevelChange('targetPrice', parseFloat(e.target.value))}
                  className="w-full bg-[#131722] border border-[#00C087]/50 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00C087] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#787B86] mb-1.5 font-medium">سعر الدخول (Entry Price)</label>
                <input
                  type="number"
                  step="any"
                  value={positionData.entryPrice}
                  onChange={e => handleLevelChange('entryPrice', parseFloat(e.target.value))}
                  className="w-full bg-[#131722] border border-[#2962FF]/50 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#2962FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#787B86] mb-1.5 font-medium">سعر وقف الخسارة (Stop Loss)</label>
                <input
                  type="number"
                  step="any"
                  value={positionData.stopLossPrice}
                  onChange={e => handleLevelChange('stopLossPrice', parseFloat(e.target.value))}
                  className="w-full bg-[#131722] border border-[#F23645]/50 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#F23645] outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STYLE */}
          {activeTab === 'style' && (
            <div className="space-y-5">
              {/* Profit Zone Colors & Opacity */}
              <div className="bg-[#131722] p-3.5 rounded-xl border border-[#2A3050] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">منطقة الربح (Profit Target Zone)</span>
                  <div className="flex gap-1.5">
                    {PRESET_COLORS.slice(0, 5).map(c => (
                      <button
                        key={c}
                        onClick={() => handleStyleUpdate({ profitColor: c })}
                        className={`w-4 h-4 rounded-full border ${positionData.profitColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#787B86] mb-1">
                    <span>درجة شفافية منطقة الربح</span>
                    <span>{Math.round((positionData.profitOpacity ?? 0.22) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={positionData.profitOpacity ?? 0.22}
                    onChange={e => handleStyleUpdate({ profitOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#2A3050] rounded-lg appearance-none cursor-pointer accent-[#00C087]"
                  />
                </div>
              </div>

              {/* Stop Loss Zone Colors & Opacity */}
              <div className="bg-[#131722] p-3.5 rounded-xl border border-[#2A3050] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">منطقة وقف الخسارة (Stop Loss Zone)</span>
                  <div className="flex gap-1.5">
                    {PRESET_COLORS.slice(0, 5).map(c => (
                      <button
                        key={c}
                        onClick={() => handleStyleUpdate({ lossColor: c })}
                        className={`w-4 h-4 rounded-full border ${positionData.lossColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#787B86] mb-1">
                    <span>درجة شفافية منطقة الخسارة</span>
                    <span>{Math.round((positionData.lossOpacity ?? 0.22) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={positionData.lossOpacity ?? 0.22}
                    onChange={e => handleStyleUpdate({ lossOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#2A3050] rounded-lg appearance-none cursor-pointer accent-[#F23645]"
                  />
                </div>
              </div>

              {/* Show Metrics Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={positionData.showMetrics !== false}
                  onChange={e => handleStyleUpdate({ showMetrics: e.target.checked })}
                  className="rounded border-[#2A3050] text-[#2962FF] focus:ring-0 bg-[#131722]"
                />
                <span className="text-xs text-[#D1D4DC]">عرض تفاصيل الصفقة واللوت والنسبة على الشارت (On-Canvas Badge)</span>
              </label>
            </div>
          )}

          {/* TAB 4: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-3">
              <span className="text-xs text-[#787B86]">عرض أداة المركز في الأطر الزمنية التالية:</span>
              <div className="grid grid-cols-2 gap-2">
                {['الثواني (Seconds)', 'الدقائق (Minutes)', 'الساعات (Hours)', 'الأيام (Days)', 'الأسابيع (Weeks)', 'الشهور (Months)'].map((interval, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs bg-[#131722] p-2 rounded-lg border border-[#2A3050]">
                    <input type="checkbox" defaultChecked className="accent-[#2962FF]" />
                    <span>{interval}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="text-xs text-[#787B86] mb-2">تنبيهات تلقائية لمستويات الصفقة:</div>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-[#131722] border border-[#2A3050] rounded-lg">
                  <span className="text-xs">تنبيه عند الوصول للهدف (Target Price)</span>
                  <input type="checkbox" defaultChecked className="accent-[#00C087]" />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#131722] border border-[#2A3050] rounded-lg">
                  <span className="text-xs">تنبيه عند ضرب وقف الخسارة (Stop Loss)</span>
                  <input type="checkbox" defaultChecked className="accent-[#F23645]" />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#131722] border border-[#2A3050] rounded-lg">
                  <span className="text-xs">تنبيه عند ملامسة سعر الدخول (Entry Price)</span>
                  <input type="checkbox" className="accent-[#2962FF]" />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2A3050] bg-[#171B26]">
          <span className="text-[11px] text-[#787B86]">{activeSymbol}</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#2962FF] hover:bg-[#1E4FD9] text-white transition-colors"
            >
              تم الحفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
