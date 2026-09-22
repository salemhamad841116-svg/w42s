import React, { useState, useEffect } from 'react';
import {
  ForexSignal,
  SignalStatus,
  Language,
  AppNotification,
  PriceAlert,
  ScreenshotEvent,
} from './types';
import { INITIAL_SIGNALS } from './data/initialSignals';
import { t } from './data/translations';
import { playNotificationSound } from './utils/sound';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { SignalBannerCard } from './components/SignalBannerCard';
import { ShareModal } from './components/ShareModal';
import { SignalFormModal } from './components/SignalFormModal';
import { QuickUpdateModal } from './components/QuickUpdateModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BreakingNewsBannerCard } from './components/BreakingNewsBannerCard';
import { globalAutoEngine } from './engine/AutoSignalEngine';
import { globalSystemEnvManager } from './engine/SystemEnvironmentManager';

import { AlertCircle, RefreshCw, Lock, ShieldCheck, Sliders, Shield } from 'lucide-react';

export default function UserApp() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'active' | 'archive' | 'analytics' | 'favorites'>('active');
  const [displayMode, setDisplayMode] = useState<'banner' | 'modern'>('banner');

  // System Environment & Maintenance Manager State
  const [maintConfig, setMaintConfig] = useState(globalSystemEnvManager.getMaintenanceConfig());

  useEffect(() => {
    const unsub = globalSystemEnvManager.subscribe(() => {
      setMaintConfig(globalSystemEnvManager.getMaintenanceConfig());
    });
    return unsub;
  }, []);

  // Signals state
  const [signals, setSignals] = useState<ForexSignal[]>(() => {
    const saved = localStorage.getItem('forex_signals_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved signals:', err);
      }
    }
    return INITIAL_SIGNALS;
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('forex_favorites');
    return saved ? JSON.parse(saved) : ['sig-001'];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('forex_notifs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-1',
        signalId: 'sig-001',
        titleAr: '🎯 تم تحقيق الهدف الأول!',
        titleEn: '🎯 Target 1 Hit!',
        bodyAr: 'إشارة EUR/USD حققت الهدف الأول بنجاح (+13 نقطة).',
        bodyEn: 'EUR/USD signal hit Target 1 (+13 pips).',
        timestamp: 'منذ 10 دقائق',
        read: false,
        type: 'tp_hit',
      },
    ];
  });

  // Price Alerts state
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('forex_price_alerts_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'pa-1',
        pair: 'XAU/USD',
        targetPrice: 2425.0,
        condition: 'ABOVE',
        enabled: true,
        isTriggered: false,
        createdAt: '10:00 AM',
      },
      {
        id: 'pa-2',
        pair: 'EUR/USD',
        targetPrice: 1.1550,
        condition: 'ABOVE',
        enabled: true,
        isTriggered: false,
        createdAt: '11:15 AM',
      },
    ];
  });

  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [alertInitialPair, setAlertInitialPair] = useState('EUR/USD');
  const [alertInitialPrice, setAlertInitialPrice] = useState<number | undefined>(undefined);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareSignal, setSelectedShareSignal] = useState<ForexSignal | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<ForexSignal | null>(null);

  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [quickUpdateSignal, setQuickUpdateSignal] = useState<ForexSignal | null>(null);

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTrend, setSelectedTrend] = useState('ALL');

  // Copy toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('forex_signals_v1', JSON.stringify(signals));
  }, [signals]);

  // Subscribe to Auto Signal Engine events
  useEffect(() => {
    globalAutoEngine.onSignalDispatched((dispatchedSignal, log) => {
      setSignals((prev) => [dispatchedSignal, ...prev]);

      // Trigger Push Notification & Sound
      triggerNotification(
        dispatchedSignal.id,
        `🤖 إشارة آلية جديدة: ${dispatchedSignal.pair}`,
        `🤖 New Auto Signal: ${dispatchedSignal.pair}`,
        `تم اصطياد إشارة ${dispatchedSignal.type} عبر ${log.strategyName}. نسبة الثقة: ${log.confidenceScore}%.`,
        `Auto entry for ${dispatchedSignal.type} via ${log.strategyName}. Confidence: ${log.confidenceScore}%.`,
        'new'
      );

      showToast(
        lang === 'ar'
          ? `⚡ تم توليد وتوزيع إشارة آلية جديدة على ${dispatchedSignal.pair}!`
          : `⚡ New automated signal generated & dispatched for ${dispatchedSignal.pair}!`
      );
    });
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('forex_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('forex_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('forex_price_alerts_v1', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Handle document direction and title based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast(lang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites');
        return prev.filter((item) => item !== id);
      } else {
        showToast(lang === 'ar' ? 'تمت الإضافة للمفضلة ⭐' : 'Added to favorites ⭐');
        return [...prev, id];
      }
    });
  };

  // Share Modal triggers
  const handleOpenShare = (signal: ForexSignal) => {
    setSelectedShareSignal(signal);
    setIsShareModalOpen(true);
  };

  const handleCopySignalText = (signal: ForexSignal) => {
    const text = `📊 ${signal.pair} [${signal.type}]\nEntry: ${signal.entryPrice}\nTP1: ${signal.tp1}\nSL: ${signal.stopLoss}`;
    navigator.clipboard.writeText(text);
    showToast(lang === 'ar' ? 'تم نسخ بيانات الإشارة بنجاح' : 'Signal text copied');
  };

  // Save new or edited signal
  const handleSaveSignal = (signalData: Partial<ForexSignal>, notify: boolean) => {
    if (editingSignal) {
      // Edit existing
      setSignals((prev) =>
        prev.map((s) =>
          s.id === editingSignal.id
            ? ({
                ...s,
                ...signalData,
                updatedAt: new Date().toISOString(),
              } as ForexSignal)
            : s
        )
      );
      showToast(lang === 'ar' ? 'تم تحديث الإشارة بنجاح' : 'Signal updated');
      if (notify) {
        triggerNotification(
          editingSignal.id,
          `🔄 تحديث الإشارة: ${signalData.pair || editingSignal.pair}`,
          `🔄 Signal Updated: ${signalData.pair || editingSignal.pair}`,
          `تم تعديل شروط/أسعار الإشارة لـ ${signalData.pair || editingSignal.pair}`,
          `Updated levels for ${signalData.pair || editingSignal.pair}`,
          'update'
        );
      }
    } else {
      // Create new signal
      const newId = `sig-${Date.now().toString().slice(-4)}`;
      const newSignal: ForexSignal = {
        id: newId,
        pair: signalData.pair || 'EUR/USD',
        type: signalData.type || 'BUY',
        entryPrice: signalData.entryPrice || 0,
        tp1: signalData.tp1 || 0,
        tp2: signalData.tp2 || 0,
        tp3: signalData.tp3 || 0,
        stopLoss: signalData.stopLoss || 0,
        riskRatio: signalData.riskRatio || '1:2',
        analyst: signalData.analyst || 'خبير التداول',
        notesAr: signalData.notesAr || '',
        notesEn: signalData.notesEn || '',
        status: signalData.status || 'active',
        openTime: signalData.openTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        closeTime: signalData.closeTime || '',
        updates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSignals((prev) => [newSignal, ...prev]);
      showToast(lang === 'ar' ? '🚀 تم نشر الإشارة الجديدة بنجاح' : '🚀 New signal published');

      if (notify) {
        triggerNotification(
          newId,
          `🟢 إشارة جديدة: ${newSignal.pair} (${newSignal.type})`,
          `🟢 New Signal: ${newSignal.pair} (${newSignal.type})`,
          `سعر الدخول: ${newSignal.entryPrice} | الهدف الأول: ${newSignal.tp1} | وقف الخسارة: ${newSignal.stopLoss}`,
          `Entry: ${newSignal.entryPrice} | TP1: ${newSignal.tp1} | SL: ${newSignal.stopLoss}`,
          'new'
        );
      }
    }
  };

  // Add Live Update to Signal
  const handleAddQuickUpdate = (
    signalId: string,
    messageAr: string,
    messageEn: string,
    newStatus?: SignalStatus,
    notify: boolean = true
  ) => {
    const updateObj = {
      id: `up-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageAr,
      messageEn,
      type: 'info' as const,
    };

    setSignals((prev) =>
      prev.map((s) => {
        if (s.id === signalId) {
          return {
            ...s,
            status: newStatus || s.status,
            updates: [updateObj, ...(s.updates || [])],