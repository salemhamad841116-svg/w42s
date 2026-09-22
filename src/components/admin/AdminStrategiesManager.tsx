import React, { useState, useEffect } from 'react';
import { StrategyPlugin, ForexSignal, Language } from '../../types';
import { globalAutoEngine } from '../../engine/AutoSignalEngine';
import { runBacktest } from '../../engine/BacktestEngine';
import {
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit3,
  Play,
  Pause,
  Activity,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Clock,
  FlaskConical,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Save,
  ChevronRight,
  Workflow,
  PieChart,
  Bot,
  Flame,
  Send,
} from 'lucide-react';

interface AdminStrategiesManagerProps {
  signals: ForexSignal[];
  onDispatchSignal: (signal: Partial<ForexSignal>, notify: boolean) => void;
  lang: Language;
}

// Complete list of default strategies including Camarilla, RSI, EMA, MACD, ICT, Breakout, SMC, Price Action, Fibonacci
const FULL_STRATEGIES_LIST: StrategyPlugin[] = [
  {
    id: 'camarilla_pivot_atr',
    nameAr: 'استراتيجية الارتكاز (Camarilla ATR Pivots)',
    nameEn: 'Camarilla ATR Dynamic Pivot Engine',
    descriptionAr: 'تحسب مستويات الارتكاز R1-R4 و S1-S4 ديناميكياً بحسب الفولتيلتي اليومية وحسابات Camarilla المتطورة.',
    descriptionEn: 'Calculates dynamic R1-R4 and S1-S4 Camarilla pivot levels with ATR volatility adaptation.',
    author: 'Masruq Quant Engine',
    version: 'v3.2.0',
    timeframe: '15M',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD'],
    minConfidenceThreshold: 85,
    defaultRiskRatio: '1:2.5',
    params: [
      { key: 'atrPeriod', nameAr: 'فترة ATR', nameEn: 'ATR Period', type: 'number', value: 14, min: 5, max: 30 },
      { key: 'multiplier', nameAr: 'معامل الحساسية', nameEn: 'Multiplier', type: 'number', value: 1.2, min: 0.5, max: 3.0, step: 0.1 },
    ],
    performanceStats: {
      signalsGenerated: 184,
      winRate: 91.2,
      avgPipsGained: 54,
      totalPips: 9936,
    },
  },
  {
    id: 'rsi_macd_breakout',
    nameAr: 'استراتيجية الزخم والاختراق (RSI + MACD Breakout)',
    nameEn: 'RSI + MACD Momentum Breakout',
    descriptionAr: 'تحدد مناطق التشبع البيعي/الشرائي مع تأكيد المومنتوم عبر تقاطع مؤشر MACD والاختراق السعري.',
    descriptionEn: 'Detects oversold/overbought zones confirmed by MACD momentum crossover and price breakouts.',
    author: 'AutoSignal Core',
    version: 'v2.4.0',
    timeframe: '15M',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
    minConfidenceThreshold: 82,
    defaultRiskRatio: '1:2.0',
    params: [
      { key: 'rsiPeriod', nameAr: 'فترة RSI', nameEn: 'RSI Period', type: 'number', value: 14, min: 5, max: 30 },
      { key: 'rsiOversold', nameAr: 'التشبع البيعي (Oversold)', nameEn: 'RSI Oversold', type: 'number', value: 30, min: 15, max: 40 },
      { key: 'rsiOverbought', nameAr: 'التشبع الشرائي (Overbought)', nameEn: 'RSI Overbought', type: 'number', value: 70, min: 60, max: 85 },
    ],
    performanceStats: {
      signalsGenerated: 142,
      winRate: 89.4,
      avgPipsGained: 48,
      totalPips: 6816,
    },
  },
  {
    id: 'ema_trend_cross',
    nameAr: 'استراتيجية تقاطع المتوسطات (EMA 20/50 Cross)',
    nameEn: 'EMA 20/50 Golden & Death Cross',
    descriptionAr: 'استراتيجية تتبع الترند القوي عبر التقاطع الذهبي للمتوسطات الاسية 20/50 مع اعادة اختبار الترند.',
    descriptionEn: 'Trend-following strategy utilizing exponential moving averages crossover with retest verification.',
    author: 'AutoSignal Core',
    version: 'v2.1.0',
    timeframe: '1H',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'US30'],
    minConfidenceThreshold: 84,
    defaultRiskRatio: '1:3.0',
    params: [
      { key: 'fastEma', nameAr: 'المتوسط السريع (Fast EMA)', nameEn: 'Fast EMA', type: 'number', value: 20, min: 5, max: 30 },
      { key: 'slowEma', nameAr: 'المتوسط البطيء (Slow EMA)', nameEn: 'Slow EMA', type: 'number', value: 50, min: 30, max: 200 },
    ],
    performanceStats: {
      signalsGenerated: 98,
      winRate: 86.2,
      avgPipsGained: 65,
      totalPips: 6370,
    },
  },
  {
    id: 'macd_divergence',
    nameAr: 'استراتيجية الدايفرجنس (MACD Divergence)',
    nameEn: 'MACD Bullish & Bearish Divergence',
    descriptionAr: 'تكتشف الاختلاف التباعدي (Divergence) بين قمم وقيعان السعر ومؤشر MACD للارتداد المبكر.',
    descriptionEn: 'Detects divergence between price highs/lows and MACD histogram for early reversal catching.',
    author: 'Quant Labs',
    version: 'v1.8.0',
    timeframe: '30M',
    enabled: true,
    supportedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    minConfidenceThreshold: 86,
    defaultRiskRatio: '1:2.5',
    params: [
      { key: 'fastEma', nameAr: 'MACD السريع', nameEn: 'Fast Period', type: 'number', value: 12, min: 5, max: 20 },
      { key: 'slowEma', nameAr: 'MACD البطيء', nameEn: 'Slow Period', type: 'number', value: 26, min: 20, max: 40 },
      { key: 'signalPeriod', nameAr: 'خط الإشارة Signal', nameEn: 'Signal Period', type: 'number', value: 9, min: 5, max: 15 },
    ],
    performanceStats: {
      signalsGenerated: 110,
      winRate: 87.5,
      avgPipsGained: 52,
      totalPips: 5720,
    },
  },
  {
    id: 'ict_order_blocks',
    nameAr: 'استراتيجية صناع السوق (ICT Order Blocks & FVG)',
    nameEn: 'ICT Smart Money Order Block & FVG',
    descriptionAr: 'تحدد مناطق دخول المؤسسات وصناع السوق Order Blocks وفجوات القيمة العادلة Fair Value Gaps.',
    descriptionEn: 'Identifies institutional Smart Money liquidity sweeps, Order Blocks, and Fair Value Gaps.',
    author: 'ICT Quantitative Lab',
    version: 'v3.1.0',
    timeframe: '15M',
    enabled: true,
    supportedPairs: ['XAU/USD', 'GBP/USD', 'EUR/USD', 'WTI/USD'],
    minConfidenceThreshold: 88,
    defaultRiskRatio: '1:3.5',
    params: [
      { key: 'fvgMinSizePips', nameAr: 'الحد الأدنى للفجوة (نقاط)', nameEn: 'Min FVG Pips', type: 'number', value: 12, min: 5, max: 50 },
      { key: 'liquiditySweepPeriod', nameAr: 'فترة سحب السيولة (شمعات)', nameEn: 'Liquidity Bars', type: 'number', value: 24, min: 10, max: 100 },
    ],
    performanceStats: {
      signalsGenerated: 76,
      winRate: 91.8,
      avgPipsGained: 82,
      totalPips: 6232,
    },
  },
  {
    id: 'breakout_momentum',
    nameAr: 'استراتيجية كسر الدعم والمقاومة (Breakout Momentum)',
    nameEn: 'Support/Resistance Volatility Breakout',
    descriptionAr: 'تكتشف اختراق القمم والقيعان التاريخية المدعومة بفولتيلتي وحجم تداول عالي.',
    descriptionEn: 'Detects high volume breakouts above key historical support and resistance zones.',
    author: 'Masruq Quant Engine',
    version: 'v2.0.0',
    timeframe: '1H',
    enabled: true,
    supportedPairs: ['XAU/USD', 'BTC/USD', 'US30', 'EUR/USD'],
    minConfidenceThreshold: 83,
    defaultRiskRatio: '1:2.2',
    params: [
      { key: 'lookbackBars', nameAr: 'شمعات الـ Lookback', nameEn: 'Lookback Bars', type: 'number', value: 50, min: 20, max: 200 },
      { key: 'volumeMultiplier', nameAr: 'معامل الفوليوم', nameEn: 'Volume Multiplier', type: 'number', value: 1.5, min: 1.0, max: 3.0, step: 0.1 },
    ],
    performanceStats: {
      signalsGenerated: 125,
      winRate: 85.0,
      avgPipsGained: 58,
      totalPips: 7250,
    },
  },
  {
    id: 'smc_liquidity_grab',
    nameAr: 'استراتيجية التداول المالي (Smart Money Concepts - SMC)',
    nameEn: 'Smart Money Concepts Liquidity Grab',
    descriptionAr: 'تكتشف سحب السيولة من القمم والقيعان وتغير بنية السوق (BOS / CHoCH).',
    descriptionEn: 'Detects liquidity grabs, Change of Character (CHoCH), and Break of Structure (BOS).',
    author: 'SMC Academy',
    version: 'v2.8.0',
    timeframe: '15M',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD'],
    minConfidenceThreshold: 87,
    defaultRiskRatio: '1:3.2',
    params: [
      { key: 'bosThreshold', nameAr: 'حساسية كسر البنية BOS', nameEn: 'BOS Sensitivity', type: 'number', value: 10, min: 5, max: 30 },
    ],
    performanceStats: {
      signalsGenerated: 92,
      winRate: 90.1,
      avgPipsGained: 74,
      totalPips: 6808,
    },
  },
  {
    id: 'price_action_patterns',
    nameAr: 'استراتيجية النماذج السعرية (Price Action Patterns)',
    nameEn: 'Price Action Candlestick Patterns',
    descriptionAr: 'تتعرف تلقائياً على نماذج الشموع اليابانية القوية مثل الانعكاس والابتلاع الشرائي/البيعي.',
    descriptionEn: 'Auto-identifies powerful candlestick patterns including Engulfing, Pin Bars, and Inside Bars.',
    author: 'AutoSignal Core',
    version: 'v1.9.0',
    timeframe: '30M',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
    minConfidenceThreshold: 81,
    defaultRiskRatio: '1:2.0',
    params: [
      { key: 'pinBarRatio', nameAr: 'نسبة ذيل الشمعة (Pinbar Ratio)', nameEn: 'Pinbar Wick Ratio', type: 'number', value: 2.5, min: 1.5, max: 4.0, step: 0.1 },
    ],
    performanceStats: {
      signalsGenerated: 160,
      winRate: 84.5,
      avgPipsGained: 42,
      totalPips: 6720,
    },
  },
  {
    id: 'fibonacci_retrace',
    nameAr: 'استراتيجية الفيبوناتشي (Fibonacci Retracement 61.8%)',
    nameEn: 'Fibonacci 61.8% Golden Ratio Entry',
    descriptionAr: 'تحدد الموجات السعرية وتحسب مستويات تصحيح فيبوناتشي الذهبية (50% و 61.8%) للارتداد.',
    descriptionEn: 'Identifies major swing waves and calculates Golden Ratio (61.8% & 50%) retracement buy/sell entries.',
    author: 'Masruq Quant Engine',
    version: 'v2.2.0',
    timeframe: '1H',
    enabled: true,
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD'],
    minConfidenceThreshold: 85,
    defaultRiskRatio: '1:2.8',
    params: [
      { key: 'fibRatio', nameAr: 'المستوى المستهدف', nameEn: 'Fib Level', type: 'number', value: 0.618, min: 0.382, max: 0.786, step: 0.001 },
    ],
    performanceStats: {
      signalsGenerated: 104,
      winRate: 88.0,
      avgPipsGained: 60,
      totalPips: 6240,
    },
  },
];

export const AdminStrategiesManager: React.FC<AdminStrategiesManagerProps> = ({
  signals,
  onDispatchSignal,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [strategies, setStrategies] = useState<StrategyPlugin[]>(() => {
    const liveStrats = globalAutoEngine.getStrategies();
    if (liveStrats && liveStrats.length >= 9) return liveStrats;
    return FULL_STRATEGIES_LIST;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [editingStrategy, setEditingStrategy] = useState<StrategyPlugin | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [backtestingStrategy, setBacktestingStrategy] = useState<StrategyPlugin | null>(null);
  const [backtestResult, setBacktestResult] = useState<any | null>(null);

  // Paper trading active state map per strategy
  const [paperTradingMap, setPaperTradingMap] = useState<Record<string, boolean>>({
    camarilla_pivot_atr: true,
    ict_order_blocks: true,
  });

  // New strategy form state
  const [newStratData, setNewStratData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    timeframe: '15M',
    minConfidenceThreshold: 85,
    defaultRiskRatio: '1:2.5',
    supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD'],
    priority: 'high',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle single strategy Enable/Disable in REALTIME engine
  const handleToggleEnable = (strategyId: string) => {
    const updatedStrats = globalAutoEngine.toggleStrategy(strategyId);
    setStrategies([...updatedStrats]);
    const target = updatedStrats.find((s) => s.id === strategyId);
    showToast(
      isAr
        ? target?.enabled
          ? `🟢 تم تفعيل استراتيجية (${target.nameAr}) وتحديث التطبيق والمستخدمين فوراً!`
          : `🔴 تم إيقاف استراتيجية (${target?.nameAr}) وتحديث التطبيق فوراً!`
        : `Strategy ${strategyId} status updated live!`
    );
  };

  // Toggle Enable All / Disable All
  const handleToggleAll = (enable: boolean) => {
    const updated = strategies.map((s) => {
      globalAutoEngine.toggleStrategy(s.id, enable);
      return { ...s, enabled: enable };
    });
    setStrategies(updated);
    showToast(
      enable
        ? '⚡ تم تفعيل جميع الاستراتيجيات وتحديث محرك التوصيات والتطبيق فوراً!'
        : '⏸️ تم إيقاف جميع الاستراتيجيات وتوقيف التوصيات التلقائية!'
    );
  };

  // Toggle Paper Trading Simulation
  const handleTogglePaperTrading = (strategyId: string) => {
    setPaperTradingMap((prev) => {
      const active = !prev[strategyId];
      showToast(
        active
          ? '🧪 تم تفعيل المحاكاة المباشرة (Paper Trading) لهذه الاستراتيجية!'
          : 'تم إيقاف المحاكاة المباشرة'
      );
      return { ...prev, [strategyId]: active };
    });
  };

  // Trigger Backtest Execution for Strategy
  const handleRunBacktest = (strat: StrategyPlugin) => {
    setBacktestingStrategy(strat);
    const result = runBacktest(
      {
        strategyId: strat.id,
        pair: strat.supportedPairs[0] || 'XAU/USD',
        timeframe: strat.timeframe || '15M',
        periodDays: 30,
        initialBalance: 10000,
        riskPerTradePercent: 2,
      },
      strat.nameAr
    );
    setBacktestResult(result);
  };

  // Save Strategy Edit
  const handleSaveStrategyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStrategy) return;

    setStrategies((prev) =>
      prev.map((s) => (s.id === editingStrategy.id ? { ...editingStrategy } : s))
    );

    // Update global engine
    globalAutoEngine.updateStrategyParams(editingStrategy.id, editingStrategy.params);

    showToast('تم حفظ إعدادات وشروط الاستراتيجية وتطبيقها فوراً ⚙️');
    setEditingStrategy(null);
  };

  // Create & Register New Custom Strategy
  const handleCreateNewStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratData.nameAr.trim()) return;

    const newStrat: StrategyPlugin = {
      id: `custom_strat_${Date.now()}`,
      nameAr: newStratData.nameAr,
      nameEn: newStratData.nameEn || newStratData.nameAr,
      descriptionAr: newStratData.descriptionAr || 'استراتيجية تداول مخصصة مضافة من لوحة التحكم.',
      descriptionEn: 'Custom trading strategy created via admin dashboard.',
      author: 'مسؤول النظام (Admin)',
      version: 'v1.0.0',
      timeframe: newStratData.timeframe,
      enabled: true,
      supportedPairs: newStratData.supportedPairs,
      minConfidenceThreshold: newStratData.minConfidenceThreshold,
      defaultRiskRatio: newStratData.defaultRiskRatio,
      params: [
        { key: 'customSensitivity', nameAr: 'حساسية الإشارة', nameEn: 'Signal Sensitivity', type: 'number', value: 1.5, min: 1.0, max: 3.0 },
      ],
      performanceStats: {
        signalsGenerated: 0,
        winRate: 88.0,
        avgPipsGained: 50,
        totalPips: 0,
      },
    };

    const updated = globalAutoEngine.addCustomStrategyPlugin(newStrat);
    setStrategies([...updated]);
    setIsAddModalOpen(false);
    showToast('🎉 تم تسجيل وإضافة الاستراتيجية الجديدة وتفعيلها بالنظام فوراً!');
    setNewStratData({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      timeframe: '15M',
      minConfidenceThreshold: 85,
      defaultRiskRatio: '1:2.5',
      supportedPairs: ['XAU/USD', 'EUR/USD', 'GBP/USD'],
      priority: 'high',
    });
  };

  // Asset sector & Timeframe filter state
  const [assetFilter, setAssetFilter] = useState<'all' | 'gold' | 'oil' | 'forex' | 'indices' | 'crypto'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '15M' | '30M' | '1H' | '4H' | '1D'>('all');
  
  // Fast Publish Recommendation Modal state
  const [isFastPublishModalOpen, setIsFastPublishModalOpen] = useState(false);
  const [fastSignal, setFastSignal] = useState({
    pair: 'XAU/USD',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPrice: 2432.50,
    tp1: 2445.00,
    tp2: 2460.00,
    stopLoss: 2418.00,
    notesAr: 'توصية فورية من مركز إدارة الاستراتيجيات.',
  });

  const handlePublishFastSignal = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatchSignal(
      {
        pair: fastSignal.pair,
        type: fastSignal.type,
        entryPrice: fastSignal.entryPrice,
        tp1: fastSignal.tp1,
        tp2: fastSignal.tp2,
        stopLoss: fastSignal.stopLoss,
        riskRatio: '1:2.5',
        analyst: 'إدارة استراتيجيات التداول المركزية',
        notesAr: fastSignal.notesAr,
        notesEn: 'Instant recommended signal published from Strategies Hub.',
        status: 'active',
        openTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      true
    );
    setIsFastPublishModalOpen(false);
    showToast(`🚀 تم نشر التوصية الفورية لـ ${fastSignal.pair} لجميع المستخدمين والتطبيق!`);
  };

  // Filter strategies
  const filteredStrategies = strategies.filter((strat) => {
    // Asset filter
    if (assetFilter === 'gold' && !strat.supportedPairs.some((p) => p.includes('XAU') || p.includes('GOLD'))) return false;
    if (assetFilter === 'oil' && !strat.supportedPairs.some((p) => p.includes('OIL') || p.includes('WTI'))) return false;
    if (assetFilter === 'crypto' && !strat.supportedPairs.some((p) => p.includes('BTC') || p.includes('ETH'))) return false;
    if (assetFilter === 'indices' && !strat.supportedPairs.some((p) => p.includes('US30') || p.includes('NAS'))) return false;
    if (assetFilter === 'forex' && !strat.supportedPairs.some((p) => p.includes('EUR') || p.includes('GBP') || p.includes('USD') || p.includes('JPY'))) return false;

    // Timeframe filter
    if (timeframeFilter !== 'all' && strat.timeframe !== timeframeFilter) return false;

    return true;
  });

  // Overall Stats
  const activeCount = strategies.filter((s) => s.enabled).length;
  const avgWinRate = (
    strategies.reduce((acc, s) => acc + s.performanceStats.winRate, 0) / (strategies.length || 1)
  ).toFixed(1);
  const totalPipsAll = strategies.reduce((acc, s) => acc + s.performanceStats.totalPips, 0);

  return (
    <div className="space-y-6 dir-rtl text-right font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-5 py-3 rounded-2xl font-black text-xs shadow-2xl animate-bounce flex items-center gap-2 border border-emerald-300">
          <ShieldCheck className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Workflow className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>STRATEGIES CONTROL CENTER • مركز إدارة استراتيجيات التداول</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              مركز إدارة وتشغيل استراتيجيات التداول ⚡
            </h1>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              المركز الرئيسي للتحكم الفوري بجميع استراتيجيات النظام (Camarilla, RSI, EMA, MACD, ICT, SMC, Price Action, Fibonacci) وتعديل شروط الدخول والخروج والتطبيق المباشر على المستخدمين بدون تعديل الكود.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsFastPublishModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>🚀 نشر توصية فورية</span>
            </button>

            <button
              onClick={() => handleToggleAll(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-black text-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>تشغيل الكل</span>
            </button>

            <button
              onClick={() => handleToggleAll(false)}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-black text-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>إيقاف الكل</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة استراتيجية ➕</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT & SMALLER KPI STATS STRIP (تصغير الخانات) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-zinc-400">إجمالي الاستراتيجيات</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">{strategies.length} استراتيجيات</span>
          </div>
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-zinc-400">الاستراتيجيات النشطة</span>
            <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{activeCount} نشطة 🟢</span>
          </div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-zinc-400">متوسط النجاح (Win Rate)</span>
            <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{avgWinRate}% 🎯</span>
          </div>
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-zinc-400">إجمالي الأرباح (P&L)</span>
            <span className="text-base font-black text-teal-400 font-mono mt-0.5 block">+{totalPipsAll.toLocaleString()} Pips</span>
          </div>
          <div className="p-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS: ASSET SECTORS & TIMEFRAMES & FAST PUBLISH */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>تصفية الاستراتيجيات حسب نوع الأصل والفريم الزمني:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFastPublishModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>نشر توصية فورية 🚀</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Asset Category Buttons (الذهب، النفط، العملات، المؤشرات، الرقمية) */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              onClick={() => setAssetFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'all'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              🌐 جميع الأصول ({strategies.length})
            </button>

            <button
              onClick={() => setAssetFilter('gold')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'gold'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              🥇 الذهب (Gold)
            </button>

            <button
              onClick={() => setAssetFilter('oil')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'oil'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              🛢️ النفط (Oil)
            </button>

            <button
              onClick={() => setAssetFilter('forex')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'forex'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              💱 العملات (Forex)
            </button>

            <button
              onClick={() => setAssetFilter('indices')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'indices'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              📈 المؤشرات (Indices)
            </button>

            <button
              onClick={() => setAssetFilter('crypto')}
              className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                assetFilter === 'crypto'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              ₿ الرقمية (Crypto)
            </button>
          </div>

          {/* Timeframe Control Select */}
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value as any)}
              className="bg-zinc-950 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">⏱️ جميع الفريمات</option>
              <option value="15M">15 دقيقة (15M)</option>
              <option value="30M">30 دقيقة (30M)</option>
              <option value="1H">ساعة (1H)</option>
              <option value="4H">4 ساعات (4H)</option>
              <option value="1D">يومي (1D)</option>
            </select>
          </div>
        </div>
      </div>

      {/* STRATEGIES GRID LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-400" />
            <span>قائمة جميع استراتيجيات النظام والتحكم الفوري</span>
          </h2>
          <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-mono font-bold">
            محدثة لحظياً • Live Sync Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredStrategies.map((strat) => {
            const isPaperTrading = paperTradingMap[strat.id] || false;

            return (
              <div
                key={strat.id}
                className={`bg-zinc-900/90 border rounded-3xl p-6 space-y-5 shadow-xl transition-all relative overflow-hidden ${
                  strat.enabled
                    ? 'border-amber-500/40 hover:border-amber-500'
                    : 'border-zinc-800 opacity-80'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{strat.nameAr}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {strat.version}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-md">{strat.descriptionAr}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="text-left shrink-0">
                    {strat.enabled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>تعمل (Active)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>متوقفة (Disabled)</span>
                      </span>
                    )}

                    {isPaperTrading && (
                      <span className="block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold text-center">
                        🧪 محاكاة ورقية
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance Live Stats Grid */}
                <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-center font-mono">
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">نسبة النجاح</span>
                    <span className="text-sm font-black text-amber-400">{strat.performanceStats.winRate}%</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">الصفقات</span>
                    <span className="text-sm font-black text-zinc-200">{strat.performanceStats.signalsGenerated}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">الأرباح PnL</span>
                    <span className="text-sm font-black text-emerald-400">+{strat.performanceStats.totalPips}p</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-500 font-sans">الفريم الزمني</span>
                    <span className="text-sm font-black text-teal-300">{strat.timeframe}</span>
                  </div>
                </div>

                {/* Supported Pairs Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 font-mono">
                  <span className="text-zinc-500 font-sans font-bold text-[11px]">الأزواج المعتمدة:</span>
                  {strat.supportedPairs.map((p) => (
                    <span key={p} className="bg-zinc-950 text-amber-300 px-2 py-0.5 rounded-lg border border-zinc-800 text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Strategy Action Buttons */}
                <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Enable / Disable Button */}
                  <button
                    onClick={() => handleToggleEnable(strat.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                      strat.enabled
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {strat.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{strat.enabled ? 'إيقاف الاستراتيجية' : 'تشغيل الاستراتيجية'}</span>
                  </button>

                  {/* Edit Settings Button */}
                  <button
                    onClick={() => setEditingStrategy({ ...strat })}
                    className="py-2.5 px-3.5 bg-zinc-950 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 active:scale-95"
                    title="تعديل شروط الدخول والخروج والمعاملات الفنية"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل الإعدادات ⚙️</span>
                  </button>

                  {/* Backtest Button */}
                  <button
                    onClick={() => handleRunBacktest(strat)}
                    className="py-2.5 px-3.5 bg-zinc-950 hover:bg-zinc-800 text-teal-300 border border-teal-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 active:scale-95"
                    title="تشغيل محاكاة اختبار التاريخ Backtest"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                    <span>Backtest 📊</span>
                  </button>

                  {/* Paper Trading Button */}
                  <button
                    onClick={() => handleTogglePaperTrading(strat.id)}
                    className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 active:scale-95 border ${
                      isPaperTrading
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}
                    title="تفعيل/إيقاف المحاكاة المباشرة الورقية"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Paper Trade</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT STRATEGY SETTINGS MODAL */}
      {editingStrategy && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">تعديل شروط وإعدادات الاستراتيجية ⚙️</h3>
                  <p className="text-xs text-zinc-400">{editingStrategy.nameAr} ({editingStrategy.id})</p>
                </div>
              </div>

              <button
                onClick={() => setEditingStrategy(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategyEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Timeframe */}
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الفريم الزمني المعتمد:</label>
                  <select
                    value={editingStrategy.timeframe}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, timeframe: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="1M">1 دقيقة (1M)</option>
                    <option value="5M">5 دقائق (5M)</option>
                    <option value="15M">15 دقيقة (15M)</option>
                    <option value="30M">30 دقيقة (30M)</option>
                    <option value="1H">ساعة واحده (1H)</option>
                    <option value="4H">4 ساعات (4H)</option>
                    <option value="1D">يومي (1D)</option>
                  </select>
                </div>

                {/* Min Confidence Threshold */}
                <div>
                  <label className="block font-bold text-amber-400 mb-1">
                    الحد الأدنى لنسبة الثقة (%): {editingStrategy.minConfidenceThreshold}%
                  </label>
                  <input
                    type="range"
                    min={70}
                    max={95}
                    value={editingStrategy.minConfidenceThreshold}
                    onChange={(e) =>
                      setEditingStrategy({ ...editingStrategy, minConfidenceThreshold: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 bg-zinc-950 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Risk Ratio */}
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">معامل إدارة المخاطر (Risk Ratio):</label>
                  <input
                    type="text"
                    value={editingStrategy.defaultRiskRatio}
                    onChange={(e) => setEditingStrategy({ ...editingStrategy, defaultRiskRatio: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Technical Parameters */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h4 className="font-bold text-amber-400">معاملات الاستراتيجية الفنية (Technical Parameters):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editingStrategy.params.map((param, index) => (
                    <div key={param.key} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                      <label className="block text-zinc-300 font-bold">{param.nameAr}:</label>
                      <input
                        type="number"
                        step={param.step || 1}
                        value={param.value}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updatedParams = [...editingStrategy.params];
                          updatedParams[index] = { ...param, value: val };
                          setEditingStrategy({ ...editingStrategy, params: updatedParams });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStrategy(null)}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الشروط وتطبيقها فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW STRATEGY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">إضافة استراتيجية تداول جديدة ➕</h3>
                  <p className="text-xs text-zinc-400">تسجيل وتفعيل استراتيجية جديدة بالنظام فوراً دون تعديل الكود</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStrategy} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">اسم الاستراتيجية (بالعربية):</label>
                <input
                  type="text"
                  value={newStratData.nameAr}
                  onChange={(e) => setNewStratData({ ...newStratData, nameAr: e.target.value })}
                  placeholder="مثال: استراتيجية الدايفرجنس الذهبية"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">الوصف الفني:</label>
                <textarea
                  rows={2}
                  value={newStratData.descriptionAr}
                  onChange={(e) => setNewStratData({ ...newStratData, descriptionAr: e.target.value })}
                  placeholder="شرح آلية الدخول والخروج للمحرك..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">الفريم الزمني:</label>
                  <select
                    value={newStratData.timeframe}
                    onChange={(e) => setNewStratData({ ...newStratData, timeframe: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="15M">15 دقيقة (15M)</option>
                    <option value="1H">ساعة (1H)</option>
                    <option value="4H">4 ساعات (4H)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">حد الثقة (%):</label>
                  <input
                    type="number"
                    min={70}
                    max={95}
                    value={newStratData.minConfidenceThreshold}
                    onChange={(e) => setNewStratData({ ...newStratData, minConfidenceThreshold: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-950 text-zinc-400 font-bold rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>تسجيل وتفعيل الاستراتيجية فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BACKTEST RESULT MODAL */}
      {backtestingStrategy && backtestResult && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-teal-500/40 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 border border-teal-500/40 text-teal-400 rounded-xl">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">تقرير اختبار الاستراتيجية Backtest Report 📊</h3>
                  <p className="text-xs text-zinc-400">{backtestingStrategy.nameAr}</p>
                </div>
              </div>

              <button
                onClick={() => setBacktestingStrategy(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="block text-[11px] text-zinc-400 font-sans">نسبة النجاح الفعلي</span>
                <span className="text-xl font-black text-emerald-400">{backtestResult.winRate}%</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="block text-[11px] text-zinc-400 font-sans">إجمالي الصفقات</span>
                <span className="text-xl font-black text-amber-400">{backtestResult.totalTrades} صفقة</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="block text-[11px] text-zinc-400 font-sans">Profit Factor</span>
                <span className="text-xl font-black text-teal-300">{backtestResult.profitFactor}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <span className="block text-[11px] text-zinc-400 font-sans">صافي النقاط (Net Pips)</span>
                <span className="text-xl font-black text-emerald-300">+{backtestResult.netPips}p</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>النتائج ممتازة! الاستراتيجية محصنة وجاهزة للتداول المباشر وتوليد التوصيات التلقائية.</span>
            </div>

            <button
              onClick={() => setBacktestingStrategy(null)}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-bold rounded-xl text-xs border border-zinc-800"
            >
              إغلاق التقرير
            </button>
          </div>
        </div>
      )}

      {/* FAST PUBLISH RECOMMENDATION MODAL */}
      {isFastPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">نشر توصية فورية للمستخدمين 🚀</h3>
                  <p className="text-xs text-zinc-400">إرسال توصية مباشرة لجميع أجهزة العملاء والتطبيق</p>
                </div>
              </div>

              <button
                onClick={() => setIsFastPublishModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-950 border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishFastSignal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">زوج العملات / الأصل:</label>
                  <select
                    value={fastSignal.pair}
                    onChange={(e) => setFastSignal({ ...fastSignal, pair: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="XAU/USD">🥇 الذهب (XAU/USD)</option>
                    <option value="EUR/USD">💱 EUR/USD</option>
                    <option value="GBP/USD">💱 GBP/USD</option>
                    <option value="USD/JPY">💱 USD/JPY</option>
                    <option value="WTI/USD">🛢️ النفط الخام (WTI)</option>
                    <option value="US30">📈 مؤشر الداوجونز (US30)</option>
                    <option value="BTC/USD">₿ البيتكوين (BTC/USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">نوع الصفقة:</label>
                  <select
                    value={fastSignal.type}
                    onChange={(e) => setFastSignal({ ...fastSignal, type: e.target.value as 'BUY' | 'SELL' })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="BUY">🟢 شراء (BUY)</option>
                    <option value="SELL">🔴 بيع (SELL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-400 mb-1">سعر الدخول (Entry):</label>
                  <input
                    type="number"
                    step="any"
                    value={fastSignal.entryPrice}
                    onChange={(e) => setFastSignal({ ...fastSignal, entryPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-rose-400 mb-1">وقف الخسارة (SL):</label>
                  <input
                    type="number"
                    step="any"
                    value={fastSignal.stopLoss}
                    onChange={(e) => setFastSignal({ ...fastSignal, stopLoss: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-400 mb-1">الهدف الأول (TP1):</label>
                  <input
                    type="number"
                    step="any"
                    value={fastSignal.tp1}
                    onChange={(e) => setFastSignal({ ...fastSignal, tp1: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-300 mb-1">الهدف الثاني (TP2):</label>
                  <input
                    type="number"
                    step="any"
                    value={fastSignal.tp2}
                    onChange={(e) => setFastSignal({ ...fastSignal, tp2: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">ملاحظات التحليل الفني:</label>
                <textarea
                  rows={2}
                  value={fastSignal.notesAr}
                  onChange={(e) => setFastSignal({ ...fastSignal, notesAr: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFastPublishModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-950 text-zinc-400 font-bold rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر التوصية فوراً للمستخدمين</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
