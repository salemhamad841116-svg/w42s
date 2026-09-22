import React, { useState } from 'react';
import { X, Sliders, Type, MapPin, Eye, Bell, Check, ArrowRight } from 'lucide-react';
import { TrendLineDrawing, useDrawingStore, DrawingPoint } from '../../stores/drawingStore';
import { getShapeToolById } from './shapesData';

interface ShapeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: TrendLineDrawing | null;
}

type TabType = 'style' | 'text' | 'coordinates' | 'visibility' | 'alerts';

const PRESET_COLORS = [
  '#2962FF', '#00BCD4', '#00C087', '#FF9800', '#F23645', 
  '#E040FB', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

export const ShapeSettingsModal: React.FC<ShapeSettingsModalProps> = ({
  isOpen,
  onClose,
  drawing,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const updateArrowSettings = useDrawingStore(state => state.updateArrowSettings);
  const [activeTab, setActiveTab] = useState<TabType>('style');

  if (!isOpen || !drawing) return null;

  const toolMeta = getShapeToolById(drawing.toolType);
  const toolName = toolMeta ? `${toolMeta.nameAr} (${toolMeta.nameEn})` : drawing.toolType;

  const {
    style,
    text,
    points = [drawing.point1, drawing.point2],
    fillColor = '#2962FF',
    fillOpacity = 0.2,
    fillBackground = true,
    visibleIntervals = ['all'],
    arrowSettings,
    alert,
  } = drawing;

  const isArrowTool = ['arrowMarker', 'arrow', 'arrowUp', 'arrowDown'].includes(drawing.toolType);
  const isFreehand = ['brush', 'highlighter'].includes(drawing.toolType);
  const isClosedShape = ['rectangle', 'rotatedRectangle', 'circle', 'ellipse', 'triangle'].includes(drawing.toolType);
  const hasFill = isClosedShape || ['path', 'polyline'].includes(drawing.toolType);

  const handleStyleChange = (key: string, value: any) => {
    updateDrawing(drawing.id, {
      style: { ...style, [key]: value },
    });
  };

  const handleTextChange = (key: string, value: any) => {
    const currentText = text || {
      content: '',
      color: style?.lineColor || '#2962FF',
      fontSize: 12,
      bold: false,
      italic: false,
      alignment: 'above',
    };
    updateDrawing(drawing.id, {
      text: { ...currentText, [key]: value },
    });
  };

  const handleCoordChange = (index: number, field: 'price' | 'time', value: number) => {
    const nextPoints = [...points];
    if (!nextPoints[index]) {
      nextPoints[index] = { time: Math.floor(Date.now() / 1000), price: 0 };
    }
    nextPoints[index] = {
      ...nextPoints[index],
      [field]: value,
    };

    const updates: Partial<TrendLineDrawing> = {
      points: nextPoints,
      point1: nextPoints[0] || drawing.point1,
      point2: nextPoints[1] || drawing.point2,
    };
    if (nextPoints[2]) updates.point3 = nextPoints[2];

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

  const intervalsList = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

  const toggleInterval = (interval: string) => {
    let nextIntervals: string[];
    if (visibleIntervals.includes('all')) {
      nextIntervals = [interval];
    } else if (visibleIntervals.includes(interval)) {
      nextIntervals = visibleIntervals.filter(i => i !== interval);
      if (nextIntervals.length === 0) nextIntervals = ['all'];
    } else {
      nextIntervals = [...visibleIntervals, interval];
    }
    updateDrawing(drawing.id, { visibleIntervals: nextIntervals });
  };

  return (
    <div className="drawing-settings-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none notranslate" translate="no">
      <div 
        className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-white font-sans flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2E39] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200">إعدادات {toolName}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#2A2E39] rounded text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-[#2A2E39] px-4 bg-[#181B24] gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('style')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition ${
              activeTab === 'style'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>المظهر</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition ${
              activeTab === 'text'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>النص</span>
          </button>

          {!isFreehand && (
            <button
              onClick={() => setActiveTab('coordinates')}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition ${
                activeTab === 'coordinates'
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>الإحداثيات</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('visibility')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition ${
              activeTab === 'visibility'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>الظهور</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>التنبيهات</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs text-gray-300">
          {activeTab === 'style' && (
            <div className="space-y-4">
              {/* Stroke controls */}
              <div className="space-y-2">
                <label className="text-gray-400 font-medium">لون وسمك الإطار الخارجي</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => handleStyleChange('lineColor', c)}
                        className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition flex items-center justify-center"
                        style={{ backgroundColor: c }}
                      >
                        {style?.lineColor === c && <Check className="w-3 h-3 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>

                  <select
                    value={style?.lineWidth || 2}
                    onChange={e => handleStyleChange('lineWidth', Number(e.target.value))}
                    className="bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-xs text-white"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>{w}px</option>
                    ))}
                  </select>

                  {!isFreehand && (
                    <select
                      value={style?.lineStyle || 'solid'}
                      onChange={e => handleStyleChange('lineStyle', e.target.value)}
                      className="bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="solid">متصل (Solid)</option>
                      <option value="dashed">متقطع (Dashed)</option>
                      <option value="dotted">منقط (Dotted)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Fill controls */}
              {hasFill && (
                <div className="pt-3 border-t border-[#2A2E39] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-300 font-medium flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fillBackground}
                        onChange={() => updateDrawing(drawing.id, { fillBackground: !fillBackground })}
                        className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                      />
                      <span>تعبئة الخلفية (Fill)</span>
                    </label>
                  </div>

                  {fillBackground && (
                    <div className="space-y-2 pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateDrawing(drawing.id, { fillColor: c })}
                            className="w-5 h-5 rounded-full border border-gray-600 hover:scale-110 transition flex items-center justify-center"
                            style={{ backgroundColor: c }}
                          >
                            {fillColor === c && <Check className="w-3 h-3 text-white drop-shadow" />}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-gray-400">
                          <span>نسبة الشفافية</span>
                          <span>{Math.round(fillOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(fillOpacity * 100)}
                          onChange={e => updateDrawing(drawing.id, { fillOpacity: Number(e.target.value) / 100 })}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Arrow controls */}
              {isArrowTool && (
                <div className="pt-3 border-t border-[#2A2E39] space-y-3">
                  <label className="text-gray-400 font-medium">إعدادات السهم</label>

                  {drawing.toolType === 'arrowMarker' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">اتجاه السهم:</span>
                        {(['up', 'down', 'left', 'right'] as const).map(dir => (
                          <button
                            key={dir}
                            onClick={() => updateArrowSettings(drawing.id, { arrowDirection: dir })}
                            className={`px-2.5 py-1 rounded text-xs border ${
                              arrowSettings?.arrowDirection === dir 
                                ? 'bg-blue-600 border-blue-400 text-white' 
                                : 'border-[#2A2E39] text-gray-400 hover:bg-[#2A2E39]'
                            }`}
                          >
                            {dir === 'up' && 'أعلى ↑'}
                            {dir === 'down' && 'أسفل ↓'}
                            {dir === 'left' && 'يسار ←'}
                            {dir === 'right' && 'يمين →'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {drawing.toolType === 'arrow' && (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arrowSettings?.arrowheadStart || false}
                          onChange={e => updateArrowSettings(drawing.id, { arrowheadStart: e.target.checked })}
                          className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                        />
                        <span>رأس البداية</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arrowSettings?.arrowheadEnd !== false}
                          onChange={e => updateArrowSettings(drawing.id, { arrowheadEnd: e.target.checked })}
                          className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                        />
                        <span>رأس النهاية</span>
                      </label>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span>حجم السهم</span>
                      <span>{arrowSettings?.arrowSize || 20}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={arrowSettings?.arrowSize || 20}
                      onChange={e => updateArrowSettings(drawing.id, { arrowSize: Number(e.target.value) })}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium">محتوى النص / الملاحظة</label>
                <textarea
                  value={text?.content || ''}
                  onChange={e => handleTextChange('content', e.target.value)}
                  placeholder="اكتب ملاحظة أو تسمية للأداة..."
                  className="w-full bg-[#2A2E39] border border-gray-600 rounded p-2 text-white text-xs resize-none focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">حجم الخط</label>
                  <select
                    value={text?.fontSize || 12}
                    onChange={e => handleTextChange('fontSize', Number(e.target.value))}
                    className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    {[10, 11, 12, 14, 16, 20, 24].map(s => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400">المحاذاة</label>
                  <select
                    value={text?.alignment || 'above'}
                    onChange={e => handleTextChange('alignment', e.target.value)}
                    className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    <option value="above">أعلى</option>
                    <option value="center">وسط</option>
                    <option value="below">أسفل</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={text?.bold || false}
                    onChange={e => handleTextChange('bold', e.target.checked)}
                    className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                  />
                  <span className="font-bold">عريض (Bold)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={text?.italic || false}
                    onChange={e => handleTextChange('italic', e.target.checked)}
                    className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                  />
                  <span className="italic">مائل (Italic)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'coordinates' && !isFreehand && (
            <div className="space-y-3">
              {points.slice(0, 4).map((pt, idx) => (
                <div key={idx} className="p-3 bg-[#181B24] rounded-lg border border-[#2A2E39] space-y-2">
                  <span className="font-semibold text-blue-400">النقطة {idx + 1}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-400 block mb-1">السعر</label>
                      <input
                        type="number"
                        step="any"
                        value={pt.price || 0}
                        onChange={e => handleCoordChange(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">الوقت والتاريخ</label>
                      <input
                        type="datetime-local"
                        value={formatDateTime(pt.time)}
                        onChange={e => handleCoordChange(idx, 'time', parseDateTime(e.target.value))}
                        className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="space-y-3">
              <label className="text-gray-400 font-medium block">إظهار الأداة في الفترات الزمنية:</label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-[#181B24] rounded border border-[#2A2E39] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleIntervals.includes('all')}
                    onChange={() => updateDrawing(drawing.id, { visibleIntervals: ['all'] })}
                    className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                  />
                  <span>جميع الفترات</span>
                </label>

                {intervalsList.map(int => (
                  <label key={int} className="flex items-center gap-2 p-2 bg-[#181B24] rounded border border-[#2A2E39] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleIntervals.includes('all') || visibleIntervals.includes(int)}
                      onChange={() => toggleInterval(int)}
                      className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                    />
                    <span>{int}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-200">
                <input
                  type="checkbox"
                  checked={alert?.enabled || false}
                  onChange={e => updateDrawing(drawing.id, {
                    alert: {
                      enabled: e.target.checked,
                      condition: alert?.condition || 'CROSS',
                      frequency: alert?.frequency || 'ONCE'
                    }
                  })}
                  className="rounded bg-[#2A2E39] border-gray-600 text-blue-600 focus:ring-0"
                />
                <span>تفعيل التنبيه عند ملامسة أو اختراق السعر للشكل</span>
              </label>

              {alert?.enabled && (
                <div className="p-3 bg-[#181B24] rounded-lg border border-[#2A2E39] space-y-3">
                  <div>
                    <label className="text-gray-400 block mb-1">الشرط</label>
                    <select
                      value={alert.condition}
                      onChange={e => updateDrawing(drawing.id, {
                        alert: { ...alert, condition: e.target.value as any }
                      })}
                      className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="CROSS">ملامسة أو تقاطع (Crossing)</option>
                      <option value="CROSS_UP">اختراق لأعلى (Crossing Up)</option>
                      <option value="CROSS_DOWN">كسر لأسفل (Crossing Down)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">التكرار</label>
                    <select
                      value={alert.frequency}
                      onChange={e => updateDrawing(drawing.id, {
                        alert: { ...alert, frequency: e.target.value as any }
                      })}
                      className="w-full bg-[#2A2E39] border border-gray-600 rounded px-2 py-1 text-white"
                    >
                      <option value="ONCE">مرة واحدة فقط</option>
                      <option value="EVERY_TIME">في كل مرة يحدث التقاطع</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2A2E39] flex justify-end gap-2 bg-[#151924]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
