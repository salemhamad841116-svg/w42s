import React, { useState } from 'react';
import { X, Layers, Sliders, MapPin, Eye, Bell, CheckCircle2, Percent, Tag } from 'lucide-react';
import { TrendLineDrawing, useDrawingStore, DrawingPoint } from '../../stores/drawingStore';
import { calculateHarmonicRatios, validateHarmonicPattern } from './patternsData';

interface PatternSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: TrendLineDrawing | null;
}

type TabType = 'style' | 'labels' | 'ratios' | 'coordinates' | 'visibility' | 'alerts';

const PRESET_COLORS = [
  '#2962FF', '#00BCD4', '#00C087', '#FF9800', '#F23645', 
  '#E040FB', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

export const PatternSettingsModal: React.FC<PatternSettingsModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const [activeTab, setActiveTab] = useState<TabType>('style');
  const [tolerance, setTolerance] = useState<number>(10);

  if (!isOpen || !drawing) return null;

  const {
    points = [drawing.point1, drawing.point2],
    pointLabels = ['X', 'A', 'B', 'C', 'D'],
    style,
    fillColor = '#2962FF',
    fillOpacity = 0.15,
    fillBackground = true,
    showLabels = true,
    showPointLabels = true,
    showRatios = true,
    validatePattern = true,
    visibleIntervals = ['all'],
    alert,
  } = drawing;

  const isHarmonic = drawing.toolType === 'xabcd' || drawing.toolType === 'cypher' || drawing.toolType === 'abcd';

  // Compute live ratios and validation
  const prices = points.map(p => p.price);
  const currentRatios = calculateHarmonicRatios(prices);
  const validation = validateHarmonicPattern(currentRatios, drawing.toolType === 'cypher' ? 'Cypher' : undefined, tolerance);

  const handleCoordChange = (index: number, field: 'price' | 'time', value: number) => {
    const nextPoints = [...points];
    nextPoints[index] = {
      ...nextPoints[index],
      [field]: value,
    };

    const updates: Partial<TrendLineDrawing> = {
      points: nextPoints,
      point1: nextPoints[0] || drawing.point1,
      point2: nextPoints[1] || drawing.point2,
      point3: nextPoints[2] || drawing.point3,
    };

    if (isHarmonic) {
      const nextPrices = nextPoints.map(p => p.price);
      const computed = calculateHarmonicRatios(nextPrices);
      const val = validateHarmonicPattern(computed, drawing.toolType === 'cypher' ? 'Cypher' : undefined, tolerance);
      updates.ratios = computed as any;
      updates.patternStatus = val.status;
    }

    updateDrawing(drawing.id, updates);
  };

  const formatDateTime = (timestampSec: number) => {
    try {
      return new Date(timestampSec * 1000).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const parseDateTime = (dateStr: string) => {
    try {
      return Math.floor(new Date(dateStr).getTime() / 1000);
    } catch {
      return Math.floor(Date.now() / 1000);
    }
  };

  return (
    <div className="drawing-settings-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none notranslate" translate="no">
      <div 
        className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl text-white font-sans flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white">إعدادات النموذج (Pattern Settings)</h3>
            {isHarmonic && validatePattern && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                validation.status === 'valid'
                  ? 'bg-[#00C087]/20 text-[#00C087] border border-[#00C087]/40'
                  : validation.status === 'warning'
                  ? 'bg-[#FF9800]/20 text-[#FF9800] border border-[#FF9800]/40'
                  : 'bg-[#F23645]/20 text-[#F23645] border border-[#F23645]/40'
              }`}>
                {validation.matchedPattern || 'Harmonic'} ({validation.score}%)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-4 border-b border-[#2A2E39] bg-[#171B26] overflow-x-auto">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'style'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#8F9CAE] hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>النمط (Style)</span>
          </button>

          <button
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'labels'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#8F9CAE] hover:text-white'
            }`}
          >
            <Tag size={13} />
            <span>التسميات (Labels)</span>
          </button>

          {isHarmonic && (
            <button
              onClick={() => setActiveTab('ratios')}
              className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ratios'
                  ? 'border-[#2962FF] text-[#2962FF]'
                  : 'border-transparent text-[#8F9CAE] hover:text-white'
              }`}
            >
              <Percent size={13} />
              <span>النسب والتحقق (Ratios)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('coordinates')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coordinates'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#8F9CAE] hover:text-white'
            }`}
          >
            <MapPin size={13} />
            <span>الإحداثيات (Coords)</span>
          </button>

          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'visibility'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#8F9CAE] hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>الظهور (Visibility)</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-[#2962FF] text-[#2962FF]'
                : 'border-transparent text-[#8F9CAE] hover:text-white'
            }`}
          >
            <Bell size={13} />
            <span>التنبيهات (Alerts)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto max-h-[460px] space-y-4">
          {/* TAB 1: STYLE */}
          {activeTab === 'style' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* Border Line Color */}
                <div>
                  <label className="block text-[#8F9CAE] mb-1.5">لون الحدود</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.lineColor}
                      onChange={(e) => updateDrawing(drawing.id, { style: { ...style, lineColor: e.target.value } })}
                      className="w-8 h-8 rounded border border-[#363C4E] bg-transparent cursor-pointer p-0.5"
                    />
                    <div className="grid grid-cols-5 gap-1">
                      {PRESET_COLORS.slice(0, 5).map(c => (
                        <button
                          key={c}
                          onClick={() => updateDrawing(drawing.id, { style: { ...style, lineColor: c } })}
                          className="w-5 h-5 rounded border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fill Color */}
                <div>
                  <label className="block text-[#8F9CAE] mb-1.5">لون التعبئة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fillColor}
                      onChange={(e) => updateDrawing(drawing.id, { fillColor: e.target.value })}
                      className="w-8 h-8 rounded border border-[#363C4E] bg-transparent cursor-pointer p-0.5"
                    />
                    <div className="grid grid-cols-5 gap-1">
                      {PRESET_COLORS.slice(5).map(c => (
                        <button
                          key={c}
                          onClick={() => updateDrawing(drawing.id, { fillColor: c })}
                          className="w-5 h-5 rounded border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Width and Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8F9CAE] mb-1.5">سماكة الخط ({style.lineWidth}px)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(px => (
                      <button
                        key={px}
                        onClick={() => updateDrawing(drawing.id, { style: { ...style, lineWidth: px } })}
                        className={`flex-1 py-1.5 rounded border text-center font-mono ${
                          style.lineWidth === px
                            ? 'bg-[#2962FF] border-[#2962FF] text-white'
                            : 'border-[#2A2E39] bg-[#151924] text-[#8F9CAE] hover:text-white'
                        }`}
                      >
                        {px}px
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1.5">نمط الخط</label>
                  <div className="flex gap-1">
                    {(['solid', 'dashed', 'dotted'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => updateDrawing(drawing.id, { style: { ...style, lineStyle: st } })}
                        className={`flex-1 py-1.5 rounded border text-center capitalize ${
                          style.lineStyle === st
                            ? 'bg-[#2962FF] border-[#2962FF] text-white'
                            : 'border-[#2A2E39] bg-[#151924] text-[#8F9CAE] hover:text-white'
                        }`}
                      >
                        {st === 'solid' ? 'متصل' : st === 'dashed' ? 'متقطع' : 'منقط'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Background Fill & Opacity */}
              <div className="bg-[#151924] p-3 rounded-lg border border-[#2A2E39] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">تعبئة المضلعات والمثلثات</div>
                    <div className="text-[10px] text-[#8F9CAE]">تظليل شفاف داخل أضلاع النموذج</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={fillBackground !== false}
                    onChange={(e) => updateDrawing(drawing.id, { fillBackground: e.target.checked })}
                    className="w-4 h-4 rounded border-[#363C4E] bg-[#151924] text-[#2962FF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#8F9CAE] mb-1">
                    <span>درجة شفافية التعبئة</span>
                    <span className="font-mono font-bold text-white">{Math.round(fillOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={fillOpacity}
                    onChange={(e) => updateDrawing(drawing.id, { fillOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#2A2E39] rounded-lg appearance-none cursor-pointer accent-[#2962FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LABELS */}
          {activeTab === 'labels' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-[#151924] p-3 rounded-lg border border-[#2A2E39]">
                <div>
                  <div className="font-medium text-white">إظهار أسماء النقاط</div>
                  <div className="text-[10px] text-[#8F9CAE]">عرض أحرف القمم والقيعان فوق النقاط</div>
                </div>
                <input
                  type="checkbox"
                  checked={showPointLabels !== false}
                  onChange={(e) => updateDrawing(drawing.id, { showPointLabels: e.target.checked })}
                  className="w-4 h-4 rounded border-[#363C4E] bg-[#151924] text-[#2962FF] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[#8F9CAE] mb-1.5">تسميات النقاط الحالية</label>
                <div className="grid grid-cols-5 gap-2">
                  {points.map((_, i) => (
                    <div key={i} className="flex flex-col items-center bg-[#151924] p-2 rounded border border-[#2A2E39]">
                      <span className="text-[10px] text-[#8F9CAE] mb-1">نقطة {i + 1}</span>
                      <input
                        type="text"
                        value={pointLabels[i] || `P${i + 1}`}
                        onChange={(e) => {
                          const next = [...pointLabels];
                          next[i] = e.target.value;
                          updateDrawing(drawing.id, { pointLabels: next });
                        }}
                        className="w-full text-center bg-[#1E222D] border border-[#363C4E] rounded px-1 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RATIOS & VALIDATION */}
          {activeTab === 'ratios' && isHarmonic && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-[#151924] p-3 rounded-lg border border-[#2A2E39]">
                <div>
                  <div className="font-medium text-white">إظهار نسب فيبوناتشي</div>
                  <div className="text-[10px] text-[#8F9CAE]">عرض نسب التصحيح والامتداد على الأضلاع</div>
                </div>
                <input
                  type="checkbox"
                  checked={showRatios !== false}
                  onChange={(e) => updateDrawing(drawing.id, { showRatios: e.target.checked })}
                  className="w-4 h-4 rounded border-[#363C4E] bg-[#151924] text-[#2962FF] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-[#151924] p-3 rounded-lg border border-[#2A2E39]">
                <div>
                  <div className="font-medium text-white">التحقق البصري من النموذج</div>
                  <div className="text-[10px] text-[#8F9CAE]">تلوين النسب (أخضر للمطابق، برتقالي للقريب، أحمر للخارج)</div>
                </div>
                <input
                  type="checkbox"
                  checked={validatePattern !== false}
                  onChange={(e) => updateDrawing(drawing.id, { validatePattern: e.target.checked })}
                  className="w-4 h-4 rounded border-[#363C4E] bg-[#151924] text-[#2962FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[#8F9CAE] mb-1">
                  <span>هامش القبول والتسامح للنسب</span>
                  <span className="font-mono font-bold text-white">±{tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#2A2E39] rounded-lg appearance-none cursor-pointer accent-[#2962FF]"
                />
              </div>

              {/* Ratios Table */}
              <div className="bg-[#151924] rounded-lg border border-[#2A2E39] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#2A2E39] font-medium text-white flex items-center justify-between">
                  <span>النسب المقاسة حالياً</span>
                  <span className="text-[10px] text-[#8F9CAE]">مقارنة مع Gartley/Bat/Butterfly/Crab</span>
                </div>
                <div className="divide-y divide-[#2A2E39]/60">
                  {validation.details.map((d, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-white">{d.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#8F9CAE]">الهدف: {d.target}</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          d.inTolerance
                            ? 'bg-[#00C087]/20 text-[#00C087]'
                            : 'bg-[#F23645]/20 text-[#F23645]'
                        }`}>
                          {d.ratio.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COORDINATES */}
          {activeTab === 'coordinates' && (
            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-[#8F9CAE]">
                يمكنك تعديل الأسعار وتواريخ النقاط يدوياً بدقة، وسيتم تحديث النموذج والنسب تلقائياً.
              </p>
              <div className="space-y-2">
                {points.map((pt, idx) => (
                  <div key={idx} className="bg-[#151924] p-2.5 rounded-lg border border-[#2A2E39] flex items-center justify-between gap-3">
                    <div className="w-12 font-bold text-[#2962FF] font-mono text-center bg-[#1E222D] py-1 rounded">
                      {pointLabels[idx] || `P${idx + 1}`}
                    </div>

                    <div className="flex-1">
                      <label className="text-[9px] text-[#8F9CAE] block mb-0.5">السعر (Price)</label>
                      <input
                        type="number"
                        step="any"
                        value={pt.price}
                        onChange={(e) => handleCoordChange(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1E222D] border border-[#363C4E] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[9px] text-[#8F9CAE] block mb-0.5">التاريخ والوقت</label>
                      <input
                        type="datetime-local"
                        value={formatDateTime(pt.time)}
                        onChange={(e) => handleCoordChange(idx, 'time', parseDateTime(e.target.value))}
                        className="w-full bg-[#1E222D] border border-[#363C4E] rounded px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-3 text-xs">
              <label className="block text-[#8F9CAE]">الفواصل الزمنية التي يظهر عليها النموذج:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'كافة الفواصل الزمنية' },
                  { id: '1m', label: '1 دقيقة' },
                  { id: '5m', label: '5 دقائق' },
                  { id: '15m', label: '15 دقيقة' },
                  { id: '1h', label: 'ساعة واحدة' },
                  { id: '4h', label: '4 ساعات' },
                  { id: '1d', label: 'يومي (1D)' },
                ].map(item => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 bg-[#151924] p-2.5 rounded border border-[#2A2E39] cursor-pointer hover:border-[#363C4E]"
                  >
                    <input
                      type="checkbox"
                      checked={visibleIntervals.includes(item.id)}
                      onChange={(e) => {
                        let next = [...visibleIntervals];
                        if (e.target.checked) next.push(item.id);
                        else next = next.filter(i => i !== item.id);
                        updateDrawing(drawing.id, { visibleIntervals: next });
                      }}
                      className="rounded border-[#363C4E] bg-[#1E222D] text-[#2962FF]"
                    />
                    <span className="text-white text-[11px]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#151924] p-3 rounded-lg border border-[#2A2E39] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">تفعيل التنبيه السعري</div>
                    <div className="text-[10px] text-[#8F9CAE]">إشعار فوري عند اكتمال النموذج أو وصول السعر</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alert?.enabled ?? false}
                    onChange={(e) => updateDrawing(drawing.id, {
                      alert: {
                        enabled: e.target.checked,
                        condition: 'CROSS',
                        frequency: 'ONCE',
                        levelValue: points[points.length - 1]?.price,
                      }
                    })}
                    className="w-4 h-4 rounded border-[#363C4E] bg-[#151924] text-[#2962FF] cursor-pointer"
                  />
                </div>

                {alert?.enabled && (
                  <div className="space-y-2 pt-2 border-t border-[#2A2E39]">
                    <div>
                      <label className="text-[10px] text-[#8F9CAE] block mb-1">الشرط</label>
                      <select
                        value={alert.condition}
                        onChange={(e) => updateDrawing(drawing.id, { alert: { ...alert, condition: e.target.value as any } })}
                        className="w-full bg-[#1E222D] border border-[#363C4E] rounded px-2.5 py-1.5 text-white text-xs"
                      >
                        <option value="CROSS">ملامسة مستوى النقطة الأخيرة (D)</option>
                        <option value="CROSS_UP">اختراق لأعلى</option>
                        <option value="CROSS_DOWN">كسر لأسفل</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8F9CAE] block mb-1">التكرار</label>
                      <select
                        value={alert.frequency}
                        onChange={(e) => updateDrawing(drawing.id, { alert: { ...alert, frequency: e.target.value as any } })}
                        className="w-full bg-[#1E222D] border border-[#363C4E] rounded px-2.5 py-1.5 text-white text-xs"
                      >
                        <option value="ONCE">مرة واحدة فقط</option>
                        <option value="EVERY_TIME">في كل مرة يتحقق فيها الشرط</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2A2E39] bg-[#151924] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#2A2E39] hover:bg-[#363C4E] text-[#D1D4DC] transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-[#2962FF] hover:bg-[#1E4FD9] text-white transition-colors"
          >
            حفظ وتطبيق
          </button>
        </div>
      </div>
    </div>
  );
};
