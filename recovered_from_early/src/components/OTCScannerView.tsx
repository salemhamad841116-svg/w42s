import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radar,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Wifi,
  WifiOff,
  Loader2,
  ChevronDown,
  History,
  Zap,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react';
import type { Language } from '../types';

// ===========================
// الأنواع والواجهات الخاصة بالرادار
// OTC Scanner Types & Interfaces
// ===========================

interface OTCScanResult {
  signal: 'BUY' | 'SELL';
  confidence: string;
  reason: string;
  timestamp: string;
  pair: string;
  analysisId: string;
}

interface OTCPairInfo {
  id: string;
  name: string;
  basePrice: number;
}

interface OTCScannerStatus {
  isAnalyzing: boolean;
  lastAnalysisTime: number | null;
  cooldownMs: number;
  error: string | null;
}

// ===========================
// الفترات الزمنية المتاحة
// Available Scan Intervals
// ===========================
const SCAN_INTERVALS = [
  { label: '30s', labelAr: '30 ثانية', seconds: 30 },
  { label: '45s', labelAr: '45 ثانية', seconds: 45 },
  { label: '1m', labelAr: '1 دقيقة', seconds: 60 },
  { label: '5m', labelAr: '5 دقائق', seconds: 300 },
];

interface OTCScannerViewProps {
  lang: Language;
}

export const OTCScannerView: React.FC<OTCScannerViewProps> = ({ lang }) => {
  // ===========================
  // حالة المكوّن (Component State)
  // ===========================
  const [selectedPair, setSelectedPair] = useState('EURUSD-OTC');
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [isAutoScan, setIsAutoScan] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<OTCScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<OTCScanResult[]>([]);
  const [pairs, setPairs] = useState<OTCPairInfo[]>([]);
  const [status, setStatus] = useState<OTCScannerStatus>({
    isAnalyzing: false,
    lastAnalysisTime: null,
    cooldownMs: 20000,
    error: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [showResultAnimation, setShowResultAnimation] = useState(false);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoScanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===========================
  // جلب قائمة الأزواج عند التحميل
  // Fetch pairs on mount
  // ===========================
  useEffect(() => {
    fetchPairs();
    fetchHistory();
    fetchStatus();
  }, []);

  // إغلاق القائمة المنسدلة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPairDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPairs = async () => {
    try {
      const res = await fetch('/api/otc/pairs');
      const data = await res.json();
      if (data.success && data.pairs) {
        setPairs(data.pairs);
      }
    } catch {
      // استخدام قائمة افتراضية عند فشل الاتصال
      setPairs([
        { id: 'EURUSD-OTC', name: 'EUR/USD OTC', basePrice: 1.0850 },
        { id: 'GBPUSD-OTC', name: 'GBP/USD OTC', basePrice: 1.2650 },
        { id: 'USDJPY-OTC', name: 'USD/JPY OTC', basePrice: 149.50 },
        { id: 'AUDUSD-OTC', name: 'AUD/USD OTC', basePrice: 0.6520 },
      ]);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/otc/history');
      const data = await res.json();
      if (data.success && data.history) {
        setScanHistory(data.history);
      }
    } catch {
      // صمت عند فشل الجلب
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/otc/status');
      const data = await res.json();
      if (data.success && data.status) {
        setStatus(data.status);
      }
    } catch {
      // صمت عند فشل الجلب
    }
  };

  // ===========================
  // تنفيذ الفحص (Execute Scan)
  // ===========================
  const executeScan = useCallback(async () => {
    if (isScanning) return;

    setIsScanning(true);
    setError(null);

    try {
      const res = await fetch('/api/otc/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: selectedPair }),
      });

      const data = await res.json();

      if (!res.ok) {
        // معالجة أخطاء محددة
        if (res.status === 409) {
          setError(lang === 'ar' ? '⏳ التحليل قيد التنفيذ بالفعل...' : '⏳ Analysis already in progress...');
        } else if (res.status === 429) {
          setError(lang === 'ar' ? '⏱️ يرجى الانتظار قبل الفحص التالي' : '⏱️ Please wait before next scan');
        } else {
          setError(data.error || 'Unknown error');
        }
        return;
      }

      if (data.success && data.signal) {
        setCurrentResult(data.signal);
        setScanHistory((prev) => [data.signal, ...prev].slice(0, 50));

        // تشغيل تأثير الرسوم المتحركة
        setShowResultAnimation(true);
        setTimeout(() => setShowResultAnimation(false), 800);
      }
    } catch (err) {
      setError(lang === 'ar' ? '❌ فشل الاتصال بالخادم' : '❌ Failed to connect to server');
    } finally {
      setIsScanning(false);
      fetchStatus();
    }
  }, [isScanning, selectedPair, lang]);

  // ===========================
  // المؤقت التلقائي (Auto Timer)
  // ===========================
  useEffect(() => {
    if (!isAutoScan) {
      // إيقاف كل المؤقتات عند تعطيل الفحص التلقائي
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (autoScanTimeoutRef.current) {
        clearTimeout(autoScanTimeoutRef.current);
        autoScanTimeoutRef.current = null;
      }
      setCountdown(0);
      return;
    }

    // بدء العد التنازلي
    setCountdown(selectedInterval);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // تنفيذ الفحص عند الوصول إلى صفر
          executeScan();
          return selectedInterval;
        }
        return prev - 1;
      });
    }, 1000);

    // تنفيذ فحص فوري عند بدء التشغيل التلقائي
    executeScan();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isAutoScan, selectedInterval, executeScan]);

  // ===========================
  // دائرة العداد التنازلي SVG
  // Countdown Ring SVG Component
  // ===========================
  const countdownProgress = isAutoScan ? ((selectedInterval - countdown) / selectedInterval) * 100 : 0;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (countdownProgress / 100) * circumference;

  // لون العداد يتدرج حسب الوقت المتبقي
  const getCountdownColor = () => {
    const ratio = countdown / selectedInterval;
    if (ratio > 0.5) return '#22c55e'; // أخضر
    if (ratio > 0.2) return '#eab308'; // أصفر
    return '#ef4444'; // أحمر
  };

  // ===========================
  // تنسيق الوقت (Format Time)
  // ===========================
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  // الحصول على نسبة الثقة كرقم
  const getConfidenceNumber = (conf: string): number => {
    const match = conf.match(/(\d+)/);
    return match ? parseInt(match[1]) : 50;
  };

  return (
    <div className="space-y-6">
      {/* =============================
          رأس الرادار (Scanner Header)
          ============================= */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30">
              <Radar className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                {lang === 'ar' ? 'رادار التداول الآلي' : 'AI Trading Scanner'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                  OTC
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'ar'
                  ? 'تحليل ذكاء اصطناعي للشموع اليابانية على أسواق OTC'
                  : 'AI candlestick analysis for OTC markets'}
              </p>
            </div>
          </div>

          {/* مؤشر حالة الاتصال (Connection Status) */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                isScanning
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : error
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'ar' ? 'يحلل...' : 'Analyzing...'}</span>
                </>
              ) : error ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'خطأ' : 'Error'}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'متصل وجاهز' : 'Connected'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =============================
            محدد الزوج + أزرار الفترات
            Pair Selector + Interval Buttons
            ============================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* محدد الزوج (Pair Selector) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-2xl min-w-[200px] hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">
                  {pairs.find((p) => p.id === selectedPair)?.name || selectedPair}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform ${isPairDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isPairDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-30 overflow-hidden">
                {pairs.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => {
                      setSelectedPair(pair.id);
                      setIsPairDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-bold text-right hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                      selectedPair === pair.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-300'
                    }`}
                  >
                    <span>{pair.name}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{pair.basePrice}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* أزرار الفترات الزمنية (Interval Buttons) */}
          <div className="flex items-center gap-2 flex-wrap">
            {SCAN_INTERVALS.map((interval) => (
              <button
                key={interval.seconds}
                onClick={() => {
                  setSelectedInterval(interval.seconds);
                  if (isAutoScan) {
                    // إعادة تشغيل العداد بالفترة الجديدة
                    setCountdown(interval.seconds);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                  selectedInterval === interval.seconds
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {lang === 'ar' ? interval.labelAr : interval.label}
              </button>
            ))}

            {/* زر التشغيل/الإيقاف التلقائي */}
            <button
              onClick={() => setIsAutoScan(!isAutoScan)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border flex items-center gap-2 ${
                isAutoScan
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isAutoScan ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إيقاف' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تشغيل تلقائي' : 'Auto Start'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =============================
          صف العداد + النتيجة
          Countdown + Result Row
          ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العداد التنازلي (Countdown Timer) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-zinc-400 mb-4">
            {lang === 'ar' ? '⏱️ الفحص القادم' : '⏱️ Next Scan'}
          </p>

          {/* دائرة SVG */}
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              {/* الحلقة الخلفية */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#27272a"
                strokeWidth="6"
              />
              {/* حلقة التقدم */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={isAutoScan ? getCountdownColor() : '#3f3f46'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isAutoScan ? strokeDashoffset : circumference}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            {/* الرقم في المنتصف */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl font-black font-mono ${
                  isAutoScan ? 'text-white' : 'text-zinc-600'
                }`}
              >
                {isAutoScan ? formatCountdown(countdown) : '--:--'}
              </span>
              {isScanning && (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mt-1" />
              )}
            </div>
          </div>

          {/* زر الفحص اليدوي */}
          <button
            onClick={executeScan}
            disabled={isScanning}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-black text-xs transition-all active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{lang === 'ar' ? 'فحص الآن' : 'Scan Now'}</span>
          </button>
        </div>

        {/* بطاقة نتيجة الإشارة (Signal Result Card) */}
        <div className="lg:col-span-2">
          <div
            className={`bg-zinc-900 border rounded-3xl p-6 transition-all duration-500 ${
              showResultAnimation ? 'scale-[1.02]' : 'scale-100'
            } ${
              currentResult
                ? currentResult.signal === 'BUY'
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'border-red-500/40 shadow-lg shadow-red-500/10'
                : 'border-zinc-800'
            }`}
          >
            {currentResult ? (
              <div className="space-y-5">
                {/* نوع الإشارة (Signal Type) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        currentResult.signal === 'BUY'
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      {currentResult.signal === 'BUY' ? (
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-3xl font-black ${
                          currentResult.signal === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {currentResult.signal}
                      </h3>
                      <p className="text-xs text-zinc-400 font-bold">
                        {pairs.find((p) => p.id === currentResult.pair)?.name || currentResult.pair}
                      </p>
                    </div>
                  </div>

                  {/* نسبة الثقة (Confidence) */}
                  <div className="text-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="5" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke={
                            getConfidenceNumber(currentResult.confidence) >= 80
                              ? '#22c55e'
                              : getConfidenceNumber(currentResult.confidence) >= 60
                              ? '#eab308'
                              : '#ef4444'
                          }
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={
                            2 * Math.PI * 34 -
                            (getConfidenceNumber(currentResult.confidence) / 100) * 2 * Math.PI * 34
                          }
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-white">
                          {currentResult.confidence}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold mt-1">
                      {lang === 'ar' ? 'الثقة' : 'Confidence'}
                    </p>
                  </div>
                </div>

                {/* السبب (Reason) */}
                <div
                  className={`p-4 rounded-2xl border ${
                    currentResult.signal === 'BUY'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold mb-1">
                        {lang === 'ar' ? '📋 سبب التوصية:' : '📋 Analysis Reason:'}
                      </p>
                      <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                        {currentResult.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* الوقت ومعرف التحليل */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(currentResult.timestamp)}
                  </span>
                  <span className="font-mono">{currentResult.analysisId}</span>
                </div>
              </div>
            ) : (
              /* حالة الانتظار (Waiting State) */
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="p-4 rounded-3xl bg-zinc-800/50 border border-zinc-700">
                  <Radar className="w-12 h-12 text-zinc-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-zinc-400">
                    {lang === 'ar' ? 'في انتظار الفحص الأول' : 'Awaiting First Scan'}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {lang === 'ar'
                      ? 'اضغط "فحص الآن" أو فعّل الفحص التلقائي'
                      : 'Press "Scan Now" or enable auto-scan'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* رسالة الخطأ (Error Message) */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 font-bold">{error}</p>
        </div>
      )}

      {/* =============================
          جدول تاريخ الإشارات (Signal History Table)
          ============================= */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white">
              {lang === 'ar' ? '📊 سجل الإشارات الأخيرة' : '📊 Recent Signals History'}
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold">
            {scanHistory.length} {lang === 'ar' ? 'إشارة' : 'signals'}
          </span>
        </div>

        {scanHistory.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-xs text-zinc-500 font-bold">
              {lang === 'ar' ? 'لا يوجد تاريخ بعد - ابدأ الفحص!' : 'No history yet - start scanning!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-950/50">
                  <th className="px-4 py-3 text-right text-zinc-400 font-bold">
                    {lang === 'ar' ? 'الوقت' : 'Time'}
                  </th>
                  <th className="px-4 py-3 text-right text-zinc-400 font-bold">
                    {lang === 'ar' ? 'الزوج' : 'Pair'}
                  </th>
                  <th className="px-4 py-3 text-center text-zinc-400 font-bold">
                    {lang === 'ar' ? 'الإشارة' : 'Signal'}
                  </th>
                  <th className="px-4 py-3 text-center text-zinc-400 font-bold">
                    {lang === 'ar' ? 'الثقة' : 'Confidence'}
                  </th>
                  <th className="px-4 py-3 text-right text-zinc-400 font-bold hidden sm:table-cell">
                    {lang === 'ar' ? 'السبب' : 'Reason'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.slice(0, 20).map((item, idx) => (
                  <tr
                    key={item.analysisId || idx}
                    className={`border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                      idx === 0 ? 'bg-zinc-800/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-zinc-300 font-mono whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-white font-bold whitespace-nowrap">
                      {pairs.find((p) => p.id === item.pair)?.name || item.pair}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                          item.signal === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {item.signal === 'BUY' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {item.signal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-black ${
                          getConfidenceNumber(item.confidence) >= 80
                            ? 'text-emerald-400'
                            : getConfidenceNumber(item.confidence) >= 60
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-[11px] max-w-[250px] truncate hidden sm:table-cell">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =============================
          شريط المعلومات السفلي
          Bottom Info Bar
          ============================= */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            {lang === 'ar' ? 'محرك:' : 'Engine:'} Gemini 1.5 Flash
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {lang === 'ar' ? 'المصدر:' : 'Source:'}{' '}
            {status.isAnalyzing ? (lang === 'ar' ? 'يحلل' : 'Analyzing') : (lang === 'ar' ? 'محاكاة' : 'Simulated')}
          </span>
        </div>
        <span className="font-mono">
          {lang === 'ar' ? 'التبريد:' : 'Cooldown:'} {status.cooldownMs / 1000}s
        </span>
      </div>
    </div>
  );
};
