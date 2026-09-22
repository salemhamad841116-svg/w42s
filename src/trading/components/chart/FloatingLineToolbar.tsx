import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trash2, Lock, Unlock, Settings, Bell, MoreHorizontal, 
  Copy, Layers, ArrowUp, ArrowDown, RotateCcw,
  Check, X, Type, GripVertical, BookmarkPlus
} from 'lucide-react';
import { TrendLineDrawing, useDrawingStore } from '../../stores/drawingStore';

interface FloatingLineToolbarProps {
  drawing: TrendLineDrawing;
  pixelPosition: { x: number; y: number };
  containerRect: DOMRect | null;
  onOpenSettings: () => void;
  onOpenAlert: () => void;
}

const PRESET_COLORS = [
  '#2962FF', '#00C087', '#F23645', '#FF9800', '#E040FB', 
  '#00BCD4', '#FFEB3B', '#FFFFFF', '#787B86', '#2196F3'
];

const THICKNESS_OPTIONS = [1, 2, 3, 4, 5];

export const FloatingLineToolbar: React.FC<FloatingLineToolbarProps> = ({
  drawing,
  pixelPosition,
  containerRect,
  onOpenSettings,
  onOpenAlert,
}) => {
  const updateDrawing = useDrawingStore(state => state.updateDrawing);
  const deleteDrawing = useDrawingStore(state => state.deleteDrawing);
  const toggleLock = useDrawingStore(state => state.toggleLock);
  const duplicateDrawing = useDrawingStore(state => state.duplicateDrawing);
  const bringToFront = useDrawingStore(state => state.bringToFront);
  const sendToBack = useDrawingStore(state => state.sendToBack);
  const resetDrawingStyle = useDrawingStore(state => state.resetDrawingStyle);
  const savedTemplates = useDrawingStore(state => state.savedTemplates);
  const saveTemplate = useDrawingStore(state => state.saveTemplate);
  const applyTemplate = useDrawingStore(state => state.applyTemplate);

  // Dragging the toolbar itself
  const [customOffset, setCustomOffset] = useState<{ x: number; y: number } | null>(null);
  const isDraggingToolbar = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0, mouseY: 0, initialX: 0, initialY: 0
  });

  // Active popovers
  const [activePopover, setActivePopover] = useState<'color' | 'style' | 'thickness' | 'text' | 'template' | 'more' | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [tempText, setTempText] = useState(drawing.text?.content || '');

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync temp text when drawing changes
  useEffect(() => {
    setTempText(drawing.text?.content || '');
  }, [drawing.text?.content]);

  // Compute docked position
  const computedPos = React.useMemo(() => {
    if (customOffset) return customOffset;
    if (!containerRect) return { x: pixelPosition.x, y: pixelPosition.y };

    const toolbarWidth = 420;
    const toolbarHeight = 44;

    let x = pixelPosition.x - toolbarWidth / 2;
    let y = pixelPosition.y - toolbarHeight - 16;

    // Viewport clamping
    if (x < 10) x = 10;
    if (x + toolbarWidth > containerRect.width - 10) {
      x = Math.max(10, containerRect.width - toolbarWidth - 10);
    }
    if (y < 10) {
      y = pixelPosition.y + 24; // flip below
    }
    if (y + toolbarHeight > containerRect.height - 10) {
      y = Math.max(10, containerRect.height - toolbarHeight - 10);
    }

    return { x, y };
  }, [pixelPosition, customOffset, containerRect]);

  // Handle toolbar dragging
  const handleDragPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingToolbar.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: computedPos.x,
      initialY: computedPos.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingToolbar.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;
      setCustomOffset({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    };

    const handlePointerUp = () => {
      isDraggingToolbar.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Close popover when clicking outside toolbar
  useEffect(() => {
    if (!activePopover) return;

    const handleOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopover]);

  const handleTextSave = () => {
    updateDrawing(drawing.id, {
      text: tempText.trim()
        ? {
            content: tempText.trim(),
            color: drawing.text?.color || drawing.style.lineColor,
            fontSize: drawing.text?.fontSize || 12,
            bold: drawing.text?.bold || false,
            italic: drawing.text?.italic || false,
            alignment: drawing.text?.alignment || 'above',
          }
        : undefined,
    });
    setActivePopover(null);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;
    saveTemplate(newTemplateName.trim(), drawing.style, drawing.text);
    setNewTemplateName('');
  };

  return (
    <div
      ref={toolbarRef}
      className="floating-line-toolbar absolute z-50 pointer-events-auto select-none notranslate animate-in fade-in zoom-in-95 duration-100"
      translate="no"
      style={{
        left: computedPos.x,
        top: computedPos.y,
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 bg-[#1E222D]/95 backdrop-blur-md border border-[#363C4E] rounded-lg shadow-2xl px-1.5 py-1 text-white">
        
        {/* 1. Drag Handle :: */}
        <div
          onPointerDown={handleDragPointerDown}
          className="p-1.5 text-[#6B788E] hover:text-white cursor-grab active:cursor-grabbing hover:bg-[#2A2E39] rounded transition-colors"
          title="سحب شريط الأدوات"
        >
          <GripVertical size={16} />
        </div>

        <div className="w-px h-5 bg-[#2A2E39] mx-0.5" />

        {/* 2. Template / Style Presets Button (田+) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'template' ? null : 'template'))}
            className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors flex items-center gap-1 ${
              activePopover === 'template' ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#8F9CAE] hover:text-white'
            }`}
            title="القوالب المحفوظة"
          >
            <BookmarkPlus size={16} />
          </button>

          {activePopover === 'template' && (
            <div className="absolute top-full mt-1.5 left-0 w-52 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-2 text-xs z-50" dir="rtl">
              <div className="font-semibold text-white mb-2 pb-1 border-b border-[#262B3D] text-[11px]">
                قوالب النمط (Templates)
              </div>
              
              {/* Save current */}
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  placeholder="اسم القالب الجديد"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  className="flex-1 bg-[#131722] border border-[#2A2E39] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2962FF]"
                />
                <button
                  onClick={handleSaveTemplate}
                  className="px-2 py-1 bg-[#2962FF] hover:bg-[#1E4FD9] text-white rounded text-xs font-semibold"
                >
                  حفظ
                </button>
              </div>

              {/* Template list */}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.keys(savedTemplates).length === 0 ? (
                  <div className="text-[10px] text-[#5A6478] text-center py-2">لا توجد قوالب محفوظة</div>
                ) : (
                  Object.keys(savedTemplates).map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        applyTemplate(drawing.id, name);
                        setActivePopover(null);
                      }}
                      className="w-full text-right px-2 py-1 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors truncate"
                    >
                      {name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Color & Opacity Picker */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'color' ? null : 'color'))}
            className="p-1.5 rounded hover:bg-[#2A2E39] transition-colors flex flex-col items-center justify-center gap-0.5"
            title="لون الخط والشفافية"
          >
            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: drawing.style.lineColor }} />
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: drawing.style.lineColor }} />
          </button>

          {activePopover === 'color' && (
            <div className="absolute top-full mt-1.5 left-0 w-48 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-2.5 z-50">
              <div className="text-[10px] text-[#8F9CAE] font-medium mb-1.5">اللون</div>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => updateDrawing(drawing.id, { style: { ...drawing.style, lineColor: c } })}
                    className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {drawing.style.lineColor === c && <Check size={12} className="text-black/80 font-bold" />}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] text-[#8F9CAE]">مخصص:</span>
                <input
                  type="color"
                  value={drawing.style.lineColor}
                  onChange={e => updateDrawing(drawing.id, { style: { ...drawing.style, lineColor: e.target.value } })}
                  className="w-7 h-6 rounded bg-transparent cursor-pointer"
                />
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex justify-between text-[10px] text-[#8F9CAE] mb-1">
                  <span>الشفافية</span>
                  <span>{Math.round(drawing.style.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={drawing.style.opacity}
                  onChange={e => updateDrawing(drawing.id, { style: { ...drawing.style, opacity: parseFloat(e.target.value) } })}
                  className="w-full accent-[#2962FF] h-1.5 bg-[#131722] rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Text Tool (T) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'text' ? null : 'text'))}
            className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors flex items-center justify-center ${
              drawing.text?.content ? 'text-[#2962FF]' : 'text-[#8F9CAE] hover:text-white'
            }`}
            title="نص وتسمية الخط"
          >
            <Type size={16} />
          </button>

          {activePopover === 'text' && (
            <div className="absolute top-full mt-1.5 left-0 w-60 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-3 z-50 text-xs" dir="rtl">
              <div className="font-semibold text-white mb-2 text-[11px]">نص الخط (Annotation)</div>
              <textarea
                value={tempText}
                onChange={e => setTempText(e.target.value)}
                placeholder="اكتب التسمية أو الملاحظة هنا..."
                rows={2}
                className="w-full bg-[#131722] border border-[#2A2E39] rounded p-2 text-xs text-white focus:outline-none focus:border-[#2962FF] mb-2 resize-none"
              />

              {/* Alignment */}
              <div className="flex items-center justify-between mb-3 text-[10px]">
                <span className="text-[#8F9CAE]">المحاذاة:</span>
                <div className="flex gap-1">
                  {(['above', 'center', 'below'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => updateDrawing(drawing.id, {
                        text: {
                          content: tempText,
                          color: drawing.text?.color || drawing.style.lineColor,
                          fontSize: drawing.text?.fontSize || 12,
                          bold: drawing.text?.bold || false,
                          italic: drawing.text?.italic || false,
                          alignment: align,
                        }
                      })}
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        (drawing.text?.alignment || 'above') === align
                          ? 'bg-[#2962FF]/20 border-[#2962FF] text-[#2962FF]'
                          : 'border-[#262B3D] text-[#8F9CAE] hover:text-white'
                      }`}
                    >
                      {align === 'above' ? 'أعلى' : align === 'center' ? 'وسط' : 'أسفل'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setActivePopover(null)}
                  className="px-2.5 py-1 text-xs text-[#8F9CAE] hover:text-white rounded"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleTextSave}
                  className="px-3 py-1 bg-[#2962FF] hover:bg-[#1E4FD9] text-white rounded text-xs font-semibold"
                >
                  تطبيق
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Line Thickness (1px - 5px) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'thickness' ? null : 'thickness'))}
            className="px-2 py-1 rounded hover:bg-[#2A2E39] transition-colors text-xs font-mono font-medium text-[#8F9CAE] hover:text-white"
            title="سماكة الخط"
          >
            {drawing.style.lineWidth}px
          </button>

          {activePopover === 'thickness' && (
            <div className="absolute top-full mt-1.5 left-0 w-28 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1.5 z-50 flex flex-col gap-1">
              {THICKNESS_OPTIONS.map(width => (
                <button
                  key={width}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineWidth: width } });
                    setActivePopover(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    drawing.style.lineWidth === width ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#8F9CAE] hover:bg-[#262B3D] hover:text-white'
                  }`}
                >
                  <span>{width}px</span>
                  <div className="w-10 bg-current rounded" style={{ height: width }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 6. Line Style (Solid, Dashed, Dotted) */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'style' ? null : 'style'))}
            className="p-1.5 rounded hover:bg-[#2A2E39] transition-colors text-[#8F9CAE] hover:text-white"
            title="نمط الخط (متصل / متقطع / منقط)"
          >
            {drawing.style.lineStyle === 'solid' && (
              <span className="font-mono text-sm leading-none">—</span>
            )}
            {drawing.style.lineStyle === 'dashed' && (
              <span className="font-mono text-sm leading-none">- -</span>
            )}
            {drawing.style.lineStyle === 'dotted' && (
              <span className="font-mono text-sm leading-none">···</span>
            )}
          </button>

          {activePopover === 'style' && (
            <div className="absolute top-full mt-1.5 left-0 w-32 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1.5 z-50 flex flex-col gap-1" dir="rtl">
              {[
                { id: 'solid', label: 'متصل', preview: '————' },
                { id: 'dashed', label: 'متقطع', preview: '- - - -' },
                { id: 'dotted', label: 'منقط', preview: '· · · ·' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    updateDrawing(drawing.id, { style: { ...drawing.style, lineStyle: s.id as any } });
                    setActivePopover(null);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    drawing.style.lineStyle === s.id ? 'bg-[#2A2E39] text-[#2962FF]' : 'text-[#8F9CAE] hover:bg-[#262B3D] hover:text-white'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="font-mono">{s.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#2A2E39] mx-0.5" />

        {/* 7. Settings Icon (⚙) */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-white hover:bg-[#2A2E39] transition-colors"
          title="الإعدادات المتقدمة"
        >
          <Settings size={16} />
        </button>

        {/* 8. Add Alert Icon (⏰+) */}
        <button
          onClick={onOpenAlert}
          className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
            drawing.alert?.enabled ? 'text-[#FF9800]' : 'text-[#8F9CAE] hover:text-white'
          }`}
          title="إضافة تنبيه على الخط"
        >
          <Bell size={16} />
        </button>

        {/* 9. Lock/Unlock Icon (🔒) */}
        <button
          onClick={() => toggleLock(drawing.id)}
          className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
            drawing.locked ? 'text-[#FF9800] bg-[#FF9800]/10' : 'text-[#8F9CAE] hover:text-white'
          }`}
          title={drawing.locked ? 'إلغاء قفل الخط' : 'قفل الخط'}
        >
          {drawing.locked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        {/* 10. Delete Icon (🗑) */}
        <button
          onClick={() => deleteDrawing(drawing.id)}
          className="p-1.5 rounded text-[#8F9CAE] hover:text-[#F23645] hover:bg-[#F23645]/10 transition-colors"
          title="حذف الخط"
        >
          <Trash2 size={16} />
        </button>

        {/* 11. More (...) Menu */}
        <div className="relative">
          <button
            onClick={() => setActivePopover(prev => (prev === 'more' ? null : 'more'))}
            className={`p-1.5 rounded hover:bg-[#2A2E39] transition-colors ${
              activePopover === 'more' ? 'bg-[#2A2E39] text-white' : 'text-[#8F9CAE] hover:text-white'
            }`}
            title="المزيد من الخيارات"
          >
            <MoreHorizontal size={16} />
          </button>

          {activePopover === 'more' && (
            <div className="absolute top-full mt-1.5 right-0 w-44 bg-[#1C2030] border border-[#2A3050] rounded-lg shadow-2xl p-1 z-50 text-xs" dir="rtl">
              <button
                onClick={() => {
                  duplicateDrawing(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <Copy size={14} />
                <span>استنساخ (Clone)</span>
              </button>

              <button
                onClick={() => {
                  bringToFront(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <ArrowUp size={14} />
                <span>إلى الأمام (Bring to Front)</span>
              </button>

              <button
                onClick={() => {
                  sendToBack(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <ArrowDown size={14} />
                <span>إلى الخلف (Send to Back)</span>
              </button>

              <div className="w-full h-px bg-[#262B3D] my-1" />

              <button
                onClick={() => {
                  resetDrawingStyle(drawing.id);
                  setActivePopover(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#262B3D] text-[#8F9CAE] hover:text-white transition-colors text-right"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط المظهر</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
