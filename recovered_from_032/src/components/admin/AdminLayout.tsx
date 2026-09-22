import React, { useState, useEffect } from 'react';
import { AdminUser, Language } from '../../types';
import { globalSystemEnvManager } from '../../engine/SystemEnvironmentManager';
import {
  LayoutDashboard,
  Users,
  Zap,
  Camera,
  Bell,
  BarChart3,
  ShieldCheck,
  LogOut,
  Globe,
  Lock,
  ChevronRight,
  ExternalLink,
  Flame,
  Key,
  Bot,
  Server,
  Code,
  History,
  Activity,
  FileText,
  ShieldAlert,
  Sliders,
  Bug,
  Radio,
} from 'lucide-react';

interface AdminLayoutProps {
  currentAdmin: AdminUser;
  onLogoutAdmin: () => void;
  onReturnToMainApp: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  lang: Language;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdmin,
  onLogoutAdmin,
  onReturnToMainApp,
  activeTab,
  setActiveTab,
  children,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeEnv, setActiveEnv] = useState(globalSystemEnvManager.getEnvironment());
  const [maintConfig, setMaintConfig] = useState(globalSystemEnvManager.getMaintenanceConfig());

  useEffect(() => {
    const unsub = globalSystemEnvManager.subscribe(() => {
      setActiveEnv(globalSystemEnvManager.getEnvironment());
      setMaintConfig(globalSystemEnvManager.getMaintenanceConfig());
    });
    return unsub;
  }, []);

  const navItems = [
    { id: 'breakingNews', labelAr: '🚨 الأخبار العاجلة (Breaking)', labelEn: 'Breaking News', icon: Flame, badge: 'بث مباشر' },
    { id: 'healthDashboard', labelAr: 'لوحة الصحة والنبض (Health)', labelEn: 'Health Dashboard', icon: Radio, badge: '🟢 8/8 Services' },
    { id: 'overview', labelAr: 'الإحصائيات المباشرة', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'disasterRecovery', labelAr: 'استعادة الخدمة والكوارث', labelEn: 'Disaster Recovery', icon: ShieldAlert, badge: 'SLA' },
    { id: 'featureFlags', labelAr: 'مفاتيح الميزات (Flags)', labelEn: 'Feature Flags', icon: Sliders, badge: 'Dynamic' },
    { id: 'secretsManager', labelAr: 'إدارة الأسرار والمفاتيح', labelEn: 'Secrets Vault', icon: Key, badge: 'Rotation' },
    { id: 'errorMonitoring', labelAr: 'مراقبة الأخطاء والاستثناءات', labelEn: 'Crash Logs', icon: Bug },
    { id: 'loadTesting', labelAr: 'اختبار الأحمال والشواهد', labelEn: 'Load Testing', icon: Activity, badge: '5k Users' },
    { id: 'securityAudit', labelAr: 'المراجعة الأمنية والتحصين', labelEn: 'Security Audit', icon: ShieldCheck, badge: 'OWASP' },
    { id: 'liveMonitoring', labelAr: 'لوحة المراقبة المباشرة', labelEn: 'Live Telemetry', icon: Activity, badge: 'مباشر' },
    { id: 'signalHistory', labelAr: 'سجل جميع الإشارات', labelEn: 'Signal History', icon: History, badge: 'أرشيف' },
    { id: 'activityTimeline', labelAr: 'سجل النشاط والعمليات', labelEn: 'Activity Timeline', icon: FileText },
    { id: 'pinescript', labelAr: 'وحدة الاستراتيجية (Camarilla.ts)', labelEn: 'Camarilla Strategy', icon: Code, badge: 'TS Engine' },
    { id: 'autoEngine', labelAr: 'محرك التداول الآلي', labelEn: 'Auto Engine', icon: Bot, badge: 'آلي 24/7' },
    { id: 'infrastructure', labelAr: 'البنية التحتية والمراقبة', labelEn: 'Infrastructure', icon: Server, badge: 'Enterprise' },
    { id: 'users', labelAr: 'إدارة المستخدمين والأجهزة', labelEn: 'Users & Devices', icon: Users },
    { id: 'signals', labelAr: 'إدارة الإشارات', labelEn: 'Signals', icon: Zap },
    { id: 'screenshots', labelAr: 'إحصائيات لقطات الشاشة', labelEn: 'Screenshots', icon: Camera, badge: 'جديد' },