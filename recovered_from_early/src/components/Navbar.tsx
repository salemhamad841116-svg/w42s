import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../data/translations';
import { PAIRS_DATA, PAIR_NAMES_AR } from '../data/pairs';
import {
  TrendingUp,
  BarChart3,
  Archive,
  Star,
  Shield,
  ShieldAlert,
  Radio,
  Activity,
  Bell,
  BellRing,
  Globe,
  LayoutGrid,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Zap,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'active' | 'archive' | 'analytics' | 'favorites';
  setActiveTab: (tab: 'active' | 'archive' | 'analytics' | 'favorites') => void;
  lang: Language;
  onToggleLang: () => void;
  isAdmin: boolean;
  onToggleAdmin: (tab?: string) => void;
  displayMode: 'banner' | 'modern';
  onToggleDisplayMode: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  priceAlertsCount?: number;
  onOpenPriceAlerts?: () => void;
  onOpenNewSignalModal: () => void;
  favoritesCount: number;
  currentDomainMode?: 'user' | 'admin';

  // Search & Filter Props
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPair: string;
  setSelectedPair: (p: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedTrend: string;
  setSelectedTrend: (trend: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  onToggleLang,
  isAdmin,
  onToggleAdmin,
  displayMode,
  onToggleDisplayMode,
  unreadNotificationsCount,
  onOpenNotifications,
  priceAlertsCount = 0,
  onOpenPriceAlerts,
  onOpenNewSignalModal,
  favoritesCount,
  currentDomainMode = 'user',

  searchQuery,
  setSearchQuery,
  selectedPair,
  setSelectedPair,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  selectedTrend,
  setSelectedTrend,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dictionary = t[lang];

  const hasActiveFilters =
    searchQuery ||
    selectedPair !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedTrend !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPair('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedTrend('ALL');
  };

  const handleTabClick = (tab: 'active' | 'archive' | 'analytics' | 'favorites') => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleMenuButtonClick = () => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
      setActiveTab('active');
    }
  };

  const currentTabLabel = {
    active: dictionary.activeSignals,
    archive: dictionary.history,
    analytics: dictionary.analytics,
    favorites: `${dictionary.favorites} (${favoritesCount})`,
  }[activeTab];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            {/* Right/Start: Menu & Navigation Tabs */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleMenuButtonClick}
                className={`px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-2 text-xs sm:text-sm shadow-md relative z-50 active:scale-95 ${
                  isSidebarOpen
                    ? 'bg-emerald-500 text-zinc-950 border border-emerald-400 shadow-emerald-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/5'
                }`}
                title={
                  isSidebarOpen
                    ? (lang === 'ar' ? 'إغلاق البحث والتصفية' : 'Close Search & Filters')
                    : (lang === 'ar' ? 'فتح البحث والتصفية' : 'Open Search & Filters')
                }
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Sliders className="w-5 h-5 text-emerald-400" />
                )}
                {hasActiveFilters && !isSidebarOpen && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
                )}
              </button>

              {/* Active Signals Button (زر الإشارات الفعالة) */}
              <button
                onClick={() => handleTabClick('active')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === 'active'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 border border-emerald-400'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{dictionary.activeSignals}</span>
              </button>


              {/* Analytics Button */}
              <button
                onClick={() => handleTabClick('analytics')}
                className={`hidden sm:flex px-3 py-2 rounded-xl text-xs sm:text-sm font-bold items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 border border-emerald-400'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{dictionary.analytics}</span>
              </button>

              {/* Favorites Button */}
              <button
                onClick={() => handleTabClick('favorites')}
                className={`hidden md:flex px-3 py-2 rounded-xl text-xs sm:text-sm font-bold items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  activeTab === 'favorites'
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20 border border-amber-300'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>{dictionary.favorites}</span>
                {favoritesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                    {favoritesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Center/End: Quick Status & Primary Action */}
            <div className="flex items-center gap-2">
              {/* Auto Engine Status Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Auto Engine 24/7</span>
              </div>

              {/* Quick Admin Access Button (Always Visible & High Contrast) */}
              <button
                onClick={() => { window.location.href = '/admin'; }}
                className="shrink-0 px-3 py-2 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-600/30 text-amber-200 font-extrabold hover:bg-amber-500/40 transition-all flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/30 active:scale-95"
                title="دخول لوحة التحكم الرئيسية"
              >
                <Shield className="w-4.5 h-4.5 text-amber-400 shrink-0 animate-pulse" />
                <span className="font-black tracking-wide">لوحة التحكم</span>
              </button>

              {/* Quick Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-4.5 h-4.5 text-emerald-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-zinc-950 font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer (القائمة الجانبية) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 top-[57px] z-40 flex justify-start bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSidebarOpen(false);
            }
          }}
        >
          <div className="bg-zinc-950 border-r border-zinc-800/80 w-84 max-w-[88vw] h-[calc(100vh-57px)] flex flex-col justify-between text-white shadow-2xl relative">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {lang === 'ar' ? 'البحث والتصفية' : 'Search & Filters'}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sidebar Content (Scrollable Sections) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* SECTION 1: Search & Filters (خانات البحث والتصفية) */}
              <div className="space-y-3 bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Filter className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'البحث وتصفية الإشارات' : 'Search & Filter Signals'}</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                      title="إلغاء الفلاتر"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة ضبط</span>
                    </button>
                  )}
                </div>

                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute top-3 right-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={dictionary.searchPlaceholder}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Pairs Dropdown (كل الأزواج) */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold mb-1 block">
                    {dictionary.filterByPair}
                  </label>
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">{dictionary.filterByPair}</option>
                    {PAIRS_DATA.map((p) => (
                      <option key={p.symbol} value={p.symbol}>
                        {p.symbol} ({lang === 'ar' ? PAIR_NAMES_AR[p.symbol] : p.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buy / Sell Type Dropdown (شراء / بيع) */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold mb-1 block">
                    {dictionary.filterByType}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">{dictionary.filterByType}</option>
                    <option value="BUY">🟢 {dictionary.buy}</option>
                    <option value="SELL">🔴 {dictionary.sell}</option>
                  </select>
                </div>

                {/* Status Dropdown (جميع الحالات) */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold mb-1 block">
                    {dictionary.filterByStatus}
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">{dictionary.filterByStatus}</option>
                    <option value="active">{dictionary.statusActive}</option>
                    <option value="tp1_hit">{dictionary.statusTp1}</option>
                    <option value="tp2_hit">{dictionary.statusTp2}</option>
                    <option value="all_tps_hit">{dictionary.statusAllTps}</option>
                    <option value="sl_hit">{dictionary.statusSl}</option>
                    <option value="cancelled">{dictionary.statusCancelled}</option>
                  </select>
                </div>

                {/* Trend Dropdown (اتجاه الإشارة - الكل) */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold mb-1 block">
                    اتجاه الإشارة (الكل)
                  </label>
                  <select
                    value={selectedTrend}
                    onChange={(e) => setSelectedTrend(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="ALL">اتجاه الإشارة (الكل)</option>
                    <option value="bullish">{dictionary.trendBullish}</option>
                    <option value="bearish">{dictionary.trendBearish}</option>
                    <option value="sideways">{dictionary.trendSideways}</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: Control Panel (لوحة التحكم والإدارة) */}
              <div className="space-y-2 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-3.5 rounded-2xl border border-amber-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>لوحة التحكم والإدارة Enterprise</span>
                </div>
                <div className="space-y-2 pt-1">
                  {/* Button 1: Main Admin Portal */}
                  <button
                    onClick={() => {
                      window.location.href = '/admin';
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs transition-all flex items-center justify-between shadow-md active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>دخول لوحة التحكم الرئيسية</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-mono font-bold">
                      ADMIN
                    </span>
                  </button>

                  {/* Button 2: Service Health */}
                  <button
                    onClick={() => {
                      window.location.href = '/admin';
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs transition-all flex items-center justify-between active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>مراقبة صحة الخوادم والخدمات</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </button>

                  {/* Button 3: Disaster Recovery */}
                  <button
                    onClick={() => {
                      window.location.href = '/admin';
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 font-bold text-xs transition-all flex items-center justify-between active:scale-95"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>النسخ واستعادة الكوارث</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: Trading Sections (أقسام التداول) */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-2">
                  {lang === 'ar' ? 'أقسام التداول' : 'Trading Sections'}
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleTabClick('active')}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      activeTab === 'active'
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>{dictionary.activeSignals}</span>
                    </div>
                    {lang === 'ar' ? <ChevronLeft className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  <button
                    onClick={() => handleTabClick('archive')}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      activeTab === 'archive'
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Archive className="w-4 h-4" />
                      <span>{dictionary.history}</span>
                    </div>
                    {lang === 'ar' ? <ChevronLeft className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  <button
                    onClick={() => handleTabClick('analytics')}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      activeTab === 'analytics'
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>{dictionary.analytics}</span>
                    </div>
                    {lang === 'ar' ? <ChevronLeft className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  <button
                    onClick={() => handleTabClick('favorites')}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                      activeTab === 'favorites'
                        ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4" />
                      <span>{dictionary.favorites}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                      {favoritesCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION 4: System & Preferences (التفضيلات) */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-2">
                  {lang === 'ar' ? 'التفضيلات والنظام' : 'System Preferences'}
                </h4>
                <div className="space-y-1.5">
                  {/* Price Alerts */}
                  {onOpenPriceAlerts && (
                    <button
                      onClick={() => {
                        onOpenPriceAlerts();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-amber-400 hover:bg-zinc-800 font-bold text-xs transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <BellRing className="w-4 h-4" />
                        <span>{dictionary.priceAlerts}</span>
                      </div>
                      {priceAlertsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black">
                          {priceAlertsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* View Display Mode Toggle */}
                  <button
                    onClick={() => {
                      onToggleDisplayMode();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold text-xs transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4 text-emerald-400" />
                      <span>نمط العرض</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-semibold">
                      {displayMode === 'banner' ? 'تصميم البطاقات' : 'عرض شبكي'}
                    </span>
                  </button>

                  {/* Admin New Signal Button */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onOpenNewSignalModal();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-zinc-950 text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{dictionary.newSignal}</span>
                    </button>
                  )}

                  {/* Notifications Center */}
                  <button
                    onClick={() => {
                      onOpenNotifications();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold text-xs transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span>مركز الإشعارات</span>
                    </div>
                    {unreadNotificationsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black">
                        {unreadNotificationsCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">مقروء</span>
                    )}
                  </button>

                  {/* Language Switcher */}
                  <button
                    onClick={() => {
                      onToggleLang();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold text-xs transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-teal-400" />
                      <span>لغة التطبيق</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                      {lang === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 text-xs space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <div className="flex-1">
                  <div className="text-[11px] font-black">Auto Engine 24/7</div>
                  <div className="text-[10px] text-emerald-400/80 font-normal">محرك الاصطياد الآلي يعمل بنشاط</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

