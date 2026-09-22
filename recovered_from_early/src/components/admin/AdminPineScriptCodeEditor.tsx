import React, { useState, useEffect } from 'react';
import {
  Code,
  Save,
  Check,
  Zap,
  Sliders,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  Cpu,
  Copy,
  Globe,
  Webhook,
  Layers,
  Power,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  History,
  GitCompare,
  RotateCcw,
  Play,
  AlertTriangle,
  BarChart2,
  Clock,
  ArrowUpRight,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Flame,
  RefreshCw,
  FileText,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { globalStrategyRegistry } from '../../engine/strategies/StrategyRegistry';
import {
  BaseStrategy,
  LevelRuleConfig,
  TradingSignal,
  StrategyVersion,
  BacktestResult,
} from '../../engine/strategies/BaseStrategy';
import { globalAutoEngine } from '../../engine/AutoSignalEngine';
import { globalRedisQueueManager } from '../../engine/RedisQueueManager';

export const AdminPineScriptCodeEditor: React.FC = () => {
  const [strategies, setStrategies] = useState<BaseStrategy[]>(globalStrategyRegistry.getAllStrategies());
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('camarilla_pivot');
  const [selectedStrategy, setSelectedStrategy] = useState<BaseStrategy | undefined>(
    globalStrategyRegistry.getStrategy('camarilla_pivot')
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'analytics' | 'circuit'>('editor');

  // Draft Rule State