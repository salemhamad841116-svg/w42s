import React, { useState } from 'react';
import { X, Sliders, Type, MapPin, Eye, Bell, Check } from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';

interface DrawingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: TrendLineDrawing | null;
}

type TabType = 'style' | 'text' | 'coordinates' | 'visibility' | 'alert';

const PRESET_COLORS = [
  '#2962FF', '#00C087', '#F23645', '#FF9800', '#E040FB', 
  '#00BCD4', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

export const DrawingSettingsModal: React.FC<DrawingSettingsModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const [activeTab, setActiveTab] = useState<TabType>('style');

  if (!isOpen || !drawing) return null;

  // Local draft state
  const { style, text, point1, point2, visibleIntervals, alert } = drawing;

  const handleStyleChange = (key: string, value: any) => {
    updateDrawing(drawing.id, {
      style: { ...style, [key]: value },
    });
  };

  const handleTextChange = (key: string, value: any) => {
    const currentText = text || {
      content: '',
      color: style.lineColor,
      fontSize: 12,
      bold: false,
      italic: false,
      alignment: 'above',
    };
    updateDrawing(drawing.id, {
      text: { ...currentText, [key]: value },
    });
  };

  const handleCoordChange = (point: 'point1' | 'point2', field: 'price' | 'time', value: number) => {
    updateDrawing(drawing.id, {
      [point]: { ...drawing[point], [field]: value },
    });
  };

  const handleAlertChange = (key: string, value: any) => {
    const currentAlert = alert || {
      enabled: true,
      condition: 'CROSS',
      frequency: 'ONCE',
    };
    updateDrawing(drawing.id, {
      alert: { ...currentAlert, [key]: value },
    });
  };

  const formatDateTime = (timestampSec: number) => {
    try {
      const d = new Date(timestampSec * 1000);
      return d.toISOString().slice(0, 16);
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
        className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-white font-sans flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <h3 className="font-semibold text-sm text-white">إعدادات خط الاتجاه (Trend Line Settings)</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A2E39] px-4 bg-[#181C27] text-xs">
          {[
            { id: 'style', label: 'المظهر', icon: Sliders },
            { id: 'text', label: 'النص', icon: Type },
            { id: 'coordinates', label: 'الإحداثيات', icon: MapPin },
            { id: 'visibility', label: 'الظهور', icon: Eye },
            { id: 'alert', label: 'التنبيه', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2.5 px-3 flex items-center gap-1.5 font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#2962FF] text-[#2962FF]'
                    : 'border-transparent text-[#8F9CAE] hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 text-xs custom-scrollbar">

          {/* TAB 1: STYLE */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              {/* Color & Opacity */}
              <div>
                <label className="block text-[#8F9CAE] font-medium mb-1.5">اللون والشفافية</label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="grid grid-cols-5 gap-1.5 flex-1">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => handleStyleChange('lineColor', c)}
                        className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-transform hover:scale-105"
                        style={{ backgroundColor: c }}
                      >
                        {style.lineColor === c && <Check size={12} className="text-black/80 font-bold" />}
                      </button>
                    ))}
                  </div>
                  <input
                    type="color"
                    value={style.lineColor}
                    onChange={e => handleStyleChange('lineColor', e.target.value)}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-[#8F9CAE] mb-1 text-[11px]">
                  <span>درجة الشفافية:</span>
                  <span>{Math.round(style.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={style.opacity}
                  onChange={e => handleStyleChange('opacity', parseFloat(e.target.value))}
                  className="w-full accent-[#2962FF] h-1.5 bg-[#131722] rounded cursor-pointer"
                />
              </div>

              {/* Thickness & Style */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8F9CAE] font-medium mb-1.5">سماكة الخط</label>
                  <select
                    value={style.lineWidth}
                    onChange={e => handleStyleChange('lineWidth', parseInt(e.target.value))}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>{w}px</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] font-medium mb-1.5">نمط الخط</label>
                  <select
                    value={style.lineStyle}
                    onChange={e => handleStyleChange('lineStyle', e.target.value)}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="solid">متصل (Solid)</option>
                    <option value="dashed">متقطع (Dashed)</option>
                    <option value="dotted">منقط (Dotted)</option>
                  </select>
                </div>
              </div>

              {/* Endcaps & Extensions */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-white">امتداد الخط لليسار (Extend Left)</span>
                  <input
                    type="checkbox"
                    checked={style.extendLeft}
                    onChange={e => handleStyleChange('extendLeft', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">امتداد الخط لليمين (Extend Right)</span>
                  <input
                    type="checkbox"
                    checked={style.extendRight}
                    onChange={e => handleStyleChange('extendRight', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">إظهار نقطة المنتصف (Show Midpoint)</span>
                  <input
                    type="checkbox"
                    checked={style.showMidpoint}
                    onChange={e => handleStyleChange('showMidpoint', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[#8F9CAE] font-medium mb-1.5">محتوى النص</label>
                <textarea
                  value={text?.content || ''}
                  onChange={e => handleTextChange('content', e.target.value)}
                  placeholder="أدخل النص الظاهر مع الخط..."
                  rows={3}
                  className="w-full bg-[#131722] border border-[#2A2E39] rounded p-2 text-white focus:outline-none focus:border-[#2962FF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8F9CAE] font-medium mb-1.5">حجم الخط</label>
                  <select
                    value={text?.fontSize || 12}
                    onChange={e => handleTextChange('fontSize', parseInt(e.target.value))}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    {[10, 12, 14, 16, 18, 20].map(s => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] font-medium mb-1.5">المحاذاة</label>
                  <select
                    value={text?.alignment || 'above'}
                    onChange={e => handleTextChange('alignment', e.target.value)}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="above">أعلى الخط</option>
                    <option value="center">في وسط الخط</option>
                    <option value="below">أسفل الخط</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={text?.bold || false}
                    onChange={e => handleTextChange('bold', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0"
                  />
                  <span className="font-bold">عريض (Bold)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={text?.italic || false}
                    onChange={e => handleTextChange('italic', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0"
                  />
                  <span className="italic">مائل (Italic)</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: COORDINATES */}
          {activeTab === 'coordinates' && (
            <div className="space-y-4">
              {/* Point 1 */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2">
                <div className="font-semibold text-white text-[11px] pb-1 border-b border-[#262B3D]">النقطة الأولى (P1)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">السعر (Price)</label>
                    <input
                      type="number"
                      step="any"
                      value={point1.price}
                      onChange={e => handleCoordChange('point1', 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2962FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      value={formatDateTime(point1.time)}
                      onChange={e => handleCoordChange('point1', 'time', parseDateTime(e.target.value))}
                      className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-[#2962FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Point 2 */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2">
                <div className="font-semibold text-white text-[11px] pb-1 border-b border-[#262B3D]">النقطة الثانية (P2)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">السعر (Price)</label>
                    <input
                      type="number"
                      step="any"
                      value={point2.price}
                      onChange={e => handleCoordChange('point2', 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2962FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      value={formatDateTime(point2.time)}
                      onChange={e => handleCoordChange('point2', 'time', parseDateTime(e.target.value))}
                      className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-[#2962FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-3">
              <p className="text-[#8F9CAE] text-[11px]">حدد الفواصل الزمنية التي يظهر عليها هذا الخط:</p>
              <div className="grid grid-cols-2 gap-2 bg-[#131722] border border-[#2A2E39] rounded-lg p-3">
                {[
                  { id: 'all', label: 'كافة الفواصل (All)' },
                  { id: '1m', label: 'دقيقة واحدة (1m)' },
                  { id: '5m', label: '5 دقائق (5m)' },
                  { id: '15m', label: '15 دقيقة (15m)' },
                  { id: '1h', label: 'ساعة واحدة (1h)' },
                  { id: '4h', label: '4 ساعات (4h)' },
                  { id: '1D', label: 'يومي (1D)' },
                ].map(interval => {
                  const isChecked = visibleIntervals.includes('all') || visibleIntervals.includes(interval.id);
                  return (
                    <label key={interval.id} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          let next = [...visibleIntervals];
                          if (interval.id === 'all') {
                            next = e.target.checked ? ['all'] : ['15m'];
                          } else {
                            next = next.filter(i => i !== 'all');
                            if (e.target.checked) next.push(interval.id);
                            else next = next.filter(i => i !== interval.id);
                            if (next.length === 0) next = ['all'];
                          }
                          updateDrawing(drawing.id, { visibleIntervals: next });
                        }}
                        className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0"
                      />
                      <span className="text-white">{interval.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ALERT */}
          {activeTab === 'alert' && (
            <div className="space-y-3">
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">تفعيل التنبيه السعري على الخط</span>
                  <input
                    type="checkbox"
                    checked={alert?.enabled ?? false}
                    onChange={e => handleAlertChange('enabled', e.target.checked)}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1">الشرط (Condition)</label>
                  <select
                    value={alert?.condition || 'CROSS'}
                    onChange={e => handleAlertChange('condition', e.target.value)}
                    className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="CROSS">ملامسة أو تقاطع السعر مع الخط (Crossing)</option>
                    <option value="CROSS_UP">اختراق للأعلى (Crossing Up)</option>
                    <option value="CROSS_DOWN">كسر للأسفل (Crossing Down)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1">التكرار</label>
                  <select
                    value={alert?.frequency || 'ONCE'}
                    onChange={e => handleAlertChange('frequency', e.target.value)}
                    className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="ONCE">مرة واحدة فقط (Only Once)</option>
                    <option value="EVERY_TIME">في كل مرة يتحقق الشرط (Every Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2A2E39] flex items-center justify-end gap-2 bg-[#151924]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2962FF] hover:bg-[#1E4FD9] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
