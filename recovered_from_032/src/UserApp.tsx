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