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