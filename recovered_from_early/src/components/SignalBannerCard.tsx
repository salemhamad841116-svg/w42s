import React from 'react';
import { ForexSignal, Language, ScreenshotEvent, SubscriptionTier } from '../types';
import { globalSystemEnvManager } from '../engine/SystemEnvironmentManager';
import { PAIR_NAMES_AR, PAIR_NAMES_EN, PAIRS_DATA } from '../data/pairs';
import { t, getStatusBadge } from '../data/translations';
import { ClientScreenshotListener } from './ClientScreenshotListener';
import {
  CheckCircle2,
  Copy,
  Share2,
  Star,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Camera,
  Lock,
  Crown,
  Sparkles,
} from 'lucide-react';

interface SignalBannerCardProps {
  signal: ForexSignal;
  lang: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShareModal: (signal: ForexSignal) => void;
  onCopySignal: (signal: ForexSignal) => void;
  onSetPriceAlert?: (pair: string, price: number) => void;
  onRecordScreenshot?: (event: Omit<ScreenshotEvent, 'id' | 'timestamp'>) => void;
  isAdmin?: boolean;
  onEdit?: (signal: ForexSignal) => void;
  onDelete?: (id: string) => void;
  onQuickUpdate?: (signal: ForexSignal) => void;
  displayMode?: 'banner' | 'modern';
  userSubscriptionTier?: SubscriptionTier;
  onOpenUpgradeModal?: () => void;
}


export const SignalBannerCard: React.FC<SignalBannerCardProps> = ({
  signal,
  lang,
  isFavorite,
  onToggleFavorite,
  onShareModal,
  onCopySignal,
  onSetPriceAlert,
  onRecordScreenshot,
  isAdmin = false,
  onEdit,
  onDelete,
  onQuickUpdate,
  displayMode = 'banner',
  userSubscriptionTier = 'free',
  onOpenUpgradeModal,
}) => {
  const dictionary = t[lang];
  const pairInfo = PAIRS_DATA.find((p) => p.symbol === signal.pair) || {
    flags: ['🔤', '🔤'],
    decimals: 4,
  };

  const isBuy = signal.type === 'BUY';
  const statusInfo = getStatusBadge(signal.status, lang);

  const pairName =
    lang === 'ar'
      ? PAIR_NAMES_AR[signal.pair] || signal.pair
      : PAIR_NAMES_EN[signal.pair] || signal.pair;

  const normalizedUserTier: SubscriptionTier =
    (userSubscriptionTier as string).startsWith('vip') ? 'vip' : (userSubscriptionTier as SubscriptionTier) || 'free';
  const requiredTier: SubscriptionTier = signal.requiredTier || 'free';
  const accessCheck = globalSystemEnvManager.checkSubscriptionAccess(normalizedUserTier, requiredTier);
  const isLockedForUser = !accessCheck.hasAccess && !isAdmin;

  if (displayMode === 'banner') {
    // Exact visual card design matching the user's uploaded reference image (Compact mode)
    const isGreenTheme = isBuy;
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl max-w-md mx-auto w-full ${
          isGreenTheme
            ? 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 text-zinc-950 border-emerald-400/40'
            : 'bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white border-rose-400/40'
        }`}
      >
        {/* Top Header Banner */}
        <div className="bg-white/95 backdrop-blur-sm py-1.5 px-3 text-center border-b border-black/10">
          <h2
            className={`text-base sm:text-lg font-black tracking-wide ${
              isGreenTheme ? 'text-rose-600' : 'text-emerald-700'