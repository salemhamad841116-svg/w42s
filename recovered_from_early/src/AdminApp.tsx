import React, { useState, useEffect } from 'react';
import {
  ForexSignal,
  SignalStatus,
  Language,
  AppNotification,
  AdminUser,
  AppUserProfile,
  ScreenshotEvent,
  SignalMetrics,
  AuditLogEntry,
  NotificationCampaign,
} from './types';
import { INITIAL_SIGNALS } from './data/initialSignals';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_APP_USERS,
  INITIAL_SCREENSHOT_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIF_CAMPAIGNS,
  INITIAL_SIGNAL_METRICS,
} from './data/mockUsersData';
import { t } from './data/translations';
import { playNotificationSound } from './utils/sound';

// Admin Components Imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewDashboard } from './components/admin/AdminOverviewDashboard';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminSignalManagement } from './components/admin/AdminSignalManagement';
import { AdminScreenshotAnalytics } from './components/admin/AdminScreenshotAnalytics';
import { AdminNotificationsManager } from './components/admin/AdminNotificationsManager';
import { AdminAdvancedAnalytics } from './components/admin/AdminAdvancedAnalytics';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { UserDetailModal } from './components/admin/UserDetailModal';
import { SignalStatsModal } from './components/admin/SignalStatsModal';
import { AdminAutoEngineControl } from './components/admin/AdminAutoEngineControl';
import { AdminEnterpriseInfrastructure } from './components/admin/AdminEnterpriseInfrastructure';
import { AdminPineScriptCodeEditor } from './components/admin/AdminPineScriptCodeEditor';
import { AdminSignalHistory } from './components/admin/AdminSignalHistory';
import { AdminLiveMonitoring } from './components/admin/AdminLiveMonitoring';
import { AdminSystemAuditTimeline } from './components/admin/AdminSystemAuditTimeline';
import { AdminDisasterRecovery } from './components/admin/AdminDisasterRecovery';
import { AdminFeatureFlags } from './components/admin/AdminFeatureFlags';
import { AdminSecretsManager } from './components/admin/AdminSecretsManager';
import { AdminErrorMonitoring } from './components/admin/AdminErrorMonitoring';
import { AdminLoadTesting } from './components/admin/AdminLoadTesting';
import { AdminSecurityAudit } from './components/admin/AdminSecurityAudit';
import { AdminHealthDashboard } from './components/admin/AdminHealthDashboard';
import { AdminBreakingNews } from './components/admin/AdminBreakingNews';
import { AdminAuthGate } from './components/admin/AdminAuthGate';
import { AdminAutoRecommendations } from './components/admin/AdminAutoRecommendations';
import { AdminStrategiesManager } from './components/admin/AdminStrategiesManager';
import { SignalFormModal } from './components/SignalFormModal';
import { globalAutoEngine } from './engine/AutoSignalEngine';
import { globalSystemEnvManager } from './engine/SystemEnvironmentManager';

import { ShieldCheck } from 'lucide-react';

export default function AdminApp() {
  const [lang, setLang] = useState<Language>('ar');

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('strategies');
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(INITIAL_ADMIN_USERS[0]);

  // Admin Managed Datasets
  const [appUsers, setAppUsers] = useState<AppUserProfile[]>(INITIAL_APP_USERS);
  const [screenshotEvents, setScreenshotEvents] = useState<ScreenshotEvent[]>(INITIAL_SCREENSHOT_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>(INITIAL_NOTIF_CAMPAIGNS);
  const [metricsMap, setMetricsMap] = useState<Record<string, SignalMetrics>>(INITIAL_SIGNAL_METRICS);

  // Auto Signal Engine Live State
  const [engineStatus, setEngineStatus] = useState(globalAutoEngine.getStatus());
  const [engineStrategies, setEngineStrategies] = useState(globalAutoEngine.getStrategies());
  const [engineQualityConfig, setEngineQualityConfig] = useState(globalAutoEngine.getQualityConfig());
  const [engineLogs, setEngineLogs] = useState(globalAutoEngine.getLogs());

  // System Environment & Maintenance Manager State
  const [maintConfig, setMaintConfig] = useState(globalSystemEnvManager.getMaintenanceConfig());
  const [selectedUserForModal, setSelectedUserForModal] = useState<AppUserProfile | null>(null);
  const [selectedSignalForStatsModal, setSelectedSignalForStatsModal] = useState<ForexSignal | null>(null);

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

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<ForexSignal | null>(null);

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
      setEngineLogs(globalAutoEngine.getLogs());
      setEngineStatus(globalAutoEngine.getStatus());

      showToast(
        lang === 'ar'
          ? `⚡ تم توليد وتوزيع إشارة آلية جديدة على ${dispatchedSignal.pair}!`
          : `⚡ New automated signal generated & dispatched for ${dispatchedSignal.pair}!`
      );
    });

    globalAutoEngine.onLogAdded(() => {
      setEngineLogs([...globalAutoEngine.getLogs()]);
    });

    globalAutoEngine.onStatusChanged((newStatus) => {
      setEngineStatus({ ...newStatus });
    });
  }, [lang]);

  // Handle document direction and title based on language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Trigger Notification & Audio Ping
  const triggerNotification = (
    signalId: string,
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string,
    soundType: 'new' | 'tp' | 'sl' | 'update' = 'new'
  ) => {
    playNotificationSound(soundType);
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
    }
  };

  // Copy Signal Text
  const handleCopySignalText = (signal: ForexSignal) => {
    const text = `📊 ${signal.pair} [${signal.type}]\nEntry: ${signal.entryPrice}\nTP1: ${signal.tp1}\nSL: ${signal.stopLoss}`;
    navigator.clipboard.writeText(text);
    showToast(lang === 'ar' ? 'تم نسخ بيانات الإشارة بنجاح' : 'Signal text copied');
  };

  // Delete Signal
  const handleDeleteSignal = (id: string) => {
    if (window.confirm(t[lang].confirmDelete)) {
      setSignals((prev) => prev.filter((s) => s.id !== id));
      showToast(lang === 'ar' ? 'تم حذف الإشارة' : 'Signal deleted');
    }
  };

  // Add audit log entry
  const logAdminAction = (action: AuditLogEntry['action'], target: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      adminId: currentAdmin?.id || 'adm-1',
      adminName: currentAdmin?.name || 'سارة الشمري',
      adminRole: currentAdmin?.role || 'super_admin',
      action,
      target,
      details,
      timestamp: new Date().toLocaleString(),
      ip: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // User management actions
  const handleBlockUser = (userId: string, isBlocked: boolean) => {
    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked } : u))
    );
    const targetUser = appUsers.find((u) => u.id === userId);
    logAdminAction(
      isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
      targetUser?.name || userId,
      isBlocked ? 'حظر حساب المستخدم وتعليق الوصول' : 'إلغاء حظر المستخدم'
    );
    showToast(isBlocked ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم');
  };

  const handleUpdateUserRole = (userId: string, isVip: boolean) => {
    setAppUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVip } : u))
    );
    const targetUser = appUsers.find((u) => u.id === userId);
    logAdminAction(
      'UPDATE_USER_ROLE',
      targetUser?.name || userId,
      isVip ? 'ترقية المستخدم إلى عضوية VIP' : 'تخفيض المستخدم للمجاني'
    );
    showToast(isVip ? 'تم ترقية العضوية إلى VIP ⭐' : 'تم تعديل العضوية إلى مجانية');
  };

  // Broadcast Notification Campaign Action
  const handleSendCampaign = (
    camp: Omit<NotificationCampaign, 'id' | 'sentCount' | 'openCount' | 'openRate'>
  ) => {
    const newCamp: NotificationCampaign = {
      ...camp,
      id: `camp-${Date.now()}`,
      sentCount: appUsers.length,
      openCount: Math.floor(appUsers.length * 0.82),
      openRate: 82,
    };
    setCampaigns((prev) => [newCamp, ...prev]);

    logAdminAction(
      'SEND_NOTIF',
      `حملة إشعارات (${camp.targetGroup})`,
      `إرسال إشعار موجه لجميع مستخدمي فئة ${camp.targetGroup}: ${camp.titleAr}`
    );

    showToast('🚀 تم إرسال حملة الإشعارات بنجاح!');
  };

  // Auto Signal Engine Handlers
  const handleToggleEngineRunning = () => {
    const updatedStatus = globalAutoEngine.toggleEngineRunning();
    setEngineStatus({ ...updatedStatus });
    logAdminAction('CONFIG_CHANGE', 'Auto Engine', updatedStatus.isRunning ? 'تشغيل سيرفر محرك التداول الآلي' : 'إيقاف مؤقت لمحرك التداول');
    showToast(updatedStatus.isRunning ? '🚀 تم تشغيل محرك التداول الآلي 24/7' : '⏸️ تم إيقاف محرك التداول مؤقتاً');
  };

  const handleToggleStrategy = (strategyId: string) => {
    const updatedStrats = globalAutoEngine.toggleStrategy(strategyId);
    setEngineStrategies([...updatedStrats]);
    const targetStrat = updatedStrats.find((s) => s.id === strategyId);