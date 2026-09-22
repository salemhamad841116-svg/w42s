import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useChartStore } from '../../store';
import { useTabsStore } from '../../stores/tabsStore';
import { ChevronDown, Star, Plus, Check, X } from 'lucide-react';

export interface TimeframeOption {
  labelAr: string;
  labelEn: string;
  shortLabel: string;
  resolution: string; // TradingView resolution string
  category: 'seconds' | 'minutes' | 'hours' | 'days' | 'ticks';
}

export const formatShortResolution = (res: string): string => {
  if (!res) return '15m';
  if (res === 'D') return '1D';
  if (res === 'W') return '1W';
  if (res === 'M') return '1M';
  if (res.endsWith('T')) return res;
  if (res.endsWith('S') || res.endsWith('s')) return res.toLowerCase();
  const num = parseInt(res, 10);
  if (!isNaN(num)) {
    if (num >= 60) return `${num / 60}h`;
    return `${num}m`;
  }
  return res;
};

const DEFAULT_TIMEFRAME_OPTIONS: TimeframeOption[] = [
  // Seconds
  { labelAr: '1 ثانية', labelEn: '1 Second', shortLabel: '1s', resolution: '1S', category: 'seconds' },
  { labelAr: '5 ثوان', labelEn: '5 Seconds', shortLabel: '5s', resolution: '5S', category: 'seconds' },
  { labelAr: '10 ثوان', labelEn: '10 Seconds', shortLabel: '10s', resolution: '10S', category: 'seconds' },
  { labelAr: '15 ثانية', labelEn: '15 Seconds', shortLabel: '15s', resolution: '15S', category: 'seconds' },
  { labelAr: '30 ثانية', labelEn: '30 Seconds', shortLabel: '30s', resolution: '30S', category: 'seconds' },

  // Minutes
  { labelAr: '1 دقيقة', labelEn: '1 Minute', shortLabel: '1m', resolution: '1', category: 'minutes' },
  { labelAr: '2 دقيقتين', labelEn: '2 Minutes', shortLabel: '2m', resolution: '2', category: 'minutes' },
  { labelAr: '3 دقائق', labelEn: '3 Minutes', shortLabel: '3m', resolution: '3', category: 'minutes' },
  { labelAr: '5 دقائق', labelEn: '5 Minutes', shortLabel: '5m', resolution: '5', category: 'minutes' },
  { labelAr: '10 دقائق', labelEn: '10 Minutes', shortLabel: '10m', resolution: '10', category: 'minutes' },
  { labelAr: '15 دقيقة', labelEn: '15 Minutes', shortLabel: '15m', resolution: '15', category: 'minutes' },
  { labelAr: '30 دقيقة', labelEn: '30 Minutes', shortLabel: '30m', resolution: '30', category: 'minutes' },
  { labelAr: '45 دقيقة', labelEn: '45 Minutes', shortLabel: '45m', resolution: '45', category: 'minutes' },

  // Hours
  { labelAr: '1 ساعة', labelEn: '1 Hour', shortLabel: '1h', resolution: '60', category: 'hours' },
  { labelAr: '2 ساعتين', labelEn: '2 Hours', shortLabel: '2h', resolution: '120', category: 'hours' },
  { labelAr: '3 ساعات', labelEn: '3 Hours', shortLabel: '3h', resolution: '180', category: 'hours' },
  { labelAr: '4 ساعات', labelEn: '4 Hours', shortLabel: '4h', resolution: '240', category: 'hours' },

  // Days & Macro
  { labelAr: '1 يوم', labelEn: '1 Day', shortLabel: '1D', resolution: 'D', category: 'days' },
  { labelAr: '1 أسبوع', labelEn: '1 Week', shortLabel: '1W', resolution: 'W', category: 'days' },
  { labelAr: '1 شهر', labelEn: '1 Month', shortLabel: '1M', resolution: 'M', category: 'days' },

  // Ticks
  { labelAr: '1 تيك', labelEn: '1 Tick', shortLabel: '1T', resolution: '1T', category: 'ticks' },
  { labelAr: '10 تيك', labelEn: '10 Ticks', shortLabel: '10T', resolution: '10T', category: 'ticks' },
  { labelAr: '100 تيك', labelEn: '100 Ticks', shortLabel: '100T', resolution: '100T', category: 'ticks' },
  { labelAr: '1000 تيك', labelEn: '1000 Ticks', shortLabel: '1000T', resolution: '1000T', category: 'ticks' },
];

const CATEGORY_NAMES: Record<TimeframeOption['category'], { ar: string; en: string }> = {
  seconds: { ar: 'ثواني (Seconds)', en: 'Seconds' },
  minutes: { ar: 'دقائق (Minutes)', en: 'Minutes' },
  hours: { ar: 'ساعات (Hours)', en: 'Hours' },
  days: { ar: 'أيام وفترات كبرى (Days & Macro)', en: 'Days & Macro' },
  ticks: { ar: 'تكات (Ticks)', en: 'Ticks' },
};

export const TimeframeSelector: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const activeResolution = useChartStore((state) => state.activeResolution) || '15';
  const setActiveResolution = useChartStore((state) => state.setActiveResolution);
  const updateActiveTabMeta = useTabsStore((state) => state.updateActiveTabMeta);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeframeOptions, setTimeframeOptions] = useState<TimeframeOption[]>(DEFAULT_TIMEFRAME_OPTIONS);
  const [favoriteResolutions, setFavoriteResolutions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_favorite_resolutions');
      return saved ? JSON.parse(saved) : ['5', '15', '60', '240', 'D'];
    } catch {
      return ['5', '15', '60', '240', 'D'];
    }
  });

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customValue, setCustomValue] = useState('12');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setIsAddingCustom(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setIsAddingCustom(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const toggleFavorite = (res: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteResolutions((prev) => {
      const next = prev.includes(res) ? prev.filter((r) => r !== res) : [...prev, res];
      try {
        localStorage.setItem('tv_favorite_resolutions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleTimeframeChange = (res: string) => {
    setActiveResolution(res);
    try {
      updateActiveTabMeta({ timeframe: res });
    } catch {}
    setDropdownOpen(false);
    setIsAddingCustom(false);

    const win = window as any;
    if (win.tvWidget && win.tvWidget.chart) {
      try {
        win.tvWidget.chart().setResolution(res, () => {
          console.log(`[TradingView] Resolution updated to ${res}`);
        });
      } catch (err) {
        console.warn('tvWidget setResolution error:', err);
      }
    }
  };

  const handleAddCustomTimeframe = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customValue, 10);
    if (isNaN(val) || val <= 0) return;

    let res = '';
    let labelAr = '';
    let labelEn = '';
    let shortLabel = '';

    if (customUnit === 'minutes') {
      res = `${val}`;
      labelAr = `${val} دقيقة`;
      labelEn = `${val} Minute(s)`;
      shortLabel = `${val}m`;
    } else if (customUnit === 'hours') {
      res = `${val * 60}`;
      labelAr = `${val} ساعة`;
      labelEn = `${val} Hour(s)`;
      shortLabel = `${val}h`;
    } else if (customUnit === 'days') {
      res = `${val}D`;
      labelAr = `${val} يوم`;
      labelEn = `${val} Day(s)`;
      shortLabel = `${val}D`;
    }

    if (!timeframeOptions.some((o) => o.resolution === res)) {
      const newOption: TimeframeOption = {
        labelAr,
        labelEn,
        shortLabel,
        resolution: res,
        category: customUnit,
      };
      setTimeframeOptions((prev) => [...prev, newOption]);
    }

    handleTimeframeChange(res);
  };

  const displayLabel = formatShortResolution(activeResolution);
  const categories: TimeframeOption['category'][] = ['seconds', 'minutes', 'hours', 'days', 'ticks'];

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Dedicated Compact Timeframe Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={clsx(
          'h-8 px-2 rounded-lg flex items-center gap-1 text-xs font-black font-mono transition-all cursor-pointer border shadow-xs select-none',
          dropdownOpen
            ? 'bg-black/10 text-black border-black/20'
            : isLight
            ? 'bg-white hover:bg-gray-50 text-black border-black/10'
            : 'bg-[#1E222D] hover:bg-[#2A2E39] text-white border-[#2A2E39]'
        )}
        title="تغيير الفترة الزمنية (Timeframe)"
      >
        <span className="tracking-tight">{displayLabel}</span>
        <ChevronDown
          size={13}
          className={clsx('transition-transform duration-200 text-gray-500', dropdownOpen && 'rotate-180 text-black')}
        />
      </button>

      {/* White Glass Popover Menu */}
      {dropdownOpen && (
        <div
          className="absolute top-full mt-1.5 left-0 w-64 max-h-[460px] overflow-y-auto bg-white/95 backdrop-blur-2xl border border-black/10 rounded-2xl shadow-2xl z-50 py-2 text-xs select-none text-black animate-in fade-in slide-in-from-top-1 duration-150"
          dir="ltr"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Custom Timeframe Creator */}
          <div className="px-3 pt-1 pb-2 border-b border-black/5 bg-black/[0.02]">
            {!isAddingCustom ? (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>+ إضافة فترة زمنية مخصصة</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomTimeframe} className="p-2 bg-white rounded-xl border border-black/10 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                  <span>فترة مخصصة</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="text-gray-400 hover:text-black cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="w-16 px-2 py-1 bg-gray-50 border border-black/10 rounded text-black text-xs font-bold text-center focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as any)}
                    className="flex-1 px-2 py-1 bg-gray-50 border border-black/10 rounded text-black text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="minutes">دقائق (m)</option>
                    <option value="hours">ساعات (h)</option>
                    <option value="days">أيام (D)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  إضافة وتفعيل
                </button>
              </form>
            )}
          </div>

          {/* Categorized Timeframe Groups */}
          <div className="py-1">
            {categories.map((cat) => {
              const groupItems = timeframeOptions.filter((o) => o.category === cat);
              if (!groupItems.length) return null;

              return (
                <div key={cat} className="mb-1.5 last:mb-0">
                  <div className="px-3 py-1 text-[10px] font-black tracking-wider uppercase text-gray-400 bg-black/[0.02]">
                    {CATEGORY_NAMES[cat].ar}
                  </div>
                  {groupItems.map((opt) => {
                    const isActive = activeResolution === opt.resolution;
                    const isFav = favoriteResolutions.includes(opt.resolution);

                    return (
                      <div
                        key={opt.resolution}
                        onClick={() => handleTimeframeChange(opt.resolution)}
                        className={clsx(
                          'group px-3 py-1.5 flex items-center justify-between transition-colors cursor-pointer border-b border-black/[0.02] last:border-none',
                          isActive
                            ? 'bg-blue-50/80 text-blue-700 font-bold border-l-3 border-l-blue-600'
                            : 'text-gray-700 hover:bg-black/[0.03]'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isActive ? (
                            <Check size={14} className="text-blue-600 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-400 shrink-0" />
                          )}
                          <span className={clsx('font-mono font-bold text-xs', isActive ? 'text-blue-700' : 'text-black')}>
                            {opt.shortLabel}
                          </span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            ({opt.labelAr})
                          </span>
                        </div>

                        {/* Favorite Pin */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(opt.resolution, e)}
                          className={clsx(
                            'p-0.5 rounded transition-colors shrink-0',
                            isFav
                              ? 'text-amber-500 opacity-100'
                              : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                          )}
                          title={isFav ? 'إلغاء التثبيت' : 'تثبيت'}
                        >
                          <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
