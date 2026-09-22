import React, { useState, useEffect } from 'react';
import { BreakingNewsItem, SubscriptionTier } from '../types';
import { globalBreakingNewsManager } from '../engine/BreakingNewsManager';
import {
  AlertTriangle,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Flame,
  Megaphone,
  Radio,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pin,
  Volume2,
  Sparkles,
  Share2,
  Paperclip,
  Download,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface BreakingNewsBannerProps {
  userTier?: SubscriptionTier;
  onShowToast?: (msg: string) => void;
}

export const BreakingNewsBannerCard: React.FC<BreakingNewsBannerProps> = ({
  userTier = 'free',
  onShowToast,
}) => {
  const [activeNewsList, setActiveNewsList] = useState<BreakingNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedNewsModal, setSelectedNewsModal] = useState<BreakingNewsItem | null>(null);

  useEffect(() => {
    const updateList = () => {
      const active = globalBreakingNewsManager.getActiveNews(userTier);
      setActiveNewsList(active);
      if (currentIndex >= active.length && active.length > 0) {
        setCurrentIndex(0);
      }
    };

    updateList();
    const unsub = globalBreakingNewsManager.subscribe(updateList);

    const handleNewsEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ publishedNews?: BreakingNewsItem }>;
      const news = customEvent.detail?.publishedNews;
      if (news && onShowToast) {
        onShowToast(`🚨 خبر عاجل جديد: ${news.title}`);
      }
    };

    window.addEventListener('breaking_news_event', handleNewsEvent);