import React, { useState, useCallback, useEffect } from 'react';
import {
  BarChart3,
  Radio,
  Sparkles,
  Sliders,
  Users,
  Shield,
  LogOut,
  ExternalLink,
  Flame,
  LayoutDashboard,
  ShieldAlert,
  Key,
  Bug,
  Activity,
  ShieldCheck,
  History,
  FileText,
  Code,
  Bot,
  Server,
  Zap,
  Camera,
  Bell,
  PanelRight,
  ChevronDown,
  X,
  Rocket,
} from 'lucide-react';
import { AdminFeatureOverrides } from './AdminFeatureOverrides';
import { AdminAILogs } from './AdminAILogs';
import { AdminAPIKeys } from './AdminAPIKeys';
import { AdminUSE } from './AdminUSE';
import { ShieldCheck as ShieldCheckIcon, ShieldAlert as ShieldAlertIcon, Users as UsersIcon, Image as ImageIcon, Sliders as SlidersIcon, LineChart, Activity as ActivityIcon, Zap as ZapIcon, Cpu, Bell as BellIcon, Radio as RadioIcon, Database, Shield as ShieldIcon, Wrench, Settings, Search, Lock, AlertTriangle, AlertCircle, FileText as FileTextIcon, Bot as BotIcon, KeyRound, Brain } from 'lucide-react';
import { t } from '../../data/translations';

export interface AdminNavItem {
  id: string;
  labelAr: string;
  labelEn: string;
  category?: string;
  icon: React.FC<{ className?: string; size?: number }>;
  badge?: string;
}

// ─── Sub-items under "إدارة التوصيات والإشارات" ───
export const SIGNALS_SUB_ITEMS: AdminNavItem[] = [
  { id: 'strategies', labelAr: 'استراتيجيات التداول', labelEn: 'Strategies', icon: Sliders, badge: '9 استراتيجيات' },
  { id: 'recommendations', labelAr: 'التوصيات التلقائية بالذكاء الصناعي', labelEn: 'AI Recommendations', icon: Sparkles, badge: 'AI Engine' },
  { id: 'signalHistory', labelAr: 'سجل جميع الإشارات', labelEn: 'Signal History', icon: History, badge: 'أرشيف' },
  { id: 'signals', labelAr: 'الإعدادات العامة للتوصيات والإشارات', labelEn: 'Signal Management & Settings', icon: Radio, badge: 'إعدادات' },
];

export const ALL_ADMIN_NAV_ITEMS: AdminNavItem[] = [
  // الرئيسية والتداول (Signals items are grouped under parent accordion)
  { id: 'tradingTerminal', labelAr: '📊 الرسم البياني ومنصة التداول', labelEn: 'Trading Chart', category: 'التداول والتحليل', icon: BarChart3, badge: 'Live Pro' },
  { id: 'brokerAccounts', labelAr: '⚡ ربط حسابات الوسطاء (MT5 & Binance)', labelEn: 'Broker Demo Accounts', category: 'التداول والتحليل', icon: Zap, badge: 'Demo Live' },

  // لوحات المراقبة والإحصائيات
  { id: 'overview', labelAr: '📈 الإحصائيات المباشرة', labelEn: 'Overview', category: 'المراقبة والإحصاء', icon: LayoutDashboard },
  { id: 'breakingNews', labelAr: '🚨 الأخبار العاجلة', labelEn: 'Breaking News', category: 'المراقبة والإحصاء', icon: Flame, badge: 'بث مباشر' },
  { id: 'healthDashboard', labelAr: '🟢 لوحة الصحة والنبض', labelEn: 'Health Dashboard', category: 'المراقبة والإحصاء', icon: Radio, badge: '8/8 Services' },
  { id: 'liveMonitoring', labelAr: '📡 لوحة المراقبة المباشرة', labelEn: 'Live Telemetry', category: 'المراقبة والإحصاء', icon: Activity, badge: 'مباشر' },
  { id: 'analytics', labelAr: '📊 التحليلات المتقدمة والذكاء المالي', labelEn: 'Analytics', category: 'المراقبة والإحصاء', icon: BarChart3 },

  // المستخدمين والتواصل
  { id: 'users', labelAr: '👥 إدارة المستخدمين والأجهزة', labelEn: 'Users & Devices', category: 'المستخدمين والتواصل', icon: Users, badge: '1,248' },
  { id: 'screenshots', labelAr: '📸 إحصائيات لقطات الشاشة', labelEn: 'Screenshots', category: 'المستخدمين والتواصل', icon: Camera, badge: 'جديد' },
  { id: 'notifications', labelAr: '🔔 إرسال الإشعارات وحملات التنبيه', labelEn: 'Push Campaigns', category: 'المستخدمين والتواصل', icon: Bell },

  // المحركات والأنظمة
  { id: 'useEngine', labelAr: '🧠 محرك الاستراتيجيات الكونية', labelEn: 'Universal Strategy Engine', category: 'المحركات والأنظمة', icon: Brain, badge: 'USE' },
  { id: 'autoEngine', labelAr: '🤖 محرك التداول الآلي', labelEn: 'Auto Engine', category: 'المحركات والأنظمة', icon: Bot, badge: 'آلي 24/7' },
  { id: 'pinescript', labelAr: '💻 وحدة الاستراتيجية (Camarilla.ts)', labelEn: 'Camarilla Strategy', category: 'المحركات والأنظمة', icon: Code, badge: 'TS Engine' },
  { id: 'infrastructure', labelAr: '🏢 البنية التحتية والمراقبة', labelEn: 'Infrastructure', category: 'المحركات والأنظمة', icon: Server, badge: 'Enterprise' },
  { id: 'activityTimeline', labelAr: '⏱️ سجل النشاط والعمليات', labelEn: 'Activity Timeline', category: 'المحركات والأنظمة', icon: FileText },
  { id: 'audit', labelAr: '📋 سجل عمليات النظام (Audit Logs)', labelEn: 'Audit Logs', category: 'المحركات والأنظمة', icon: ShieldCheck },

  // الأمان والتشغيل
  { id: 'appUpdates', labelAr: '🚀 مركز تحديثات المنصة (Updates)', labelEn: 'App Updates', category: 'الأمان والعمليات', icon: Rocket, badge: 'PWA Live' },
  { id: 'featureFlags', labelAr: '🎛️ مفاتيح الميزات (Flags)', labelEn: 'Feature Flags', category: 'الأمان والعمليات', icon: Sliders, badge: 'Dynamic' },
  { id: 'secretsManager', labelAr: '🔑 إدارة الأسرار والمفاتيح', labelEn: 'Secrets Vault', category: 'الأمان والعمليات', icon: Key, badge: 'Rotation' },
  { id: 'securityAudit', labelAr: '🔒 المراجعة الأمنية والتحصين', labelEn: 'Security Audit', category: 'الأمان والعمليات', icon: ShieldCheck, badge: 'OWASP' },
  { id: 'errorMonitoring', labelAr: '🐞 مراقبة الأخطاء والاستثناءات', labelEn: 'Crash Logs', category: 'الأمان والعمليات', icon: Bug },
  { id: 'loadTesting', labelAr: '⚡ اختبار الأحمال والشواهد', labelEn: 'Load Testing', category: 'الأمان والعمليات', icon: Activity, badge: '5k Users' },
  { id: 'disasterRecovery', labelAr: '🛡️ استعادة الخدمة والكوارث', labelEn: 'Disaster Recovery', category: 'الأمان والعمليات', icon: ShieldAlert, badge: 'SLA' },
];

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  // Collapsed by default when opening Admin Dashboard with session persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem('admin_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : true; // Default: Collapsed
    } catch {
      return true;
    }
  });

  // Track if any signal sub-tab is currently active
  const isSignalsActive = ['signals', 'strategies', 'recommendations', 'signalHistory'].includes(activeTab);

  // Accordion state for "إدارة التوصيات والإشارات"
  const [signalsMenuOpen, setSignalsMenuOpen] = useState<boolean>(() => isSignalsActive);

  // Keep accordion open whenever user is on one of the signals pages
  useEffect(() => {
    if (isSignalsActive) {
      setSignalsMenuOpen(true);
    }
  }, [isSignalsActive]);

  // Single toggle function for the sidebar
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('admin_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    // On mobile / tablet screens, automatically close drawer after picking section
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  // Toggle Accordion
  const handleToggleSignalsAccordion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollapsed) {
      // If sidebar is collapsed, clicking expands the sidebar and opens the accordion
      setIsCollapsed(false);
      setSignalsMenuOpen(true);
      return;
    }
    setSignalsMenuOpen((prev) => !prev);
  };

  const navCategories = ['التداول والتحليل', 'المراقبة والإحصاء', 'المستخدمين والتواصل', 'المحركات والأنظمة', 'الأمان والعمليات'];

  // Render the Signals & Recommendations Accordion Group
  const renderSignalsGroup = (isMobile = false) => {
    const showSubmenu = signalsMenuOpen && (!isCollapsed || isMobile);

    return (
      <div className="space-y-1">
        {/* Parent Button: إدارة التوصيات والإشارات */}
        <button
          type="button"
          onClick={handleToggleSignalsAccordion}
          title="إدارة التوصيات والإشارات"
          className={`w-full rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer relative ${
            !isMobile && isCollapsed
              ? 'justify-center h-10 px-0'
              : 'justify-between px-3 py-2'
          } ${
            isSignalsActive
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md shadow-amber-500/10'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <div className={`flex items-center gap-2.5 min-w-0 ${!isMobile && isCollapsed ? 'justify-center' : ''}`}>
            <Zap className={`w-4 h-4 shrink-0 ${isSignalsActive ? 'text-amber-400' : 'text-zinc-400'}`} />
            {(isMobile || !isCollapsed) && (
              <span className="truncate font-black">إدارة التوصيات والإشارات</span>
            )}
          </div>

          {(isMobile || !isCollapsed) && (
            <div className="flex items-center gap-1.5 shrink-0 mr-1">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                4 أقسام
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-zinc-400 ${
                  signalsMenuOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </div>
          )}

          {/* Collapsed active indicator pip */}
          {!isMobile && isCollapsed && isSignalsActive && (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}
        </button>

        {/* ─── Nested Submenu Items (Accordion) ─── */}
        {showSubmenu && (
          <div className="mr-3 pr-3 my-1 space-y-1 border-r-2 border-amber-500/35 animate-in fade-in slide-in-from-top-1 duration-200">
            {SIGNALS_SUB_ITEMS.map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = activeTab === sub.id;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleNavClick(sub.id)}
                  className={`w-full text-right px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSubActive
                      ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-black' : 'text-amber-400'}`} />
                    <span className="truncate">{sub.labelAr}</span>
                  </div>
                  {sub.badge && (
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0 mr-1 ${
                        isSubActive
                          ? 'bg-black text-amber-400'
                          : 'bg-zinc-800 text-amber-400/80 border border-zinc-700/50'
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col font-sans select-none" dir="rtl">
      {/* ─── Top Navbar (Header stays completely fixed) ─── */}
      <header className="h-14 bg-[#11141c] border-b border-zinc-800 px-4 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Fixed Single Toggle Button (never shifts or jumps) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border shrink-0 ${
              !isCollapsed
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/60'
            }`}
            title={isCollapsed ? 'توسيع القائمة الجانبية (Expand Sidebar)' : 'طي القائمة الجانبية (Collapse Sidebar)'}
            aria-label="تبديل القائمة الجانبية"
          >
            <PanelRight size={18} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180 text-amber-400'}`} />
          </button>

          {/* Brand Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
            M
          </div>

          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-white flex items-center gap-2">
              لوحة التحكم الشاملة - Masruq Admin
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                24 قسم مفعّل
              </span>
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50 transition-all"
          >
            <span>فتح المنصة العامة</span>
            <ExternalLink size={14} />
          </a>

          <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-400">
              A
            </div>
            <span className="text-xs font-bold text-zinc-300 hidden sm:inline">المدير العام</span>
          </div>
        </div>
      </header>

      {/* ─── Main Workspace & Sidebar Layout ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ─── Desktop Collapsible Sidebar (Smooth 300ms transition) ─── */}
        <aside
          className={`hidden md:flex flex-col justify-between shrink-0 bg-[#10131a] border-l border-zinc-800 transition-all duration-300 ease-in-out select-none max-h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden ${
            isCollapsed ? 'w-[68px] p-2' : 'w-72 p-3'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          <nav className="space-y-3">
            {navCategories.map((cat) => {
              const items = ALL_ADMIN_NAV_ITEMS.filter((i) => i.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  {/* Category Title or Divider */}
                  {isCollapsed ? (
                    <div className="h-px bg-zinc-800/70 my-2 mx-1" />
                  ) : (
                    <div className="text-[10px] font-black uppercase text-zinc-500 px-3 py-1 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                      {cat}
                    </div>
                  )}

                  {/* Nav Items in this category */}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        title={item.labelAr}
                        className={`w-full rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer relative ${
                          isCollapsed
                            ? 'justify-center h-10 px-0'
                            : 'justify-between px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                          {!isCollapsed && <span className="truncate">{item.labelAr}</span>}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 mr-1 ${
                              isActive
                                ? 'bg-black text-amber-400'
                                : 'bg-zinc-800 text-amber-400/80 border border-zinc-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed active indicator pip */}
                        {isCollapsed && isActive && (
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </button>
                    );
                  })}

                  {/* Under "التداول والتحليل", render the consolidated Signals Accordion */}
                  {cat === 'التداول والتحليل' && renderSignalsGroup(false)}
                </div>
              );
            })}
          </nav>

          {/* Desktop Logout Button */}
          <div className="pt-3 border-t border-zinc-800/80 mt-3">
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                  window.location.href = '/';
                }
              }}
              title="تسجيل الخروج"
              className={`w-full bg-zinc-900 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isCollapsed ? 'h-10 px-0' : 'py-2'
              }`}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </aside>

        {/* ─── Mobile & Tablet Drawer & Backdrop Overlay ─── */}
        {!isCollapsed && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Dark Backdrop (Click to dismiss) */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsCollapsed(true)}
            />

            {/* Slide-out Drawer from right */}
            <aside
              className="relative w-72 max-w-[80vw] h-full bg-[#10131a] border-l border-zinc-800 p-3 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    قائمة الأقسام
                  </span>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <nav className="space-y-4">
                  {navCategories.map((cat) => {
                    const items = ALL_ADMIN_NAV_ITEMS.filter((i) => i.category === cat);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-zinc-500 px-3 tracking-wider">
                          {cat}
                        </div>
                        {items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                                <span className="truncate">{item.labelAr}</span>
                              </div>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 mr-1 ${
                                    isActive
                                      ? 'bg-black text-amber-400'
                                      : 'bg-zinc-800 text-amber-400/80 border border-zinc-700/60'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Under "التداول والتحليل", render the consolidated Signals Accordion */}
                        {cat === 'التداول والتحليل' && renderSignalsGroup(true)}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Logout Button */}
              <div className="pt-4 border-t border-zinc-800/80 mt-4">
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                      window.location.href = '/';
                    }
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ─── Main Workspace Area (Expands smoothly without layout shift) ─── */}
        <main className={`flex-1 min-w-0 overflow-auto transition-all duration-300 ${activeTab === 'tradingTerminal' ? 'p-0' : 'p-4 md:p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
