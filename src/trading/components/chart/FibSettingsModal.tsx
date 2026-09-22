import React, { useState } from 'react';
import { X, Layers, Sliders, MapPin, Eye, Bell, Plus, Trash2 } from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';
import { FibLevelConfig } from './fibGannData';

interface FibSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: TrendLineDrawing | null;
}

type TabType = 'levels' | 'style' | 'coordinates' | 'visibility' | 'alerts';

export const FibSettingsModal: React.FC<FibSettingsModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const [activeTab, setActiveTab] = useState<TabType>('levels');
  const [newLevelVal, setNewLevelVal] = useState('');

  if (!isOpen || !drawing) return null;

  const { levels = [], style, point1, point2, point3, reversed, showLabels, labelsPosition, fillBackground, fillOpacity, extendLeft, extendRight, visibleIntervals, alert } = drawing;

  const handleLevelToggle = (idx: number, enabled: boolean) => {
    const nextLevels = [...levels];
    nextLevels[idx] = { ...nextLevels[idx], enabled };
    updateDrawing(drawing.id, { levels: nextLevels });
  };

  const handleLevelColorChange = (idx: number, color: string) => {
    const nextLevels = [...levels];
    nextLevels[idx] = { ...nextLevels[idx], color };
    updateDrawing(drawing.id, { levels: nextLevels });
  };

  const handleLevelValChange = (idx: number, val: number) => {
    const nextLevels = [...levels];
    nextLevels[idx] = { ...nextLevels[idx], value: val, label: String(val) };
    updateDrawing(drawing.id, { levels: nextLevels });
  };

  const handleAddLevel = () => {
    const num = parseFloat(newLevelVal);
    if (isNaN(num)) return;
    const newLvl: FibLevelConfig = {
      value: num,
      label: String(num),
      color: '#2962FF',
      enabled: true,
    };
    updateDrawing(drawing.id, { levels: [...levels, newLvl] });
    setNewLevelVal('');
  };

  const handleDeleteLevel = (idx: number) => {
    const next = levels.filter((_, i) => i !== idx);
    updateDrawing(drawing.id, { levels: next });
  };

  const handleCoordChange = (pointKey: 'point1' | 'point2' | 'point3', field: 'price' | 'time', value: number) => {
    const target = drawing[pointKey] || { time: Math.floor(Date.now() / 1000), price: 0 };
    updateDrawing(drawing.id, {
      [pointKey]: { ...target, [field]: value },
    });
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
          <h3 className="font-semibold text-sm text-white">إعدادات فيبوناتشي وجان (Fibonacci & Gann Settings)</h3>
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
            { id: 'levels', label: 'المستويات', icon: Layers },
            { id: 'style', label: 'المظهر والتعبئة', icon: Sliders },
            { id: 'coordinates', label: 'الإحداثيات', icon: MapPin },
            { id: 'visibility', label: 'الظهور', icon: Eye },
            { id: 'alerts', label: 'التنبيهات', icon: Bell },
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
        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-4 text-xs custom-scrollbar">

          {/* TAB 1: LEVELS TABLE */}
          {activeTab === 'levels' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#8F9CAE] pb-1 border-b border-[#2A2E39]">
                <span>المستوى (القيمة)</span>
                <span>اللون والتفعيل</span>
              </div>

              {/* Levels list (grid of 2 columns) */}
              <div className="grid grid-cols-2 gap-2">
                {levels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1.5 gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lvl.enabled}
                        onChange={e => handleLevelToggle(idx, e.target.checked)}
                        className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                      />
                      <input
                        type="number"
                        step="any"
                        value={lvl.value}
                        onChange={e => handleLevelValChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-[#1E222D] border border-[#2A2E39] rounded px-1.5 py-0.5 text-white font-mono text-xs focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={lvl.color}
                        onChange={e => handleLevelColorChange(idx, e.target.value)}
                        className="w-6 h-6 rounded bg-transparent cursor-pointer"
                      />
                      <button
                        onClick={() => handleDeleteLevel(idx)}
                        className="p-1 text-[#5A6478] hover:text-[#F23645] rounded"
                        title="حذف المستوى"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add custom level */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#2A2E39]">
                <input
                  type="number"
                  step="any"
                  placeholder="مستوى جديد (مثلاً 0.886)"
                  value={newLevelVal}
                  onChange={e => setNewLevelVal(e.target.value)}
                  className="bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-[#2962FF] w-48 font-mono"
                />
                <button
                  onClick={handleAddLevel}
                  className="px-3 py-1 bg-[#2962FF] hover:bg-[#1E4FD9] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>إضافة مستوى</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STYLE & FILLS */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              {/* Background Fill & Opacity */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">تلوين المساحات بين المستويات (Background Fills)</span>
                  <input
                    type="checkbox"
                    checked={fillBackground ?? true}
                    onChange={e => updateDrawing(drawing.id, { fillBackground: e.target.checked })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#8F9CAE] mb-1 text-[11px]">
                    <span>شفافية التعبئة:</span>
                    <span>{Math.round((fillOpacity ?? 0.12) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.5"
                    step="0.02"
                    value={fillOpacity ?? 0.12}
                    onChange={e => updateDrawing(drawing.id, { fillOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-[#2962FF] h-1.5 bg-[#1E222D] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Reverse & Labels */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">عكس اتجاه المستويات (Reverse 0% ↔ 100%)</span>
                  <input
                    type="checkbox"
                    checked={reversed ?? false}
                    onChange={e => updateDrawing(drawing.id, { reversed: e.target.checked })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">إظهار الأسعار والنسب بجانب الخطوط (Labels)</span>
                  <input
                    type="checkbox"
                    checked={showLabels !== false}
                    onChange={e => updateDrawing(drawing.id, { showLabels: e.target.checked })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">موضع التسميات:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDrawing(drawing.id, { labelsPosition: 'right' })}
                      className={`px-2.5 py-1 rounded text-xs border ${
                        (labelsPosition || 'right') === 'right'
                          ? 'bg-[#2962FF]/20 border-[#2962FF] text-[#2962FF]'
                          : 'border-[#2A2E39] text-[#8F9CAE]'
                      }`}
                    >
                      يمين (Right)
                    </button>
                    <button
                      onClick={() => updateDrawing(drawing.id, { labelsPosition: 'left' })}
                      className={`px-2.5 py-1 rounded text-xs border ${
                        labelsPosition === 'left'
                          ? 'bg-[#2962FF]/20 border-[#2962FF] text-[#2962FF]'
                          : 'border-[#2A2E39] text-[#8F9CAE]'
                      }`}
                    >
                      يسار (Left)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">تمديد الخطوط لليسار (Extend Left)</span>
                  <input
                    type="checkbox"
                    checked={extendLeft ?? false}
                    onChange={e => updateDrawing(drawing.id, { extendLeft: e.target.checked })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white">تمديد الخطوط لليمين (Extend Right)</span>
                  <input
                    type="checkbox"
                    checked={extendRight ?? false}
                    onChange={e => updateDrawing(drawing.id, { extendRight: e.target.checked })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Line Style & Thickness */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8F9CAE] mb-1">سماكة الخطوط</label>
                  <select
                    value={style.lineWidth}
                    onChange={e => updateDrawing(drawing.id, { style: { ...style, lineWidth: parseInt(e.target.value) } })}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>{w}px</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1">نمط الخطوط</label>
                  <select
                    value={style.lineStyle}
                    onChange={e => updateDrawing(drawing.id, { style: { ...style, lineStyle: e.target.value as any } })}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="solid">متصل (Solid)</option>
                    <option value="dashed">متقطع (Dashed)</option>
                    <option value="dotted">منقط (Dotted)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COORDINATES */}
          {activeTab === 'coordinates' && (
            <div className="space-y-3">
              {/* P1 */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2">
                <div className="font-semibold text-white text-[11px] pb-1 border-b border-[#262B3D]">النقطة الأولى (P1)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">السعر</label>
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

              {/* P2 */}
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2">
                <div className="font-semibold text-white text-[11px] pb-1 border-b border-[#262B3D]">النقطة الثانية (P2)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#8F9CAE] text-[10px] mb-1">السعر</label>
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

              {/* P3 (if exists) */}
              {point3 && (
                <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-2">
                  <div className="font-semibold text-white text-[11px] pb-1 border-b border-[#262B3D]">النقطة الثالثة (P3)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#8F9CAE] text-[10px] mb-1">السعر</label>
                      <input
                        type="number"
                        step="any"
                        value={point3.price}
                        onChange={e => handleCoordChange('point3', 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8F9CAE] text-[10px] mb-1">التاريخ والوقت</label>
                      <input
                        type="datetime-local"
                        value={formatDateTime(point3.time)}
                        onChange={e => handleCoordChange('point3', 'time', parseDateTime(e.target.value))}
                        className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-[#2962FF]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-3">
              <p className="text-[#8F9CAE] text-[11px]">حدد الفواصل الزمنية التي تظهر عليها هذه الأداة:</p>
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

          {/* TAB 5: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="bg-[#131722] border border-[#2A2E39] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">تفعيل التنبيه السعري على مستوى فيبوناتشي</span>
                  <input
                    type="checkbox"
                    checked={alert?.enabled ?? false}
                    onChange={e => updateDrawing(drawing.id, {
                      alert: {
                        enabled: e.target.checked,
                        condition: alert?.condition || 'CROSS',
                        frequency: alert?.frequency || 'ONCE',
                        levelValue: alert?.levelValue || 0.618,
                      }
                    })}
                    className="rounded bg-[#1E222D] border-[#2A2E39] text-[#2962FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1">المستوى المستهدف (Fib Level)</label>
                  <select
                    value={alert?.levelValue || 0.618}
                    onChange={e => updateDrawing(drawing.id, {
                      alert: {
                        ...(alert || { enabled: true, condition: 'CROSS', frequency: 'ONCE' }),
                        levelValue: parseFloat(e.target.value),
                      }
                    })}
                    className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    {levels.map((lvl, idx) => (
                      <option key={idx} value={lvl.value}>
                        {lvl.value} ({Math.round(lvl.value * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8F9CAE] mb-1">الشرط (Condition)</label>
                  <select
                    value={alert?.condition || 'CROSS'}
                    onChange={e => updateDrawing(drawing.id, {
                      alert: {
                        ...(alert || { enabled: true, frequency: 'ONCE' }),
                        condition: e.target.value as any,
                      }
                    })}
                    className="w-full bg-[#1E222D] border border-[#2A2E39] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2962FF]"
                  >
                    <option value="CROSS">ملامسة أو تقاطع السعر مع المستوى (Crossing)</option>
                    <option value="CROSS_UP">اختراق للأعلى (Crossing Up)</option>
                    <option value="CROSS_DOWN">كسر للأسفل (Crossing Down)</option>
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
